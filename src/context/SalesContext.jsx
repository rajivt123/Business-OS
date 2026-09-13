import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useCrm } from './CrmContext';

const SalesContext = createContext(null);

export function useSales() {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
}

export function SalesProvider({ children }) {
  const crm = useCrm() || {};
  const {
    tenantId,
    activeOperatingCompanyId,
    userRole,
    tenantRole,
    currentUser,
    session,
    companies = [],
    enquiries = [],
    works = []
  } = crm;

  const authUserId = session?.user?.id || currentUser?.id;

  // Role Permission Guard (OWNER / ADMIN / MANAGER allowed full write access)
  const isManagementOrAdmin = useMemo(() => {
    const r = (userRole || '').toLowerCase();
    const tr = (tenantRole || '').toLowerCase();
    const allowed = ['owner', 'admin', 'manager'];
    return allowed.includes(r) || allowed.includes(tr);
  }, [userRole, tenantRole]);

  // State Collections
  const [quotations, setQuotations] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [proformaInvoices, setProformaInvoices] = useState([]);
  const [taxInvoices, setTaxInvoices] = useState([]);
  const [salesPayments, setSalesPayments] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch Quotations
  const fetchQuotations = useCallback(async () => {
    try {
      let query = supabase
        .from('sales_quotations')
        .select(`
          *,
          company:companies(id, name),
          enquiry:enquiries(id, title),
          work:works(id, title),
          items:sales_quotation_items(*)
        `)
        .order('created_at', { ascending: false });

      if (tenantId) query = query.eq('tenant_id', tenantId);
      if (activeOperatingCompanyId) query = query.eq('tenant_company_id', activeOperatingCompanyId);

      const { data, error: err } = await query;
      if (err) throw err;
      setQuotations(data || []);
    } catch (err) {
      console.error('[SalesContext] Error fetching quotations:', err);
      setQuotations([]);
    }
  }, [tenantId, activeOperatingCompanyId]);

  // 2. Fetch Sales Orders
  const fetchSalesOrders = useCallback(async () => {
    try {
      let query = supabase
        .from('sales_orders')
        .select(`
          *,
          company:companies(id, name),
          enquiry:enquiries(id, title),
          work:works(id, title),
          quotation:sales_quotations(id, quotation_no),
          items:sales_order_items(*)
        `)
        .order('created_at', { ascending: false });

      if (tenantId) query = query.eq('tenant_id', tenantId);
      if (activeOperatingCompanyId) query = query.eq('tenant_company_id', activeOperatingCompanyId);

      const { data, error: err } = await query;
      if (err) throw err;
      setSalesOrders(data || []);
    } catch (err) {
      console.error('[SalesContext] Error fetching sales orders:', err);
      setSalesOrders([]);
    }
  }, [tenantId, activeOperatingCompanyId]);

  // 3. Fetch Proforma Invoices
  const fetchProformaInvoices = useCallback(async () => {
    try {
      let query = supabase
        .from('proforma_invoices')
        .select(`
          *,
          company:companies(id, name),
          enquiry:enquiries(id, title),
          work:works(id, title),
          sales_order:sales_orders(id, so_no),
          quotation:sales_quotations(id, quotation_no),
          items:proforma_invoice_items(*)
        `)
        .order('created_at', { ascending: false });

      if (tenantId) query = query.eq('tenant_id', tenantId);
      if (activeOperatingCompanyId) query = query.eq('tenant_company_id', activeOperatingCompanyId);

      const { data, error: err } = await query;
      if (err) throw err;
      setProformaInvoices(data || []);
    } catch (err) {
      console.error('[SalesContext] Error fetching proforma invoices:', err);
      setProformaInvoices([]);
    }
  }, [tenantId, activeOperatingCompanyId]);

  // 4. Fetch Tax Invoices
  const fetchTaxInvoices = useCallback(async () => {
    try {
      let query = supabase
        .from('tax_invoices')
        .select(`
          *,
          company:companies(id, name),
          enquiry:enquiries(id, title),
          work:works(id, title),
          sales_order:sales_orders(id, so_no),
          items:tax_invoice_items(*),
          payments:sales_payments(*)
        `)
        .order('created_at', { ascending: false });

      if (tenantId) query = query.eq('tenant_id', tenantId);
      if (activeOperatingCompanyId) query = query.eq('tenant_company_id', activeOperatingCompanyId);

      const { data, error: err } = await query;
      if (err) throw err;
      setTaxInvoices(data || []);
    } catch (err) {
      console.error('[SalesContext] Error fetching tax invoices:', err);
      setTaxInvoices([]);
    }
  }, [tenantId, activeOperatingCompanyId]);

  // 5. Fetch Sales Payments
  const fetchSalesPayments = useCallback(async () => {
    try {
      let query = supabase
        .from('sales_payments')
        .select(`
          *,
          tax_invoice:tax_invoices(id, invoice_no, company_id, company:companies(id, name))
        `)
        .order('created_at', { ascending: false });

      if (tenantId) query = query.eq('tenant_id', tenantId);
      if (activeOperatingCompanyId) query = query.eq('tenant_company_id', activeOperatingCompanyId);

      const { data, error: err } = await query;
      if (err) throw err;
      setSalesPayments(data || []);
    } catch (err) {
      console.error('[SalesContext] Error fetching sales payments:', err);
      setSalesPayments([]);
    }
  }, [tenantId, activeOperatingCompanyId]);

  // Refresh all sales data
  const refreshAllSalesData = useCallback(async () => {
    if (!authUserId) return;
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchQuotations(),
        fetchSalesOrders(),
        fetchProformaInvoices(),
        fetchTaxInvoices(),
        fetchSalesPayments()
      ]);
    } catch (err) {
      console.error('[SalesContext] Error loading sales module data:', err);
      setError(err.message || 'Failed to load Sales data');
    } finally {
      setIsLoading(false);
    }
  }, [authUserId, fetchQuotations, fetchSalesOrders, fetchProformaInvoices, fetchTaxInvoices, fetchSalesPayments]);

  useEffect(() => {
    refreshAllSalesData();
  }, [refreshAllSalesData]);

  // --- Strict Server-Authoritative Operations (RPC ONLY - No Client Fallbacks) ---

  // 1. Create Sales Quotation
  const createSalesQuotation = async (headerPayload, itemsPayload) => {
    if (!isManagementOrAdmin) throw new Error('Unauthorized: Permission denied');
    setIsLoading(true);
    try {
      const header = {
        tenant_id: tenantId,
        tenant_company_id: activeOperatingCompanyId,
        created_by: authUserId,
        ...headerPayload
      };

      // Server-authoritative RPC call
      const { data, error: rpcError } = await supabase.rpc('create_sales_quotation_atomic', {
        p_header_json: header,
        p_items_json: itemsPayload
      });

      if (rpcError) throw rpcError;

      await refreshAllSalesData();
      return { success: true, data };
    } catch (err) {
      console.error('[SalesContext] Error creating quotation via RPC:', err);
      return { success: false, error: err.message || err };
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Convert Quotation to Sales Order
  const convertQuotationToSalesOrder = async (quotationId) => {
    if (!isManagementOrAdmin) throw new Error('Unauthorized: Permission denied');
    setIsLoading(true);
    try {
      // Server-authoritative RPC call with confirmed parameters (p_quotation_id, p_order_date)
      const { data, error: rpcError } = await supabase.rpc('convert_quotation_to_sales_order_atomic', {
        p_quotation_id: quotationId,
        p_order_date: new Date().toISOString().slice(0, 10)
      });

      if (rpcError) throw rpcError;

      await refreshAllSalesData();
      return { success: true, data };
    } catch (err) {
      console.error('[SalesContext] Error converting quotation via RPC:', err);
      return { success: false, error: err.message || err };
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Create Proforma Invoice
  const createProformaInvoice = async (headerPayload, itemsPayload) => {
    if (!isManagementOrAdmin) throw new Error('Unauthorized: Permission denied');
    setIsLoading(true);
    try {
      const header = {
        tenant_id: tenantId,
        tenant_company_id: activeOperatingCompanyId,
        created_by: authUserId,
        status: 'issued',
        ...headerPayload
      };

      // Check server-side RPC signature for proforma
      const { data, error: rpcError } = await supabase.rpc('create_proforma_invoice_atomic', {
        p_header_json: header,
        p_items_json: itemsPayload
      });

      if (rpcError) {
        if (rpcError.message.includes('Could not find the function')) {
          console.error('[SalesContext] Backend contract gap: missing RPC create_proforma_invoice_atomic');
          return {
            success: false,
            isContractMissing: true,
            error: 'Backend contract gap: missing server-side RPC create_proforma_invoice_atomic. Browser fallback is disabled per strict safety policy.'
          };
        }
        throw rpcError;
      }

      await refreshAllSalesData();
      return { success: true, data };
    } catch (err) {
      console.error('[SalesContext] Error creating proforma invoice via RPC:', err);
      return { success: false, error: err.message || err };
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Issue Tax Invoice
  const issueTaxInvoice = async (headerPayload, itemsPayload) => {
    if (!isManagementOrAdmin) throw new Error('Unauthorized: Permission denied');
    setIsLoading(true);
    try {
      const totalAmount = headerPayload.total_amount || 0;
      const header = {
        tenant_id: tenantId,
        tenant_company_id: activeOperatingCompanyId,
        created_by: authUserId,
        status: 'issued',
        amount_paid: 0,
        balance_due: totalAmount,
        ...headerPayload
      };

      // Server-authoritative RPC call
      const { data, error: rpcError } = await supabase.rpc('issue_tax_invoice_atomic', {
        p_header_json: header,
        p_items_json: itemsPayload
      });

      if (rpcError) throw rpcError;

      await refreshAllSalesData();
      return { success: true, data };
    } catch (err) {
      console.error('[SalesContext] Error issuing tax invoice via RPC:', err);
      return { success: false, error: err.message || err };
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Record Sales Payment
  const recordSalesPayment = async (paymentPayload) => {
    if (!isManagementOrAdmin) throw new Error('Unauthorized: Permission denied');
    setIsLoading(true);
    try {
      const payload = {
        tenant_id: tenantId,
        tenant_company_id: activeOperatingCompanyId,
        recorded_by: authUserId,
        payment_date: new Date().toISOString().slice(0, 10),
        ...paymentPayload
      };

      // Server-authoritative RPC call
      const { data, error: rpcError } = await supabase.rpc('record_sales_payment_atomic', {
        p_payment_json: payload
      });

      if (rpcError) throw rpcError;

      await refreshAllSalesData();
      return { success: true, data };
    } catch (err) {
      console.error('[SalesContext] Error recording payment via RPC:', err);
      return { success: false, error: err.message || err };
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    quotations,
    salesOrders,
    proformaInvoices,
    taxInvoices,
    salesPayments,
    isLoading,
    error,
    isManagementOrAdmin,
    companies,
    enquiries,
    works,
    createSalesQuotation,
    convertQuotationToSalesOrder,
    createProformaInvoice,
    issueTaxInvoice,
    recordSalesPayment,
    refreshAllSalesData
  };

  return <SalesContext.Provider value={value}>{children}</SalesContext.Provider>;
}
