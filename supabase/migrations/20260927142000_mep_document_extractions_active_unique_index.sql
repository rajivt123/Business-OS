-- Migration: Enforce MEP extraction job idempotency
-- Date: 2026-09-27
-- Description:
-- Creates a partial unique index on mep_document_extractions ensuring that for each
-- (document_example_id, extraction_type), at most one row can have an active status:
-- ('pending', 'processing', 'in_progress', 'running').
-- Historical runs ('completed', 'failed', 'cancelled') remain unconstrained to support multi-model extractions.

CREATE UNIQUE INDEX IF NOT EXISTS idx_mep_document_extractions_active_unique
ON public.mep_document_extractions (document_example_id, extraction_type)
WHERE status IN ('pending', 'processing', 'in_progress', 'running');
