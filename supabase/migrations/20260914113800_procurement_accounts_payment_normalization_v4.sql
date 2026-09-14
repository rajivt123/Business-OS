-- Migration: Procurement -> Accounts Vendor Payment Normalization v4
-- Normalizes record_purchase_payment_with_accounting_atomic for AP balance checking, over-payment guard, and bank/cash account resolution

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
    v_pmt_acc_id UUID;
    v_payment_mode TEXT;
    v_bank_account_id UUID;
    v_cash_account_id UUID;
    v_bill_balance NUMERIC := 0;
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

    -- Verify Purchase Bill Exists and Check Outstanding Balance
    SELECT COALESCE(balance_due, total_amount - COALESCE(amount_paid, 0)) INTO v_bill_balance
    FROM public.purchase_bills
    WHERE id = v_bill_id AND tenant_company_id = v_op_co_id;

    IF v_bill_balance <= 0 THEN
        RAISE EXCEPTION 'Purchase bill is already fully paid';
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

    -- Resolve Accounts Payable & Bank/Cash Ledger Accounts
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

    -- Post Vendor Payment Double-Entry Journal (Dr Accounts Payable / Cr Bank or Cash)
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
