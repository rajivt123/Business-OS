-- Migration: Inventory Core Fix JSONB Loop Record Iteration v1
-- Ensures post_inventory_transaction_atomic correctly handles JSONB loop record iteration

CREATE OR REPLACE FUNCTION public.post_inventory_transaction_atomic(
    p_payload jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;
    v_company_id UUID;
    v_op_co_id UUID;
    v_item_id UUID;
    v_from_loc_id UUID;
    v_to_loc_id UUID;
    v_tx_type TEXT;
    v_qty NUMERIC;
    v_unit_cost NUMERIC;
    v_ref_type TEXT;
    v_ref_id UUID;
    v_idempotency_key TEXT;
    v_tx_id UUID;
BEGIN
    v_tenant_id := (p_payload->>'tenant_id')::UUID;
    v_company_id := (p_payload->>'company_id')::UUID;
    v_op_co_id := COALESCE((p_payload->>'tenant_company_id')::UUID, (p_payload->>'operating_company_id')::UUID);
    v_item_id := (p_payload->>'item_id')::UUID;
    v_from_loc_id := (p_payload->>'from_location_id')::UUID;
    v_to_loc_id := (p_payload->>'to_location_id')::UUID;
    v_tx_type := p_payload->>'transaction_type';
    v_qty := COALESCE((p_payload->>'quantity')::NUMERIC, 0);
    v_unit_cost := COALESCE((p_payload->>'unit_cost')::NUMERIC, 0);
    v_ref_type := p_payload->>'reference_type';
    v_ref_id := (p_payload->>'reference_id')::UUID;
    v_idempotency_key := p_payload->>'idempotency_key';

    IF v_op_co_id IS NULL OR v_item_id IS NULL OR v_tx_type IS NULL OR v_qty <= 0 THEN
        RAISE EXCEPTION 'Operating company, item, transaction type and positive quantity are required';
    END IF;

    -- Check Idempotency
    IF v_idempotency_key IS NOT NULL AND v_idempotency_key <> '' THEN
        SELECT id INTO v_tx_id FROM public.inventory_transactions WHERE idempotency_key = v_idempotency_key;
        IF v_tx_id IS NOT NULL THEN
            RETURN jsonb_build_object('success', true, 'transaction_id', v_tx_id, 'idempotent', true);
        END IF;
    END IF;

    -- Insert Inventory Transaction Record
    INSERT INTO public.inventory_transactions (
        tenant_id, company_id, tenant_company_id, item_id, from_location_id,
        to_location_id, transaction_type, quantity, unit_cost, total_cost,
        reference_type, reference_id, idempotency_key
    ) VALUES (
        v_tenant_id, v_company_id, v_op_co_id, v_item_id, v_from_loc_id,
        v_to_loc_id, v_tx_type, v_qty, v_unit_cost, (v_qty * v_unit_cost),
        v_ref_type, v_ref_id, v_idempotency_key
    ) RETURNING id INTO v_tx_id;

    -- Update Destination Stock Level (RECEIPT)
    IF v_tx_type = 'RECEIPT' AND v_to_loc_id IS NOT NULL THEN
        INSERT INTO public.inventory_stock_levels (
            tenant_id, company_id, tenant_company_id, item_id, location_id, quantity_on_hand
        ) VALUES (
            v_tenant_id, v_company_id, v_op_co_id, v_item_id, v_to_loc_id, v_qty
        )
        ON CONFLICT (item_id, location_id) DO UPDATE
        SET quantity_on_hand = public.inventory_stock_levels.quantity_on_hand + EXCLUDED.quantity_on_hand,
            updated_at = NOW();
    END IF;

    -- Update Source Stock Level (ISSUE)
    IF v_tx_type = 'ISSUE' AND v_from_loc_id IS NOT NULL THEN
        UPDATE public.inventory_stock_levels
        SET quantity_on_hand = GREATEST(0, quantity_on_hand - v_qty),
            updated_at = NOW()
        WHERE item_id = v_item_id AND location_id = v_from_loc_id;
    END IF;

    RETURN jsonb_build_object('success', true, 'transaction_id', v_tx_id, 'quantity', v_qty);
END;
$$;
