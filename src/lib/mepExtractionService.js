import { supabase } from './supabase.js';

export const ACTIVE_EXTRACTION_STATUSES = ['pending', 'processing', 'in_progress', 'running'];

// In-flight promise registry to prevent duplicate calls within the same browser session/tab
const inFlightExtractionJobs = new Map();

/**
 * Fetch the current active extraction job for a document, if one exists.
 */
async function fetchActiveJob(documentId, tenantCompanyId) {
  let query = supabase
    .from('mep_document_extractions')
    .select('*')
    .eq('document_example_id', documentId)
    .eq('extraction_type', 'DOCUMENT_EXTRACTION')
    .in('status', ACTIVE_EXTRACTION_STATUSES)
    .order('created_at', { ascending: false })
    .limit(1);

  if (tenantCompanyId) {
    query = query.eq('tenant_company_id', tenantCompanyId);
  }

  const { data, error } = await query;
  if (error) {
    console.warn('[mepExtractionService] Notice checking existing extraction jobs:', error.message);
  }
  return data && data.length > 0 ? data[0] : null;
}

/**
 * Prepares an initial extraction job for a document in an idempotent, database-backed manner.
 *
 * Rules:
 * - At most one active (pending/processing/in_progress/running) DOCUMENT_EXTRACTION job per document.
 * - If an active extraction job already exists, returns that job without creating a duplicate.
 * - Protects against rapid double-clicks, concurrent tabs, retries, and race conditions.
 * - Preserves existing completed/failed historical extractions.
 * - Does NOT call any AI provider, generate extraction lines, or create inventory items.
 *
 * @param {Object} params
 * @param {string} params.documentId - mep_document_examples.id
 * @param {string} [params.tenantId] - Active tenant ID
 * @param {string} params.tenantCompanyId - Operating Company ID
 * @param {string} params.userId - Authenticated user ID
 * @returns {Promise<{ extraction: Object, alreadyExisted: boolean }>}
 */
export async function prepareInitialDocumentExtractionJob({
  documentId,
  tenantId,
  tenantCompanyId,
  userId
}) {
  if (!documentId) {
    throw new Error('Document ID is required to prepare an extraction job.');
  }

  // Session-level in-flight deduplication (guards rapid double-clicks / concurrent triggers in same session)
  if (inFlightExtractionJobs.has(documentId)) {
    console.log(`[mepExtractionService] Request already in-flight for document ${documentId}. Joining existing promise.`);
    return inFlightExtractionJobs.get(documentId);
  }

  const jobPromise = (async () => {
    // 1. Database-backed query: Check for an existing pending/running DOCUMENT_EXTRACTION job
    const existingActiveJob = await fetchActiveJob(documentId, tenantCompanyId);

    if (existingActiveJob) {
      console.log('[mepExtractionService] Active extraction job already exists for document:', existingActiveJob.id);
      return {
        extraction: existingActiveJob,
        alreadyExisted: true
      };
    }

    // 2. No active job found — insert initial pending job
    const extPayload = {
      tenant_id: tenantId || null,
      tenant_company_id: tenantCompanyId,
      document_example_id: documentId,
      extraction_type: 'DOCUMENT_EXTRACTION',
      provider: 'pending',
      model_name: null,
      model_version: null,
      status: 'pending',
      created_by: userId
    };

    const { data: newJob, error: insertError } = await supabase
      .from('mep_document_extractions')
      .insert(extPayload)
      .select()
      .single();

    if (insertError) {
      // 3. Concurrency edge-case: If another client/tab inserted simultaneously
      // Check for uniqueness constraint error (PostgreSQL code 23505) or general duplicate/unique error
      if (
        insertError.code === '23505' ||
        insertError.message?.toLowerCase().includes('duplicate') ||
        insertError.message?.toLowerCase().includes('unique')
      ) {
        console.warn('[mepExtractionService] Unique constraint violation (23505) detected on insert. Re-querying active job...');
        const fallbackJob = await fetchActiveJob(documentId, tenantCompanyId);
        if (fallbackJob) {
          return {
            extraction: fallbackJob,
            alreadyExisted: true
          };
        }
      }

      throw new Error(`Failed to initialize extraction job: ${insertError.message}`);
    }

    return {
      extraction: newJob || extPayload,
      alreadyExisted: false
    };
  })();

  inFlightExtractionJobs.set(documentId, jobPromise);

  try {
    return await jobPromise;
  } finally {
    inFlightExtractionJobs.delete(documentId);
  }
}

// Re-export Phase 4A extraction architecture, state machine, contracts, and worker orchestrator
export * from './mep/extraction/constants.js';
export * from './mep/extraction/extractionEnvelope.js';
export * from './mep/extraction/documentStrategyRouter.js';
export * from './mep/extraction/providerContract.js';
export * from './mep/extraction/dryRunProvider.js';
export * from './mep/extraction/mepExtractionWorker.js';
