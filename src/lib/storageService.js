/**
 * RAJIV BUSINESS OS — Cloudflare R2 Document Storage Service
 *
 * Implements direct-to-R2 upload and document lifecycle management
 * via the authenticated Supabase Edge Function: 'company-document-storage' (v3).
 *
 * Backed by 'company_documents' metadata table and Cloudflare R2 object storage.
 * Strictly adheres to backend contract:
 * - create-upload-url -> Direct HTTP PUT to presigned R2 URL -> finalize-upload
 * - create-download-url (for preview & download)
 * - archive-document (handles R2 deletion & metadata archival)
 * - Max file size: 150 MB
 */

import { supabase } from './supabase';

export const MAX_DOCUMENT_FILE_SIZE_BYTES = 150 * 1024 * 1024; // 150 MB

/**
 * Format raw bytes into human-readable string (e.g., '14.2 MB', '850 KB')
 */
export function formatBytes(bytes, decimals = 2) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Validate a file before initiating the R2 upload pipeline
 */
export function validateDocumentFile(file) {
  if (!file) {
    return { valid: false, error: 'Please select a file to upload.' };
  }
  if (file.size <= 0) {
    return { valid: false, error: 'The selected file is empty (0 bytes).' };
  }
  if (file.size > MAX_DOCUMENT_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds the 150 MB maximum limit (${formatBytes(file.size)}). Please choose a smaller file.`
    };
  }
  return { valid: true };
}

/**
 * Invokes the 'company-document-storage' Supabase Edge Function with JWT authorization
 */
async function invokeDocumentStorage(payload) {
  if (!supabase) {
    throw new Error('Supabase client is not initialized.');
  }

  // 1. Verify active session and retrieve JWT
  const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
  if (sessionErr) {
    throw new Error(`Authentication session error: ${sessionErr.message}`);
  }

  const token = sessionData?.session?.access_token;
  if (!token) {
    throw new Error('Your session has expired or you are not signed in. Please log in again to manage company documents.');
  }

  // 2. Invoke the Edge Function
  const { data, error } = await supabase.functions.invoke('company-document-storage', {
    body: payload,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  // 3. Parse specific error details without leaking internal credentials
  if (error) {
    let errorDetail = error.message;

    // Check if error response body contains structured JSON error
    try {
      if (error.context && typeof error.context.json === 'function') {
        const body = await error.context.json();
        if (body?.error) {
          errorDetail = body.error;
        } else if (body?.message) {
          errorDetail = body.message;
        }
      } else if (error.context && typeof error.context.text === 'function') {
        const rawText = await error.context.text();
        if (rawText && !rawText.startsWith('<')) {
          try {
            const parsed = JSON.parse(rawText);
            if (parsed.error || parsed.message) errorDetail = parsed.error || parsed.message;
          } catch (_) {
            errorDetail = rawText;
          }
        }
      }
    } catch (_) {
      // Fallback to error.message
    }

    // Map common status codes to user-friendly messages
    if (error.context?.status === 401 || error.context?.status === 403) {
      throw new Error(errorDetail || 'Unauthorized: Only organization Owners can manage company documents.');
    }
    if (error.context?.status === 413) {
      throw new Error('File exceeds the maximum allowed size limit of 150 MB.');
    }

    throw new Error(errorDetail || 'Failed to complete document operation.');
  }

  return data;
}

/**
 * Step 1: Request a signed presigned PUT upload URL from Cloudflare R2
 */
export async function createUploadUrl({ tenantCompanyId, fileName, mimeType, fileSizeBytes }) {
  if (!tenantCompanyId) {
    throw new Error('Tenant Company ID is required to request an upload URL.');
  }
  if (!fileName) {
    throw new Error('File name is required to request an upload URL.');
  }
  if (!fileSizeBytes || fileSizeBytes <= 0) {
    throw new Error('Valid file size is required.');
  }
  if (fileSizeBytes > MAX_DOCUMENT_FILE_SIZE_BYTES) {
    throw new Error(`File size (${formatBytes(fileSizeBytes)}) exceeds 150 MB limit.`);
  }

  const response = await invokeDocumentStorage({
    action: 'create-upload-url',
    tenant_company_id: tenantCompanyId,
    file_name: fileName,
    mime_type: mimeType || 'application/octet-stream',
    file_size_bytes: fileSizeBytes
  });

  if (!response?.upload_url || !response?.document_id || !response?.storage_key) {
    throw new Error('Backend failed to return a valid upload URL or storage key.');
  }

  return response;
}

/**
 * Step 2: Upload the actual File directly to the signed Cloudflare R2 URL using HTTP PUT.
 * DO NOT upload to Supabase Storage.
 *
 * Uses XMLHttpRequest to provide real-time progress callbacks (0 - 100%).
 */
export function uploadFileToR2(uploadUrl, file, mimeType, onProgress) {
  return new Promise((resolve, reject) => {
    if (!uploadUrl) {
      return reject(new Error('No signed R2 upload URL provided.'));
    }
    if (!file) {
      return reject(new Error('No file provided for upload.'));
    }

    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);

    // Set the MIME type matching what was signed during create-upload-url
    const contentType = mimeType || file.type || 'application/octet-stream';
    xhr.setRequestHeader('Content-Type', contentType);

    // Track real-time progress for large files (up to 150 MB)
    if (xhr.upload && typeof onProgress === 'function') {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && event.total > 0) {
          const percent = Math.min(100, Math.max(0, Math.round((event.loaded / event.total) * 100)));
          onProgress(percent, event.loaded, event.total);
        }
      };
    }

    xhr.onload = () => {
      // Direct R2 PUT typically returns 200 OK
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ success: true, status: xhr.status });
      } else {
        reject(new Error(`Cloudflare R2 storage upload failed with HTTP status ${xhr.status} (${xhr.statusText || 'Upload rejected'})`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error occurred during direct upload to Cloudflare R2. Please check your internet connection and try again.'));
    };

    xhr.ontimeout = () => {
      reject(new Error('Direct upload to Cloudflare R2 timed out. Please try again.'));
    };

    // No client timeout on upload to allow large 150MB files to complete on slower connections
    xhr.timeout = 0;

    xhr.send(file);
  });
}

/**
 * Step 3: Finalize the upload after successful R2 PUT.
 * The backend verifies the R2 object and creates company_documents metadata.
 */
export async function finalizeUpload({
  tenantCompanyId,
  documentId,
  storageKey,
  fileName,
  mimeType,
  fileSizeBytes,
  documentType,
  documentName,
  documentNumber,
  issueDate,
  expiryDate,
  notes
}) {
  if (!tenantCompanyId || !documentId || !storageKey) {
    throw new Error('Missing required upload confirmation parameters.');
  }

  const response = await invokeDocumentStorage({
    action: 'finalize-upload',
    tenant_company_id: tenantCompanyId,
    document_id: documentId,
    storage_key: storageKey,
    file_name: fileName,
    mime_type: mimeType || 'application/octet-stream',
    file_size_bytes: fileSizeBytes,
    document_type: documentType || 'Other',
    document_name: documentName || fileName,
    document_number: documentNumber || '',
    issue_date: issueDate || null,
    expiry_date: expiryDate || null,
    notes: notes || ''
  });

  return response;
}

/**
 * Step 4: Request a temporary signed download URL for preview or download.
 */
export async function createDownloadUrl({ tenantCompanyId, documentId }) {
  if (!tenantCompanyId || !documentId) {
    throw new Error('Tenant Company ID and Document ID are required to generate a download URL.');
  }

  const response = await invokeDocumentStorage({
    action: 'create-download-url',
    tenant_company_id: tenantCompanyId,
    document_id: documentId
  });

  if (!response?.download_url) {
    throw new Error('Backend failed to generate a secure download URL.');
  }

  return response; // { document_id, file_name, download_url, expires_in }
}

/**
 * Step 5: Archive a document.
 * The backend handles R2 deletion and metadata archival.
 */
export async function archiveDocument({ tenantCompanyId, documentId }) {
  if (!tenantCompanyId || !documentId) {
    throw new Error('Tenant Company ID and Document ID are required to archive a document.');
  }

  const response = await invokeDocumentStorage({
    action: 'archive-document',
    tenant_company_id: tenantCompanyId,
    document_id: documentId
  });

  return response;
}

/**
 * Fetch company documents directly from the company_documents metadata table
 */
export async function getCompanyDocuments(tenantCompanyId, { includeArchived = true } = {}) {
  if (!tenantCompanyId || !supabase) return [];

  let query = supabase
    .from('company_documents')
    .select('*')
    .eq('tenant_company_id', tenantCompanyId);

  if (!includeArchived) {
    query = query.eq('is_archived', false);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('[storageService] getCompanyDocuments error:', error);
    throw new Error(`Failed to load company documents: ${error.message}`);
  }

  return data || [];
}

/**
 * Legacy compatibility helper for metadata processing
 */
export async function processFileForMetadata(file, category = 'documents', companyId = 'temp') {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file provided'));

    const reader = new FileReader();
    reader.onload = (e) => {
      const previewUrl = e.target.result;
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
      const timestamp = Date.now();
      const storageKey = `companies/${companyId}/${category}/${timestamp}_${sanitizedFileName}`;

      resolve({
        file_name: file.name,
        mime_type: file.type || 'application/octet-stream',
        file_size: file.size,
        file_size_bytes: file.size,
        preview: previewUrl,
        storage_provider: 'r2',
        storage_key: storageKey,
        created_at: new Date().toISOString()
      });
    };

    reader.onerror = (err) => reject(new Error('Failed to read file: ' + err.message));
    reader.readAsDataURL(file);
  });
}

/**
 * Legacy compatibility stub
 */
export async function uploadToR2(fileMetadata) {
  return {
    success: true,
    storage_provider: 'r2',
    storage_key: fileMetadata?.storage_key,
    message: 'File queued for R2 upload'
  };
}
