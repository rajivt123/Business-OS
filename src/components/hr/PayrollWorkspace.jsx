import { useState, useMemo } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { useEmployee } from '../../context/EmployeeContext';
import { useCrm } from '../../context/CrmContext';
import { useAccounts } from '../../context/AccountsContext';
import {
  Banknote, CalendarDays, Calculator, Layers, ShieldCheck, Settings, Plus,
  FileText, Users, Clock3, AlertCircle, CheckCircle2, Sliders, ArrowUpRight, ChevronRight, Info,
  Edit2, Ban, X, Send, Lock, Download, Building, Check, XCircle, FileSpreadsheet,
  BarChart3, RefreshCw, FileCode, CheckSquare, DollarSign, PieChart, Activity, FileCheck, ExternalLink
} from 'lucide-react';

// Helper function to trigger browser file download from content string
const downloadFile = (content, fileName, mimeType = 'text/plain') => {
  if (!content) return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName || 'download';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Helper function to safely mask sensitive bank account numbers
const maskBankAccount = (accNo) => {
  if (!accNo) return 'N/A';
  const str = String(accNo).trim();
  if (str.length <= 4) return '****' + str;
  return '****' + str.slice(-4);
};

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
    payrollAccountMappings = [],
    payrollPaymentBatches = [],
    payrollPaymentItems = [],
    payrollBankFileProfiles = [],
    payrollBankFiles = [],
    payrollBankReconciliations = [],
    payrollStatutorySettlements = [],
    payrollDashboardSummary = null,
    payrollIntegrity = null,
    selectedPayrollRunId = null,
    setSelectedPayrollRunId,
    fetchPayrollIntegrity,
    payrollSummary,
    consumedMasterData,
    isManagementOrAdmin,
    isAdmin,
    savePayrollSettings,
    savePayrollComponent,
    deactivatePayrollComponent,
    saveStatutoryRule,
    saveSalaryStructure,
    deactivateSalaryStructure,
    savePayrollPeriod,
    createPayrollRun,
    calculatePayrollRun,
    submitPayrollRunForApproval,
    approvePayrollRun,
    finalizePayrollRunWithAccounting,
    upsertPayrollAccountMapping,
    createPayrollPaymentBatch,
    submitPayrollPaymentBatchForApproval,
    approvePayrollPaymentBatch,
    processPayrollPaymentBatch,
    cancelPayrollPaymentBatch,
    upsertBankFileProfile,
    generateBankFile,
    recordBankFileSubmission,
    recordBankFileResult,
    matchPayrollBankTransaction,
    unmatchPayrollBankTransaction,
    generateStatutoryExport,
    generatePfEcrExport,
    generateEsiExport,
    processStatutoryPayment,
    generatePayslip,
    generateForm16Preparation,
    fetchBankReconciliations,
    fetchStatutorySettlements,
    fetchDashboardSummary,
    saveTaxDeclaration,
    updateTaxDeclarationStatus
  } = usePayroll();

  const { employees = [] } = useEmployee() || {};
  const crmCtx = useCrm() || {};
  const { activeOperatingCompany, currentUser, session } = crmCtx;
  const { accounts = [] } = useAccounts() || {};

  const currentUserId = session?.user?.id || currentUser?.id;
  const currentEmployee = useMemo(() => {
    return employees.find(e =>
      (e.linked_user_id && e.linked_user_id === currentUserId) ||
      (e.email && currentUser?.email && e.email.toLowerCase() === currentUser.email.toLowerCase())
    );
  }, [employees, currentUserId, currentUser]);

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'runs' | 'payments' | 'reconciliation' | 'statutory' | 'form16' | 'structures' | 'components' | 'declarations' | 'settings'
  const [selectedState, setSelectedState] = useState('Telangana');

  // Notice Banner State
  const [banner, setBanner] = useState(null);

  // P1 Action Loading & Modal States
  const [actionLoadingRunId, setActionLoadingRunId] = useState(null);
  const [createRunModal, setCreateRunModal] = useState(false);
  const [approveModalRunId, setApproveModalRunId] = useState(null);
  const [approveComments, setApproveComments] = useState('');
  const [mappingModal, setMappingModal] = useState(null);
  const [modalSubmitting, setModalSubmitting] = useState(false);

  // P2A Payment Batch Modal & Form States
  const [createPaymentBatchModal, setCreatePaymentBatchModal] = useState(null);
  const [approvePaymentBatchModalId, setApprovePaymentBatchModalId] = useState(null);
  const [processPaymentBatchModalId, setProcessPaymentBatchModalId] = useState(null);
  const [cancelPaymentBatchModalId, setCancelPaymentBatchModalId] = useState(null);

  const [paymentBatchForm, setPaymentBatchForm] = useState({
    bank_account_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [paymentBatchComments, setPaymentBatchComments] = useState('');
  const [paymentBankReference, setPaymentBankReference] = useState('');
  const [paymentCancelReason, setPaymentCancelReason] = useState('');

  // P2B Bank File Modal & Form States
  const [bankFileProfileModal, setBankFileProfileModal] = useState(null); // null or object for edit
  const [generateBankFileModalBatch, setGenerateBankFileModalBatch] = useState(null); // null or batch object
  const [submitBankFileModalId, setSubmitBankFileModalId] = useState(null); // null or bank_file_id
  const [resultBankFileModalId, setResultBankFileModalId] = useState(null); // null or bank_file_id

  const [bankFileProfileForm, setBankFileProfileForm] = useState({
    profile_code: '',
    bank_name: '',
    format_type: 'CSV',
    is_active: true
  });
  const [selectedBankProfileId, setSelectedBankProfileId] = useState('');
  const [bankFileSubmitExternalRef, setBankFileSubmitExternalRef] = useState('');
  const [bankFileResultStatus, setBankFileResultStatus] = useState('accepted');
  const [bankFileResultExternalRef, setBankFileResultExternalRef] = useState('');
  const [bankFileResultRejectionReason, setBankFileResultRejectionReason] = useState('');

  // P2C Reconciliation Modal & Form States
  const [reconcileModalItem, setReconcileModalItem] = useState(null); // transaction or item
  const [reconcileForm, setReconcileForm] = useState({
    bank_transaction_id: '',
    payroll_payment_item_id: '',
    payroll_payment_batch_id: '',
    matched_amount: '',
    status: 'matched',
    match_method: 'manual',
    external_reference: '',
    notes: ''
  });
  const [unmatchModalRec, setUnmatchModalRec] = useState(null); // reconciliation record
  const [unmatchReason, setUnmatchReason] = useState('');

  // P2D Statutory Export & Processing States
  const [selectedStatPeriodId, setSelectedStatPeriodId] = useState('');
  const [statExportLoading, setStatExportLoading] = useState(false);
  const [processStatModal, setProcessStatModal] = useState(null); // settlement record
  const [processStatForm, setProcessStatForm] = useState({
    bank_account_id: '',
    reference_no: ''
  });

  // P2E Payslip Modal & State
  const [payslipModal, setPayslipModal] = useState(null); // null or { item, data }
  const [payslipLoadingId, setPayslipLoadingId] = useState(null);

  // P2F Form 16 Preparation State
  const [form16EmployeeId, setForm16EmployeeId] = useState('');
  const [form16TaxYear, setForm16TaxYear] = useState('2026-2027');
  const [form16Data, setForm16Data] = useState(null);
  const [form16Loading, setForm16Loading] = useState(false);

  // --- Handlers for P2C through P2G ---

  // P2C Match Handler
  const handleMatchSubmit = async (e) => {
    e.preventDefault();
    if (!reconcileForm.payroll_payment_item_id) {
      setBanner({ type: 'error', text: 'Please select a payroll payment item to match.' });
      return;
    }
    setModalSubmitting(true);
    const res = await matchPayrollBankTransaction(reconcileForm);
    setModalSubmitting(false);
    if (res.success) {
      setReconcileModalItem(null);
      setBanner({ type: 'success', text: 'Bank transaction matched successfully via match_payroll_bank_transaction_atomic.' });
    } else {
      setBanner({ type: 'error', text: res.error || 'Failed to match bank transaction.' });
    }
  };

  // P2C Unmatch Handler (Admin Only)
  const handleUnmatchSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      setBanner({ type: 'error', text: 'Unauthorized: Admin role required to unmatch bank transactions.' });
      return;
    }
    if (!unmatchReason?.trim()) {
      setBanner({ type: 'error', text: 'Reason is mandatory when unmatching a bank transaction.' });
      return;
    }
    if (!unmatchModalRec?.id) return;
    setModalSubmitting(true);
    const res = await unmatchPayrollBankTransaction(unmatchModalRec.id, unmatchReason);
    setModalSubmitting(false);
    if (res.success) {
      setUnmatchModalRec(null);
      setBanner({ type: 'success', text: 'Bank transaction unmatched successfully via unmatch_payroll_bank_transaction_atomic.' });
    } else {
      setBanner({ type: 'error', text: res.error || 'Failed to unmatch bank transaction.' });
    }
  };

  // P2D Statutory Export Handlers
  const handleGenerateStatExport = async (type) => {
    const periodId = selectedStatPeriodId || payrollPeriods[0]?.id;
    if (!periodId) {
      setBanner({ type: 'error', text: 'Please select a pay period for statutory export.' });
      return;
    }
    setStatExportLoading(true);
    const res = await generateStatutoryExport(periodId, type);
    setStatExportLoading(false);
    if (res.success && res.data) {
      downloadFile(res.data.content, res.data.file_name, res.data.mime_type);
      setBanner({
        type: 'success',
        text: `Generated ${type} export (${res.data.file_name}): ${res.data.employee_count || 0} employees, Total: ₹${parseFloat(res.data.total_amount || 0).toLocaleString('en-IN')}`
      });
    } else {
      setBanner({ type: 'error', text: res.error || `Failed to generate ${type} statutory export.` });
    }
  };

  const handleGeneratePfEcr = async () => {
    const periodId = selectedStatPeriodId || payrollPeriods[0]?.id;
    if (!periodId) {
      setBanner({ type: 'error', text: 'Please select a pay period.' });
      return;
    }
    setStatExportLoading(true);
    const res = await generatePfEcrExport(periodId);
    setStatExportLoading(false);
    if (res.success && res.data) {
      downloadFile(res.data.content, res.data.file_name, res.data.mime_type);
      setBanner({ type: 'success', text: `PF ECR file generated (${res.data.file_name}): ${res.data.employee_count || 0} employees, Total: ₹${parseFloat(res.data.total_amount || 0).toLocaleString('en-IN')}` });
    } else {
      setBanner({ type: 'error', text: res.error || 'Failed to generate PF ECR file.' });
    }
  };

  const handleGenerateEsi = async () => {
    const periodId = selectedStatPeriodId || payrollPeriods[0]?.id;
    if (!periodId) {
      setBanner({ type: 'error', text: 'Please select a pay period.' });
      return;
    }
    setStatExportLoading(true);
    const res = await generateEsiExport(periodId);
    setStatExportLoading(false);
    if (res.success && res.data) {
      downloadFile(res.data.content, res.data.file_name, res.data.mime_type);
      setBanner({ type: 'success', text: `ESI file generated (${res.data.file_name}): ${res.data.employee_count || 0} employees, Total: ₹${parseFloat(res.data.total_amount || 0).toLocaleString('en-IN')}` });
    } else {
      setBanner({ type: 'error', text: res.error || 'Failed to generate ESI file.' });
    }
  };

  // P2D Statutory Payment Processing Handler (Admin/Owner Only)
  const handleProcessStatPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      setBanner({ type: 'error', text: 'Unauthorized: Admin/Owner role required to process statutory payment.' });
      return;
    }
    if (!processStatForm.bank_account_id) {
      setBanner({ type: 'error', text: 'Please select a bank account.' });
      return;
    }
    if (!processStatModal?.id) return;
    setModalSubmitting(true);
    const res = await processStatutoryPayment(processStatModal.id, processStatForm.bank_account_id, processStatForm.reference_no);
    setModalSubmitting(false);
    if (res.success) {
      setProcessStatModal(null);
      setBanner({ type: 'success', text: 'Statutory settlement payment processed successfully via process_payroll_statutory_payment_atomic.' });
    } else {
      setBanner({ type: 'error', text: res.error || 'Failed to process statutory settlement payment.' });
    }
  };

  // P2E Payslip Generator
  const handleGeneratePayslip = async (runItem) => {
    if (!runItem?.id) return;
    setPayslipLoadingId(runItem.id);
    const res = await generatePayslip(runItem.id);
    setPayslipLoadingId(null);
    if (res.success && res.data) {
      setPayslipModal({ item: runItem, data: res.data });
    } else {
      setBanner({ type: 'error', text: res.error || 'Failed to generate payslip.' });
    }
  };

  // P2F Form 16 Preparation Generator
  const handleGenerateForm16 = async (e) => {
    e?.preventDefault();
    const targetEmpId = isManagementOrAdmin ? (form16EmployeeId || currentEmployee?.id || employees[0]?.id) : currentEmployee?.id;
    if (!targetEmpId) {
      setBanner({ type: 'error', text: 'Employee selection is required to generate Form 16 Preparation statement.' });
      return;
    }
    setForm16Loading(true);
    setForm16Data(null);
    const res = await generateForm16Preparation(targetEmpId, form16TaxYear || '2026-2027');
    setForm16Loading(false);
    if (res.success && res.data) {
      setForm16Data(res.data);
      setBanner({ type: 'success', text: 'Form 16 Preparation Statement generated successfully.' });
    } else {
      setBanner({ type: 'error', text: res.error || 'Failed to generate Form 16 preparation statement.' });
    }
  };

  const [createRunForm, setCreateRunForm] = useState({
    payroll_period_id: '',
    run_type: 'regular',
    notes: ''
  });

  const [mappingForm, setMappingForm] = useState({
    mapping_key: '',
    account_id: '',
    description: ''
  });

  // Legacy calculating status compatibility
  const calculatingRunId = actionLoadingRunId;

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
  const handleCreatePayrollRun = async (e) => {
    e.preventDefault();
    if (!createRunForm.payroll_period_id) {
      setBanner({ type: 'error', text: 'Please select a pay period.' });
      return;
    }
    setModalSubmitting(true);
    const res = await createPayrollRun(createRunForm);
    setModalSubmitting(false);
    if (res.success) {
      setCreateRunModal(false);
      setBanner({ type: 'success', text: 'Payroll run created successfully via create_payroll_run_atomic.' });
    } else {
      setBanner({ type: 'error', text: res.error || 'Failed to create payroll run.' });
    }
  };

  const handleCalculateRun = async (runId) => {
    setActionLoadingRunId(runId);
    setBanner(null);
    const res = await calculatePayrollRun(runId);
    setActionLoadingRunId(null);
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

  const handleSubmitForApproval = async (runId) => {
    setActionLoadingRunId(runId);
    setBanner(null);
    const res = await submitPayrollRunForApproval(runId);
    setActionLoadingRunId(null);
    if (res.success) {
      setBanner({ type: 'success', text: 'Payroll run submitted for approval via submit_payroll_run_for_approval_atomic.' });
    } else {
      setBanner({ type: 'error', text: res.error || 'Failed to submit payroll run for approval.' });
    }
  };

  const handleApproveRun = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      setBanner({ type: 'error', text: 'Unauthorized: Admin role required to approve payroll run.' });
      return;
    }
    if (!approveModalRunId) return;
    setActionLoadingRunId(approveModalRunId);
    setBanner(null);
    const res = await approvePayrollRun(approveModalRunId, approveComments);
    setActionLoadingRunId(null);
    setApproveModalRunId(null);
    if (res.success) {
      setBanner({ type: 'success', text: 'Payroll run approved successfully via approve_payroll_run_atomic.' });
    } else {
      setBanner({ type: 'error', text: res.error || 'Failed to approve payroll run.' });
    }
  };

  const handleFinalizeRun = async (runId) => {
    setActionLoadingRunId(runId);
    setBanner(null);
    const res = await finalizePayrollRunWithAccounting(runId);
    setActionLoadingRunId(null);
    if (res.success) {
      setBanner({ type: 'success', text: 'Payroll run finalized & GL accounting entries posted via finalize_payroll_run_with_accounting_atomic.' });
    } else {
      setBanner({ type: 'error', text: res.error || 'Failed to finalize payroll run with accounting.' });
    }
  };

  // P2A Payment Batch Handlers
  const handleCreatePaymentBatch = async (e) => {
    e.preventDefault();
    if (!createPaymentBatchModal?.id || !paymentBatchForm.bank_account_id) {
      setBanner({ type: 'error', text: 'Please select a Bank Account for salary disbursement.' });
      return;
    }
    setModalSubmitting(true);
    const res = await createPayrollPaymentBatch({
      payroll_run_id: createPaymentBatchModal.id,
      bank_account_id: paymentBatchForm.bank_account_id,
      payment_date: paymentBatchForm.payment_date,
      notes: paymentBatchForm.notes
    });
    setModalSubmitting(false);
    if (res.success) {
      setCreatePaymentBatchModal(null);
      setBanner({ type: 'success', text: 'Salary Payment Batch created successfully via create_payroll_payment_batch_atomic.' });
      setActiveTab('payments');
    } else {
      setBanner({ type: 'error', text: res.error || 'Failed to create payment batch.' });
    }
  };

  const handleSubmitPaymentBatchForApproval = async (batchId) => {
    setActionLoadingRunId(batchId);
    setBanner(null);
    const res = await submitPayrollPaymentBatchForApproval(batchId);
    setActionLoadingRunId(null);
    if (res.success) {
      setBanner({ type: 'success', text: 'Payment batch submitted for approval via submit_payroll_payment_batch_for_approval_atomic.' });
    } else {
      setBanner({ type: 'error', text: res.error || 'Failed to submit payment batch for approval.' });
    }
  };

  const handleApprovePaymentBatch = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      setBanner({ type: 'error', text: 'Unauthorized: Admin role required to approve payment batch.' });
      return;
    }
    if (!approvePaymentBatchModalId) return;
    setActionLoadingRunId(approvePaymentBatchModalId);
    setBanner(null);
    const res = await approvePayrollPaymentBatch(approvePaymentBatchModalId, paymentBatchComments);
    setActionLoadingRunId(null);
    setApprovePaymentBatchModalId(null);
    if (res.success) {
      setBanner({ type: 'success', text: 'Payment batch approved successfully via approve_payroll_payment_batch_atomic.' });
    } else {
      setBanner({ type: 'error', text: res.error || 'Failed to approve payment batch.' });
    }
  };

  const handleProcessPaymentBatch = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      setBanner({ type: 'error', text: 'Unauthorized: Admin role required to disburse salary payment batch.' });
      return;
    }
    if (!processPaymentBatchModalId) return;
    setActionLoadingRunId(processPaymentBatchModalId);
    setBanner(null);
    const res = await processPayrollPaymentBatch(processPaymentBatchModalId, paymentBankReference);
    setActionLoadingRunId(null);
    setProcessPaymentBatchModalId(null);
    if (res.success) {
      setBanner({ type: 'success', text: 'Salary payment batch processed & disbursed via process_payroll_payment_batch_atomic.' });
    } else {
      setBanner({ type: 'error', text: res.error || 'Failed to process payment batch.' });
    }
  };

  const handleCancelPaymentBatch = async (e) => {
    e.preventDefault();
    if (!cancelPaymentBatchModalId) return;
    setActionLoadingRunId(cancelPaymentBatchModalId);
    setBanner(null);
    const res = await cancelPayrollPaymentBatch(cancelPaymentBatchModalId, paymentCancelReason);
    setActionLoadingRunId(null);
    setCancelPaymentBatchModalId(null);
    if (res.success) {
      setBanner({ type: 'success', text: 'Payment batch cancelled successfully via cancel_payroll_payment_batch_atomic.' });
    } else {
      setBanner({ type: 'error', text: res.error || 'Failed to cancel payment batch.' });
    }
  };

  // P2B Bank File Handlers
  const handleSaveBankFileProfile = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      setBanner({ type: 'error', text: 'Unauthorized: Admin/Owner role required to configure bank file profiles.' });
      return;
    }
    if (!bankFileProfileForm.profile_code || !bankFileProfileForm.bank_name) {
      setBanner({ type: 'error', text: 'Profile Code and Bank Name are required.' });
      return;
    }
    setModalSubmitting(true);
    const res = await upsertBankFileProfile({
      id: bankFileProfileModal?.id,
      ...bankFileProfileForm
    });
    setModalSubmitting(false);
    if (res.success) {
      setBankFileProfileModal(null);
      setBanner({ type: 'success', text: `Bank File Profile '${bankFileProfileForm.profile_code}' saved successfully via upsert_payroll_bank_file_profile_atomic.` });
    } else {
      setBanner({ type: 'error', text: res.error || 'Failed to save bank file profile.' });
    }
  };

  const handleGenerateBankFileSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      setBanner({ type: 'error', text: 'Unauthorized: Admin/Owner role required to generate bank files.' });
      return;
    }
    if (!generateBankFileModalBatch?.id || !selectedBankProfileId) {
      setBanner({ type: 'error', text: 'Please select a Bank File Profile.' });
      return;
    }
    setModalSubmitting(true);
    setBanner(null);
    const res = await generateBankFile(generateBankFileModalBatch.id, selectedBankProfileId);
    setModalSubmitting(false);

    if (res.success && res.data) {
      const data = res.data;
      // Trigger Browser Download using returned content, file_name, and mime_type
      if (data.content) {
        const blob = new Blob([data.content], { type: data.mime_type || 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.file_name || `bank_file_${generateBankFileModalBatch.id.slice(0, 8)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }

      setGenerateBankFileModalBatch(null);
      setBanner({
        type: 'success',
        text: `Bank File generated & downloaded! Hash: ${data.file_hash || 'N/A'}, Employees: ${data.employee_count || 0}, Total Amount: ₹${parseFloat(data.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}, Gen #: ${data.generation_number || 1}`
      });
    } else {
      setBanner({ type: 'error', text: res.error || 'Failed to generate bank file.' });
    }
  };

  const handleRecordBankFileSubmissionSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      setBanner({ type: 'error', text: 'Unauthorized: Admin/Owner role required to mark bank file submitted.' });
      return;
    }
    if (!submitBankFileModalId) return;
    setModalSubmitting(true);
    const res = await recordBankFileSubmission(submitBankFileModalId, bankFileSubmitExternalRef);
    setModalSubmitting(false);
    if (res.success) {
      setSubmitBankFileModalId(null);
      setBanner({ type: 'success', text: 'Bank File marked as Submitted via record_payroll_bank_file_submission_atomic.' });
    } else {
      setBanner({ type: 'error', text: res.error || 'Failed to record bank file submission.' });
    }
  };

  const handleRecordBankFileResultSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      setBanner({ type: 'error', text: 'Unauthorized: Admin/Owner role required to record bank file result.' });
      return;
    }
    if (!resultBankFileModalId || !bankFileResultStatus) return;
    if (bankFileResultStatus === 'rejected' && !bankFileResultRejectionReason.trim()) {
      setBanner({ type: 'error', text: 'Rejection reason is mandatory when recording a rejected bank result.' });
      return;
    }
    setModalSubmitting(true);
    const res = await recordBankFileResult(
      resultBankFileModalId,
      bankFileResultStatus,
      bankFileResultExternalRef,
      bankFileResultRejectionReason
    );
    setModalSubmitting(false);
    if (res.success) {
      setResultBankFileModalId(null);
      setBanner({ type: 'success', text: `Bank File result recorded as '${bankFileResultStatus.toUpperCase()}' via record_payroll_bank_file_result_atomic.` });
    } else {
      setBanner({ type: 'error', text: res.error || 'Failed to record bank file result.' });
    }
  };

  const handleSaveAccountMapping = async (e) => {
    e.preventDefault();
    if (!mappingForm.mapping_key || !mappingForm.account_id) {
      setBanner({ type: 'error', text: 'Mapping Key and Account ID are required.' });
      return;
    }
    setModalSubmitting(true);
    const res = await upsertPayrollAccountMapping(mappingForm);
    setModalSubmitting(false);
    if (res.success) {
      setMappingModal(null);
      setBanner({ type: 'success', text: `Payroll GL Account Mapping '${mappingForm.mapping_key}' saved via upsert_payroll_account_mapping_atomic.` });
    } else {
      setBanner({ type: 'error', text: res.error || 'Failed to update payroll account mapping.' });
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

  // Helper to safely extract values from flat or nested integrity RPC response keys
  const getIntegrityVal = (data, ...keys) => {
    if (!data) return undefined;
    for (const k of keys) {
      const parts = k.split('.');
      let val = data;
      for (const p of parts) {
        if (val === null || val === undefined) break;
        val = val[p];
      }
      if (val !== undefined && val !== null) return val;
    }
    return undefined;
  };

  const formatIntegrityVal = (val, type = 'text') => {
    if (val === null || val === undefined || val === '') return 'Unavailable';
    if (type === 'currency') {
      const num = Number(val);
      if (isNaN(num)) return 'Unavailable';
      return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (type === 'badge') {
      if (typeof val === 'boolean') {
        return val ? (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            PASSED / RECONCILED
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            UNBALANCED / MISMATCH
          </span>
        );
      }
      const str = String(val).toUpperCase();
      if (['PASSED', 'RECONCILED', 'BALANCED', 'POSTED', 'MATCHED', 'PROCESSED', 'COMPLETED', 'APPROVED', 'FINALIZED', 'PAID', 'TRUE'].includes(str)) {
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {str}
          </span>
        );
      }
      if (['FAILED', 'UNBALANCED', 'MISMATCH', 'REJECTED', 'FALSE'].includes(str)) {
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            {str}
          </span>
        );
      }
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          {str}
        </span>
      );
    }
    return String(val);
  };

  const renderPayrollIntegritySection = () => {
    const currentRunId = selectedPayrollRunId || payrollRuns[0]?.id || '';
    const activeRunObj = payrollRuns.find(r => r.id === currentRunId);

    const valRunStatus = getIntegrityVal(payrollIntegrity, 'payroll_run_status', 'run_status', 'payroll.status', 'status') ?? activeRunObj?.status;
    const valNetPay = getIntegrityVal(payrollIntegrity, 'net_pay', 'total_net_pay', 'payroll.net_pay', 'payroll_net_pay') ?? activeRunObj?.total_net_pay;
    const valJournalStatus = getIntegrityVal(payrollIntegrity, 'accounting_journal_status', 'journal_status', 'journal.status');
    const valJournalDebit = getIntegrityVal(payrollIntegrity, 'journal_debit', 'total_debit', 'journal.debit', 'journal.total_debit');
    const valJournalCredit = getIntegrityVal(payrollIntegrity, 'journal_credit', 'total_credit', 'journal.credit', 'journal.total_credit');
    const valJournalBalanced = getIntegrityVal(payrollIntegrity, 'journal_balanced', 'is_journal_balanced', 'journal.is_balanced', 'journal.balanced');
    const valPaymentBatchStatus = getIntegrityVal(payrollIntegrity, 'payment_batch_status', 'batch_status', 'payment_batch.status');
    const valPaymentBatchTotal = getIntegrityVal(payrollIntegrity, 'payment_batch_total', 'batch_total', 'payment_batch.total_amount', 'payment_batch.total');
    const valPaymentItemsTotal = getIntegrityVal(payrollIntegrity, 'payment_items_total', 'items_total', 'payment_batch.items_total');
    const valBankTxCount = getIntegrityVal(payrollIntegrity, 'bank_transaction_count', 'transaction_count', 'reconciliation.bank_transaction_count');
    const valReconciliationCount = getIntegrityVal(payrollIntegrity, 'reconciliation_count', 'reconciled_count', 'reconciliation.count');
    const valMatchedAmount = getIntegrityVal(payrollIntegrity, 'matched_amount', 'total_matched_amount', 'reconciliation.matched_amount');
    const valPayMatchesPayroll = getIntegrityVal(payrollIntegrity, 'payment_total_matches_payroll', 'payment_matches_payroll', 'integrity.payment_matches_payroll');
    const valFullyReconciled = getIntegrityVal(payrollIntegrity, 'fully_reconciled', 'is_fully_reconciled', 'integrity.fully_reconciled');
    const valOverallIntegrity = getIntegrityVal(payrollIntegrity, 'overall_e2e_integrity', 'overall_integrity', 'is_overall_integrity', 'overall_reconciled');

    return (
      <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-4 text-slate-100 my-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <ShieldCheck size={18} className="text-teal-400" />
            <h3 className="text-sm font-bold text-slate-200">Accounting & Payment E2E Integrity</h3>
            <span className="text-[10px] font-mono bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded-full border border-teal-500/20">
              RPC AUTHORITATIVE
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Payroll Run:</span>
              <select
                value={currentRunId}
                onChange={(e) => {
                  if (setSelectedPayrollRunId) setSelectedPayrollRunId(e.target.value);
                }}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-blue-500 font-mono"
              >
                {payrollRuns.length === 0 && <option value="">No Payroll Runs Available</option>}
                {payrollRuns.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.run_type ? r.run_type.toUpperCase() : 'RUN'} — {r.id.slice(0, 8)} ({r.status || 'draft'})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Overall E2E Integrity:</span>
              {formatIntegrityVal(valOverallIntegrity, 'badge')}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Section 1: Payroll Run Overview */}
          <div className="p-4 bg-slate-950/60 border border-slate-800/60 rounded-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
              <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                <Users size={14} /> 1. Payroll Run
              </span>
              {formatIntegrityVal(valRunStatus, 'badge')}
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Payroll Run Status:</span>
                <span className="font-semibold text-slate-200">{formatIntegrityVal(valRunStatus, 'text')}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Net Pay:</span>
                <span className="font-mono font-bold text-slate-100">{formatIntegrityVal(valNetPay, 'currency')}</span>
              </div>
            </div>
          </div>

          {/* Section 2: General Ledger Accounting */}
          <div className="p-4 bg-slate-950/60 border border-slate-800/60 rounded-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
              <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                <FileText size={14} /> 2. GL Accounting
              </span>
              {formatIntegrityVal(valJournalBalanced, 'badge')}
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Accounting Journal Status:</span>
                <span className="font-semibold text-slate-200">{formatIntegrityVal(valJournalStatus, 'text')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Journal Debit:</span>
                <span className="font-mono font-bold text-slate-100">{formatIntegrityVal(valJournalDebit, 'currency')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Journal Credit:</span>
                <span className="font-mono font-bold text-slate-100">{formatIntegrityVal(valJournalCredit, 'currency')}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Journal Balanced:</span>
                {formatIntegrityVal(valJournalBalanced, 'badge')}
              </div>
            </div>
          </div>

          {/* Section 3: Payment Processing */}
          <div className="p-4 bg-slate-950/60 border border-slate-800/60 rounded-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Banknote size={14} /> 3. Payment Batch
              </span>
              {formatIntegrityVal(valPaymentBatchStatus, 'badge')}
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Payment Batch Status:</span>
                <span className="font-semibold text-slate-200">{formatIntegrityVal(valPaymentBatchStatus, 'text')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Payment Batch Total:</span>
                <span className="font-mono font-bold text-slate-100">{formatIntegrityVal(valPaymentBatchTotal, 'currency')}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Payment Items Total:</span>
                <span className="font-mono font-bold text-slate-100">{formatIntegrityVal(valPaymentItemsTotal, 'currency')}</span>
              </div>
            </div>
          </div>

          {/* Section 4: Bank Reconciliation */}
          <div className="p-4 bg-slate-950/60 border border-slate-800/60 rounded-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <RefreshCw size={14} /> 4. Bank Reconciliation
              </span>
              {formatIntegrityVal(valFullyReconciled, 'badge')}
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Bank Tx Count:</span>
                <span className="font-mono font-bold text-slate-200">{formatIntegrityVal(valBankTxCount, 'text')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Reconciliation Count:</span>
                <span className="font-mono font-bold text-slate-200">{formatIntegrityVal(valReconciliationCount, 'text')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Matched Amount:</span>
                <span className="font-mono font-bold text-slate-100">{formatIntegrityVal(valMatchedAmount, 'currency')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Payment Matches Payroll:</span>
                {formatIntegrityVal(valPayMatchesPayroll, 'badge')}
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Fully Reconciled:</span>
                {formatIntegrityVal(valFullyReconciled, 'badge')}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
          onClick={() => setActiveTab('dashboard')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 size={14} /> Executive Dashboard
        </button>
        <button
          onClick={() => setActiveTab('runs')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'runs'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Banknote size={14} /> Payroll Runs ({payrollRuns.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'payments'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Banknote size={14} /> Payment Batches ({payrollPaymentBatches.length})
        </button>
        <button
          onClick={() => setActiveTab('reconciliation')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'reconciliation'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <RefreshCw size={14} /> Bank Reconciliation ({payrollBankReconciliations.length})
        </button>
        <button
          onClick={() => setActiveTab('statutory')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'statutory'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck size={14} /> Statutory & Settlements ({payrollStatutorySettlements.length})
        </button>
        <button
          onClick={() => setActiveTab('form16')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'form16'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileCode size={14} /> Form 16 Preparation
        </button>
        <button
          onClick={() => setActiveTab('structures')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'structures'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calculator size={14} /> Salary Structures ({employeeSalaryStructures.length})
        </button>
        <button
          onClick={() => setActiveTab('components')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'components'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers size={14} /> Components ({payrollComponents.length})
        </button>
        <button
          onClick={() => setActiveTab('declarations')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'declarations'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText size={14} /> Tax Declarations ({taxDeclarations.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Settings size={14} /> Settings
        </button>
      </div>

      {/* Tab 0: P2G Executive Payroll Dashboard */}
      {activeTab === 'dashboard' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <BarChart3 size={18} className="text-sky-500" />
                P2G Executive Payroll Dashboard Summary
              </h3>
              <p className="text-xs text-slate-400">
                Authorized financial summary for {activeOperatingCompany?.name || 'All Operating Companies'}. Complete P2C-P2G lifecycle KPIs.
              </p>
            </div>
            <button
              onClick={() => fetchDashboardSummary(activeOperatingCompany?.id)}
              className="os-secondary text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={13} /> Refresh Summary
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            {/* Card 1: Payroll Runs */}
            <div className="os-card p-4 space-y-2 border-l-4 border-l-sky-500">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[10px] font-black uppercase tracking-wider">Payroll Runs</span>
                <Banknote size={16} className="text-sky-500" />
              </div>
              <div className="text-2xl font-black font-mono">
                {payrollDashboardSummary?.total_payroll_runs ?? payrollRuns.length}
              </div>
              <div className="text-[10px] text-slate-400">Total Runs Initiated</div>
              <button
                onClick={() => setActiveTab('runs')}
                className="mt-2 text-[11px] font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1 hover:underline cursor-pointer"
              >
                View Runs <ArrowUpRight size={12} />
              </button>
            </div>

            {/* Card 2: Total Gross Payroll */}
            <div className="os-card p-4 space-y-2 border-l-4 border-l-emerald-500">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[10px] font-black uppercase tracking-wider">Total Gross Payroll</span>
                <DollarSign size={16} className="text-emerald-500" />
              </div>
              <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                ₹{parseFloat(payrollDashboardSummary?.total_gross_payroll ?? payrollRunItems.reduce((acc, i) => acc + (parseFloat(i.gross_earnings) || 0), 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-400">Cumulative Gross Earnings</div>
              <button
                onClick={() => setActiveTab('runs')}
                className="mt-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline cursor-pointer"
              >
                Inspect Gross <ArrowUpRight size={12} />
              </button>
            </div>

            {/* Card 3: Total Net Payroll */}
            <div className="os-card p-4 space-y-2 border-l-4 border-l-purple-500">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[10px] font-black uppercase tracking-wider">Total Net Payroll</span>
                <Calculator size={16} className="text-purple-500" />
              </div>
              <div className="text-xl font-black font-mono text-purple-600 dark:text-purple-400">
                ₹{parseFloat(payrollDashboardSummary?.total_net_payroll ?? payrollRunItems.reduce((acc, i) => acc + (parseFloat(i.net_pay) || 0), 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-400">Cumulative Net Pay Payable</div>
              <button
                onClick={() => setActiveTab('runs')}
                className="mt-2 text-[11px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 hover:underline cursor-pointer"
              >
                Inspect Net <ArrowUpRight size={12} />
              </button>
            </div>

            {/* Card 4: Payroll Paid */}
            <div className="os-card p-4 space-y-2 border-l-4 border-l-indigo-500">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[10px] font-black uppercase tracking-wider">Payroll Paid</span>
                <CheckCircle2 size={16} className="text-indigo-500" />
              </div>
              <div className="text-xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                ₹{parseFloat(payrollDashboardSummary?.total_payroll_paid ?? payrollPaymentBatches.filter(b => b.status === 'processed').reduce((acc, b) => acc + (parseFloat(b.total_amount) || 0), 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-400">Processed Payment Batches</div>
              <button
                onClick={() => setActiveTab('payments')}
                className="mt-2 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline cursor-pointer"
              >
                View Disbursed <ArrowUpRight size={12} />
              </button>
            </div>

            {/* Card 5: Payroll Pending Approval */}
            <div className="os-card p-4 space-y-2 border-l-4 border-l-amber-500">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[10px] font-black uppercase tracking-wider">Pending Approval</span>
                <Clock3 size={16} className="text-amber-500" />
              </div>
              <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
                {payrollDashboardSummary?.payroll_pending_approval ?? payrollRuns.filter(r => ['pending_approval', 'under_review'].includes(r.status)).length}
              </div>
              <div className="text-[10px] text-slate-400">Awaiting Admin Approval</div>
              <button
                onClick={() => setActiveTab('runs')}
                className="mt-2 text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 hover:underline cursor-pointer"
              >
                Approve Runs <ArrowUpRight size={12} />
              </button>
            </div>

            {/* Card 6: Employer Contributions */}
            <div className="os-card p-4 space-y-2 border-l-4 border-l-teal-500">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[10px] font-black uppercase tracking-wider">Employer Share</span>
                <Building size={16} className="text-teal-500" />
              </div>
              <div className="text-xl font-black font-mono text-teal-600 dark:text-teal-400">
                ₹{parseFloat(payrollDashboardSummary?.employer_contributions ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-400">PF & ESI Employer Share</div>
              <button
                onClick={() => setActiveTab('statutory')}
                className="mt-2 text-[11px] font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 hover:underline cursor-pointer"
              >
                View Statutory <ArrowUpRight size={12} />
              </button>
            </div>

            {/* Card 7: TDS Deducted */}
            <div className="os-card p-4 space-y-2 border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[10px] font-black uppercase tracking-wider">TDS Deducted</span>
                <FileSpreadsheet size={16} className="text-blue-500" />
              </div>
              <div className="text-xl font-black font-mono text-blue-600 dark:text-blue-400">
                ₹{parseFloat(payrollDashboardSummary?.tds_deducted ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-400">Total Tax Deducted at Source</div>
              <button
                onClick={() => setActiveTab('form16')}
                className="mt-2 text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline cursor-pointer"
              >
                Form 16 TDS <ArrowUpRight size={12} />
              </button>
            </div>

            {/* Card 8: Statutory Outstanding */}
            <div className="os-card p-4 space-y-2 border-l-4 border-l-rose-500">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[10px] font-black uppercase tracking-wider">Statutory Due</span>
                <ShieldCheck size={16} className="text-rose-500" />
              </div>
              <div className="text-xl font-black font-mono text-rose-600 dark:text-rose-400">
                ₹{parseFloat(payrollDashboardSummary?.statutory_outstanding ?? payrollStatutorySettlements.filter(s => s.payment_status === 'pending').reduce((acc, s) => acc + (parseFloat(s.payable_amount) || 0), 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-400">Unsettled Statutory Dues</div>
              <button
                onClick={() => setActiveTab('statutory')}
                className="mt-2 text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 hover:underline cursor-pointer"
              >
                Pay Statutory <ArrowUpRight size={12} />
              </button>
            </div>

            {/* Card 9: Payroll Failures */}
            <div className="os-card p-4 space-y-2 border-l-4 border-l-amber-600">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[10px] font-black uppercase tracking-wider">Payroll Failures</span>
                <XCircle size={16} className="text-amber-600" />
              </div>
              <div className="text-2xl font-black font-mono text-amber-700 dark:text-amber-400">
                {payrollDashboardSummary?.payroll_failures ?? 0}
              </div>
              <div className="text-[10px] text-slate-400">Failed Disbursal Items</div>
              <button
                onClick={() => setActiveTab('payments')}
                className="mt-2 text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 hover:underline cursor-pointer"
              >
                Inspect Batches <ArrowUpRight size={12} />
              </button>
            </div>

            {/* Card 10: Bank Reconciliation Exceptions */}
            <div className="os-card p-4 space-y-2 border-l-4 border-l-orange-500">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[10px] font-black uppercase tracking-wider">Reconcile Exceptions</span>
                <AlertCircle size={16} className="text-orange-500" />
              </div>
              <div className="text-2xl font-black font-mono text-orange-600 dark:text-orange-400">
                {payrollDashboardSummary?.bank_reconciliation_exceptions ?? payrollBankReconciliations.filter(r => ['exception', 'failed'].includes(r.status)).length}
              </div>
              <div className="text-[10px] text-slate-400">Unresolved Bank Exceptions</div>
              <button
                onClick={() => setActiveTab('reconciliation')}
                className="mt-2 text-[11px] font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1 hover:underline cursor-pointer"
              >
                Reconcile Exceptions <ArrowUpRight size={12} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Payroll Runs & Periods */}
      {activeTab === 'runs' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Payroll Periods & Server Execution Runs</h3>
              <p className="text-xs text-slate-400">Manage monthly pay periods and execute server-side payroll calculations for {activeOperatingCompany?.name || 'Operating Company'}</p>
            </div>
            {isManagementOrAdmin && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCreateRunForm({
                      payroll_period_id: payrollPeriods[0]?.id || '',
                      run_type: 'regular',
                      notes: ''
                    });
                    setCreateRunModal(true);
                  }}
                  className="os-secondary flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <Plus size={14} /> Create Payroll Run
                </button>
                <button onClick={() => { setPeriodForm({ period_code: `PRD-${new Date().getFullYear()}-${new Date().getMonth() + 1}`, period_name: `Pay Period ${new Date().toLocaleDateString('default', { month: 'short', year: 'numeric' })}`, pay_date: new Date().toISOString().split('T')[0] }); setPeriodModal(true); }} className="os-primary flex items-center gap-1.5 cursor-pointer text-xs">
                  <Plus size={14} /> Create Pay Period
                </button>
              </div>
            )}
          </div>

          {renderPayrollIntegritySection()}

          {/* Payroll Execution Runs Section */}
          <div className="os-card overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-200">Payroll Execution Runs (`payroll_runs`)</span>
                <p className="text-[11px] text-slate-400">Lifecycle: Draft → Calculated → Pending Approval → Approved → Posted</p>
              </div>
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
                    <th className="px-4 py-3">Lifecycle State</th>
                    <th className="px-4 py-3">Created Date</th>
                    {isManagementOrAdmin && <th className="px-4 py-3 text-right">Server Execution Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {payrollRuns.map(run => {
                    const period = payrollPeriods.find(p => p.id === run.payroll_period_id);
                    const status = (run.status || 'draft').toLowerCase();
                    const isExecuting = actionLoadingRunId === run.id;

                    let statusBadgeClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
                    let statusLabel = 'Draft';

                    if (status === 'calculated') {
                      statusBadgeClass = 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200 dark:border-sky-800';
                      statusLabel = 'Calculated';
                    } else if (['pending_approval', 'under_review'].includes(status)) {
                      statusBadgeClass = 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
                      statusLabel = 'Pending Approval';
                    } else if (status === 'approved') {
                      statusBadgeClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
                      statusLabel = 'Approved';
                    } else if (['posted', 'finalized'].includes(status)) {
                      statusBadgeClass = 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800';
                      statusLabel = 'Posted';
                    }

                    const stepIndex = ['draft', 'pending'].includes(status) ? 1 :
                                      status === 'calculated' ? 2 :
                                      ['pending_approval', 'under_review'].includes(status) ? 3 :
                                      status === 'approved' ? 4 : 5;

                    return (
                      <tr key={run.id} className="border-b border-slate-100 dark:border-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                        <td className="px-4 py-3 font-mono font-bold text-sky-600 dark:text-sky-400">
                          {run.id?.slice(0, 8)}...
                          {run.run_type && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-sans uppercase font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-500">
                              {run.run_type}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-semibold">{period?.period_name || period?.period_code || 'Pay Period'}</td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${statusBadgeClass}`}>
                              {statusLabel}
                            </span>
                            <div className="flex items-center gap-1 text-[9px] text-slate-400 font-medium">
                              <span className={stepIndex >= 1 ? 'text-slate-700 dark:text-slate-200 font-bold' : ''}>Draft</span>
                              <span>→</span>
                              <span className={stepIndex >= 2 ? 'text-sky-600 dark:text-sky-400 font-bold' : ''}>Calculated</span>
                              <span>→</span>
                              <span className={stepIndex >= 3 ? 'text-amber-600 dark:text-amber-400 font-bold' : ''}>Pending</span>
                              <span>→</span>
                              <span className={stepIndex >= 4 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>Approved</span>
                              <span>→</span>
                              <span className={stepIndex >= 5 ? 'text-purple-600 dark:text-purple-400 font-bold' : ''}>Posted</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-400">{run.created_at ? new Date(run.created_at).toLocaleDateString() : 'N/A'}</td>
                        {isManagementOrAdmin && (
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {['draft', 'pending'].includes(status) && (
                                <button
                                  onClick={() => handleCalculateRun(run.id)}
                                  disabled={isExecuting}
                                  className="os-primary text-xs px-2.5 py-1 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                  <Calculator size={13} />
                                  {isExecuting ? 'Calculating...' : 'Calculate Payroll'}
                                </button>
                              )}

                              {status === 'calculated' && (
                                <>
                                  <button
                                    onClick={() => handleCalculateRun(run.id)}
                                    disabled={isExecuting}
                                    className="os-secondary text-xs px-2 py-1 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                    title="Recalculate Payroll"
                                  >
                                    <Calculator size={12} /> Recalc
                                  </button>
                                  <button
                                    onClick={() => handleSubmitForApproval(run.id)}
                                    disabled={isExecuting}
                                    className="os-primary text-xs px-2.5 py-1 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 bg-indigo-600 hover:bg-indigo-500"
                                  >
                                    <Send size={13} />
                                    {isExecuting ? 'Submitting...' : 'Submit for Approval'}
                                  </button>
                                </>
                              )}

                              {['pending_approval', 'under_review'].includes(status) && (
                                isAdmin ? (
                                  <button
                                    onClick={() => { setApproveComments(''); setApproveModalRunId(run.id); }}
                                    disabled={isExecuting}
                                    className="os-primary text-xs px-2.5 py-1 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 bg-amber-600 hover:bg-amber-500"
                                  >
                                    <CheckCircle2 size={13} />
                                    {isExecuting ? 'Processing...' : 'Approve Payroll'}
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase italic flex items-center justify-end gap-1">
                                    <Lock size={12} /> Pending Admin Approval
                                  </span>
                                )
                              )}

                              {status === 'approved' && (
                                <button
                                  onClick={() => handleFinalizeRun(run.id)}
                                  disabled={isExecuting}
                                  className="os-primary text-xs px-2.5 py-1 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 bg-emerald-600 hover:bg-emerald-500"
                                >
                                  <ShieldCheck size={13} />
                                  {isExecuting ? 'Posting...' : 'Finalize & Post Accounting'}
                                </button>
                              )}

                              {['posted', 'finalized'].includes(status) && (
                                <div className="flex items-center justify-end gap-2">
                                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase flex items-center justify-end gap-1">
                                    <CheckCircle2 size={12} /> Posted
                                  </span>
                                  <button
                                    onClick={() => {
                                      const defaultBank = accounts.find(a => (a.account_type || '').toUpperCase() === 'ASSET' && ((a.account_subtype || '').toLowerCase().includes('bank') || (a.account_name || '').toLowerCase().includes('bank')))?.id || accounts[0]?.id || '';
                                      setPaymentBatchForm({ bank_account_id: defaultBank, payment_date: new Date().toISOString().split('T')[0], notes: '' });
                                      setCreatePaymentBatchModal(run);
                                    }}
                                    disabled={isExecuting}
                                    className="os-primary text-xs px-2 py-1 flex items-center gap-1 cursor-pointer bg-sky-600 hover:bg-sky-500"
                                  >
                                    <Banknote size={12} /> Create Payment Batch
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {payrollRuns.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-xs italic text-slate-400">
                        No active payroll runs found. Click "Create Payroll Run" above to initialize a run for a pay period.
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
                    <th className="px-4 py-3 text-right">Payslip Action</th>
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
                        <td className="px-4 py-3 text-right">
                          {(isManagementOrAdmin || (currentEmployee && item.employee_id === currentEmployee.id)) ? (
                            <button
                              onClick={() => handleGeneratePayslip(item)}
                              disabled={payslipLoadingId === item.id}
                              className="os-secondary text-xs px-2 py-1 flex items-center gap-1 cursor-pointer ml-auto disabled:opacity-50"
                            >
                              <FileText size={12} className="text-sky-500" />
                              {payslipLoadingId === item.id ? 'Generating...' : 'Payslip'}
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Restricted</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {payrollRunItems.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-xs italic text-slate-400">
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

      {/* Tab 1b: Salary Payment Batches */}
      {activeTab === 'payments' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Salary Payment Batches & Disbursements</h3>
              <p className="text-xs text-slate-400">Lifecycle: Posted Payroll → Create Payment Batch → Pending Approval → Approved → Process/Pay → Paid</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300">
              {payrollPaymentBatches.length} Total Payment Batches
            </span>
          </div>

          {/* Batches Table */}
          <div className="os-card overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-200">
                Payment Batches (`payroll_payment_batches`)
              </span>
              <span className="text-[10px] text-slate-400">Company: {activeOperatingCompany?.name || 'Operating Company'}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase text-slate-400">
                    <th className="px-4 py-3">Batch ID / Date</th>
                    <th className="px-4 py-3">Source Run</th>
                    <th className="px-4 py-3">Bank Account</th>
                    <th className="px-4 py-3 text-right">Employees</th>
                    <th className="px-4 py-3 text-right">Total Net Amount</th>
                    <th className="px-4 py-3">Payment Status</th>
                    <th className="px-4 py-3">Bank Ref / Transaction ID</th>
                    {isManagementOrAdmin && <th className="px-4 py-3 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {payrollPaymentBatches.map(batch => {
                    const bankAcc = accounts.find(a => a.id === batch.bank_account_id);
                    const bStatus = (batch.status || 'draft').toLowerCase();
                    const isExecuting = actionLoadingRunId === batch.id;

                    let statusBadgeClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
                    let statusLabel = 'Draft Batch';

                    if (['pending_approval', 'submitted'].includes(bStatus)) {
                      statusBadgeClass = 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
                      statusLabel = 'Pending Approval';
                    } else if (bStatus === 'approved') {
                      statusBadgeClass = 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200 dark:border-sky-800';
                      statusLabel = 'Approved';
                    } else if (['processing', 'paid', 'disbursed'].includes(bStatus)) {
                      statusBadgeClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
                      statusLabel = 'Paid & Disbursed';
                    } else if (bStatus === 'cancelled') {
                      statusBadgeClass = 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800';
                      statusLabel = 'Cancelled';
                    }

                    return (
                      <tr key={batch.id} className="border-b border-slate-100 dark:border-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                        <td className="px-4 py-3 font-mono font-bold text-sky-600 dark:text-sky-400">
                          {batch.id?.slice(0, 8)}...
                          <div className="text-[10px] text-slate-400 font-sans font-normal mt-0.5">
                            {batch.payment_date || batch.created_at?.split('T')[0] || 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono font-semibold text-slate-700 dark:text-slate-300">
                          {batch.payroll_run_id ? `${batch.payroll_run_id.slice(0, 8)}...` : 'N/A'}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                          {bankAcc ? `${bankAcc.account_code} - ${bankAcc.account_name}` : (batch.bank_account_id?.slice(0, 8) || 'Bank Account')}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-slate-700 dark:text-slate-300">
                          {batch.total_employees || batch.employee_count || 0}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-black text-sky-600 dark:text-sky-400">
                          ₹{parseFloat(batch.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${statusBadgeClass}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                          {batch.bank_reference || batch.reference_no || '—'}
                        </td>
                        {isManagementOrAdmin && (
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {['draft', 'created'].includes(bStatus) && (
                                <button
                                  onClick={() => handleSubmitPaymentBatchForApproval(batch.id)}
                                  disabled={isExecuting}
                                  className="os-primary text-xs px-2.5 py-1 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 bg-indigo-600 hover:bg-indigo-500"
                                >
                                  <Send size={12} />
                                  {isExecuting ? 'Submitting...' : 'Submit for Approval'}
                                </button>
                              )}

                              {['pending_approval', 'submitted', 'under_review'].includes(bStatus) && (
                                isAdmin ? (
                                  <button
                                    onClick={() => { setPaymentBatchComments(''); setApprovePaymentBatchModalId(batch.id); }}
                                    disabled={isExecuting}
                                    className="os-primary text-xs px-2.5 py-1 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 bg-amber-600 hover:bg-amber-500"
                                  >
                                    <CheckCircle2 size={12} />
                                    {isExecuting ? 'Approving...' : 'Approve Payment Batch'}
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase italic flex items-center justify-end gap-1">
                                    <Lock size={12} /> Pending Admin Approval
                                  </span>
                                )
                              )}

                              {bStatus === 'approved' && (
                                isAdmin ? (
                                  <>
                                    <button
                                      onClick={() => {
                                        setSelectedBankProfileId(payrollBankFileProfiles[0]?.id || '');
                                        setGenerateBankFileModalBatch(batch);
                                      }}
                                      disabled={isExecuting}
                                      className="os-secondary text-xs px-2.5 py-1 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 hover:bg-sky-100"
                                    >
                                      <Download size={12} /> Generate Bank File
                                    </button>
                                    <button
                                      onClick={() => { setPaymentBankReference(''); setProcessPaymentBatchModalId(batch.id); }}
                                      disabled={isExecuting}
                                      className="os-primary text-xs px-2.5 py-1 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 bg-emerald-600 hover:bg-emerald-500"
                                    >
                                      <Banknote size={12} />
                                      {isExecuting ? 'Disbursing...' : 'Process & Disburse Payment'}
                                    </button>
                                  </>
                                ) : (
                                  <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold uppercase italic flex items-center justify-end gap-1">
                                    <Lock size={12} /> Approved (Pending Admin Disbursement)
                                  </span>
                                )
                              )}

                              {!['paid', 'disbursed', 'cancelled'].includes(bStatus) && (
                                <button
                                  onClick={() => { setPaymentCancelReason(''); setCancelPaymentBatchModalId(batch.id); }}
                                  disabled={isExecuting}
                                  className="os-secondary text-xs px-2 py-1 flex items-center gap-1 cursor-pointer text-rose-600 dark:text-rose-400 hover:bg-rose-50"
                                  title="Cancel Payment Batch"
                                >
                                  <Ban size={12} /> Cancel
                                </button>
                              )}

                              {['paid', 'disbursed'].includes(bStatus) && (
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase flex items-center justify-end gap-1">
                                  <CheckCircle2 size={12} /> Disbursed
                                </span>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {payrollPaymentBatches.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-xs italic text-slate-400">
                        No active salary payment batches found. Finalize a payroll run and click "Create Payment Batch" under Payroll Runs to disburse salaries.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Employee Payment Line Items Table */}
          <div className="os-card overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-200">
                Employee Disbursement Items (`payroll_payment_items`)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                {payrollPaymentItems.length} Payment Line Items
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase text-slate-400">
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Payment Batch ID</th>
                    <th className="px-4 py-3 text-right">Net Payable Amount</th>
                    <th className="px-4 py-3">Payment Mode / Account</th>
                    <th className="px-4 py-3">Item Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollPaymentItems.map(item => {
                    const emp = employees.find(e => e.id === item.employee_id);
                    return (
                      <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                        <td className="px-4 py-3 font-bold">
                          {emp ? `${emp.first_name} ${emp.last_name}` : `EMP ID: ${item.employee_id?.slice(0, 8)}...`}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                          {item.payment_batch_id?.slice(0, 8)}...
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-black text-sky-600 dark:text-sky-400">
                          ₹{parseFloat(item.amount || item.net_pay || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                          {item.payment_mode || 'Bank Transfer'} ({item.bank_account_number || item.account_no || 'Direct Credit'})
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            item.status === 'paid' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' :
                            item.status === 'cancelled' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' :
                            'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300'
                          }`}>
                            {item.status || 'pending'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {payrollPaymentItems.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-xs italic text-slate-400">
                        No employee payment items found. Create a payment batch to populate disbursement line items.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* P2B Section: Bank File Profiles Configuration (`payroll_bank_file_profiles`) */}
          <div className="os-card overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-200">
                  Bank File Profiles Configuration (`payroll_bank_file_profiles`)
                </span>
                <p className="text-[11px] text-slate-400">Configure bank export format profiles (HDFC, ICICI, SBI, Custom CSV/Text Formats)</p>
              </div>
              {isAdmin ? (
                <button
                  onClick={() => {
                    setBankFileProfileForm({ profile_code: '', bank_name: '', format_type: 'CSV', is_active: true });
                    setBankFileProfileModal({});
                  }}
                  className="os-primary text-xs px-2.5 py-1 flex items-center gap-1.5 cursor-pointer bg-sky-600 hover:bg-sky-500"
                >
                  <Plus size={13} /> Configure Bank Profile
                </button>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center gap-1">
                  <Lock size={11} /> Admin Config Only
                </span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase text-slate-400">
                    <th className="px-4 py-3">Profile Code</th>
                    <th className="px-4 py-3">Bank Name</th>
                    <th className="px-4 py-3">Format Type</th>
                    <th className="px-4 py-3">Status</th>
                    {isAdmin && <th className="px-4 py-3 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {payrollBankFileProfiles.map(prof => (
                    <tr key={prof.id} className="border-b border-slate-100 dark:border-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3 font-mono font-bold text-sky-600 dark:text-sky-400">
                        {prof.profile_code}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                        {prof.bank_name}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400 uppercase">
                        {prof.format_type || 'CSV'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          prof.is_active !== false ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {prof.is_active !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              setBankFileProfileForm({
                                profile_code: prof.profile_code || '',
                                bank_name: prof.bank_name || '',
                                format_type: prof.format_type || 'CSV',
                                is_active: prof.is_active !== false
                              });
                              setBankFileProfileModal(prof);
                            }}
                            className="os-secondary text-xs px-2 py-1 flex items-center gap-1 cursor-pointer ml-auto"
                          >
                            <Edit2 size={12} /> Edit Profile
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {payrollBankFileProfiles.length === 0 && (
                    <tr>
                      <td colSpan={isAdmin ? 5 : 4} className="p-6 text-center text-xs italic text-slate-400">
                        No bank file profiles configured yet. Click "Configure Bank Profile" above to define bank export formats.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* P2B Section: Generated Bank Files & Submission Log (`payroll_bank_files`) */}
          <div className="os-card overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-200">
                  Generated Bank Files & Bank Result Tracking (`payroll_bank_files`)
                </span>
                <p className="text-[11px] text-slate-400">Track generated bank files, file hash checksums, bank portal submission, and final bank response results</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
                {payrollBankFiles.length} Bank Files Logged
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase text-slate-400">
                    <th className="px-4 py-3">File Name / ID</th>
                    <th className="px-4 py-3">Payment Batch</th>
                    <th className="px-4 py-3">Bank / Profile</th>
                    <th className="px-4 py-3 text-right">Gen #</th>
                    <th className="px-4 py-3 text-right">Employees</th>
                    <th className="px-4 py-3 text-right">Total Amount</th>
                    <th className="px-4 py-3">File Hash (SHA-256)</th>
                    <th className="px-4 py-3">Status</th>
                    {isAdmin && <th className="px-4 py-3 text-right">Admin Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {payrollBankFiles.map(file => {
                    const prof = payrollBankFileProfiles.find(p => p.id === file.profile_id);
                    const fStatus = (file.status || 'generated').toLowerCase();

                    let statusBadgeClass = 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200 dark:border-sky-800';
                    let statusLabel = 'Generated';

                    if (fStatus === 'submitted') {
                      statusBadgeClass = 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
                      statusLabel = 'Submitted to Bank';
                    } else if (['accepted', 'processed', 'completed'].includes(fStatus)) {
                      statusBadgeClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
                      statusLabel = 'Accepted by Bank';
                    } else if (['rejected', 'failed'].includes(fStatus)) {
                      statusBadgeClass = 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800';
                      statusLabel = 'Rejected by Bank';
                    }

                    return (
                      <tr key={file.id} className="border-b border-slate-100 dark:border-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                        <td className="px-4 py-3 font-mono font-bold text-sky-600 dark:text-sky-400">
                          {file.file_name || `${file.id?.slice(0, 8)}...`}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                          {file.payment_batch_id?.slice(0, 8)}...
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                          {prof ? `${prof.bank_name} (${prof.profile_code})` : (file.profile_id?.slice(0, 8) || 'Bank Profile')}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold">
                          #{file.generation_number || 1}
                        </td>
                        <td className="px-4 py-3 text-right font-bold">
                          {file.employee_count || 0}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-black text-sky-600 dark:text-sky-400">
                          ₹{parseFloat(file.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 font-mono text-[10px] text-slate-500" title={file.file_hash || ''}>
                          {file.file_hash ? `${file.file_hash.slice(0, 12)}...` : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${statusBadgeClass}`}>
                            {statusLabel}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {['generated', 'draft'].includes(fStatus) && (
                                <button
                                  onClick={() => { setBankFileSubmitExternalRef(''); setSubmitBankFileModalId(file.id); }}
                                  className="os-primary text-xs px-2.5 py-1 flex items-center gap-1 cursor-pointer bg-amber-600 hover:bg-amber-500"
                                >
                                  <Send size={12} /> Mark Submitted
                                </button>
                              )}
                              {fStatus === 'submitted' && (
                                <button
                                  onClick={() => {
                                    setBankFileResultStatus('accepted');
                                    setBankFileResultExternalRef('');
                                    setBankFileResultRejectionReason('');
                                    setResultBankFileModalId(file.id);
                                  }}
                                  className="os-primary text-xs px-2.5 py-1 flex items-center gap-1 cursor-pointer bg-emerald-600 hover:bg-emerald-500"
                                >
                                  <CheckCircle2 size={12} /> Record Result
                                </button>
                              )}
                              {['accepted', 'rejected'].includes(fStatus) && (
                                <span className="text-[10px] text-slate-400 italic">Result Logged</span>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {payrollBankFiles.length === 0 && (
                    <tr>
                      <td colSpan={isAdmin ? 9 : 8} className="p-6 text-center text-xs italic text-slate-400">
                        No bank files generated yet. Click "Generate Bank File" on an Approved Salary Payment Batch above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* P2C — Payroll Bank Reconciliation */}
      {activeTab === 'reconciliation' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <RefreshCw size={18} className="text-sky-500" />
                P2C — Payroll Bank Reconciliation & Exceptions
              </h3>
              <p className="text-xs text-slate-400">
                Reconcile disbursed salary payment items with bank transactions. Classify as matched, partial, failed, or exception.
              </p>
            </div>
            {isManagementOrAdmin && (
              <button
                onClick={() => {
                  setReconcileForm({
                    bank_transaction_id: crypto.randomUUID(),
                    payroll_payment_item_id: payrollPaymentItems[0]?.id || '',
                    payroll_payment_batch_id: payrollPaymentBatches[0]?.id || '',
                    matched_amount: payrollPaymentItems[0]?.amount || '',
                    status: 'matched',
                    match_method: 'manual',
                    external_reference: '',
                    notes: ''
                  });
                  setReconcileModalItem({});
                }}
                className="os-primary text-xs flex items-center gap-1.5 cursor-pointer bg-sky-600 hover:bg-sky-500"
              >
                <Plus size={14} /> Reconcile Transaction
              </button>
            )}
          </div>

          {renderPayrollIntegritySection()}

          {/* Section 1: Unreconciled Bank Transactions / Disbursed Items */}
          <div className="os-card overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-200">
                  Disbursed Payroll Payment Items (`payroll_payment_items`)
                </span>
                <p className="text-[11px] text-slate-400">Items ready for bank statement matching and reconciliation</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                {payrollPaymentItems.length} Items Listed
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase text-slate-400">
                    <th className="px-4 py-3">Item / Employee</th>
                    <th className="px-4 py-3">Payment Batch</th>
                    <th className="px-4 py-3">Masked Bank Acc</th>
                    <th className="px-4 py-3 text-right">Expected Amount</th>
                    <th className="px-4 py-3">Payment Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollPaymentItems.map(item => {
                    const emp = employees.find(e => e.id === item.employee_id);
                    const batch = payrollPaymentBatches.find(b => b.id === item.payment_batch_id);
                    const isReconciled = payrollBankReconciliations.some(r => r.payroll_payment_item_id === item.id && r.status === 'matched');

                    return (
                      <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                        <td className="px-4 py-3 font-bold">
                          {emp ? `${emp.first_name} ${emp.last_name}` : `EMP: ${item.employee_id?.slice(0, 8)}...`}
                        </td>
                        <td className="px-4 py-3 font-mono font-semibold text-sky-600 dark:text-sky-400">
                          {batch?.batch_number || item.payment_batch_id?.slice(0, 8) || 'N/A'}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-500">
                          {maskBankAccount(item.bank_account_no)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{parseFloat(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            item.status === 'paid' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {item.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isManagementOrAdmin && (
                            <button
                              onClick={() => {
                                setReconcileForm({
                                  bank_transaction_id: crypto.randomUUID(),
                                  payroll_payment_item_id: item.id,
                                  payroll_payment_batch_id: item.payment_batch_id || '',
                                  matched_amount: item.amount || 0,
                                  status: 'matched',
                                  match_method: 'manual',
                                  external_reference: '',
                                  notes: ''
                                });
                                setReconcileModalItem(item);
                              }}
                              disabled={isReconciled}
                              className={`os-primary text-xs px-2 py-1 flex items-center gap-1 cursor-pointer ml-auto ${
                                isReconciled ? 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-500'
                              }`}
                            >
                              <RefreshCw size={12} /> {isReconciled ? 'Reconciled' : 'Match Item'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {payrollPaymentItems.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-xs italic text-slate-400">
                        No disbursed payment items found for reconciliation.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Reconciliation History & Status (`payroll_bank_reconciliations`) */}
          <div className="os-card overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-200">
                  Reconciliation History & Audit Trail (`payroll_bank_reconciliations`)
                </span>
                <p className="text-[11px] text-slate-400">Complete log of matched, partial, failed, and exception bank reconciliations</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
                {payrollBankReconciliations.length} Records
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase text-slate-400">
                    <th className="px-4 py-3">Reconciliation ID</th>
                    <th className="px-4 py-3">Matched Amount</th>
                    <th className="px-4 py-3">Classification Status</th>
                    <th className="px-4 py-3">Match Method</th>
                    <th className="px-4 py-3">External Ref</th>
                    <th className="px-4 py-3">Notes</th>
                    {isAdmin && <th className="px-4 py-3 text-right">Admin Unmatch</th>}
                  </tr>
                </thead>
                <tbody>
                  {payrollBankReconciliations.map(rec => {
                    const rStatus = (rec.status || 'matched').toLowerCase();
                    const isInternalDisbursement = rec.match_method === 'disbursement' || rec.is_internal_disbursement === true;

                    let statusBadgeClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
                    if (rStatus === 'partial') statusBadgeClass = 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
                    else if (rStatus === 'failed') statusBadgeClass = 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800';
                    else if (rStatus === 'exception') statusBadgeClass = 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 border border-orange-200 dark:border-orange-800';

                    return (
                      <tr key={rec.id} className="border-b border-slate-100 dark:border-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                        <td className="px-4 py-3 font-mono font-bold text-sky-600 dark:text-sky-400">
                          {rec.id?.slice(0, 8)}...
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                          ₹{parseFloat(rec.matched_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${statusBadgeClass}`}>
                            {rStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-500 uppercase text-[10px]">
                          {rec.match_method || 'manual'}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-500">
                          {rec.external_reference || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-[11px]">
                          {rec.notes || '—'}
                        </td>
                        {isAdmin && (
                          <td className="px-4 py-3 text-right">
                            {isInternalDisbursement ? (
                              <span className="text-[10px] text-slate-400 italic" title="Actual internal salary disbursement cannot be unmatched">
                                Internal Disbursal (Protected)
                              </span>
                            ) : (
                              <button
                                onClick={() => { setUnmatchReason(''); setUnmatchModalRec(rec); }}
                                className="os-secondary text-xs px-2 py-1 flex items-center gap-1 cursor-pointer text-rose-600 hover:text-rose-700 border-rose-200 dark:border-rose-800 ml-auto"
                              >
                                <Ban size={12} /> Unmatch
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {payrollBankReconciliations.length === 0 && (
                    <tr>
                      <td colSpan={isAdmin ? 7 : 6} className="p-6 text-center text-xs italic text-slate-400">
                        No reconciliation records logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* P2D — Statutory Compliance Exports & Settlement Payments */}
      {activeTab === 'statutory' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-500" />
                P2D — Statutory Compliance Exports & Settlement Payments
              </h3>
              <p className="text-xs text-slate-400">
                Generate statutory files for Provident Fund (PF), ESI, Professional Tax (PT), and TDS, and process statutory settlement payments.
              </p>
            </div>
          </div>

          {/* Panel 1: Statutory Compliance Exports */}
          <div className="os-card p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-xs font-black uppercase text-slate-700 dark:text-slate-200">Statutory Return Exports</h4>
                <p className="text-[11px] text-slate-400">Select a pay period to generate downloadable statutory compliance reports</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-500">Pay Period:</label>
                <select
                  value={selectedStatPeriodId}
                  onChange={e => setSelectedStatPeriodId(e.target.value)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                >
                  <option value="">Select Period...</option>
                  {payrollPeriods.map(p => (
                    <option key={p.id} value={p.id}>{p.period_name || p.period_code}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
              <button
                onClick={() => handleGenerateStatExport('PF')}
                disabled={statExportLoading}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-sky-500 bg-slate-50 dark:bg-slate-800/50 hover:bg-sky-50/50 text-left transition cursor-pointer disabled:opacity-50 space-y-1"
              >
                <div className="text-[10px] font-black uppercase text-sky-600 dark:text-sky-400 flex items-center justify-between">
                  <span>PF Return</span>
                  <Download size={13} />
                </div>
                <div className="text-xs font-bold">Provident Fund</div>
              </button>

              <button
                onClick={() => handleGenerateStatExport('ESI')}
                disabled={statExportLoading}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50/50 text-left transition cursor-pointer disabled:opacity-50 space-y-1"
              >
                <div className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                  <span>ESI Return</span>
                  <Download size={13} />
                </div>
                <div className="text-xs font-bold">ESI Compliance</div>
              </button>

              <button
                onClick={() => handleGenerateStatExport('PT')}
                disabled={statExportLoading}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 bg-slate-50 dark:bg-slate-800/50 hover:bg-purple-50/50 text-left transition cursor-pointer disabled:opacity-50 space-y-1"
              >
                <div className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 flex items-center justify-between">
                  <span>PT Return</span>
                  <Download size={13} />
                </div>
                <div className="text-xs font-bold">Professional Tax</div>
              </button>

              <button
                onClick={() => handleGenerateStatExport('TDS')}
                disabled={statExportLoading}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50/50 text-left transition cursor-pointer disabled:opacity-50 space-y-1"
              >
                <div className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 flex items-center justify-between">
                  <span>TDS Return</span>
                  <Download size={13} />
                </div>
                <div className="text-xs font-bold">Income Tax TDS</div>
              </button>

              <button
                onClick={handleGeneratePfEcr}
                disabled={statExportLoading}
                className="p-3 rounded-xl border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 text-left transition cursor-pointer disabled:opacity-50 space-y-1"
              >
                <div className="text-[10px] font-black uppercase text-sky-700 dark:text-sky-300 flex items-center justify-between">
                  <span>Specialized</span>
                  <FileCode size={13} />
                </div>
                <div className="text-xs font-bold text-sky-900 dark:text-sky-200">PF ECR File</div>
              </button>

              <button
                onClick={handleGenerateEsi}
                disabled={statExportLoading}
                className="p-3 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-left transition cursor-pointer disabled:opacity-50 space-y-1"
              >
                <div className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
                  <span>Specialized</span>
                  <FileCode size={13} />
                </div>
                <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">ESI Export File</div>
              </button>
            </div>
          </div>

          {/* Panel 2: Statutory Settlement Payments (`payroll_statutory_settlements`) */}
          <div className="os-card overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-200">
                  Statutory Settlement Payments (`payroll_statutory_settlements`)
                </span>
                <p className="text-[11px] text-slate-400">Track and process government statutory dues payment settlements (Admin/Owner action)</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                {payrollStatutorySettlements.length} Settlements
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase text-slate-400">
                    <th className="px-4 py-3">Statutory Type</th>
                    <th className="px-4 py-3">Pay Period</th>
                    <th className="px-4 py-3 text-right">Payable Amount</th>
                    <th className="px-4 py-3">Payment Status</th>
                    <th className="px-4 py-3">Bank Account</th>
                    <th className="px-4 py-3">Reference No</th>
                    <th className="px-4 py-3">Transaction / Journal Ref</th>
                    {isAdmin && <th className="px-4 py-3 text-right">Admin Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {payrollStatutorySettlements.map(set => {
                    const period = payrollPeriods.find(p => p.id === set.payroll_period_id);
                    const acc = accounts.find(a => a.id === set.bank_account_id);
                    const sStatus = (set.payment_status || 'pending').toLowerCase();

                    return (
                      <tr key={set.id} className="border-b border-slate-100 dark:border-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                        <td className="px-4 py-3 font-bold text-sky-600 dark:text-sky-400">
                          {set.statutory_type || 'PF'}
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          {period?.period_name || period?.period_code || 'Period'}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{parseFloat(set.payable_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            sStatus === 'processed' || sStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {sStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                          {acc?.account_name || set.bank_account_id?.slice(0, 8) || 'N/A'}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-500">
                          {set.reference_no || 'N/A'}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-400 text-[10px]">
                          {set.journal_entry_id ? `JE: ${set.journal_entry_id.slice(0, 8)}...` : 'N/A'}
                        </td>
                        {isAdmin && (
                          <td className="px-4 py-3 text-right">
                            {sStatus === 'pending' ? (
                              <button
                                onClick={() => {
                                  const defaultBank = accounts.find(a => (a.account_type || '').toUpperCase() === 'ASSET' && ((a.account_subtype || '').toLowerCase().includes('bank') || (a.account_name || '').toLowerCase().includes('bank')))?.id || accounts[0]?.id || '';
                                  setProcessStatForm({ bank_account_id: defaultBank, reference_no: '' });
                                  setProcessStatModal(set);
                                }}
                                className="os-primary text-xs px-2.5 py-1 flex items-center gap-1 cursor-pointer bg-emerald-600 hover:bg-emerald-500 ml-auto"
                              >
                                <Send size={12} /> Process Settlement
                              </button>
                            ) : (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-end gap-1">
                                <CheckCircle2 size={12} /> Settled
                              </span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {payrollStatutorySettlements.length === 0 && (
                    <tr>
                      <td colSpan={isAdmin ? 8 : 7} className="p-6 text-center text-xs italic text-slate-400">
                        No statutory settlements logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* P2F — Form 16 Preparation Statement */}
      {activeTab === 'form16' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <FileCode size={18} className="text-indigo-500" />
                P2F — Form 16 Preparation Statement
              </h3>
              <p className="text-xs text-slate-400">
                Annual TDS calculation and income summary statement.
              </p>
            </div>
          </div>

          {/* Prominent Mandatory Non-Official Label Warning */}
          <div className="p-4 rounded-xl bg-indigo-50 border-2 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800 text-xs font-semibold flex items-start gap-3">
            <Info size={20} className="text-indigo-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-black text-indigo-900 dark:text-indigo-200 text-xs uppercase tracking-wider">
                Form 16 Preparation Statement (NOT Official Form 16 Certificate)
              </div>
              <p className="text-indigo-800 dark:text-indigo-300">
                This document is an internal <strong>Form 16 Preparation Statement</strong> designed for verifying annual salary income, tax deductions, and TDS withholding. It is <strong>NOT an Official Form 16 Certificate</strong> issued under Section 203 of the Income Tax Act. Official Form 16 Part A/B certificates must be generated from the TRACES portal.
              </p>
            </div>
          </div>

          {/* Form 16 Generator Controls */}
          <div className="os-card p-4 space-y-4">
            <form onSubmit={handleGenerateForm16} className="flex flex-wrap items-end gap-3">
              <div>
                <label className="text-xs font-bold block mb-1">Financial / Tax Year</label>
                <select
                  value={form16TaxYear}
                  onChange={e => setForm16TaxYear(e.target.value)}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                >
                  <option value="2026-2027">2026-2027 (Assessment Year 2027-28)</option>
                  <option value="2025-2026">2025-2026 (Assessment Year 2026-27)</option>
                </select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="text-xs font-bold block mb-1">Employee Target</label>
                {isManagementOrAdmin ? (
                  <select
                    value={form16EmployeeId}
                    onChange={e => setForm16EmployeeId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                  >
                    <option value="">Select Employee...</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_code || emp.id?.slice(0, 6)})</option>
                    ))}
                  </select>
                ) : (
                  <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                    {currentEmployee ? `${currentEmployee.first_name} ${currentEmployee.last_name} (Self)` : 'My Employee Profile'}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={form16Loading}
                className="os-primary text-xs px-4 py-2.5 flex items-center gap-1.5 cursor-pointer bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
              >
                <Calculator size={14} /> {form16Loading ? 'Calculating Statement...' : 'Generate Preparation Statement'}
              </button>
            </form>
          </div>

          {/* Form 16 Results Display */}
          {form16Data && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <div className="font-black text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Form 16 Preparation Summary Breakdown
                </div>
                {form16Data.content && (
                  <button
                    onClick={() => downloadFile(form16Data.content, form16Data.file_name || `Form16_Prep_${form16TaxYear}.html`, form16Data.mime_type || 'text/html')}
                    className="os-secondary text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Download size={13} /> Download Statement HTML
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="os-card p-3 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Gross Salary</div>
                  <div className="text-lg font-black font-mono text-slate-800 dark:text-slate-100">
                    ₹{parseFloat(form16Data.gross_salary || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="os-card p-3 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Deductions & Exemptions</div>
                  <div className="text-lg font-black font-mono text-purple-600 dark:text-purple-400">
                    ₹{parseFloat(form16Data.total_deductions || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="os-card p-3 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Taxable Salary</div>
                  <div className="text-lg font-black font-mono text-indigo-600 dark:text-indigo-400">
                    ₹{parseFloat(form16Data.taxable_salary || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="os-card p-3 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Total TDS Deducted</div>
                  <div className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                    ₹{parseFloat(form16Data.tds_deducted || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="os-card p-4 space-y-2">
                  <div className="font-bold text-xs border-b border-slate-100 dark:border-slate-800 pb-1">Previous Employer Income & TDS</div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-500">Previous Employer Income:</span>
                    <span className="font-bold">₹{parseFloat(form16Data.previous_employer_income || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-500">Previous Employer TDS:</span>
                    <span className="font-bold">₹{parseFloat(form16Data.previous_employer_tds || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="os-card p-4 space-y-2">
                  <div className="font-bold text-xs border-b border-slate-100 dark:border-slate-800 pb-1">Other Income & Deductions</div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-500">Other Declared Income:</span>
                    <span className="font-bold">₹{parseFloat(form16Data.other_income || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-500">Net Tax Payable:</span>
                    <span className="font-bold text-sky-600 dark:text-sky-400">₹{parseFloat(form16Data.net_tax_payable || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
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
        <div className="space-y-5">
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

          {/* Payroll Account Mappings GL Configuration */}
          <div className="os-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Payroll General Ledger (GL) Account Mappings</h3>
                <p className="text-xs text-slate-400">Configure GL accounts for automated accounting entry generation via `upsert_payroll_account_mapping_atomic`</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase text-slate-400">
                    <th className="px-4 py-3">Mapping Key</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Mapped GL Account</th>
                    {isManagementOrAdmin && <th className="px-4 py-3 text-right">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { key: 'salary_expense', name: 'Salary & Wages Expense', category: 'Expense', desc: 'Debit account for employee salaries, wages & allowances' },
                    { key: 'employer_contribution_expense', name: 'Employer Statutory Contribution Expense', category: 'Expense', desc: 'Debit account for employer statutory PF & ESI contributions' },
                    { key: 'salary_payable', name: 'Salary Payable / Net Pay', category: 'Liability', desc: 'Credit account for net salary payable to employees' },
                    { key: 'pf_payable', name: 'PF Liability / Payable', category: 'Liability', desc: 'Credit account for employee & employer Provident Fund payable' },
                    { key: 'esi_payable', name: 'ESI Liability / Payable', category: 'Liability', desc: 'Credit account for employee & employer ESI payable' },
                    { key: 'pt_payable', name: 'Professional Tax Payable', category: 'Liability', desc: 'Credit account for state Professional Tax liability' },
                    { key: 'tds_payable', name: 'TDS Tax Payable (Sec 192)', category: 'Liability', desc: 'Credit account for employee income tax withheld' },
                    { key: 'other_deductions_payable', name: 'Other Deductions Payable', category: 'Liability', desc: 'Credit account for other payroll deductions payable' }
                  ].map(item => {
                    const mapping = payrollAccountMappings.find(m => m.mapping_key === item.key);
                    const mappedAccount = accounts.find(a => a.id === mapping?.account_id);

                    return (
                      <tr key={item.key} className="border-b border-slate-100 dark:border-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                        <td className="px-4 py-3 font-mono font-bold text-sky-600 dark:text-sky-400">{item.key}</td>
                        <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">{item.name}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.category === 'Expense' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                          }`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {mappedAccount ? (
                            <span className="font-semibold text-slate-800 dark:text-slate-100">
                              <span className="font-mono text-sky-600 dark:text-sky-400 mr-1.5">{mappedAccount.account_code}</span>
                              {mappedAccount.account_name}
                            </span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400 italic text-[11px] font-medium">Not Configured</span>
                          )}
                        </td>
                        {isManagementOrAdmin && (
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => {
                                setMappingForm({
                                  mapping_key: item.key,
                                  account_id: mapping?.account_id || '',
                                  description: item.name
                                });
                                setMappingModal(item);
                              }}
                              className="os-primary text-xs px-2.5 py-1 cursor-pointer"
                            >
                              {mappedAccount ? 'Edit Mapping' : 'Configure'}
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create Payroll Run Modal */}
      {createRunModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase text-slate-800 dark:text-slate-100">Create New Payroll Run</h3>
              <button onClick={() => setCreateRunModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleCreatePayrollRun} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Target Pay Period</label>
                <select
                  value={createRunForm.payroll_period_id}
                  onChange={e => setCreateRunForm({ ...createRunForm, payroll_period_id: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                  required
                >
                  <option value="">Select Pay Period...</option>
                  {payrollPeriods.map(p => (
                    <option key={p.id} value={p.id}>{p.period_name || p.period_code} ({p.pay_date || 'Draft'})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold block mb-1">Run Type</label>
                <select
                  value={createRunForm.run_type}
                  onChange={e => setCreateRunForm({ ...createRunForm, run_type: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold"
                >
                  <option value="regular">Regular Monthly Run</option>
                  <option value="bonus">Bonus / Incentive Run</option>
                  <option value="off_cycle">Off-Cycle / Settlement Run</option>
                </select>
              </div>
              <div>
                <label className="font-bold block mb-1">Notes / Remarks</label>
                <input
                  type="text"
                  value={createRunForm.notes}
                  onChange={e => setCreateRunForm({ ...createRunForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                  placeholder="e.g. Regular monthly payroll run for active staff"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setCreateRunModal(false)} className="os-secondary">Cancel</button>
                <button type="submit" disabled={modalSubmitting} className="os-primary flex items-center gap-1">
                  <Plus size={13} /> {modalSubmitting ? 'Creating...' : 'Create Payroll Run'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approve Payroll Run Modal */}
      {approveModalRunId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase text-slate-800 dark:text-slate-100">Approve Payroll Run</h3>
              <button onClick={() => setApproveModalRunId(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleApproveRun} className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-300">
                You are approving payroll run <strong className="font-mono">{approveModalRunId?.slice(0, 8)}...</strong>. Once approved, the run can be finalized and posted to accounting.
              </p>
              <div>
                <label className="font-bold block mb-1">Approval Comments / Remarks</label>
                <textarea
                  value={approveComments}
                  onChange={e => setApproveComments(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 min-h-[80px]"
                  placeholder="Verified attendance & statutory calculations. Approved for finalization."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setApproveModalRunId(null)} className="os-secondary">Cancel</button>
                <button type="submit" disabled={actionLoadingRunId === approveModalRunId} className="os-primary bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1">
                  <CheckCircle2 size={13} /> {actionLoadingRunId === approveModalRunId ? 'Approving...' : 'Confirm Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Account Mapping Modal */}
      {mappingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase text-slate-800 dark:text-slate-100">
                Configure GL Mapping: {mappingModal.name || mappingForm.mapping_key}
              </h3>
              <button onClick={() => setMappingModal(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSaveAccountMapping} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Mapping Key</label>
                <input
                  type="text"
                  value={mappingForm.mapping_key}
                  readOnly
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 font-mono font-bold"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Select General Ledger Account</label>
                <select
                  value={mappingForm.account_id}
                  onChange={e => setMappingForm({ ...mappingForm, account_id: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                  required
                >
                  <option value="">Select Account from Chart of Accounts...</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_code} - {acc.account_name} ({acc.account_type})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold block mb-1">Description / Notes</label>
                <input
                  type="text"
                  value={mappingForm.description}
                  onChange={e => setMappingForm({ ...mappingForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                  placeholder="GL account mapping description"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setMappingModal(null)} className="os-secondary">Cancel</button>
                <button type="submit" disabled={modalSubmitting} className="os-primary flex items-center gap-1">
                  <Send size={13} /> {modalSubmitting ? 'Saving...' : 'Save Mapping'}
                </button>
              </div>
            </form>
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

      {/* Create Payment Batch Modal */}
      {createPaymentBatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase text-slate-800 dark:text-slate-100">Create Salary Payment Batch</h3>
              <button onClick={() => setCreatePaymentBatchModal(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleCreatePaymentBatch} className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-300">
                Create salary disbursement batch for payroll run <strong className="font-mono">{createPaymentBatchModal?.id?.slice(0, 8)}...</strong>
              </p>
              <div>
                <label className="font-bold block mb-1">Select Bank Account for Disbursement</label>
                <select
                  value={paymentBatchForm.bank_account_id}
                  onChange={e => setPaymentBatchForm({ ...paymentBatchForm, bank_account_id: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-semibold"
                  required
                >
                  <option value="">Select Bank Account...</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_code} - {acc.account_name} ({acc.account_type})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold block mb-1">Disbursement Date</label>
                <input
                  type="date"
                  value={paymentBatchForm.payment_date}
                  onChange={e => setPaymentBatchForm({ ...paymentBatchForm, payment_date: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                  required
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Notes / Remarks</label>
                <input
                  type="text"
                  value={paymentBatchForm.notes}
                  onChange={e => setPaymentBatchForm({ ...paymentBatchForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                  placeholder="Monthly Salary Payment Batch"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setCreatePaymentBatchModal(null)} className="os-secondary">Cancel</button>
                <button type="submit" disabled={modalSubmitting} className="os-primary flex items-center gap-1 bg-sky-600 hover:bg-sky-500">
                  <Banknote size={13} /> {modalSubmitting ? 'Creating...' : 'Create Payment Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approve Payment Batch Modal */}
      {approvePaymentBatchModalId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase text-slate-800 dark:text-slate-100">Approve Salary Payment Batch</h3>
              <button onClick={() => setApprovePaymentBatchModalId(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleApprovePaymentBatch} className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-300">
                You are approving salary payment batch <strong className="font-mono">{approvePaymentBatchModalId?.slice(0, 8)}...</strong> as Admin.
              </p>
              <div>
                <label className="font-bold block mb-1">Approval Comments</label>
                <textarea
                  value={paymentBatchComments}
                  onChange={e => setPaymentBatchComments(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 min-h-[80px]"
                  placeholder="Approved for bank disbursement."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setApprovePaymentBatchModalId(null)} className="os-secondary">Cancel</button>
                <button type="submit" disabled={actionLoadingRunId === approvePaymentBatchModalId} className="os-primary bg-amber-600 hover:bg-amber-500 flex items-center gap-1">
                  <CheckCircle2 size={13} /> {actionLoadingRunId === approvePaymentBatchModalId ? 'Approving...' : 'Confirm Payment Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Process & Disburse Payment Batch Modal */}
      {processPaymentBatchModalId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase text-slate-800 dark:text-slate-100">Process & Disburse Salary Payment</h3>
              <button onClick={() => setProcessPaymentBatchModalId(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleProcessPaymentBatch} className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-300">
                Execute bank disbursement for batch <strong className="font-mono">{processPaymentBatchModalId?.slice(0, 8)}...</strong>
              </p>
              <div>
                <label className="font-bold block mb-1">Bank Reference / UTR Transaction ID</label>
                <input
                  type="text"
                  value={paymentBankReference}
                  onChange={e => setPaymentBankReference(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
                  placeholder="UTR1234567890"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setProcessPaymentBatchModalId(null)} className="os-secondary">Cancel</button>
                <button type="submit" disabled={actionLoadingRunId === processPaymentBatchModalId} className="os-primary bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1">
                  <Banknote size={13} /> {actionLoadingRunId === processPaymentBatchModalId ? 'Disbursing...' : 'Confirm Disbursement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Payment Batch Modal */}
      {cancelPaymentBatchModalId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase text-rose-600">Cancel Salary Payment Batch</h3>
              <button onClick={() => setCancelPaymentBatchModalId(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleCancelPaymentBatch} className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-300">
                Are you sure you want to cancel payment batch <strong className="font-mono">{cancelPaymentBatchModalId?.slice(0, 8)}...</strong>?
              </p>
              <div>
                <label className="font-bold block mb-1">Cancellation Reason</label>
                <input
                  type="text"
                  value={paymentCancelReason}
                  onChange={e => setPaymentCancelReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                  placeholder="Incorrect bank account selection"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setCancelPaymentBatchModalId(null)} className="os-secondary">Back</button>
                <button type="submit" disabled={actionLoadingRunId === cancelPaymentBatchModalId} className="os-primary bg-rose-600 hover:bg-rose-500 flex items-center gap-1">
                  <Ban size={13} /> {actionLoadingRunId === cancelPaymentBatchModalId ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* P2B Modal 1: Bank File Profile Configuration Modal */}
      {bankFileProfileModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase text-slate-800 dark:text-slate-100">
                {bankFileProfileModal?.id ? 'Edit Bank File Profile' : 'Configure Bank File Profile'}
              </h3>
              <button onClick={() => setBankFileProfileModal(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSaveBankFileProfile} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Profile Code (Unique Identifier)</label>
                <input
                  type="text"
                  value={bankFileProfileForm.profile_code}
                  onChange={e => setBankFileProfileForm({ ...bankFileProfileForm, profile_code: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono uppercase"
                  placeholder="HDFC-NEFT-STD"
                  required
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankFileProfileForm.bank_name}
                  onChange={e => setBankFileProfileForm({ ...bankFileProfileForm, bank_name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                  placeholder="HDFC Bank"
                  required
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Format Type</label>
                <select
                  value={bankFileProfileForm.format_type}
                  onChange={e => setBankFileProfileForm({ ...bankFileProfileForm, format_type: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-semibold"
                >
                  <option value="CSV">CSV (Comma Separated Values)</option>
                  <option value="NEFT_TXT">NEFT Fixed Width TXT</option>
                  <option value="RTGS_TXT">RTGS Fixed Width TXT</option>
                  <option value="EXCEL_XML">XML / Excel Format</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="profileActive"
                  checked={bankFileProfileForm.is_active}
                  onChange={e => setBankFileProfileForm({ ...bankFileProfileForm, is_active: e.target.checked })}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <label htmlFor="profileActive" className="font-bold text-slate-700 dark:text-slate-300">Profile Active</label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setBankFileProfileModal(null)} className="os-secondary">Cancel</button>
                <button type="submit" disabled={modalSubmitting} className="os-primary flex items-center gap-1 bg-sky-600 hover:bg-sky-500">
                  <Send size={13} /> {modalSubmitting ? 'Saving...' : 'Save Bank Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* P2B Modal 2: Generate Bank File Modal */}
      {generateBankFileModalBatch && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase text-slate-800 dark:text-slate-100">Generate Bank File</h3>
              <button onClick={() => setGenerateBankFileModalBatch(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleGenerateBankFileSubmit} className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-300">
                Generate and download salary disbursement bank file for batch <strong className="font-mono">{generateBankFileModalBatch?.id?.slice(0, 8)}...</strong>
              </p>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Total Employees:</span>
                  <strong className="text-slate-900 dark:text-slate-100">{generateBankFileModalBatch.total_employees || generateBankFileModalBatch.employee_count || 0}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Total Net Amount:</span>
                  <strong className="text-sky-600 dark:text-sky-400 font-mono">₹{parseFloat(generateBankFileModalBatch.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                </div>
              </div>
              <div>
                <label className="font-bold block mb-1">Select Bank Profile</label>
                <select
                  value={selectedBankProfileId}
                  onChange={e => setSelectedBankProfileId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-semibold"
                  required
                >
                  <option value="">Select Bank Profile...</option>
                  {payrollBankFileProfiles.filter(p => p.is_active !== false).map(prof => (
                    <option key={prof.id} value={prof.id}>
                      {prof.bank_name} ({prof.profile_code} - {prof.format_type})
                    </option>
                  ))}
                </select>
                {payrollBankFileProfiles.length === 0 && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                    No bank profiles configured. Please configure a bank file profile below first.
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setGenerateBankFileModalBatch(null)} className="os-secondary">Cancel</button>
                <button
                  type="submit"
                  disabled={modalSubmitting || !selectedBankProfileId}
                  className="os-primary flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50"
                >
                  <Download size={13} /> {modalSubmitting ? 'Generating...' : 'Generate & Download Bank File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* P2B Modal 3: Mark Bank File Submitted Modal */}
      {submitBankFileModalId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase text-amber-600">Mark Bank File Submitted</h3>
              <button onClick={() => setSubmitBankFileModalId(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleRecordBankFileSubmissionSubmit} className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-300">
                Confirm that bank file <strong className="font-mono">{submitBankFileModalId?.slice(0, 8)}...</strong> has been uploaded to the bank portal.
              </p>
              <div>
                <label className="font-bold block mb-1">External Bank Submission Reference</label>
                <input
                  type="text"
                  value={bankFileSubmitExternalRef}
                  onChange={e => setBankFileSubmitExternalRef(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono"
                  placeholder="e.g. SUB-REF-998822"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setSubmitBankFileModalId(null)} className="os-secondary">Cancel</button>
                <button type="submit" disabled={modalSubmitting} className="os-primary bg-amber-600 hover:bg-amber-500 flex items-center gap-1">
                  <Send size={13} /> {modalSubmitting ? 'Updating...' : 'Confirm Submission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* P2B Modal 4: Record Bank Result Modal */}
      {resultBankFileModalId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase text-slate-800 dark:text-slate-100">Record Bank Processing Result</h3>
              <button onClick={() => setResultBankFileModalId(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleRecordBankFileResultSubmit} className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-300">
                Record official bank response result for file <strong className="font-mono">{resultBankFileModalId?.slice(0, 8)}...</strong>
              </p>
              <div>
                <label className="font-bold block mb-1">Bank Result</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBankFileResultStatus('accepted')}
                    className={`p-3 rounded-xl border font-bold text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                      bankFileResultStatus === 'accepted'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:border-emerald-700'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600'
                    }`}
                  >
                    <CheckCircle2 size={16} className="text-emerald-600" /> Accepted
                  </button>
                  <button
                    type="button"
                    onClick={() => setBankFileResultStatus('rejected')}
                    className={`p-3 rounded-xl border font-bold text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                      bankFileResultStatus === 'rejected'
                        ? 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/50 dark:border-rose-700'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600'
                    }`}
                  >
                    <XCircle size={16} className="text-rose-600" /> Rejected
                  </button>
                </div>
              </div>
              <div>
                <label className="font-bold block mb-1">External Bank Reference / UTR (Optional)</label>
                <input
                  type="text"
                  value={bankFileResultExternalRef}
                  onChange={e => setBankFileResultExternalRef(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono"
                  placeholder="e.g. UTR123456789"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">
                  Rejection Reason {bankFileResultStatus === 'rejected' ? <span className="text-rose-500 font-black">(Mandatory)</span> : '(Optional)'}
                </label>
                <textarea
                  value={bankFileResultRejectionReason}
                  onChange={e => setBankFileResultRejectionReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 min-h-[70px]"
                  placeholder={bankFileResultStatus === 'rejected' ? 'Invalid employee bank account format' : 'Optional notes'}
                  required={bankFileResultStatus === 'rejected'}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setResultBankFileModalId(null)} className="os-secondary">Cancel</button>
                <button type="submit" disabled={modalSubmitting} className="os-primary bg-indigo-600 hover:bg-indigo-500 flex items-center gap-1">
                  <CheckCircle2 size={13} /> {modalSubmitting ? 'Saving...' : 'Record Result'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* P2C Modal 1: Reconcile Bank Transaction Modal */}
      {reconcileModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <RefreshCw size={16} className="text-sky-500" /> Match Payroll Bank Transaction
              </h3>
              <button onClick={() => setReconcileModalItem(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleMatchSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Bank Transaction ID</label>
                <input
                  type="text"
                  value={reconcileForm.bank_transaction_id}
                  onChange={e => setReconcileForm({ ...reconcileForm, bank_transaction_id: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono"
                  placeholder="e.g. TRX-998877"
                  required
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Payroll Payment Item</label>
                <select
                  value={reconcileForm.payroll_payment_item_id}
                  onChange={e => {
                    const item = payrollPaymentItems.find(i => i.id === e.target.value);
                    setReconcileForm({
                      ...reconcileForm,
                      payroll_payment_item_id: e.target.value,
                      payroll_payment_batch_id: item?.payment_batch_id || reconcileForm.payroll_payment_batch_id,
                      matched_amount: item?.amount || reconcileForm.matched_amount
                    });
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-semibold"
                  required
                >
                  <option value="">Select Payment Item...</option>
                  {payrollPaymentItems.map(item => {
                    const emp = employees.find(e => e.id === item.employee_id);
                    return (
                      <option key={item.id} value={item.id}>
                        {emp ? `${emp.first_name} ${emp.last_name}` : item.employee_id} — ₹{parseFloat(item.amount || 0).toLocaleString('en-IN')} (Acc: {maskBankAccount(item.bank_account_no)})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Matched Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={reconcileForm.matched_amount}
                    onChange={e => setReconcileForm({ ...reconcileForm, matched_amount: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Classification Status</label>
                  <select
                    value={reconcileForm.status}
                    onChange={e => setReconcileForm({ ...reconcileForm, status: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value="matched">Matched</option>
                    <option value="partial">Partial</option>
                    <option value="failed">Failed</option>
                    <option value="exception">Exception</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Match Method</label>
                  <select
                    value={reconcileForm.match_method}
                    onChange={e => setReconcileForm({ ...reconcileForm, match_method: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="manual">Manual</option>
                    <option value="reference">Reference</option>
                    <option value="amount_date">Amount & Date</option>
                    <option value="batch">Batch</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">External Ref (Optional)</label>
                  <input
                    type="text"
                    value={reconcileForm.external_reference}
                    onChange={e => setReconcileForm({ ...reconcileForm, external_reference: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono"
                    placeholder="e.g. UTR-BANK-1122"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Reconciliation Notes</label>
                <textarea
                  value={reconcileForm.notes}
                  onChange={e => setReconcileForm({ ...reconcileForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 min-h-[60px]"
                  placeholder="Optional reconciliation notes"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setReconcileModalItem(null)} className="os-secondary">Cancel</button>
                <button type="submit" disabled={modalSubmitting} className="os-primary bg-sky-600 hover:bg-sky-500 flex items-center gap-1">
                  <CheckCircle2 size={13} /> {modalSubmitting ? 'Matching...' : 'Confirm Match'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* P2C Modal 2: Unmatch Reconciliation Modal (Admin Only) */}
      {unmatchModalRec && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase text-rose-600 flex items-center gap-2">
                <Ban size={16} /> Unmatch Bank Transaction (Admin Only)
              </h3>
              <button onClick={() => setUnmatchModalRec(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleUnmatchSubmit} className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-300">
                You are unmatching reconciliation record <strong className="font-mono">{unmatchModalRec.id?.slice(0, 8)}...</strong> (Amount: ₹{parseFloat(unmatchModalRec.matched_amount || 0).toLocaleString('en-IN')}).
              </p>
              <div>
                <label className="font-bold block mb-1">
                  Unmatch Reason <span className="text-rose-500 font-black">(Mandatory)</span>
                </label>
                <textarea
                  value={unmatchReason}
                  onChange={e => setUnmatchReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 min-h-[70px]"
                  placeholder="Enter reason for unmatching this transaction"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setUnmatchModalRec(null)} className="os-secondary">Cancel</button>
                <button type="submit" disabled={modalSubmitting} className="os-primary bg-rose-600 hover:bg-rose-500 flex items-center gap-1">
                  <Ban size={13} /> {modalSubmitting ? 'Unmatching...' : 'Confirm Unmatch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* P2D Modal: Process Statutory Payment Modal (Admin/Owner Only) */}
      {processStatModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-500" /> Process Statutory Settlement Payment
              </h3>
              <button onClick={() => setProcessStatModal(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleProcessStatPaymentSubmit} className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Statutory Type:</span>
                  <strong className="font-bold text-sky-600 dark:text-sky-400 uppercase">{processStatModal.statutory_type || 'PF'}</strong>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Payable Settlement Amount:</span>
                  <strong className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                    ₹{parseFloat(processStatModal.payable_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Disbursement Bank Account</label>
                <select
                  value={processStatForm.bank_account_id}
                  onChange={e => setProcessStatForm({ ...processStatForm, bank_account_id: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                  required
                >
                  <option value="">Select Bank Account...</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_code} - {acc.account_name} ({acc.account_type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Government Portal Reference / Challan No</label>
                <input
                  type="text"
                  value={processStatForm.reference_no}
                  onChange={e => setProcessStatForm({ ...processStatForm, reference_no: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono"
                  placeholder="e.g. CRN-2026-998811"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setProcessStatModal(null)} className="os-secondary">Cancel</button>
                <button type="submit" disabled={modalSubmitting} className="os-primary bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1">
                  <Send size={13} /> {modalSubmitting ? 'Processing...' : 'Confirm Settlement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* P2E Modal: Payslip Preview Modal */}
      {payslipModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <FileText size={16} className="text-sky-500" /> Employee Authorized Payslip
              </h3>
              <button onClick={() => setPayslipModal(null)}><X size={16} /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 space-y-1.5">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500">Payslip SHA-256 Hash:</span>
                  <span className="font-bold text-sky-700 dark:text-sky-300 text-[10px] break-all">{payslipModal.data?.payslip_hash || 'SHA256-GEN-OK'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Employee:</span>
                  <strong className="font-bold">{payslipModal.data?.employee_name || 'Employee'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Masked Bank Account:</span>
                  <strong className="font-mono text-slate-700 dark:text-slate-300">{maskBankAccount(payslipModal.data?.bank_account_no || payslipModal.item?.bank_account_no)}</strong>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500">Net Pay Disbursed:</span>
                  <strong className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    ₹{parseFloat(payslipModal.data?.net_pay || payslipModal.item?.net_pay || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] text-slate-400 italic">HTML payslip is held transiently in memory and will be discarded upon modal close.</span>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setPayslipModal(null)} className="os-secondary">Close</button>
                  {payslipModal.data?.content && (
                    <button
                      type="button"
                      onClick={() => downloadFile(payslipModal.data.content, payslipModal.data.file_name || `Payslip_${payslipModal.item?.employee_id}.html`, payslipModal.data.mime_type || 'text/html')}
                      className="os-primary bg-sky-600 hover:bg-sky-500 flex items-center gap-1"
                    >
                      <Download size={13} /> Download Payslip HTML
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
