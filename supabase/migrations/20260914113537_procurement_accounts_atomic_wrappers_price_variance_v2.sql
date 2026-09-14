-- Migration: Procurement -> Accounts Price Variance Enhancements v2
-- Enhances create_purchase_bill_with_accounting_atomic to support Purchase Price Variance (PPV) calculation

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
    v_grni_clearing_amount NUMERIC := 0;
    v_ppv_amount NUMERIC := 0;
    v_tax_amount NUMERIC := 0;
    v_total_amount NUMERIC := 0;
    v_cgst NUMERIC := 0;
    v_sgst NUMERIC := 0;
    v_igst NUMERIC := 0;
    v_ap_acc_id UUID;
    v_grni_acc_id UUID;
    v_exp_acc_id UUID;
    v_ppv_acc_id UUID;
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
    v_grni_clearing_amount := COALESCE((p_header->>'grni_clearing_amount')::NUMERIC, v_subtotal);
    v_ppv_amount := COALESCE((p_header->>'ppv_amount')::NUMERIC, (v_subtotal - v_grni_clearing_amount));

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

    -- Post Purchase Bill Accounting Journal (Dr GRNI/Expense + Dr PPV (if high) + Dr Input GST / Cr Accounts Payable / Cr PPV (if low))
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

        SELECT id INTO v_ppv_acc_id FROM public.chart_of_accounts
        WHERE (tenant_company_id = v_op_co_id OR tenant_id = v_tenant_id)
        AND (control_account_type = 'purchase_price_variance' OR account_subtype = 'ppv' OR account_code IN ('5020', 'QA-5020')) LIMIT 1;

        SELECT id INTO v_cgst_acc_id FROM public.chart_of_accounts
        WHERE (tenant_company_id = v_op_co_id OR tenant_id = v_tenant_id)
        AND (control_account_type = 'input_cgst' OR account_code IN ('1030', 'QA-1030')) LIMIT 1;

        SELECT id INTO v_sgst_acc_id FROM public.chart_of_accounts
        WHERE (tenant_company_id = v_op_co_id OR tenant_id = v_tenant_id)
        AND (control_account_type = 'input_sgst' OR account_code IN ('1040', 'QA-1040')) LIMIT 1;

        SELECT id INTO v_igst_acc_id FROM public.chart_of_accounts
        WHERE (tenant_company_id = v_op_co_id OR tenant_id = v_tenant_id)
        AND (control_account_type = 'input_igst' OR account_code IN ('1050', 'QA-1050')) LIMIT 1;

        -- GRNI Clearing or Expense
        IF v_po_id IS NOT NULL AND v_grni_acc_id IS NOT NULL THEN
            v_lines := v_lines || jsonb_build_array(jsonb_build_object('account_id', v_grni_acc_id, 'debit_amount', v_grni_clearing_amount, 'credit_amount', 0, 'narration', 'Clear GRNI Clearing'));
        ELSIF v_exp_acc_id IS NOT NULL THEN
            v_lines := v_lines || jsonb_build_array(jsonb_build_object('account_id', v_exp_acc_id, 'debit_amount', v_subtotal, 'credit_amount', 0, 'narration', 'Purchase Expense'));
        END IF;

        -- Purchase Price Variance Line (Dr PPV if bill price > GRN price, Cr PPV if bill price < GRN price)
        IF v_ppv_amount > 0 AND v_ppv_acc_id IS NOT NULL THEN
            v_lines := v_lines || jsonb_build_array(jsonb_build_object('account_id', v_ppv_acc_id, 'debit_amount', v_ppv_amount, 'credit_amount', 0, 'narration', 'Purchase Price Variance (Unfavorable)'));
        ELSIF v_ppv_amount < 0 AND v_ppv_acc_id IS NOT NULL THEN
            v_lines := v_lines || jsonb_build_array(jsonb_build_object('account_id', v_ppv_acc_id, 'debit_amount', 0, 'credit_amount', abs(v_ppv_amount), 'narration', 'Purchase Price Variance (Favorable)'));
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
