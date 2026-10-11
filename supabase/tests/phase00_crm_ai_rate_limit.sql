-- Phase 00 CRM AI rate-limit regression checks.
-- RUN ONLY against a disposable/local PostgreSQL database after applying
-- 20261011190000_phase00_crm_ai_durable_rate_limit.sql.
-- NEVER run this script against production: it performs transactional writes.
-- All data writes are rolled back at the end.

BEGIN;

DO $test$
DECLARE
  v_user_id uuid := 'f0e7b8da-05c2-4b1e-8d5d-000000000001';
  v_allowed boolean;
  v_count integer;
  i integer;
BEGIN
  -- Verify least-privilege grants and function hardening.
  IF has_function_privilege('anon', 'public.consume_crm_ai_rate_limit(uuid,integer,integer)', 'EXECUTE') THEN
    RAISE EXCEPTION 'anon must not execute consume_crm_ai_rate_limit';
  END IF;
  IF has_function_privilege('authenticated', 'public.consume_crm_ai_rate_limit(uuid,integer,integer)', 'EXECUTE') THEN
    RAISE EXCEPTION 'authenticated must not execute consume_crm_ai_rate_limit';
  END IF;
  IF NOT has_function_privilege('service_role', 'public.consume_crm_ai_rate_limit(uuid,integer,integer)', 'EXECUTE') THEN
    RAISE EXCEPTION 'service_role must execute consume_crm_ai_rate_limit';
  END IF;
  IF has_table_privilege('anon', 'private.crm_ai_rate_limits', 'SELECT')
     OR has_table_privilege('authenticated', 'private.crm_ai_rate_limits', 'SELECT')
     OR has_table_privilege('service_role', 'private.crm_ai_rate_limits', 'SELECT') THEN
    RAISE EXCEPTION 'API roles must not directly read the private rate-limit table';
  END IF;

  -- First ten calls pass; the eleventh is denied.
  FOR i IN 1..10 LOOP
    v_allowed := public.consume_crm_ai_rate_limit(v_user_id, 10, 60);
    IF NOT v_allowed THEN
      RAISE EXCEPTION 'request % was unexpectedly denied', i;
    END IF;
  END LOOP;
  v_allowed := public.consume_crm_ai_rate_limit(v_user_id, 10, 60);
  IF v_allowed THEN
    RAISE EXCEPTION 'request 11 was unexpectedly allowed';
  END IF;
  -- Repeated rejected requests must not grow the stored counter without bound.
  FOR i IN 1..100 LOOP
    v_allowed := public.consume_crm_ai_rate_limit(v_user_id, 10, 60);
    IF v_allowed THEN
      RAISE EXCEPTION 'a request above the limit was unexpectedly allowed';
    END IF;
  END LOOP;

  SELECT request_count INTO v_count
  FROM private.crm_ai_rate_limits WHERE user_id = v_user_id;
  IF v_count <> 11 THEN
    RAISE EXCEPTION 'expected counter 11 after denied request, got %', v_count;
  END IF;

  -- Simulate an expired window without waiting 60 seconds.
  UPDATE private.crm_ai_rate_limits
  SET window_started_at = pg_catalog.clock_timestamp() - interval '2 minutes'
  WHERE user_id = v_user_id;
  v_allowed := public.consume_crm_ai_rate_limit(v_user_id, 10, 60);
  IF NOT v_allowed THEN
    RAISE EXCEPTION 'first request in a new window should be allowed';
  END IF;
  SELECT request_count INTO v_count
  FROM private.crm_ai_rate_limits WHERE user_id = v_user_id;
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'expected counter reset to 1, got %', v_count;
  END IF;

  -- Invalid limits must fail closed by raising an exception.
  BEGIN
    PERFORM public.consume_crm_ai_rate_limit(v_user_id, 0, 60);
    RAISE EXCEPTION 'limit=0 should have been rejected';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM = 'limit=0 should have been rejected' THEN RAISE; END IF;
  END;
END;
$test$;

ROLLBACK;
