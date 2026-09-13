import { useState, useMemo } from 'react';
import { useHrPolicy } from '../../context/HrPolicyContext';
import { useCrm } from '../../context/CrmContext';
import {
  FileText, Plus, Save, CheckCircle2, AlertCircle, Building2, ShieldCheck,
  Calendar, Clock, Award, MapPin, Tag, GitMerge, Layers, Sliders, Lock
} from 'lucide-react';

export default function HrPolicyCenter() {
  const {
    activePolicySetId,
    setActivePolicySetId,
    hrPolicySets,
    employeeCategories,
    workLocations,
    leaveTypes,
    leavePolicyRules,
    attendancePolicies,
    weeklyOffPolicies,
    holidayCalendars,
    holidayCalendarDays,
    overtimePolicies,
    compOffPolicies,
    approvalWorkflows,
    approvalWorkflowSteps,
    isLoading,
    isManagementOrAdmin,
    savePolicySet,
    saveEmployeeCategory,
    saveWorkLocation,
    saveLeaveType,
    saveLeavePolicyRule,
    saveAttendancePolicy,
    saveWeeklyOffPolicy,
    saveHolidayCalendar,
    saveHolidayCalendarDay,
    saveOvertimePolicy,
    saveCompOffPolicy,
    saveApprovalWorkflow
  } = useHrPolicy();

  const crmContext = useCrm() || {};
  const { companies = [], activeOperatingCompanyId, isDarkMode } = crmContext;

  const [activeTab, setActiveTab] = useState('sets');
  const [toast, setToast] = useState(null);
  const showToast = (msg, tone = 'emerald') => {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 3000);
  };

  // Form states
  const [policySetForm, setPolicySetForm] = useState({ name: '', description: '', status: 'Active', effective_from: '', effective_to: '' });
  const [catForm, setCatForm] = useState({ name: '', code: '', description: '', status: 'Active' });
  const [locForm, setLocForm] = useState({ name: '', code: '', address: '', status: 'Active' });
  const [ltForm, setLtForm] = useState({ name: '', code: '', description: '', status: 'Active' });
  const [lrForm, setLrForm] = useState({ leave_type_id: '', accrual_frequency: 'Monthly', half_day_allowed: true });
  const [attForm, setAttForm] = useState({ name: 'Standard Shift', half_day_hours: 4, full_day_hours: 8, status: 'Active' });
  const [woForm, setWoForm] = useState({ name: 'Sunday Off', status: 'Active' });
  const [calForm, setCalForm] = useState({ name: 'Corporate Holidays', year: new Date().getFullYear(), description: '' });
  const [calDayForm, setCalDayForm] = useState({ holiday_calendar_id: '', holiday_date: '', name: '', holiday_type: 'National', description: '' });
  const [otForm, setOtForm] = useState({ name: 'Standard Overtime', max_ot_hours: 2, status: 'Active' });
  const [coForm, setCoForm] = useState({ name: 'Standard Comp-Off', expiry_days: 60, approval_required: true, status: 'Active' });
  const [wfForm, setWfForm] = useState({ name: 'Leave Approval Workflow', status: 'Active' });
  const [wfSteps, setWfSteps] = useState([{ step_order: 1, approver_type: 'Role', approver_role: 'Manager' }]);

  // Card tone helper
  const tCard = isDarkMode ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800 shadow-sm";
  const tInput = isDarkMode ? "bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-500" : "bg-white border-slate-300 text-slate-800 shadow-sm placeholder:text-slate-400";
  const tMuted = isDarkMode ? "text-slate-400" : "text-slate-500";

  // Active Policy Set Object
  const activePolicySet = useMemo(() => {
    return hrPolicySets.find(p => p.id === activePolicySetId) || hrPolicySets[0] || null;
  }, [hrPolicySets, activePolicySetId]);

  // Submit Handlers
  const handleSavePolicySet = async (e) => {
    e.preventDefault();
    if (!policySetForm.name.trim()) return;
    const res = await savePolicySet(policySetForm);
    if (res.success) {
      showToast('Policy Set created!', 'emerald');
      setPolicySetForm({ name: '', description: '', status: 'Active', effective_from: '', effective_to: '' });
    } else showToast(`Error: ${res.error}`, 'rose');
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catForm.name.trim()) return;
    const res = await saveEmployeeCategory(catForm);
    if (res.success) {
      showToast('Employee Category created!', 'emerald');
      setCatForm({ name: '', code: '', description: '', status: 'Active' });
    } else showToast(`Error: ${res.error}`, 'rose');
  };

  const handleSaveLocation = async (e) => {
    e.preventDefault();
    if (!locForm.name.trim()) return;
    const res = await saveWorkLocation(locForm);
    if (res.success) {
      showToast('Work Location created!', 'emerald');
      setLocForm({ name: '', code: '', address: '', status: 'Active' });
    } else showToast(`Error: ${res.error}`, 'rose');
  };

  const handleSaveLeaveType = async (e) => {
    e.preventDefault();
    if (!ltForm.name.trim()) return;
    const res = await saveLeaveType(ltForm);
    if (res.success) {
      showToast('Leave Type created!', 'emerald');
      setLtForm({ name: '', code: '', description: '', status: 'Active' });
    } else showToast(`Error: ${res.error}`, 'rose');
  };

  const handleSaveLeaveRule = async (e) => {
    e.preventDefault();
    if (!lrForm.leave_type_id) {
      showToast('Select a Leave Type first.', 'rose');
      return;
    }
    const res = await saveLeavePolicyRule(lrForm);
    if (res.success) showToast('Leave Rule saved!', 'emerald');
    else showToast(`Error: ${res.error}`, 'rose');
  };

  const handleSaveAttendance = async (e) => {
    e.preventDefault();
    const res = await saveAttendancePolicy(attForm);
    if (res.success) showToast('Attendance Policy saved!', 'emerald');
    else showToast(`Error: ${res.error}`, 'rose');
  };

  const handleSaveWeeklyOff = async (e) => {
    e.preventDefault();
    const res = await saveWeeklyOffPolicy(woForm);
    if (res.success) showToast('Weekly Off Policy saved!', 'emerald');
    else showToast(`Error: ${res.error}`, 'rose');
  };

  const handleSaveCalendar = async (e) => {
    e.preventDefault();
    if (!calForm.name.trim()) return;
    const res = await saveHolidayCalendar(calForm);
    if (res.success) {
      showToast('Holiday Calendar created!', 'emerald');
      setCalForm({ name: 'Corporate Holidays', year: new Date().getFullYear(), description: '' });
    } else showToast(`Error: ${res.error}`, 'rose');
  };

  const handleSaveCalendarDay = async (e) => {
    e.preventDefault();
    if (!calDayForm.holiday_calendar_id || !calDayForm.holiday_date || !calDayForm.name.trim()) return;
    const res = await saveHolidayCalendarDay(calDayForm);
    if (res.success) {
      showToast('Holiday date added!', 'emerald');
      setCalDayForm({ holiday_calendar_id: calDayForm.holiday_calendar_id, holiday_date: '', name: '', holiday_type: 'National', description: '' });
    } else showToast(`Error: ${res.error}`, 'rose');
  };

  const handleSaveOt = async (e) => {
    e.preventDefault();
    const res = await saveOvertimePolicy(otForm);
    if (res.success) showToast('Overtime Policy saved!', 'emerald');
    else showToast(`Error: ${res.error}`, 'rose');
  };

  const handleSaveCo = async (e) => {
    e.preventDefault();
    const res = await saveCompOffPolicy(coForm);
    if (res.success) showToast('Comp-Off Policy saved!', 'emerald');
    else showToast(`Error: ${res.error}`, 'rose');
  };

  const handleSaveWorkflow = async (e) => {
    e.preventDefault();
    if (!wfForm.name.trim()) return;
    const res = await saveApprovalWorkflow(wfForm, wfSteps);
    if (res.success) {
      showToast('Approval Workflow saved!', 'emerald');
      setWfForm({ name: 'Leave Approval Workflow', status: 'Active' });
    } else showToast(`Error: ${res.error}`, 'rose');
  };

  return (
    <div className="space-y-5">
      {/* Toast Feedback */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-xl border text-xs font-bold flex items-center gap-2 ${
          toast.tone === 'rose' ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-300' :
          'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300'
        }`}>
          {toast.tone === 'rose' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
          {toast.msg}
        </div>
      )}

      {/* HEADER BAR & SELECTION FLOW */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-indigo-700 via-sky-700 to-slate-800 p-5 rounded-2xl text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Sliders size={22} className="text-sky-300" />
            <h1 className="text-xl font-black tracking-tight">HR Policy Center P0</h1>
          </div>
          <p className="text-xs text-sky-100 mt-1">
            Company Policy Configuration & Eligibility Engine
          </p>
        </div>

        {/* Operating Company & Policy Set Scope */}
        <div className="flex flex-wrap items-center gap-2 bg-white/10 p-2 rounded-xl backdrop-blur">
          <div className="text-xs">
            <span className="block text-[10px] uppercase font-bold text-sky-200">Active Policy Set</span>
            <select
              value={activePolicySetId || ''}
              onChange={e => setActivePolicySetId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-bold outline-none"
            >
              {hrPolicySets.length === 0 && <option value="">No Policy Sets Created</option>}
              {hrPolicySets.map(ps => (
                <option key={ps.id} value={ps.id}>{ps.name} ({ps.status})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* READ-ONLY BANNER FOR NON-MANAGEMENT USERS */}
      {!isManagementOrAdmin && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs font-bold flex items-center gap-2">
          <Lock size={15} />
          Read-Only Mode: Policy configurations are management-controlled. Contact Admin to alter policy rules.
        </div>
      )}

      {/* MODULE NAVIGATION SUB-TABS */}
      <div className="flex gap-1 overflow-x-auto p-2 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
        {[
          ['sets', '1. Policy Sets', FileText],
          ['categories', '2. Categories', Tag],
          ['locations', '3. Locations', MapPin],
          ['leave', '4. Leave Rules', Calendar],
          ['attendance', '5. Attendance', Clock],
          ['weeklyoff', '6. Weekly Off', Layers],
          ['holidays', '7. Holidays', Calendar],
          ['overtime', '8. Overtime', Award],
          ['compoff', '9. Comp-Off', ShieldCheck],
          ['workflows', '10. Approval Workflows', GitMerge]
        ].map(([tabKey, tabLabel, Icon]) => (
          <button
            key={tabKey}
            onClick={() => setActiveTab(tabKey)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === tabKey
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Icon size={14} />
            {tabLabel}
          </button>
        ))}
      </div>

      {/* TAB 1: HR POLICY SETS */}
      {activeTab === 'sets' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className={`p-5 rounded-2xl border ${tCard} space-y-4`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Create HR Policy Set
            </h3>
            <form onSubmit={handleSavePolicySet} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold mb-1">Policy Set Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Standard Company Policy 2026"
                  disabled={!isManagementOrAdmin}
                  value={policySetForm.name}
                  onChange={e => setPolicySetForm({ ...policySetForm, name: e.target.value })}
                  className={`w-full p-2 rounded-xl border ${tInput}`}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold mb-1">Description</label>
                <textarea
                  rows={2}
                  disabled={!isManagementOrAdmin}
                  value={policySetForm.description}
                  onChange={e => setPolicySetForm({ ...policySetForm, description: e.target.value })}
                  className={`w-full p-2 rounded-xl border ${tInput}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold mb-1">Effective From</label>
                  <input
                    type="date"
                    disabled={!isManagementOrAdmin}
                    value={policySetForm.effective_from}
                    onChange={e => setPolicySetForm({ ...policySetForm, effective_from: e.target.value })}
                    className={`w-full p-1.5 rounded-xl border ${tInput}`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-1">Effective To</label>
                  <input
                    type="date"
                    disabled={!isManagementOrAdmin}
                    value={policySetForm.effective_to}
                    onChange={e => setPolicySetForm({ ...policySetForm, effective_to: e.target.value })}
                    className={`w-full p-1.5 rounded-xl border ${tInput}`}
                  />
                </div>
              </div>
              {isManagementOrAdmin && (
                <button type="submit" className="w-full py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 shadow-md">
                  + Create Policy Set
                </button>
              )}
            </form>
          </div>

          <div className={`lg:col-span-2 p-5 rounded-2xl border ${tCard} space-y-3`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Company Policy Sets ({hrPolicySets.length})
            </h3>
            <div className="space-y-2">
              {hrPolicySets.map(ps => (
                <div key={ps.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs">{ps.name}</h4>
                    <p className={`text-[11px] ${tMuted}`}>{ps.description || 'No description'}</p>
                    <div className="flex gap-3 text-[10px] font-mono text-slate-400 mt-1">
                      <span>From: {ps.effective_from || '—'}</span>
                      <span>To: {ps.effective_to || '—'}</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    ps.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {ps.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EMPLOYEE CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className={`p-5 rounded-2xl border ${tCard} space-y-4`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Create Employee Category
            </h3>
            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <input
                type="text"
                required
                placeholder="Category Name (e.g. Staff, Site Worker) *"
                disabled={!isManagementOrAdmin}
                value={catForm.name}
                onChange={e => setCatForm({ ...catForm, name: e.target.value })}
                className={`w-full p-2 rounded-xl border ${tInput}`}
              />
              <input
                type="text"
                placeholder="Category Code (e.g. CAT-STAFF)"
                disabled={!isManagementOrAdmin}
                value={catForm.code}
                onChange={e => setCatForm({ ...catForm, code: e.target.value })}
                className={`w-full p-2 rounded-xl border ${tInput}`}
              />
              <textarea
                placeholder="Description"
                disabled={!isManagementOrAdmin}
                value={catForm.description}
                onChange={e => setCatForm({ ...catForm, description: e.target.value })}
                className={`w-full p-2 rounded-xl border ${tInput}`}
              />
              {isManagementOrAdmin && (
                <button type="submit" className="w-full py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 shadow-md">
                  + Add Category
                </button>
              )}
            </form>
          </div>

          <div className={`lg:col-span-2 p-5 rounded-2xl border ${tCard} space-y-3`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Configured Categories ({employeeCategories.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {employeeCategories.map(cat => (
                <div key={cat.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs">{cat.name}</span>
                    <span className="font-mono text-[10px] text-sky-500">{cat.code}</span>
                  </div>
                  <p className={`text-[11px] mt-1 ${tMuted}`}>{cat.description || 'Policy classification value'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WORK LOCATIONS */}
      {activeTab === 'locations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className={`p-5 rounded-2xl border ${tCard} space-y-4`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Create Work Location
            </h3>
            <form onSubmit={handleSaveLocation} className="space-y-3 text-xs">
              <input
                type="text"
                required
                placeholder="Location Name (e.g. Head Office, Site A) *"
                disabled={!isManagementOrAdmin}
                value={locForm.name}
                onChange={e => setLocForm({ ...locForm, name: e.target.value })}
                className={`w-full p-2 rounded-xl border ${tInput}`}
              />
              <input
                type="text"
                placeholder="Location Code (e.g. LOC-HO)"
                disabled={!isManagementOrAdmin}
                value={locForm.code}
                onChange={e => setLocForm({ ...locForm, code: e.target.value })}
                className={`w-full p-2 rounded-xl border ${tInput}`}
              />
              <textarea
                placeholder="Full Address"
                disabled={!isManagementOrAdmin}
                value={locForm.address}
                onChange={e => setLocForm({ ...locForm, address: e.target.value })}
                className={`w-full p-2 rounded-xl border ${tInput}`}
              />
              {isManagementOrAdmin && (
                <button type="submit" className="w-full py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 shadow-md">
                  + Add Work Location
                </button>
              )}
            </form>
          </div>

          <div className={`lg:col-span-2 p-5 rounded-2xl border ${tCard} space-y-3`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Company Work Locations ({workLocations.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {workLocations.map(loc => (
                <div key={loc.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs flex items-center gap-1">
                      <MapPin size={13} className="text-sky-500" /> {loc.name}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">{loc.code}</span>
                  </div>
                  <p className={`text-[11px] ${tMuted}`}>{loc.address || 'No address'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LEAVE RULES */}
      {activeTab === 'leave' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className={`p-5 rounded-2xl border ${tCard} space-y-4`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Create Leave Type
            </h3>
            <form onSubmit={handleSaveLeaveType} className="space-y-3 text-xs">
              <input
                type="text"
                required
                placeholder="Leave Name (e.g. Casual Leave) *"
                disabled={!isManagementOrAdmin}
                value={ltForm.name}
                onChange={e => setLtForm({ ...ltForm, name: e.target.value })}
                className={`w-full p-2 rounded-xl border ${tInput}`}
              />
              <input
                type="text"
                placeholder="Code (e.g. CL, SL, EL)"
                disabled={!isManagementOrAdmin}
                value={ltForm.code}
                onChange={e => setLtForm({ ...ltForm, code: e.target.value })}
                className={`w-full p-2 rounded-xl border ${tInput}`}
              />
              <textarea
                placeholder="Description"
                disabled={!isManagementOrAdmin}
                value={ltForm.description}
                onChange={e => setLtForm({ ...ltForm, description: e.target.value })}
                className={`w-full p-2 rounded-xl border ${tInput}`}
              />
              {isManagementOrAdmin && (
                <button type="submit" className="w-full py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 shadow-md">
                  + Add Leave Type
                </button>
              )}
            </form>
          </div>

          <div className={`lg:col-span-2 p-5 rounded-2xl border ${tCard} space-y-4`}>
            <div className="flex justify-between items-center border-b pb-2 border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Leave Policy Rules ({activePolicySet?.name || 'No Policy Set'})
              </h3>
            </div>

            {/* Leave Policy Rule Config */}
            <form onSubmit={handleSaveLeaveRule} className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-[11px] font-bold mb-1">Leave Type</label>
                <select
                  disabled={!isManagementOrAdmin}
                  value={lrForm.leave_type_id}
                  onChange={e => setLrForm({ ...lrForm, leave_type_id: e.target.value })}
                  className={`w-full p-2 rounded-lg border ${tInput}`}
                >
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map(lt => (
                    <option key={lt.id} value={lt.id}>{lt.name} ({lt.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold mb-1">Accrual Frequency</label>
                <select
                  disabled={!isManagementOrAdmin}
                  value={lrForm.accrual_frequency}
                  onChange={e => setLrForm({ ...lrForm, accrual_frequency: e.target.value })}
                  className={`w-full p-2 rounded-lg border ${tInput}`}
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!isManagementOrAdmin}
                    checked={lrForm.half_day_allowed}
                    onChange={e => setLrForm({ ...lrForm, half_day_allowed: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  Half Day Allowed
                </label>
              </div>

              {isManagementOrAdmin && (
                <div className="md:col-span-3 flex justify-end">
                  <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-lg text-xs hover:bg-indigo-500">
                    Save Leave Rule
                  </button>
                </div>
              )}
            </form>

            <div className="space-y-2">
              {leavePolicyRules.map(rule => {
                const lt = leaveTypes.find(t => t.id === rule.leave_type_id);
                return (
                  <div key={rule.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold">{lt?.name || 'Leave Rule'}</span> • Accrual: {rule.accrual_frequency}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600">
                      {rule.half_day_allowed ? 'Half-Day Allowed' : 'Full Day Only'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ATTENDANCE POLICY */}
      {activeTab === 'attendance' && (
        <div className={`p-5 rounded-2xl border ${tCard} space-y-4 max-w-2xl`}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Attendance & Shift Threshold Policy ({activePolicySet?.name || 'No Policy Set'})
          </h3>

          <form onSubmit={handleSaveAttendance} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold mb-1">Shift / Policy Name</label>
              <input
                type="text"
                disabled={!isManagementOrAdmin}
                value={attForm.name}
                onChange={e => setAttForm({ ...attForm, name: e.target.value })}
                className={`w-full p-2 rounded-xl border ${tInput}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold mb-1">Half Day Threshold (Hours)</label>
                <input
                  type="number"
                  disabled={!isManagementOrAdmin}
                  value={attForm.half_day_hours}
                  onChange={e => setAttForm({ ...attForm, half_day_hours: Number(e.target.value) })}
                  className={`w-full p-2 rounded-xl border ${tInput}`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold mb-1">Full Day Threshold (Hours)</label>
                <input
                  type="number"
                  disabled={!isManagementOrAdmin}
                  value={attForm.full_day_hours}
                  onChange={e => setAttForm({ ...attForm, full_day_hours: Number(e.target.value) })}
                  className={`w-full p-2 rounded-xl border ${tInput}`}
                />
              </div>
            </div>

            {isManagementOrAdmin && (
              <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 shadow-md">
                Save Attendance Policy
              </button>
            )}
          </form>
        </div>
      )}

      {/* TAB 6: WEEKLY OFF POLICY */}
      {activeTab === 'weeklyoff' && (
        <div className={`p-5 rounded-2xl border ${tCard} space-y-4 max-w-2xl`}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Weekly Off Policy ({activePolicySet?.name || 'No Policy Set'})
          </h3>

          <form onSubmit={handleSaveWeeklyOff} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold mb-1">Weekly Off Pattern Name</label>
              <input
                type="text"
                disabled={!isManagementOrAdmin}
                value={woForm.name}
                onChange={e => setWoForm({ ...woForm, name: e.target.value })}
                className={`w-full p-2 rounded-xl border ${tInput}`}
              />
            </div>

            {isManagementOrAdmin && (
              <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 shadow-md">
                Save Weekly Off Policy
              </button>
            )}
          </form>
        </div>
      )}

      {/* TAB 7: HOLIDAY CALENDARS */}
      {activeTab === 'holidays' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className={`p-5 rounded-2xl border ${tCard} space-y-4`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Create Holiday Calendar
            </h3>
            <form onSubmit={handleSaveCalendar} className="space-y-3 text-xs">
              <input
                type="text"
                required
                placeholder="Calendar Name *"
                disabled={!isManagementOrAdmin}
                value={calForm.name}
                onChange={e => setCalForm({ ...calForm, name: e.target.value })}
                className={`w-full p-2 rounded-xl border ${tInput}`}
              />
              <input
                type="number"
                disabled={!isManagementOrAdmin}
                value={calForm.year}
                onChange={e => setCalForm({ ...calForm, year: Number(e.target.value) })}
                className={`w-full p-2 rounded-xl border ${tInput}`}
              />
              <textarea
                placeholder="Description"
                disabled={!isManagementOrAdmin}
                value={calForm.description}
                onChange={e => setCalForm({ ...calForm, description: e.target.value })}
                className={`w-full p-2 rounded-xl border ${tInput}`}
              />
              {isManagementOrAdmin && (
                <button type="submit" className="w-full py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 shadow-md">
                  + Create Calendar
                </button>
              )}
            </form>
          </div>

          <div className={`lg:col-span-2 p-5 rounded-2xl border ${tCard} space-y-4`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Holiday Calendars & Dates ({holidayCalendars.length})
            </h3>

            <form onSubmit={handleSaveCalendarDay} className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <select
                disabled={!isManagementOrAdmin}
                value={calDayForm.holiday_calendar_id}
                onChange={e => setCalDayForm({ ...calDayForm, holiday_calendar_id: e.target.value })}
                className={`p-2 rounded-lg border ${tInput}`}
              >
                <option value="">Select Calendar</option>
                {holidayCalendars.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.year})</option>
                ))}
              </select>

              <input
                type="date"
                required
                disabled={!isManagementOrAdmin}
                value={calDayForm.holiday_date}
                onChange={e => setCalDayForm({ ...calDayForm, holiday_date: e.target.value })}
                className={`p-2 rounded-lg border ${tInput}`}
              />

              <input
                type="text"
                required
                placeholder="Holiday Name *"
                disabled={!isManagementOrAdmin}
                value={calDayForm.name}
                onChange={e => setCalDayForm({ ...calDayForm, name: e.target.value })}
                className={`p-2 rounded-lg border ${tInput}`}
              />

              {isManagementOrAdmin && (
                <button type="submit" className="bg-indigo-600 text-white font-bold rounded-lg p-2 hover:bg-indigo-500">
                  + Add Holiday
                </button>
              )}
            </form>

            <div className="space-y-2">
              {holidayCalendarDays.map(day => (
                <div key={day.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold">{day.name}</span> • <span className="font-mono text-sky-500">{day.holiday_date}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{day.holiday_type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: OVERTIME POLICY */}
      {activeTab === 'overtime' && (
        <div className={`p-5 rounded-2xl border ${tCard} space-y-4 max-w-2xl`}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Overtime Eligibility & Threshold Policy ({activePolicySet?.name || 'No Policy Set'})
          </h3>

          <form onSubmit={handleSaveOt} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold mb-1">Overtime Policy Name</label>
              <input
                type="text"
                disabled={!isManagementOrAdmin}
                value={otForm.name}
                onChange={e => setOtForm({ ...otForm, name: e.target.value })}
                className={`w-full p-2 rounded-xl border ${tInput}`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold mb-1">Max OT Hours / Day</label>
              <input
                type="number"
                disabled={!isManagementOrAdmin}
                value={otForm.max_ot_hours}
                onChange={e => setOtForm({ ...otForm, max_ot_hours: Number(e.target.value) })}
                className={`w-full p-2 rounded-xl border ${tInput}`}
              />
            </div>

            {isManagementOrAdmin && (
              <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 shadow-md">
                Save Overtime Policy
              </button>
            )}
          </form>
        </div>
      )}

      {/* TAB 9: COMP-OFF POLICY */}
      {activeTab === 'compoff' && (
        <div className={`p-5 rounded-2xl border ${tCard} space-y-4 max-w-2xl`}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Comp-Off Eligibility & Expiry Policy ({activePolicySet?.name || 'No Policy Set'})
          </h3>

          <form onSubmit={handleSaveCo} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold mb-1">Comp-Off Policy Name</label>
              <input
                type="text"
                disabled={!isManagementOrAdmin}
                value={coForm.name}
                onChange={e => setCoForm({ ...coForm, name: e.target.value })}
                className={`w-full p-2 rounded-xl border ${tInput}`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold mb-1">Expiry Period (Days)</label>
              <input
                type="number"
                disabled={!isManagementOrAdmin}
                value={coForm.expiry_days}
                onChange={e => setCoForm({ ...coForm, expiry_days: Number(e.target.value) })}
                className={`w-full p-2 rounded-xl border ${tInput}`}
              />
            </div>

            {isManagementOrAdmin && (
              <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 shadow-md">
                Save Comp-Off Policy
              </button>
            )}
          </form>
        </div>
      )}

      {/* TAB 10: APPROVAL WORKFLOWS */}
      {activeTab === 'workflows' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className={`p-5 rounded-2xl border ${tCard} space-y-4`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Create Approval Workflow
            </h3>
            <form onSubmit={handleSaveWorkflow} className="space-y-3 text-xs">
              <input
                type="text"
                required
                placeholder="Workflow Name (e.g. Leave Approval) *"
                disabled={!isManagementOrAdmin}
                value={wfForm.name}
                onChange={e => setWfForm({ ...wfForm, name: e.target.value })}
                className={`w-full p-2 rounded-xl border ${tInput}`}
              />
              {isManagementOrAdmin && (
                <button type="submit" className="w-full py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 shadow-md">
                  + Create Workflow
                </button>
              )}
            </form>
          </div>

          <div className={`lg:col-span-2 p-5 rounded-2xl border ${tCard} space-y-3`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Configured Workflows ({approvalWorkflows.length})
            </h3>
            <div className="space-y-2">
              {approvalWorkflows.map(wf => (
                <div key={wf.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold flex items-center gap-1">
                      <GitMerge size={14} className="text-indigo-500" /> {wf.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600">{wf.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
