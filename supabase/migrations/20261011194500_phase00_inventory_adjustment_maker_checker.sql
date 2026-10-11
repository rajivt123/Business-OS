-- Enforce maker-checker separation for inventory adjustments.
-- Source-only until isolated tests and end-to-end inventory workflow are reviewed.
-- Do not apply directly to production as part of this PR.
BEGIN;

CREATE OR REPLACE FUNCTION public.approve_inventory_adjustment_atomic(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_request_id uuid := nullif(p_payload->>'request_id','')::uuid;
  v_key text := nullif(trim(p_payload->>'idempotency_key'),'');
  v_notes text := nullif(trim(p_payload->>'approval_notes'),'');
  v_request record;
  v_tenant uuid;
  v_type text;
  v_tx jsonb;
  v_tx_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF v_request_id IS NULL OR v_key IS NULL THEN
    RAISE EXCEPTION 'request_id and idempotency_key are required';
  END IF;

  SELECT * INTO v_request
  FROM public.inventory_adjustment_requests
  WHERE id = v_request_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Inventory adjustment request not found';
  END IF;

  SELECT tenant_id INTO v_tenant
  FROM public.tenant_companies
  WHERE id = v_request.tenant_company_id AND status = 'active';
  IF v_tenant IS NULL THEN
    RAISE EXCEPTION 'Active tenant company not found';
  END IF;
  IF NOT private.has_company_access(v_tenant, v_request.tenant_company_id) THEN
    RAISE EXCEPTION 'Company access denied';
  END IF;
  IF NOT private.has_action_permission(v_tenant, 'MANAGER') THEN
    RAISE EXCEPTION 'Manager approval is required';
  END IF;

  IF v_request.status = 'approved' THEN
    RETURN jsonb_build_object(
      'request_id', v_request.id, 'status', 'approved',
      'transaction_id', v_request.inventory_transaction_id,
      'idempotent_replay', true
    );
  END IF;
  IF v_request.status <> 'pending' THEN
    RAISE EXCEPTION 'Adjustment request is not pending';
  END IF;

  -- Enforce maker-checker: the user who submitted the physical-count request
  -- cannot approve and post their own inventory adjustment.
  IF v_request.requested_by = v_uid THEN
    RAISE EXCEPTION 'MAKER_CANNOT_APPROVE_OWN_INVENTORY_ADJUSTMENT';
  END IF;

  v_type := CASE WHEN v_request.variance_quantity > 0 THEN 'adjustment_in' ELSE 'adjustment_out' END;
  v_tx := public.post_inventory_transaction_atomic(jsonb_build_object(
    'tenant_company_id', v_request.tenant_company_id,
    'transaction_type', v_type,
    'transaction_date', current_date,
    'from_location_id', CASE WHEN v_type = 'adjustment_out' THEN v_request.location_id ELSE NULL END,
    'to_location_id', CASE WHEN v_type = 'adjustment_in' THEN v_request.location_id ELSE NULL END,
    'source_type', 'inventory_adjustment_request',
    'source_id', v_request.id,
    'reference_no', 'ADJ-' || replace(v_request.id::text, '-', ''),
    'notes', v_request.reason,
    'idempotency_key', v_key,
    'lines', jsonb_build_array(jsonb_build_object(
      'item_id', v_request.item_id,
      'quantity', abs(v_request.variance_quantity),
      'unit_cost', v_request.unit_cost,
      'lot_number', v_request.lot_number,
      'notes', v_request.reason
    ))
  ));
  v_tx_id := (v_tx->>'id')::uuid;

  UPDATE public.inventory_adjustment_requests
  SET status = 'approved', approved_by = v_uid, approved_at = now(),
      approval_notes = v_notes, inventory_transaction_id = v_tx_id, updated_at = now()
  WHERE id = v_request.id;

  RETURN jsonb_build_object(
    'request_id', v_request.id, 'status', 'approved',
    'transaction_id', v_tx_id, 'transaction_no', v_tx->>'transaction_no',
    'idempotent_replay', false
  );
END;
$function$;

COMMIT;
