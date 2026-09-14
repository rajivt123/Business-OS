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

// --- Deterministic Ledger Resolution Helpers (Using ONLY valid chart_of_accounts fields) ---
const resolveArAccount = (accounts) => {
  if (!accounts || accounts.length === 0) return null;
  // 1. Exact known account code
  let acc = accounts.find(a => ['1100', '1010', 'QA-1010', 'AR-1000'].includes(a.account_code));
  if (acc) return acc;

  // 2. Exact account_subtype
  acc = accounts.find(a => {
    const sub = (a.account_subtype || '').toUpperCase();
    return sub === 'RECEIVABLE' || sub === 'ACCOUNTS_RECEIVABLE';
  });
  if (acc) return acc;

  // 3. Exact account_name matching
  acc = accounts.find(a => {
    const name = (a.account_name || '').toLowerCase();
    return name.includes('accounts receivable') || name.includes('trade debtors') || name.includes('debtors') || name === 'receivables';
  });
  if (acc) return acc;

  return null;
};

const resolveRevenueAccount = (accounts) => {
  if (!accounts || accounts.length === 0) return null;
  // 1. Exact known account code
  let acc = accounts.find(a => ['4000', '4010', 'QA-4010', 'REV-4000'].includes(a.account_code));
  if (acc) return acc;

  // 2. Exact account_subtype
  acc = accounts.find(a => {
    const sub = (a.account_subtype || '').toUpperCase();
    return sub === 'REVENUE' || sub === 'SALES_REVENUE' || sub === 'SALES';
  });
  if (acc) return acc;

  // 3. Exact account_name matching
  acc = accounts.find(a => {
    const name = (a.account_name || '').toLowerCase();
    return name.includes('sales revenue') || name.includes('sales income') || name === 'revenue' || name === 'operating revenue';
  });
  if (acc) return acc;

  return null;
};

const resolveTaxAccount = (accounts, taxType) => {
  if (!accounts || accounts.length === 0) return null;
  const target = taxType.toLowerCase();

  const codeMap = {
    cgst: ['2010', 'QA-2010', 'DUTIES-CGST', '2110'],
    sgst: ['2020', 'QA-2020', 'DUTIES-SGST', '2120'],
    igst: ['2030', 'QA-2030', 'DUTIES-IGST', '2130']
  };

  // 1. Exact known account code
  let acc = accounts.find(a => codeMap[target]?.includes(a.account_code));
  if (acc) return acc;

  // 2. Exact account_subtype with name matching
  acc = accounts.find(a => {
    const sub = (a.account_subtype || '').toUpperCase();
    const isTaxSub = sub === 'TAX' || sub === 'DUTIES' || sub === 'DUTIES_AND_TAXES';
    const name = (a.account_name || '').toLowerCase();
    return isTaxSub && name.includes(target);
  });
  if (acc) return acc;

  // 3. Exact account_name matching
  acc = accounts.find(a => {
    const name = (a.account_name || '').toLowerCase();
    return name.includes(`output ${target}`) || name.includes(`${target} payable`) || name.includes(`${target} output`) || name === target;
  });
  if (acc) return acc;

  return null;
};

const resolveBankOrCashAccount = (accounts, bankAccounts, selectedBankAccountId) => {
  if (selectedBankAccountId && bankAccounts && bankAccounts.length > 0) {
    const bnk = bankAccounts.find(b => b.id === selectedBankAccountId);
    if (bnk && bnk.ledger_account_id) return bnk.ledger_account_id;
  }

  if (bankAccounts && bankAccounts.length > 0) {
    const primaryBnk = bankAccounts.find(b => b.ledger_account_id);
    if (primaryBnk && primaryBnk.ledger_account_id) return primaryBnk.ledger_account_id;
  }

  if (!accounts || accounts.length === 0) return null;

  let acc = accounts.find(a => ['1020', 'QA-1020', '1000', '1030', 'BANK-1000'].includes(a.account_code));
  if (acc) return acc.id;

  acc = accounts.find(a => {
    const sub = (a.account_subtype || '').toUpperCase();
    return sub === 'BANK' || sub === 'CASH';
  });
  if (acc) return acc.id;

  acc = accounts.find(a => {
    const name = (a.account_name || '').toLowerCase();
    return name.includes('bank') || name.includes('cash');
  });
  if (acc) return acc.id;

  return null;
};

const formatRpcError = (rpcError, defaultActionMessage) => {
  if (!rpcError) return defaultActionMessage;
  const msg = rpcError.message || rpcError.details || rpcError.hint || '';
  if (msg.includes('duplicate key') || msg.includes('idempotency') || msg.includes('already exists') || rpcError.code === '23505') {
    return 'Duplicate operation detected: This transaction has already been recorded under the provided idempotency key.';
  }
  if (msg.includes('schema cache') || rpcError.code === 'PGRST202' || msg.includes('Could not find the function')) {
    return `Database Deployment Error: Server-authoritative RPC for ${defaultActionMessage} is missing or not deployed on Supabase.`;
  }
  if (msg.includes('permission denied') || rpcError.code === '42501') {
    return 'Unauthorized: Permission denied for this sales accounting operation.';
  }
  if (msg.includes('account') || msg.includes('chart_of_accounts') || msg.includes('ledger')) {
    return `Accounting Ledger Error: ${msg}`;
  }
  return msg || defaultActionMessage;
};

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
  const [bankAccounts, setBankAccounts] = useState([]);

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

  // 6. Fetch Bank Accounts
  const fetchBankAccounts = useCallback(async () => {
    try {
      let query = supabase
        .from('accounting_bank_accounts')
        .select('id, account_name, bank_name, account_number, ledger_account_id')
        .order('created_at', { ascending: false });

      if (tenantId) query = query.eq('tenant_id', tenantId);
      if (activeOperatingCompanyId) query = query.eq('tenant_company_id', activeOperatingCompanyId);

      const { data, error: err } = await query;
      if (err) throw err;
      setBankAccounts(data || []);
    } catch (err) {
      console.error('[SalesContext] Error fetching bank accounts:', err);
      setBankAccounts([]);
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
        fetchSalesPayments(),
        fetchBankAccounts()
      ]);
    } catch (err) {
      console.error('[SalesContext] Error loading sales module data:', err);
      setError(err.message || 'Failed to load Sales data');
    } finally {
      setIsLoading(false);
    }
  }, [authUserId, fetchQuotations, fetchSalesOrders, fetchProformaInvoices, fetchTaxInvoices, fetchSalesPayments, fetchBankAccounts]);

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

      const { data, error: rpcError } = await supabase.rpc('create_sales_quotation_atomic', {
        p_header_json: header,
        p_items_json: itemsPayload
      });

      if (rpcError) throw rpcError;

      await refreshAllSalesData();
      return { success: true, data };
    } catch (err) {
      console.error('[SalesContext] Error creating quotation via RPC:', err);
      return { success: false, error: formatRpcError(err, 'creating quotation') };
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Convert Quotation to Sales Order
  const convertQuotationToSalesOrder = async (quotationId) => {
    if (!isManagementOrAdmin) throw new Error('Unauthorized: Permission denied');
    setIsLoading(true);
    try {
      const { data, error: rpcError } = await supabase.rpc('convert_quotation_to_sales_order_atomic', {
        p_quotation_id: quotationId,
        p_order_date: new Date().toISOString().slice(0, 10)
      });

      if (rpcError) throw rpcError;

      await refreshAllSalesData();
      return { success: true, data };
    } catch (err) {
      console.error('[SalesContext] Error converting quotation via RPC:', err);
      return { success: false, error: formatRpcError(err, 'converting quotation to sales order') };
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

      const { data, error: rpcError } = await supabase.rpc('create_proforma_invoice_atomic', {
        p_header_json: header,
        p_items_json: itemsPayload
      });

      if (rpcError) throw rpcError;

      await refreshAllSalesData();
      return { success: true, data };
    } catch (err) {
      console.error('[SalesContext] Error creating proforma invoice via RPC:', err);
      return { success: false, error: formatRpcError(err, 'creating proforma invoice') };
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

      // Determine stable idempotency key
      const idempotencyKey = headerPayload.sales_order_id
        ? `SALES-INVOICE-${headerPayload.sales_order_id}`
        : `SALES-INVOICE-${headerPayload.operation_key || headerPayload.idempotency_key || 'DIRECT-OPS'}`;

      const header = {
        tenant_id: tenantId,
        tenant_company_id: activeOperatingCompanyId,
        created_by: authUserId,
        status: 'issued',
        amount_paid: 0,
        balance_due: grandTotal,
        idempotency_key: idempotencyKey,
        ...headerPayload
      };

      let accountingObj = null;
      if (grandTotal > 0 && activeOperatingCompanyId) {
        const { data: coa, error: coaErr } = await supabase
          .from('chart_of_accounts')
          .select('id, account_code, account_name, account_type, account_subtype, is_control_account, is_system_account, is_active')
          .or(`tenant_company_id.eq.${activeOperatingCompanyId},tenant_id.eq.${tenantId}`);

        if (coaErr) {
          throw new Error(`Failed to query chart of accounts: ${coaErr.message}`);
        }

        const activeCoa = (coa || []).filter(a => a.is_active !== false);

        const arAcc = resolveArAccount(activeCoa);
        const revAcc = resolveRevenueAccount(activeCoa);

        const cgstAmt = Number(headerPayload.cgst_amount) || 0;
        const sgstAmt = Number(headerPayload.sgst_amount) || 0;
        const igstAmt = Number(headerPayload.igst_amount) || 0;

        const cgstAcc = cgstAmt > 0 ? resolveTaxAccount(activeCoa, 'cgst') : null;
        const sgstAcc = sgstAmt > 0 ? resolveTaxAccount(activeCoa, 'sgst') : null;
        const igstAcc = igstAmt > 0 ? resolveTaxAccount(activeCoa, 'igst') : null;

        // Strict mapping validation per Requirement 2
        if (!arAcc || !revAcc || (cgstAmt > 0 && !cgstAcc) || (sgstAmt > 0 && !sgstAcc) || (igstAmt > 0 && !igstAcc)) {
          return {
            success: false,
            error: 'Sales accounting configuration is incomplete. Configure the required AR, Revenue and GST accounts.'
          };
        }

        accountingObj = {
          post_accounting: true,
          ar_account_id: arAcc.id,
          revenue_account_id: revAcc.id,
          cgst_account_id: cgstAcc?.id || null,
          sgst_account_id: sgstAcc?.id || null,
          igst_account_id: igstAcc?.id || null,
          idempotency_key: idempotencyKey
        };
      }

      // Sole Production Path: Server-authoritative atomic wrapper RPC
      const { data, error: rpcError } = await supabase.rpc('issue_tax_invoice_with_accounting_atomic', {
        p_header_json: header,
        p_items_json: itemsPayload,
        p_accounting_json: accountingObj
      });

      if (rpcError) {
        return { success: false, error: formatRpcError(rpcError, 'issuing tax invoice') };
      }

      await refreshAllSalesData();
      return { success: true, data };
    } catch (err) {
      console.error('[SalesContext] Error issuing tax invoice via atomic wrapper RPC:', err);
      return { success: false, error: err.message || 'Failed to issue tax invoice' };
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Record Sales Payment with Authoritative Atomic Server Wrapper
  const recordSalesPayment = async (paymentPayload) => {
    if (!isManagementOrAdmin) throw new Error('Unauthorized: Permission denied');
    setIsLoading(true);
    try {
      const pmtAmount = Number(paymentPayload.amount) || 0;

      const idempotencyKey = `SALES-PAYMENT-${paymentPayload.operation_key || paymentPayload.idempotency_key || 'PMT-OPS'}`;

      const payload = {
        tenant_id: tenantId,
        tenant_company_id: activeOperatingCompanyId,
        recorded_by: authUserId,
        payment_date: new Date().toISOString().slice(0, 10),
        idempotency_key: idempotencyKey,
        ...paymentPayload
      };

      let accountingObj = null;

      if (pmtAmount > 0 && activeOperatingCompanyId) {
        const { data: coa, error: coaErr } = await supabase
          .from('chart_of_accounts')
          .select('id, account_code, account_name, account_type, account_subtype, is_control_account, is_system_account, is_active')
          .or(`tenant_company_id.eq.${activeOperatingCompanyId},tenant_id.eq.${tenantId}`);

        if (coaErr) {
          throw new Error(`Failed to query chart of accounts: ${coaErr.message}`);
        }

        const activeCoa = (coa || []).filter(a => a.is_active !== false);

        const arAcc = resolveArAccount(activeCoa);
        const bankOrCashAccId = resolveBankOrCashAccount(activeCoa, bankAccounts, paymentPayload.bank_account_id);

        if (!arAcc || !bankOrCashAccId) {
          return {
            success: false,
            error: 'Sales payment accounting configuration is incomplete. Configure the required AR and Bank/Cash accounts.'
          };
        }

        accountingObj = {
          post_accounting: true,
          ar_account_id: arAcc.id,
          bank_account_id: bankOrCashAccId,
          idempotency_key: idempotencyKey
        };
      }

      // Sole Production Path: Server-authoritative atomic wrapper RPC
      const { data, error: rpcError } = await supabase.rpc('record_sales_payment_with_accounting_atomic', {
        p_payment_json: payload,
        p_accounting_json: accountingObj
      });

      if (rpcError) {
        return { success: false, error: formatRpcError(rpcError, 'recording sales payment') };
      }

      await refreshAllSalesData();
      return { success: true, data };
    } catch (err) {
      console.error('[SalesContext] Error recording sales payment via atomic wrapper RPC:', err);
      return { success: false, error: err.message || 'Failed to record sales payment' };
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
    bankAccounts,
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
