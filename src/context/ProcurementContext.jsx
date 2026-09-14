import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useCrm } from './CrmContext';

const ProcurementContext = createContext(null);

export function ProcurementProvider({ children }) {
  const crmContext = useCrm() || {};
  const {
    tenantId,
    activeOperatingCompanyId,
    userRole,
    tenantRole,
    currentUser,
    session,
    createNotification
  } = crmContext;

  const authUserId = session?.user?.id || currentUser?.id;

  // Management / Role permission helper (OWNER / ADMIN / MANAGER vs TEAM / VIEWER)
  const isManagementOrAdmin = useMemo(() => {
    const r = (userRole || '').toLowerCase();
    const tr = (tenantRole || '').toLowerCase();
    const allowed = ['owner', 'admin', 'manager'];
    return allowed.includes(r) || allowed.includes(tr);
  }, [userRole, tenantRole]);

  // Procurement States
  const [vendors, setVendors] = useState([]);
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [purchaseRequestItems, setPurchaseRequestItems] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [vendorQuotations, setVendorQuotations] = useState([]);
  const [vendorQuotationItems, setVendorQuotationItems] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [purchaseOrderItems, setPurchaseOrderItems] = useState([]);
  const [goodsReceivedNotes, setGoodsReceivedNotes] = useState([]);
  const [purchaseBills, setPurchaseBills] = useState([]);
  const [purchaseBillItems, setPurchaseBillItems] = useState([]);
  const [purchasePayments, setPurchasePayments] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- FETCHERS ---
  const fetchVendors = useCallback(async (opCoId) => {
    try {
      let q = supabase.from('vendors').select('*').order('created_at', { ascending: false });
      if (opCoId) q = q.eq('tenant_company_id', opCoId);
      const { data, error } = await q;
      if (error) throw error;
      setVendors(data || []);
    } catch (err) {
      console.error('Error fetching vendors:', err);
    }
  }, []);

  const fetchPurchaseRequests = useCallback(async (opCoId) => {
    try {
      let q = supabase.from('purchase_requests').select('*').order('created_at', { ascending: false });
      if (opCoId) q = q.eq('tenant_company_id', opCoId);
      const { data, error } = await q;
      if (error) throw error;
      setPurchaseRequests(data || []);

      if (data && data.length > 0) {
        const ids = data.map(r => r.id);
        const { data: items } = await supabase.from('purchase_request_items').select('*').in('purchase_request_id', ids);
        setPurchaseRequestItems(items || []);
      } else {
        setPurchaseRequestItems([]);
      }
    } catch (err) {
      console.error('Error fetching purchase requests:', err);
    }
  }, []);

  const fetchRfqs = useCallback(async (opCoId) => {
    try {
      let q = supabase.from('rfqs').select('*').order('created_at', { ascending: false });
      if (opCoId) q = q.eq('tenant_company_id', opCoId);
      const { data, error } = await q;
      if (error) throw error;
      setRfqs(data || []);
    } catch (err) {
      console.error('Error fetching RFQs:', err);
    }
  }, []);

  const fetchVendorQuotations = useCallback(async (opCoId) => {
    try {
      let q = supabase.from('vendor_quotations').select('*').order('created_at', { ascending: false });
      if (opCoId) q = q.eq('tenant_company_id', opCoId);
      const { data, error } = await q;
      if (error) throw error;
      setVendorQuotations(data || []);

      if (data && data.length > 0) {
        const ids = data.map(q => q.id);
        const { data: items } = await supabase.from('vendor_quotation_items').select('*').in('vendor_quotation_id', ids);
        setVendorQuotationItems(items || []);
      } else {
        setVendorQuotationItems([]);
      }
    } catch (err) {
      console.error('Error fetching vendor quotations:', err);
    }
  }, []);

  const fetchPurchaseOrders = useCallback(async (opCoId) => {
    try {
      let q = supabase.from('purchase_orders').select('*').order('created_at', { ascending: false });
      if (opCoId) q = q.eq('tenant_company_id', opCoId);
      const { data, error } = await q;
      if (error) throw error;
      setPurchaseOrders(data || []);

      if (data && data.length > 0) {
        const ids = data.map(po => po.id);
        const { data: items } = await supabase.from('purchase_order_items').select('*').in('purchase_order_id', ids);
        setPurchaseOrderItems(items || []);
      } else {
        setPurchaseOrderItems([]);
      }
    } catch (err) {
      console.error('Error fetching purchase orders:', err);
    }
  }, []);

  const fetchGoodsReceivedNotes = useCallback(async (opCoId) => {
    try {
      let q = supabase.from('goods_received_notes').select('*').order('created_at', { ascending: false });
      if (opCoId) q = q.eq('tenant_company_id', opCoId);
      const { data, error } = await q;
      if (error) throw error;
      setGoodsReceivedNotes(data || []);
    } catch (err) {
      console.error('Error fetching GRNs:', err);
    }
  }, []);

  const fetchPurchaseBills = useCallback(async (opCoId) => {
    try {
      let q = supabase.from('purchase_bills').select('*').order('created_at', { ascending: false });
      if (opCoId) q = q.eq('tenant_company_id', opCoId);
      const { data, error } = await q;
      if (error) throw error;
      setPurchaseBills(data || []);

      if (data && data.length > 0) {
        const ids = data.map(b => b.id);
        const { data: items } = await supabase.from('purchase_bill_items').select('*').in('purchase_bill_id', ids);
        setPurchaseBillItems(items || []);
      } else {
        setPurchaseBillItems([]);
      }
    } catch (err) {
      console.error('Error fetching purchase bills:', err);
    }
  }, []);

  const fetchPurchasePayments = useCallback(async (opCoId) => {
    try {
      let q = supabase.from('purchase_payments').select('*').order('created_at', { ascending: false });
      if (opCoId) q = q.eq('tenant_company_id', opCoId);
      const { data, error } = await q;
      if (error) throw error;
      setPurchasePayments(data || []);
    } catch (err) {
      console.error('Error fetching purchase payments:', err);
    }
  }, []);

  const fetchAllProcurementData = useCallback(async (opCoId) => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchVendors(opCoId),
        fetchPurchaseRequests(opCoId),
        fetchRfqs(opCoId),
        fetchVendorQuotations(opCoId),
        fetchPurchaseOrders(opCoId),
        fetchGoodsReceivedNotes(opCoId),
        fetchPurchaseBills(opCoId),
        fetchPurchasePayments(opCoId)
      ]);
    } catch (err) {
      console.error('Error loading procurement data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [
    fetchVendors, fetchPurchaseRequests, fetchRfqs, fetchVendorQuotations,
    fetchPurchaseOrders, fetchGoodsReceivedNotes, fetchPurchaseBills, fetchPurchasePayments
  ]);

  useEffect(() => {
    if (authUserId) {
      fetchAllProcurementData(activeOperatingCompanyId);
    }
  }, [authUserId, activeOperatingCompanyId, fetchAllProcurementData]);

  // --- MUTATIONS VIA SERVER-AUTHORITATIVE RPCs ---

  // 1. Create Vendor (create_vendor_atomic)
  const createVendor = async (vendorPayload) => {
    if (!isManagementOrAdmin) {
      throw new Error('Access denied: Vendor creation requires Manager or Admin permissions.');
    }
    const payload = {
      tenant_id: tenantId,
      tenant_company_id: activeOperatingCompanyId,
      created_by: authUserId,
      ...vendorPayload
    };

    const { data, error } = await supabase.rpc('create_vendor_atomic', { p_vendor: payload });
    if (error) throw error;
    await fetchVendors(activeOperatingCompanyId);
    return data;
  };

  // 2. Create Purchase Request (create_purchase_request_atomic)
  const createPurchaseRequest = async (headerPayload, itemsPayload) => {
    if (!isManagementOrAdmin) {
      throw new Error('Access denied: Purchase Request creation requires Manager or Admin permissions.');
    }
    const header = {
      tenant_id: tenantId,
      tenant_company_id: activeOperatingCompanyId,
      created_by: authUserId,
      status: 'pending',
      ...headerPayload
    };

    const items = (itemsPayload || []).map(item => ({
      tenant_id: header.tenant_id,
      tenant_company_id: header.tenant_company_id,
      ...item
    }));

    const { data, error } = await supabase.rpc('create_purchase_request_atomic', {
      p_header: header,
      p_items: items
    });
    if (error) throw error;
    await fetchPurchaseRequests(activeOperatingCompanyId);
    return data;
  };

  // 3. Create RFQ (create_rfq_atomic)
  const createRfq = async (headerPayload) => {
    if (!isManagementOrAdmin) {
      throw new Error('Access denied: RFQ creation requires Manager or Admin permissions.');
    }
    const header = {
      tenant_id: tenantId,
      tenant_company_id: activeOperatingCompanyId,
      created_by: authUserId,
      status: 'open',
      ...headerPayload
    };

    const { data, error } = await supabase.rpc('create_rfq_atomic', { p_header: header });
    if (error) throw error;
    await fetchRfqs(activeOperatingCompanyId);
    return data;
  };

  // 4. Create Vendor Quotation (create_vendor_quotation_atomic)
  const createVendorQuotation = async (headerPayload, itemsPayload) => {
    if (!isManagementOrAdmin) {
      throw new Error('Access denied: Vendor Quotation creation requires Manager or Admin permissions.');
    }
    const header = {
      tenant_id: tenantId,
      tenant_company_id: activeOperatingCompanyId,
      created_by: authUserId,
      status: 'received',
      ...headerPayload
    };

    const items = (itemsPayload || []).map(item => ({
      tenant_id: header.tenant_id,
      tenant_company_id: header.tenant_company_id,
      ...item
    }));

    const { data, error } = await supabase.rpc('create_vendor_quotation_atomic', {
      p_header: header,
      p_items: items
    });
    if (error) throw error;
    await fetchVendorQuotations(activeOperatingCompanyId);
    return data;
  };

  // 5. Create Purchase Order (create_purchase_order_atomic)
  const createPurchaseOrder = async (headerPayload, itemsPayload) => {
    if (!isManagementOrAdmin) {
      throw new Error('Access denied: Purchase Order issuance requires Manager or Admin permissions.');
    }
    const header = {
      tenant_id: tenantId,
      tenant_company_id: activeOperatingCompanyId,
      created_by: authUserId,
      status: 'draft',
      ...headerPayload
    };

    const items = (itemsPayload || []).map(item => ({
      tenant_id: header.tenant_id,
      tenant_company_id: header.tenant_company_id,
      ...item
    }));

    const { data, error } = await supabase.rpc('create_purchase_order_atomic', {
      p_header: header,
      p_items: items
    });
    if (error) throw error;
    await fetchPurchaseOrders(activeOperatingCompanyId);
    return data;
  };

  // 5b. Approve Purchase Order (approve_purchase_order_atomic)
  const approvePurchaseOrder = async (poId) => {
    if (!isManagementOrAdmin) {
      throw new Error('Access denied: PO Approval requires Manager or Admin permissions.');
    }
    const { data, error } = await supabase.rpc('approve_purchase_order_atomic', {
      p_purchase_order_id: poId
    });
    if (error) throw error;
    await fetchPurchaseOrders(activeOperatingCompanyId);
    return data;
  };

  // 6. Record GRN with Authoritative Atomic Server Wrapper (create_goods_received_note_with_accounting_atomic)
  const createGoodsReceivedNote = async (headerPayload, itemsPayload = []) => {
    if (!isManagementOrAdmin) {
      throw new Error('Access denied: GRN logging requires Manager or Admin permissions.');
    }
    setIsLoading(true);
    try {
      const idempotencyKey = headerPayload.idempotency_key || `grn-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const header = {
        tenant_id: tenantId,
        company_id: activeOperatingCompanyId,
        operating_company_id: activeOperatingCompanyId,
        received_by: authUserId,
        status: 'received',
        idempotency_key: idempotencyKey,
        ...headerPayload
      };

      const items = (itemsPayload || []).map(item => ({
        tenant_id: header.tenant_id,
        company_id: header.company_id,
        operating_company_id: header.operating_company_id,
        purchase_order_item_id: item.purchase_order_item_id || item.po_item_id || null,
        item_id: item.item_id || null,
        received_quantity: Number(item.received_quantity) || 0,
        accepted_quantity: Number(item.accepted_quantity) || 0,
        rejected_quantity: Number(item.rejected_quantity) || 0,
        unit_price: Number(item.unit_price) || 0,
        item_description: item.item_description || ''
      }));

      const { data, error: rpcError } = await supabase.rpc('create_goods_received_note_with_accounting_atomic', {
        p_header: header,
        p_items: items
      });

      if (rpcError) throw rpcError;

      await fetchGoodsReceivedNotes(activeOperatingCompanyId);
      return { success: true, data };
    } catch (err) {
      console.error('[ProcurementContext] Error logging GRN via atomic wrapper RPC:', err);
      return { success: false, error: err.message || err };
    } finally {
      setIsLoading(false);
    }
  };

  // 7. Create Purchase Bill with Authoritative Atomic Server Wrapper
  const createPurchaseBill = async (headerPayload, itemsPayload = []) => {
    if (!isManagementOrAdmin) {
      throw new Error('Access denied: Purchase Bill recording requires Manager or Admin permissions.');
    }
    setIsLoading(true);
    try {
      const grandTotal = Number(headerPayload.total_amount || headerPayload.balance_due) || 0;
      const idempotencyKey = headerPayload.idempotency_key || `bill-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const header = {
        tenant_id: tenantId,
        company_id: activeOperatingCompanyId,
        operating_company_id: activeOperatingCompanyId,
        created_by: authUserId,
        status: 'pending',
        amount_paid: 0,
        balance_due: grandTotal,
        idempotency_key: idempotencyKey,
        ...headerPayload
      };

      const items = (itemsPayload || []).map(item => ({
        tenant_id: header.tenant_id,
        company_id: header.company_id,
        operating_company_id: header.operating_company_id,
        item_description: item.item_description || '',
        item_code: item.item_code || item.code || '',
        quantity: Number(item.quantity) || 1,
        unit_price: Number(item.unit_price) || 0,
        line_total: Number(item.line_total) || (Number(item.quantity) * Number(item.unit_price))
      }));

      const { data, error: rpcError } = await supabase.rpc('create_purchase_bill_with_accounting_atomic', {
        p_header: header,
        p_items: items
      });

      if (rpcError) throw rpcError;

      await fetchPurchaseBills(activeOperatingCompanyId);
      return { success: true, data };
    } catch (err) {
      console.error('[ProcurementContext] Error creating purchase bill via atomic wrapper RPC:', err);
      return { success: false, error: err.message || err };
    } finally {
      setIsLoading(false);
    }
  };

  // 8. Record Purchase Payment with Authoritative Atomic Server Wrapper
  const recordPurchasePayment = async (paymentPayload) => {
    if (!isManagementOrAdmin) {
      throw new Error('Access denied: Recording vendor payment requires Manager or Admin permissions.');
    }
    setIsLoading(true);
    try {
      const idempotencyKey = paymentPayload.idempotency_key || `pay-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const payload = {
        tenant_id: tenantId,
        company_id: activeOperatingCompanyId,
        operating_company_id: activeOperatingCompanyId,
        recorded_by: authUserId,
        payment_date: new Date().toISOString().slice(0, 10),
        idempotency_key: idempotencyKey,
        ...paymentPayload
      };

      const { data, error: rpcError } = await supabase.rpc('record_purchase_payment_with_accounting_atomic', {
        p_payment: payload
      });

      if (rpcError) throw rpcError;

      await Promise.all([
        fetchPurchaseBills(activeOperatingCompanyId),
        fetchPurchasePayments(activeOperatingCompanyId)
      ]);
      return { success: true, data };
    } catch (err) {
      console.error('[ProcurementContext] Error recording vendor payment via atomic wrapper RPC:', err);
      return { success: false, error: err.message || err };
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    vendors,
    purchaseRequests,
    purchaseRequestItems,
    rfqs,
    vendorQuotations,
    vendorQuotationItems,
    purchaseOrders,
    purchaseOrderItems,
    goodsReceivedNotes,
    purchaseBills,
    purchaseBillItems,
    purchasePayments,
    isLoading,
    error,
    isManagementOrAdmin,
    refreshProcurementData: () => fetchAllProcurementData(activeOperatingCompanyId),
    createVendor,
    createPurchaseRequest,
    createRfq,
    createVendorQuotation,
    createPurchaseOrder,
    approvePurchaseOrder,
    createGoodsReceivedNote,
    createPurchaseBill,
    recordPurchasePayment
  };

  return <ProcurementContext.Provider value={value}>{children}</ProcurementContext.Provider>;
}

export function useProcurement() {
  const context = useContext(ProcurementContext);
  if (!context) {
    throw new Error('useProcurement must be used within a ProcurementProvider');
  }
  return context;
}
