import { useState } from 'react';
import { useAccounts } from '../../context/AccountsContext';
import AccountModal from './AccountModal';
import FiscalPeriodModal from './FiscalPeriodModal';
import ManualJournalModal from './ManualJournalModal';
import BankAccountModal from './BankAccountModal';

function formatFinancialValue(val) {
  if (val === null || val === undefined || val === '') return 'Unavailable';
  const num = Number(val);
  if (isNaN(num)) return 'Unavailable';
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatReconciliationBadge(isReconciled) {
  if (isReconciled === null || isReconciled === undefined) {
    return (
      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
        Unavailable
      </span>
    );
  }
  if (isReconciled === true) {
    return (
      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        RECONCILED
      </span>
    );
  }
  return (
    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
      UNBALANCED
    </span>
  );
}

export default function AccountsWorkspace() {
  const {
    accounts,
    fiscalPeriods,
    journalEntries,
    bankAccounts,
    bankTransactions,
    financials,
    arApIntegrity,
    fromDate,
    toDate,
    asOfDate,
    setFromDate,
    setToDate,
    setAsOfDate,
    isLoading,
    error,
    metrics,
    refreshAllAccounts
  } = useAccounts();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');

  // Modal Open States
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isFiscalPeriodModalOpen, setIsFiscalPeriodModalOpen] = useState(false);
  const [isManualJournalModalOpen, setIsManualJournalModalOpen] = useState(false);
  const [isBankAccountModalOpen, setIsBankAccountModalOpen] = useState(false);

  // Filtered Chart of Accounts
  const filteredAccounts = (accounts || []).filter(a => {
    const matchesSearch =
      (a.account_code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.account_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.account_subtype || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedTypeFilter === 'ALL' || a.account_type === selectedTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* Top Header */}
      <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0">

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Period:</span>
            <input
              type="date"
              value={fromDate || ''}
              onChange={(e) => setFromDate && setFromDate(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 font-mono text-xs focus:outline-none"
            />
            <span className="text-slate-400 dark:text-slate-500">to</span>
            <input
              type="date"
              value={toDate || ''}
              onChange={(e) => setToDate && setToDate(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 font-mono text-xs focus:outline-none"
            />
          </div>

          <button
            onClick={refreshAllAccounts}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Refresh Financial Data"
          >
            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <button
            onClick={() => setIsManualJournalModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>New Manual Journal</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 flex items-center gap-6 text-xs font-medium text-slate-500 dark:text-slate-400 overflow-x-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`py-3.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'dashboard'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400 font-semibold'
              : 'border-transparent hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('coa')}
          className={`py-3.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'coa'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400 font-semibold'
              : 'border-transparent hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span>Chart of Accounts</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {accounts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('fiscal_periods')}
          className={`py-3.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'fiscal_periods'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400 font-semibold'
              : 'border-transparent hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span>Fiscal Periods</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {fiscalPeriods.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('journals')}
          className={`py-3.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'journals'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400 font-semibold'
              : 'border-transparent hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span>Journal Entries</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {journalEntries.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('bank_accounts')}
          className={`py-3.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'bank_accounts'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400 font-semibold'
              : 'border-transparent hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span>Bank & Cash Accounts</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {bankAccounts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('bank_transactions')}
          className={`py-3.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'bank_transactions'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400 font-semibold'
              : 'border-transparent hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span>Bank Transactions</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {bankTransactions.length}
          </span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs text-red-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* 1. DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Overview Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
                  <span>Cash & Bank Balance</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    ₹
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-100 font-mono">
                  {formatFinancialValue(financials?.cash_and_bank ?? financials?.total_cash_bank ?? financials?.cash_balance ?? financials?.cash)}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Authoritative liquidity from database RPC</p>
              </div>

              <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
                  <span>Accounts Receivable (AR)</span>
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    ↗
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-100 font-mono">
                  {formatFinancialValue(financials?.accounts_receivable ?? financials?.total_receivables ?? financials?.receivables ?? financials?.ar)}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Total customer receivables balance</p>
              </div>

              <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
                  <span>Accounts Payable (AP)</span>
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    ↘
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-100 font-mono">
                  {formatFinancialValue(financials?.accounts_payable ?? financials?.total_payables ?? financials?.payables ?? financials?.ap)}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Total vendor payables balance</p>
              </div>

              <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
                  <span>Active Fiscal Period</span>
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    📅
                  </div>
                </div>
                <div className="text-lg font-bold text-slate-100 truncate">
                  {metrics.activePeriod ? metrics.activePeriod.period_name : 'No Active Period'}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {metrics.activePeriod ? `${metrics.activePeriod.period_start} to ${metrics.activePeriod.period_end}` : 'Create period in Fiscal Periods tab'}
                </p>
              </div>
            </div>

            {/* Authoritative Financial Statement Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-3">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center justify-between">
                  <span>Profit & Loss Summary</span>
                  <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">RPC AUTHORITATIVE</span>
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Total Revenue:</span>
                    <span className="font-mono font-bold text-slate-100">
                      {formatFinancialValue(financials?.total_revenue ?? financials?.revenue ?? financials?.sales_revenue)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Total Expenses:</span>
                    <span className="font-mono font-bold text-slate-100">
                      {formatFinancialValue(financials?.total_expenses ?? financials?.expenses)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 font-bold pt-1 text-sm">
                    <span className="text-slate-200">Net Result:</span>
                    <span className="font-mono text-emerald-400">
                      {formatFinancialValue(financials?.net_result ?? financials?.net_profit ?? financials?.pnl)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-3">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center justify-between">
                  <span>Balance Sheet Summary</span>
                  <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20">RPC AUTHORITATIVE</span>
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Total Assets:</span>
                    <span className="font-mono font-bold text-slate-100">
                      {formatFinancialValue(financials?.total_assets ?? financials?.assets)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Total Liabilities:</span>
                    <span className="font-mono font-bold text-slate-100">
                      {formatFinancialValue(financials?.total_liabilities ?? financials?.liabilities)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 font-bold pt-1 text-sm">
                    <span className="text-slate-200">Total Equity:</span>
                    <span className="font-mono text-indigo-400">
                      {formatFinancialValue(financials?.total_equity ?? financials?.equity)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* AR/AP Reconciliation Integrity (RPC Authoritative) */}
            <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-slate-200">AR & AP Ledger Reconciliation Integrity</h3>
                  <span className="text-[10px] font-mono bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded-full border border-teal-500/20">
                    RPC AUTHORITATIVE
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">As Of Date:</span>
                    <input
                      type="date"
                      value={asOfDate || ''}
                      onChange={(e) => setAsOfDate && setAsOfDate(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Overall Status:</span>
                    {formatReconciliationBadge(arApIntegrity?.overall_reconciled)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Accounts Receivable (AR) Card */}
                <div className="p-4 bg-slate-950/60 border border-slate-800/60 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                      Accounts Receivable (AR)
                    </span>
                    {formatReconciliationBadge(arApIntegrity?.ar?.is_reconciled)}
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">AR GL Balance:</span>
                      <span className="font-mono font-bold text-slate-100">
                        {formatFinancialValue(arApIntegrity?.ar?.gl_balance)}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">AR Operational Outstanding:</span>
                      <span className="font-mono font-bold text-slate-100">
                        {formatFinancialValue(arApIntegrity?.ar?.operational_outstanding)}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">AR Difference:</span>
                      <span className={`font-mono font-bold ${
                        arApIntegrity?.ar?.difference === 0 ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {formatFinancialValue(arApIntegrity?.ar?.difference)}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 text-slate-500 text-[11px]">
                      <span>Control Accounts Count:</span>
                      <span className="font-mono text-slate-400">
                        {arApIntegrity?.ar?.control_account_count ?? 'Unavailable'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Accounts Payable (AP) Card */}
                <div className="p-4 bg-slate-950/60 border border-slate-800/60 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      Accounts Payable (AP)
                    </span>
                    {formatReconciliationBadge(arApIntegrity?.ap?.is_reconciled)}
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">AP GL Balance:</span>
                      <span className="font-mono font-bold text-slate-100">
                        {formatFinancialValue(arApIntegrity?.ap?.gl_balance)}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">AP Operational Outstanding:</span>
                      <span className="font-mono font-bold text-slate-100">
                        {formatFinancialValue(arApIntegrity?.ap?.operational_outstanding)}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">AP Difference:</span>
                      <span className={`font-mono font-bold ${
                        arApIntegrity?.ap?.difference === 0 ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {formatFinancialValue(arApIntegrity?.ap?.difference)}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 text-slate-500 text-[11px]">
                      <span>Control Accounts Count:</span>
                      <span className="font-mono text-slate-400">
                        {arApIntegrity?.ap?.control_account_count ?? 'Unavailable'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Journals */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-200">Recent Posted Journals</h3>
                <button
                  onClick={() => setActiveTab('journals')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                >
                  View All ({journalEntries.length}) →
                </button>
              </div>

              <div className="border border-slate-800/80 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="py-2.5 px-4">Voucher No</th>
                      <th className="py-2.5 px-4">Type</th>
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Narration</th>
                      <th className="py-2.5 px-4 text-right">Lines</th>
                      <th className="py-2.5 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {journalEntries.slice(0, 5).map(j => (
                      <tr key={j.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-blue-400">{j.voucher_number || j.voucher_no || j.id.slice(0, 8)}</td>
                        <td className="py-3 px-4 font-semibold text-slate-300">{j.voucher_type}</td>
                        <td className="py-3 px-4 text-slate-400">{j.entry_date}</td>
                        <td className="py-3 px-4 text-slate-200 truncate max-w-xs">{j.narration || '-'}</td>
                        <td className="py-3 px-4 text-right font-mono text-slate-300">{j.lines?.length || 0}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            POSTED
                          </span>
                        </td>
                      </tr>
                    ))}
                    {journalEntries.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                          No posted journal entries found. Use "New Manual Journal" to record transactions.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. CHART OF ACCOUNTS TAB */}
        {activeTab === 'coa' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-[280px]">
                <input
                  type="text"
                  placeholder="Search code, account name or subtype..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />

                <select
                  value={selectedTypeFilter}
                  onChange={(e) => setSelectedTypeFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">All Types</option>
                  <option value="ASSET">ASSET</option>
                  <option value="LIABILITY">LIABILITY</option>
                  <option value="EQUITY">EQUITY</option>
                  <option value="REVENUE">REVENUE</option>
                  <option value="EXPENSE">EXPENSE</option>
                </select>
              </div>

              <button
                onClick={() => setIsAccountModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>New Account</span>
              </button>
            </div>

            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4 w-28">Code</th>
                    <th className="py-3 px-4">Account Name</th>
                    <th className="py-3 px-4 w-28">Type</th>
                    <th className="py-3 px-4 w-36">Subtype</th>
                    <th className="py-3 px-4 text-center w-24">Control</th>
                    <th className="py-3 px-4 text-center w-24">System</th>
                    <th className="py-3 px-4 text-center w-24">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {filteredAccounts.map(a => (
                    <tr key={a.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-400">{a.account_code}</td>
                      <td className="py-3 px-4 font-medium text-slate-200">{a.account_name}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          a.account_type === 'ASSET' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          a.account_type === 'LIABILITY' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          a.account_type === 'EQUITY' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                          a.account_type === 'REVENUE' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {a.account_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{a.account_subtype || '-'}</td>
                      <td className="py-3 px-4 text-center text-slate-400">{a.is_control_account ? 'Yes' : 'No'}</td>
                      <td className="py-3 px-4 text-center text-slate-400">{a.is_system_account ? 'Yes' : 'No'}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          a.is_active !== false ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {a.is_active !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredAccounts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                        No Chart of Accounts found. Click "New Account" to add standard ledger accounts.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. FISCAL PERIODS TAB */}
        {activeTab === 'fiscal_periods' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200">Accounting Fiscal Periods</h3>
              <button
                onClick={() => setIsFiscalPeriodModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>New Fiscal Period</span>
              </button>
            </div>

            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Period Name</th>
                    <th className="py-3 px-4">Start Date</th>
                    <th className="py-3 px-4">End Date</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {fiscalPeriods.map(fp => (
                    <tr key={fp.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-100">{fp.period_name}</td>
                      <td className="py-3.5 px-4 text-slate-300 font-mono">{fp.period_start}</td>
                      <td className="py-3.5 px-4 text-slate-300 font-mono">{fp.period_end}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          !fp.is_closed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {!fp.is_closed ? 'OPEN' : 'CLOSED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {fiscalPeriods.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500 text-xs">
                        No fiscal periods found. Click "New Fiscal Period" to configure current financial year.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. JOURNAL ENTRIES TAB */}
        {activeTab === 'journals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200">General Ledger Journal Entries</h3>
              <button
                onClick={() => setIsManualJournalModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>New Manual Journal</span>
              </button>
            </div>

            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Voucher No</th>
                    <th className="py-3 px-4">Voucher Type</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Narration</th>
                    <th className="py-3 px-4 text-right">Lines</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {journalEntries.map(j => (
                    <tr key={j.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-400">{j.voucher_number || j.voucher_no || j.id.slice(0, 8)}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-300">{j.voucher_type}</td>
                      <td className="py-3.5 px-4 text-slate-300 font-mono">{j.entry_date}</td>
                      <td className="py-3.5 px-4 text-slate-200 truncate max-w-sm">{j.narration || '-'}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-200">{j.lines?.length || 0}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          POSTED
                        </span>
                      </td>
                    </tr>
                  ))}
                  {journalEntries.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                        No posted journal entries found. Click "New Manual Journal" to create double-entry transactions.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. BANK & CASH ACCOUNTS TAB */}
        {activeTab === 'bank_accounts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200">Bank & Cash Accounts Foundation</h3>
              <button
                onClick={() => setIsBankAccountModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Bank Account</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bankAccounts.map(b => (
                <div key={b.id} className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {b.account_type}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {b.account_number ? `•••• ${b.account_number.slice(-4)}` : 'Cash Box'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-100">{b.account_name}</h4>
                    <p className="text-xs text-slate-400">{b.bank_name || 'Cash Desk'}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Balance:</span>
                    <span className="text-lg font-bold font-mono text-emerald-400">
                      {formatFinancialValue(b.current_balance)}
                    </span>
                  </div>
                </div>
              ))}

              {bankAccounts.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
                  No bank or cash accounts configured. Click "Add Bank Account" to configure liquidity foundation.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. BANK TRANSACTIONS TAB */}
        {activeTab === 'bank_transactions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200">Bank & Cash Transactions</h3>
            </div>

            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-right">Amount (₹)</th>
                    <th className="py-3 px-4 text-center">Reconciliation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {bankTransactions.map(bt => (
                    <tr key={bt.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-300">{bt.transaction_date}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-300">{bt.transaction_type}</td>
                      <td className="py-3.5 px-4 font-mono text-blue-400">{bt.reference_no || '-'}</td>
                      <td className="py-3.5 px-4 text-slate-200">{bt.description || '-'}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-100">
                        {formatFinancialValue(bt.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          bt.is_reconciled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {bt.is_reconciled ? 'RECONCILED' : 'PENDING'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {bankTransactions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                        No bank transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />

      <FiscalPeriodModal
        isOpen={isFiscalPeriodModalOpen}
        onClose={() => setIsFiscalPeriodModalOpen(false)}
      />

      <ManualJournalModal
        isOpen={isManualJournalModalOpen}
        onClose={() => setIsManualJournalModalOpen(false)}
      />

      <BankAccountModal
        isOpen={isBankAccountModalOpen}
        onClose={() => setIsBankAccountModalOpen(false)}
      />
    </div>
  );
}
