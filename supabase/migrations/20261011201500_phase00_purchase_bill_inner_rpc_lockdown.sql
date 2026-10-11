-- Prevent direct creation of a "verified" purchase bill without its accounting journal.
-- The supported client path is create_purchase_bill_with_accounting_atomic().
-- Source-only until the procurement end-to-end suite is validated.
BEGIN;

REVOKE ALL ON FUNCTION public.create_purchase_bill_atomic(jsonb, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_purchase_bill_atomic(jsonb, jsonb) FROM anon;
REVOKE ALL ON FUNCTION public.create_purchase_bill_atomic(jsonb, jsonb) FROM authenticated;

-- Preserve service-role access for controlled server-side maintenance if needed.
GRANT EXECUTE ON FUNCTION public.create_purchase_bill_atomic(jsonb, jsonb) TO service_role;

COMMIT;
