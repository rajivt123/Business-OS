-- Phase 00: pin search_path on helper functions flagged by the security advisor.
-- These functions are not SECURITY DEFINER; pinning resolution prevents mutable
-- session search_path behavior and keeps built-ins resolved from pg_catalog.
ALTER FUNCTION public.apply_canonical_master_item_to_boq_line()
  SET search_path = pg_catalog, public;

ALTER FUNCTION public.derive_canonical_master_code(text, text, text)
  SET search_path = pg_catalog, public;
