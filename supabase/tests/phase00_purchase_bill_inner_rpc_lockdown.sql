-- Isolated privilege regression: authenticated clients must not bypass the
-- purchase-bill-with-accounting wrapper by calling the inner bill creator.
-- Runs only on disposable PostgreSQL; never run this against production.
-- API roles are created by the workflow before this file runs.

CREATE FUNCTION public.create_purchase_bill_atomic(jsonb, jsonb) RETURNS jsonb
LANGUAGE sql SECURITY DEFINER SET search_path = ''
AS $fn$ SELECT jsonb_build_object('created', true) $fn$;
CREATE FUNCTION public.create_purchase_bill_with_accounting_atomic(jsonb, jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $fn$
BEGIN
  RETURN public.create_purchase_bill_atomic($1, $2);
END;
$fn$;

GRANT EXECUTE ON FUNCTION public.create_purchase_bill_atomic(jsonb, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_purchase_bill_with_accounting_atomic(jsonb, jsonb) TO authenticated;

\i supabase/migrations/20261011201500_phase00_purchase_bill_inner_rpc_lockdown.sql

DO $test$
BEGIN
  IF has_function_privilege('anon',
      'public.create_purchase_bill_atomic(jsonb,jsonb)', 'EXECUTE') THEN
    RAISE EXCEPTION 'anon must not execute inner purchase bill creator directly';
  END IF;
  IF has_function_privilege('authenticated',
      'public.create_purchase_bill_atomic(jsonb,jsonb)', 'EXECUTE') THEN
    RAISE EXCEPTION 'authenticated must not execute inner purchase bill creator directly';
  END IF;
  IF NOT has_function_privilege('service_role',
      'public.create_purchase_bill_atomic(jsonb,jsonb)', 'EXECUTE') THEN
    RAISE EXCEPTION 'service_role execution should remain available';
  END IF;
  IF NOT has_function_privilege('authenticated',
      'public.create_purchase_bill_with_accounting_atomic(jsonb,jsonb)', 'EXECUTE') THEN
    RAISE EXCEPTION 'supported accounting wrapper should remain callable';
  END IF;
END;
$test$;

SET ROLE authenticated;
SELECT public.create_purchase_bill_with_accounting_atomic('{}'::jsonb, '[]'::jsonb);
RESET ROLE;

DROP FUNCTION public.create_purchase_bill_with_accounting_atomic(jsonb, jsonb);
DROP FUNCTION public.create_purchase_bill_atomic(jsonb, jsonb);
