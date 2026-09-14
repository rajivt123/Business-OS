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
          sales_order:sales_orders(id, customer_name, total_amount),
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
          sales_order:sales_orders(id, customer_name, total_amount),
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

  // 4. Issue Tax Invoice with Authoritative Atomic Server Wrapper
  const issueTaxInvoice = async (headerPayload, itemsPayload) => {
    if (!isManagementOrAdmin) throw new Error('Unauthorized: Permission denied');
    setIsLoading(true);
    try {
      const grandTotal = Number(headerPayload.grand_total || headerPayload.total_amount) || 0;
      const header = {
        tenant_id: tenantId,
        tenant_company_id: activeOperatingCompanyId,
        created_by: authUserId,
        status: 'issued',
        amount_paid: 0,
        balance_due: grandTotal,
        ...headerPayload
      };

      let accountingObj = null;
      if (grandTotal > 0 && activeOperatingCompanyId) {
        const { data: coa } = await supabase
          .from('chart_of_accounts')
          .select('id, account_type, account_subtype, account_code, control_account_type')
          .or(`tenant_company_id.eq.${activeOperatingCompanyId},tenant_id.eq.${tenantId}`);

        const arAcc = coa?.find(a => a.control_account_type === 'accounts_receivable' || a.account_subtype === 'receivable' || a.account_code === '1010' || a.account_code === 'QA-1010' || a.account_type === 'asset');
        const revAcc = coa?.find(a => a.control_account_type === 'sales_revenue' || a.account_subtype === 'sales' || a.account_code === '4010' || a.account_code === 'QA-4010' || a.account_type === 'revenue');
        const cgstAmt = Number(headerPayload.cgst_amount) || 0;
        const sgstAmt = Number(headerPayload.sgst_amount) || 0;
        const igstAmt = Number(headerPayload.igst_amount) || 0;

        const cgstAcc = cgstAmt > 0 ? coa?.find(a => a.control_account_type === 'cgst_payable' || a.account_code === '2010' || a.account_code === 'QA-2010') : null;
        const sgstAcc = sgstAmt > 0 ? coa?.find(a => a.control_account_type === 'sgst_payable' || a.account_code === '2020' || a.account_code === 'QA-2020') : null;
        const igstAcc = igstAmt > 0 ? coa?.find(a => a.control_account_type === 'igst_payable' || a.account_code === '2030' || a.account_code === 'QA-2030') : null;

        if (arAcc?.id && revAcc?.id) {
          accountingObj = {
            post_accounting: true,
            ar_account_id: arAcc.id,
            revenue_account_id: revAcc.id,
            cgst_account_id: cgstAcc?.id || null,
            sgst_account_id: sgstAcc?.id || null,
            igst_account_id: igstAcc?.id || null
          };
        }
      }

      // Sole Production Path: Server-authoritative atomic wrapper RPC
      const { data, error: rpcError } = await supabase.rpc('issue_tax_invoice_with_accounting_atomic', {
        p_header_json: header,
        p_items_json: itemsPayload,
        p_accounting_json: accountingObj
      });

      if (rpcError) {
        if (rpcError.message?.includes('schema cache') || rpcError.code === 'PGRST202') {
          throw new Error('Database Deployment Error: issue_tax_invoice_with_accounting_atomic wrapper RPC is missing or not deployed on Supabase.');
        }
        throw rpcError;
      }

      await refreshAllSalesData();
      return { success: true, data };
    } catch (err) {
      console.error('[SalesContext] Error issuing tax invoice via atomic wrapper RPC:', err);
      return { success: false, error: err.message || err };
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Record Sales Payment with Authoritative Atomic Server Wrapper
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

      const pmtAmount = Number(payload.amount) || 0;
      let accountingObj = null;

      if (pmtAmount > 0 && activeOperatingCompanyId) {
        const { data: coa } = await supabase
          .from('chart_of_accounts')
          .select('id, account_type, account_subtype, account_code, control_account_type')
          .or(`tenant_company_id.eq.${activeOperatingCompanyId},tenant_id.eq.${tenantId}`);

        const arAcc = coa?.find(a => a.control_account_type === 'accounts_receivable' || a.account_subtype === 'receivable' || a.account_code === '1010' || a.account_code === 'QA-1010' || a.account_type === 'asset');
        const { data: bnkData } = await supabase
          .from('accounting_bank_accounts')
          .select('id, ledger_account_id')
          .or(`tenant_company_id.eq.${activeOperatingCompanyId},tenant_id.eq.${tenantId}`)
          .limit(1);

        let bankOrCashAccId = bnkData && bnkData.length > 0 ? bnkData[0].ledger_account_id : null;
        if (!bankOrCashAccId) {
          const bankAcc = coa?.find(a => a.control_account_type === 'bank' || a.control_account_type === 'cash' || a.account_subtype === 'bank' || a.account_subtype === 'cash' || a.account_code === '1020' || a.account_code === 'QA-1020');
          if (bankAcc) bankOrCashAccId = bankAcc.id;
        }

        if (arAcc?.id && bankOrCashAccId) {
          accountingObj = {
            post_accounting: true,
            ar_account_id: arAcc.id,
            bank_account_id: bankOrCashAccId
          };
        }
      }

      // Sole Production Path: Server-authoritative atomic wrapper RPC
      const { data, error: rpcError } = await supabase.rpc('record_sales_payment_with_accounting_atomic', {
        p_payment_json: payload,
        p_accounting_json: accountingObj
      });

      if (rpcError) {
        if (rpcError.message?.includes('schema cache') || rpcError.code === 'PGRST202') {
          throw new Error('Database Deployment Error: record_sales_payment_with_accounting_atomic wrapper RPC is missing or not deployed on Supabase.');
        }
        throw rpcError;
      }

      await refreshAllSalesData();
      return { success: true, data };
    } catch (err) {
      console.error('[SalesContext] Error recording sales payment via atomic wrapper RPC:', err);
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
