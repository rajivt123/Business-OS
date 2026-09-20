import { useState, useMemo } from 'react';
import { useAccounts } from '../../context/AccountsContext';

export default function BankAccountModal({ isOpen, onClose }) {
  const { accounts, createBankAccount, submitting, error: contextError, setError } = useAccounts();

  const [form, setForm] = useState({
    account_name: '',
    account_type: 'BANK', // BANK or CASH
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    branch_name: '',
    chart_of_account_id: '',
    opening_balance: 0,
    is_active: true
  });

  const [localError, setLocalError] = useState(null);

  // Filter COA for Bank and Cash ledger accounts
  const ledgerAccountOptions = useMemo(() => {
    return (accounts || []).filter(a => a.is_active && (a.account_type === 'ASSET' || a.account_subtype?.toLowerCase().includes('bank') || a.account_subtype?.toLowerCase().includes('cash')));
  }, [accounts]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    if (setError) setError(null);

    if (!form.account_name.trim()) {
      setLocalError('Account name is required');
      return;
    }

    if (form.account_type === 'BANK' && !form.bank_name.trim()) {
      setLocalError('Bank name is required for bank accounts');
      return;
    }

    try {
      const payload = {
        account_name: form.account_name,
        account_type: form.account_type,
        bank_name: form.bank_name,
        account_number: form.account_number,
        ifsc_code: form.ifsc_code,
        branch_name: form.branch_name,
        ledger_account_id: form.chart_of_account_id || null,
        initial_balance: form.opening_balance
      };
      const res = await createBankAccount(payload);
      if (res?.success) {
        onClose();
      } else if (res?.error) {
        setLocalError(res.error);
      }
    } catch (err) {
      setLocalError(err.message || 'Failed to save bank account');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Add Bank / Cash Account</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Configure financial institution or cash desk foundation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {(localError || contextError) && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{localError || contextError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Account Type *</label>
              <select
                value={form.account_type}
                onChange={(e) => setForm({ ...form, account_type: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="BANK">Bank Account</option>
                <option value="CASH">Cash Account</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Account Display Name *</label>
              <input
                type="text"
                placeholder="e.g. HDFC Main Operating"
                value={form.account_name}
                onChange={(e) => setForm({ ...form, account_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {form.account_type === 'BANK' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Bank Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC Bank"
                    value={form.bank_name}
                    onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Account Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 50100234567890"
                    value={form.account_number}
                    onChange={(e) => setForm({ ...form, account_number: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">IFSC Code</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC0000240"
                    value={form.ifsc_code}
                    onChange={(e) => setForm({ ...form, ifsc_code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Branch Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Jubilee Hills"
                    value={form.branch_name}
                    onChange={(e) => setForm({ ...form, branch_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Linked Ledger Account</label>
              <select
                value={form.chart_of_account_id}
                onChange={(e) => setForm({ ...form, chart_of_account_id: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Select Chart of Account --</option>
                {ledgerAccountOptions.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.account_code} - {acc.account_name} ({acc.account_type})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Opening Balance (₹)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.opening_balance}
                onChange={(e) => setForm({ ...form, opening_balance: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_active_bank"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4 rounded border-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900 bg-slate-950"
            />
            <label htmlFor="is_active_bank" className="text-xs text-slate-300 cursor-pointer">
              Active Account (Enabled for transactions & reconciliation)
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
              <span>Save Account</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
