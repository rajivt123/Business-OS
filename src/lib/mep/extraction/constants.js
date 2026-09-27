/**
 * MEP Document Extraction State Machine & Lifecycle Constants
 * Phase 4A: Architecture & Worker Contracts
 */

export const EXTRACTION_STATUS = {
  // Active states
  PENDING: 'pending',
  PROCESSING: 'processing',
  IN_PROGRESS: 'in_progress',
  RUNNING: 'running',

  // Terminal states
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

export const ACTIVE_EXTRACTION_STATUSES = [
  EXTRACTION_STATUS.PENDING,
  EXTRACTION_STATUS.PROCESSING,
  EXTRACTION_STATUS.IN_PROGRESS,
  EXTRACTION_STATUS.RUNNING
];

export const TERMINAL_EXTRACTION_STATUSES = [
  EXTRACTION_STATUS.COMPLETED,
  EXTRACTION_STATUS.FAILED,
  EXTRACTION_STATUS.CANCELLED
];

/**
 * Valid state transitions for the extraction job lifecycle
 */
export const VALID_STATUS_TRANSITIONS = {
  [EXTRACTION_STATUS.PENDING]: [
    EXTRACTION_STATUS.PROCESSING,
    EXTRACTION_STATUS.CANCELLED
  ],
  [EXTRACTION_STATUS.PROCESSING]: [
    EXTRACTION_STATUS.IN_PROGRESS,
    EXTRACTION_STATUS.RUNNING,
    EXTRACTION_STATUS.COMPLETED,
    EXTRACTION_STATUS.FAILED,
    EXTRACTION_STATUS.CANCELLED
  ],
  [EXTRACTION_STATUS.IN_PROGRESS]: [
    EXTRACTION_STATUS.RUNNING,
    EXTRACTION_STATUS.COMPLETED,
    EXTRACTION_STATUS.FAILED,
    EXTRACTION_STATUS.CANCELLED
  ],
  [EXTRACTION_STATUS.RUNNING]: [
    EXTRACTION_STATUS.COMPLETED,
    EXTRACTION_STATUS.FAILED,
    EXTRACTION_STATUS.CANCELLED
  ],
  // Terminal states cannot transition further; retries instantiate a NEW extraction row
  [EXTRACTION_STATUS.COMPLETED]: [],
  [EXTRACTION_STATUS.FAILED]: [],
  [EXTRACTION_STATUS.CANCELLED]: []
};

/**
 * Checks if a status transition is permitted by the state machine
 */
export function canTransitionStatus(fromStatus, toStatus) {
  const allowed = VALID_STATUS_TRANSITIONS[fromStatus];
  if (!allowed) return false;
  return allowed.includes(toStatus);
}

/**
 * Recognized MEP Document Types
 */
export const MEP_DOCUMENT_TYPES = {
  BOQ: 'BOQ',
  PO: 'PO',
  VENDOR_QUOTATION: 'VENDOR_QUOTATION',
  PURCHASE_BILL: 'PURCHASE_BILL',
  SPECIFICATION: 'SPECIFICATION',
  DRAWING: 'DRAWING',
  WORK_ORDER: 'WORK_ORDER',
  SALES_QUOTATION: 'SALES_QUOTATION',
  OTHER: 'OTHER'
};

/**
 * Document Extraction Strategies
 */
export const EXTRACTION_STRATEGIES = {
  STRUCTURED_SPREADSHEET: 'STRUCTURED_SPREADSHEET', // Excel (.xlsx/.xls) or CSV
  DOCUMENT_PIPELINE: 'DOCUMENT_PIPELINE',           // Searchable text PDFs (PO, Invoices)
  DOCUMENT_OCR_PIPELINE: 'DOCUMENT_OCR_PIPELINE',   // Scanned PDFs / Raster Images
  TECHNICAL_SPEC_PARSER: 'TECHNICAL_SPEC_PARSER',   // Technical datasheets / specifications
  DRAWING_DEFERRED: 'DRAWING_DEFERRED',             // CAD / Engineering drawings (deferred)
  GENERIC_DOCUMENT: 'GENERIC_DOCUMENT'              // Fallback document parser
};
