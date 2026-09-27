/**
 * Stable Raw Extraction Output Envelope
 * Phase 4A Contract
 *
 * CRITICAL ARCHITECTURAL DISTINCTION:
 * RAW EXTRACTION ≠ NORMALIZED MEP DATA ≠ CANONICAL INVENTORY ITEM
 *
 * This envelope contains the exact verbatim vendor text, raw line items, and source metadata.
 * It does NOT normalize terminology, map to canonical items, or alter procurement/accounting.
 */

export const RAW_EXTRACTION_SCHEMA_VERSION = '1.0';

/**
 * Creates a standardized raw extraction envelope
 */
export function createRawExtractionEnvelope({
  document = {},
  lines = [],
  totals = {},
  metadata = {},
  warnings = []
} = {}) {
  return {
    schema_version: RAW_EXTRACTION_SCHEMA_VERSION,
    document: {
      document_type: document.document_type || 'OTHER',
      document_number: document.document_number || null,
      document_date: document.document_date || null,
      vendor_name: document.vendor_name || null,
      project_name: document.project_name || null,
      title: document.title || null
    },
    lines: Array.isArray(lines)
      ? lines.map((line, idx) => ({
          line_no: line.line_no || idx + 1,
          source_page: line.source_page ?? 1,
          raw_description: line.raw_description || '',
          material_code: line.material_code || null,
          vendor_material_number: line.vendor_material_number || null,
          quantity: line.quantity != null ? Number(line.quantity) : null,
          uom: line.uom || null,
          unit_rate: line.unit_rate != null ? Number(line.unit_rate) : null,
          hsn_code: line.hsn_code || null,
          raw_attributes: line.raw_attributes && typeof line.raw_attributes === 'object' ? line.raw_attributes : {}
        }))
      : [],
    totals: {
      subtotal: totals.subtotal != null ? Number(totals.subtotal) : null,
      tax_amount: totals.tax_amount != null ? Number(totals.tax_amount) : null,
      grand_total: totals.grand_total != null ? Number(totals.grand_total) : null,
      currency: totals.currency || 'INR'
    },
    metadata: {
      strategy: metadata.strategy || null,
      provider: metadata.provider || null,
      model_name: metadata.model_name || null,
      model_version: metadata.model_version || null,
      processed_at: metadata.processed_at || new Date().toISOString(),
      file_size_bytes: metadata.file_size_bytes || null,
      source_file_name: metadata.source_file_name || null,
      worker_id: metadata.worker_id || null,
      attempt_number: metadata.attempt_number || 1,
      ...metadata
    },
    warnings: Array.isArray(warnings) ? warnings : []
  };
}

/**
 * Validates a raw extraction envelope against schema_version 1.0
 */
export function validateRawExtractionEnvelope(envelope) {
  if (!envelope || typeof envelope !== 'object') {
    return { valid: false, error: 'Envelope must be a non-null object' };
  }

  if (envelope.schema_version !== RAW_EXTRACTION_SCHEMA_VERSION) {
    return {
      valid: false,
      error: `Unsupported envelope schema_version "${envelope.schema_version}". Expected "${RAW_EXTRACTION_SCHEMA_VERSION}".`
    };
  }

  if (!envelope.document || typeof envelope.document !== 'object') {
    return { valid: false, error: 'Envelope must contain a document metadata object' };
  }

  if (!Array.isArray(envelope.lines)) {
    return { valid: false, error: 'Envelope lines must be an array' };
  }

  if (!envelope.totals || typeof envelope.totals !== 'object') {
    return { valid: false, error: 'Envelope totals must be an object' };
  }

  if (!envelope.metadata || typeof envelope.metadata !== 'object') {
    return { valid: false, error: 'Envelope metadata must be an object' };
  }

  return { valid: true, error: null };
}
