/**
 * RAJIV BUSINESS OS — Universal Cloudflare R2 Storage Service
 *
 * Implements direct-to-R2 upload and file lifecycle management across the application:
 * 1. Company Documents via 'company-document-storage' (v4, JWT protected)
 * 2. Generic Business File Attachments via 'business-file-storage' (v2, JWT protected)
 *    - CRM PO / WO / BOQ (entity_type = 'work', field_key = 'po' | 'wo' | 'boq')
 *    - CRM Log Attachments (entity_type = 'log', field_key = 'attachment')
 *    - HR Employee Documents (entity_type = 'employee_document', field_key = 'document')
 *    - HR Employee Photo (entity_type = 'employee', field_key = 'photo')
 *    - HR Recruitment Resume (entity_type = 'recruitment_candidate', field_key = 'resume')
 *    - Business Documents (entity_type = 'document', field_key = 'file')
 *
 * Backend metadata sources:
 * - 'company_documents' (for statutory company documents)
 * - 'file_attachments' (for all generic business entity attachments)
 *
 * Max file size: 150 MB.
 * No direct R2 credentials exist in frontend code.
 * All uploads use presigned signed PUT URLs directly to Cloudflare R2.
 */

import { supabase } from './supabase';

export const MAX_DOCUMENT_FILE_SIZE_BYTES = 150 * 1024 * 1024; // 150 MB

/**
 * Validate UUID string format
 */
export function isRealUuid(val) {
  return typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
}

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
 * Helper to invoke an Edge Function with JWT authorization
 */
async function invokeFunctionWithAuth(functionName, payload) {
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
    throw new Error('Your session has expired or you are not signed in. Please log in again.');
  }

  // 2. Invoke the Edge Function
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: payload,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  // 3. Parse specific error details without leaking internal credentials
  if (error) {
    let errorDetail = error.message;

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

    if (error.context?.status === 401 || error.context?.status === 403) {
      throw new Error(errorDetail || 'Unauthorized: You do not have permission for this storage operation.');
    }
    if (error.context?.status === 413) {
      throw new Error('File exceeds the maximum allowed size limit of 150 MB.');
    }

    throw new Error(errorDetail || `Failed to complete storage operation via ${functionName}.`);
  }

  return data;
}

/**
 * Invokes the 'company-document-storage' Supabase Edge Function
 */
async function invokeDocumentStorage(payload) {
  return invokeFunctionWithAuth('company-document-storage', payload);
}

/**
 * Invokes the 'business-file-storage' Supabase Edge Function
 */
async function invokeBusinessFileStorage(payload) {
  return invokeFunctionWithAuth('business-file-storage', payload);
}

/* =========================================================================
   DIRECT R2 HTTP PUT UPLOAD
   ========================================================================= */

/**
 * Direct HTTP PUT upload to signed Cloudflare R2 URL.
 * NEVER uploads to Supabase Storage.
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
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ success: true, status: xhr.status });
      } else {
        reject(new Error(`Cloudflare R2 upload failed with HTTP status ${xhr.status} (${xhr.statusText || 'Upload rejected'})`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error occurred during direct upload to Cloudflare R2. Please check your internet connection.'));
    };

    xhr.ontimeout = () => {
      reject(new Error('Direct upload to Cloudflare R2 timed out.'));
    };

    xhr.timeout = 0;
    xhr.send(file);
  });
}

/* =========================================================================
   1. COMPANY DOCUMENTS (company-document-storage v4)
   ========================================================================= */

/**
 * Step 1: Request signed upload URL for company documents.
 * Verifies that tenantCompanyId is a valid UUID corresponding to tenant_companies.id.
 */
export async function createUploadUrl({ tenantCompanyId, fileName, mimeType, fileSizeBytes }) {
  if (!tenantCompanyId || !isRealUuid(tenantCompanyId)) {
    console.error('[storageService] Invalid tenantCompanyId:', tenantCompanyId);
    throw new Error(`Invalid tenant_company_id: "${tenantCompanyId}" must be a valid UUID corresponding to tenant_companies.id.`);
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

  console.log('[storageService] createUploadUrl verified tenant_company_id:', tenantCompanyId);

  const response = await invokeDocumentStorage({
    action: 'create-upload-url',
    tenant_company_id: tenantCompanyId,
    file_name: fileName,
    mime_type: mimeType || 'application/octet-stream',
    file_size_bytes: fileSizeBytes
  });

  if (!response?.upload_url || (!response?.document_id && !response?.id) || !response?.storage_key) {
    throw new Error('Backend failed to return a valid upload URL or storage key.');
  }

  return response;
}

/**
 * Step 2: Finalize company document upload.
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
  if (!tenantCompanyId || !isRealUuid(tenantCompanyId)) {
    throw new Error(`Invalid tenant_company_id: "${tenantCompanyId}" must be a valid UUID from tenant_companies.id.`);
  }
  if (!documentId || !storageKey) {
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
 * Step 3: Create temporary signed download URL for company documents.
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

  return response;
}

/**
 * Step 4: Archive company document.
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

/* =========================================================================
   2. UNIVERSAL BUSINESS FILE ATTACHMENTS (business-file-storage v2)
   ========================================================================= */

/**
 * Resolves the tenant_company_id for Universal Business File Storage.
 * Ensures the value is a valid UUID, falling back to entity lookups, localStorage, or active tenant_companies.
 */
export async function resolveTenantCompanyId(tenantCompanyId, entityType, entityId, attachmentId) {
  if (tenantCompanyId && isRealUuid(tenantCompanyId)) {
    return tenantCompanyId;
  }
  // 1. If entityType is 'work' and entityId is provided, query works table for tenant_company_id
  if (entityType === 'work' && entityId) {
    try {
      const { data } = await supabase.from('works').select('tenant_company_id').eq('id', entityId).maybeSingle();
      if (data?.tenant_company_id && isRealUuid(data.tenant_company_id)) {
        return data.tenant_company_id;
      }
    } catch (_) {}
  }
  // 2. If attachmentId is provided, query file_attachments table
  if (attachmentId) {
    try {
      const { data } = await supabase.from('file_attachments').select('tenant_company_id').eq('id', attachmentId).maybeSingle();
      if (data?.tenant_company_id && isRealUuid(data.tenant_company_id)) {
        return data.tenant_company_id;
      }
    } catch (_) {}
  }
  // 3. Check localStorage for active operating company
  try {
    const saved = localStorage.getItem('crm_active_operating_company_id') || localStorage.getItem('tenant_company_id');
    if (saved && isRealUuid(saved)) {
      return saved;
    }
  } catch (_) {}
  // 4. Query active tenant_companies from database
  try {
    const { data } = await supabase.from('tenant_companies').select('id').eq('status', 'active').limit(1).maybeSingle();
    if (data?.id && isRealUuid(data.id)) {
      return data.id;
    }
  } catch (_) {}
  return tenantCompanyId || null;
}

/**
 * Step 1: Request signed upload URL for a business file attachment.
 * Action: 'create-upload-url'
 */
export async function createBusinessAttachmentUploadUrl({
  tenantCompanyId,
  entityType,
  entityId,
  fieldKey,
  fileName,
  mimeType,
  fileSizeBytes
}) {
  if (!entityType || !entityId) {
    throw new Error('entity_type and entity_id are required.');
  }
  if (!fileName) {
    throw new Error('file_name is required.');
  }
  if (!fileSizeBytes || fileSizeBytes <= 0) {
    throw new Error('Valid file size is required.');
  }
  if (fileSizeBytes > MAX_DOCUMENT_FILE_SIZE_BYTES) {
    throw new Error(`File size (${formatBytes(fileSizeBytes)}) exceeds 150 MB limit.`);
  }

  const resolvedTenantId = await resolveTenantCompanyId(tenantCompanyId, entityType, entityId);

  const payload = {
    action: 'create-upload-url',
    ...(resolvedTenantId ? { tenant_company_id: resolvedTenantId } : {}),
    entity_type: entityType,
    entity_id: String(entityId),
    field_key: fieldKey || 'file',
    file_name: fileName,
    mime_type: mimeType || 'application/octet-stream',
    file_size_bytes: fileSizeBytes
  };

  const response = await invokeBusinessFileStorage(payload);

  if (!response?.upload_url) {
    throw new Error('Backend failed to return an R2 upload URL for business attachment.');
  }

  return response;
}

/**
 * Step 2: Finalize a business file attachment after successful R2 PUT.
 * Action: 'finalize-upload'
 */
export async function finalizeBusinessAttachment({
  tenantCompanyId,
  attachmentId,
  entityType,
  entityId,
  fieldKey,
  storageKey,
  fileName,
  mimeType,
  fileSizeBytes,
  version = '1.0',
  metadata = {}
}) {
  if (!attachmentId || !storageKey) {
    throw new Error('Missing required attachment_id or storage_key for finalization.');
  }

  const resolvedTenantId = await resolveTenantCompanyId(tenantCompanyId, entityType, entityId, attachmentId);

  const payload = {
    action: 'finalize-upload',
    ...(resolvedTenantId ? { tenant_company_id: resolvedTenantId } : {}),
    attachment_id: attachmentId,
    entity_type: entityType,
    entity_id: String(entityId),
    field_key: fieldKey || 'file',
    storage_key: storageKey,
    file_name: fileName,
    mime_type: mimeType || 'application/octet-stream',
    file_size_bytes: fileSizeBytes,
    version,
    metadata: metadata || {}
  };

  const response = await invokeBusinessFileStorage(payload);
  return response;
}

/**
 * Step 3: List active or archived attachments for an entity.
 * Action: 'list-attachments'
 */
export async function listBusinessAttachments({
  tenantCompanyId,
  entityType,
  entityId,
  fieldKey,
  includeArchived = false
}) {
  if (!entityType || !entityId) return [];

  const resolvedTenantId = await resolveTenantCompanyId(tenantCompanyId, entityType, entityId);

  // Try Edge Function 'business-file-storage' list-attachments
  try {
    const payload = {
      action: 'list-attachments',
      ...(resolvedTenantId ? { tenant_company_id: resolvedTenantId } : {}),
      entity_type: entityType,
      entity_id: String(entityId),
      ...(fieldKey ? { field_key: fieldKey } : {}),
      include_archived: includeArchived
    };

    const res = await invokeBusinessFileStorage(payload);
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.attachments)) return res.attachments;
    if (Array.isArray(res?.data)) return res.data;
  } catch (edgeErr) {
    console.warn('[storageService] list-attachments Edge Function notice:', edgeErr.message);
  }

  // Fallback to direct select on file_attachments table
  try {
    let query = supabase
      .from('file_attachments')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', String(entityId));

    if (resolvedTenantId) {
      query = query.eq('tenant_company_id', resolvedTenantId);
    }
    if (fieldKey) {
      query = query.eq('field_key', fieldKey);
    }
    if (!includeArchived) {
      query = query.eq('is_archived', false);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (!error && data) {
      return data;
    }
  } catch (dbErr) {
    console.warn('[storageService] file_attachments DB query notice:', dbErr.message);
  }

  return [];
}

/**
 * Step 4: Request temporary signed download URL for a business file attachment.
 * Action: 'create-download-url'
 */
export async function createBusinessAttachmentDownloadUrl({ tenantCompanyId, attachmentId }) {
  if (!attachmentId) {
    throw new Error('Attachment ID is required to generate a download URL.');
  }

  const resolvedTenantId = await resolveTenantCompanyId(tenantCompanyId, null, null, attachmentId);

  const payload = {
    action: 'create-download-url',
    ...(resolvedTenantId ? { tenant_company_id: resolvedTenantId } : {}),
    attachment_id: attachmentId
  };

  const response = await invokeBusinessFileStorage(payload);

  if (!response?.download_url) {
    throw new Error('Backend failed to generate a secure download URL for attachment.');
  }

  return response; // { download_url, file_name, expires_in, ... }
}

/**
 * Step 5: Archive a business file attachment.
 * Action: 'archive-attachment'
 */
export async function archiveBusinessAttachment({ tenantCompanyId, attachmentId }) {
  if (!attachmentId) {
    throw new Error('Attachment ID is required to archive an attachment.');
  }

  const resolvedTenantId = await resolveTenantCompanyId(tenantCompanyId, null, null, attachmentId);

  const payload = {
    action: 'archive-attachment',
    ...(resolvedTenantId ? { tenant_company_id: resolvedTenantId } : {}),
    attachment_id: attachmentId
  };

  const response = await invokeBusinessFileStorage(payload);
  return response;
}

/**
 * Complete direct-to-R2 upload orchestrator for a business file attachment
 */
export async function uploadBusinessAttachment({
  tenantCompanyId,
  entityType,
  entityId,
  fieldKey,
  file,
  version = '1.0',
  metadata = {},
  onProgress
}) {
  const validation = validateDocumentFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // 1. Create upload URL
  const uploadData = await createBusinessAttachmentUploadUrl({
    tenantCompanyId,
    entityType,
    entityId,
    fieldKey,
    fileName: file.name,
    mimeType: file.type || 'application/octet-stream',
    fileSizeBytes: file.size
  });

  const attachmentId = uploadData.attachment_id || uploadData.id || uploadData.document_id;
  const storageKey = uploadData.storage_key;
  const uploadUrl = uploadData.upload_url;

  if (!uploadUrl || !attachmentId) {
    throw new Error('Failed to obtain a valid upload URL or attachment ID from storage backend.');
  }

  // 2. Direct HTTP PUT to Cloudflare R2
  await uploadFileToR2(uploadUrl, file, file.type, onProgress);

  // 3. Finalize upload
  const finalized = await finalizeBusinessAttachment({
    tenantCompanyId,
    attachmentId,
    entityType,
    entityId,
    fieldKey,
    storageKey,
    fileName: file.name,
    mimeType: file.type || 'application/octet-stream',
    fileSizeBytes: file.size,
    version,
    metadata
  });

  return {
    ...finalized,
    id: attachmentId,
    attachment_id: attachmentId,
    storage_key: storageKey,
    file_name: file.name,
    file_size_bytes: file.size,
    mime_type: file.type || 'application/octet-stream',
    entity_type: entityType,
    entity_id: entityId,
    field_key: fieldKey
  };
}

/**
 * Replace an existing business file attachment:
 * Uploads the new file to R2, finalizes it, then archives the previous attachment.
 */
export async function replaceBusinessAttachment({
  tenantCompanyId,
  entityType,
  entityId,
  fieldKey,
  file,
  oldAttachmentId,
  version = '1.0',
  metadata = {},
  onProgress
}) {
  // 1. Upload new attachment
  const newAttachment = await uploadBusinessAttachment({
    tenantCompanyId,
    entityType,
    entityId,
    fieldKey,
    file,
    version,
    metadata,
    onProgress
  });

  // 2. Archive previous attachment
  if (oldAttachmentId) {
    try {
      await archiveBusinessAttachment({
        tenantCompanyId,
        attachmentId: oldAttachmentId
      });
    } catch (archiveErr) {
      console.warn('[storageService] Notice: could not archive replaced attachment:', archiveErr.message);
    }
  }

  return newAttachment;
}

/* =========================================================================
   LEGACY COMPATIBILITY HELPERS
   ========================================================================= */

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
