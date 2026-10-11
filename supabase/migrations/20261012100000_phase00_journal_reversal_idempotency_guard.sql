-- Phase 00: make journal-reversal idempotency keys request-specific.
-- Source-only until validated against an isolated Supabase-compatible database.
-- Never apply this migration manually to production.
CREATE OR REPLACE FUNCTION public.reverse_journal_entry_atomic(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_tenant uuid := nullif(p_payload->>'tenant_id','')::uuid;
  v_company uuid := nullif(p_payload->>'tenant_company_id','')::uuid;
  v_original uuid := nullif(p_payload->>'journal_entry_id','')::uuid;
  v_reverse_date date := coalesce(nullif(p_payload->>'reversal_date','')::date,current_date);
  v_idem text := nullif(trim(p_payload->>'idempotency_key'),'');
  v_period uuid;
  v_reversal uuid;
  v_existing public.accounting_journal_entries%ROWTYPE;
  v_status text;
  v_original_reversal uuid;
  v_original_voucher text;
  v_expected_narration text;
  v_voucher text;
  v_line record;
  v_line_no integer := 0;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501';
  END IF;
  IF v_tenant IS NULL OR v_company IS NULL OR v_original IS NULL OR v_idem IS NULL THEN
    RAISE EXCEPTION 'Tenant, company, journal entry and idempotency key are required';
  END IF;
  IF NOT private.has_action_permission(v_tenant,'MANAGER')
     OR NOT private.has_company_access(v_tenant,v_company) THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501';
  END IF;

  -- Resolve the source voucher first so default narration is stable for retries.
  SELECT voucher_number INTO v_original_voucher
  FROM public.accounting_journal_entries
  WHERE id=v_original AND tenant_id=v_tenant AND tenant_company_id=v_company;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Journal entry not found';
  END IF;
  v_expected_narration := coalesce(
    nullif(trim(p_payload->>'narration'),''),
    nullif(trim(p_payload->>'reversal_reason'),''),
    'Reversal of '||v_original_voucher
  );

  SELECT * INTO v_existing
  FROM public.accounting_journal_entries
  WHERE tenant_company_id=v_company AND idempotency_key=v_idem;

  IF FOUND THEN
    IF v_existing.reversal_of_entry_id IS DISTINCT FROM v_original
       OR v_existing.source_type IS DISTINCT FROM 'journal_reversal'
       OR v_existing.entry_date IS DISTINCT FROM v_reverse_date
       OR (p_payload ? 'narration' AND v_existing.narration IS DISTINCT FROM v_expected_narration)
       OR (p_payload ? 'reversal_reason' AND v_existing.narration IS DISTINCT FROM v_expected_narration) THEN
      RAISE EXCEPTION 'IDEMPOTENCY_KEY_REUSED: key already belongs to a different reversal request'
        USING ERRCODE='22023';
    END IF;
    RETURN jsonb_build_object('id',v_existing.id,'reversal_of_entry_id',v_original,
      'status',v_existing.status,'idempotent',true);
  END IF;

  SELECT status,reversal_of_entry_id INTO v_status,v_original_reversal
  FROM public.accounting_journal_entries
  WHERE id=v_original AND tenant_id=v_tenant AND tenant_company_id=v_company
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Journal entry not found'; END IF;
  IF v_original_reversal IS NOT NULL THEN RAISE EXCEPTION 'A reversal entry cannot itself be reversed'; END IF;
  IF v_status <> 'posted' THEN RAISE EXCEPTION 'Only a posted journal entry can be reversed'; END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_original::text,0));

  -- Re-check after acquiring the source-entry lock to handle concurrent same-key calls.
  SELECT * INTO v_existing
  FROM public.accounting_journal_entries
  WHERE tenant_company_id=v_company AND idempotency_key=v_idem;
  IF FOUND THEN
    IF v_existing.reversal_of_entry_id IS DISTINCT FROM v_original
       OR v_existing.source_type IS DISTINCT FROM 'journal_reversal'
       OR v_existing.entry_date IS DISTINCT FROM v_reverse_date
       OR v_existing.narration IS DISTINCT FROM v_expected_narration THEN
      RAISE EXCEPTION 'IDEMPOTENCY_KEY_REUSED: key already belongs to a different reversal request'
        USING ERRCODE='22023';
    END IF;
    RETURN jsonb_build_object('id',v_existing.id,'reversal_of_entry_id',v_original,
      'status',v_existing.status,'idempotent',true);
  END IF;

  SELECT id INTO v_period FROM public.accounting_fiscal_periods
  WHERE tenant_id=v_tenant AND tenant_company_id=v_company
    AND v_reverse_date BETWEEN period_start AND period_end AND status='open'
  LIMIT 1;
  IF v_period IS NULL THEN RAISE EXCEPTION 'No open fiscal period for reversal date'; END IF;

  v_voucher := coalesce(nullif(trim(p_payload->>'voucher_number'),''),'REV-'||to_char(clock_timestamp(),'YYYYMMDDHH24MISSMS'));

  INSERT INTO public.accounting_journal_entries(
    tenant_id,tenant_company_id,fiscal_period_id,voucher_number,voucher_type,entry_date,narration,
    source_type,source_id,status,reversal_of_entry_id,idempotency_key,request_hash,created_by
  )
  SELECT tenant_id,tenant_company_id,v_period,v_voucher,'REVERSAL',v_reverse_date,
    v_expected_narration,'journal_reversal',id,'posted',id,v_idem,
    md5(jsonb_build_object('original_entry_id',id,'reversal_date',v_reverse_date,
      'narration',v_expected_narration,'voucher_number',v_voucher)::text),v_uid
  FROM public.accounting_journal_entries WHERE id=v_original
  RETURNING id INTO v_reversal;

  FOR v_line IN
    SELECT account_id,line_no,description,debit,credit,party_type,party_id,project_id
    FROM public.accounting_journal_lines WHERE journal_entry_id=v_original ORDER BY line_no
  LOOP
    v_line_no := v_line_no + 1;
    INSERT INTO public.accounting_journal_lines(
      journal_entry_id,account_id,line_no,description,debit,credit,party_type,party_id,project_id
    ) VALUES (
      v_reversal,v_line.account_id,v_line_no,
      coalesce(v_line.description,'')||' (Reversal)',v_line.credit,v_line.debit,
      v_line.party_type,v_line.party_id,v_line.project_id
    );
  END LOOP;

  IF v_line_no < 2 THEN RAISE EXCEPTION 'Original journal has insufficient lines to reverse'; END IF;
  UPDATE public.accounting_journal_entries SET status='reversed' WHERE id=v_original;
  RETURN jsonb_build_object('id',v_reversal,'reversal_of_entry_id',v_original,'status','posted','idempotent',false);
EXCEPTION WHEN unique_violation THEN
  SELECT * INTO v_existing
  FROM public.accounting_journal_entries
  WHERE tenant_company_id=v_company AND idempotency_key=v_idem;
  IF FOUND THEN
    IF v_existing.reversal_of_entry_id IS DISTINCT FROM v_original
       OR v_existing.source_type IS DISTINCT FROM 'journal_reversal'
       OR v_existing.entry_date IS DISTINCT FROM v_reverse_date
       OR v_existing.narration IS DISTINCT FROM v_expected_narration THEN
      RAISE EXCEPTION 'IDEMPOTENCY_KEY_REUSED: key already belongs to a different reversal request'
        USING ERRCODE='22023';
    END IF;
    RETURN jsonb_build_object('id',v_existing.id,'reversal_of_entry_id',v_original,
      'status',v_existing.status,'idempotent',true);
  END IF;
  RAISE;
END;
$function$;

REVOKE ALL ON FUNCTION public.reverse_journal_entry_atomic(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reverse_journal_entry_atomic(jsonb) TO authenticated, service_role;
