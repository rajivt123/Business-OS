import React, { useState } from 'react';
import { X, Loader2, BookOpen, Layers, Hash, CheckCircle2 } from 'lucide-react';
import { useAccounts } from '../../context/AccountsContext';

export default function AccountModal({ isOpen, onClose, isDarkMode }) {
  const { accounts, createAccount, submitting } = useAccounts();
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({
    account_code: '',
    account_name: '',
    account_type: 'ASSET',
    account_subtype: 'CASH',
    parent_account_id: '',
    is_control_account: false,
    is_system_account: false,
    is_active: true
  });

  if (!isOpen) return null;

  const tModal = isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-2xl';
  const tHeader = isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50';
  const tSection = isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200/80';
  const tInput = isDarkMode ? 'bg-slate-950 border-slate-700 text-slate-100 focus:border-amber-500' : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500 shadow-sm';
  const tLabel = isDarkMode ? 'text-slate-300' : 'text-slate-700';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!form.account_code.trim()) {
      setErrorMsg('Account code is required');
      return;
    }
    if (!form.account_name.trim()) {
      setErrorMsg('Account name is required');
      return;
    }

    const res = await createAccount(form);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to create account');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`max-w-[750px] w-full max-h-[90vh] flex flex-col rounded-xl border ${tModal}`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex justify-between items-center shrink-0 ${tHeader}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">New Chart of Account</h2>
              <p className="text-xs text-slate-500">Define general ledger account classification and hierarchy</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form id="account-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <div className={`p-4 rounded-xl border space-y-4 ${tSection}`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4" /> Account Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                  Account Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="account_code"
                  value={form.account_code}
                  onChange={handleChange}
                  placeholder="e.g. 1010"
                  className={`w-full rounded-lg px-3 py-2 text-sm border font-mono ${tInput}`}
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                  Account Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="account_name"
                  value={form.account_name}
                  onChange={handleChange}
                  placeholder="e.g. Bank Account (HDFC)"
                  className={`w-full rounded-lg px-3 py-2 text-sm border ${tInput}`}
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                  Account Type
                </label>
                <select
                  name="account_type"
                  value={form.account_type}
                  onChange={handleChange}
                  className={`w-full rounded-lg px-3 py-2 text-sm border ${tInput}`}
                >
                  <option value="ASSET">ASSET (Asset)</option>
                  <option value="LIABILITY">LIABILITY (Liability)</option>
                  <option value="EQUITY">EQUITY (Equity)</option>
                  <option value="REVENUE">REVENUE (Income / Sales)</option>
                  <option value="EXPENSE">EXPENSE (Expense / COGS)</option>
                </select>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                  Account Subtype
                </label>
                <select
                  name="account_subtype"
                  value={form.account_subtype}
                  onChange={handleChange}
                  className={`w-full rounded-lg px-3 py-2 text-sm border ${tInput}`}
                >
                  <option value="CASH">CASH (Cash in hand)</option>
                  <option value="BANK">BANK (Bank account)</option>
                  <option value="RECEIVABLE">RECEIVABLE (Accounts Receivable)</option>
                  <option value="PAYABLE">PAYABLE (Accounts Payable)</option>
                  <option value="TAX">TAX (GST / Duties & Taxes)</option>
                  <option value="INVENTORY">INVENTORY (Stock / Inventory Valuation)</option>
                  <option value="REVENUE">REVENUE (Operating Income)</option>
                  <option value="EXPENSE">EXPENSE (Operating Expense)</option>
                  <option value="CAPITAL">CAPITAL (Shareholders Capital)</option>
                  <option value="OTHER">OTHER (General Subtype)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                  Parent Account (Optional Hierarchy)
                </label>
                <select
                  name="parent_account_id"
                  value={form.parent_account_id}
                  onChange={handleChange}
                  className={`w-full rounded-lg px-3 py-2 text-sm border ${tInput}`}
                >
                  <option value="">None (Top-Level Account)</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      [{acc.account_code}] {acc.account_name} ({acc.account_type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-700/40 flex flex-wrap gap-4 text-xs font-semibold">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="is_control_account"
                  checked={form.is_control_account}
                  onChange={handleChange}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <span>Control Account</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="is_system_account"
                  checked={form.is_system_account}
                  onChange={handleChange}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <span>System Account</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <span>Active Account</span>
              </label>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex justify-end gap-3 shrink-0 ${tHeader}`}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-700 hover:bg-slate-800/50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="account-form"
            disabled={submitting}
            className="px-5 py-2 text-sm font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-colors"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving Account...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> Save Account
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
