/**
 * Dry-Run / Contract Extraction Provider
 * Phase 4A Implementation
 *
 * Implements the ExtractionProvider contract WITHOUT contacting any AI/OCR provider.
 * Validates the pipeline, strategy routing, source resolution, and output envelope.
 */

import { ExtractionProvider, ExtractionProviderRegistry } from './providerContract.js';
import { createRawExtractionEnvelope } from './extractionEnvelope.js';

export class DryRunExtractionProvider extends ExtractionProvider {
  constructor() {
    super('dry_run_contract', {
      description: 'Phase 4A contract verification provider (zero external AI/OCR calls)',
      requiresServerSideKeys: false,
      supportedStrategies: ['ALL']
    });
  }

  /**
   * Executes dry-run contract extraction.
   *
   * @param {Object} params
   * @param {Object} params.document - mep_document_examples record
   * @param {Object} params.extractionJob - mep_document_extractions record
   * @param {Object} params.source - Resolved source attachment metadata & download URL
   * @param {Object} [params.options] - Options (e.g. strategy, worker_id)
   * @returns {Promise<Object>} Standard extraction result adhering to the contract
   */
  async extractDocument({ document, extractionJob, source, options = {} }) {
    if (!document || !document.id) {
      throw new Error('DryRunExtractionProvider requires a valid document object.');
    }
    if (!extractionJob || !extractionJob.id) {
      throw new Error('DryRunExtractionProvider requires a valid extractionJob object.');
    }

    const strategy = options.strategy || 'GENERIC_DOCUMENT';
    const isDeferred = options.isDeferred || false;

    const warnings = [];
    if (isDeferred) {
      warnings.push(`Extraction strategy "${strategy}" is deferred pending specialized CAD/drawing parser.`);
    }

    // Create a stable raw envelope conforming to schema_version 1.0
    const rawEnvelope = createRawExtractionEnvelope({
      document: {
        document_type: document.document_type || 'OTHER',
        document_number: document.document_number || null,
        document_date: document.document_date || null,
        title: document.title || 'Untitled Document'
      },
      lines: [], // Zero synthetic extraction lines generated
      totals: {
        subtotal: null,
        tax_amount: null,
        grand_total: null,
        currency: 'INR'
      },
      metadata: {
        strategy,
        provider: this.name,
        model_name: 'phase_4a_contract_worker',
        model_version: '1.0.0',
        worker_id: options.worker_id || 'local_worker',
        execution_mode: 'dry_run_contract_validation',
        source_attachment_id: source?.attachmentId || document.metadata?.file_attachment_id || null,
        source_file_name: document.source_file_name || source?.fileName || null,
        file_size_bytes: document.metadata?.file_size || null,
        is_deferred: isDeferred,
        external_ai_called: false,
        processed_at: new Date().toISOString()
      },
      warnings
    });

    const result = {
      provider: this.name,
      model_name: 'phase_4a_contract_worker',
      model_version: '1.0.0',
      extraction_type: 'DOCUMENT_EXTRACTION',
      raw_output: rawEnvelope,
      confidence: 1.0,
      usage: {
        pages_processed: 0,
        tokens_used: 0,
        processing_time_ms: 10
      },
      warnings,
      metadata: {
        contract_verified: true,
        phase: '4A'
      }
    };

    // Validate result against contract before returning
    this.validateResult(result);

    return result;
  }
}

// Auto-register the DryRunExtractionProvider as the default provider for Phase 4A
export const defaultDryRunProvider = new DryRunExtractionProvider();
ExtractionProviderRegistry.register(defaultDryRunProvider, true);
