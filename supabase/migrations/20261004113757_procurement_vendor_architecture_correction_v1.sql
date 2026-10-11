
begin;

alter table public.vendors
  alter column company_id drop not null;

create or replace function public.create_vendor_atomic(p_vendor jsonb)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_uid uuid:=auth.uid();
  v_tenant uuid;
  v_tc uuid;
  v_company uuid;
  v_id uuid;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  v_tenant:=(p_vendor->>'tenant_id')::uuid;
  v_tc:=(p_vendor->>'tenant_company_id')::uuid;
  v_company:=null;

  if not private.has_action_permission(v_tenant,'MANAGER')
     or not private.has_company_access(v_tenant,v_tc) then
    raise exception 'Not authorized';
  end if;

  insert into public.vendors(
    tenant_id,tenant_company_id,company_id,vendor_code,vendor_name,legal_name,
    gstin,pan,email,phone,address,payment_terms_days,status,notes,created_by
  )
  values(
    v_tenant,v_tc,v_company,p_vendor->>'vendor_code',p_vendor->>'vendor_name',
    p_vendor->>'legal_name',p_vendor->>'gstin',p_vendor->>'pan',
    p_vendor->>'email',p_vendor->>'phone',p_vendor->>'address',
    coalesce((p_vendor->>'payment_terms_days')::int,0),
    coalesce(p_vendor->>'status','active'),p_vendor->>'notes',v_uid
  )
  returning id into v_id;

  return (select to_jsonb(v) from public.vendors v where v.id=v_id);
end
$function$;

create or replace function public.create_vendor_quotation_atomic(p_header jsonb,p_items jsonb)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_uid uuid:=auth.uid();
  v_tenant uuid; v_tc uuid; v_company uuid; v_rfq uuid; v_vendor uuid; v_id uuid;
  v_item jsonb; v_sub numeric:=0; v_tax numeric:=0; v_total numeric:=0;
  v_taxable numeric; v_rate numeric; v_line numeric; v_cgst numeric; v_sgst numeric; v_igst numeric;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  v_tenant:=(p_header->>'tenant_id')::uuid;
  v_tc:=(p_header->>'tenant_company_id')::uuid;
  v_company:=(p_header->>'company_id')::uuid;
  v_rfq:=(p_header->>'rfq_id')::uuid;
  v_vendor:=(p_header->>'vendor_id')::uuid;

  if not private.has_action_permission(v_tenant,'MANAGER')
     or not private.has_company_access(v_tenant,v_tc) then
    raise exception 'Not authorized';
  end if;

  if not exists(
    select 1 from public.vendors v
    where v.id=v_vendor and v.tenant_id=v_tenant and v.tenant_company_id=v_tc
  ) then raise exception 'Invalid vendor'; end if;

  if not exists(
    select 1 from public.rfqs r
    where r.id=v_rfq and r.tenant_id=v_tenant
      and r.tenant_company_id=v_tc and r.company_id=v_company
  ) then raise exception 'Invalid RFQ'; end if;

  insert into public.vendor_quotations(
    tenant_id,tenant_company_id,company_id,rfq_id,vendor_id,quotation_no,
    quotation_date,valid_until,status,currency_code,created_by
  )
  values(
    v_tenant,v_tc,v_company,v_rfq,v_vendor,p_header->>'quotation_no',
    (p_header->>'quotation_date')::date,(p_header->>'valid_until')::date,
    'received',coalesce(p_header->>'currency_code','INR'),v_uid
  )
  returning id into v_id;

  for v_item in select * from jsonb_array_elements(coalesce(p_items,'[]'::jsonb)) loop
    v_taxable:=(v_item->>'quantity')::numeric*(v_item->>'unit_price')::numeric;
    v_rate:=coalesce((v_item->>'tax_rate')::numeric,0);
    v_cgst:=coalesce((v_item->>'cgst_amount')::numeric,v_taxable*v_rate/200);
    v_sgst:=coalesce((v_item->>'sgst_amount')::numeric,v_taxable*v_rate/200);
    v_igst:=coalesce((v_item->>'igst_amount')::numeric,0);
    v_line:=v_taxable+v_cgst+v_sgst+v_igst;
    v_sub:=v_sub+v_taxable; v_tax:=v_tax+v_cgst+v_sgst+v_igst; v_total:=v_total+v_line;

    insert into public.vendor_quotation_items(
      tenant_id,tenant_company_id,vendor_quotation_id,description,item_code,
      quantity,unit,unit_price,taxable_amount,tax_rate,cgst_amount,sgst_amount,igst_amount,line_total,notes
    )
    values(
      v_tenant,v_tc,v_id,v_item->>'description',v_item->>'item_code',
      (v_item->>'quantity')::numeric,v_item->>'unit',(v_item->>'unit_price')::numeric,
      v_taxable,v_rate,v_cgst,v_sgst,v_igst,v_line,v_item->>'notes'
    );
  end loop;

  update public.vendor_quotations
  set subtotal=v_sub,tax_amount=v_tax,total_amount=v_total,notes=p_header->>'notes',updated_at=now()
  where id=v_id;

  return jsonb_build_object(
    'quotation',(select to_jsonb(x) from public.vendor_quotations x where x.id=v_id),
    'items',(select coalesce(jsonb_agg(to_jsonb(i)),'[]'::jsonb)
             from public.vendor_quotation_items i where i.vendor_quotation_id=v_id)
  );
end
$function$;

create or replace function public.create_purchase_order_atomic(p_header jsonb,p_items jsonb)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_uid uuid:=auth.uid();
  v_tenant uuid; v_tc uuid; v_company uuid; v_vendor uuid; v_id uuid; v_no text;
  v_item jsonb; v_sub numeric:=0; v_tax numeric:=0; v_total numeric:=0;
  v_taxable numeric; v_rate numeric; v_cgst numeric; v_sgst numeric; v_igst numeric; v_line numeric;
  v_fy text:=to_char(coalesce((p_header->>'po_date')::date,current_date),'YYYY');
  v_boq_line public.master_boq_lines%rowtype; v_existing_qty numeric; v_requested_qty numeric; v_uom text;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  v_tenant:=(p_header->>'tenant_id')::uuid; v_tc:=(p_header->>'tenant_company_id')::uuid;
  v_company:=(p_header->>'company_id')::uuid; v_vendor:=(p_header->>'vendor_id')::uuid;

  if not private.has_action_permission(v_tenant,'MANAGER')
     or not private.has_company_access(v_tenant,v_tc) then
    raise exception 'Not authorized';
  end if;

  if not exists(select 1 from public.companies c
    where c.id=v_company and c.tenant_id=v_tenant and c.tenant_company_id=v_tc)
  then raise exception 'Invalid company'; end if;

  if not exists(select 1 from public.vendors v
    where v.id=v_vendor and v.tenant_id=v_tenant
      and v.tenant_company_id=v_tc and v.status='active')
  then raise exception 'Invalid or inactive vendor'; end if;

  v_no:=private.get_next_purchase_doc_number(v_tenant,v_tc,'PO',v_fy);

  insert into public.purchase_orders(
    tenant_id,tenant_company_id,company_id,po_no,po_date,vendor_id,
    purchase_request_id,rfq_id,vendor_quotation_id,work_id,status,currency_code,
    expected_delivery_date,payment_terms_days,vendor_gstin,place_of_supply,reverse_charge,created_by
  ) values(
    v_tenant,v_tc,v_company,v_no,coalesce((p_header->>'po_date')::date,current_date),v_vendor,
    (p_header->>'purchase_request_id')::uuid,(p_header->>'rfq_id')::uuid,
    (p_header->>'vendor_quotation_id')::uuid,(p_header->>'work_id')::uuid,'draft',
    coalesce(p_header->>'currency_code','INR'),(p_header->>'expected_delivery_date')::date,
    coalesce((p_header->>'payment_terms_days')::int,0),p_header->>'vendor_gstin',
    p_header->>'place_of_supply',coalesce((p_header->>'reverse_charge')::boolean,false),v_uid
  ) returning id into v_id;

  for v_item in select * from jsonb_array_elements(coalesce(p_items,'[]'::jsonb)) loop
    v_requested_qty:=coalesce((v_item->>'quantity')::numeric,0);
    if v_requested_qty <= 0 then raise exception 'PO quantity must be greater than zero'; end if;

    if nullif(v_item->>'master_boq_line_id','') is not null then
      if not (v_item->>'master_boq_line_id')::text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then raise exception 'Invalid master_boq_line_id'; end if;

      select * into v_boq_line from public.master_boq_lines
      where id=(v_item->>'master_boq_line_id')::uuid
        and tenant_id=v_tenant and tenant_company_id=v_tc for update;

      if not found then raise exception 'Master BOQ line not found or outside company scope'; end if;
      if v_boq_line.match_status not in ('verified','matched') or v_boq_line.inventory_item_id is null
      then raise exception 'Master BOQ line % is not resolved to a Master Item',v_boq_line.line_no; end if;
      if v_boq_line.line_type <> 'ITEM'
      then raise exception 'Master BOQ line % is not a purchasable item',v_boq_line.line_no; end if;
      if v_boq_line.procurement_scope = 'INSTALLATION'
      then raise exception 'Master BOQ line % is installation-only',v_boq_line.line_no; end if;

      if not exists(select 1 from public.master_boqs b
        where b.id=v_boq_line.master_boq_id and b.tenant_id=v_tenant
          and b.tenant_company_id=v_tc and b.status='approved' and b.is_current=true)
      then raise exception 'Master BOQ line % does not belong to the current approved Master BOQ',v_boq_line.line_no; end if;

      v_uom:=upper(trim(coalesce(v_item->>'unit',v_boq_line.supply_uom_code,v_boq_line.uom_code,'')));
      if v_boq_line.supply_uom_code is not null and v_uom <> upper(trim(v_boq_line.supply_uom_code))
      then raise exception 'PO UOM % does not match Master BOQ UOM % for line %',v_uom,v_boq_line.supply_uom_code,v_boq_line.line_no; end if;

      select coalesce(sum(poi.quantity),0) into v_existing_qty
      from public.purchase_order_items poi
      join public.purchase_orders po on po.id=poi.purchase_order_id
      where poi.master_boq_line_id=v_boq_line.id
        and po.tenant_id=v_tenant and po.tenant_company_id=v_tc
        and po.status not in ('cancelled','rejected','void');

      if v_existing_qty + v_requested_qty > v_boq_line.quantity + 0.000001
      then raise exception 'PO quantity exceeds Master BOQ balance for line %: approved %, already committed %, requested %, remaining %',
        v_boq_line.line_no,v_boq_line.quantity,v_existing_qty,v_requested_qty,
        greatest(v_boq_line.quantity-v_existing_qty,0); end if;
    end if;

    v_taxable:=v_requested_qty*(v_item->>'unit_price')::numeric;
    v_rate:=coalesce((v_item->>'tax_rate')::numeric,0);
    v_cgst:=coalesce((v_item->>'cgst_amount')::numeric,v_taxable*v_rate/200);
    v_sgst:=coalesce((v_item->>'sgst_amount')::numeric,v_taxable*v_rate/200);
    v_igst:=coalesce((v_item->>'igst_amount')::numeric,0);
    v_line:=v_taxable+v_cgst+v_sgst+v_igst;
    v_sub:=v_sub+v_taxable; v_tax:=v_tax+v_cgst+v_sgst+v_igst; v_total:=v_total+v_line;

    insert into public.purchase_order_items(
      tenant_id,tenant_company_id,purchase_order_id,description,item_code,quantity,unit,
      unit_price,taxable_amount,tax_rate,cgst_amount,sgst_amount,igst_amount,line_total,
      notes,inventory_item_id,master_boq_line_id
    ) values(
      v_tenant,v_tc,v_id,v_item->>'description',v_item->>'item_code',v_requested_qty,v_item->>'unit',
      (v_item->>'unit_price')::numeric,v_taxable,v_rate,v_cgst,v_sgst,v_igst,v_line,v_item->>'notes',
      nullif(v_item->>'inventory_item_id','')::uuid,nullif(v_item->>'master_boq_line_id','')::uuid
    );
  end loop;

  update public.purchase_orders set
    subtotal=v_sub,
    cgst_amount=(select coalesce(sum(cgst_amount),0) from public.purchase_order_items where purchase_order_id=v_id),
    sgst_amount=(select coalesce(sum(sgst_amount),0) from public.purchase_order_items where purchase_order_id=v_id),
    igst_amount=(select coalesce(sum(igst_amount),0) from public.purchase_order_items where purchase_order_id=v_id),
    tax_amount=v_tax,total_amount=v_total,
    terms_and_conditions=p_header->>'terms_and_conditions',notes=p_header->>'notes',updated_at=now()
  where id=v_id;

  return jsonb_build_object(
    'order',(select to_jsonb(x) from public.purchase_orders x where x.id=v_id),
    'items',(select coalesce(jsonb_agg(to_jsonb(i)),'[]'::jsonb) from public.purchase_order_items i where i.purchase_order_id=v_id)
  );
exception when others then raise;
end
$function$;

create or replace function public.create_purchase_bill_atomic(p_header jsonb,p_items jsonb)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_uid uuid:=auth.uid(); v_tenant uuid; v_tc uuid; v_company uuid; v_vendor uuid;
  v_po uuid; v_grn uuid; v_id uuid; v_no text; v_item jsonb; v_sub numeric:=0;
  v_tax numeric:=0; v_total numeric:=0; v_taxable numeric; v_rate numeric;
  v_cgst numeric; v_sgst numeric; v_igst numeric; v_line numeric;
  v_fy text:=to_char(coalesce((p_header->>'bill_date')::date,current_date),'YYYY');
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  v_tenant:=(p_header->>'tenant_id')::uuid; v_tc:=(p_header->>'tenant_company_id')::uuid;
  v_company:=(p_header->>'company_id')::uuid; v_vendor:=(p_header->>'vendor_id')::uuid;
  v_po:=(p_header->>'purchase_order_id')::uuid; v_grn:=(p_header->>'grn_id')::uuid;

  if not private.has_action_permission(v_tenant,'MANAGER')
     or not private.has_company_access(v_tenant,v_tc) then raise exception 'Not authorized'; end if;

  if not exists(select 1 from public.companies c
    where c.id=v_company and c.tenant_id=v_tenant and c.tenant_company_id=v_tc)
  then raise exception 'Invalid company'; end if;

  if not exists(select 1 from public.vendors v
    where v.id=v_vendor and v.tenant_id=v_tenant and v.tenant_company_id=v_tc)
  then raise exception 'Invalid vendor'; end if;

  if v_po is not null and not exists(select 1 from public.purchase_orders p
    where p.id=v_po and p.tenant_id=v_tenant and p.tenant_company_id=v_tc
      and p.company_id=v_company and p.vendor_id=v_vendor)
  then raise exception 'Invalid purchase order linkage'; end if;

  if v_grn is not null and not exists(select 1 from public.goods_received_notes g
    where g.id=v_grn and g.tenant_id=v_tenant and g.tenant_company_id=v_tc
      and g.company_id=v_company and g.vendor_id=v_vendor
      and (v_po is null or g.purchase_order_id=v_po))
  then raise exception 'Invalid GRN linkage'; end if;

  v_no:=private.get_next_purchase_doc_number(v_tenant,v_tc,'PB',v_fy);

  insert into public.purchase_bills(
    tenant_id,tenant_company_id,company_id,bill_no,vendor_invoice_no,bill_date,due_date,
    vendor_id,purchase_order_id,grn_id,work_id,status,currency_code,vendor_gstin,
    reverse_charge,created_by
  ) values(
    v_tenant,v_tc,v_company,v_no,p_header->>'vendor_invoice_no',
    coalesce((p_header->>'bill_date')::date,current_date),(p_header->>'due_date')::date,
    v_vendor,v_po,v_grn,(p_header->>'work_id')::uuid,'verified',
    coalesce(p_header->>'currency_code','INR'),p_header->>'vendor_gstin',
    coalesce((p_header->>'reverse_charge')::boolean,false),v_uid
  ) returning id into v_id;

  for v_item in select * from jsonb_array_elements(coalesce(p_items,'[]'::jsonb)) loop
    v_taxable:=(v_item->>'quantity')::numeric*(v_item->>'unit_price')::numeric;
    v_rate:=coalesce((v_item->>'tax_rate')::numeric,0);
    v_cgst:=coalesce((v_item->>'cgst_amount')::numeric,v_taxable*v_rate/200);
    v_sgst:=coalesce((v_item->>'sgst_amount')::numeric,v_taxable*v_rate/200);
    v_igst:=coalesce((v_item->>'igst_amount')::numeric,0);
    v_line:=v_taxable+v_cgst+v_sgst+v_igst;
    v_sub:=v_sub+v_taxable; v_tax:=v_tax+v_cgst+v_sgst+v_igst; v_total:=v_total+v_line;

    insert into public.purchase_bill_items(
      tenant_id,tenant_company_id,purchase_bill_id,description,item_code,quantity,unit,
      unit_price,taxable_amount,tax_rate,cgst_amount,sgst_amount,igst_amount,line_total,notes
    ) values(
      v_tenant,v_tc,v_id,v_item->>'description',v_item->>'item_code',(v_item->>'quantity')::numeric,
      v_item->>'unit',(v_item->>'unit_price')::numeric,v_taxable,v_rate,v_cgst,v_sgst,v_igst,v_line,v_item->>'notes'
    );
  end loop;

  update public.purchase_bills set
    subtotal=v_sub,
    cgst_amount=(select coalesce(sum(cgst_amount),0) from public.purchase_bill_items where purchase_bill_id=v_id),
    sgst_amount=(select coalesce(sum(sgst_amount),0) from public.purchase_bill_items where purchase_bill_id=v_id),
    igst_amount=(select coalesce(sum(igst_amount),0) from public.purchase_bill_items where purchase_bill_id=v_id),
    tax_amount=v_tax,total_amount=v_total,balance_due=v_total,
    notes=p_header->>'notes',updated_at=now()
  where id=v_id;

  return jsonb_build_object(
    'bill',(select to_jsonb(x) from public.purchase_bills x where x.id=v_id),
    'items',(select coalesce(jsonb_agg(to_jsonb(i)),'[]'::jsonb) from public.purchase_bill_items i where i.purchase_bill_id=v_id)
  );
end
$function$;

commit;
