-- Isolated regression tests for the purchase-bill line integrity trigger.
-- Run only against disposable PostgreSQL; no production data is needed.
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE public.purchase_bills (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  purchase_order_id uuid,
  grn_id uuid
);
CREATE TABLE public.inventory_items (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL
);
CREATE TABLE public.purchase_order_items (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  purchase_order_id uuid NOT NULL
);
CREATE TABLE public.goods_received_notes (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL
);
CREATE TABLE public.goods_received_note_items (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  grn_id uuid NOT NULL,
  purchase_order_item_id uuid
);
CREATE TABLE public.purchase_bill_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  purchase_bill_id uuid NOT NULL,
  description text NOT NULL,
  item_code text,
  quantity numeric NOT NULL,
  unit text,
  unit_price numeric NOT NULL,
  taxable_amount numeric NOT NULL,
  tax_rate numeric NOT NULL,
  cgst_amount numeric NOT NULL,
  sgst_amount numeric NOT NULL,
  igst_amount numeric NOT NULL,
  line_total numeric NOT NULL,
  notes text,
  inventory_item_id uuid,
  master_boq_line_id uuid,
  purchase_order_item_id uuid,
  goods_received_note_item_id uuid
);

\i supabase/migrations/20261011193000_phase00_purchase_bill_item_integrity_guard.sql

DO $test$
DECLARE
  t uuid := '10000000-0000-0000-0000-000000000001';
  c uuid := '20000000-0000-0000-0000-000000000001';
  other_c uuid := '20000000-0000-0000-0000-000000000002';
  b uuid := '30000000-0000-0000-0000-000000000001';
  item uuid := '40000000-0000-0000-0000-000000000001';
  bad_item uuid := '40000000-0000-0000-0000-000000000002';
  po uuid := '50000000-0000-0000-0000-000000000001';
  poi uuid := '60000000-0000-0000-0000-000000000001';
  grn uuid := '70000000-0000-0000-0000-000000000001';
  gri uuid := '80000000-0000-0000-0000-000000000001';
BEGIN
  INSERT INTO public.purchase_bills VALUES (b,t,c,po,grn);
  INSERT INTO public.inventory_items VALUES (item,t,c),(bad_item,t,other_c);
  INSERT INTO public.purchase_order_items VALUES (poi,t,c,po);
  INSERT INTO public.goods_received_notes VALUES (grn,t,c);
  INSERT INTO public.goods_received_note_items VALUES (gri,t,c,grn,poi);

  INSERT INTO public.purchase_bill_items (
    tenant_id,tenant_company_id,purchase_bill_id,description,quantity,unit_price,
    taxable_amount,tax_rate,cgst_amount,sgst_amount,igst_amount,line_total,
    inventory_item_id,purchase_order_item_id,goods_received_note_item_id
  ) VALUES (t,c,b,'Valid item',2,100,200,18,18,18,0,236,item,poi,gri);

  BEGIN
    INSERT INTO public.purchase_bill_items (
      tenant_id,tenant_company_id,purchase_bill_id,description,quantity,unit_price,
      taxable_amount,tax_rate,cgst_amount,sgst_amount,igst_amount,line_total
    ) VALUES (t,c,b,'Forged taxable value',2,100,201,18,18.09,18.09,0,237.18);
    RAISE EXCEPTION 'Expected taxable amount mismatch to be rejected';
  EXCEPTION WHEN check_violation OR raise_exception THEN
    IF SQLERRM = 'Expected taxable amount mismatch to be rejected' THEN RAISE; END IF;
  END;

  BEGIN
    INSERT INTO public.purchase_bill_items (
      tenant_id,tenant_company_id,purchase_bill_id,description,quantity,unit_price,
      taxable_amount,tax_rate,cgst_amount,sgst_amount,igst_amount,line_total,inventory_item_id
    ) VALUES (t,c,b,'Cross-company inventory',1,100,100,0,0,0,0,100,bad_item);
    RAISE EXCEPTION 'Expected cross-company inventory link to be rejected';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM = 'Expected cross-company inventory link to be rejected' THEN RAISE; END IF;
  END;

  BEGIN
    INSERT INTO public.purchase_bill_items (
      tenant_id,tenant_company_id,purchase_bill_id,description,quantity,unit_price,
      taxable_amount,tax_rate,cgst_amount,sgst_amount,igst_amount,line_total,purchase_order_item_id
    ) VALUES (t,c,b,'Wrong PO link',1,100,100,0,0,0,0,100,
      '60000000-0000-0000-0000-000000000099');
    RAISE EXCEPTION 'Expected invalid purchase-order item link to be rejected';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM = 'Expected invalid purchase-order item link to be rejected' THEN RAISE; END IF;
  END;

  BEGIN
    INSERT INTO public.purchase_bill_items (
      tenant_id,tenant_company_id,purchase_bill_id,description,quantity,unit_price,
      taxable_amount,tax_rate,cgst_amount,sgst_amount,igst_amount,line_total
    ) VALUES (t,c,b,'Invalid tax split',1,100,100,18,18,0,0,118);
    RAISE EXCEPTION 'Expected invalid tax total to be rejected';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM = 'Expected invalid tax total to be rejected' THEN RAISE; END IF;
  END;
END;
$test$;

ROLLBACK;
