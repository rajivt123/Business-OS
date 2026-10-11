-- Isolated regression test for inventory adjustment maker-checker enforcement.
-- Runs only in disposable PostgreSQL; does not require production data.

CREATE SCHEMA auth;
CREATE SCHEMA private;

CREATE FUNCTION auth.uid() RETURNS uuid
LANGUAGE sql STABLE
AS $fn$ SELECT nullif(current_setting('test.user_id', true), '')::uuid $fn$;

CREATE FUNCTION private.has_company_access(uuid, uuid) RETURNS boolean
LANGUAGE sql STABLE AS $fn$ SELECT true $fn$;

CREATE FUNCTION private.has_action_permission(uuid, text) RETURNS boolean
LANGUAGE sql STABLE AS $fn$ SELECT true $fn$;

CREATE TABLE public.tenant_companies (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  status text NOT NULL
);

CREATE TABLE public.inventory_adjustment_requests (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  item_id uuid NOT NULL,
  location_id uuid NOT NULL,
  lot_number text,
  system_quantity numeric NOT NULL,
  physical_quantity numeric NOT NULL,
  variance_quantity numeric NOT NULL,
  unit_cost numeric NOT NULL,
  reason text NOT NULL,
  status text NOT NULL,
  requested_by uuid,
  approved_by uuid,
  approved_at timestamptz,
  approval_notes text,
  inventory_transaction_id uuid,
  updated_at timestamptz
);

CREATE FUNCTION public.post_inventory_transaction_atomic(jsonb) RETURNS jsonb
LANGUAGE sql AS $fn$
  SELECT jsonb_build_object(
    'id', '90000000-0000-0000-0000-000000000001',
    'transaction_no', 'TEST-ADJ-001'
  )
$fn$;

\i supabase/migrations/20261011194500_phase00_inventory_adjustment_maker_checker.sql

INSERT INTO public.tenant_companies VALUES (
  '20000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'active'
);

INSERT INTO public.inventory_adjustment_requests (
  id, tenant_id, tenant_company_id, item_id, location_id, system_quantity,
  physical_quantity, variance_quantity, unit_cost, reason, status, requested_by
) VALUES (
  '30000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000001',
  '50000000-0000-0000-0000-000000000001',
  10, 8, -2, 15, 'Cycle count variance', 'pending',
  '60000000-0000-0000-0000-000000000001'
);

DO $test$
DECLARE
  v_status text;
BEGIN
  PERFORM set_config('test.user_id', '60000000-0000-0000-0000-000000000001', true);
  BEGIN
    PERFORM public.approve_inventory_adjustment_atomic(jsonb_build_object(
      'request_id', '30000000-0000-0000-0000-000000000001',
      'idempotency_key', 'test-maker-attempt'
    ));
    RAISE EXCEPTION 'Expected maker self-approval to be rejected';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM = 'Expected maker self-approval to be rejected' THEN RAISE; END IF;
    IF SQLERRM <> 'MAKER_CANNOT_APPROVE_OWN_INVENTORY_ADJUSTMENT' THEN RAISE; END IF;
  END;

  SELECT status INTO v_status FROM public.inventory_adjustment_requests
  WHERE id = '30000000-0000-0000-0000-000000000001';
  IF v_status <> 'pending' THEN RAISE EXCEPTION 'Rejected self-approval changed request state'; END IF;

  PERFORM set_config('test.user_id', '70000000-0000-0000-0000-000000000001', true);
  PERFORM public.approve_inventory_adjustment_atomic(jsonb_build_object(
    'request_id', '30000000-0000-0000-0000-000000000001',
    'idempotency_key', 'test-independent-approver',
    'approval_notes', 'Reviewed'
  ));

  SELECT status INTO v_status FROM public.inventory_adjustment_requests
  WHERE id = '30000000-0000-0000-0000-000000000001';
  IF v_status <> 'approved' THEN RAISE EXCEPTION 'Independent approver did not approve request'; END IF;
END;
$test$;

DROP TABLE public.inventory_adjustment_requests CASCADE;
DROP TABLE public.tenant_companies CASCADE;
DROP FUNCTION public.post_inventory_transaction_atomic(jsonb);
DROP FUNCTION public.approve_inventory_adjustment_atomic(jsonb);
DROP FUNCTION private.has_company_access(uuid, uuid);
DROP FUNCTION private.has_action_permission(uuid, text);
DROP FUNCTION auth.uid();
DROP SCHEMA private;
DROP SCHEMA auth;
