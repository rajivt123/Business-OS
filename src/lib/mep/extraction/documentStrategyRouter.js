/**
 * MEP Document Strategy Router
 * Phase 4A Contract
 *
 * Routes document examples to an optimal provider-neutral extraction strategy
 * based on document category, MIME type, and file extension.
 */

import { EXTRACTION_STRATEGIES, MEP_DOCUMENT_TYPES } from './constants.js';

/**
 * Normalizes file extensions
 */
function getFileExtension(fileName = '') {
  const parts = fileName.split('.');
  if (parts.length <= 1) return '';
  return parts.pop().toLowerCase().trim();
}

/**
 * Determines whether a file is a spreadsheet
 */
function isSpreadsheetFile(ext, mimeType = '') {
  const spreadsheetExts = ['xlsx', 'xls', 'csv'];
  const spreadsheetMimes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
    'application/csv'
  ];
  return spreadsheetExts.includes(ext) || spreadsheetMimes.includes(mimeType.toLowerCase());
}

/**
 * Determines whether a file is an image
 */
function isImageFile(ext, mimeType = '') {
  const imageExts = ['png', 'jpg', 'jpeg', 'tiff', 'bmp', 'webp'];
  return imageExts.includes(ext) || mimeType.toLowerCase().startsWith('image/');
}

/**
 * Determines whether a file is an engineering drawing or CAD file
 */
function isDrawingFile(ext, docType) {
  const cadExts = ['dwg', 'dxf', 'cad', 'step', 'stp'];
  return cadExts.includes(ext) || docType === MEP_DOCUMENT_TYPES.DRAWING;
}

/**
 * Determines the extraction strategy for a document
 *
 * @param {Object} params
 * @param {string} params.documentType - e.g. 'BOQ', 'PO', 'PURCHASE_BILL', etc.
 * @param {string} [params.fileName] - Name of the source file
 * @param {string} [params.mimeType] - MIME type of the file
 * @returns {Object} Strategy resolution
 */
export function determineExtractionStrategy({
  documentType = 'OTHER',
  fileName = '',
  mimeType = ''
} = {}) {
  const normalizedType = (documentType || 'OTHER').toUpperCase().trim();
  const ext = getFileExtension(fileName);

  // 1. Drawing / CAD files (Deferred specialized extraction)
  if (isDrawingFile(ext, normalizedType)) {
    return {
      strategy: EXTRACTION_STRATEGIES.DRAWING_DEFERRED,
      recommendedProvider: 'cad_drawing_parser',
      isDeferred: true,
      reason: 'Engineering drawing and schedule extraction requires specialized CAD/vector processing.'
    };
  }

  // 2. Structured Spreadsheets (Excel / CSV)
  if (isSpreadsheetFile(ext, mimeType)) {
    return {
      strategy: EXTRACTION_STRATEGIES.STRUCTURED_SPREADSHEET,
      recommendedProvider: 'spreadsheet_parser',
      isDeferred: false,
      reason: 'Structured tabular spreadsheet detected. Fast cell/table extraction applicable.'
    };
  }

  // 3. Technical Specifications / Datasheets
  if (normalizedType === MEP_DOCUMENT_TYPES.SPECIFICATION) {
    return {
      strategy: EXTRACTION_STRATEGIES.TECHNICAL_SPEC_PARSER,
      recommendedProvider: 'spec_document_ai',
      isDeferred: false,
      reason: 'Technical specification detected. Key-value attribute extraction applicable.'
    };
  }

  // 4. Scanned documents / Raster images requiring OCR
  if (isImageFile(ext, mimeType)) {
    return {
      strategy: EXTRACTION_STRATEGIES.DOCUMENT_OCR_PIPELINE,
      recommendedProvider: 'ocr_document_pipeline',
      isDeferred: false,
      reason: 'Raster image document detected. Optical character recognition (OCR) required.'
    };
  }

  // 5. Searchable PDFs for standard commercial documents (PO, Bill, Work Order, Quotation, BOQ)
  if (ext === 'pdf' || mimeType.toLowerCase().includes('pdf')) {
    return {
      strategy: EXTRACTION_STRATEGIES.DOCUMENT_PIPELINE,
      recommendedProvider: 'document_pipeline',
      isDeferred: false,
      reason: 'PDF document detected. Text-layer document parser applicable with OCR fallback.'
    };
  }

  // 6. Generic / Fallback
  return {
    strategy: EXTRACTION_STRATEGIES.GENERIC_DOCUMENT,
    recommendedProvider: 'generic_parser',
    isDeferred: false,
    reason: `Document format (${ext || 'unknown'}) routed to generic document extraction pipeline.`
  };
}
