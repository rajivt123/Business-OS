-- Isolated authorization regression for Form 16 preparation.
-- The unauthorized case exits before payroll aggregates/certificate writes.
CREATE SCHEMA auth;
CREATE SCHEMA private;

CREATE FUNCTION auth.uid() RETURNS uuid
LANGUAGE sql STABLE
AS $fn$ SELECT nullif(current_setting('test.user_id', true), '')::uuid $fn$;

CREATE FUNCTION private.has_company_access(uuid, uuid) RETURNS boolean
LANGUAGE sql STABLE AS $fn$ SELECT false $fn$;

CREATE FUNCTION private.has_action_permission(uuid, text) RETURNS boolean
LANGUAGE sql STABLE AS $fn$ SELECT false $fn$;

CREATE TABLE public.employees (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  linked_user_id uuid,
  display_name text,
  first_name text,
  employee_code text
);

CREATE TABLE public.payroll_tax_certificates (
  id uuid PRIMARY KEY,
  status text
);

\i supabase/migrations/20261011200000_phase00_payroll_form16_access_guard.sql

INSERT INTO public.employees (
  id,tenant_id,tenant_company_id,linked_user_id,display_name,first_name,employee_code
) VALUES (
  '30000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  '60000000-0000-0000-0000-000000000001',
  'Confidential Employee','Confidential','EMP-001'
);

DO $test$
BEGIN
  PERFORM set_config('test.user_id', '70000000-0000-0000-0000-000000000001', true);
  BEGIN
    PERFORM public.generate_payroll_form16_preparation_atomic(
      '30000000-0000-0000-0000-000000000001','2026-27'
    );
    RAISE EXCEPTION 'Expected non-manager peer access to be rejected';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM = 'Expected non-manager peer access to be rejected' THEN RAISE; END IF;
    IF SQLERRM <> 'Not authorized' THEN RAISE; END IF;
  END;
END;
$test$;

DROP FUNCTION public.generate_payroll_form16_preparation_atomic(uuid,text);
DROP TABLE public.employees CASCADE;
DROP TABLE public.payroll_tax_certificates CASCADE;
DROP FUNCTION private.has_company_access(uuid,uuid);
DROP FUNCTION private.has_action_permission(uuid,text);
DROP FUNCTION auth.uid();
DROP SCHEMA private;
DROP SCHEMA auth;
