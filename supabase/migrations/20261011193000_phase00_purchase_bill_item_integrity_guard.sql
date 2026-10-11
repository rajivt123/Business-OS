-- Procurement purchase-bill line integrity guard.
-- Source-only until isolated regression tests and the full procurement workflow pass.
-- Do not apply directly to production as part of this PR.
BEGIN;

CREATE OR REPLACE FUNCTION public.validate_purchase_bill_item_integrity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_bill public.purchase_bills%ROWTYPE;
  v_tax_total numeric;
  v_expected_tax numeric;
BEGIN
  SELECT * INTO v_bill
  FROM public.purchase_bills b
  WHERE b.id = NEW.purchase_bill_id
  FOR KEY SHARE;

  IF NOT FOUND
     OR v_bill.tenant_id <> NEW.tenant_id
     OR v_bill.tenant_company_id <> NEW.tenant_company_id THEN
    RAISE EXCEPTION 'Purchase bill item must belong to the same tenant and operating company as its bill';
  END IF;

  IF NEW.quantity <= 0 OR NEW.unit_price < 0 OR NEW.tax_rate < 0 OR NEW.tax_rate > 100
     OR NEW.cgst_amount < 0 OR NEW.sgst_amount < 0 OR NEW.igst_amount < 0 THEN
    RAISE EXCEPTION 'Purchase bill quantity, price, tax rate, and tax amounts are outside allowed ranges';
  END IF;

  IF abs(NEW.taxable_amount - (NEW.quantity * NEW.unit_price)) > 0.01 THEN
    RAISE EXCEPTION 'Purchase bill taxable amount must equal quantity multiplied by unit price';
  END IF;

  v_tax_total := NEW.cgst_amount + NEW.sgst_amount + NEW.igst_amount;
  v_expected_tax := NEW.taxable_amount * NEW.tax_rate / 100;
  IF abs(v_tax_total - v_expected_tax) > 0.03 THEN
    RAISE EXCEPTION 'Purchase bill tax components do not reconcile with taxable amount and tax rate';
  END IF;

  IF abs(NEW.line_total - (NEW.taxable_amount + v_tax_total)) > 0.03 THEN
    RAISE EXCEPTION 'Purchase bill line total does not reconcile with taxable amount and tax components';
  END IF;

  IF NEW.inventory_item_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.inventory_items i
    WHERE i.id = NEW.inventory_item_id
      AND i.tenant_id = NEW.tenant_id
      AND i.tenant_company_id = NEW.tenant_company_id
  ) THEN
    RAISE EXCEPTION 'Inventory item is outside the purchase bill tenant/company scope';
  END IF;

  IF NEW.purchase_order_item_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.purchase_order_items poi
    WHERE poi.id = NEW.purchase_order_item_id
      AND poi.tenant_id = NEW.tenant_id
      AND poi.tenant_company_id = NEW.tenant_company_id
      AND v_bill.purchase_order_id IS NOT NULL
      AND poi.purchase_order_id = v_bill.purchase_order_id
  ) THEN
    RAISE EXCEPTION 'Purchase-order item must belong to the bill linked purchase order and scope';
  END IF;

  IF NEW.goods_received_note_item_id IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM public.goods_received_note_items gri
    JOIN public.goods_received_notes grn ON grn.id = gri.grn_id
    WHERE gri.id = NEW.goods_received_note_item_id
      AND gri.tenant_id = NEW.tenant_id
      AND gri.tenant_company_id = NEW.tenant_company_id
      AND v_bill.grn_id IS NOT NULL
      AND grn.id = v_bill.grn_id
      AND grn.tenant_id = NEW.tenant_id
      AND grn.tenant_company_id = NEW.tenant_company_id
      AND (NEW.purchase_order_item_id IS NULL
           OR gri.purchase_order_item_id = NEW.purchase_order_item_id)
  ) THEN
    RAISE EXCEPTION 'Goods-received-note item must belong to the bill linked GRN and match the PO item when supplied';
  END IF;

  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.validate_purchase_bill_item_integrity() FROM PUBLIC, anon, authenticated, service_role;

DROP TRIGGER IF EXISTS trg_validate_purchase_bill_item_integrity ON public.purchase_bill_items;
CREATE TRIGGER trg_validate_purchase_bill_item_integrity
BEFORE INSERT OR UPDATE ON public.purchase_bill_items
FOR EACH ROW EXECUTE FUNCTION public.validate_purchase_bill_item_integrity();

COMMIT;
