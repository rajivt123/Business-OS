/**
 * Storage Abstraction Layer for RAJIV BUSINESS OS
 * 
 * Provides a clean interface for handling document and branding metadata
 * without committing files to Supabase Storage or Cloudflare R2 immediately.
 * When R2 is connected in V2, this abstraction will handle actual file uploads.
 */

export async function processFileForMetadata(file, category = 'documents', companyId = 'temp') {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided'));
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const previewUrl = e.target.result;
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
      const timestamp = Date.now();
      const storageKey = `companies/${companyId}/${category}/${timestamp}_${sanitizedFileName}`;

      const fileMetadata = {
        file_name: file.name,
        mime_type: file.type || 'application/octet-stream',
        file_size: file.size,
        preview: previewUrl,
        storage_provider: 'r2', // Planned storage provider
        storage_key: storageKey,
        created_at: new Date().toISOString()
      };

      resolve(fileMetadata);
    };

    reader.onerror = (err) => {
      reject(new Error('Failed to read file: ' + err.message));
    };

    // For images, read as Data URL for inline preview
    // For PDFs and other files, also read as Data URL for browser preview embedding
    reader.readAsDataURL(file);
  });
}

/**
 * Format bytes into human-readable string
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
 * Stub function for future Cloudflare R2 Upload Integration
 */
export async function uploadToR2(fileMetadata) {
  console.log('[Storage Abstraction] Cloudflare R2 is not connected yet. Storing contract metadata:', fileMetadata.storage_key);
  return {
    success: true,
    storage_provider: 'r2',
    storage_key: fileMetadata.storage_key,
    message: 'Contract metadata prepared for R2 upload'
  };
}
