-- Durable, atomic per-user rate limiting for the CRM AI Edge Function.
-- Source-only until isolated tests pass; do not apply to production as part of this PR.
BEGIN;

CREATE SCHEMA IF NOT EXISTS private;

CREATE TABLE IF NOT EXISTS private.crm_ai_rate_limits (
  user_id uuid PRIMARY KEY,
  window_started_at timestamptz NOT NULL,
  request_count integer NOT NULL CHECK (request_count > 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE private.crm_ai_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE private.crm_ai_rate_limits FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.consume_crm_ai_rate_limit(
  p_user_id uuid,
  p_limit integer DEFAULT 10,
  p_window_seconds integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_count integer;
BEGIN
  IF p_user_id IS NULL
     OR p_limit IS NULL OR p_limit < 1 OR p_limit > 100
     OR p_window_seconds IS NULL OR p_window_seconds < 1 OR p_window_seconds > 3600
  THEN
    RAISE EXCEPTION 'Invalid rate-limit arguments';
  END IF;

  INSERT INTO private.crm_ai_rate_limits AS current_limit (
    user_id, window_started_at, request_count, updated_at
  )
  VALUES (p_user_id, pg_catalog.clock_timestamp(), 1, pg_catalog.clock_timestamp())
  ON CONFLICT (user_id) DO UPDATE
  SET window_started_at = CASE
        WHEN current_limit.window_started_at
             + pg_catalog.make_interval(secs => p_window_seconds) <= pg_catalog.clock_timestamp()
        THEN pg_catalog.clock_timestamp()
        ELSE current_limit.window_started_at
      END,
      request_count = CASE
        WHEN current_limit.window_started_at
             + pg_catalog.make_interval(secs => p_window_seconds) <= pg_catalog.clock_timestamp()
        THEN 1
        ELSE current_limit.request_count + 1
      END,
      updated_at = pg_catalog.clock_timestamp()
  RETURNING request_count INTO v_count;

  RETURN v_count <= p_limit;
END;
$function$;

REVOKE ALL ON FUNCTION public.consume_crm_ai_rate_limit(uuid, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_crm_ai_rate_limit(uuid, integer, integer) TO service_role;

COMMIT;
