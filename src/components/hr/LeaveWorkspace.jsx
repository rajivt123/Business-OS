import React, { useState, useMemo } from 'react';
import { useLeave } from '../../context/LeaveContext';
import { useHrPolicy } from '../../context/HrPolicyContext';
import { useEmployee } from '../../context/EmployeeContext';
import { useCrm } from '../../context/CrmContext';
import {
  Calendar, CalendarDays, Palmtree, Plus, Clock, CheckCircle2, XCircle, AlertCircle,
  TrendingUp, FileText, Search, Filter, ArrowUpRight, ArrowDownRight, RefreshCw, ShieldAlert,
  SlidersHorizontal, UserCheck, ShieldCheck, HelpCircle, AlertTriangle, Layers, User
} from 'lucide-react';

export default function LeaveWorkspace() {
  const {
    leaveRequests = [],
    leaveRequestDays = [],
    leaveBalances = [],
    leaveLedger = [],
    isLoading,
    error,
    currentEmployee,
    isManagement,
    calculateLeaveDays,
    applyLeave,
    cancelLeave,
    accrueLeave,
    fetchLeaveData
  } = useLeave();

  const { leaveTypes = [], holidayCalendarDays = [], weeklyOffPolicies = [] } = useHrPolicy() || {};
  const { employees = [] } = useEmployee() || {};
  const { activeOperatingCompany } = useCrm() || {};

  const [activeTab, setActiveTab] = useState('my_leave'); // 'my_leave' | 'balances_ledger' | 'calendar_calculator' | 'management'
  const [notice, setNotice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Apply Modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({
    leave_type_id: '',
    from_date: '',
    to_date: '',
    half_day_type: 'none',
    reason: ''
  });

  // Accrual Modal state (Management)
  const [showAccrualModal, setShowAccrualModal] = useState(false);
  const [accrualForm, setAccrualForm] = useState({
    employee_id: '',
    leave_type_id: '',
    quantity: '',
    reason: ''
  });

  // Calculator state
  const [calcForm, setCalcForm] = useState({
    from_date: '',
    to_date: '',
    half_day_type: 'none'
  });

  // Search/Filters
  const [balanceSearch, setBalanceSearch] = useState('');
  const [ledgerFilterType, setLedgerFilterType] = useState('all');

  // Today's date
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter user's own leave requests
  const myLeaveRequests = useMemo(() => {
    if (!currentEmployee) return [];
    return leaveRequests.filter(r => r.employee_id === currentEmployee.id);
  }, [leaveRequests, currentEmployee]);

  // My Leave Balances
  const myBalances = useMemo(() => {
    if (!currentEmployee) return [];
    return leaveTypes.map(lt => {
      const bal = leaveBalances.find(b => b.employee_id === currentEmployee.id && b.leave_type_id === lt.id);
      return {
        leaveType: lt,
        accrued: Number(bal?.accrued || 0),
        used: Number(bal?.used || 0),
        pending: Number(bal?.pending || 0),
        available_balance: Number(bal?.available_balance || 0)
      };
    });
  }, [leaveTypes, leaveBalances, currentEmployee]);

  // Real-time calculated breakdown for Apply Modal
  const applyCalculation = useMemo(() => {
    if (!applyForm.from_date || !applyForm.to_date) return null;
    return calculateLeaveDays({
      from_date: applyForm.from_date,
      to_date: applyForm.to_date,
      half_day_type: applyForm.half_day_type
    });
  }, [applyForm.from_date, applyForm.to_date, applyForm.half_day_type, calculateLeaveDays]);

  // Real-time calculation for standalone Calculator tab
  const standaloneCalc = useMemo(() => {
    if (!calcForm.from_date || !calcForm.to_date) return null;
    return calculateLeaveDays({
      from_date: calcForm.from_date,
      to_date: calcForm.to_date,
      half_day_type: calcForm.half_day_type
    });
  }, [calcForm.from_date, calcForm.to_date, calcForm.half_day_type, calculateLeaveDays]);

  // Selected leave type balance for Apply Modal validation
  const selectedTypeBalance = useMemo(() => {
    if (!currentEmployee || !applyForm.leave_type_id) return 0;
    const bal = leaveBalances.find(b => b.employee_id === currentEmployee.id && b.leave_type_id === applyForm.leave_type_id);
    return Number(bal?.available_balance || 0);
  }, [currentEmployee, applyForm.leave_type_id, leaveBalances]);

  // Filtered Ledger Entries
  const filteredLedger = useMemo(() => {
    let list = [...leaveLedger];
    if (ledgerFilterType !== 'all') {
      list = list.filter(l => l.transaction_type === ledgerFilterType);
    }
    return list;
  }, [leaveLedger, ledgerFilterType]);

  // Filtered Balances list for table
  const filteredBalances = useMemo(() => {
    return leaveBalances.filter(b => {
      const emp = employees.find(e => e.id === b.employee_id);
      const empName = emp ? `${emp.first_name} ${emp.last_name} ${emp.employee_code || ''}`.toLowerCase() : '';
      return empName.includes(balanceSearch.toLowerCase());
    });
  }, [leaveBalances, employees, balanceSearch]);

  // Handle Submit Apply Form
  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!applyForm.leave_type_id || !applyForm.from_date || !applyForm.to_date) {
      setNotice({ type: 'error', text: 'Please fill in all required leave application fields.' });
      return;
    }
    if (applyForm.from_date > applyForm.to_date) {
      setNotice({ type: 'error', text: 'From Date cannot be later than To Date.' });
      return;
    }

    setIsSubmitting(true);
    setNotice(null);

    const res = await applyLeave({
      leave_type_id: applyForm.leave_type_id,
      from_date: applyForm.from_date,
      to_date: applyForm.to_date,
      half_day_type: applyForm.half_day_type,
      reason: applyForm.reason
    });

    setIsSubmitting(false);

    if (res.success) {
      setNotice({ type: 'success', text: 'Leave application submitted successfully and sent for approval!' });
      setShowApplyModal(false);
      setApplyForm({ leave_type_id: '', from_date: '', to_date: '', half_day_type: 'none', reason: '' });
    } else {
      setNotice({ type: 'error', text: res.error || 'Failed to submit leave application.' });
    }
  };

  // Handle Accrual Submit (Management)
  const handleAccrualSubmit = async (e) => {
    e.preventDefault();
    if (!accrualForm.employee_id || !accrualForm.leave_type_id || !accrualForm.quantity) {
      setNotice({ type: 'error', text: 'Please select employee, leave type and enter quantity.' });
      return;
    }

    setIsSubmitting(true);
    setNotice(null);

    const res = await accrueLeave({
      employee_id: accrualForm.employee_id,
      leave_type_id: accrualForm.leave_type_id,
      quantity: accrualForm.quantity,
      reason: accrualForm.reason
    });

    setIsSubmitting(false);

    if (res.success) {
      setNotice({ type: 'success', text: 'Leave balance accrued/adjusted successfully.' });
      setShowAccrualModal(false);
      setAccrualForm({ employee_id: '', leave_type_id: '', quantity: '', reason: '' });
    } else {
      setNotice({ type: 'error', text: res.error || 'Failed to accrue leave balance.' });
    }
  };

  // Handle Cancel Request
  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel/withdraw this leave request?')) return;
    setIsSubmitting(true);
    const res = await cancelLeave(requestId);
    setIsSubmitting(false);
    if (res.success) {
      setNotice({ type: 'success', text: 'Leave request cancelled successfully. Balances restored.' });
    } else {
      setNotice({ type: 'error', text: res.error || 'Failed to cancel leave request.' });
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-500/10 rounded-xl border border-teal-500/20 text-teal-400">
              <Palmtree className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Leave Management
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-medium border border-teal-500/30">
                  P0 Live
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                Self-service leave requests, balances, date-by-date policies, and Common Approval Engine integration.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchLeaveData(activeOperatingCompany?.id)}
            className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition flex items-center gap-2 text-sm"
            title="Refresh Leave Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {currentEmployee && (
            <button
              onClick={() => setShowApplyModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-medium rounded-xl shadow-lg shadow-teal-900/30 border border-teal-400/30 transition flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Apply for Leave</span>
            </button>
          )}
        </div>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm ${
            notice.type === 'error'
              ? 'bg-rose-950/40 border-rose-800/60 text-rose-300'
              : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-3">
            {notice.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            <span>{notice.text}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-slate-400 hover:text-white">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Subtabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('my_leave')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
            activeTab === 'my_leave'
              ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <User className="w-4 h-4" />
          <span>My Leave</span>
        </button>

        <button
          onClick={() => setActiveTab('balances_ledger')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
            activeTab === 'balances_ledger'
              ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Balances & Audit Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar_calculator')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
            activeTab === 'calendar_calculator'
              ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Leave Calculator & Calendar</span>
        </button>

        {isManagement && (
          <button
            onClick={() => setActiveTab('management')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
              activeTab === 'management'
                ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Management Dashboard</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MY LEAVE */}
      {/* ========================================================================= */}
      {activeTab === 'my_leave' && (
        <div className="space-y-6">
          {/* Balance KPI Cards */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-400" />
              <span>My Leave Balances</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {myBalances.map(b => (
                <div key={b.leaveType.id} className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{b.leaveType.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-teal-300 font-mono">
                      Code: {b.leaveType.code || 'LT'}
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <div>
                      <span className="text-3xl font-bold text-white font-mono">{b.available_balance}</span>
                      <span className="text-xs text-slate-400 ml-1">days available</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>Accrued: <strong className="text-slate-200">{b.accrued}</strong></span>
                    <span>Pending: <strong className="text-amber-400">{b.pending}</strong></span>
                    <span>Used: <strong className="text-rose-400">{b.used}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Requests Table */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">My Recent Leave Requests</h3>
                <p className="text-xs text-slate-400 mt-0.5">Track status, calculation breakdown, and Common Approval Engine state</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">Total Requests: {myLeaveRequests.length}</span>
            </div>

            {myLeaveRequests.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Palmtree className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                <p className="text-sm font-medium text-slate-300">No leave requests found.</p>
                <p className="text-xs mt-1">Click "Apply for Leave" to submit your first leave application.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-5 py-3.5">Leave Type</th>
                      <th className="px-5 py-3.5">From - To</th>
                      <th className="px-5 py-3.5">Working Days</th>
                      <th className="px-5 py-3.5">Reason</th>
                      <th className="px-5 py-3.5">Approval Status</th>
                      <th className="px-5 py-3.5">Applied Date</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {myLeaveRequests.map(req => {
                      const lt = leaveTypes.find(t => t.id === req.leave_type_id);
                      return (
                        <tr key={req.id} className="hover:bg-slate-800/30 transition">
                          <td className="px-5 py-4 font-medium text-white">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
                              <span>{lt ? lt.name : 'Leave'}</span>
                              {req.half_day_type && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-amber-500/20 uppercase font-mono">
                                  Half ({req.half_day_type})
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-4 font-mono text-xs">
                            {req.from_date} <span className="text-slate-500">to</span> {req.to_date}
                          </td>
                          <td className="px-5 py-4 font-mono font-bold text-teal-300">
                            {req.total_days} {req.total_days === 1 ? 'day' : 'days'}
                          </td>
                          <td className="px-5 py-4 text-xs text-slate-300 max-w-xs truncate">
                            {req.reason || 'N/A'}
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge status={req.status} />
                          </td>
                          <td className="px-5 py-4 font-mono text-xs text-slate-400">
                            {new Date(req.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-4 text-right">
                            {['pending_approval', 'approved'].includes(req.status) && (
                              <button
                                onClick={() => handleCancelRequest(req.id)}
                                disabled={isSubmitting}
                                className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs rounded-lg border border-rose-500/30 transition"
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BALANCES & AUDIT LEDGER */}
      {/* ========================================================================= */}
      {activeTab === 'balances_ledger' && (
        <div className="space-y-6">
          {/* Company Balances Section */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-teal-400" />
                  <span>Company Employee Balances</span>
                </h3>
                <p className="text-xs text-slate-400">View real-time leave entitlement, used, and pending balances across all employees</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={balanceSearch}
                    onChange={e => setBalanceSearch(e.target.value)}
                    placeholder="Search employee..."
                    className="pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500 w-48 sm:w-64"
                  />
                </div>

                {isManagement && (
                  <button
                    onClick={() => setShowAccrualModal(true)}
                    className="px-3.5 py-2 bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 text-xs font-medium rounded-xl border border-teal-500/30 transition flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Accrue / Adjust Balance</span>
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Leave Type</th>
                    <th className="px-4 py-3 text-right">Accrued</th>
                    <th className="px-4 py-3 text-right">Pending</th>
                    <th className="px-4 py-3 text-right">Used</th>
                    <th className="px-4 py-3 text-right">Available Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredBalances.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-xs text-slate-500">
                        No leave balances recorded yet.
                      </td>
                    </tr>
                  ) : (
                    filteredBalances.map(b => {
                      const emp = employees.find(e => e.id === b.employee_id);
                      const lt = leaveTypes.find(t => t.id === b.leave_type_id);
                      return (
                        <tr key={b.id} className="hover:bg-slate-800/30 transition">
                          <td className="px-4 py-3.5 font-medium text-white">
                            {emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown Employee'}
                            {emp?.employee_code && <span className="text-xs text-slate-500 ml-2 font-mono">({emp.employee_code})</span>}
                          </td>
                          <td className="px-4 py-3.5 text-xs text-teal-300">
                            {lt ? lt.name : 'Leave Type'}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono text-slate-300">{b.accrued}</td>
                          <td className="px-4 py-3.5 text-right font-mono text-amber-400">{b.pending}</td>
                          <td className="px-4 py-3.5 text-right font-mono text-rose-400">{b.used}</td>
                          <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-400">{b.available_balance}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Immutable Audit Ledger Section */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-400" />
                  <span>Immutable Leave Ledger Audit Trail</span>
                </h3>
                <p className="text-xs text-slate-400">Strict ledger history for leave_used (-), leave_reversal (+), and accruals (+)</p>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={ledgerFilterType}
                  onChange={e => setLedgerFilterType(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="all">All Transaction Types</option>
                  <option value="leave_used">Leave Used (-)</option>
                  <option value="leave_reversal">Leave Reversal (+)</option>
                  <option value="accrual">Accruals (+)</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Leave Type</th>
                    <th className="px-4 py-3">Transaction Type</th>
                    <th className="px-4 py-3 text-right">Quantity</th>
                    <th className="px-4 py-3">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredLedger.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-xs text-slate-500">
                        No ledger transactions found.
                      </td>
                    </tr>
                  ) : (
                    filteredLedger.map(l => {
                      const emp = employees.find(e => e.id === l.employee_id);
                      const lt = leaveTypes.find(t => t.id === l.leave_type_id);
                      const isDebit = Number(l.quantity) < 0;
                      return (
                        <tr key={l.id} className="hover:bg-slate-800/30 transition">
                          <td className="px-4 py-3 font-mono text-xs text-slate-400">
                            {new Date(l.created_at).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 font-medium text-white">
                            {emp ? `${emp.first_name} ${emp.last_name}` : 'Employee'}
                          </td>
                          <td className="px-4 py-3 text-xs text-teal-300">
                            {lt ? lt.name : 'Leave'}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <span
                              className={`px-2 py-0.5 rounded-full font-mono text-[11px] ${
                                l.transaction_type === 'leave_used'
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  : l.transaction_type === 'leave_reversal'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-teal-500/10 text-teal-300 border border-teal-500/20'
                              }`}
                            >
                              {l.transaction_type}
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-right font-mono font-bold ${isDebit ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {Number(l.quantity) > 0 ? `+${l.quantity}` : l.quantity}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-300 max-w-xs truncate">
                            {l.reason || 'N/A'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LEAVE CALCULATOR & HOLIDAY CALENDAR */}
      {/* ========================================================================= */}
      {activeTab === 'calendar_calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Interactive Calculator */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl p-6">
            <h3 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-teal-400" />
              <span>Date-by-Date Leave Calculator</span>
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Test date range classification against company holiday calendar and weekly-off policy rules
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">From Date</label>
                  <input
                    type="date"
                    value={calcForm.from_date}
                    onChange={e => setCalcForm({ ...calcForm, from_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">To Date</label>
                  <input
                    type="date"
                    value={calcForm.to_date}
                    onChange={e => setCalcForm({ ...calcForm, to_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Half Day Option</label>
                <select
                  value={calcForm.half_day_type}
                  onChange={e => setCalcForm({ ...calcForm, half_day_type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="none">Full Day (No Half-Day)</option>
                  <option value="first_half">First Half Only (0.5 Day)</option>
                  <option value="second_half">Second Half Only (0.5 Day)</option>
                </select>
              </div>

              {standaloneCalc && (
                <div className="mt-6 p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Billable Working Days</span>
                    <span className="text-2xl font-bold font-mono text-teal-300">{standaloneCalc.total_days} days</span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-medium text-slate-400">Day-by-Day Breakdown:</span>
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-2">
                      {standaloneCalc.dateBreakdown.map((d, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs p-2 rounded bg-slate-900/60 border border-slate-800">
                          <span className="font-mono text-slate-300">{d.leave_date}</span>
                          <span
                            className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                              d.day_type === 'working_day'
                                ? 'bg-teal-500/20 text-teal-300'
                                : d.day_type === 'holiday'
                                ? 'bg-purple-500/20 text-purple-300'
                                : d.day_type === 'weekly_off'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-slate-700 text-slate-300'
                            }`}
                          >
                            {d.day_type} ({d.day_count}d)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Holiday Calendar View */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl p-6">
            <h3 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
              <Palmtree className="w-5 h-5 text-teal-400" />
              <span>Company Public Holidays</span>
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Holidays automatically excluded from leave debit calculations
            </p>

            {holidayCalendarDays.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No public holidays defined in HR Policy Center for this company.
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {holidayCalendarDays.map(h => (
                  <div key={h.id} className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-white">{h.name || 'Public Holiday'}</h4>
                      <p className="text-xs text-purple-400 font-mono mt-0.5">{h.holiday_date}</p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
                      Excluded from Leave
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MANAGEMENT DASHBOARD */}
      {/* ========================================================================= */}
      {activeTab === 'management' && isManagement && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-lg">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Applications</span>
              <div className="mt-2 text-3xl font-bold font-mono text-white">{leaveRequests.length}</div>
              <p className="text-xs text-slate-500 mt-1">Across all employees</p>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-lg">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Pending Approval</span>
              <div className="mt-2 text-3xl font-bold font-mono text-amber-300">
                {leaveRequests.filter(r => r.status === 'pending_approval').length}
              </div>
              <p className="text-xs text-slate-500 mt-1">Awaiting manager action</p>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-lg">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Approved Leaves</span>
              <div className="mt-2 text-3xl font-bold font-mono text-emerald-300">
                {leaveRequests.filter(r => r.status === 'approved').length}
              </div>
              <p className="text-xs text-slate-500 mt-1">Applied to attendance</p>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-lg">
              <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">Active Employees</span>
              <div className="mt-2 text-3xl font-bold font-mono text-teal-300">{employees.length}</div>
              <p className="text-xs text-slate-500 mt-1">Operating Company Scope</p>
            </div>
          </div>

          {/* Integration Status Card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-teal-950/40 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
              <span>Common Approval Engine & Attendance P0 Integration</span>
            </h3>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Every leave application is routed through the Common Approval Engine P0 (`ApprovalContext`).
              Upon final approval, leave days update `attendance_daily_records.status = 'leave'` for affected dates.
              Cancellations append positive `leave_reversal` entries and restore daily records cleanly.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: APPLY FOR LEAVE */}
      {/* ========================================================================= */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Palmtree className="w-5 h-5 text-teal-400" />
                <span>Apply for Leave</span>
              </h3>
              <button onClick={() => setShowApplyModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Leave Type *</label>
                <select
                  required
                  value={applyForm.leave_type_id}
                  onChange={e => setApplyForm({ ...applyForm, leave_type_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map(lt => (
                    <option key={lt.id} value={lt.id}>
                      {lt.name} (Code: {lt.code || 'LT'})
                    </option>
                  ))}
                </select>
                {applyForm.leave_type_id && (
                  <p className="text-xs text-teal-400 mt-1 font-mono">
                    Available Balance: {selectedTypeBalance} days
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">From Date *</label>
                  <input
                    type="date"
                    required
                    value={applyForm.from_date}
                    onChange={e => setApplyForm({ ...applyForm, from_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">To Date *</label>
                  <input
                    type="date"
                    required
                    value={applyForm.to_date}
                    onChange={e => setApplyForm({ ...applyForm, to_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Half Day Option</label>
                <select
                  value={applyForm.half_day_type}
                  onChange={e => setApplyForm({ ...applyForm, half_day_type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="none">Full Day (No Half-Day)</option>
                  <option value="first_half">First Half Only (0.5 Day)</option>
                  <option value="second_half">Second Half Only (0.5 Day)</option>
                </select>
              </div>

              {/* Real-time breakdown card */}
              {applyCalculation && (
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Calculated Working Days:</span>
                    <span className="text-lg font-bold font-mono text-teal-300">{applyCalculation.total_days} days</span>
                  </div>
                  {applyCalculation.total_days > selectedTypeBalance && (
                    <span className="text-xs text-rose-400 font-semibold px-2.5 py-1 bg-rose-500/10 rounded-lg border border-rose-500/20">
                      Exceeds Available ({selectedTypeBalance}d)
                    </span>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Reason for Leave</label>
                <textarea
                  rows="3"
                  value={applyForm.reason}
                  onChange={e => setApplyForm({ ...applyForm, reason: e.target.value })}
                  placeholder="Provide brief details for approver..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || (applyCalculation && applyCalculation.total_days > selectedTypeBalance)}
                  className="px-5 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl shadow-lg transition"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: MANAGEMENT ACCRUAL / ADJUSTMENT */}
      {/* ========================================================================= */}
      {showAccrualModal && isManagement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-teal-400" />
                <span>Accrue / Adjust Leave Balance</span>
              </h3>
              <button onClick={() => setShowAccrualModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAccrualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Select Employee *</label>
                <select
                  required
                  value={accrualForm.employee_id}
                  onChange={e => setAccrualForm({ ...accrualForm, employee_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} ({emp.employee_code || 'EMP'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Leave Type *</label>
                <select
                  required
                  value={accrualForm.leave_type_id}
                  onChange={e => setAccrualForm({ ...accrualForm, leave_type_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map(lt => (
                    <option key={lt.id} value={lt.id}>
                      {lt.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Accrual Quantity (Days) *</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={accrualForm.quantity}
                  onChange={e => setAccrualForm({ ...accrualForm, quantity: e.target.value })}
                  placeholder="e.g. 12 or 1.5"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Reason / Note</label>
                <textarea
                  rows="2"
                  value={accrualForm.reason}
                  onChange={e => setAccrualForm({ ...accrualForm, reason: e.target.value })}
                  placeholder="e.g. Annual Grant 2026"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAccrualModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white text-sm font-medium rounded-xl shadow-lg transition"
                >
                  {isSubmitting ? 'Saving...' : 'Confirm Accrual'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  switch (status) {
    case 'approved':
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 w-fit">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Approved</span>
        </span>
      );
    case 'pending_approval':
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1.5 w-fit">
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Approval</span>
        </span>
      );
    case 'rejected':
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5 w-fit">
          <XCircle className="w-3.5 h-3.5" />
          <span>Rejected</span>
        </span>
      );
    case 'cancelled':
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1.5 w-fit">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Cancelled</span>
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
          {status}
        </span>
      );
  }
}
