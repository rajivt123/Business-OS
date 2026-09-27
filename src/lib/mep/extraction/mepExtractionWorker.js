/**
 * MEP Extraction Worker
 * Phase 4A Implementation
 *
 * Implements the lifecycle orchestrator for MEP extraction jobs:
 * 1. Claim extraction job (atomic state transition: pending -> processing)
 * 2. Verify tenant / operating company authorization
 * 3. Load document metadata from mep_document_examples
 * 4. Resolve source attachment via existing Cloudflare R2 storage layer
 * 5. Determine document strategy via strategy router
 * 6. Execute provider-neutral extraction contract
 * 7. Store raw extraction envelope into mep_document_extractions.raw_output
 * 8. Update extraction status (completed / failed) with timestamps
 *
 * ZERO AI/OCR CALLS IN THIS PHASE.
 */

import { supabase } from '../../supabase.js';
import { createBusinessAttachmentDownloadUrl } from '../../storageService.js';
import {
  EXTRACTION_STATUS,
  canTransitionStatus
} from './constants.js';
import { determineExtractionStrategy } from './documentStrategyRouter.js';
import { ExtractionProviderRegistry } from './providerContract.js';
import './dryRunProvider.js'; // Ensure default dry-run provider is registered

/**
 * Claims a pending extraction job atomically.
 * Prevents concurrent workers from processing the same active extraction.
 */
export async function claimExtractionJob({
  jobId,
  tenantCompanyId,
  userId,
  workerId = `worker_${crypto.randomUUID().slice(0, 8)}`
}) {
  if (!jobId) throw new Error('jobId is required to claim an extraction job.');
  if (!tenantCompanyId) throw new Error('tenantCompanyId is required to claim an extraction job.');

  const startedAt = new Date().toISOString();

  // Atomically claim by updating status from 'pending' to 'processing'
  let query = supabase
    .from('mep_document_extractions')
    .update({
      status: EXTRACTION_STATUS.PROCESSING,
      started_at: startedAt
    })
    .eq('id', jobId)
    .eq('status', EXTRACTION_STATUS.PENDING)
    .eq('tenant_company_id', tenantCompanyId)
    .select()
    .single();

  const { data: claimedJob, error: claimError } = await query;

  if (claimError || !claimedJob) {
    return {
      claimed: false,
      reason: claimError ? claimError.message : 'Job was not in pending status or not found.',
      job: null
    };
  }

  return {
    claimed: true,
    job: claimedJob,
    workerId,
    startedAt
  };
}

/**
 * Verifies tenant/company authorization for an extraction job
 */
export function verifyJobAuthorization({ job, tenantCompanyId, userId }) {
  if (!userId) {
    throw new Error('Authentication required: valid userId must be provided.');
  }
  if (!tenantCompanyId) {
    throw new Error('Company context required: valid tenantCompanyId must be provided.');
  }
  if (job.tenant_company_id && job.tenant_company_id !== tenantCompanyId) {
    throw new Error('Unauthorized: extraction job does not belong to the active operating company.');
  }
  return true;
}

/**
 * Loads document metadata from mep_document_examples
 */
export async function loadDocumentMetadata(documentId, tenantCompanyId) {
  if (!documentId) throw new Error('documentId is required to load document metadata.');

  let query = supabase
    .from('mep_document_examples')
    .select('*')
    .eq('id', documentId);

  if (tenantCompanyId) {
    query = query.eq('tenant_company_id', tenantCompanyId);
  }

  const { data: doc, error } = await query.single();
  if (error || !doc) {
    throw new Error(`Document metadata not found for ID "${documentId}": ${error?.message || 'Not found'}`);
  }
  return doc;
}

/**
 * Resolves source attachment from existing storage layer (Cloudflare R2)
 */
export async function resolveSourceAttachment({ document, tenantCompanyId }) {
  const attachmentId = document?.metadata?.file_attachment_id;
  if (!attachmentId) {
    return {
      resolved: false,
      attachmentId: null,
      downloadUrl: null,
      fileName: document.source_file_name || null,
      reason: 'No attached storage reference found in document metadata.'
    };
  }

  try {
    const res = await createBusinessAttachmentDownloadUrl({
      tenantCompanyId: document.tenant_company_id || tenantCompanyId,
      attachmentId
    });

    return {
      resolved: Boolean(res?.download_url),
      attachmentId,
      downloadUrl: res?.download_url || null,
      fileName: res?.file_name || document.source_file_name || null,
      fileSize: res?.file_size_bytes || document.metadata?.file_size || null,
      mimeType: res?.mime_type || document.metadata?.mime_type || null
    };
  } catch (err) {
    console.warn('[mepExtractionWorker] Storage resolution warning:', err.message);
    return {
      resolved: false,
      attachmentId,
      downloadUrl: null,
      fileName: document.source_file_name || null,
      reason: err.message
    };
  }
}

/**
 * Updates extraction job status and stores raw extraction output
 */
export async function recordExtractionSuccess({
  jobId,
  tenantCompanyId,
  result
}) {
  const completedAt = new Date().toISOString();

  const updatePayload = {
    status: EXTRACTION_STATUS.COMPLETED,
    completed_at: completedAt,
    provider: result.provider || 'unknown',
    model_name: result.model_name || null,
    model_version: result.model_version || null,
    confidence_score: result.confidence !== undefined ? result.confidence : 1.0,
    raw_output: result.raw_output,
    error_message: null
  };

  let query = supabase
    .from('mep_document_extractions')
    .update(updatePayload)
    .eq('id', jobId);

  if (tenantCompanyId) {
    query = query.eq('tenant_company_id', tenantCompanyId);
  }

  const { data: updatedJob, error } = await query.select().single();
  if (error) {
    throw new Error(`Failed to record extraction success for job ${jobId}: ${error.message}`);
  }
  return updatedJob;
}

/**
 * Records extraction failure safely
 */
export async function recordExtractionFailure({
  jobId,
  tenantCompanyId,
  errorMessage
}) {
  const completedAt = new Date().toISOString();

  const updatePayload = {
    status: EXTRACTION_STATUS.FAILED,
    completed_at: completedAt,
    error_message: errorMessage
  };

  let query = supabase
    .from('mep_document_extractions')
    .update(updatePayload)
    .eq('id', jobId);

  if (tenantCompanyId) {
    query = query.eq('tenant_company_id', tenantCompanyId);
  }

  const { data: updatedJob, error } = await query.select().single();
  if (error) {
    console.error(`[mepExtractionWorker] Failed to record failure for job ${jobId}:`, error);
  }
  return updatedJob;
}

/**
 * Cancels an extraction job safely if active
 */
export async function cancelExtractionJob({
  jobId,
  tenantCompanyId,
  userId,
  reason = 'Cancelled by user'
}) {
  if (!jobId) throw new Error('jobId is required to cancel an extraction job.');

  // Fetch current status
  const { data: currentJob, error: fetchErr } = await supabase
    .from('mep_document_extractions')
    .select('status, tenant_company_id')
    .eq('id', jobId)
    .single();

  if (fetchErr || !currentJob) {
    throw new Error(`Extraction job not found: ${fetchErr?.message || jobId}`);
  }

  if (tenantCompanyId && currentJob.tenant_company_id !== tenantCompanyId) {
    throw new Error('Unauthorized to cancel this extraction job.');
  }

  if (!canTransitionStatus(currentJob.status, EXTRACTION_STATUS.CANCELLED)) {
    throw new Error(`Cannot cancel extraction job with status "${currentJob.status}".`);
  }

  const { data: updatedJob, error: updateErr } = await supabase
    .from('mep_document_extractions')
    .update({
      status: EXTRACTION_STATUS.CANCELLED,
      completed_at: new Date().toISOString(),
      error_message: reason
    })
    .eq('id', jobId)
    .select()
    .single();

  if (updateErr) {
    throw new Error(`Failed to cancel extraction job: ${updateErr.message}`);
  }

  return updatedJob;
}

/**
 * Main Worker Pipeline Orchestrator
 * Phase 4A Contract: Executes extraction using the registered provider without AI
 */
export async function executeExtractionJob({
  jobId,
  tenantCompanyId,
  userId,
  workerId,
  providerName = null,
  options = {}
}) {
  // Step 1: Claim Job
  const claimResult = await claimExtractionJob({ jobId, tenantCompanyId, userId, workerId });
  if (!claimResult.claimed) {
    throw new Error(`Failed to claim extraction job: ${claimResult.reason}`);
  }
  const job = claimResult.job;

  try {
    // Step 2: Verify Authorization
    verifyJobAuthorization({ job, tenantCompanyId, userId });

    // Step 3: Load Document Metadata
    const document = await loadDocumentMetadata(job.document_example_id, tenantCompanyId);

    // Step 4: Resolve Source Attachment from existing R2 storage
    const source = await resolveSourceAttachment({ document, tenantCompanyId });

    // Step 5: Determine Document Strategy
    const strategyResolution = determineExtractionStrategy({
      documentType: document.document_type,
      fileName: document.source_file_name || source.fileName,
      mimeType: document.metadata?.mime_type || source.mimeType
    });

    // Step 6: Select Provider
    const provider = providerName
      ? ExtractionProviderRegistry.get(providerName)
      : ExtractionProviderRegistry.getDefault();

    // Step 7: Execute Provider Contract
    const extractionResult = await provider.extractDocument({
      document,
      extractionJob: job,
      source,
      options: {
        strategy: strategyResolution.strategy,
        isDeferred: strategyResolution.isDeferred,
        worker_id: claimResult.workerId,
        ...options
      }
    });

    // Step 8: Store Raw Output & Record Success
    const finalJob = await recordExtractionSuccess({
      jobId,
      tenantCompanyId,
      result: extractionResult
    });

    return {
      success: true,
      job: finalJob,
      strategy: strategyResolution.strategy,
      provider: provider.name
    };
  } catch (err) {
    console.error(`[mepExtractionWorker] Job ${jobId} failed during execution:`, err);
    await recordExtractionFailure({
      jobId,
      tenantCompanyId,
      errorMessage: err.message || 'Unknown extraction failure'
    });
    throw err;
  }
}
