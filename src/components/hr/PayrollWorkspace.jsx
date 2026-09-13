import { useState, useMemo } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { useEmployee } from '../../context/EmployeeContext';
import { useCrm } from '../../context/CrmContext';
import {
  Banknote, CalendarDays, Calculator, Layers, ShieldCheck, Settings, Plus,
  FileText, Users, Clock3, AlertCircle, CheckCircle2, Sliders, ArrowUpRight, ChevronRight, Info,
  Edit2, Ban, X, Send, Lock
} from 'lucide-react';

export default function PayrollWorkspace() {
  const {
    payrollSettings,
    payrollComponents,
    statutoryRules,
    employeeSalaryStructures,
    payrollPeriods,
    payrollRuns,
    payrollRunItems,
    payrollRunItemComponents,
    taxDeclarations,
    previousEmployerRecords,
    payrollSummary,
    consumedMasterData,
    isManagementOrAdmin,
    savePayrollSettings,
    savePayrollComponent,
    deactivatePayrollComponent,
    saveStatutoryRule,
    saveSalaryStructure,
    deactivateSalaryStructure,
    savePayrollPeriod,
    calculatePayrollRun,
    saveTaxDeclaration,
    updateTaxDeclarationStatus
  } = usePayroll();

  const { employees = [] } = useEmployee() || {};
  const { activeOperatingCompany } = useCrm() || {};

  const [activeTab, setActiveTab] = useState('runs'); // 'runs' | 'structures' | 'components' | 'statutory' | 'declarations' | 'settings'
  const [selectedState, setSelectedState] = useState('Telangana');

  // Notice Banner State
  const [banner, setBanner] = useState(null);
  const [calculatingRunId, setCalculatingRunId] = useState(null);

  // Modal States for CRUD
  const [settingsModal, setSettingsModal] = useState(false);
  const [componentModal, setComponentModal] = useState(null); // null or object (editing/new)
  const [statutoryModal, setStatutoryModal] = useState(null); // null or object
  const [structureModal, setStructureModal] = useState(null); // null or object
  const [periodModal, setPeriodModal] = useState(null); // null or object
  const [declarationModal, setDeclarationModal] = useState(null); // null or object

  // Form States
  const [settingsForm, setSettingsForm] = useState({ pay_day: 30 });
  const [compForm, setCompForm] = useState({ code: '', name: '', component_type: 'Earning' });
  const [statForm, setStatForm] = useState({ financial_year: '2026-2027', effective_from: new Date().toISOString().split('T')[0], effective_to: '' });
  const [structForm, setStructForm] = useState({ employee_id: '', effective_from: new Date().toISOString().split('T')[0], amount: '' });
  const [periodForm, setPeriodForm] = useState({ period_code: '', period_name: '', pay_date: new Date().toISOString().split('T')[0] });
  const [decForm, setDecForm] = useState({
    employee_id: '',
    tax_year: '2026-2027',
    tax_regime: 'new_regime',
    residency_status: 'resident',
    tds_applicable: true,
    projected_annual_salary: '',
    other_income: '',
    home_loan_interest: '',
    previous_employer_income: '',
    previous_employer_tds: '',
    employer_name: '',
    rent_paid: '',
    is_metro: false,
    landlord_pan: '',
    sec_80c: '',
    sec_80d: '',
    sec_80ccd1b: '',
    sec_80e: '',
    lta_amount: '',
    proof_remarks: ''
  });

  // PT Slabs display mapping
  const ptSlabsMap = {
    Telangana: [
      { min: '₹0', max: '₹15,000', pt: 'Nil' },
      { min: '₹15,001', max: '₹20,000', pt: '₹150' },
      { min: '₹20,001', max: 'Above', pt: '₹200' }
    ],
    Maharashtra: [
      { min: '₹0', max: '₹7,500', pt: 'Nil' },
      { min: '₹7,501', max: '₹10,000', pt: '₹175' },
      { min: '₹10,001', max: 'Above', pt: '₹200 (Feb ₹300)' }
    ],
    Karnataka: [
      { min: '₹0', max: '₹14,999', pt: 'Nil' },
      { min: '₹15,000', max: 'Above', pt: '₹200' }
    ],
    TamilNadu: [
      { min: '₹0', max: '₹21,000', pt: 'Nil' },
      { min: '₹21,001', max: '₹30,000', pt: '₹100' },
      { min: '₹30,001', max: '₹45,000', pt: '₹235' },
      { min: '₹45,001', max: 'Above', pt: '₹1,095' }
    ]
  };

  // Handlers for CRUD & Calculation
  const handleCalculateRun = async (runId) => {
    setCalculatingRunId(runId);
    setBanner(null);
    const res = await calculatePayrollRun(runId);
    setCalculatingRunId(null);
    if (res.success) {
      setBanner({ type: 'success', text: 'Payroll run calculated successfully via calculate_payroll_run_atomic server engine.' });
    } else {
      setBanner({
        type: 'error',
        isTdsBlocker: res.isTdsBlocker,
        text: res.error || 'Server RPC error during payroll calculation.'
      });
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    const res = await savePayrollSettings({ id: payrollSettings?.id, ...settingsForm });
    if (res.success) {
      setSettingsModal(false);
      setBanner({ type: 'success', text: 'Payroll settings updated successfully.' });
    } else {
      setBanner({ type: 'error', text: res.error });
    }
  };

  const handleSaveComponent = async (e) => {
    e.preventDefault();
    const res = await savePayrollComponent(compForm);
    if (res.success) {
      setComponentModal(null);
      setBanner({ type: 'success', text: `Salary component ${compForm.code} saved successfully.` });
    } else {
      setBanner({ type: 'error', text: res.error });
    }
  };

  const handleDeactivateComponent = async (id) => {
    const res = await deactivatePayrollComponent(id);
    if (res.success) {
      setBanner({ type: 'success', text: 'Salary component set to inactive successfully.' });
    } else {
      setBanner({ type: 'error', text: res.error });
    }
  };

  const handleSaveStatutory = async (e) => {
    e.preventDefault();
    const res = await saveStatutoryRule(statForm);
    if (res.success) {
      setStatutoryModal(null);
      setBanner({ type: 'success', text: 'Statutory rule set saved successfully.' });
    } else {
      setBanner({ type: 'error', text: res.error });
    }
  };

  const handleSaveStructure = async (e) => {
    e.preventDefault();
    const res = await saveSalaryStructure(structForm, structForm.amount ? [{ amount: structForm.amount }] : []);
    if (res.success) {
      setStructureModal(null);
      setBanner({ type: 'success', text: 'Salary structure assigned/versioned successfully.' });
    } else {
      setBanner({ type: 'error', text: res.error });
    }
  };

  const handleDeactivateStructure = async (id) => {
    const res = await deactivateSalaryStructure(id);
    if (res.success) {
      setBanner({ type: 'success', text: 'Salary structure ended and deactivated.' });
    } else {
      setBanner({ type: 'error', text: res.error });
    }
  };

  const handleSavePeriod = async (e) => {
    e.preventDefault();
    const res = await savePayrollPeriod(periodForm);
    if (res.success) {
      setPeriodModal(null);
      setBanner({ type: 'success', text: 'Pay period created successfully.' });
    } else {
      setBanner({ type: 'error', text: res.error });
    }
  };

  const handleSaveTaxDeclaration = async (e) => {
    e.preventDefault();
    const decPayload = {
      id: declarationModal?.id,
      employee_id: decForm.employee_id || employees[0]?.id,
      tax_year: decForm.tax_year,
      tax_regime: decForm.tax_regime,
      residency_status: decForm.residency_status,
      tds_applicable: decForm.tds_applicable,
      projected_annual_salary: decForm.projected_annual_salary,
      other_income: decForm.other_income,
      home_loan_interest: decForm.home_loan_interest,
      previous_employer_income: decForm.previous_employer_income,
      previous_employer_tds: decForm.previous_employer_tds,
      hra_data: {
        rent_paid: parseFloat(decForm.rent_paid || 0),
        is_metro: !!decForm.is_metro,
        landlord_pan: decForm.landlord_pan || ''
      },
      deduction_data: {
        sec_80c: parseFloat(decForm.sec_80c || 0),
        sec_80d: parseFloat(decForm.sec_80d || 0),
        sec_80ccd1b: parseFloat(decForm.sec_80ccd1b || 0),
        sec_80e: parseFloat(decForm.sec_80e || 0)
      },
      exemption_data: {
        lta_amount: parseFloat(decForm.lta_amount || 0)
      },
      evidence_data: {
        proof_remarks: decForm.proof_remarks || '',
        submitted_at: new Date().toISOString()
      },
      declaration_status: 'submitted'
    };

    const prevEmployersPayload = decForm.employer_name ? [{
      employer_name: decForm.employer_name,
      salary_income: decForm.previous_employer_income,
      tds_deducted: decForm.previous_employer_tds
    }] : [];

    const res = await saveTaxDeclaration(decPayload, prevEmployersPayload);
    if (res.success) {
      setDeclarationModal(null);
      setBanner({ type: 'success', text: 'TDS Tax Declaration submitted successfully.' });
    } else {
      setBanner({ type: 'error', text: res.error });
    }
  };

  const handleUpdateDeclarationStatus = async (decId, status) => {
    const res = await updateTaxDeclarationStatus(decId, status);
    if (res.success) {
      setBanner({ type: 'success', text: `Tax declaration status updated to ${status}.` });
    } else {
      setBanner({ type: 'error', text: res.error });
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Notification Banner */}
      {banner && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-start justify-between ${
          banner.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800'
            : banner.isTdsBlocker
            ? 'bg-amber-50 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:border-amber-700'
            : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800'
        }`}>
          <div className="flex items-start gap-2.5">
            {banner.type === 'success' ? (
              <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={18} className={`shrink-0 mt-0.5 ${banner.isTdsBlocker ? 'text-amber-600' : 'text-rose-600'}`} />
            )}
            <div className="space-y-1">
              <div className="font-black text-xs uppercase tracking-wider">{banner.isTdsBlocker ? 'TDS Configuration Blocker' : (banner.type === 'success' ? 'Payroll Calculation Succeeded' : 'Payroll Calculation Error')}</div>
              <div>{banner.text}</div>
            </div>
          </div>
          <button onClick={() => setBanner(null)} className="p-1 cursor-pointer"><X size={14} /></button>
        </div>
      )}

      {/* Role Authorization Alert */}
      {!isManagementOrAdmin && (
        <div className="p-3.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 text-xs font-semibold flex items-center gap-2">
          <Lock size={16} className="text-amber-600 shrink-0" />
          <span>Read-Only Access: Management authorization (OWNER / ADMIN / MANAGER) is required to calculate payroll or modify settings.</span>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="os-card p-4">
          <div className="flex items-center justify-between text-sky-500">
            <Users size={18} />
            <span className="text-[10px] font-black uppercase">Employees</span>
          </div>
          <div className="mt-3 text-2xl font-black">{consumedMasterData.employeesCount}</div>
          <div className="text-[10px] text-slate-400 mt-1">From Employee Master</div>
        </div>

        <div className="os-card p-4">
          <div className="flex items-center justify-between text-emerald-500">
            <Calculator size={18} />
            <span className="text-[10px] font-black uppercase">Configured CTC</span>
          </div>
          <div className="mt-3 text-2xl font-black">{employeeSalaryStructures.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">{payrollSummary.unconfiguredEmployeesCount} Pending Structures</div>
        </div>

        <div className="os-card p-4">
          <div className="flex items-center justify-between text-indigo-500">
            <Clock3 size={18} />
            <span className="text-[10px] font-black uppercase">Attendance & Leave</span>
          </div>
          <div className="mt-3 text-2xl font-black">{consumedMasterData.attendanceRecordsCount}</div>
          <div className="text-[10px] text-slate-400 mt-1">{consumedMasterData.leaveRequestsCount} Leave Requests Consumed</div>
        </div>

        <div className="os-card p-4">
          <div className="flex items-center justify-between text-amber-500">
            <Banknote size={18} />
            <span className="text-[10px] font-black uppercase">Active Pay Runs</span>
          </div>
          <div className="mt-3 text-2xl font-black">{payrollRuns.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">Current Operating Company</div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="os-card p-2 flex items-center gap-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveTab('runs')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'runs'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Banknote size={14} /> Payroll Runs & Periods ({payrollRuns.length})
        </button>
        <button
          onClick={() => setActiveTab('structures')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'structures'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calculator size={14} /> Salary Structures ({employeeSalaryStructures.length})
        </button>
        <button
          onClick={() => setActiveTab('components')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'components'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers size={14} /> Components ({payrollComponents.length})
        </button>
        <button
          onClick={() => setActiveTab('statutory')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'statutory'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck size={14} /> Statutory Rules ({statutoryRules.length})
        </button>
        <button
          onClick={() => setActiveTab('declarations')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'declarations'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText size={14} /> Tax Declarations ({taxDeclarations.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Settings size={14} /> Settings
        </button>
      </div>

      {/* Tab 1: Payroll Runs & Periods */}
      {activeTab === 'runs' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Payroll Periods & Server Execution Runs</h3>
              <p className="text-xs text-slate-400">Manage monthly pay periods and execute server-side payroll calculations for {activeOperatingCompany?.name || 'Operating Company'}</p>
            </div>
            {isManagementOrAdmin && (
              <button onClick={() => { setPeriodForm({ period_code: `PRD-${new Date().getFullYear()}-${new Date().getMonth() + 1}`, period_name: `Pay Period ${new Date().toLocaleDateString('default', { month: 'short', year: 'numeric' })}`, pay_date: new Date().toISOString().split('T')[0] }); setPeriodModal(true); }} className="os-primary flex items-center gap-1.5 cursor-pointer">
                <Plus size={14} /> Create Pay Period
              </button>
            )}
          </div>

          {/* Payroll Execution Runs Section */}
          <div className="os-card overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-500">Payroll Execution Runs (`payroll_runs`)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                {payrollRuns.length} Active Runs
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase text-slate-400">
                    <th className="px-4 py-3">Run ID</th>
                    <th className="px-4 py-3">Pay Period</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created Date</th>
                    {isManagementOrAdmin && <th className="px-4 py-3 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {payrollRuns.map(run => {
                    const period = payrollPeriods.find(p => p.id === run.payroll_period_id);
                    const isDraft = ['draft', 'pending'].includes((run.status || 'draft').toLowerCase());
                    const isCalculating = calculatingRunId === run.id;

                    return (
                      <tr key={run.id} className="border-b border-slate-100 dark:border-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                        <td className="px-4 py-3 font-mono font-bold text-sky-600 dark:text-sky-400">{run.id?.slice(0, 8)}...</td>
                        <td className="px-4 py-3 font-semibold">{period?.period_name || period?.period_code || 'Pay Period'}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
                            {run.status || 'draft'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">{run.created_at ? new Date(run.created_at).toLocaleDateString() : 'N/A'}</td>
                        {isManagementOrAdmin && (
                          <td className="px-4 py-3 text-right">
                            {isDraft ? (
                              <button
                                onClick={() => handleCalculateRun(run.id)}
                                disabled={isCalculating}
                                className="os-primary text-xs px-2.5 py-1 flex items-center gap-1.5 inline-flex cursor-pointer disabled:opacity-50"
                              >
                                <Calculator size={13} />
                                {isCalculating ? 'Calculating...' : 'Calculate Payroll'}
                              </button>
                            ) : (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">Calculated</span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {payrollRuns.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-xs italic text-slate-400">
                        No active payroll runs found for current operating company.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Calculated Employee Results Section */}
          <div className="os-card overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator size={16} className="text-sky-500" />
                <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-200">
                  Calculated Employee Payroll Results (`payroll_run_items`)
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                {payrollRunItems.length} Sourced Records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase text-slate-400">
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Tax Year & Regime</th>
                    <th className="px-4 py-3">Declaration Status</th>
                    <th className="px-4 py-3 text-right">Gross Earnings</th>
                    <th className="px-4 py-3 text-right">Total Deductions</th>
                    <th className="px-4 py-3 text-right">TDS Status / Amount</th>
                    <th className="px-4 py-3 text-right">Net Pay</th>
                    <th className="px-4 py-3">Statutory Basis / Snapshot</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollRunItems.map(item => {
                    const emp = employees.find(e => e.id === item.employee_id);
                    const dec = taxDeclarations.find(d => d.employee_id === item.employee_id);

                    let snapshotObj = null;
                    if (item.calculation_snapshot) {
                      try {
                        snapshotObj = typeof item.calculation_snapshot === 'string'
                          ? JSON.parse(item.calculation_snapshot)
                          : item.calculation_snapshot;
                      } catch (e) {
                        snapshotObj = null;
                      }
                    }

                    // Sourced tax regime & year from server calculation snapshot or declaration fallback
                    const resolvedTaxYear = snapshotObj?.tax_year || dec?.tax_year || '2026-2027';
                    const rawRegime = snapshotObj?.tax_regime || dec?.tax_regime || 'new_regime';
                    const resolvedRegimeText = rawRegime === 'new_regime' ? 'New Tax Regime' : 'Old Tax Regime';

                    // Server-calculated TDS amount (supporting both current_period_tds & tds_amount)
                    const serverTdsVal = snapshotObj?.current_period_tds !== undefined
                      ? snapshotObj.current_period_tds
                      : (snapshotObj?.tds_amount !== undefined ? snapshotObj.tds_amount : null);

                    // TDS Calculation Status derivation
                    let tdsStatusText = 'Pending Server Engine';
                    let tdsStatusColor = 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';

                    if (serverTdsVal !== null && serverTdsVal !== undefined) {
                      tdsStatusText = `TDS: ₹${parseFloat(serverTdsVal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
                      tdsStatusColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
                    } else if (dec && dec.tds_applicable === false) {
                      tdsStatusText = 'Exempt / Opted Out';
                      tdsStatusColor = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
                    } else if (snapshotObj && snapshotObj.tds_blocker) {
                      tdsStatusText = 'Engine Blocker';
                      tdsStatusColor = 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300';
                    } else if (dec && dec.declaration_status === 'approved') {
                      tdsStatusText = 'Approved (Calc Pending)';
                      tdsStatusColor = 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300';
                    }

                    return (
                      <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                        <td className="px-4 py-3 font-bold">
                          {emp ? `${emp.first_name} ${emp.last_name}` : `EMP ID: ${item.employee_id?.slice(0, 8)}...`}
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-700 dark:text-slate-300 block">{resolvedTaxYear}</span>
                            <span className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400">
                              {resolvedRegimeText}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {dec ? (
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              dec.declaration_status === 'approved' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' :
                              dec.declaration_status === 'rejected' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' :
                              'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                            }`}>
                              {dec.declaration_status || 'submitted'}
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                              Default Standard
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{parseFloat(item.gross_earnings || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                          ₹{parseFloat(item.total_deductions || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black ${tdsStatusColor}`}>
                            {tdsStatusText}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-black text-sky-600 dark:text-sky-400 text-sm">
                          ₹{parseFloat(item.net_pay || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3">
                          {snapshotObj ? (
                            <div className="flex flex-wrap gap-1 text-[10px]">
                              {snapshotObj.pf_amount !== undefined && <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">PF: ₹{snapshotObj.pf_amount}</span>}
                              {snapshotObj.esi_amount !== undefined && <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">ESI: ₹{snapshotObj.esi_amount}</span>}
                              {snapshotObj.pt_amount !== undefined && <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">PT: ₹{snapshotObj.pt_amount}</span>}
                              {serverTdsVal !== null && serverTdsVal !== undefined && (
                                <span className="px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-mono font-bold">
                                  TDS: ₹{serverTdsVal}
                                </span>
                              )}
                              {snapshotObj.net_taxable_income !== undefined && (
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">
                                  Taxable: ₹{snapshotObj.net_taxable_income}
                                </span>
                              )}
                              {snapshotObj.lop_days !== undefined && <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">LOP: {snapshotObj.lop_days}d</span>}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[10px]">DB Server Snapshot</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {payrollRunItems.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-xs italic text-slate-400">
                        No calculated payroll items recorded yet. Click "Calculate Payroll" on a draft run to invoke `calculate_payroll_run_atomic` server RPC.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pay Periods Table */}
          <div className="os-card overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-500">Pay Periods History (`payroll_periods`)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                {payrollPeriods.length} Periods Recorded
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase text-slate-400">
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Period Name</th>
                    <th className="px-4 py-3">Pay Date</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollPeriods.map(p => (
                    <tr key={p.id} className="border-b border-slate-100 dark:border-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3 font-bold text-sky-600 dark:text-sky-400">{p.period_code}</td>
                      <td className="px-4 py-3 font-semibold">{p.period_name || 'Pay Period'}</td>
                      <td className="px-4 py-3 text-slate-400">{p.pay_date || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
                          {p.status || 'draft'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {payrollPeriods.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-xs italic text-slate-400">
                        No pay periods configured in database. Click "Create Pay Period" to define a period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Salary Structures */}
      {activeTab === 'structures' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Employee Salary Structures</h3>
              <p className="text-xs text-slate-400">Assign base CTC, effective dates, and structure items to employees</p>
            </div>
            {isManagementOrAdmin && (
              <button onClick={() => { setStructForm({ employee_id: employees[0]?.id || '', effective_from: new Date().toISOString().split('T')[0], amount: '' }); setStructureModal(true); }} className="os-primary flex items-center gap-1.5 cursor-pointer">
                <Plus size={14} /> Assign Salary Structure
              </button>
            )}
          </div>

          <div className="os-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase text-slate-400">
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Code / Dept</th>
                    <th className="px-4 py-3">Effective From</th>
                    <th className="px-4 py-3">Effective To</th>
                    <th className="px-4 py-3">Status</th>
                    {isManagementOrAdmin && <th className="px-4 py-3 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => {
                    const struct = employeeSalaryStructures.find(s => s.employee_id === emp.id);
                    return (
                      <tr key={emp.id} className="border-b border-slate-100 dark:border-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition text-xs">
                        <td className="px-4 py-3 font-bold">{emp.first_name} {emp.last_name}</td>
                        <td className="px-4 py-3 text-slate-400">{emp.employee_code || 'EMP-N/A'}</td>
                        <td className="px-4 py-3 text-slate-400">{struct?.effective_from || '—'}</td>
                        <td className="px-4 py-3 text-slate-400">{struct?.effective_to || 'Open'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            struct ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {struct ? (struct.status || 'Active') : 'Pending Setup'}
                          </span>
                        </td>
                        {isManagementOrAdmin && (
                          <td className="px-4 py-3 text-right space-x-1">
                            {struct ? (
                              struct.status === 'inactive' ? (
                                <span className="text-[10px] text-slate-400 font-semibold italic">Ended</span>
                              ) : (
                                <button onClick={() => handleDeactivateStructure(struct.id)} className="os-secondary text-xs px-2 py-1 text-amber-600 hover:text-amber-700 cursor-pointer flex items-center gap-1 inline-flex">
                                  <Clock3 size={12} /> End Structure
                                </button>
                              )
                            ) : (
                              <button onClick={() => { setStructForm({ employee_id: emp.id, effective_from: new Date().toISOString().split('T')[0], amount: '' }); setStructureModal(true); }} className="os-primary text-xs px-2 py-1">
                                Configure
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {employees.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-xs italic text-slate-400">
                        No employees loaded from Employee Master.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Salary Components */}
      {activeTab === 'components' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Salary Component Dictionary</h3>
              <p className="text-xs text-slate-400">Pre-defined earnings, statutory contributions, reimbursements, and deductions stored in database</p>
            </div>
            {isManagementOrAdmin && (
              <button onClick={() => { setCompForm({ code: '', name: '', component_type: 'Earning' }); setComponentModal({}); }} className="os-primary flex items-center gap-1.5 cursor-pointer">
                <Plus size={14} /> Add Component
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {payrollComponents.map(comp => (
              <div key={comp.id} className="os-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-sky-600 dark:text-sky-400">{comp.code}</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {comp.component_type}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{comp.name}</h4>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Status: <strong className="text-slate-600 dark:text-slate-300">{comp.status || 'active'}</strong></span>
                  {isManagementOrAdmin && (comp.status || 'active').toLowerCase() === 'active' && (
                    <button onClick={() => handleDeactivateComponent(comp.id)} className="text-amber-600 hover:text-amber-500 font-bold flex items-center gap-1 cursor-pointer">
                      <Ban size={12} /> Deactivate
                    </button>
                  )}
                </div>
              </div>
            ))}
            {payrollComponents.length === 0 && (
              <div className="col-span-full os-card p-8 text-center space-y-2">
                <Layers size={32} className="mx-auto text-slate-400 opacity-60" />
                <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400">No Components Configured</h4>
                <p className="text-[11px] text-slate-400">Click "Add Component" above to create earnings and deductions in the live database.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Statutory Rules */}
      {activeTab === 'statutory' && (
        <div className="space-y-5">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Statutory Rules & Compliance Configuration</h3>
              <p className="text-xs text-slate-400">Effective-dated statutory rule records stored in live `payroll_statutory_rules` table</p>
            </div>
            {isManagementOrAdmin && (
              <button onClick={() => { setStatForm({ financial_year: '2026-2027', effective_from: new Date().toISOString().split('T')[0], effective_to: '' }); setStatutoryModal({}); }} className="os-primary flex items-center gap-1.5 cursor-pointer">
                <Plus size={14} /> Add Statutory Rule Set
              </button>
            )}
          </div>

          <div className="os-card overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-500">Live Statutory Rule Sets</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                {statutoryRules.length} Records
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase text-slate-400">
                    <th className="px-4 py-3">Financial Year</th>
                    <th className="px-4 py-3">Effective From</th>
                    <th className="px-4 py-3">Effective To</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {statutoryRules.map(r => (
                    <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3 font-bold text-sky-600 dark:text-sky-400">{r.financial_year}</td>
                      <td className="px-4 py-3 text-slate-400">{r.effective_from}</td>
                      <td className="px-4 py-3 text-slate-400">{r.effective_to || 'Open'}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                          {r.status || 'active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {statutoryRules.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-xs italic text-slate-400">
                        No statutory rule sets created yet. Click "Add Statutory Rule Set" to insert an effective-dated rule into database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Professional Tax Slabs Reference UI */}
          <div className="os-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider">Professional Tax (PT) State Slabs Reference</h4>
                <p className="text-[11px] text-slate-400">State slab configuration mapping for PT calculations</p>
              </div>
              <select
                value={selectedState}
                onChange={e => setSelectedState(e.target.value)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
              >
                <option value="Telangana">Telangana</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Karnataka">Karnataka</option>
                <option value="TamilNadu">Tamil Nadu</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase text-slate-400">
                    <th className="px-3 py-2">Gross Salary Range</th>
                    <th className="px-3 py-2">PT Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(ptSlabsMap[selectedState] || []).map((s, idx) => (
                    <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/60">
                      <td className="px-3 py-2 font-mono">{s.min} – {s.max}</td>
                      <td className="px-3 py-2 font-mono font-bold text-sky-600 dark:text-sky-400">{s.pt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Tax Declarations */}
      {activeTab === 'declarations' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Employee TDS Tax Declarations (FY 2026–27)</h3>
              <p className="text-xs text-slate-400">Employee Section 192 tax regime declarations, deductions, exemptions, and previous employer income</p>
            </div>
            <button
              onClick={() => {
                setDecForm({
                  employee_id: employees[0]?.id || '',
                  tax_year: '2026-2027',
                  tax_regime: 'new_regime',
                  residency_status: 'resident',
                  tds_applicable: true,
                  projected_annual_salary: '',
                  other_income: '',
                  home_loan_interest: '',
                  previous_employer_income: '',
                  previous_employer_tds: '',
                  employer_name: '',
                  rent_paid: '',
                  is_metro: false,
                  landlord_pan: '',
                  sec_80c: '',
                  sec_80d: '',
                  sec_80ccd1b: '',
                  sec_80e: '',
                  lta_amount: '',
                  proof_remarks: ''
                });
                setDeclarationModal({});
              }}
              className="os-primary flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <Plus size={14} /> Submit Tax Declaration
            </button>
          </div>

          <div className="os-card overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-500">Tax Declarations Records (`payroll_tax_declarations`)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                {taxDeclarations.length} Declarations
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase text-slate-400">
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Tax Year / Regime</th>
                    <th className="px-4 py-3">Residency / TDS</th>
                    <th className="px-4 py-3 text-right">Proj. Salary</th>
                    <th className="px-4 py-3 text-right">Prev. Employer Inc / TDS</th>
                    <th className="px-4 py-3">Deductions (80C/80D)</th>
                    <th className="px-4 py-3">Status</th>
                    {isManagementOrAdmin && <th className="px-4 py-3 text-right">Review Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {taxDeclarations.map(dec => {
                    const emp = employees.find(e => e.id === dec.employee_id);
                    const isNewRegime = dec.tax_regime === 'new_regime';

                    return (
                      <tr key={dec.id} className="border-b border-slate-100 dark:border-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                        <td className="px-4 py-3 font-bold">
                          {emp ? `${emp.first_name} ${emp.last_name}` : `EMP ID: ${dec.employee_id?.slice(0, 8)}...`}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-sky-600 dark:text-sky-400">{dec.tax_year}</div>
                          <div className="text-[10px] font-semibold text-slate-500 uppercase">{isNewRegime ? 'New Regime (115BAC)' : 'Old Regime'}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          <div className="capitalize">{dec.residency_status || 'Resident'}</div>
                          <div className="text-[10px] font-mono">{dec.tds_applicable ? 'TDS Active' : 'TDS Exempt'}</div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{parseFloat(dec.projected_annual_salary || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-500">
                          <div>₹{parseFloat(dec.previous_employer_income || 0).toLocaleString('en-IN')}</div>
                          <div className="text-[10px] text-amber-600">TDS: ₹{parseFloat(dec.previous_employer_tds || 0).toLocaleString('en-IN')}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          <div className="text-[10px] space-y-0.5">
                            <div>80C: ₹{dec.deduction_data?.sec_80c || 0}</div>
                            <div>80D: ₹{dec.deduction_data?.sec_80d || 0}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            dec.declaration_status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                              : dec.declaration_status === 'rejected'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                          }`}>
                            {dec.declaration_status || 'submitted'}
                          </span>
                        </td>
                        {isManagementOrAdmin && (
                          <td className="px-4 py-3 text-right space-x-1">
                            {dec.declaration_status !== 'approved' && (
                              <button
                                onClick={() => handleUpdateDeclarationStatus(dec.id, 'approved')}
                                className="os-primary text-xs px-2 py-1"
                              >
                                Approve
                              </button>
                            )}
                            {dec.declaration_status !== 'rejected' && (
                              <button
                                onClick={() => handleUpdateDeclarationStatus(dec.id, 'rejected')}
                                className="os-secondary text-xs px-2 py-1 text-rose-600"
                              >
                                Reject
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {taxDeclarations.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-xs italic text-slate-400">
                        No tax declarations submitted yet. Click "Submit Tax Declaration" to file employee tax regime and deduction declarations.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {settingsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase">Configure Payroll Settings</h3>
              <button onClick={() => setSettingsModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Monthly Pay Day (1–31)</label>
                <input type="number" min={1} max={31} value={settingsForm.pay_day} onChange={e => setSettingsForm({ ...settingsForm, pay_day: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" required />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setSettingsModal(false)} className="os-secondary">Cancel</button>
                <button type="submit" className="os-primary flex items-center gap-1"><Send size={13} /> Save Settings</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Component Modal */}
      {componentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase">Add Salary Component</h3>
              <button onClick={() => setComponentModal(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSaveComponent} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Component Code (e.g. BASIC, HRA)</label>
                <input type="text" value={compForm.code} onChange={e => setCompForm({ ...compForm, code: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono" placeholder="BASIC" required />
              </div>
              <div>
                <label className="font-bold block mb-1">Component Name</label>
                <input type="text" value={compForm.name} onChange={e => setCompForm({ ...compForm, name: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" placeholder="Basic Pay" required />
              </div>
              <div>
                <label className="font-bold block mb-1">Type</label>
                <select value={compForm.component_type} onChange={e => setCompForm({ ...compForm, component_type: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                  <option value="Earning">Earning</option>
                  <option value="Deduction">Deduction</option>
                  <option value="Statutory Contribution">Statutory Contribution</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setComponentModal(null)} className="os-secondary">Cancel</button>
                <button type="submit" className="os-primary flex items-center gap-1"><Send size={13} /> Save Component</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Statutory Modal */}
      {statutoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase">Add Statutory Rule Record</h3>
              <button onClick={() => setStatutoryModal(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSaveStatutory} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Financial Year</label>
                <input type="text" value={statForm.financial_year} onChange={e => setStatForm({ ...statForm, financial_year: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" placeholder="2026-2027" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Effective From</label>
                  <input type="date" value={statForm.effective_from} onChange={e => setStatForm({ ...statForm, effective_from: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" required />
                </div>
                <div>
                  <label className="font-bold block mb-1">Effective To (Optional)</label>
                  <input type="date" value={statForm.effective_to} onChange={e => setStatForm({ ...statForm, effective_to: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setStatutoryModal(null)} className="os-secondary">Cancel</button>
                <button type="submit" className="os-primary flex items-center gap-1"><Send size={13} /> Save Rule Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Structure Modal */}
      {structureModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase">Assign Salary Structure</h3>
              <button onClick={() => setStructureModal(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSaveStructure} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Target Employee</label>
                <select value={structForm.employee_id} onChange={e => setStructForm({ ...structForm, employee_id: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" required>
                  <option value="">Select Employee...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_code || 'EMP'})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold block mb-1">Effective From</label>
                <input type="date" value={structForm.effective_from} onChange={e => setStructForm({ ...structForm, effective_from: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" required />
              </div>
              <div>
                <label className="font-bold block mb-1">Structure Amount (Optional)</label>
                <input type="number" step="0.01" value={structForm.amount} onChange={e => setStructForm({ ...structForm, amount: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" placeholder="0.00" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setStructureModal(null)} className="os-secondary">Cancel</button>
                <button type="submit" className="os-primary flex items-center gap-1"><Send size={13} /> Save Structure</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Period Modal */}
      {periodModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase">Create Pay Period</h3>
              <button onClick={() => setPeriodModal(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSavePeriod} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Period Code</label>
                <input type="text" value={periodForm.period_code} onChange={e => setPeriodForm({ ...periodForm, period_code: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono" placeholder="PRD-2026-04" required />
              </div>
              <div>
                <label className="font-bold block mb-1">Period Name</label>
                <input type="text" value={periodForm.period_name} onChange={e => setPeriodForm({ ...periodForm, period_name: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" placeholder="April 2026 Salary" required />
              </div>
              <div>
                <label className="font-bold block mb-1">Disbursement Pay Date</label>
                <input type="date" value={periodForm.pay_date} onChange={e => setPeriodForm({ ...periodForm, pay_date: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" required />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setPeriodModal(null)} className="os-secondary">Cancel</button>
                <button type="submit" className="os-primary flex items-center gap-1"><Send size={13} /> Save Pay Period</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tax Declaration Submission Modal */}
      {declarationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-black uppercase text-slate-800 dark:text-slate-100">Submit TDS Tax Declaration (FY 2026–27)</h3>
                <p className="text-xs text-slate-400">File annual income tax regime, deductions, and previous employer declarations</p>
              </div>
              <button onClick={() => setDeclarationModal(null)}><X size={16} /></button>
            </div>

            <form onSubmit={handleSaveTaxDeclaration} className="space-y-4 text-xs">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Target Employee</label>
                  <select value={decForm.employee_id} onChange={e => setDecForm({ ...decForm, employee_id: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" required>
                    <option value="">Select Employee...</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_code || 'EMP'})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Tax Financial Year</label>
                  <input type="text" value={decForm.tax_year} onChange={e => setDecForm({ ...decForm, tax_year: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" placeholder="2026-2027" required />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <label className="font-bold block mb-1">Tax Regime Choice</label>
                  <select value={decForm.tax_regime} onChange={e => setDecForm({ ...decForm, tax_regime: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold">
                    <option value="new_regime">New Tax Regime (115BAC Default)</option>
                    <option value="old_regime">Old Tax Regime (Opt-Out)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Residency Status</label>
                  <select value={decForm.residency_status} onChange={e => setDecForm({ ...decForm, residency_status: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <option value="resident">Resident Indian</option>
                    <option value="non_resident">Non-Resident (NRI)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">TDS Applicability</label>
                  <select value={decForm.tds_applicable ? 'yes' : 'no'} onChange={e => setDecForm({ ...decForm, tds_applicable: e.target.value === 'yes' })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <option value="yes">TDS Applicable</option>
                    <option value="no">TDS Exempt</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold block mb-1">Projected Annual Salary (₹)</label>
                  <input type="number" step="0.01" value={decForm.projected_annual_salary} onChange={e => setDecForm({ ...decForm, projected_annual_salary: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono" placeholder="1200000" />
                </div>
                <div>
                  <label className="font-bold block mb-1">Other Income Sources (₹)</label>
                  <input type="number" step="0.01" value={decForm.other_income} onChange={e => setDecForm({ ...decForm, other_income: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono" placeholder="50000" />
                </div>
                <div>
                  <label className="font-bold block mb-1">Home Loan Interest Sec 24b (₹)</label>
                  <input type="number" step="0.01" value={decForm.home_loan_interest} onChange={e => setDecForm({ ...decForm, home_loan_interest: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono" placeholder="200000" />
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-bold block text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-wider">Previous Employer Salary & TDS (Form 12B)</span>
                <div className="grid md:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">Previous Employer Name</label>
                    <input type="text" value={decForm.employer_name} onChange={e => setDecForm({ ...decForm, employer_name: e.target.value })} className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" placeholder="Acme Corp" />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Previous Salary Income (₹)</label>
                    <input type="number" step="0.01" value={decForm.previous_employer_income} onChange={e => setDecForm({ ...decForm, previous_employer_income: e.target.value })} className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono" placeholder="400000" />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Previous TDS Deducted (₹)</label>
                    <input type="number" step="0.01" value={decForm.previous_employer_tds} onChange={e => setDecForm({ ...decForm, previous_employer_tds: e.target.value })} className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono" placeholder="25000" />
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-bold block text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-wider">HRA Rent & Chapter VI-A Deductions</span>
                <div className="grid md:grid-cols-4 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">Annual Rent Paid (₹)</label>
                    <input type="number" step="0.01" value={decForm.rent_paid} onChange={e => setDecForm({ ...decForm, rent_paid: e.target.value })} className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono" placeholder="180000" />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Section 80C (₹)</label>
                    <input type="number" step="0.01" value={decForm.sec_80c} onChange={e => setDecForm({ ...decForm, sec_80c: e.target.value })} className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono" placeholder="150000" />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Section 80D Health (₹)</label>
                    <input type="number" step="0.01" value={decForm.sec_80d} onChange={e => setDecForm({ ...decForm, sec_80d: e.target.value })} className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono" placeholder="25000" />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Section 80CCD NPS (₹)</label>
                    <input type="number" step="0.01" value={decForm.sec_80ccd1b} onChange={e => setDecForm({ ...decForm, sec_80ccd1b: e.target.value })} className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono" placeholder="50000" />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input type="checkbox" id="metro_cb" checked={decForm.is_metro} onChange={e => setDecForm({ ...decForm, is_metro: e.target.checked })} className="rounded text-sky-500" />
                  <label htmlFor="metro_cb" className="font-semibold">Metro City Accommodation (Delhi, Mumbai, Kolkata, Chennai)</label>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Evidence Remarks / Proof Document Notes</label>
                <input type="text" value={decForm.proof_remarks} onChange={e => setDecForm({ ...decForm, proof_remarks: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" placeholder="Rent agreement & 80C premium receipts attached" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setDeclarationModal(null)} className="os-secondary">Cancel</button>
                <button type="submit" className="os-primary flex items-center gap-1"><Send size={13} /> Submit Declaration</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {activeTab === 'settings' && (
        <div className="os-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Payroll Settings</h3>
              <p className="text-xs text-slate-400">Company-level payroll execution settings stored in `payroll_settings`</p>
            </div>
            {isManagementOrAdmin && (
              <button onClick={() => { setSettingsForm({ pay_day: payrollSettings?.pay_day || 30 }); setSettingsModal(true); }} className="os-primary flex items-center gap-1.5 cursor-pointer">
                <Edit2 size={14} /> Configure Settings
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 space-y-2">
              <span className="font-bold block text-slate-700 dark:text-slate-200">Execution Configuration</span>
              <div className="text-[11px] text-slate-400 space-y-1">
                <div>Monthly Pay Day: <span className="font-mono font-bold text-sky-600 dark:text-sky-400">{payrollSettings?.pay_day || 30}th of month</span></div>
                <div>Status: <span className="font-bold uppercase text-emerald-600">{payrollSettings?.status || 'active'}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {settingsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase">Configure Payroll Settings</h3>
              <button onClick={() => setSettingsModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Monthly Pay Day (1–31)</label>
                <input type="number" min={1} max={31} value={settingsForm.pay_day} onChange={e => setSettingsForm({ ...settingsForm, pay_day: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" required />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setSettingsModal(false)} className="os-secondary">Cancel</button>
                <button type="submit" className="os-primary flex items-center gap-1"><Send size={13} /> Save Settings</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Component Modal */}
      {componentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase">Add Salary Component</h3>
              <button onClick={() => setComponentModal(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSaveComponent} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Component Code (e.g. BASIC, HRA)</label>
                <input type="text" value={compForm.code} onChange={e => setCompForm({ ...compForm, code: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono" placeholder="BASIC" required />
              </div>
              <div>
                <label className="font-bold block mb-1">Component Name</label>
                <input type="text" value={compForm.name} onChange={e => setCompForm({ ...compForm, name: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" placeholder="Basic Pay" required />
              </div>
              <div>
                <label className="font-bold block mb-1">Type</label>
                <select value={compForm.component_type} onChange={e => setCompForm({ ...compForm, component_type: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                  <option value="Earning">Earning</option>
                  <option value="Deduction">Deduction</option>
                  <option value="Statutory Contribution">Statutory Contribution</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setComponentModal(null)} className="os-secondary">Cancel</button>
                <button type="submit" className="os-primary flex items-center gap-1"><Send size={13} /> Save Component</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Statutory Modal */}
      {statutoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase">Add Statutory Rule Record</h3>
              <button onClick={() => setStatutoryModal(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSaveStatutory} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Financial Year</label>
                <input type="text" value={statForm.financial_year} onChange={e => setStatForm({ ...statForm, financial_year: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" placeholder="2026-2027" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Effective From</label>
                  <input type="date" value={statForm.effective_from} onChange={e => setStatForm({ ...statForm, effective_from: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" required />
                </div>
                <div>
                  <label className="font-bold block mb-1">Effective To (Optional)</label>
                  <input type="date" value={statForm.effective_to} onChange={e => setStatForm({ ...statForm, effective_to: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setStatutoryModal(null)} className="os-secondary">Cancel</button>
                <button type="submit" className="os-primary flex items-center gap-1"><Send size={13} /> Save Rule Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Structure Modal */}
      {structureModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase">Assign Salary Structure</h3>
              <button onClick={() => setStructureModal(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSaveStructure} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Target Employee</label>
                <select value={structForm.employee_id} onChange={e => setStructForm({ ...structForm, employee_id: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" required>
                  <option value="">Select Employee...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_code || 'EMP'})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold block mb-1">Effective From</label>
                <input type="date" value={structForm.effective_from} onChange={e => setStructForm({ ...structForm, effective_from: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" required />
              </div>
              <div>
                <label className="font-bold block mb-1">Structure Amount (Optional)</label>
                <input type="number" step="0.01" value={structForm.amount} onChange={e => setStructForm({ ...structForm, amount: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" placeholder="0.00" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setStructureModal(null)} className="os-secondary">Cancel</button>
                <button type="submit" className="os-primary flex items-center gap-1"><Send size={13} /> Save Structure</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Period Modal */}
      {periodModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase">Create Pay Period</h3>
              <button onClick={() => setPeriodModal(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSavePeriod} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Period Code</label>
                <input type="text" value={periodForm.period_code} onChange={e => setPeriodForm({ ...periodForm, period_code: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono" placeholder="PRD-2026-04" required />
              </div>
              <div>
                <label className="font-bold block mb-1">Period Name</label>
                <input type="text" value={periodForm.period_name} onChange={e => setPeriodForm({ ...periodForm, period_name: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" placeholder="April 2026 Salary" required />
              </div>
              <div>
                <label className="font-bold block mb-1">Disbursement Pay Date</label>
                <input type="date" value={periodForm.pay_date} onChange={e => setPeriodForm({ ...periodForm, pay_date: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" required />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setPeriodModal(null)} className="os-secondary">Cancel</button>
                <button type="submit" className="os-primary flex items-center gap-1"><Send size={13} /> Save Pay Period</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
