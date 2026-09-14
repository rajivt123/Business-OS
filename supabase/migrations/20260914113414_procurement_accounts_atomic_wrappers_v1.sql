-- Migration: Procurement -> Accounts Atomic Wrapper RPCs v1
-- Implements single-transaction PostgreSQL wrapper RPCs for GRN, Purchase Bill, and Vendor Payments

CREATE OR REPLACE FUNCTION public.create_goods_received_note_with_accounting_atomic(
    p_header jsonb,
    p_items jsonb
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
    v_po_id UUID;
    v_idempotency_key TEXT;
    v_grn_id UUID;
    v_grn_number TEXT;
    v_item RECORD;
    v_total_grn_val NUMERIC := 0;
    v_line_val NUMERIC;
    v_unit_price NUMERIC;
    v_to_loc_id UUID;
    v_inv_acc_id UUID;
    v_grni_acc_id UUID;
BEGIN
    v_tenant_id := (p_header->>'tenant_id')::UUID;
    v_company_id := (p_header->>'company_id')::UUID;
    v_op_co_id := (p_header->>'operating_company_id')::UUID;
    v_po_id := (p_header->>'purchase_order_id')::UUID;
    v_idempotency_key := p_header->>'idempotency_key';
    v_to_loc_id := (p_header->>'to_location_id')::UUID;

    IF v_tenant_id IS NULL OR v_company_id IS NULL OR v_op_co_id IS NULL OR v_po_id IS NULL OR v_idempotency_key IS NULL OR v_idempotency_key = '' THEN
        RAISE EXCEPTION 'Tenant, company, operating company, purchase order and idempotency key are required';
    END IF;

    -- Check Idempotency
    SELECT id INTO v_grn_id FROM public.goods_received_notes WHERE idempotency_key = v_idempotency_key;
    IF v_grn_id IS NOT NULL THEN
        RETURN jsonb_build_object('success', true, 'grn_id', v_grn_id, 'idempotent', true);
    END IF;

    -- Insert GRN Header
    v_grn_number := COALESCE(p_header->>'grn_number', 'GRN-' || substring(to_hex(extract(epoch from now())::bigint) from 3));
    INSERT INTO public.goods_received_notes (
        tenant_id, company_id, tenant_company_id, purchase_order_id, grn_number,
        grn_date, received_by, status, notes, idempotency_key
    ) VALUES (
        v_tenant_id, v_company_id, v_op_co_id, v_po_id, v_grn_number,
        COALESCE((p_header->>'received_date')::DATE, CURRENT_DATE),
        (p_header->>'received_by')::UUID, 'received', p_header->>'notes', v_idempotency_key
    ) RETURNING id INTO v_grn_id;

    -- Process GRN Items & Valuation (Inventory Receipt Valuation: accepted_qty * PO unit_price)
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
        purchase_order_item_id UUID, item_id UUID, received_quantity NUMERIC,
        accepted_quantity NUMERIC, rejected_quantity NUMERIC, unit_price NUMERIC, notes TEXT
    ) LOOP
        v_unit_price := COALESCE(v_item.unit_price, 0);
        IF v_unit_price = 0 AND v_item.purchase_order_item_id IS NOT NULL THEN
            SELECT unit_price INTO v_unit_price FROM public.purchase_order_items WHERE id = v_item.purchase_order_item_id;
        END IF;

        v_line_val := COALESCE(v_item.accepted_quantity, 0) * COALESCE(v_unit_price, 0);
        v_total_grn_val := v_total_grn_val + v_line_val;

        INSERT INTO public.goods_received_note_items (
            tenant_id, company_id, tenant_company_id, grn_id, purchase_order_item_id,
            item_id, received_quantity, accepted_quantity, rejected_quantity, unit_price, line_total
        ) VALUES (
            v_tenant_id, v_company_id, v_op_co_id, v_grn_id, v_item.purchase_order_item_id,
            v_item.item_id, COALESCE(v_item.received_quantity, 0), COALESCE(v_item.accepted_quantity, 0),
            COALESCE(v_item.rejected_quantity, 0), COALESCE(v_unit_price, 0), v_line_val
        );

        -- Post Inventory Receipt stock movement if to_location_id is provided
        IF v_to_loc_id IS NOT NULL AND v_item.item_id IS NOT NULL AND COALESCE(v_item.accepted_quantity, 0) > 0 THEN
            PERFORM public.post_inventory_transaction_atomic(jsonb_build_object(
                'tenant_id', v_tenant_id,
                'company_id', v_company_id,
                'tenant_company_id', v_op_co_id,
                'item_id', v_item.item_id,
                'to_location_id', v_to_loc_id,
                'transaction_type', 'RECEIPT',
                'quantity', v_item.accepted_quantity,
                'unit_cost', v_unit_price,
                'reference_type', 'GRN',
                'reference_id', v_grn_id,
                'idempotency_key', v_idempotency_key || '-' || COALESCE(v_item.item_id::text, gen_random_uuid()::text)
            ));
        END IF;
    END LOOP;

    -- Post Double-Entry Accounting Journal for GRN (Dr Inventory Asset / Cr GRNI Clearing)
    IF v_total_grn_val > 0 THEN
        SELECT id INTO v_inv_acc_id FROM public.chart_of_accounts
        WHERE (tenant_company_id = v_op_co_id OR tenant_id = v_tenant_id)
        AND (control_account_type = 'inventory_asset' OR account_subtype = 'inventory' OR account_code IN ('1050', 'QA-1050')) LIMIT 1;

        SELECT id INTO v_grni_acc_id FROM public.chart_of_accounts
        WHERE (tenant_company_id = v_op_co_id OR tenant_id = v_tenant_id)
        AND (control_account_type = 'grni_clearing' OR account_subtype = 'grni' OR account_code IN ('2050', 'QA-2050')) LIMIT 1;

        IF v_inv_acc_id IS NOT NULL AND v_grni_acc_id IS NOT NULL THEN
            PERFORM public.post_journal_entry_atomic(jsonb_build_object(
                'tenant_id', v_tenant_id,
                'tenant_company_id', v_op_co_id,
                'voucher_no', v_grn_number,
                'voucher_type', 'GRN_RECEIPT',
                'entry_date', CURRENT_DATE,
                'narration', 'GRN Goods Receipt Valuation (' || v_grn_number || ')',
                'idempotency_key', 'je-' || v_idempotency_key,
                'lines', jsonb_build_array(
                    jsonb_build_object('account_id', v_inv_acc_id, 'debit_amount', v_total_grn_val, 'credit_amount', 0, 'narration', 'Inventory Asset'),
                    jsonb_build_object('account_id', v_grni_acc_id, 'debit_amount', 0, 'credit_amount', v_total_grn_val, 'narration', 'GRNI Clearing')
                )
            ));
        END IF;
    END IF;

    RETURN jsonb_build_object('success', true, 'grn_id', v_grn_id, 'valuation', v_total_grn_val);
END;
$$;

CREATE OR REPLACE FUNCTION public.create_purchase_bill_with_accounting_atomic(
    p_header jsonb,
    p_items jsonb
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
    v_vendor_id UUID;
    v_po_id UUID;
    v_idempotency_key TEXT;
    v_bill_id UUID;
    v_bill_no TEXT;
    v_subtotal NUMERIC := 0;
    v_tax_amount NUMERIC := 0;
    v_total_amount NUMERIC := 0;
    v_cgst NUMERIC := 0;
    v_sgst NUMERIC := 0;
    v_igst NUMERIC := 0;
    v_ap_acc_id UUID;
    v_grni_acc_id UUID;
    v_exp_acc_id UUID;
    v_cgst_acc_id UUID;
    v_sgst_acc_id UUID;
    v_igst_acc_id UUID;
    v_lines JSONB := '[]'::jsonb;
BEGIN
    v_tenant_id := (p_header->>'tenant_id')::UUID;
    v_company_id := (p_header->>'company_id')::UUID;
    v_op_co_id := (p_header->>'operating_company_id')::UUID;
    v_vendor_id := (p_header->>'vendor_id')::UUID;
    v_po_id := (p_header->>'purchase_order_id')::UUID;
    v_idempotency_key := p_header->>'idempotency_key';

    IF v_tenant_id IS NULL OR v_company_id IS NULL OR v_op_co_id IS NULL OR v_vendor_id IS NULL OR v_idempotency_key IS NULL OR v_idempotency_key = '' THEN
        RAISE EXCEPTION 'Tenant, company, operating company, vendor and idempotency key are required';
    END IF;

    -- Check Idempotency
    SELECT id INTO v_bill_id FROM public.purchase_bills WHERE idempotency_key = v_idempotency_key;
    IF v_bill_id IS NOT NULL THEN
        RETURN jsonb_build_object('success', true, 'bill_id', v_bill_id, 'idempotent', true);
    END IF;

    v_subtotal := COALESCE((p_header->>'subtotal')::NUMERIC, 0);
    v_cgst := COALESCE((p_header->>'cgst_amount')::NUMERIC, 0);
    v_sgst := COALESCE((p_header->>'sgst_amount')::NUMERIC, 0);
    v_igst := COALESCE((p_header->>'igst_amount')::NUMERIC, 0);
    v_tax_amount := COALESCE((p_header->>'tax_amount')::NUMERIC, (v_cgst + v_sgst + v_igst));
    v_total_amount := COALESCE((p_header->>'total_amount')::NUMERIC, (v_subtotal + v_tax_amount));
    v_bill_no := COALESCE(p_header->>'vendor_bill_no', 'BILL-' || substring(to_hex(extract(epoch from now())::bigint) from 3));

    INSERT INTO public.purchase_bills (
        tenant_id, company_id, tenant_company_id, vendor_id, purchase_order_id,
        vendor_bill_no, bill_date, due_date, status, subtotal, tax_amount,
        total_amount, amount_paid, balance_due, idempotency_key
    ) VALUES (
        v_tenant_id, v_company_id, v_op_co_id, v_vendor_id, v_po_id,
        v_bill_no, COALESCE((p_header->>'bill_date')::DATE, CURRENT_DATE),
        (p_header->>'due_date')::DATE, 'pending', v_subtotal, v_tax_amount,
        v_total_amount, 0, v_total_amount, v_idempotency_key
    ) RETURNING id INTO v_bill_id;

    -- Insert Bill Items
    INSERT INTO public.purchase_bill_items (
        tenant_id, company_id, tenant_company_id, purchase_bill_id, item_description,
        quantity, unit_price, line_total, item_code
    )
    SELECT v_tenant_id, v_company_id, v_op_co_id, v_bill_id, x.item_description,
           COALESCE(x.quantity, 1), COALESCE(x.unit_price, 0), COALESCE(x.line_total, 0), x.item_code
    FROM jsonb_to_recordset(p_items) AS x(
        item_description TEXT, quantity NUMERIC, unit_price NUMERIC, line_total NUMERIC, item_code TEXT
    );

    -- Post Purchase Bill Accounting Journal
    IF v_total_amount > 0 THEN
        SELECT id INTO v_ap_acc_id FROM public.chart_of_accounts
        WHERE (tenant_company_id = v_op_co_id OR tenant_id = v_tenant_id)
        AND (control_account_type = 'accounts_payable' OR account_subtype = 'payable' OR account_code IN ('2010', 'QA-2010')) LIMIT 1;

        SELECT id INTO v_grni_acc_id FROM public.chart_of_accounts
        WHERE (tenant_company_id = v_op_co_id OR tenant_id = v_tenant_id)
        AND (control_account_type = 'grni_clearing' OR account_subtype = 'grni' OR account_code IN ('2050', 'QA-2050')) LIMIT 1;

        SELECT id INTO v_exp_acc_id FROM public.chart_of_accounts
        WHERE (tenant_company_id = v_op_co_id OR tenant_id = v_tenant_id)
        AND (control_account_type = 'purchase_expense' OR account_subtype = 'purchase' OR account_code IN ('5010', 'QA-5010')) LIMIT 1;

        SELECT id INTO v_cgst_acc_id FROM public.chart_of_accounts
        WHERE (tenant_company_id = v_op_co_id OR tenant_id = v_tenant_id)
        AND (control_account_type = 'input_cgst' OR account_code IN ('1030', 'QA-1030')) LIMIT 1;

        SELECT id INTO v_sgst_acc_id FROM public.chart_of_accounts
        WHERE (tenant_company_id = v_op_co_id OR tenant_id = v_tenant_id)
        AND (control_account_type = 'input_sgst' OR account_code IN ('1040', 'QA-1040')) LIMIT 1;

        SELECT id INTO v_igst_acc_id FROM public.chart_of_accounts
        WHERE (tenant_company_id = v_op_co_id OR tenant_id = v_tenant_id)
        AND (control_account_type = 'input_igst' OR account_code IN ('1050', 'QA-1050')) LIMIT 1;

        IF v_po_id IS NOT NULL AND v_grni_acc_id IS NOT NULL THEN
            v_lines := v_lines || jsonb_build_array(jsonb_build_object('account_id', v_grni_acc_id, 'debit_amount', v_subtotal, 'credit_amount', 0, 'narration', 'Clear GRNI'));
        ELSIF v_exp_acc_id IS NOT NULL THEN
            v_lines := v_lines || jsonb_build_array(jsonb_build_object('account_id', v_exp_acc_id, 'debit_amount', v_subtotal, 'credit_amount', 0, 'narration', 'Purchase Expense'));
        END IF;

        IF v_cgst > 0 AND v_cgst_acc_id IS NOT NULL THEN
            v_lines := v_lines || jsonb_build_array(jsonb_build_object('account_id', v_cgst_acc_id, 'debit_amount', v_cgst, 'credit_amount', 0, 'narration', 'Input CGST'));
        END IF;
        IF v_sgst > 0 AND v_sgst_acc_id IS NOT NULL THEN
            v_lines := v_lines || jsonb_build_array(jsonb_build_object('account_id', v_sgst_acc_id, 'debit_amount', v_sgst, 'credit_amount', 0, 'narration', 'Input SGST'));
        END IF;
        IF v_igst > 0 AND v_igst_acc_id IS NOT NULL THEN
            v_lines := v_lines || jsonb_build_array(jsonb_build_object('account_id', v_igst_acc_id, 'debit_amount', v_igst, 'credit_amount', 0, 'narration', 'Input IGST'));
        END IF;

        IF v_ap_acc_id IS NOT NULL THEN
            v_lines := v_lines || jsonb_build_array(jsonb_build_object('account_id', v_ap_acc_id, 'debit_amount', 0, 'credit_amount', v_total_amount, 'narration', 'Accounts Payable'));
        END IF;

        PERFORM public.post_journal_entry_atomic(jsonb_build_object(
            'tenant_id', v_tenant_id,
            'tenant_company_id', v_op_co_id,
            'voucher_no', v_bill_no,
            'voucher_type', 'PURCHASE_BILL',
            'entry_date', CURRENT_DATE,
            'narration', 'Purchase Bill Recognition (' || v_bill_no || ')',
            'idempotency_key', 'je-' || v_idempotency_key,
            'lines', v_lines
        ));
    END IF;

    RETURN jsonb_build_object('success', true, 'bill_id', v_bill_id, 'total_amount', v_total_amount);
END;
$$;

CREATE OR REPLACE FUNCTION public.record_purchase_payment_with_accounting_atomic(
    p_payment jsonb
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
    v_bill_id UUID;
    v_amount NUMERIC;
    v_idempotency_key TEXT;
    v_payment_id UUID;
    v_ap_acc_id UUID;
    v_bank_acc_id UUID;
    v_cash_acc_id UUID;
    v_pmt_acc_id UUID;
    v_payment_mode TEXT;
    v_bank_account_id UUID;
    v_cash_account_id UUID;
BEGIN
    v_tenant_id := (p_payment->>'tenant_id')::UUID;
    v_company_id := (p_payment->>'company_id')::UUID;
    v_op_co_id := (p_payment->>'operating_company_id')::UUID;
    v_bill_id := (p_payment->>'purchase_bill_id')::UUID;
    v_amount := COALESCE((p_payment->>'amount')::NUMERIC, 0);
    v_idempotency_key := p_payment->>'idempotency_key';
    v_payment_mode := COALESCE(p_payment->>'payment_mode', 'bank_transfer');
    v_bank_account_id := (p_payment->>'bank_account_id')::UUID;
    v_cash_account_id := (p_payment->>'cash_account_id')::UUID;

    IF v_tenant_id IS NULL OR v_company_id IS NULL OR v_bill_id IS NULL OR v_amount <= 0 OR v_idempotency_key IS NULL OR v_idempotency_key = '' THEN
        RAISE EXCEPTION 'Tenant, company, bill, positive amount and idempotency key are required';
    END IF;

    -- Check Idempotency
    SELECT id INTO v_payment_id FROM public.purchase_payments WHERE idempotency_key = v_idempotency_key;
    IF v_payment_id IS NOT NULL THEN
        RETURN jsonb_build_object('success', true, 'payment_id', v_payment_id, 'idempotent', true);
    END IF;

    INSERT INTO public.purchase_payments (
        tenant_id, company_id, tenant_company_id, purchase_bill_id, payment_date,
        amount, payment_mode, reference_number, notes, idempotency_key
    ) VALUES (
        v_tenant_id, v_company_id, v_op_co_id, v_bill_id,
        COALESCE((p_payment->>'payment_date')::DATE, CURRENT_DATE),
        v_amount, v_payment_mode, p_payment->>'reference_number', p_payment->>'notes', v_idempotency_key
    ) RETURNING id INTO v_payment_id;

    -- Update Purchase Bill Balance Due and Status
    UPDATE public.purchase_bills
    SET amount_paid = COALESCE(amount_paid, 0) + v_amount,
        balance_due = GREATEST(0, total_amount - (COALESCE(amount_paid, 0) + v_amount)),
        status = CASE
            WHEN (COALESCE(amount_paid, 0) + v_amount) >= total_amount THEN 'paid'
            ELSE 'partially_paid'
        END
    WHERE id = v_bill_id;

    -- Post Vendor Payment Accounting Journal (Dr Accounts Payable / Cr Bank or Cash)
    SELECT id INTO v_ap_acc_id FROM public.chart_of_accounts
    WHERE (tenant_company_id = v_op_co_id OR tenant_id = v_tenant_id)
    AND (control_account_type = 'accounts_payable' OR account_subtype = 'payable' OR account_code IN ('2010', 'QA-2010')) LIMIT 1;

    IF v_bank_account_id IS NOT NULL THEN
        v_pmt_acc_id := v_bank_account_id;
    ELSIF v_cash_account_id IS NOT NULL THEN
        v_pmt_acc_id := v_cash_account_id;
    ELSE
        SELECT id INTO v_pmt_acc_id FROM public.chart_of_accounts
        WHERE (tenant_company_id = v_op_co_id OR tenant_id = v_tenant_id)
        AND (control_account_type IN ('bank', 'cash') OR account_subtype IN ('bank', 'cash') OR account_code IN ('1020', 'QA-1020')) LIMIT 1;
    END IF;

    IF v_ap_acc_id IS NOT NULL AND v_pmt_acc_id IS NOT NULL THEN
        PERFORM public.post_journal_entry_atomic(jsonb_build_object(
            'tenant_id', v_tenant_id,
            'tenant_company_id', v_op_co_id,
            'voucher_no', 'PAY-' || substring(v_payment_id::text from 1 for 8),
            'voucher_type', 'VENDOR_PAYMENT',
            'entry_date', CURRENT_DATE,
            'narration', 'Vendor Payment against Purchase Bill',
            'idempotency_key', 'je-' || v_idempotency_key,
            'lines', jsonb_build_array(
                jsonb_build_object('account_id', v_ap_acc_id, 'debit_amount', v_amount, 'credit_amount', 0, 'narration', 'Clear Accounts Payable'),
                jsonb_build_object('account_id', v_pmt_acc_id, 'debit_amount', 0, 'credit_amount', v_amount, 'narration', 'Bank/Cash Payment')
            )
        ));
    END IF;

    RETURN jsonb_build_object('success', true, 'payment_id', v_payment_id, 'amount', v_amount);
END;
$$;
