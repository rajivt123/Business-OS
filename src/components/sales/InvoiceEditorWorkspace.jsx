import React, { useState } from 'react';
import {
  ArrowLeft, Save, Plus, Trash2, Calculator, Building2, Calendar, FileText,
  CheckCircle2, DollarSign, Send, ArrowRight
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';

export default function InvoiceEditorWorkspace({ onBack, onSaveInvoice }) {
  const { companies = [], activeOperatingCompany, isDarkMode } = useCrm();

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
  const [poReference, setPoReference] = useState('');
  const [notes, setNotes] = useState('Payment due within 30 days. Thank you for your business!');

  const [items, setItems] = useState([
    { id: 1, description: 'Fire Hydrant System Installation & Pipeline Testing', qty: 1, rate: 125000, taxRate: 18, discount: 0 }
  ]);

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now(), description: '', qty: 1, rate: 0, taxRate: 18, discount: 0 }
    ]);
  };

  const removeItem = (id) => {
    if (items.length === 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const calculateSubtotal = () => {
    return items.reduce((acc, item) => {
      const q = parseFloat(item.qty) || 0;
      const r = parseFloat(item.rate) || 0;
      const d = parseFloat(item.discount) || 0;
      return acc + (q * r - d);
    }, 0);
  };

  const calculateTotalTax = () => {
    return items.reduce((acc, item) => {
      const q = parseFloat(item.qty) || 0;
      const r = parseFloat(item.rate) || 0;
      const d = parseFloat(item.discount) || 0;
      const t = parseFloat(item.taxRate) || 0;
      const taxable = Math.max(0, q * r - d);
      return acc + (taxable * t / 100);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const totalTax = calculateTotalTax();
  const grandTotal = subtotal + totalTax;

  const handleSave = (status = 'draft') => {
    const payload = {
      invoiceNumber,
      customerId: selectedCustomerId,
      invoiceDate,
      dueDate,
      poReference,
      items,
      subtotal,
      totalTax,
      grandTotal,
      notes,
      status
    };
    if (onSaveInvoice) {
      onSaveInvoice(payload);
    } else {
      alert(`Invoice ${invoiceNumber} saved as ${status.toUpperCase()}!`);
      if (onBack) onBack();
    }
  };

  const selectedCustomer = companies.find(c => c.id === selectedCustomerId);

  return (
    <div className="space-y-6 pb-16">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft size={16} />
            <span>Sales Workspace</span>
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>New Tax Invoice</span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                Full-Page Workspace
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Create and issue compliant GST invoices for clients & projects.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave('draft')}
            className="os-secondary cursor-pointer"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave('issued')}
            className="os-primary flex items-center gap-1.5 cursor-pointer"
          >
            <Send size={14} />
            <span>Issue & Post Invoice</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Form Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Customer & Header Meta */}
        <div className="space-y-6">
          <div className="os-card p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-3">
              <Building2 size={16} className="text-sky-500" />
              <h3 className="text-xs font-black uppercase tracking-wider">Customer Details</h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                Select Client / Customer <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full rounded-xl p-3 outline-none text-xs font-semibold border bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 focus:border-sky-500 text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="">-- Choose Customer --</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.gstin ? `(GST: ${c.gstin})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {selectedCustomer && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 text-xs space-y-1">
                <p className="font-bold text-slate-800 dark:text-slate-200">{selectedCustomer.name}</p>
                {selectedCustomer.gstin && <p className="text-[11px] text-slate-500">GSTIN: {selectedCustomer.gstin}</p>}
                {selectedCustomer.billing_address?.street && (
                  <p className="text-[11px] text-slate-500 mt-1">{selectedCustomer.billing_address.street}, {selectedCustomer.billing_address.city}</p>
                )}
              </div>
            )}
          </div>

          <div className="os-card p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-3">
              <FileText size={16} className="text-indigo-500" />
              <h3 className="text-xs font-black uppercase tracking-wider">Invoice Metadata</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Invoice Number</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full rounded-xl p-2.5 outline-none text-xs font-mono font-bold border bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Invoice Date</label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full rounded-xl p-2.5 outline-none text-xs font-medium border bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-xl p-2.5 outline-none text-xs font-medium border bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">PO / WO Reference</label>
                <input
                  type="text"
                  placeholder="e.g. PO-2026-889"
                  value={poReference}
                  onChange={(e) => setPoReference(e.target.value)}
                  className="w-full rounded-xl p-2.5 outline-none text-xs font-medium border bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Line Items & Totals */}
        <div className="lg:col-span-2 space-y-6">
          <div className="os-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Calculator size={16} className="text-emerald-500" />
                <h3 className="text-xs font-black uppercase tracking-wider">Line Items & Services</h3>
              </div>
              <button
                type="button"
                onClick={addItem}
                className="os-secondary cursor-pointer text-xs flex items-center gap-1"
              >
                <Plus size={14} /> Add Line Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => {
                const itemTaxable = Math.max(0, (item.qty * item.rate) - (item.discount || 0));
                const itemTotal = itemTaxable * (1 + (item.taxRate || 0) / 100);

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] font-black text-slate-400 mt-2">#{index + 1}</span>
                      <input
                        type="text"
                        placeholder="Item / Service Description"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        className="flex-1 rounded-xl p-2.5 outline-none text-xs font-semibold border bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) => updateItem(item.id, 'qty', parseFloat(e.target.value) || 0)}
                          className="w-full rounded-xl p-2 outline-none border bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Rate (₹)</label>
                        <input
                          type="number"
                          min="0"
                          value={item.rate}
                          onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                          className="w-full rounded-xl p-2 outline-none border bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-0.5">GST Rate (%)</label>
                        <select
                          value={item.taxRate}
                          onChange={(e) => updateItem(item.id, 'taxRate', parseFloat(e.target.value) || 0)}
                          className="w-full rounded-xl p-2 outline-none border bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white cursor-pointer"
                        >
                          <option value={0}>0% (Exempt)</option>
                          <option value={5}>5%</option>
                          <option value={12}>12%</option>
                          <option value={18}>18% (Standard Services)</option>
                          <option value={28}>28%</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Line Total (incl tax)</label>
                        <div className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-200">
                          ₹{itemTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Calculations Summary Box */}
            <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal (Excl Tax)</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{subtotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Total GST Tax</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{totalTax.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between text-sm font-black">
                <span className="text-slate-900 dark:text-white">Grand Total Amount</span>
                <span className="text-emerald-600 dark:text-emerald-400">₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                Invoice Notes & Terms
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl p-3 outline-none text-xs border bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
