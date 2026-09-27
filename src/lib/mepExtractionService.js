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
  tenantCompanyId,
}) {
  if (!documentId) {
    throw new Error('Document ID is required to prepare an extraction job.');
  }

  if (inFlightExtractionJobs.has(documentId)) {
    return inFlightExtractionJobs.get(documentId);
  }

  const jobPromise = (async () => {
    const { data, error } = await supabase.functions.invoke('mep-extraction-worker', {
      body: {
        action: 'prepare',
        tenant_company_id: tenantCompanyId,
        document_id: documentId
      }
    });

    if (error) {
      throw new Error(`Failed to initialize extraction job: ${error.message}`);
    }
    if (data?.error) {
      throw new Error(`Failed to initialize extraction job: ${data.error}`);
    }

    return {
      extraction: data.extraction,
      alreadyExisted: data.already_existed
    };
  })();

  inFlightExtractionJobs.set(documentId, jobPromise);

  try {
    return await jobPromise;
  } finally {
    inFlightExtractionJobs.delete(documentId);
  }
}

export async function executeExtractionJob({
  jobId,
  tenantCompanyId,
  workerId,
  options = {}
}) {
  const { data, error } = await supabase.functions.invoke('mep-extraction-worker', {
    body: {
      action: 'execute',
      tenant_company_id: tenantCompanyId,
      job_id: jobId,
      worker_id: workerId,
      options
    }
  });

  if (error) throw new Error(`Execution failed: ${error.message}`);
  if (data?.error) throw new Error(`Execution failed: ${data.error}`);
  return data;
}

export async function cancelExtractionJob({
  jobId,
  tenantCompanyId,
  reason = 'Cancelled by user'
}) {
  const { data, error } = await supabase.functions.invoke('mep-extraction-worker', {
    body: {
      action: 'cancel',
      tenant_company_id: tenantCompanyId,
      job_id: jobId,
      reason
    }
  });

  if (error) throw new Error(`Cancel failed: ${error.message}`);
  if (data?.error) throw new Error(`Cancel failed: ${data.error}`);
  return data;
}

export async function retryExtractionJob({
  jobId,
  tenantCompanyId,
}) {
  const { data, error } = await supabase.functions.invoke('mep-extraction-worker', {
    body: {
      action: 'retry',
      tenant_company_id: tenantCompanyId,
      job_id: jobId
    }
  });

  if (error) throw new Error(`Retry failed: ${error.message}`);
  if (data?.error) throw new Error(`Retry failed: ${data.error}`);
  
  return {
    extraction: data.extraction,
    alreadyExisted: data.already_existed
  };
}

// Re-export Phase 4A extraction architecture, state machine, contracts, and worker orchestrator
export * from './mep/extraction/constants.js';
export * from './mep/extraction/extractionEnvelope.js';
export * from './mep/extraction/documentStrategyRouter.js';
export * from './mep/extraction/providerContract.js';
export * from './mep/extraction/dryRunProvider.js';
