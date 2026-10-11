-- Restrict Form 16 preparation to payroll managers or the linked employee.
-- Source-only until role/employee integration tests and payroll workflow review pass.
-- Do not apply directly to production as part of this PR.
BEGIN;

CREATE OR REPLACE FUNCTION public.generate_payroll_form16_preparation_atomic(
  p_employee_id uuid,
  p_tax_year text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_emp public.employees%ROWTYPE;
  v_company uuid;
  v_tenant uuid;
  v_start date;
  v_end date;
  v_gross numeric(18,2);
  v_tds numeric(18,2);
  v_ded numeric(18,2);
  v_prev numeric(18,2) := 0;
  v_prev_tds numeric(18,2) := 0;
  v_other numeric(18,2) := 0;
  v_cert public.payroll_tax_certificates%ROWTYPE;
  v_html text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING errcode = '42501';
  END IF;
  IF p_tax_year !~ '^[0-9]{4}-[0-9]{2}$' THEN
    RAISE EXCEPTION 'Tax year must be YYYY-YY';
  END IF;

  v_start := to_date(left(p_tax_year,4) || '-04-01','YYYY-MM-DD');
  v_end := to_date((left(p_tax_year,4)::integer + 1)::text || '-03-31','YYYY-MM-DD');

  SELECT * INTO v_emp FROM public.employees WHERE id = p_employee_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'EMPLOYEE_NOT_FOUND'; END IF;
  v_tenant := v_emp.tenant_id;
  v_company := v_emp.tenant_company_id;

  -- Sensitive salary/tax data is available only to a manager with company access
  -- or to the employee linked to this authenticated user. Company membership
  -- alone must not allow TEAM/VIEWER users to generate another employee's tax data.
  IF v_emp.linked_user_id IS DISTINCT FROM v_uid
     AND (
       NOT private.has_company_access(v_tenant, v_company)
       OR NOT private.has_action_permission(v_tenant, 'MANAGER')
     ) THEN
    RAISE EXCEPTION 'Not authorized' USING errcode = '42501';
  END IF;

  SELECT
    coalesce(sum(ri.gross_earnings),0),
    coalesce(sum(CASE WHEN upper(c.code) = 'TDS' THEN rc.amount ELSE 0 END),0),
    coalesce(sum(ri.total_deductions),0)
  INTO v_gross, v_tds, v_ded
  FROM public.payroll_runs r
  JOIN public.payroll_periods pp ON pp.id = r.payroll_period_id
  JOIN public.payroll_run_items ri ON ri.payroll_run_id = r.id
  LEFT JOIN public.payroll_run_item_components rc ON rc.payroll_run_item_id = ri.id
  LEFT JOIN public.payroll_components c ON c.id = rc.payroll_component_id
  WHERE r.tenant_id = v_tenant AND r.tenant_company_id = v_company
    AND ri.employee_id = v_emp.id
    AND pp.period_end BETWEEN v_start AND v_end
    AND r.status IN ('posted','paid');

  SELECT
    coalesce(td.previous_employer_income,0),
    coalesce(td.previous_employer_tds,0),
    coalesce(td.other_income,0)
  INTO v_prev, v_prev_tds, v_other
  FROM public.payroll_tax_declarations td
  WHERE td.tenant_id = v_tenant AND td.tenant_company_id = v_company
    AND td.employee_id = v_emp.id AND td.tax_year = p_tax_year
  ORDER BY td.updated_at DESC LIMIT 1;

  v_gross := round(v_gross,2);
  v_tds := round(v_tds,2);
  v_ded := round(v_ded,2);
  v_prev := round(v_prev,2);
  v_prev_tds := round(v_prev_tds,2);
  v_other := round(v_other,2);

  INSERT INTO public.payroll_tax_certificates(
    tenant_id,tenant_company_id,employee_id,tax_year,status,gross_salary,
    taxable_salary,total_deductions,tds_deducted,previous_employer_income,
    previous_employer_tds,other_income,declaration_snapshot,generated_by
  )
  VALUES (
    v_tenant,v_company,v_emp.id,p_tax_year,'prepared',v_gross,
    greatest(v_gross-v_ded,0),v_ded,v_tds,v_prev,v_prev_tds,v_other,
    jsonb_build_object(
      'period_start',v_start,'period_end',v_end,
      'previous_employer_tds_included',v_prev_tds,
      'other_income_included',v_other,
      'note','Preparation data only; official Form 16 certificate issuance remains subject to employer TDS reconciliation and prescribed reporting.'
    ),v_uid
  )
  ON CONFLICT(tenant_company_id,employee_id,tax_year) DO UPDATE
  SET status='prepared',gross_salary=excluded.gross_salary,
      taxable_salary=excluded.taxable_salary,total_deductions=excluded.total_deductions,
      tds_deducted=excluded.tds_deducted,
      previous_employer_income=excluded.previous_employer_income,
      previous_employer_tds=excluded.previous_employer_tds,
      other_income=excluded.other_income,
      declaration_snapshot=excluded.declaration_snapshot,
      generated_at=now(),generated_by=excluded.generated_by
  RETURNING * INTO v_cert;

  v_html := '<!doctype html><html><head><meta charset="utf-8"><title>Form 16 Preparation Statement</title><style>body{font-family:Arial,sans-serif;margin:40px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:8px}</style></head><body><h1>Form 16 Preparation Statement</h1><p><b>Employee:</b> '
    || replace(replace(replace(coalesce(v_emp.display_name,v_emp.first_name),'&','&amp;'),'<','&lt;'),'>','&gt;')
    || ' (' || replace(v_emp.employee_code,'&','&amp;') || ')</p><p><b>Tax Year:</b> ' || p_tax_year
    || '</p><table><tr><th>Particular</th><th>Amount (INR)</th></tr><tr><td>Salary / Gross Earnings</td><td>'
    || to_char(v_gross,'FM9999999990.00') || '</td></tr><tr><td>Total Payroll Deductions</td><td>'
    || to_char(v_ded,'FM9999999990.00') || '</td></tr><tr><td>Taxable Salary Working</td><td>'
    || to_char(greatest(v_gross-v_ded,0),'FM9999999990.00') || '</td></tr><tr><td>Previous Employer Income</td><td>'
    || to_char(v_prev,'FM9999999990.00') || '</td></tr><tr><td>Previous Employer TDS</td><td>'
    || to_char(v_prev_tds,'FM9999999990.00') || '</td></tr><tr><td>Other Income Declared</td><td>'
    || to_char(v_other,'FM9999999990.00') || '</td></tr><tr><td>TDS Deducted by Current Employer</td><td>'
    || to_char(v_tds,'FM9999999990.00') || '</td></tr></table><p style="margin-top:30px;font-size:12px">Preparation statement generated by Business OS. This is not the official Form 16 certificate until employer TDS records and prescribed reporting are reconciled and the certificate is formally issued.</p></body></html>';

  RETURN jsonb_build_object(
    'id',v_cert.id,'status',v_cert.status,'employee_id',v_emp.id,
    'tax_year',p_tax_year,
    'file_name','Form16-Preparation-' || v_emp.employee_code || '-' || p_tax_year || '.html',
    'mime_type','text/html','content',v_html,'gross_salary',v_gross,
    'taxable_salary',greatest(v_gross-v_ded,0),'tds_deducted',v_tds
  );
END;
$function$;

COMMIT;
