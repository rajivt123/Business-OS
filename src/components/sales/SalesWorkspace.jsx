import { useState } from 'react';
import { useSales } from '../../context/SalesContext';
import {
  FileText,
  Plus,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Receipt,
  CreditCard,
  Building2,
  Calendar,
  X,
  Search,
  Filter,
  Eye,
  ShieldAlert,
  BadgePercent,
  Layers,
  ChevronRight,
  DollarSign
} from 'lucide-react';

const generateUuid = () => (typeof crypto !== 'undefined' && crypto?.randomUUID ? crypto.randomUUID() : 'uuid-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now().toString(36));

export default function SalesWorkspace() {
  const salesContext = useSales() || {};
  const {
    quotations = [],
    salesOrders = [],
    proformaInvoices = [],
    taxInvoices = [],
    salesPayments = [],
    bankAccounts = [],
    isLoading = false,
    error = null,
    isManagementOrAdmin = false,
    companies = [],
    enquiries = [],
    works = [],
    createSalesQuotation,
    convertQuotationToSalesOrder,
    createProformaInvoice,
    issueTaxInvoice,
    recordSalesPayment,
    refreshAllSalesData
  } = salesContext;

  const safeQuotations = Array.isArray(quotations) ? quotations : [];
  const safeSalesOrders = Array.isArray(salesOrders) ? salesOrders : [];
  const safeProformaInvoices = Array.isArray(proformaInvoices) ? proformaInvoices : [];
  const safeTaxInvoices = Array.isArray(taxInvoices) ? taxInvoices : [];
  const safeSalesPayments = Array.isArray(salesPayments) ? salesPayments : [];
  const safeBankAccounts = Array.isArray(bankAccounts) ? bankAccounts : [];
  const safeCompanies = Array.isArray(companies) ? companies : [];
  const safeEnquiries = Array.isArray(enquiries) ? enquiries : [];
  const safeWorks = Array.isArray(works) ? works : [];

  const [activeTab, setActiveTab] = useState('quotations'); // 'quotations' | 'proforma' | 'orders' | 'invoices' | 'payments'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [isProformaModalOpen, setIsProformaModalOpen] = useState(false);
  const [isTaxInvoiceModalOpen, setIsTaxInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  // --- Quotation Form State ---
  const [qtnForm, setQtnForm] = useState({
    company_id: '',
    enquiry_id: '',
    work_id: '',
    quotation_date: new Date().toISOString().slice(0, 10),
    valid_until: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    customer_gstin: '',
    place_of_supply: 'Maharashtra (27)',
    reverse_charge: false,
    notes: '',
    terms_and_conditions: '1. Standard 30 days validity.\n2. 50% advance along with purchase order.\n3. Taxes extra as applicable.'
  });

  const [qtnItems, setQtnItems] = useState([
    { item_description: '', hsn_sac_code: '998311', quantity: 1, unit_price: 0, gst_rate_pct: 18 }
  ]);

  // --- Proforma Form State ---
  const [piForm, setPiForm] = useState({
    company_id: '',
    enquiry_id: '',
    work_id: '',
    pi_date: new Date().toISOString().slice(0, 10),
    due_date: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
    customer_gstin: '',
    place_of_supply: 'Maharashtra (27)',
    notes: ''
  });
  const [piItems, setPiItems] = useState([
    { item_description: '', hsn_sac_code: '998311', quantity: 1, unit_price: 0, gst_rate_pct: 18 }
  ]);

  // --- Tax Invoice Form State ---
  const [invForm, setInvForm] = useState({
    company_id: '',
    enquiry_id: '',
    work_id: '',
    invoice_date: new Date().toISOString().slice(0, 10),
    due_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    customer_gstin: '',
    place_of_supply: 'Maharashtra (27)',
    notes: '',
    operation_key: generateUuid()
  });
  const [invItems, setInvItems] = useState([
    { item_description: '', hsn_sac_code: '998311', quantity: 1, unit_price: 0, gst_rate_pct: 18 }
  ]);

  // --- Payment Form State ---
  const [payForm, setPayForm] = useState({
    tax_invoice_id: '',
    amount: 0,
    payment_mode: 'bank_transfer',
    reference_number: '',
    bank_account_id: '',
    notes: '',
    operation_key: generateUuid()
  });

  // Calculate Summary Metrics
  const openQuotationsValue = safeQuotations
    .filter(q => q && (q.status === 'draft' || q.status === 'sent'))
    .reduce((acc, q) => acc + (Number(q?.total_amount) || 0), 0);

  const activeOrdersValue = safeSalesOrders
    .filter(o => o && o.status !== 'cancelled')
    .reduce((acc, o) => acc + (Number(o?.total_amount) || 0), 0);

  const totalInvoicedValue = safeTaxInvoices
    .filter(i => i && i.status !== 'cancelled')
    .reduce((acc, i) => acc + (Number(i?.total_amount) || 0), 0);

  const totalReceivablesBalance = safeTaxInvoices
    .filter(i => i && i.status !== 'cancelled')
    .reduce((acc, i) => acc + (Number(i?.balance_due) || 0), 0);

  // Line Items Calculation Helper
  const computeLineTotals = (items) => {
    return items.map(item => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unit_price) || 0;
      const gstPct = Number(item.gst_rate_pct) || 0;
      const taxable = qty * price;
      const cgstRate = gstPct / 2;
      const sgstRate = gstPct / 2;
      const cgstAmt = (taxable * cgstRate) / 100;
      const sgstAmt = (taxable * sgstRate) / 100;
      const lineTotal = taxable + cgstAmt + sgstAmt;
      return {
        ...item,
        taxable_value: taxable,
        cgst_rate: cgstRate,
        sgst_rate: sgstRate,
        igst_rate: 0,
        cgst_amount: cgstAmt,
        sgst_amount: sgstAmt,
        igst_amount: 0,
        line_total: lineTotal
      };
    });
  };

  const computeHeaderTotals = (computedItems) => {
    const subtotal = computedItems.reduce((sum, item) => sum + item.taxable_value, 0);
    const cgstTotal = computedItems.reduce((sum, item) => sum + item.cgst_amount, 0);
    const sgstTotal = computedItems.reduce((sum, item) => sum + item.sgst_amount, 0);
    const taxTotal = cgstTotal + sgstTotal;
    const grandTotal = subtotal + taxTotal;
    return {
      subtotal,
      cgst_amount: cgstTotal,
      sgst_amount: sgstTotal,
      igst_amount: 0,
      tax_amount: taxTotal,
      total_amount: grandTotal
    };
  };

  // Submit Handlers
  const handleSaveQuotation = async (e) => {
    e.preventDefault();
    if (!qtnForm.company_id) {
      alert('Please select a customer company');
      return;
    }
    const computedItems = computeLineTotals(qtnItems);
    const totals = computeHeaderTotals(computedItems);
    const selectedCompany = safeCompanies.find(c => c.id === qtnForm.company_id);

    const header = {
      company_id: qtnForm.company_id,
      enquiry_id: qtnForm.enquiry_id || null,
      work_id: qtnForm.work_id || null,
      customer_name: selectedCompany?.name || '',
      quotation_date: qtnForm.quotation_date,
      valid_until: qtnForm.valid_until,
      customer_gstin: qtnForm.customer_gstin,
      place_of_supply: qtnForm.place_of_supply,
      reverse_charge: qtnForm.reverse_charge,
      subtotal: totals.subtotal,
      cgst_amount: totals.cgst_amount,
      sgst_amount: totals.sgst_amount,
      igst_amount: 0,
      tax_amount: totals.tax_amount,
      total_amount: totals.total_amount,
      notes: qtnForm.notes,
      terms_and_conditions: qtnForm.terms_and_conditions,
      status: 'draft'
    };

    const res = await createSalesQuotation(header, computedItems);
    if (res.success) {
      setIsQuotationModalOpen(false);
      setQtnItems([{ item_description: '', hsn_sac_code: '998311', quantity: 1, unit_price: 0, gst_rate_pct: 18 }]);
    } else {
      alert('Failed to save quotation: ' + (res.error || 'Unknown error'));
    }
  };

  const [isConverting, setIsConverting] = useState(false);

  const handleConvertQuotation = async (qtnId) => {
    if (isConverting) return;
    if (!confirm('Are you sure you want to convert this accepted Quotation into a Sales Order?')) return;
    setIsConverting(true);
    try {
      const res = await convertQuotationToSalesOrder(qtnId);
      if (res.success) {
        alert('Quotation successfully converted to Sales Order!');
        setActiveTab('orders');
      } else {
        alert('Conversion failed: ' + res.error);
      }
    } finally {
      setIsConverting(false);
    }
  };

  const [salesModalError, setSalesModalError] = useState(null);
  const [isSubmittingProforma, setIsSubmittingProforma] = useState(false);
  const [isSubmittingTaxInvoice, setIsSubmittingTaxInvoice] = useState(false);

  const handleSaveProforma = async (e) => {
    e.preventDefault();
    setSalesModalError(null);
    if (!piForm.company_id) {
      setSalesModalError('Please select a customer company');
      return;
    }
    if (isSubmittingProforma) return;
    setIsSubmittingProforma(true);
    try {
      const computedItems = computeLineTotals(piItems);
      const totals = computeHeaderTotals(computedItems);
      const selectedCompany = safeCompanies.find(c => c.id === piForm.company_id);

      const header = {
        company_id: piForm.company_id,
        sales_order_id: piForm.sales_order_id || null,
        enquiry_id: piForm.enquiry_id || null,
        work_id: piForm.work_id || null,
        customer_name: selectedCompany?.name || '',
        pi_date: piForm.pi_date,
        due_date: piForm.due_date,
        customer_gstin: piForm.customer_gstin,
        place_of_supply: piForm.place_of_supply,
        subtotal: totals.subtotal,
        cgst_amount: totals.cgst_amount,
        sgst_amount: totals.sgst_amount,
        igst_amount: 0,
        tax_amount: totals.tax_amount,
        total_amount: totals.total_amount,
        notes: piForm.notes,
        status: 'issued'
      };

      const res = await createProformaInvoice(header, computedItems);
      if (res.success) {
        setIsProformaModalOpen(false);
        setPiForm({ company_id: '', enquiry_id: '', work_id: '', sales_order_id: '', pi_date: new Date().toISOString().slice(0, 10), due_date: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10), customer_gstin: '', place_of_supply: 'Maharashtra (27)', notes: '' });
        setPiItems([{ item_description: '', hsn_sac_code: '998311', quantity: 1, unit_price: 0, gst_rate_pct: 18 }]);
      } else {
        setSalesModalError(res.error || 'Failed to create Proforma Invoice');
      }
    } catch (err) {
      setSalesModalError(err.message || 'Failed to create Proforma Invoice');
    } finally {
      setIsSubmittingProforma(false);
    }
  };

  const handleIssueTaxInvoice = async (e) => {
    e.preventDefault();
    setSalesModalError(null);
    if (!invForm.company_id) {
      setSalesModalError('Please select a customer company');
      return;
    }
    if (invForm.sales_order_id) {
      const selectedSo = safeSalesOrders.find(so => so.id === invForm.sales_order_id);
      if (selectedSo && selectedSo.company_id && selectedSo.company_id !== invForm.company_id) {
        setSalesModalError('Cross-company validation error: Sales Order does not belong to the selected customer company.');
        return;
      }
    }
    if (isSubmittingTaxInvoice) return;
    setIsSubmittingTaxInvoice(true);
    try {
      const computedItems = computeLineTotals(invItems);
      const totals = computeHeaderTotals(computedItems);
      const selectedCompany = safeCompanies.find(c => c.id === invForm.company_id);

      const header = {
        company_id: invForm.company_id,
        sales_order_id: invForm.sales_order_id || null,
        enquiry_id: invForm.enquiry_id || null,
        work_id: invForm.work_id || null,
        customer_name: selectedCompany?.name || '',
        invoice_date: invForm.invoice_date,
        due_date: invForm.due_date,
        customer_gstin: invForm.customer_gstin,
        place_of_supply: invForm.place_of_supply,
        subtotal: totals.subtotal,
        cgst_amount: totals.cgst_amount,
        sgst_amount: totals.sgst_amount,
        igst_amount: 0,
        tax_amount: totals.tax_amount,
        total_amount: totals.total_amount,
        notes: invForm.notes,
        operation_key: invForm.operation_key
      };

      const res = await issueTaxInvoice(header, computedItems);
      if (res.success) {
        setIsTaxInvoiceModalOpen(false);
        setInvForm({ company_id: '', enquiry_id: '', work_id: '', sales_order_id: '', invoice_date: new Date().toISOString().slice(0, 10), due_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10), customer_gstin: '', place_of_supply: 'Maharashtra (27)', notes: '', operation_key: generateUuid() });
        setInvItems([{ item_description: '', hsn_sac_code: '998311', quantity: 1, unit_price: 0, gst_rate_pct: 18 }]);
      } else {
        setSalesModalError(res.error || 'Failed to issue Tax Invoice');
      }
    } catch (err) {
      setSalesModalError(err.message || 'Failed to issue Tax Invoice');
    } finally {
      setIsSubmittingTaxInvoice(false);
    }
  };

  const handleRecordPaymentSubmit = async (e) => {
    e.preventDefault();
    setSalesModalError(null);
    if (!payForm.tax_invoice_id || !payForm.amount || Number(payForm.amount) <= 0) {
      setSalesModalError('Please select a valid tax invoice and enter a positive payment amount');
      return;
    }

    const res = await recordSalesPayment({
      tax_invoice_id: payForm.tax_invoice_id,
      amount: Number(payForm.amount),
      payment_mode: payForm.payment_mode,
      reference_number: payForm.reference_number,
      bank_account_id: payForm.bank_account_id || null,
      operation_key: payForm.operation_key,
      notes: payForm.notes
    });

    if (res.success) {
      setIsPaymentModalOpen(false);
      setPayForm({ tax_invoice_id: '', amount: 0, payment_mode: 'bank_transfer', reference_number: '', bank_account_id: '', notes: '', operation_key: generateUuid() });
    } else {
      setSalesModalError(res.error || 'Failed to record payment');
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Receipt size={20} />
            </span>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Sales & Receivables P0</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Quotations, Sales Orders, Tax Invoices, GST Breakdown & Payment Ledger</p>
            </div>
          </div>
        </div>

        {isManagementOrAdmin ? (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsQuotationModalOpen(true)}
              className="os-primary flex items-center gap-1.5 cursor-pointer text-xs font-bold px-3 py-2"
            >
              <Plus size={15} /> New Quotation
            </button>
            <button
              onClick={() => setIsProformaModalOpen(true)}
              className="os-secondary flex items-center gap-1.5 cursor-pointer text-xs font-bold px-3 py-2"
            >
              <Plus size={15} /> New Proforma
            </button>
            <button
              onClick={() => setIsTaxInvoiceModalOpen(true)}
              className="os-secondary flex items-center gap-1.5 cursor-pointer text-xs font-bold px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
            >
              <Plus size={15} /> Issue Tax Invoice
            </button>
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="os-secondary flex items-center gap-1.5 cursor-pointer text-xs font-bold px-3 py-2 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
            >
              <CreditCard size={15} /> Record Payment
            </button>
          </div>
        ) : (
          <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <ShieldAlert size={14} /> Read-Only View (Viewer Mode)
          </div>
        )}
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Open Quotations</span>
            <span className="text-lg font-black text-slate-900 dark:text-white mt-1 block">₹{openQuotationsValue.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">{safeQuotations.length} total quotes</span>
          </div>
          <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400">
            <FileText size={22} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Active Sales Orders</span>
            <span className="text-lg font-black text-slate-900 dark:text-white mt-1 block">₹{activeOrdersValue.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">{safeSalesOrders.length} confirmed orders</span>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <TrendingUp size={22} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Invoiced</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1 block">₹{totalInvoicedValue.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">{safeTaxInvoices.length} tax invoices</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <Receipt size={22} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Balance Receivables</span>
            <span className="text-lg font-black text-rose-600 dark:text-rose-400 mt-1 block">₹{totalReceivablesBalance.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">{safeSalesPayments.length} payments recorded</span>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
            <DollarSign size={22} />
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('quotations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'quotations'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText size={15} /> Quotations ({safeQuotations.length})
        </button>

        <button
          onClick={() => setActiveTab('proforma')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'proforma'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Receipt size={15} /> Proforma Invoices ({safeProformaInvoices.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <TrendingUp size={15} /> Sales Orders ({safeSalesOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'invoices'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Receipt size={15} /> Tax Invoices ({safeTaxInvoices.length})
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'payments'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CreditCard size={15} /> Payments & Receivables ({safeSalesPayments.length})
        </button>
      </div>

      {/* Tab 1: Quotations Register */}
      {activeTab === 'quotations' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Quotations Register</h3>
            <span className="text-xs text-slate-400 font-medium">{safeQuotations.length} records</span>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading quotations...</div>
          ) : safeQuotations.length === 0 ? (
            <div className="p-12 text-center">
              <FileText size={32} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No Quotations Found</p>
              <p className="text-[11px] text-slate-400 mt-1">Create a new quotation to get started with client estimates.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-black tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Quote #</th>
                    <th className="px-4 py-3">Customer Company</th>
                    <th className="px-4 py-3">Linked CRM Lead/Work</th>
                    <th className="px-4 py-3">Quote Date</th>
                    <th className="px-4 py-3 text-right">Subtotal</th>
                    <th className="px-4 py-3 text-right">GST Tax</th>
                    <th className="px-4 py-3 text-right">Grand Total</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {safeQuotations.map(q => (
                    <tr key={q.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-bold text-sky-600 dark:text-sky-400">{q.quotation_no || `QT-${q.id.slice(0,6)}`}</td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-900 dark:text-white block">{q.company?.name || q.customer_name || 'Customer'}</span>
                        {q.customer_gstin && <span className="text-[10px] text-slate-400 block">GSTIN: {q.customer_gstin}</span>}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-500">
                        {q.work?.title ? <span className="p-1 rounded bg-sky-50 dark:bg-sky-950/50 text-sky-600 block truncate max-w-[150px]">Project: {q.work.title}</span> : null}
                        {q.enquiry?.title ? <span className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 block truncate max-w-[150px] mt-0.5">Lead: {q.enquiry.title}</span> : null}
                        {!q.work?.title && !q.enquiry?.title && <span className="text-slate-400 italic">None</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{q.quotation_date ? q.quotation_date.slice(0, 10) : '-'}</td>
                      <td className="px-4 py-3 text-right">₹{Number(q.subtotal || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-right text-slate-500">₹{Number(q.tax_amount || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">₹{Number(q.total_amount || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                          q.status === 'converted' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                          q.status === 'sent' || q.status === 'accepted' ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300' :
                          'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {q.status || 'draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        {isManagementOrAdmin && q.status !== 'converted' && (
                          <button
                            onClick={() => handleConvertQuotation(q.id)}
                            className="px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-100 text-[10px] font-bold transition cursor-pointer"
                          >
                            Convert to Order
                          </button>
                        )}
                        <button
                          onClick={() => setPreviewDoc({ type: 'Quotation', data: q })}
                          className="p-1 rounded text-slate-400 hover:text-sky-500 transition"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Proforma Invoices Register */}
      {activeTab === 'proforma' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Proforma Invoices Register</h3>
            <span className="text-xs text-slate-400 font-medium">{safeProformaInvoices.length} records</span>
          </div>

          {safeProformaInvoices.length === 0 ? (
            <div className="p-12 text-center">
              <Receipt size={32} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No Proforma Invoices Issued</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-black tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">PI #</th>
                    <th className="px-4 py-3">Customer Company</th>
                    <th className="px-4 py-3">PI Date</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3 text-right">Subtotal</th>
                    <th className="px-4 py-3 text-right">GST Tax</th>
                    <th className="px-4 py-3 text-right">Grand Total</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {safeProformaInvoices.map(pi => (
                    <tr key={pi.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-bold text-sky-600 dark:text-sky-400">{pi.pi_no || `PI-${pi.id.slice(0,6)}`}</td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{pi.company?.name || pi.customer_name}</td>
                      <td className="px-4 py-3 text-slate-500">{pi.pi_date ? pi.pi_date.slice(0, 10) : '-'}</td>
                      <td className="px-4 py-3 text-slate-500">{pi.due_date ? pi.due_date.slice(0, 10) : '-'}</td>
                      <td className="px-4 py-3 text-right">₹{Number(pi.subtotal || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-right text-slate-500">₹{Number(pi.tax_amount || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">₹{Number(pi.total_amount || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                          {pi.status || 'issued'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Sales Orders Register */}
      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Sales Orders Register</h3>
            <span className="text-xs text-slate-400 font-medium">{safeSalesOrders.length} records</span>
          </div>

          {safeSalesOrders.length === 0 ? (
            <div className="p-12 text-center">
              <TrendingUp size={32} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No Sales Orders Confirmed</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-black tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">SO #</th>
                    <th className="px-4 py-3">Quote Ref</th>
                    <th className="px-4 py-3">Customer Company</th>
                    <th className="px-4 py-3">Order Date</th>
                    <th className="px-4 py-3 text-right">Subtotal</th>
                    <th className="px-4 py-3 text-right">Tax</th>
                    <th className="px-4 py-3 text-right">Grand Total</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {safeSalesOrders.map(so => (
                    <tr key={so.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-bold text-indigo-600 dark:text-indigo-400">{so.so_no || `SO-${so.id.slice(0,6)}`}</td>
                      <td className="px-4 py-3 text-slate-500">{so.quotation?.quotation_no || '-'}</td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{so.company?.name || so.customer_name}</td>
                      <td className="px-4 py-3 text-slate-500">{so.order_date ? so.order_date.slice(0, 10) : '-'}</td>
                      <td className="px-4 py-3 text-right">₹{Number(so.subtotal || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-right text-slate-500">₹{Number(so.tax_amount || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">₹{Number(so.total_amount || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          {so.status || 'confirmed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Tax Invoices Register */}
      {activeTab === 'invoices' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Tax Invoices & Receivables Register</h3>
            <span className="text-xs text-slate-400 font-medium">{safeTaxInvoices.length} records</span>
          </div>

          {safeTaxInvoices.length === 0 ? (
            <div className="p-12 text-center">
              <Receipt size={32} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No Tax Invoices Issued</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-black tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Invoice #</th>
                    <th className="px-4 py-3">Customer Company</th>
                    <th className="px-4 py-3">Invoice Date</th>
                    <th className="px-4 py-3 text-right">Grand Total</th>
                    <th className="px-4 py-3 text-right">Amount Paid</th>
                    <th className="px-4 py-3 text-right">Balance Due</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {safeTaxInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">{inv.invoice_no || `INV-${inv.id.slice(0,6)}`}</td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{inv.company?.name || inv.customer_name}</td>
                      <td className="px-4 py-3 text-slate-500">{inv.invoice_date ? inv.invoice_date.slice(0, 10) : '-'}</td>
                      <td className="px-4 py-3 text-right font-bold">₹{Number(inv.total_amount || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-right text-emerald-600 font-bold">₹{Number(inv.amount_paid || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-right text-rose-600 font-extrabold">₹{Number(inv.balance_due || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                          inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                          inv.status === 'partially_paid' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                          'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {inv.status || 'issued'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Payments Register */}
      {activeTab === 'payments' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Sales Payment Receipts Ledger</h3>
            <span className="text-xs text-slate-400 font-medium">{safeSalesPayments.length} payments</span>
          </div>

          {safeSalesPayments.length === 0 ? (
            <div className="p-12 text-center">
              <CreditCard size={32} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No Payments Recorded</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-black tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Invoice #</th>
                    <th className="px-4 py-3">Customer Company</th>
                    <th className="px-4 py-3">Mode</th>
                    <th className="px-4 py-3">Ref / UTR #</th>
                    <th className="px-4 py-3 text-right">Amount Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {safeSalesPayments.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 text-slate-500">{p.payment_date ? p.payment_date.slice(0, 10) : '-'}</td>
                      <td className="px-4 py-3 font-bold text-sky-600 dark:text-sky-400">{p.tax_invoice?.invoice_no || `INV-${p.tax_invoice_id?.slice(0,6)}`}</td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{p.tax_invoice?.company?.name || 'Customer'}</td>
                      <td className="px-4 py-3 uppercase text-[10px] font-bold text-slate-500">{p.payment_mode || 'bank_transfer'}</td>
                      <td className="px-4 py-3 text-slate-500">{p.reference_number || '-'}</td>
                      <td className="px-4 py-3 text-right font-black text-emerald-600 dark:text-emerald-400">₹{Number(p.amount || 0).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- NEW QUOTATION MODAL --- */}
      {isQuotationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FileText size={18} className="text-sky-500" /> Create New Sales Quotation
              </h3>
              <button onClick={() => setIsQuotationModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveQuotation} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Customer Company *
                  </label>
                  <select
                    required
                    value={qtnForm.company_id}
                    onChange={(e) => setQtnForm({ ...qtnForm, company_id: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
                  >
                    <option value="">-- Select Customer Company --</option>
                    {safeCompanies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Linked CRM Lead (Optional)
                  </label>
                  <select
                    value={qtnForm.enquiry_id}
                    onChange={(e) => setQtnForm({ ...qtnForm, enquiry_id: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
                  >
                    <option value="">-- None / Select Enquiry --</option>
                    {safeEnquiries.map(enq => (
                      <option key={enq.id} value={enq.id}>{enq.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Linked CRM Project (Optional)
                  </label>
                  <select
                    value={qtnForm.work_id}
                    onChange={(e) => setQtnForm({ ...qtnForm, work_id: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
                  >
                    <option value="">-- None / Select Project --</option>
                    {safeWorks.map(w => (
                      <option key={w.id} value={w.id}>{w.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* GST & Date Fields */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Quotation Date</label>
                  <input
                    type="date"
                    value={qtnForm.quotation_date}
                    onChange={(e) => setQtnForm({ ...qtnForm, quotation_date: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Valid Until</label>
                  <input
                    type="date"
                    value={qtnForm.valid_until}
                    onChange={(e) => setQtnForm({ ...qtnForm, valid_until: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Customer GSTIN</label>
                  <input
                    type="text"
                    placeholder="e.g. 27AAAAA0000A1Z5"
                    value={qtnForm.customer_gstin}
                    onChange={(e) => setQtnForm({ ...qtnForm, customer_gstin: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Place of Supply</label>
                  <input
                    type="text"
                    value={qtnForm.place_of_supply}
                    onChange={(e) => setQtnForm({ ...qtnForm, place_of_supply: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>
              </div>

              {/* Line Items Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Line Items Breakdown</h4>
                  <button
                    type="button"
                    onClick={() => setQtnItems([...qtnItems, { item_description: '', hsn_sac_code: '998311', quantity: 1, unit_price: 0, gst_rate_pct: 18 }])}
                    className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={13} /> Add Line Item
                  </button>
                </div>

                <div className="space-y-2">
                  {qtnItems.map((item, idx) => {
                    const lineVal = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
                    const lineGst = (lineVal * (Number(item.gst_rate_pct) || 0)) / 100;
                    return (
                      <div key={idx} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 grid grid-cols-12 gap-2 items-center text-xs">
                        <div className="col-span-5">
                          <input
                            type="text"
                            placeholder="Item description / service detail"
                            value={item.item_description}
                            onChange={(e) => {
                              const updated = [...qtnItems];
                              updated[idx].item_description = e.target.value;
                              setQtnItems(updated);
                            }}
                            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="text"
                            placeholder="HSN/SAC"
                            value={item.hsn_sac_code}
                            onChange={(e) => {
                              const updated = [...qtnItems];
                              updated[idx].hsn_sac_code = e.target.value;
                              setQtnItems(updated);
                            }}
                            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-[11px]"
                          />
                        </div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => {
                              const updated = [...qtnItems];
                              updated[idx].quantity = e.target.value;
                              setQtnItems(updated);
                            }}
                            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            placeholder="Unit Price"
                            value={item.unit_price}
                            onChange={(e) => {
                              const updated = [...qtnItems];
                              updated[idx].unit_price = e.target.value;
                              setQtnItems(updated);
                            }}
                            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-right"
                          />
                        </div>
                        <div className="col-span-2 flex items-center justify-between pl-2">
                          <span className="font-bold text-slate-900 dark:text-white">₹{(lineVal + lineGst).toLocaleString('en-IN')}</span>
                          {qtnItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setQtnItems(qtnItems.filter((_, i) => i !== idx))}
                              className="text-rose-500 hover:text-rose-700"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsQuotationModalOpen(false)}
                  className="os-secondary text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="os-primary text-xs px-5 py-2 cursor-pointer"
                >
                  {isLoading ? 'Saving...' : 'Save & Issue Quotation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- NEW PROFORMA MODAL --- */}
      {isProformaModalOpen && (
        <div className="os-modal-backdrop">
          <div className="os-modal-content os-modal-2xl">
            <div className="os-modal-head">
              <h3 className="flex items-center gap-2">
                <Receipt size={18} className="text-sky-500" /> Create New Proforma Invoice
              </h3>
              <button onClick={() => setIsProformaModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <X size={18} />
              </button>
            </div>

            {salesModalError && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle size={16} /> {salesModalError}
              </div>
            )}

            <form onSubmit={handleSaveProforma} className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
              {/* Section 1: Customer & Order Linkage */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="os-label">Customer Company *</label>
                  <select
                    required
                    value={piForm.company_id}
                    onChange={(e) => setPiForm({ ...piForm, company_id: e.target.value })}
                    className="os-input"
                  >
                    <option value="">-- Select Customer Company --</option>
                    {safeCompanies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="os-label">Link Sales Order (Optional)</label>
                  <select
                    value={piForm.sales_order_id || ''}
                    onChange={(e) => {
                      const soId = e.target.value;
                      const so = safeSalesOrders.find(o => o.id === soId);
                      if (so) {
                        setPiForm({
                          ...piForm,
                          sales_order_id: soId,
                          company_id: so.company_id || piForm.company_id,
                          enquiry_id: so.enquiry_id || piForm.enquiry_id,
                          work_id: so.work_id || piForm.work_id,
                          customer_gstin: so.customer_gstin || piForm.customer_gstin,
                          place_of_supply: so.place_of_supply || piForm.place_of_supply
                        });
                        if (so.items && so.items.length > 0) {
                          setPiItems(so.items.map(item => ({
                            item_description: item.item_description,
                            hsn_sac_code: item.hsn_sac_code || '998311',
                            quantity: Number(item.quantity) || 1,
                            unit_price: Number(item.unit_price) || 0,
                            gst_rate_pct: Number(item.gst_rate_pct) || 18
                          })));
                        }
                      } else {
                        setPiForm({ ...piForm, sales_order_id: '' });
                      }
                    }}
                    className="os-input"
                  >
                    <option value="">-- Direct Proforma (No Order Linkage) --</option>
                    {safeSalesOrders.map(so => (
                      <option key={so.id} value={so.id}>
                        {so.so_no || `SO-${so.id.slice(0,6)}`} - {so.company?.name || so.customer_name} (₹{Number(so.total_amount || 0).toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="os-label">Linked Project (Optional)</label>
                  <select
                    value={piForm.work_id}
                    onChange={(e) => setPiForm({ ...piForm, work_id: e.target.value })}
                    className="os-input"
                  >
                    <option value="">-- None / Select Project --</option>
                    {safeWorks.map(w => (
                      <option key={w.id} value={w.id}>{w.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Section 2: Financial & Supply Attributes */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <div>
                  <label className="os-label">Proforma Date</label>
                  <input
                    type="date"
                    value={piForm.pi_date}
                    onChange={(e) => setPiForm({ ...piForm, pi_date: e.target.value })}
                    className="os-input"
                  />
                </div>
                <div>
                  <label className="os-label">Due Date</label>
                  <input
                    type="date"
                    value={piForm.due_date}
                    onChange={(e) => setPiForm({ ...piForm, due_date: e.target.value })}
                    className="os-input"
                  />
                </div>
                <div>
                  <label className="os-label">Customer GSTIN</label>
                  <input
                    type="text"
                    placeholder="e.g. 27AAAAA0000A1Z5"
                    value={piForm.customer_gstin}
                    onChange={(e) => setPiForm({ ...piForm, customer_gstin: e.target.value })}
                    className="os-input font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="os-label">Place of Supply</label>
                  <input
                    type="text"
                    value={piForm.place_of_supply}
                    onChange={(e) => setPiForm({ ...piForm, place_of_supply: e.target.value })}
                    className="os-input"
                  />
                </div>
              </div>

              {/* Section 3: Line Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Proforma Line Items</h4>
                  <button
                    type="button"
                    onClick={() => setPiItems([...piItems, { item_description: '', hsn_sac_code: '998311', quantity: 1, unit_price: 0, gst_rate_pct: 18 }])}
                    className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={13} /> Add Line Item
                  </button>
                </div>

                {/* Table Header Row */}
                <div className="hidden md:grid grid-cols-12 gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800/80 rounded-t-xl text-[10px] uppercase font-black tracking-wider text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  <div className="col-span-4">Item Description & Specifications</div>
                  <div className="col-span-2 text-center">HSN / SAC Code</div>
                  <div className="col-span-1 text-center">Qty</div>
                  <div className="col-span-2 text-right">Unit Price (₹)</div>
                  <div className="col-span-1 text-center">GST %</div>
                  <div className="col-span-2 text-right">Line Total (₹)</div>
                </div>

                <div className="space-y-2 md:space-y-0 md:divide-y md:divide-slate-200 dark:md:divide-slate-800 md:border md:border-t-0 md:border-slate-200 dark:md:border-slate-800 md:rounded-b-xl overflow-hidden">
                  {piItems.map((item, idx) => {
                    const lineVal = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
                    const lineGst = (lineVal * (Number(item.gst_rate_pct) || 0)) / 100;
                    return (
                      <div key={idx} className="p-3 bg-white dark:bg-slate-900 grid grid-cols-1 md:grid-cols-12 gap-2 items-center text-xs">
                        <div className="md:col-span-4">
                          <label className="md:hidden os-label">Item Description</label>
                          <input
                            type="text"
                            placeholder="Item description & specs"
                            value={item.item_description}
                            onChange={(e) => {
                              const updated = [...piItems];
                              updated[idx].item_description = e.target.value;
                              setPiItems(updated);
                            }}
                            className="os-input"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="md:hidden os-label">HSN / SAC Code</label>
                          <input
                            type="text"
                            placeholder="998311"
                            value={item.hsn_sac_code}
                            onChange={(e) => {
                              const updated = [...piItems];
                              updated[idx].hsn_sac_code = e.target.value;
                              setPiItems(updated);
                            }}
                            className="os-input font-mono text-center uppercase"
                          />
                        </div>
                        <div className="md:col-span-1">
                          <label className="md:hidden os-label">Qty</label>
                          <input
                            type="number"
                            min="1"
                            placeholder="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const updated = [...piItems];
                              updated[idx].quantity = e.target.value;
                              setPiItems(updated);
                            }}
                            className="os-input text-center"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="md:hidden os-label">Unit Price (₹)</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0.00"
                            value={item.unit_price}
                            onChange={(e) => {
                              const updated = [...piItems];
                              updated[idx].unit_price = e.target.value;
                              setPiItems(updated);
                            }}
                            className="os-input text-right"
                          />
                        </div>
                        <div className="md:col-span-1">
                          <label className="md:hidden os-label">GST %</label>
                          <input
                            type="number"
                            min="0"
                            max="28"
                            placeholder="18"
                            value={item.gst_rate_pct}
                            onChange={(e) => {
                              const updated = [...piItems];
                              updated[idx].gst_rate_pct = e.target.value;
                              setPiItems(updated);
                            }}
                            className="os-input text-center"
                          />
                        </div>
                        <div className="md:col-span-2 flex items-center justify-between pl-2">
                          <span className="font-extrabold text-slate-900 dark:text-white">₹{(lineVal + lineGst).toLocaleString('en-IN')}</span>
                          {piItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setPiItems(piItems.filter((_, i) => i !== idx))}
                              className="text-rose-500 hover:text-rose-700 p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                              title="Delete Item"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 4: Totals Summary Card */}
              {(() => {
                const sub = piItems.reduce((acc, i) => acc + ((Number(i.quantity)||0) * (Number(i.unit_price)||0)), 0);
                const tax = piItems.reduce((acc, i) => acc + (((Number(i.quantity)||0) * (Number(i.unit_price)||0) * (Number(i.gst_rate_pct)||0))/100), 0);
                const total = sub + tax;
                return (
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 gap-3 text-xs">
                    <div className="text-slate-500 dark:text-slate-400">
                      <span className="font-bold text-slate-700 dark:text-slate-300 block">{piItems.length} Line Item{piItems.length !== 1 ? 's' : ''} Included</span>
                      <span className="text-[10px]">All monetary amounts calculated in Indian Rupees (INR ₹)</span>
                    </div>
                    <div className="flex items-center gap-6 text-right ml-auto">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Subtotal</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">₹{sub.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">GST Tax</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">₹{tax.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="pl-4 border-l border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] uppercase font-black text-sky-600 dark:text-sky-400 block">Grand Total</span>
                        <span className="text-base font-black text-slate-900 dark:text-white">₹{total.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="os-modal-foot">
                <button type="button" onClick={() => setIsProformaModalOpen(false)} className="os-secondary">Cancel</button>
                <button type="submit" disabled={isSubmittingProforma} className="os-primary cursor-pointer">
                  {isSubmittingProforma ? 'Generating...' : 'Generate Proforma Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ISSUE TAX INVOICE MODAL --- */}
      {isTaxInvoiceModalOpen && (
        <div className="os-modal-backdrop">
          <div className="os-modal-content os-modal-2xl">
            <div className="os-modal-head">
              <h3 className="flex items-center gap-2">
                <Receipt size={18} className="text-emerald-500" /> Issue Tax Invoice (Server-Authoritative RPC)
              </h3>
              <button onClick={() => setIsTaxInvoiceModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <X size={18} />
              </button>
            </div>

            {salesModalError && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle size={16} /> {salesModalError}
              </div>
            )}

            <form onSubmit={handleIssueTaxInvoice} className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
              {/* Section 1: Order & Customer Linkage */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="os-label">Linked Sales Order *</label>
                  <select
                    required
                    value={invForm.sales_order_id || ''}
                    onChange={(e) => {
                      const soId = e.target.value;
                      const so = safeSalesOrders.find(o => o.id === soId);
                      if (so) {
                        setInvForm({
                          ...invForm,
                          sales_order_id: soId,
                          company_id: so.company_id,
                          enquiry_id: so.enquiry_id || invForm.enquiry_id,
                          work_id: so.work_id || invForm.work_id,
                          customer_gstin: so.customer_gstin || invForm.customer_gstin,
                          place_of_supply: so.place_of_supply || invForm.place_of_supply
                        });
                        if (so.items && so.items.length > 0) {
                          setInvItems(so.items.map(item => ({
                            item_description: item.item_description,
                            hsn_sac_code: item.hsn_sac_code || '998311',
                            quantity: Number(item.quantity) || 1,
                            unit_price: Number(item.unit_price) || 0,
                            gst_rate_pct: Number(item.gst_rate_pct) || 18
                          })));
                        }
                      } else {
                        setInvForm({ ...invForm, sales_order_id: '' });
                      }
                    }}
                    className="os-input"
                  >
                    <option value="">-- Select Sales Order --</option>
                    {safeSalesOrders.map(so => (
                      <option key={so.id} value={so.id}>
                        {so.so_no || `SO-${so.id.slice(0,6)}`} - {so.company?.name || so.customer_name} (Total: ₹{Number(so.total_amount || 0).toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="os-label">Customer Company *</label>
                  <select
                    required
                    value={invForm.company_id}
                    onChange={(e) => setInvForm({ ...invForm, company_id: e.target.value })}
                    className="os-input"
                  >
                    <option value="">-- Select Customer Company --</option>
                    {safeCompanies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="os-label">Linked Project (Optional)</label>
                  <select
                    value={invForm.work_id}
                    onChange={(e) => setInvForm({ ...invForm, work_id: e.target.value })}
                    className="os-input"
                  >
                    <option value="">-- None / Select Project --</option>
                    {safeWorks.map(w => (
                      <option key={w.id} value={w.id}>{w.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Section 2: Dates & Tax Attributes */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <div>
                  <label className="os-label">Invoice Date</label>
                  <input
                    type="date"
                    value={invForm.invoice_date}
                    onChange={(e) => setInvForm({ ...invForm, invoice_date: e.target.value })}
                    className="os-input"
                  />
                </div>
                <div>
                  <label className="os-label">Due Date</label>
                  <input
                    type="date"
                    value={invForm.due_date}
                    onChange={(e) => setInvForm({ ...invForm, due_date: e.target.value })}
                    className="os-input"
                  />
                </div>
                <div>
                  <label className="os-label">Customer GSTIN</label>
                  <input
                    type="text"
                    placeholder="e.g. 27AAAAA0000A1Z5"
                    value={invForm.customer_gstin}
                    onChange={(e) => setInvForm({ ...invForm, customer_gstin: e.target.value })}
                    className="os-input font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="os-label">Place of Supply</label>
                  <input
                    type="text"
                    value={invForm.place_of_supply}
                    onChange={(e) => setInvForm({ ...invForm, place_of_supply: e.target.value })}
                    className="os-input"
                  />
                </div>
              </div>

              {/* Section 3: Tax Invoice Line Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Tax Invoice Line Items</h4>
                  <button
                    type="button"
                    onClick={() => setInvItems([...invItems, { item_description: '', hsn_sac_code: '998311', quantity: 1, unit_price: 0, gst_rate_pct: 18 }])}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={13} /> Add Line Item
                  </button>
                </div>

                {/* Table Header Row */}
                <div className="hidden md:grid grid-cols-12 gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800/80 rounded-t-xl text-[10px] uppercase font-black tracking-wider text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  <div className="col-span-4">Item Description & Specifications</div>
                  <div className="col-span-2 text-center">HSN / SAC Code</div>
                  <div className="col-span-1 text-center">Qty</div>
                  <div className="col-span-2 text-right">Unit Price (₹)</div>
                  <div className="col-span-1 text-center">GST %</div>
                  <div className="col-span-2 text-right">Line Total (₹)</div>
                </div>

                <div className="space-y-2 md:space-y-0 md:divide-y md:divide-slate-200 dark:md:divide-slate-800 md:border md:border-t-0 md:border-slate-200 dark:md:border-slate-800 md:rounded-b-xl overflow-hidden">
                  {invItems.map((item, idx) => {
                    const lineVal = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
                    const lineGst = (lineVal * (Number(item.gst_rate_pct) || 0)) / 100;
                    return (
                      <div key={idx} className="p-3 bg-white dark:bg-slate-900 grid grid-cols-1 md:grid-cols-12 gap-2 items-center text-xs">
                        <div className="md:col-span-4">
                          <label className="md:hidden os-label">Item Description</label>
                          <input
                            type="text"
                            placeholder="Item description & specs"
                            value={item.item_description}
                            onChange={(e) => {
                              const updated = [...invItems];
                              updated[idx].item_description = e.target.value;
                              setInvItems(updated);
                            }}
                            className="os-input"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="md:hidden os-label">HSN / SAC Code</label>
                          <input
                            type="text"
                            placeholder="998311"
                            value={item.hsn_sac_code}
                            onChange={(e) => {
                              const updated = [...invItems];
                              updated[idx].hsn_sac_code = e.target.value;
                              setInvItems(updated);
                            }}
                            className="os-input font-mono text-center uppercase"
                          />
                        </div>
                        <div className="md:col-span-1">
                          <label className="md:hidden os-label">Qty</label>
                          <input
                            type="number"
                            min="1"
                            placeholder="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const updated = [...invItems];
                              updated[idx].quantity = e.target.value;
                              setInvItems(updated);
                            }}
                            className="os-input text-center"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="md:hidden os-label">Unit Price (₹)</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0.00"
                            value={item.unit_price}
                            onChange={(e) => {
                              const updated = [...invItems];
                              updated[idx].unit_price = e.target.value;
                              setInvItems(updated);
                            }}
                            className="os-input text-right"
                          />
                        </div>
                        <div className="md:col-span-1">
                          <label className="md:hidden os-label">GST %</label>
                          <input
                            type="number"
                            min="0"
                            max="28"
                            placeholder="18"
                            value={item.gst_rate_pct}
                            onChange={(e) => {
                              const updated = [...invItems];
                              updated[idx].gst_rate_pct = e.target.value;
                              setInvItems(updated);
                            }}
                            className="os-input text-center"
                          />
                        </div>
                        <div className="md:col-span-2 flex items-center justify-between pl-2">
                          <span className="font-extrabold text-slate-900 dark:text-white">₹{(lineVal + lineGst).toLocaleString('en-IN')}</span>
                          {invItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setInvItems(invItems.filter((_, i) => i !== idx))}
                              className="text-rose-500 hover:text-rose-700 p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                              title="Delete Item"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 4: Totals Summary Card */}
              {(() => {
                const sub = invItems.reduce((acc, i) => acc + ((Number(i.quantity)||0) * (Number(i.unit_price)||0)), 0);
                const tax = invItems.reduce((acc, i) => acc + (((Number(i.quantity)||0) * (Number(i.unit_price)||0) * (Number(i.gst_rate_pct)||0))/100), 0);
                const total = sub + tax;
                return (
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 gap-3 text-xs">
                    <div className="text-slate-500 dark:text-slate-400">
                      <span className="font-bold text-slate-700 dark:text-slate-300 block">{invItems.length} Line Item{invItems.length !== 1 ? 's' : ''} Included</span>
                      <span className="text-[10px]">All monetary amounts calculated in Indian Rupees (INR ₹)</span>
                    </div>
                    <div className="flex items-center gap-6 text-right ml-auto">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Subtotal</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">₹{sub.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">GST Tax</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">₹{tax.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="pl-4 border-l border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] uppercase font-black text-emerald-600 dark:text-emerald-400 block">Grand Total</span>
                        <span className="text-base font-black text-slate-900 dark:text-white">₹{total.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="os-modal-foot">
                <button type="button" onClick={() => setIsTaxInvoiceModalOpen(false)} className="os-secondary">Cancel</button>
                <button type="submit" disabled={isSubmittingTaxInvoice} className="os-primary bg-emerald-600 hover:bg-emerald-500 border-emerald-600 cursor-pointer">
                  {isSubmittingTaxInvoice ? 'Issuing via RPC...' : 'Issue Tax Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- RECORD PAYMENT MODAL --- */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard size={18} className="text-amber-500" /> Record Sales Receipt / Payment
              </h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            {salesModalError && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle size={16} /> {salesModalError}
              </div>
            )}

            <form onSubmit={handleRecordPaymentSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Select Open Tax Invoice *
                </label>
                <select
                  required
                  value={payForm.tax_invoice_id}
                  onChange={(e) => {
                    const invId = e.target.value;
                    const inv = safeTaxInvoices.find(i => i.id === invId);
                    setPayForm({
                      ...payForm,
                      tax_invoice_id: invId,
                      amount: inv ? Number(inv.balance_due) || Number(inv.total_amount) : 0
                    });
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
                >
                  <option value="">-- Select Tax Invoice --</option>
                  {safeTaxInvoices
                    .filter(i => i.status !== 'paid' && i.status !== 'cancelled')
                    .map(inv => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoice_no || `INV-${inv.id.slice(0,6)}`} - {inv.company?.name || inv.customer_name} (Bal Due: ₹{Number(inv.balance_due || inv.total_amount).toLocaleString('en-IN')})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Deposit Bank Account (GL Ledger)
                </label>
                <select
                  value={payForm.bank_account_id || ''}
                  onChange={(e) => setPayForm({ ...payForm, bank_account_id: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
                >
                  <option value="">-- Primary Bank / Cash Account (Auto-Detect) --</option>
                  {safeBankAccounts.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.bank_name ? `${b.bank_name} - ${b.account_name}` : b.account_name} ({b.account_number || 'Bank Account'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Amount Received (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={payForm.amount}
                  onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Payment Mode
                </label>
                <select
                  value={payForm.payment_mode}
                  onChange={(e) => setPayForm({ ...payForm, payment_mode: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
                >
                  <option value="bank_transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                  <option value="cheque">Cheque</option>
                  <option value="upi">UPI / Online Gateway</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Reference / UTR Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. UTR12938491823"
                  value={payForm.reference_number}
                  onChange={(e) => setPayForm({ ...payForm, reference_number: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="os-secondary text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="os-primary text-xs px-5 py-2 cursor-pointer bg-amber-600 hover:bg-amber-500 border-amber-600"
                >
                  {isLoading ? 'Recording...' : 'Record Payment Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
