-- Disposable PostgreSQL regression for journal reversal idempotency.
-- Uses minimal schema stubs; never run against production.
CREATE SCHEMA auth;
CREATE SCHEMA private;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('test.uid',true),'')::uuid $$;
CREATE FUNCTION private.has_action_permission(uuid,text) RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT true $$;
CREATE FUNCTION private.has_company_access(uuid,uuid) RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT true $$;
CREATE TABLE public.accounting_journal_entries (
 id uuid PRIMARY KEY, tenant_id uuid NOT NULL, tenant_company_id uuid NOT NULL,
 fiscal_period_id uuid, voucher_number text NOT NULL, voucher_type text,
 entry_date date NOT NULL, narration text, source_type text, source_id uuid,
 status text NOT NULL, reversal_of_entry_id uuid, idempotency_key text,
 request_hash text, created_by uuid
);
CREATE UNIQUE INDEX accounting_journal_entries_idempotency_unique
 ON public.accounting_journal_entries(tenant_company_id,idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE TABLE public.accounting_journal_lines (
 id bigserial PRIMARY KEY, journal_entry_id uuid NOT NULL, account_id uuid NOT NULL,
 line_no integer NOT NULL, description text, debit numeric NOT NULL DEFAULT 0,
 credit numeric NOT NULL DEFAULT 0, party_type text, party_id uuid, project_id uuid
);
CREATE TABLE public.accounting_fiscal_periods (
 id uuid PRIMARY KEY, tenant_id uuid NOT NULL, tenant_company_id uuid NOT NULL,
 period_start date NOT NULL, period_end date NOT NULL, status text NOT NULL
);
\i supabase/migrations/20261012100000_phase00_journal_reversal_idempotency_guard.sql
DO $test$
DECLARE
 t constant uuid := '10000000-0000-0000-0000-000000000001';
 c constant uuid := '20000000-0000-0000-0000-000000000001';
 u constant uuid := '30000000-0000-0000-0000-000000000001';
 o constant uuid := '40000000-0000-0000-0000-000000000001';
 r constant uuid := '50000000-0000-0000-0000-000000000001';
 got jsonb;
BEGIN
 PERFORM set_config('test.uid',u::text,false);
 INSERT INTO public.accounting_journal_entries(id,tenant_id,tenant_company_id,voucher_number,entry_date,narration,source_type,status,created_by)
 VALUES(o,t,c,'JV-001','2026-10-01','Original','manual','reversed',u);
 INSERT INTO public.accounting_journal_entries(id,tenant_id,tenant_company_id,voucher_number,entry_date,narration,source_type,status,reversal_of_entry_id,source_id,idempotency_key,created_by)
 VALUES(r,t,c,'REV-001','2026-10-02','Reason A','journal_reversal','posted',o,o,'idem-exact',u);
 got := public.reverse_journal_entry_atomic(jsonb_build_object('tenant_id',t,'tenant_company_id',c,'journal_entry_id',o,'reversal_date','2026-10-02','reversal_reason','Reason A','idempotency_key','idem-exact'));
 IF got->>'id' IS DISTINCT FROM r::text OR got->>'idempotent' IS DISTINCT FROM 'true' THEN RAISE EXCEPTION 'Exact retry failed: %',got; END IF;
 BEGIN
  PERFORM public.reverse_journal_entry_atomic(jsonb_build_object('tenant_id',t,'tenant_company_id',c,'journal_entry_id',o,'reversal_date','2026-10-03','reversal_reason','Reason A','idempotency_key','idem-exact'));
  RAISE EXCEPTION 'Expected changed date to be rejected';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM='Expected changed date to be rejected' THEN RAISE; END IF; END;
 BEGIN
  PERFORM public.reverse_journal_entry_atomic(jsonb_build_object('tenant_id',t,'tenant_company_id',c,'journal_entry_id',o,'reversal_date','2026-10-02','reversal_reason','Reason B','idempotency_key','idem-exact'));
  RAISE EXCEPTION 'Expected changed reason to be rejected';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM='Expected changed reason to be rejected' THEN RAISE; END IF; END;
END;
$test$;
DROP FUNCTION public.reverse_journal_entry_atomic(jsonb);
DROP TABLE public.accounting_journal_lines CASCADE;
DROP TABLE public.accounting_fiscal_periods CASCADE;
DROP TABLE public.accounting_journal_entries CASCADE;
DROP FUNCTION private.has_company_access(uuid,uuid);
DROP FUNCTION private.has_action_permission(uuid,text);
DROP FUNCTION auth.uid();
DROP SCHEMA private;
DROP SCHEMA auth;
