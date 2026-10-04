import React, { useState, useMemo, useEffect } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { useCrm } from '../../context/CrmContext';
import { supabase } from '../../lib/supabase';
import {
  ShoppingCart, Building2, FileText, Send, FileCheck, Truck, Receipt, Landmark,
  Plus, Search, Filter, AlertCircle, CheckCircle2, Clock, X, ChevronRight, RefreshCw, ShieldAlert, DollarSign, ArrowLeft
} from 'lucide-react';
import FullWindowEntry from '../common/FullWindowEntry';
import SearchableSelect from '../common/SearchableSelect';

const StatusBadge = ({ status, defaultStatus = 'draft' }) => {
  const currentStatus = (status || defaultStatus).toLowerCase();
  
  let styles = 'bg-slate-100 text-slate-600'; // default / draft
  
  if (['approved', 'paid', 'received', 'completed', 'active', 'fully_received'].includes(currentStatus)) {
    styles = 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30';
  } else if (['submitted', 'issued', 'open', 'partially_received', 'partially_paid', 'approved_awaiting_receipt'].includes(currentStatus)) {
    styles = 'bg-sky-500/15 text-sky-600 border border-sky-500/30';
  } else if (['pending', 'draft'].includes(currentStatus)) {
    styles = 'bg-amber-500/15 text-amber-600 border border-amber-500/30';
  } else if (['cancelled', 'rejected', 'void', 'inactive'].includes(currentStatus)) {
    styles = 'bg-rose-500/15 text-rose-600 border border-rose-500/30';
  }

  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${styles}`}>
      {currentStatus.replace(/_/g, ' ').replace('approved awaiting receipt', 'approved / awaiting receipt')}
    </span>
  );
};

export default function ProcurementWorkspace() {
  const {
    vendors,
    purchaseRequests,
    purchaseRequestItems,
    rfqs,
    vendorQuotations,
    vendorQuotationItems,
    purchaseOrders,
    purchaseOrderItems,
    goodsReceivedNotes,
    goodsReceivedNoteItems,
    purchaseBills,
    purchaseBillItems,
    purchasePayments,
    isLoading,
    error,
    isManagementOrAdmin,
    refreshProcurementData,
    createVendor,
    createPurchaseRequest,
    createRfq,
    createVendorQuotation,
    createPurchaseOrder,
    approvePurchaseOrder,
    createGoodsReceivedNote,
    createPurchaseBill,
    recordPurchasePayment
  } = useProcurement();

  const { works = [], companies = [], activeOperatingCompany } = useCrm() || {};

  // Active Sub-Tab
  const [activeTab, setActiveTab] = useState('vendors'); // 'vendors' | 'requests' | 'rfqs' | 'quotations' | 'orders' | 'grn' | 'bills' | 'payments'
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Aux dropdown states
  const [locations, setLocations] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [cashAccounts, setCashAccounts] = useState([]);

  useEffect(() => {
    async function loadAuxDropdowns() {
      try {
        const { data: locs } = await supabase.from('inventory_locations').select('id, name, code');
        if (locs) setLocations(locs);

        const { data: bnks } = await supabase.from('accounting_bank_accounts').select('id, account_name, bank_name');
        if (bnks) setBankAccounts(bnks);

        const { data: coa } = await supabase.from('chart_of_accounts').select('id, account_name, account_code').or('account_subtype.eq.cash,control_account_type.eq.cash');
        if (coa) setCashAccounts(coa);
      } catch (err) {
        console.error('[ProcurementWorkspace] Error loading aux dropdowns:', err);
      }
    }
    loadAuxDropdowns();
  }, []);

  // Modal Open States
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isPrModalOpen, setIsPrModalOpen] = useState(false);
  const [isRfqModalOpen, setIsRfqModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [isGrnModalOpen, setIsGrnModalOpen] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Toast Helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- FORM STATES ---
  // 1. Vendor Form
  const [vendorForm, setVendorForm] = useState({
    vendor_name: '', vendor_code: '', gstin: '', email: '', phone: '', address: '', notes: ''
  });

  // 2. PR Form
  const [prForm, setPrForm] = useState({ work_id: '', notes: '' });
  const [prItems, setPrItems] = useState([{ item_description: '', quantity: 1, estimated_unit_price: 0 }]);

  // 3. RFQ Form
  const [rfqForm, setRfqForm] = useState({ purchase_request_id: '', work_id: '', due_date: '', notes: '' });

  // 4. Vendor Quotation Form
  const [quoteForm, setQuoteForm] = useState({ rfq_id: '', vendor_id: '', quotation_date: new Date().toISOString().slice(0, 10), valid_until: '', notes: '' });
  const [quoteItems, setQuoteItems] = useState([{ item_description: '', quantity: 1, unit_price: 0 }]);

  // 5. PO Form
  const [poForm, setPoForm] = useState({ vendor_id: '', work_id: '', customer_company_id: '', rfq_id: '', po_date: new Date().toISOString().slice(0, 10), delivery_date: '', notes: '', terms_and_conditions: '' });
  const [poItems, setPoItems] = useState([{ item_description: '', quantity: 1, unit_price: 0, gst_rate_pct: 18 }]);

  // 6. GRN Form
  const [grnForm, setGrnForm] = useState({ purchase_order_id: '', vendor_id: '', to_location_id: '', grn_date: new Date().toISOString().slice(0, 10), delivery_challan_no: '', notes: '' });
  const [grnItems, setGrnItems] = useState([
    { po_item_id: '', purchase_order_item_id: '', item_id: '', item_description: '', ordered_quantity: 1, received_quantity: 1, accepted_quantity: 1, rejected_quantity: 0, rejection_reason: '', unit_price: 0 }
  ]);

  // 7. Purchase Bill Form
  const [billForm, setBillForm] = useState({ purchase_order_id: '', grn_id: '', vendor_id: '', vendor_bill_no: '', bill_date: new Date().toISOString().slice(0, 10), due_date: '', notes: '' });
  const [billItems, setBillItems] = useState([{ item_code: '', item_description: '', quantity: 1, unit_price: 0, gst_rate_pct: 18, is_locked: false }]);

  // 8. Payment Form
  const [paymentForm, setPaymentForm] = useState({ purchase_bill_id: '', vendor_id: '', bank_account_id: '', cash_account_id: '', payment_date: new Date().toISOString().slice(0, 10), payment_mode: 'bank_transfer', reference_number: '', amount: 0, notes: '' });

  // --- STATS CALCULATIONS ---
  const activeVendorsCount = vendors.filter(v => v.status === 'active' || !v.status).length;
  const openPrsCount = purchaseRequests.filter(r => ['pending', 'submitted'].includes(r.status || 'pending')).length;
  const activePosCount = purchaseOrders.filter(po => ['approved', 'issued', 'partially_received'].includes(po.status)).length;
  const totalPayablesBalance = purchaseBills.filter(b => b.status !== 'paid').reduce((sum, b) => sum + (Number(b.balance_due) || 0), 0);

  // --- HANDLERS ---
  const handleCreateVendor = async (e) => {
    e.preventDefault();
    setModalError(null);
    if (!vendorForm.vendor_name) {
      setModalError('Vendor name is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await createVendor(vendorForm);
      showToast('Vendor registered successfully');
      setIsVendorModalOpen(false);
      setVendorForm({ vendor_name: '', vendor_code: '', gstin: '', email: '', phone: '', address: '', notes: '' });
    } catch (err) {
      setModalError(err.message || 'Failed to create vendor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePR = async (e) => {
    e.preventDefault();
    setModalError(null);
    setIsSubmitting(true);
    try {
      await createPurchaseRequest(prForm, prItems);
      showToast('Purchase Request submitted successfully');
      setIsPrModalOpen(false);
      setPrForm({ work_id: '', notes: '' });
      setPrItems([{ item_description: '', quantity: 1, estimated_unit_price: 0 }]);
    } catch (err) {
      setModalError(err.message || 'Failed to create Purchase Request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateRFQ = async (e) => {
    e.preventDefault();
    setModalError(null);
    setIsSubmitting(true);
    try {
      await createRfq(rfqForm);
      showToast('RFQ created successfully');
      setIsRfqModalOpen(false);
      setRfqForm({ purchase_request_id: '', work_id: '', due_date: '', notes: '' });
    } catch (err) {
      setModalError(err.message || 'Failed to create RFQ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateQuotation = async (e) => {
    e.preventDefault();
    setModalError(null);
    if (!quoteForm.vendor_id) {
      setModalError('Please select a vendor.');
      return;
    }
    setIsSubmitting(true);
    try {
      const subtotal = quoteItems.reduce((acc, i) => acc + (Number(i.quantity) * Number(i.unit_price)), 0);
      const tax_amount = Math.round(subtotal * 0.18 * 100) / 100;
      const total_amount = subtotal + tax_amount;

      await createVendorQuotation({ ...quoteForm, subtotal, tax_amount, total_amount }, quoteItems.map(i => ({ ...i, line_total: Number(i.quantity) * Number(i.unit_price) })));
      showToast('Vendor Quotation recorded successfully');
      setIsQuoteModalOpen(false);
      setQuoteForm({ rfq_id: '', vendor_id: '', quotation_date: new Date().toISOString().slice(0, 10), valid_until: '', notes: '' });
      setQuoteItems([{ item_description: '', quantity: 1, unit_price: 0 }]);
    } catch (err) {
      setModalError(err.message || 'Failed to record Vendor Quotation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePO = async (e) => {
    e.preventDefault();
    setModalError(null);
    if (!poForm.vendor_id) {
      setModalError('Please select a vendor.');
      return;
    }
    setIsSubmitting(true);
    try {
      let subtotal = 0;
      let cgst_amount = 0;
      let sgst_amount = 0;

      const items = poItems.map(item => {
        const qty = Number(item.quantity) || 1;
        const price = Number(item.unit_price) || 0;
        const taxable = qty * price;
        const gstPct = Number(item.gst_rate_pct) || 18;
        const cgst = (taxable * (gstPct / 2)) / 100;
        const sgst = (taxable * (gstPct / 2)) / 100;
        const lineTotal = taxable + cgst + sgst;

        subtotal += taxable;
        cgst_amount += cgst;
        sgst_amount += sgst;

        return {
          item_description: item.item_description,
          quantity: qty,
          unit_price: price,
          cgst_amount: cgst,
          sgst_amount: sgst,
          igst_amount: 0,
          line_total: lineTotal
        };
      });

      const tax_amount = cgst_amount + sgst_amount;
      const total_amount = subtotal + tax_amount;

      await createPurchaseOrder({
        ...poForm, subtotal, cgst_amount, sgst_amount, igst_amount: 0, tax_amount, total_amount
      }, items);

      showToast('Purchase Order issued successfully');
      setIsPoModalOpen(false);
      setPoForm({ vendor_id: '', work_id: '', customer_company_id: '', rfq_id: '', po_date: new Date().toISOString().slice(0, 10), delivery_date: '', notes: '', terms_and_conditions: '' });
      setPoItems([{ item_description: '', quantity: 1, unit_price: 0, gst_rate_pct: 18 }]);
    } catch (err) {
      setModalError(err.message || 'Failed to issue Purchase Order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprovePO = async (poId) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await approvePurchaseOrder(poId);
      showToast('Purchase Order approved successfully');
    } catch (err) {
      alert(err.message || 'Failed to approve PO');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateGRN = async (e) => {
    e.preventDefault();
    setModalError(null);
    if (!grnForm.purchase_order_id) {
      setModalError('Please select a Purchase Order.');
      return;
    }
    setIsSubmitting(true);
    try {
      const idempotency_key = `grn-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      await createGoodsReceivedNote(
        {
          ...grnForm,
          idempotency_key,
          to_location_id: grnForm.to_location_id || null
        },
        grnItems.map(item => ({
          purchase_order_item_id: item.po_item_id || item.purchase_order_item_id || null,
          item_id: item.item_id || null,
          received_quantity: Number(item.received_quantity) || 0,
          accepted_quantity: Number(item.accepted_quantity) || 0,
          rejected_quantity: Number(item.rejected_quantity) || 0,
          unit_price: Number(item.unit_price) || 0,
          item_description: item.item_description || ''
        }))
      );
      showToast('GRN logged successfully');
      setIsGrnModalOpen(false);
      setGrnForm({ purchase_order_id: '', vendor_id: '', to_location_id: '', grn_date: new Date().toISOString().slice(0, 10), delivery_challan_no: '', notes: '' });
      setGrnItems([{ po_item_id: '', purchase_order_item_id: '', item_id: '', item_description: '', ordered_quantity: 1, received_quantity: 1, accepted_quantity: 1, rejected_quantity: 0, rejection_reason: '', unit_price: 0 }]);
    } catch (err) {
      setModalError(err.message || 'Failed to log GRN');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();
    setModalError(null);
    if (!billForm.vendor_id) {
      setModalError('Please select a vendor.');
      return;
    }
    setIsSubmitting(true);
    try {
      const subtotal = billItems.reduce((acc, i) => acc + (Number(i.quantity) * Number(i.unit_price)), 0);
      const tax_amount = Math.round(subtotal * 0.18 * 100) / 100;
      const total_amount = subtotal + tax_amount;
      const idempotency_key = `bill-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      await createPurchaseBill(
        {
          ...billForm,
          subtotal,
          tax_amount,
          total_amount,
          amount_paid: 0,
          balance_due: total_amount,
          idempotency_key
        },
        billItems.map(i => ({
          ...i,
          item_code: i.item_code || i.code || '',
          line_total: Number(i.quantity) * Number(i.unit_price)
        }))
      );

      showToast('Purchase Bill recorded successfully');
      setIsBillModalOpen(false);
      setBillForm({ purchase_order_id: '', vendor_id: '', vendor_bill_no: '', bill_date: new Date().toISOString().slice(0, 10), due_date: '', notes: '' });
      setBillItems([{ item_code: '', item_description: '', quantity: 1, unit_price: 0, gst_rate_pct: 18, is_locked: false }]);
    } catch (err) {
      setModalError(err.message || 'Failed to record Purchase Bill');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setModalError(null);
    if (!paymentForm.purchase_bill_id || Number(paymentForm.amount) <= 0) {
      setModalError('Valid bill and payment amount > 0 required.');
      return;
    }
    setIsSubmitting(true);
    try {
      const idempotency_key = `pay-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const isCash = paymentForm.payment_mode === 'cash';
      const payload = {
        ...paymentForm,
        idempotency_key,
        bank_account_id: isCash ? null : (paymentForm.bank_account_id || bankAccounts[0]?.id || null),
        cash_account_id: isCash ? (paymentForm.cash_account_id || cashAccounts[0]?.id || null) : null
      };

      await recordPurchasePayment(payload);
      showToast('Vendor Payment recorded successfully');
      setIsPaymentModalOpen(false);
      setPaymentForm({ purchase_bill_id: '', vendor_id: '', bank_account_id: '', cash_account_id: '', payment_date: new Date().toISOString().slice(0, 10), payment_mode: 'bank_transfer', reference_number: '', amount: 0, notes: '' });
    } catch (err) {
      setModalError(err.message || 'Failed to record Vendor Payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-[100] bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} /> {toastMessage}
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="os-stat-card blue">
          <div className="stat-head"><Building2 size={18} /><span className="stat-label">Active Vendors</span></div>
          <div className="stat-val">{activeVendorsCount}</div>
          <div className="stat-sub">Registered suppliers</div>
        </div>

        <div className="os-stat-card amber">
          <div className="stat-head"><FileText size={18} /><span className="stat-label">Open PRs & RFQs</span></div>
          <div className="stat-val">{openPrsCount + rfqs.length}</div>
          <div className="stat-sub">Pending requisitions</div>
        </div>

        <div className="os-stat-card violet">
          <div className="stat-head"><ShoppingCart size={18} /><span className="stat-label">Active POs & GRNs</span></div>
          <div className="stat-val">{activePosCount}</div>
          <div className="stat-sub">{goodsReceivedNotes.length} GRNs logged</div>
        </div>

        <div className="os-stat-card rose">
          <div className="stat-head"><Receipt size={18} /><span className="stat-label">Payables Balance</span></div>
          <div className="stat-val">₹{(totalPayablesBalance / 100000).toFixed(2)}L</div>
          <div className="stat-sub">{purchaseBills.length} Purchase Bills</div>
        </div>
      </div>

      {/* Navigation Sub-Tabs & Actions */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        <div className="flex gap-1.5 min-w-max">
          {[
            ['vendors', 'Vendors', Building2, vendors.length],
            ['requests', 'Purchase Requests', FileText, purchaseRequests.length],
            ['rfqs', 'RFQs', Send, rfqs.length],
            ['quotations', 'Vendor Quotes', FileCheck, vendorQuotations.length],
            ['orders', 'Purchase Orders', ShoppingCart, purchaseOrders.length],
            ['grn', 'GRN Receipts', Truck, goodsReceivedNotes.length],
            ['bills', 'Purchase Bills', Receipt, purchaseBills.length],
            ['payments', 'Payments', Landmark, purchasePayments.length]
          ].map(([key, label, Icon, count]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === key
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Icon size={14} />
              <span>{label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                activeTab === key ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
              }`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => refreshProcurementData()} className="os-secondary" title="Refresh data">
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
          {isManagementOrAdmin ? (
            <button
              onClick={() => {
                setModalError(null);
                if (activeTab === 'vendors') setIsVendorModalOpen(true);
                else if (activeTab === 'requests') setIsPrModalOpen(true);
                else if (activeTab === 'rfqs') setIsRfqModalOpen(true);
                else if (activeTab === 'quotations') setIsQuoteModalOpen(true);
                else if (activeTab === 'orders') setIsPoModalOpen(true);
                else if (activeTab === 'grn') setIsGrnModalOpen(true);
                else if (activeTab === 'bills') setIsBillModalOpen(true);
                else if (activeTab === 'payments') setIsPaymentModalOpen(true);
              }}
              className="os-primary flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} /> New Record
            </button>
          ) : (
            <div className="text-[10px] text-amber-500 font-bold flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800">
              <ShieldAlert size={12} /> Read Only
            </div>
          )}
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative max-w-md">
        <Search size={14} className="absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${activeTab}...`}
          className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-sky-500 transition"
        />
      </div>

      {/* CONTENT REGISTERS */}
      {/* 1. VENDORS TAB */}
      {activeTab === 'vendors' && (
        <div className="space-y-4">
          <div className="os-section-card">
            <div className="os-section-head">
              <h3>Vendor Master Registry</h3>
              <span className="text-xs text-slate-400 font-normal">{vendors.length} vendors on file</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3">Vendor Code</th>
                    <th className="p-3">Vendor Name</th>
                    <th className="p-3">GSTIN</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {vendors.length > 0 ? (
                    vendors.map(v => (
                      <tr key={v.id} className="hover:bg-sky-50/50 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3 font-bold text-sky-600 dark:text-sky-400">{v.vendor_code || '—'}</td>
                        <td className="p-3 font-bold">{v.vendor_name}</td>
                        <td className="p-3 text-slate-500">{v.gstin || '—'}</td>
                        <td className="p-3 text-slate-500">{v.email || '—'}</td>
                        <td className="p-3 text-slate-500">{v.phone || '—'}</td>
                        <td className="p-3">
                          <StatusBadge status={v.status} defaultStatus="active" />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-6 text-center italic text-slate-400">No registered vendors on file. Click "New Record" to add a vendor.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. PURCHASE REQUESTS TAB */}
      {activeTab === 'requests' && (
        <div className="os-section-card">
          <div className="os-section-head">
            <h3>Purchase Requisitions (PR)</h3>
            <span className="text-xs text-slate-400 font-normal">{purchaseRequests.length} requisitions</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3">PR Number</th>
                  <th className="p-3">Request Date</th>
                  <th className="p-3">Project / Work Context</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {purchaseRequests.length > 0 ? (
                  purchaseRequests.map(pr => {
                    const w = works.find(item => item.id === pr.work_id);
                    return (
                      <tr key={pr.id} className="hover:bg-sky-50/50 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3 font-bold text-sky-600 dark:text-sky-400">{pr.pr_no || pr.id.slice(0, 8)}</td>
                        <td className="p-3 text-slate-500">{pr.request_date || '—'}</td>
                        <td className="p-3">{w ? w.title : 'General Requisition'}</td>
                        <td className="p-3">
                          <StatusBadge status={pr.status} defaultStatus="pending" />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="p-6 text-center italic text-slate-400">No purchase requests submitted yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. RFQs TAB */}
      {activeTab === 'rfqs' && (
        <div className="os-section-card">
          <div className="os-section-head">
            <h3>Requests For Quotation (RFQ)</h3>
            <span className="text-xs text-slate-400 font-normal">{rfqs.length} RFQs issued</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3">RFQ Number</th>
                  <th className="p-3">RFQ Date</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {rfqs.length > 0 ? (
                  rfqs.map(rfq => (
                    <tr key={rfq.id} className="hover:bg-sky-50/50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3 font-bold text-sky-600 dark:text-sky-400">{rfq.rfq_no || rfq.id.slice(0, 8)}</td>
                      <td className="p-3 text-slate-500">{rfq.rfq_date || '—'}</td>
                      <td className="p-3 text-slate-500">{rfq.due_date || '—'}</td>
                      <td className="p-3">
                        <StatusBadge status={rfq.status} defaultStatus="open" />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-6 text-center italic text-slate-400">No RFQs issued yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. VENDOR QUOTATIONS TAB */}
      {activeTab === 'quotations' && (
        <div className="os-section-card">
          <div className="os-section-head">
            <h3>Vendor Quotations</h3>
            <span className="text-xs text-slate-400 font-normal">{vendorQuotations.length} quotes received</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3">Quotation Number</th>
                  <th className="p-3">Vendor</th>
                  <th className="p-3">Quotation Date</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {vendorQuotations.length > 0 ? (
                  vendorQuotations.map(vq => {
                    const v = vendors.find(item => item.id === vq.vendor_id);
                    return (
                      <tr key={vq.id} className="hover:bg-sky-50/50 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3 font-bold text-sky-600 dark:text-sky-400">{vq.quotation_no || vq.id.slice(0, 8)}</td>
                        <td className="p-3 font-bold">{v ? v.vendor_name : '—'}</td>
                        <td className="p-3 text-slate-500">{vq.quotation_date || '—'}</td>
                        <td className="p-3 font-black text-slate-900 dark:text-slate-100">₹{Number(vq.total_amount || 0).toLocaleString()}</td>
                        <td className="p-3">
                          <StatusBadge status={vq.status} defaultStatus="received" />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="p-6 text-center italic text-slate-400">No vendor quotations recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. PURCHASE ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="os-section-card">
          <div className="os-section-head">
            <h3>Purchase Orders (PO)</h3>
            <span className="text-xs text-slate-400 font-normal">{purchaseOrders.length} orders issued</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3">PO Number</th>
                  <th className="p-3">Vendor</th>
                  <th className="p-3">PO Date</th>
                  <th className="p-3">Tax Amount</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {purchaseOrders.length > 0 ? (
                  purchaseOrders.map(po => {
                    const v = vendors.find(item => item.id === po.vendor_id);
                    
                    let derivedStatus = po.status;
                    if (po.status === 'approved') {
                      const items = purchaseOrderItems.filter(i => i.purchase_order_id === po.id);
                      const totalOrdered = items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
                      const totalReceived = items.reduce((sum, i) => {
                        const accepted = goodsReceivedNoteItems
                          .filter(grni => grni.purchase_order_item_id === i.id)
                          .reduce((s, grni) => s + (Number(grni.accepted_quantity) || 0), 0);
                        return sum + accepted;
                      }, 0);
                      
                      if (totalReceived === 0) derivedStatus = 'approved_awaiting_receipt';
                      else if (totalReceived > 0 && totalReceived < totalOrdered) derivedStatus = 'partially_received';
                      else if (totalReceived >= totalOrdered && totalOrdered > 0) derivedStatus = 'fully_received';
                    }

                    return (
                      <tr key={po.id} className="hover:bg-sky-50/50 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3 font-bold text-sky-600 dark:text-sky-400">{po.po_no || po.id.slice(0, 8)}</td>
                        <td className="p-3 font-bold">{v ? v.vendor_name : '—'}</td>
                        <td className="p-3 text-slate-500">{po.po_date || '—'}</td>
                        <td className="p-3 text-slate-500">₹{Number(po.tax_amount || 0).toLocaleString()}</td>
                        <td className="p-3 font-black text-slate-900 dark:text-slate-100">₹{Number(po.total_amount || 0).toLocaleString()}</td>
                        <td className="p-3 text-center">
                          <StatusBadge status={derivedStatus} defaultStatus="draft" />
                        </td>
                        <td className="p-3 text-right">
                          {isManagementOrAdmin && po.status !== 'approved' && (
                            <button
                              disabled={isSubmitting}
                              onClick={() => handleApprovePO(po.id)}
                              className="px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-100 text-[10px] font-bold transition cursor-pointer"
                            >
                              Approve PO
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="p-6 text-center italic text-slate-400">No Purchase Orders issued yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. GRN TAB */}
      {activeTab === 'grn' && (
        <div className="os-section-card">
          <div className="os-section-head">
            <h3>Goods Received Notes (GRN)</h3>
            <span className="text-xs text-slate-400 font-normal">{goodsReceivedNotes.length} receipts logged</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3">GRN Number</th>
                  <th className="p-3">GRN Date</th>
                  <th className="p-3">Purchase Order</th>
                  <th className="p-3">Vendor</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {goodsReceivedNotes.length > 0 ? (
                  goodsReceivedNotes.map(grn => {
                    const po = purchaseOrders.find(item => item.id === grn.purchase_order_id);
                    const v = vendors.find(item => item.id === grn.vendor_id);
                    return (
                      <tr key={grn.id} className="hover:bg-sky-50/50 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3 font-bold text-sky-600 dark:text-sky-400">{grn.grn_no || grn.id.slice(0, 8)}</td>
                        <td className="p-3 text-slate-500">{grn.grn_date || '—'}</td>
                        <td className="p-3 font-bold text-slate-700 dark:text-slate-300">{po ? po.po_no : '—'}</td>
                        <td className="p-3">{v ? v.vendor_name : '—'}</td>
                        <td className="p-3">
                          <StatusBadge status={grn.status} defaultStatus="received" />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="p-6 text-center italic text-slate-400">No GRN receipts logged yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. PURCHASE BILLS TAB */}
      {activeTab === 'bills' && (
        <div className="os-section-card">
          <div className="os-section-head">
            <h3>Purchase Bills / Vendor Invoices</h3>
            <span className="text-xs text-slate-400 font-normal">{purchaseBills.length} bills recorded</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3">Bill Number</th>
                  <th className="p-3">Vendor</th>
                  <th className="p-3">Bill Date</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Amount Paid</th>
                  <th className="p-3">Balance Due</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {purchaseBills.length > 0 ? (
                  purchaseBills.map(pb => {
                    const v = vendors.find(item => item.id === pb.vendor_id);
                    return (
                      <tr key={pb.id} className="hover:bg-sky-50/50 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3 font-bold text-sky-600 dark:text-sky-400">{pb.bill_no || pb.id.slice(0, 8)}</td>
                        <td className="p-3 font-bold">{v ? v.vendor_name : '—'}</td>
                        <td className="p-3 text-slate-500">{pb.bill_date || '—'}</td>
                        <td className="p-3 font-black text-slate-900 dark:text-slate-100">₹{Number(pb.total_amount || 0).toLocaleString()}</td>
                        <td className="p-3 text-emerald-600 font-bold">₹{Number(pb.amount_paid || 0).toLocaleString()}</td>
                        <td className="p-3 text-rose-600 font-black">₹{Number(pb.balance_due || 0).toLocaleString()}</td>
                        <td className="p-3">
                          <StatusBadge status={pb.status} defaultStatus="pending" />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="p-6 text-center italic text-slate-400">No Purchase Bills recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. PURCHASE PAYMENTS TAB */}
      {activeTab === 'payments' && (
        <div className="os-section-card">
          <div className="os-section-head">
            <h3>Vendor Payments & Ledger</h3>
            <span className="text-xs text-slate-400 font-normal">{purchasePayments.length} payments recorded</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3">Payment Date</th>
                  <th className="p-3">Purchase Bill</th>
                  <th className="p-3">Vendor</th>
                  <th className="p-3">Amount Paid</th>
                  <th className="p-3">Recorded At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {purchasePayments.length > 0 ? (
                  purchasePayments.map(pmt => {
                    const bill = purchaseBills.find(item => item.id === pmt.purchase_bill_id);
                    const v = vendors.find(item => item.id === (pmt.vendor_id || bill?.vendor_id));
                    return (
                      <tr key={pmt.id} className="hover:bg-sky-50/50 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3 text-slate-500">{pmt.payment_date || '—'}</td>
                        <td className="p-3 font-bold text-sky-600 dark:text-sky-400">{bill ? bill.bill_no : '—'}</td>
                        <td className="p-3 font-bold">{v ? v.vendor_name : '—'}</td>
                        <td className="p-3 font-black text-emerald-600">₹{Number(pmt.amount || 0).toLocaleString()}</td>
                        <td className="p-3 text-slate-400 text-[10px]">{new Date(pmt.created_at).toLocaleString()}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="p-6 text-center italic text-slate-400">No vendor payments recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- CREATE MODALS --- */}

      {/* 1. VENDOR ENTRY WORKSPACE */}
      <FullWindowEntry
        isOpen={isVendorModalOpen}
        onClose={() => setIsVendorModalOpen(false)}
        title="Register New Vendor"
        icon={Building2}
        isLoading={isSubmitting}
        footer={
          <>
            <button type="button" onClick={() => setIsVendorModalOpen(false)} className="os-secondary px-6">Cancel</button>
            <button type="submit" form="vendor-form" disabled={isSubmitting} className="os-primary px-6 cursor-pointer">
              {isSubmitting ? 'Registering...' : 'Register Vendor'}
            </button>
          </>
        }
      >
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm max-w-3xl mx-auto">
          {modalError && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-sm rounded-xl flex items-center gap-3 font-semibold">
              <AlertCircle size={18} /> {modalError}
            </div>
          )}

          <form id="vendor-form" onSubmit={handleCreateVendor} className="space-y-6">
            <div>
              <label className="os-label mb-1 block">Vendor Business Name *</label>
              <input
                type="text"
                required
                value={vendorForm.vendor_name}
                onChange={(e) => setVendorForm({ ...vendorForm, vendor_name: e.target.value })}
                placeholder="e.g. Apex Industrial Supplies Pvt Ltd"
                className="os-input"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="os-label mb-1 block">Vendor Code / Reference</label>
                <input
                  type="text"
                  value={vendorForm.vendor_code}
                  onChange={(e) => setVendorForm({ ...vendorForm, vendor_code: e.target.value })}
                  placeholder="e.g. VEN-001"
                  className="os-input uppercase"
                />
              </div>
              <div>
                <label className="os-label mb-1 block">GSTIN Identification #</label>
                <input
                  type="text"
                  value={vendorForm.gstin}
                  onChange={(e) => setVendorForm({ ...vendorForm, gstin: e.target.value })}
                  placeholder="e.g. 27AAAAA0000A1Z5"
                  className="os-input font-mono uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="os-label mb-1 block">Primary Email Address</label>
                <input
                  type="email"
                  value={vendorForm.email}
                  onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                  placeholder="contact@apexsupplies.com"
                  className="os-input"
                />
              </div>
              <div>
                <label className="os-label mb-1 block">Contact Phone Number</label>
                <input
                  type="text"
                  value={vendorForm.phone}
                  onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="os-input"
                />
              </div>
            </div>

            <div>
              <label className="os-label mb-1 block">Registered Office / Billing Address</label>
              <textarea
                value={vendorForm.address}
                onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })}
                placeholder="Street address, city, state and PIN code..."
                className="os-input h-24 p-3"
              />
            </div>
          </form>
        </div>
      </FullWindowEntry>

      {/* 2. PURCHASE REQUEST ENTRY WORKSPACE */}
      <FullWindowEntry
        isOpen={isPrModalOpen}
        onClose={() => setIsPrModalOpen(false)}
        title="Create Purchase Request (PR)"
        icon={FileText}
        isLoading={isSubmitting}
        footer={
          <>
            <button type="button" onClick={() => setIsPrModalOpen(false)} className="os-secondary px-6">Cancel</button>
            <button type="submit" form="pr-form" disabled={isSubmitting} className="os-primary px-6 cursor-pointer">
              {isSubmitting ? 'Submitting...' : 'Submit Purchase Request'}
            </button>
          </>
        }
      >
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          {modalError && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-sm rounded-xl flex items-center gap-3 font-semibold">
              <AlertCircle size={18} /> {modalError}
            </div>
          )}

          <form id="pr-form" onSubmit={handleCreatePR} className="space-y-6">
            <div className="max-w-xl">
              <label className="os-label mb-1 block">Project / Work Linkage (Optional)</label>
              <SearchableSelect
                options={works.map(w => ({ value: w.id, label: w.title }))}
                value={prForm.work_id}
                onChange={(val) => setPrForm({ ...prForm, work_id: val })}
                placeholder="-- No Specific Project (General Requisition) --"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="os-label font-bold text-slate-700 dark:text-slate-300">Requisition Items *</label>
                <button
                  type="button"
                  onClick={() => setPrItems([...prItems, { item_description: '', quantity: 1, estimated_unit_price: 0 }])}
                  className="text-sm font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer bg-sky-50 dark:bg-sky-500/10 px-3 py-1.5 rounded-lg"
                >
                  <Plus size={16} /> Add Item
                </button>
              </div>

              <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 bg-slate-100 dark:bg-slate-800/80 rounded-t-xl text-[11px] uppercase font-black tracking-wider text-slate-500 border border-slate-200 dark:border-slate-700">
                <div className="col-span-8">Item Description & Specifications</div>
                <div className="col-span-3 text-center">Required Qty</div>
                <div className="col-span-1 text-center">Action</div>
              </div>

              <div className="space-y-3 md:space-y-0 md:divide-y md:divide-slate-200 dark:md:divide-slate-800 md:border md:border-t-0 md:border-slate-200 dark:md:border-slate-800 md:rounded-b-xl overflow-hidden">
                {prItems.map((item, idx) => (
                  <div key={idx} className="p-4 bg-white dark:bg-slate-900 grid grid-cols-1 md:grid-cols-12 gap-3 items-center text-sm">
                    <div className="md:col-span-8">
                      <label className="md:hidden os-label mb-1 block">Item Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Structural Steel Beams ISMB 300 (12m length)"
                        value={item.item_description}
                        onChange={(e) => {
                          const updated = [...prItems];
                          updated[idx].item_description = e.target.value;
                          setPrItems(updated);
                        }}
                        className="os-input"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="md:hidden os-label mb-1 block">Required Qty</label>
                      <input
                        type="number"
                        placeholder="Qty"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const updated = [...prItems];
                          updated[idx].quantity = Number(e.target.value);
                          setPrItems(updated);
                        }}
                        className="os-input text-center font-bold"
                      />
                    </div>
                    <div className="md:col-span-1 flex justify-center">
                      {prItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setPrItems(prItems.filter((_, i) => i !== idx))}
                          className="text-rose-500 hover:text-rose-700 p-2 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                          title="Remove Item"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>
      </FullWindowEntry>

      {/* 3. RFQ ENTRY WORKSPACE */}
      <FullWindowEntry
        isOpen={isRfqModalOpen}
        onClose={() => setIsRfqModalOpen(false)}
        title="Create Request For Quotation (RFQ)"
        icon={Send}
        isLoading={isSubmitting}
        footer={
          <>
            <button type="button" onClick={() => setIsRfqModalOpen(false)} className="os-secondary px-6">Cancel</button>
            <button type="submit" form="rfq-form" disabled={isSubmitting} className="os-primary px-6 cursor-pointer">
              {isSubmitting ? 'Creating...' : 'Create RFQ'}
            </button>
          </>
        }
      >
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm max-w-4xl mx-auto">
          {modalError && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-sm rounded-xl flex items-center gap-3 font-semibold">
              <AlertCircle size={18} /> {modalError}
            </div>
          )}

          <form id="rfq-form" onSubmit={handleCreateRFQ} className="space-y-6">
            <div>
              <label className="os-label mb-1 block">Select Source Purchase Request (Optional)</label>
              <SearchableSelect
                options={purchaseRequests.map(pr => ({ value: pr.id, label: `${pr.pr_no || pr.id.slice(0,8)} — Status: ${pr.status}` }))}
                value={rfqForm.purchase_request_id}
                onChange={(val) => setRfqForm({ ...rfqForm, purchase_request_id: val })}
                placeholder="-- Direct RFQ (No PR Linkage) --"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="os-label mb-1 block">Quotation Submission Due Date</label>
                <input
                  type="date"
                  value={rfqForm.due_date}
                  onChange={(e) => setRfqForm({ ...rfqForm, due_date: e.target.value })}
                  className="os-input"
                />
              </div>
              <div>
                <label className="os-label mb-1 block">Project / Work Linkage</label>
                <SearchableSelect
                  options={works.map(w => ({ value: w.id, label: w.title }))}
                  value={rfqForm.work_id}
                  onChange={(val) => setRfqForm({ ...rfqForm, work_id: val })}
                  placeholder="-- No Project Linkage --"
                />
              </div>
            </div>

            <div>
              <label className="os-label mb-1 block">Vendor Instructions & Technical Specifications</label>
              <textarea
                value={rfqForm.notes}
                onChange={(e) => setRfqForm({ ...rfqForm, notes: e.target.value })}
                placeholder="Specify delivery timeline, material grades, warranty terms, and compliance requirements for vendors..."
                className="os-input h-32 p-3"
              />
            </div>
          </form>
        </div>
      </FullWindowEntry>

      {/* 4. VENDOR QUOTATION ENTRY WORKSPACE */}
      <FullWindowEntry
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        title="Record Vendor Quotation"
        icon={FileText}
        isLoading={isSubmitting}
        footer={
          <>
            <button type="button" onClick={() => setIsQuoteModalOpen(false)} className="os-secondary px-6">Cancel</button>
            <button type="submit" form="quote-form" disabled={isSubmitting} className="os-primary px-6 cursor-pointer">
              {isSubmitting ? 'Recording...' : 'Record Quotation'}
            </button>
          </>
        }
      >
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          {modalError && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-sm rounded-xl flex items-center gap-3 font-semibold">
              <AlertCircle size={18} /> {modalError}
            </div>
          )}

          <form id="quote-form" onSubmit={handleCreateQuotation} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="os-label mb-1 block">Select Vendor *</label>
                <SearchableSelect
                  options={vendors.map(v => ({ value: v.id, label: v.vendor_name, code: v.vendor_code }))}
                  value={quoteForm.vendor_id}
                  onChange={(val) => setQuoteForm({ ...quoteForm, vendor_id: val })}
                  placeholder="-- Select Vendor --"
                />
              </div>
              <div>
                <label className="os-label mb-1 block">Linked RFQ (Optional)</label>
                <SearchableSelect
                  options={rfqs.map(r => ({ value: r.id, label: r.rfq_no || r.id.slice(0,8) }))}
                  value={quoteForm.rfq_id}
                  onChange={(val) => setQuoteForm({ ...quoteForm, rfq_id: val })}
                  placeholder="-- No RFQ Linkage --"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div>
                <label className="os-label mb-1 block">Quotation Date</label>
                <input
                  type="date"
                  value={quoteForm.quotation_date}
                  onChange={(e) => setQuoteForm({ ...quoteForm, quotation_date: e.target.value })}
                  className="os-input"
                />
              </div>
              <div>
                <label className="os-label mb-1 block">Valid Until</label>
                <input
                  type="date"
                  value={quoteForm.valid_until}
                  onChange={(e) => setQuoteForm({ ...quoteForm, valid_until: e.target.value })}
                  className="os-input"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="os-label font-bold text-slate-700 dark:text-slate-300">Quoted Line Items</label>
                <button
                  type="button"
                  onClick={() => setQuoteItems([...quoteItems, { item_description: '', quantity: 1, unit_price: 0 }])}
                  className="text-sm font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer bg-sky-50 dark:bg-sky-500/10 px-3 py-1.5 rounded-lg"
                >
                  <Plus size={16} /> Add Quoted Item
                </button>
              </div>

              <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 bg-slate-100 dark:bg-slate-800/80 rounded-t-xl text-[11px] uppercase font-black tracking-wider text-slate-500 border border-slate-200 dark:border-slate-700">
                <div className="col-span-6">Item Description & Specifications</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-3 text-right">Quoted Unit Price (₹)</div>
                <div className="col-span-1 text-center">Action</div>
              </div>

              <div className="space-y-3 md:space-y-0 md:divide-y md:divide-slate-200 dark:md:divide-slate-800 md:border md:border-t-0 md:border-slate-200 dark:md:border-slate-800 md:rounded-b-xl overflow-hidden">
                {quoteItems.map((item, idx) => (
                  <div key={idx} className="p-4 bg-white dark:bg-slate-900 grid grid-cols-1 md:grid-cols-12 gap-3 items-center text-sm">
                    <div className="md:col-span-6">
                      <label className="md:hidden os-label mb-1 block">Item Description</label>
                      <input
                        type="text"
                        placeholder="Quoted material / service description"
                        value={item.item_description}
                        onChange={(e) => {
                          const updated = [...quoteItems];
                          updated[idx].item_description = e.target.value;
                          setQuoteItems(updated);
                        }}
                        className="os-input"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="md:hidden os-label mb-1 block">Qty</label>
                      <input
                        type="number"
                        placeholder="Qty"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const updated = [...quoteItems];
                          updated[idx].quantity = Number(e.target.value);
                          setQuoteItems(updated);
                        }}
                        className="os-input text-center font-bold"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="md:hidden os-label mb-1 block">Unit Price (₹)</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={item.unit_price}
                        onChange={(e) => {
                          const updated = [...quoteItems];
                          updated[idx].unit_price = Number(e.target.value);
                          setQuoteItems(updated);
                        }}
                        className="os-input text-right font-bold"
                      />
                    </div>
                    <div className="md:col-span-1 flex justify-center">
                      {quoteItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setQuoteItems(quoteItems.filter((_, i) => i !== idx))}
                          className="text-rose-500 hover:text-rose-700 p-2 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                          title="Remove Item"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>
      </FullWindowEntry>

      {/* 5. PO ENTRY WORKSPACE */}
      <FullWindowEntry
        isOpen={isPoModalOpen}
        onClose={() => setIsPoModalOpen(false)}
        title="Issue Purchase Order"
        icon={ShoppingCart}
        isLoading={isSubmitting}
        footer={
          <>
            <button type="button" onClick={() => setIsPoModalOpen(false)} className="os-secondary px-6">Cancel</button>
            <button type="submit" form="po-form" disabled={isSubmitting} className="os-primary px-6 cursor-pointer">
              {isSubmitting ? 'Issuing...' : 'Issue Purchase Order'}
            </button>
          </>
        }
      >
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          {modalError && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-sm rounded-xl flex items-center gap-3 font-semibold">
              <AlertCircle size={18} /> {modalError}
            </div>
          )}

          <form id="po-form" onSubmit={handleCreatePO} className="space-y-6">
            <div>
              <label className="os-label mb-1 block">Select Vendor *</label>
              <SearchableSelect
                options={vendors.map(v => ({ value: v.id, label: v.vendor_name, code: v.vendor_code }))}
                value={poForm.vendor_id}
                onChange={(val) => setPoForm({ ...poForm, vendor_id: val })}
                placeholder="-- Select Vendor --"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="os-label mb-1 block">PO Issuance Date</label>
                <input
                  type="date"
                  value={poForm.po_date}
                  onChange={(e) => setPoForm({ ...poForm, po_date: e.target.value })}
                  className="os-input"
                />
              </div>
              <div>
                <label className="os-label mb-1 block">Project / Work Linkage (Optional)</label>
                <SearchableSelect
                  options={works.map(w => ({ value: w.id, label: w.title }))}
                  value={poForm.work_id}
                  onChange={(val) => {
                    const selectedWork = works.find(w => w.id === val);
                    setPoForm({ 
                      ...poForm, 
                      work_id: val,
                      customer_company_id: selectedWork ? (selectedWork.company_id || '') : ''
                    });
                  }}
                  placeholder="-- No Project Linkage --"
                />
              </div>
              <div>
                <label className="os-label mb-1 block">Customer Company *</label>
                <SearchableSelect
                  options={companies.map(c => ({ value: c.id, label: c.name }))}
                  value={poForm.customer_company_id}
                  onChange={(val) => setPoForm({ ...poForm, customer_company_id: val })}
                  placeholder="-- Select Customer Company --"
                  disabled={!!poForm.work_id}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="os-label font-bold text-slate-700 dark:text-slate-300">Purchase Order Items</label>
                <button
                  type="button"
                  onClick={() => setPoItems([...poItems, { item_description: '', quantity: 1, unit_price: 0, gst_rate_pct: 18 }])}
                  className="text-sm font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer bg-sky-50 dark:bg-sky-500/10 px-3 py-1.5 rounded-lg"
                >
                  <Plus size={16} /> Add Order Item
                </button>
              </div>

              <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 bg-slate-100 dark:bg-slate-800/80 rounded-t-xl text-[11px] uppercase font-black tracking-wider text-slate-500 border border-slate-200 dark:border-slate-700">
                <div className="col-span-5">Item Description & Specifications</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-3 text-right">Unit Price (₹)</div>
                <div className="col-span-2 text-right">Line Total (₹)</div>
              </div>

              <div className="space-y-3 md:space-y-0 md:divide-y md:divide-slate-200 dark:md:divide-slate-800 md:border md:border-t-0 md:border-slate-200 dark:md:border-slate-800 md:rounded-b-xl overflow-hidden">
                {poItems.map((item, idx) => {
                  const total = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
                  return (
                    <div key={idx} className="p-4 bg-white dark:bg-slate-900 grid grid-cols-1 md:grid-cols-12 gap-3 items-center text-sm">
                      <div className="md:col-span-5">
                        <label className="md:hidden os-label mb-1 block">Item Description</label>
                        <input
                          type="text"
                          placeholder="Item description & specifications"
                          value={item.item_description}
                          onChange={(e) => {
                            const updated = [...poItems];
                            updated[idx].item_description = e.target.value;
                            setPoItems(updated);
                          }}
                          className="os-input"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="md:hidden os-label mb-1 block">Qty</label>
                        <input
                          type="number"
                          placeholder="Qty"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const updated = [...poItems];
                            updated[idx].quantity = Number(e.target.value);
                            setPoItems(updated);
                          }}
                          className="os-input text-center font-bold"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="md:hidden os-label mb-1 block">Unit Price (₹)</label>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={item.unit_price}
                          onChange={(e) => {
                            const updated = [...poItems];
                            updated[idx].unit_price = Number(e.target.value);
                            setPoItems(updated);
                          }}
                          className="os-input text-right font-bold"
                        />
                      </div>
                      <div className="md:col-span-2 flex items-center justify-between pl-3">
                        <span className="font-extrabold text-slate-900 dark:text-white">₹{total.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        {poItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setPoItems(poItems.filter((_, i) => i !== idx))}
                            className="text-rose-500 hover:text-rose-700 p-2 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                            title="Remove Item"
                          >
                            <X size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </form>
        </div>
      </FullWindowEntry>

      {/* 6. GRN ENTRY WORKSPACE */}
      <FullWindowEntry
        isOpen={isGrnModalOpen}
        onClose={() => setIsGrnModalOpen(false)}
        title="Log Goods Received Note (GRN)"
        icon={Truck}
        isLoading={isSubmitting}
        footer={
          <>
            <button type="button" onClick={() => setIsGrnModalOpen(false)} className="os-secondary px-6">Cancel</button>
            <button type="submit" form="grn-form" disabled={isSubmitting || locations.length === 0} className={`os-primary px-6 cursor-pointer ${locations.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {isSubmitting ? 'Logging...' : 'Log Goods Received Note'}
            </button>
          </>
        }
      >
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          {modalError && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-sm rounded-xl flex items-center gap-3 font-semibold">
              <AlertCircle size={18} /> {modalError}
            </div>
          )}

          {locations.length === 0 && (
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-sm rounded-xl flex items-start gap-3">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p><strong>Warning:</strong> You have no active stock locations configured. Please go to the Inventory module and configure at least one location before creating a Goods Received Note, or the transaction may fail.</p>
            </div>
          )}

          <form id="grn-form" onSubmit={handleCreateGRN} className="space-y-6">
            <div>
              <label className="os-label mb-1 block">Select Approved Purchase Order *</label>
              <SearchableSelect
                options={purchaseOrders.filter(po => ['approved', 'partially_received'].includes(po.status)).map(po => ({
                  value: po.id,
                  label: `${po.po_no || po.id.slice(0,8)} — Status: ${po.status}`
                }))}
                value={grnForm.purchase_order_id}
                onChange={(val) => {
                  const po = purchaseOrders.find(p => p.id === val);
                  setGrnForm({
                    ...grnForm,
                    purchase_order_id: val,
                    vendor_id: po ? po.vendor_id : ''
                  });

                  const itemsForPo = purchaseOrderItems.filter(i => i.purchase_order_id === val);
                  if (itemsForPo.length > 0) {
                    setGrnItems(itemsForPo.map(i => {
                      const previouslyAccepted = goodsReceivedNoteItems
                         .filter(grni => grni.purchase_order_item_id === i.id)
                         .reduce((sum, grni) => sum + (Number(grni.accepted_quantity) || 0), 0);
                      const remainingQty = Math.max(0, (Number(i.quantity) || 0) - previouslyAccepted);
                      return {
                        po_item_id: i.id,
                        item_id: i.inventory_item_id || i.item_id || null,
                        item_description: i.item_description,
                        ordered_quantity: remainingQty,
                        received_quantity: remainingQty,
                        accepted_quantity: remainingQty,
                        rejected_quantity: 0,
                        rejection_reason: '',
                        unit_price: i.unit_price || 0
                      };
                    }));
                  } else {
                    setGrnItems([{ po_item_id: '', item_description: '', ordered_quantity: 1, received_quantity: 1, accepted_quantity: 1, rejected_quantity: 0, rejection_reason: '', unit_price: 0 }]);
                  }
                }}
                placeholder="-- Select Approved PO --"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="os-label mb-1 block">GRN Receipt Date</label>
                <input
                  type="date"
                  value={grnForm.grn_date}
                  onChange={(e) => setGrnForm({ ...grnForm, grn_date: e.target.value })}
                  className="os-input"
                />
              </div>
              <div>
                <label className="os-label mb-1 block">Delivery Challan / Transporter #</label>
                <input
                  type="text"
                  placeholder="e.g. DC-109283"
                  value={grnForm.delivery_challan_no}
                  onChange={(e) => setGrnForm({ ...grnForm, delivery_challan_no: e.target.value })}
                  className="os-input"
                />
              </div>
              <div>
                <label className="os-label mb-1 block">Destination Location (Inventory)</label>
                <SearchableSelect
                  options={locations.map(loc => ({ value: loc.id, label: `${loc.name} (${loc.code || 'LOC'})` }))}
                  value={grnForm.to_location_id || ''}
                  onChange={(val) => setGrnForm({ ...grnForm, to_location_id: val })}
                  placeholder="-- Main Warehouse / Default --"
                />
              </div>
            </div>

            <div>
              <label className="os-label mb-3 block font-bold text-slate-700 dark:text-slate-300">Received Items Quantity Breakdown</label>
              <div className="space-y-4">
                {grnItems.map((item, idx) => (
                  <div key={idx} className="p-5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="font-extrabold text-slate-900 dark:text-white flex items-center justify-between text-sm">
                      <span>{item.item_description || `Item #${idx+1}`}</span>
                      {item.ordered_quantity ? <span className="text-xs font-semibold text-slate-500 bg-white dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">Remaining PO Qty: {item.ordered_quantity}</span> : null}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="os-label text-xs mb-1 block">Total Received Qty</label>
                        <input
                          type="number"
                          value={item.received_quantity}
                          max={item.ordered_quantity}
                          onChange={(e) => {
                            let val = Number(e.target.value);
                            if (val > item.ordered_quantity) val = item.ordered_quantity;
                            const updated = [...grnItems];
                            updated[idx].received_quantity = val;
                            updated[idx].accepted_quantity = Math.max(0, val - updated[idx].rejected_quantity);
                            setGrnItems(updated);
                          }}
                          className="os-input text-center font-bold"
                        />
                      </div>
                      <div>
                        <label className="os-label text-xs mb-1 block">Accepted Qty</label>
                        <input
                          type="number"
                          value={item.accepted_quantity}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const updated = [...grnItems];
                            updated[idx].accepted_quantity = val;
                            updated[idx].rejected_quantity = Math.max(0, updated[idx].received_quantity - val);
                            setGrnItems(updated);
                          }}
                          className="os-input text-center text-emerald-600 font-bold"
                        />
                      </div>
                      <div>
                        <label className="os-label text-xs mb-1 block">Rejected Qty</label>
                        <input
                          type="number"
                          value={item.rejected_quantity}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const updated = [...grnItems];
                            updated[idx].rejected_quantity = val;
                            updated[idx].accepted_quantity = Math.max(0, updated[idx].received_quantity - val);
                            setGrnItems(updated);
                          }}
                          className="os-input text-center text-rose-600 font-bold"
                        />
                      </div>
                    </div>

                    {item.rejected_quantity > 0 && (
                      <div>
                        <label className="os-label text-xs mb-1 block">Rejection Reason / Defect Notes</label>
                        <input
                          type="text"
                          placeholder="e.g. Damaged during transit / specs mismatch"
                          value={item.rejection_reason || ''}
                          onChange={(e) => {
                            const updated = [...grnItems];
                            updated[idx].rejection_reason = e.target.value;
                            setGrnItems(updated);
                          }}
                          className="os-input text-rose-600 dark:text-rose-400 font-medium"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>
      </FullWindowEntry>

      {/* 7. PURCHASE BILL MODAL (1000px) */}
      {/* 7. PURCHASE BILL ENTRY WORKSPACE */}
      <FullWindowEntry
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
        title="Record Purchase Bill / Vendor Invoice"
        icon={Receipt}
        isLoading={isSubmitting}
        footer={
          <>
            <button type="button" onClick={() => setIsBillModalOpen(false)} className="os-secondary px-6">Cancel</button>
            <button type="submit" form="bill-form" disabled={isSubmitting} className="os-primary px-6 cursor-pointer">
              {isSubmitting ? 'Recording...' : 'Record Purchase Bill'}
            </button>
          </>
        }
      >
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          {modalError && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-sm rounded-xl flex items-center gap-3 font-semibold">
              <AlertCircle size={18} /> {modalError}
            </div>
          )}

          <form id="bill-form" onSubmit={handleCreateBill} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="os-label mb-1 block">Select Vendor *</label>
                <SearchableSelect
                  options={vendors.map(v => ({ value: v.id, label: v.vendor_name, code: v.vendor_code }))}
                  value={billForm.vendor_id}
                  onChange={(val) => setBillForm({ ...billForm, vendor_id: val, purchase_order_id: '', grn_id: '' })}
                  placeholder="-- Select Vendor --"
                />
              </div>
              <div>
                <label className="os-label mb-1 block">Linked Purchase Order *</label>
                <SearchableSelect
                  options={purchaseOrders.filter(po => po.vendor_id === billForm.vendor_id && ['approved', 'partially_received', 'received', 'fully_received'].includes(po.status)).map(po => ({ value: po.id, label: po.po_no || po.id.slice(0,8) }))}
                  value={billForm.purchase_order_id}
                  onChange={(val) => {
                    setBillForm({ ...billForm, purchase_order_id: val, grn_id: '' });
                    setBillItems([]);
                  }}
                  placeholder="-- Select PO --"
                  disabled={!billForm.vendor_id}
                />
              </div>
              <div>
                <label className="os-label mb-1 block">Linked GRN *</label>
                <SearchableSelect
                  options={goodsReceivedNotes.filter(grn => grn.purchase_order_id === billForm.purchase_order_id && ['posted', 'received'].includes(grn.status)).map(grn => ({ value: grn.id, label: grn.grn_no || grn.id.slice(0,8) }))}
                  value={billForm.grn_id}
                  onChange={(val) => {
                    setBillForm({ ...billForm, grn_id: val });
                    if (val) {
                      const itemsForGrn = goodsReceivedNoteItems.filter(i => i.grn_id === val);
                      const matchedItems = itemsForGrn.map(grni => {
                        const poItem = purchaseOrderItems.find(poi => poi.id === grni.purchase_order_item_id) || {};
                        const previouslyBilled = purchaseBillItems
                          .filter(pbi => pbi.goods_received_note_item_id === grni.id)
                          .reduce((sum, pbi) => sum + (Number(pbi.quantity) || 0), 0);
                        const remainingBillable = (Number(grni.accepted_quantity) || 0) - previouslyBilled;

                        return {
                          purchase_order_item_id: grni.purchase_order_item_id,
                          goods_received_note_item_id: grni.id,
                          inventory_item_id: poItem.inventory_item_id,
                          master_boq_line_id: poItem.master_boq_line_id,
                          item_code: '',
                          item_description: poItem.item_description || 'Unknown Item',
                          ordered_quantity: poItem.quantity || 0,
                          accepted_quantity: grni.accepted_quantity || 0,
                          previously_billed_qty: previouslyBilled,
                          remaining_billable_qty: remainingBillable,
                          quantity: remainingBillable > 0 ? remainingBillable : 0,
                          unit_price: poItem.unit_price || 0,
                          gst_rate_pct: 18,
                          is_locked: false
                        };
                      }).filter(i => i.remaining_billable_qty > 0);
                      
                      if (matchedItems.length > 0) {
                         setBillItems(matchedItems);
                      } else {
                         setBillItems([]);
                      }
                    } else {
                       setBillItems([]);
                    }
                  }}
                  placeholder="-- Select GRN --"
                  disabled={!billForm.purchase_order_id}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div>
                <label className="os-label mb-1 block">Vendor Bill / Invoice #</label>
                <input
                  type="text"
                  placeholder="e.g. INV-9901"
                  value={billForm.vendor_bill_no}
                  onChange={(e) => setBillForm({ ...billForm, vendor_bill_no: e.target.value })}
                  className="os-input font-mono uppercase"
                />
              </div>
              <div>
                <label className="os-label mb-1 block">Bill Date</label>
                <input
                  type="date"
                  value={billForm.bill_date}
                  onChange={(e) => setBillForm({ ...billForm, bill_date: e.target.value })}
                  className="os-input"
                />
              </div>
              <div>
                <label className="os-label mb-1 block">Payment Due Date</label>
                <input
                  type="date"
                  value={billForm.due_date}
                  onChange={(e) => setBillForm({ ...billForm, due_date: e.target.value })}
                  className="os-input"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="os-label font-bold text-slate-700 dark:text-slate-300">Billed Line Items</label>
              </div>

              <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 bg-slate-100 dark:bg-slate-800/80 rounded-t-xl text-[11px] uppercase font-black tracking-wider text-slate-500 border border-slate-200 dark:border-slate-700">
                <div className="col-span-3">Item Description</div>
                <div className="col-span-1 text-center">Ord</div>
                <div className="col-span-1 text-center">Accpt</div>
                <div className="col-span-1 text-center">Prev</div>
                <div className="col-span-1 text-center">Rem</div>
                <div className="col-span-2 text-center">Bill Qty</div>
                <div className="col-span-1 text-right">Price</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              <div className="space-y-3 md:space-y-0 md:divide-y md:divide-slate-200 dark:md:divide-slate-800 md:border md:border-t-0 md:border-slate-200 dark:md:border-slate-800 md:rounded-b-xl overflow-hidden">
                {billItems.length === 0 ? (
                  <div className="p-8 text-center italic text-slate-400 bg-white dark:bg-slate-900">Select a Vendor, PO, and GRN to load billable items.</div>
                ) : billItems.map((item, idx) => {
                  const total = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
                  return (
                    <div key={idx} className="p-4 bg-white dark:bg-slate-900 grid grid-cols-1 md:grid-cols-12 gap-3 items-center text-sm">
                      <div className="md:col-span-3">
                        <label className="md:hidden os-label mb-1 block">Item Description</label>
                        <input type="text" readOnly value={item.item_description} className="os-input bg-slate-50 dark:bg-slate-800" />
                      </div>
                      <div className="md:col-span-1 text-center text-slate-500">
                        <label className="md:hidden os-label inline mr-2">Ord:</label>{item.ordered_quantity}
                      </div>
                      <div className="md:col-span-1 text-center font-bold text-slate-700 dark:text-slate-300">
                        <label className="md:hidden os-label inline mr-2">Accpt:</label>{item.accepted_quantity}
                      </div>
                      <div className="md:col-span-1 text-center text-amber-600">
                        <label className="md:hidden os-label inline mr-2">Prev Billed:</label>{item.previously_billed_qty}
                      </div>
                      <div className="md:col-span-1 text-center font-bold text-sky-600">
                        <label className="md:hidden os-label inline mr-2">Rem:</label>{item.remaining_billable_qty}
                      </div>
                      <div className="md:col-span-2">
                        <label className="md:hidden os-label mb-1 block">Bill Qty</label>
                        <input
                          type="number"
                          placeholder="Qty"
                          min="1"
                          max={item.remaining_billable_qty}
                          value={item.quantity}
                          onChange={(e) => {
                            const updated = [...billItems];
                            let val = Number(e.target.value);
                            if (val > item.remaining_billable_qty) val = item.remaining_billable_qty;
                            updated[idx].quantity = val;
                            setBillItems(updated);
                          }}
                          className="os-input text-center font-bold border-emerald-500 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="md:col-span-1 text-right">
                        <label className="md:hidden os-label mb-1 block">Price (₹)</label>
                        <input type="number" value={item.unit_price} readOnly className="os-input text-right bg-slate-50 dark:bg-slate-800" />
                      </div>
                      <div className="md:col-span-2 text-right font-black text-slate-800 dark:text-slate-200">
                        <label className="md:hidden os-label block text-left mb-1">Total</label>
                        ₹{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </form>
        </div>
      </FullWindowEntry>

      {/* 8. PAYMENT MODAL (600px) */}
      {isPaymentModalOpen && (
        <div className="os-modal-backdrop">
          <div className="os-modal-content os-modal-sm">
            <div className="os-modal-head">
              <h3 className="flex items-center gap-2">
                <DollarSign size={18} className="text-emerald-500" /> Record Vendor Payment
              </h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle size={16} /> {modalError}
              </div>
            )}

            <form onSubmit={handleRecordPayment} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              <div>
                <label className="os-label">Select Purchase Bill *</label>
                <select
                  required
                  value={paymentForm.purchase_bill_id}
                  onChange={(e) => {
                    const bill = purchaseBills.find(b => b.id === e.target.value);
                    setPaymentForm({
                      ...paymentForm,
                      purchase_bill_id: e.target.value,
                      vendor_id: bill ? bill.vendor_id : '',
                      amount: bill ? Number(bill.balance_due) : 0
                    });
                  }}
                  className="os-input"
                >
                  <option value="">-- Select Bill to Pay --</option>
                  {purchaseBills.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.bill_no || b.id.slice(0, 8)} — Balance Due: ₹{Number(b.balance_due).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="os-label">Payment Date</label>
                  <input
                    type="date"
                    value={paymentForm.payment_date}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                    className="os-input"
                  />
                </div>
                <div>
                  <label className="os-label">Payment Mode</label>
                  <select
                    value={paymentForm.payment_mode}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_mode: e.target.value })}
                    className="os-input"
                  >
                    <option value="bank_transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                    <option value="cheque">Cheque</option>
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="os-label">Source Account</label>
                <select
                  required
                  value={paymentForm.payment_mode === 'cash' ? paymentForm.cash_account_id : paymentForm.bank_account_id}
                  onChange={(e) => {
                    if (paymentForm.payment_mode === 'cash') {
                      setPaymentForm({ ...paymentForm, cash_account_id: e.target.value });
                    } else {
                      setPaymentForm({ ...paymentForm, bank_account_id: e.target.value });
                    }
                  }}
                  className="os-input"
                >
                  <option value="">-- Select Source Account --</option>
                  {paymentForm.payment_mode === 'cash' ? (
                    cashAccounts.map(c => <option key={c.id} value={c.id}>{c.account_name} ({c.account_code})</option>)
                  ) : (
                    bankAccounts.map(b => <option key={b.id} value={b.id}>{b.account_name} - {b.bank_name}</option>)
                  )}
                </select>
                {(paymentForm.payment_mode === 'cash' ? cashAccounts.length === 0 : bankAccounts.length === 0) && (
                  <p className="text-rose-500 text-[10px] mt-1 font-bold flex items-center gap-1">
                    <AlertCircle size={12} /> No {paymentForm.payment_mode === 'cash' ? 'cash' : 'bank'} accounts configured in Accounting.
                  </p>
                )}
              </div>

              <div>
                <label className="os-label">Payment Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                  className="os-input font-bold text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <div>
                <label className="os-label">Reference Number (UTR / Cheque No)</label>
                <input
                  type="text"
                  value={paymentForm.reference_number}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference_number: e.target.value })}
                  placeholder="e.g. UTR123456789"
                  className="os-input font-mono"
                />
              </div>

              <div className="os-modal-foot">
                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="os-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="os-primary cursor-pointer">
                  {isSubmitting ? 'Recording...' : 'Record Vendor Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
