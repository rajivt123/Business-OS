-- Phase 00 security hardening: prevent direct client access to master BOQ outputs.
-- RLS is enabled and client grants are revoked until a tenant-scoped access contract
-- and legitimate application readers/writers have been verified.
-- This is intentionally idempotent; the equivalent protection was applied live
-- during the Phase 00 audit and this migration records that state in source control.

ALTER TABLE public.master_boq_outputs ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE public.master_boq_outputs FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.master_boq_outputs FROM authenticated;
