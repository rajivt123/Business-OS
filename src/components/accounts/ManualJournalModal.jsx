import { useState, useMemo, useEffect } from 'react';
import { useAccounts } from '../../context/AccountsContext';

export default function ManualJournalModal({ isOpen, onClose }) {
  const { accounts, postJournalEntry, submitting, error: contextError, setError } = useAccounts();

  const [voucherType, setVoucherType] = useState('JOURNAL');
  const [voucherNo, setVoucherNo] = useState('');
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [narration, setNarration] = useState('');
  const [referenceNo, setReferenceNo] = useState('');

  const [lines, setLines] = useState([
    { id: 'l-1', account_id: '', debit_amount: '', credit_amount: '', narration: '' },
    { id: 'l-2', account_id: '', debit_amount: '', credit_amount: '', narration: '' }
  ]);

  const [localError, setLocalError] = useState(null);

  // Auto-generate voucher number preview
  useEffect(() => {
    if (isOpen && !voucherNo) {
      const prefix = voucherType.slice(0, 2);
      const timestamp = String(Date.now()).slice(-4);
      setVoucherNo(`${prefix}-${new Date().getFullYear()}-${timestamp}`);
    }
  }, [isOpen, voucherType, voucherNo]);

  // Active Chart of Accounts list
  const activeAccounts = useMemo(() => {
    return (accounts || []).filter(a => a.is_active !== false);
  }, [accounts]);

  // Live Totals Calculation
  const totalDebit = useMemo(() => {
    return lines.reduce((sum, l) => sum + (parseFloat(l.debit_amount) || 0), 0);
  }, [lines]);

  const totalCredit = useMemo(() => {
    return lines.reduce((sum, l) => sum + (parseFloat(l.credit_amount) || 0), 0);
  }, [lines]);

  const imbalance = useMemo(() => {
    return Math.abs(totalDebit - totalCredit);
  }, [totalDebit, totalCredit]);

  const isBalanced = useMemo(() => {
    return totalDebit > 0 && imbalance < 0.001;
  }, [totalDebit, imbalance]);

  if (!isOpen) return null;

  const handleAddLine = () => {
    setLines([
      ...lines,
      { id: `l-${Date.now()}`, account_id: '', debit_amount: '', credit_amount: '', narration: '' }
    ]);
  };

  const handleRemoveLine = (index) => {
    if (lines.length <= 2) {
      setLocalError('Manual Journal Entry must contain at least 2 lines');
      return;
    }
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleLineChange = (index, field, value) => {
    setLocalError(null);
    const updated = [...lines];
    const targetLine = { ...updated[index] };

    if (field === 'debit_amount') {
      targetLine.debit_amount = value;
      if (parseFloat(value) > 0) {
        targetLine.credit_amount = ''; // Mutually exclusive debit/credit on same line
      }
    } else if (field === 'credit_amount') {
      targetLine.credit_amount = value;
      if (parseFloat(value) > 0) {
        targetLine.debit_amount = ''; // Mutually exclusive debit/credit on same line
      }
    } else {
      targetLine[field] = value;
    }

    updated[index] = targetLine;
    setLines(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    if (setError) setError(null);

    // 1. Validation Checks
    if (!narration.trim()) {
      setLocalError('Narration / Description is required');
      return;
    }

    if (lines.length < 2) {
      setLocalError('Journal entry must have at least 2 lines');
      return;
    }

    let hasEmptyAccount = false;
    let hasBothDebitCredit = false;
    let hasNegativeAmount = false;
    let hasZeroLine = false;

    lines.forEach((l) => {
      if (!l.account_id) hasEmptyAccount = true;
      const dr = parseFloat(l.debit_amount) || 0;
      const cr = parseFloat(l.credit_amount) || 0;
      if (dr < 0 || cr < 0) hasNegativeAmount = true;
      if (dr > 0 && cr > 0) hasBothDebitCredit = true;
      if (dr === 0 && cr === 0) hasZeroLine = true;
    });

    if (hasEmptyAccount) {
      setLocalError('Please select a Chart of Account for all lines');
      return;
    }

    if (hasNegativeAmount) {
      setLocalError('Negative amounts are not allowed in journal lines');
      return;
    }

    if (hasBothDebitCredit) {
      setLocalError('A single line cannot have both Debit and Credit amounts');
      return;
    }

    if (hasZeroLine) {
      setLocalError('Each line must have a non-zero Debit or Credit amount');
      return;
    }

    if (totalDebit === 0) {
      setLocalError('Journal total amount must be greater than zero');
      return;
    }

    if (!isBalanced) {
      setLocalError(`Unbalanced Journal Entry! Total Debit (₹${totalDebit.toFixed(2)}) must equal Total Credit (₹${totalCredit.toFixed(2)})`);
      return;
    }

    // 2. Format Payload
    const payload = {
      voucher_no: voucherNo.trim(),
      voucher_type: voucherType,
      entry_date: entryDate,
      narration: narration.trim(),
      reference_no: referenceNo.trim(),
      lines: lines.map(l => ({
        account_id: l.account_id,
        debit_amount: parseFloat(l.debit_amount) || 0,
        credit_amount: parseFloat(l.credit_amount) || 0,
        narration: l.narration?.trim() || narration.trim()
      }))
    };

    // 3. Post Journal Entry
    const res = await postJournalEntry(payload);
    if (res?.success) {
      onClose();
    } else if (res?.error) {
      setLocalError(res.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8 text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Post Manual Journal Entry</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Server-authoritative double-entry ledger posting</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {(localError || contextError) && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2.5">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{localError || contextError}</span>
            </div>
          )}

          {/* Top Parameters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Voucher Type *</label>
              <select
                value={voucherType}
                onChange={(e) => setVoucherType(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 shadow-sm"
              >
                <option value="JOURNAL">JOURNAL (JV)</option>
                <option value="PAYMENT">PAYMENT (PV)</option>
                <option value="RECEIPT">RECEIPT (RV)</option>
                <option value="CONTRA">CONTRA (CV)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Voucher No</label>
              <input
                type="text"
                placeholder="Auto-generated if empty"
                value={voucherNo}
                onChange={(e) => setVoucherNo(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Entry Date *</label>
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Reference / Doc No</label>
              <input
                type="text"
                placeholder="e.g. REF-2026-001"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Main Entry Narration *</label>
            <input
              type="text"
              placeholder="Provide clean transaction summary (e.g. Initial capital injection from HDFC bank)"
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Dynamic Journal Lines Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Journal Lines (Double Entry)</h4>
              <button
                type="button"
                onClick={handleAddLine}
                className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-300 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Line</span>
              </button>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950 shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3 w-12 text-center">#</th>
                    <th className="py-2.5 px-3 w-1/3">Account (COA) *</th>
                    <th className="py-2.5 px-3">Line Narration</th>
                    <th className="py-2.5 px-3 w-32 text-right">Debit (DR ₹)</th>
                    <th className="py-2.5 px-3 w-32 text-right">Credit (CR ₹)</th>
                    <th className="py-2.5 px-3 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {lines.map((line, idx) => (
                    <tr key={line.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="py-2 px-3 text-center text-slate-400 dark:text-slate-500 font-mono">{idx + 1}</td>
                      <td className="py-2 px-3">
                        <select
                          value={line.account_id}
                          onChange={(e) => handleLineChange(idx, 'account_id', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="">-- Select Account --</option>
                          {activeAccounts.map(a => (
                            <option key={a.id} value={a.id}>
                              {a.account_code} - {a.account_name} ({a.account_type})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          placeholder="Optional line note"
                          value={line.narration}
                          onChange={(e) => handleLineChange(idx, 'narration', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={line.debit_amount}
                          onChange={(e) => handleLineChange(idx, 'debit_amount', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 text-right font-mono focus:outline-none focus:border-emerald-500"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={line.credit_amount}
                          onChange={(e) => handleLineChange(idx, 'credit_amount', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 text-right font-mono focus:outline-none focus:border-cyan-500"
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors cursor-pointer"
                          title="Remove Line"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">
                    <td colSpan={3} className="py-3 px-4 text-right">Running Totals:</td>
                    <td className="py-3 px-3 text-right text-emerald-600 dark:text-emerald-400">₹{totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-3 text-right text-cyan-600 dark:text-cyan-400">₹{totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Live Balance Status Bar */}
          <div className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
            isBalanced
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
          }`}>
            <div className="flex items-center gap-2.5">
              {isBalanced ? (
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">✓</div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">!</div>
              )}
              <div>
                <p className="text-xs font-semibold">
                  {isBalanced ? 'JOURNAL ENTRY BALANCED' : 'JOURNAL ENTRY UNBALANCED'}
                </p>
                <p className="text-[11px] opacity-80">
                  {isBalanced
                    ? `Total Debit (₹${totalDebit.toFixed(2)}) equals Total Credit (₹${totalCredit.toFixed(2)})`
                    : `Difference of ₹${imbalance.toFixed(2)} between Debit (₹${totalDebit.toFixed(2)}) and Credit (₹${totalCredit.toFixed(2)})`
                  }
                </p>
              </div>
            </div>

            <div className="text-right font-mono text-xs font-bold">
              {isBalanced ? (
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  READY TO POST
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  UNBALANCED
                </span>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !isBalanced}
              className="px-6 py-2 text-xs font-medium bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 font-semibold cursor-pointer"
            >
              {submitting && <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
              <span>Post Journal Entry</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
