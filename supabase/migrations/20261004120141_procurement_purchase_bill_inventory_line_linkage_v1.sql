
begin;

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
      unit_price,taxable_amount,tax_rate,cgst_amount,sgst_amount,igst_amount,line_total,notes,
      inventory_item_id,purchase_order_item_id,goods_received_note_item_id
    ) values(
      v_tenant,v_tc,v_id,v_item->>'description',v_item->>'item_code',(v_item->>'quantity')::numeric,
      coalesce(v_item->>'unit','NOS'),(v_item->>'unit_price')::numeric,v_taxable,v_rate,v_cgst,v_sgst,v_igst,v_line,v_item->>'notes',
      nullif(v_item->>'inventory_item_id','')::uuid,
      nullif(v_item->>'purchase_order_item_id','')::uuid,
      nullif(v_item->>'goods_received_note_item_id','')::uuid
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
