import React, { useState } from 'react';
import { X, Loader2, Calendar, CheckCircle2 } from 'lucide-react';
import { useAccounts } from '../../context/AccountsContext';

export default function FiscalPeriodModal({ isOpen, onClose, isDarkMode }) {
  const { createFiscalPeriod, submitting } = useAccounts();
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({
    period_name: 'FY 2026-2027',
    period_start: '2026-04-01',
    period_end: '2027-03-31',
    is_closed: false
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

    if (!form.period_name.trim()) {
      setErrorMsg('Period name is required');
      return;
    }
    if (!form.period_start || !form.period_end) {
      setErrorMsg('Start date and end date are required');
      return;
    }

    const res = await createFiscalPeriod(form);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to create fiscal period');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`max-w-[600px] w-full flex flex-col rounded-xl border ${tModal}`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex justify-between items-center shrink-0 ${tHeader}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">New Fiscal Period</h2>
              <p className="text-xs text-slate-500">Define financial year or accounting period boundaries</p>
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
        <form id="fiscal-period-form" onSubmit={handleSubmit} className="p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <div className={`p-4 rounded-xl border space-y-4 ${tSection}`}>
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                Period Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="period_name"
                value={form.period_name}
                onChange={handleChange}
                placeholder="e.g. FY 2026-2027"
                className={`w-full rounded-lg px-3 py-2 text-sm border ${tInput}`}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                  Start Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="period_start"
                  value={form.period_start}
                  onChange={handleChange}
                  className={`w-full rounded-lg px-3 py-2 text-sm border ${tInput}`}
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${tLabel}`}>
                  End Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="period_end"
                  value={form.period_end}
                  onChange={handleChange}
                  className={`w-full rounded-lg px-3 py-2 text-sm border ${tInput}`}
                  required
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-700/40">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold">
                <input
                  type="checkbox"
                  name="is_closed"
                  checked={form.is_closed}
                  onChange={handleChange}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <span>Closed Period (Prevents new journal postings)</span>
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
            form="fiscal-period-form"
            disabled={submitting}
            className="px-5 py-2 text-sm font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-colors"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving Period...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> Save Fiscal Period
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
