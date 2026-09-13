import { useState, useMemo } from 'react';
import { useEmployee } from '../../context/EmployeeContext';
import { useCrm } from '../../context/CrmContext';
import {
  Users, Search, Filter, Plus, Edit2, Eye, EyeOff, X, Save, Trash2, CheckCircle2,
  AlertCircle, ShieldCheck, ShieldAlert, Building2, UserPlus, FileText, Landmark,
  Heart, CheckSquare, Settings, Lock
} from 'lucide-react';

export default function EmployeeWorkspace() {
  const {
    employees,
    departments,
    designations,
    employeeCompanyAssignments,
    employeeFieldDefinitions,
    employeeFieldConfigurations,
    employeeFieldValues,
    employeePfDetails,
    employeeEsiDetails,
    employeeTaxDetails,
    employeeBankAccounts,
    employeeDependents,
    employeeNominees,
    employeeDocuments,
    isLoading,
    isManagementOrAdmin,
    fetchEmployeeSubRecords,
    saveEmployee,
    saveDepartment,
    saveDesignation,
    savePfDetails,
    saveEsiDetails,
    saveTaxDetails,
    saveBankAccount,
    saveDependent,
    deleteDependent,
    saveNominee,
    deleteNominee,
    saveDocument,
    deleteDocument,
    saveFieldValue,
    saveFieldDefinition,
    saveFieldConfiguration
  } = useEmployee();

  const crmContext = useCrm() || {};
  const { companies = [], activeOperatingCompanyId, isDarkMode } = crmContext;

  // View state: 'list' | 'config'
  const [viewMode, setViewMode] = useState('list');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('personal');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [desigFilter, setDesigFilter] = useState('ALL');
  const [companyFilter, setCompanyFilter] = useState('ALL');
  const [showSensitive, setShowSensitive] = useState(false);

  // Department & Designation Modal
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isDesigModalOpen, setIsDesigModalOpen] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: '', code: '', description: '' });
  const [desigForm, setDesigForm] = useState({ name: '', code: '', grade: '', description: '' });

  // Form State for Employee
  const [empForm, setEmpForm] = useState({
    id: null,
    employee_code: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    display_name: '',
    date_of_birth: '',
    gender: 'Male',
    marital_status: 'Single',
    blood_group: 'A+',
    personal_mobile: '',
    personal_email: '',
    official_email: '',
    photo_url: '',
    father_name: '',
    mother_name: '',
    spouse_name: '',
    emergency_contact_name: '',
    permanent_address: '',
    permanent_city: '',
    permanent_state: '',
    permanent_pin: '',
    permanent_country: 'India',
    current_address: '',
    current_city: '',
    current_state: '',
    current_pin: '',
    current_country: 'India',
    same_as_permanent: false,
    joining_date: '',
    confirmation_date: '',
    employment_status: 'Active',
    employment_type: 'Permanent',
    department_id: '',
    designation_id: '',
    grade: '',
    cost_centre: '',
    employee_category: 'Regular',
    shift: 'General',
    exit_reason: '',
    tenant_company_id: ''
  });

  const [assignedCompanies, setAssignedCompanies] = useState([]);

  // Sub-record Form States
  const [pfForm, setPfForm] = useState({ pf_applicable: true, uan: '', pf_member_id: '', previous_uan: '', pf_joining_date: '', pf_exit_date: '', eps_applicable: true, edli_applicable: true, pf_wage: '', nomination_status: 'Pending', bank_kyc_verified: false });
  const [esiForm, setEsiForm] = useState({ esi_applicable: false, registration_date: '', exit_date: '', aadhaar_linked: false });
  const [taxForm, setTaxForm] = useState({ pan: '', tax_regime: 'New', tds_applicable: true });
  const [bankForm, setBankForm] = useState({ account_holder_name: '', bank_name: '', account_number: '', ifsc_code: '', account_type: 'Savings', verification_status: 'Unverified' });

  // New item sub-forms
  const [depForm, setDepForm] = useState({ name: '', relationship: 'Spouse', date_of_birth: '', gender: 'Female', is_dependent: true, mobile: '', address: '' });
  const [nomForm, setNomForm] = useState({ nominee_name: '', relationship: 'Spouse', percentage: 100, nomination_category: 'PF' });
  const [docForm, setDocForm] = useState({ document_name: '', document_type: 'Identity', issue_date: '', expiry_date: '', verification_status: 'Pending' });

  // Configurable fields state for modal employee
  const [fieldValueMap, setFieldValueMap] = useState({});

  // Feedback Toast
  const [toast, setToast] = useState(null);
  const showToast = (msg, tone = 'emerald') => {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 3000);
  };

  // Helper mask function for sensitive fields
  const maskValue = (val) => {
    if (!val) return '—';
    if (showSensitive) return val;
    if (val.length <= 4) return '****';
    return '•'.repeat(val.length - 4) + val.slice(-4);
  };

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      // Non-sensitive search fields only (Code, Name, Official Email, Personal Mobile)
      const q = searchQuery.toLowerCase().trim();
      const codeMatch = (emp.employee_code || '').toLowerCase().includes(q);
      const nameMatch = `${emp.first_name || ''} ${emp.last_name || ''} ${emp.display_name || ''}`.toLowerCase().includes(q);
      const emailMatch = (emp.official_email || '').toLowerCase().includes(q);
      const mobileMatch = (emp.personal_mobile || '').toLowerCase().includes(q);

      const matchesSearch = !q || codeMatch || nameMatch || emailMatch || mobileMatch;
      const matchesStatus = statusFilter === 'ALL' || emp.employment_status === statusFilter;
      const matchesType = typeFilter === 'ALL' || emp.employment_type === typeFilter;
      const matchesDept = deptFilter === 'ALL' || emp.department_id === deptFilter;
      const matchesDesig = desigFilter === 'ALL' || emp.designation_id === desigFilter;
      const matchesCompany = companyFilter === 'ALL' || emp.tenant_company_id === companyFilter;

      return matchesSearch && matchesStatus && matchesType && matchesDept && matchesDesig && matchesCompany;
    });
  }, [employees, searchQuery, statusFilter, typeFilter, deptFilter, desigFilter, companyFilter]);

  // Open Modal for Add/Edit
  const handleOpenModal = (emp = null) => {
    if (emp) {
      setSelectedEmployee(emp);
      setEmpForm({
        id: emp.id,
        employee_code: emp.employee_code || '',
        first_name: emp.first_name || '',
        middle_name: emp.middle_name || '',
        last_name: emp.last_name || '',
        display_name: emp.display_name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
        date_of_birth: emp.date_of_birth || '',
        gender: emp.gender || 'Male',
        marital_status: emp.marital_status || 'Single',
        blood_group: emp.blood_group || 'A+',
        personal_mobile: emp.personal_mobile || '',
        personal_email: emp.personal_email || '',
        official_email: emp.official_email || '',
        photo_url: emp.photo_url || '',
        father_name: emp.father_name || '',
        mother_name: emp.mother_name || '',
        spouse_name: emp.spouse_name || '',
        emergency_contact_name: emp.emergency_contact_name || '',
        permanent_address: emp.permanent_address || '',
        permanent_city: emp.permanent_city || '',
        permanent_state: emp.permanent_state || '',
        permanent_pin: emp.permanent_pin || '',
        permanent_country: emp.permanent_country || 'India',
        current_address: emp.current_address || '',
        current_city: emp.current_city || '',
        current_state: emp.current_state || '',
        current_pin: emp.current_pin || '',
        current_country: emp.current_country || 'India',
        same_as_permanent: false,
        joining_date: emp.joining_date || '',
        confirmation_date: emp.confirmation_date || '',
        employment_status: emp.employment_status || 'Active',
        employment_type: emp.employment_type || 'Permanent',
        department_id: emp.department_id || '',
        designation_id: emp.designation_id || '',
        grade: emp.grade || '',
        cost_centre: emp.cost_centre || '',
        employee_category: emp.employee_category || 'Regular',
        shift: emp.shift || 'General',
        exit_reason: emp.exit_reason || '',
        tenant_company_id: emp.tenant_company_id || activeOperatingCompanyId || ''
      });

      // Load assigned company IDs
      const assigned = employeeCompanyAssignments
        .filter(a => a.employee_id === emp.id)
        .map(a => a.tenant_company_id);
      setAssignedCompanies(assigned.length ? assigned : [emp.tenant_company_id].filter(Boolean));

      // Fetch sub records
      fetchEmployeeSubRecords(emp.id);

      // Populate custom field values map
      const empVals = {};
      employeeFieldValues.filter(v => v.employee_id === emp.id).forEach(v => {
        empVals[v.field_definition_id] = v.value || '';
      });
      setFieldValueMap(empVals);
    } else {
      setSelectedEmployee(null);
      const nextCode = `EMP-${String(employees.length + 1).padStart(3, '0')}`;
      setEmpForm({
        id: null,
        employee_code: nextCode,
        first_name: '',
        middle_name: '',
        last_name: '',
        display_name: '',
        date_of_birth: '',
        gender: 'Male',
        marital_status: 'Single',
        blood_group: 'A+',
        personal_mobile: '',
        personal_email: '',
        official_email: '',
        photo_url: '',
        father_name: '',
        mother_name: '',
        spouse_name: '',
        emergency_contact_name: '',
        permanent_address: '',
        permanent_city: '',
        permanent_state: '',
        permanent_pin: '',
        permanent_country: 'India',
        current_address: '',
        current_city: '',
        current_state: '',
        current_pin: '',
        current_country: 'India',
        same_as_permanent: false,
        joining_date: new Date().toISOString().split('T')[0],
        confirmation_date: '',
        employment_status: 'Active',
        employment_type: 'Permanent',
        department_id: departments[0]?.id || '',
        designation_id: designations[0]?.id || '',
        grade: '',
        cost_centre: '',
        employee_category: 'Regular',
        shift: 'General',
        exit_reason: '',
        tenant_company_id: activeOperatingCompanyId || companies[0]?.id || ''
      });
      setAssignedCompanies([activeOperatingCompanyId || companies[0]?.id].filter(Boolean));
      setFieldValueMap({});
    }
    setModalTab('personal');
    setIsModalOpen(true);
  };

  // Sync sub-record forms when employee sub-records update
  useMemo(() => {
    if (selectedEmployee) {
      if (employeePfDetails.length > 0) {
        setPfForm(employeePfDetails[0]);
      } else {
        setPfForm({ pf_applicable: true, uan: '', pf_member_id: '', previous_uan: '', pf_joining_date: '', pf_exit_date: '', eps_applicable: true, edli_applicable: true, pf_wage: '', nomination_status: 'Pending', bank_kyc_verified: false });
      }
      if (employeeEsiDetails.length > 0) {
        setEsiForm(employeeEsiDetails[0]);
      } else {
        setEsiForm({ esi_applicable: false, registration_date: '', exit_date: '', aadhaar_linked: false });
      }
      if (employeeTaxDetails.length > 0) {
        setTaxForm(employeeTaxDetails[0]);
      } else {
        setTaxForm({ pan: '', tax_regime: 'New', tds_applicable: true });
      }
      if (employeeBankAccounts.length > 0) {
        setBankForm(employeeBankAccounts[0]);
      } else {
        setBankForm({ account_holder_name: '', bank_name: '', account_number: '', ifsc_code: '', account_type: 'Savings', verification_status: 'Unverified' });
      }
    }
  }, [selectedEmployee, employeePfDetails, employeeEsiDetails, employeeTaxDetails, employeeBankAccounts]);

  // Handle Address "Same as Permanent"
  const handleSameAddressChange = (checked) => {
    if (checked) {
      setEmpForm(prev => ({
        ...prev,
        same_as_permanent: true,
        current_address: prev.permanent_address,
        current_city: prev.permanent_city,
        current_state: prev.permanent_state,
        current_pin: prev.permanent_pin,
        current_country: prev.permanent_country
      }));
    } else {
      setEmpForm(prev => ({ ...prev, same_as_permanent: false }));
    }
  };

  // Save Main Employee Record
  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    if (!empForm.employee_code.trim() || !empForm.first_name.trim()) {
      showToast('Employee Code and First Name are required.', 'rose');
      return;
    }

    const displayName = empForm.display_name.trim() || `${empForm.first_name} ${empForm.last_name}`.trim();
    const payload = { ...empForm, display_name: displayName };
    delete payload.same_as_permanent;

    const res = await saveEmployee(payload, assignedCompanies);
    if (res.success) {
      showToast('Employee record saved successfully!', 'emerald');
      setIsModalOpen(false);
    } else {
      showToast(`Error: ${res.error}`, 'rose');
    }
  };

  // Save Sub Record Handlers
  const handleSavePf = async () => {
    if (!selectedEmployee?.id) return;
    const res = await savePfDetails({ ...pfForm, employee_id: selectedEmployee.id });
    if (res.success) showToast('PF Details saved!', 'emerald');
    else showToast(`Error: ${res.error}`, 'rose');
  };

  const handleSaveEsi = async () => {
    if (!selectedEmployee?.id) return;
    const res = await saveEsiDetails({ ...esiForm, employee_id: selectedEmployee.id });
    if (res.success) showToast('ESI Details saved!', 'emerald');
    else showToast(`Error: ${res.error}`, 'rose');
  };

  const handleSaveTax = async () => {
    if (!selectedEmployee?.id) return;
    const res = await saveTaxDetails({ ...taxForm, employee_id: selectedEmployee.id });
    if (res.success) showToast('Tax Details saved!', 'emerald');
    else showToast(`Error: ${res.error}`, 'rose');
  };

  const handleSaveBank = async () => {
    if (!selectedEmployee?.id) return;
    const res = await saveBankAccount({ ...bankForm, employee_id: selectedEmployee.id });
    if (res.success) showToast('Bank Account saved!', 'emerald');
    else showToast(`Error: ${res.error}`, 'rose');
  };

  const handleAddDependent = async (e) => {
    e.preventDefault();
    if (!selectedEmployee?.id || !depForm.name.trim()) return;
    const res = await saveDependent({ ...depForm, employee_id: selectedEmployee.id });
    if (res.success) {
      showToast('Dependent added!', 'emerald');
      setDepForm({ name: '', relationship: 'Spouse', date_of_birth: '', gender: 'Female', is_dependent: true, mobile: '', address: '' });
    } else showToast(`Error: ${res.error}`, 'rose');
  };

  const handleAddNominee = async (e) => {
    e.preventDefault();
    if (!selectedEmployee?.id || !nomForm.nominee_name.trim()) return;
    // Validate nominee percentage total <= 100
    const currentTotal = employeeNominees.reduce((acc, n) => acc + (Number(n.percentage) || 0), 0);
    if (currentTotal + Number(nomForm.percentage) > 100) {
      showToast(`Total nominee share cannot exceed 100% (Current total: ${currentTotal}%).`, 'rose');
      return;
    }

    const res = await saveNominee({ ...nomForm, employee_id: selectedEmployee.id });
    if (res.success) {
      showToast('Nominee added!', 'emerald');
      setNomForm({ nominee_name: '', relationship: 'Spouse', percentage: 100, nomination_category: 'PF' });
    } else showToast(`Error: ${res.error}`, 'rose');
  };

  const handleAddDocument = async (e) => {
    e.preventDefault();
    if (!selectedEmployee?.id || !docForm.document_name.trim()) return;
    const res = await saveDocument({ ...docForm, employee_id: selectedEmployee.id });
    if (res.success) {
      showToast('Document record added!', 'emerald');
      setDocForm({ document_name: '', document_type: 'Identity', issue_date: '', expiry_date: '', verification_status: 'Pending' });
    } else showToast(`Error: ${res.error}`, 'rose');
  };

  const handleSaveFieldValueClick = async (defId, val) => {
    if (!selectedEmployee?.id) return;
    const res = await saveFieldValue({ employee_id: selectedEmployee.id, field_definition_id: defId, value: val });
    if (res.success) showToast('Custom field record saved!', 'emerald');
    else showToast(`Error: ${res.error}`, 'rose');
  };

  // Department & Designation Quick Add
  const handleSaveDept = async (e) => {
    e.preventDefault();
    if (!deptForm.name.trim()) return;
    const res = await saveDepartment(deptForm);
    if (res.success) {
      showToast('Department created!', 'emerald');
      setIsDeptModalOpen(false);
      setDeptForm({ name: '', code: '', description: '' });
    } else showToast(`Error: ${res.error}`, 'rose');
  };

  const handleSaveDesig = async (e) => {
    e.preventDefault();
    if (!desigForm.name.trim()) return;
    const res = await saveDesignation(desigForm);
    if (res.success) {
      showToast('Designation created!', 'emerald');
      setIsDesigModalOpen(false);
      setDesigForm({ name: '', code: '', grade: '', description: '' });
    } else showToast(`Error: ${res.error}`, 'rose');
  };

  // Active Enabled Configurations
  const activeConfigurations = useMemo(() => {
    return employeeFieldDefinitions.map(def => {
      const config = employeeFieldConfigurations.find(c => c.field_definition_id === def.id);
      return {
        definition: def,
        configuration: config || { enabled: true, required: false, sensitive: false, display_order: 10 }
      };
    }).sort((a, b) => (a.configuration.display_order || 0) - (b.configuration.display_order || 0));
  }, [employeeFieldDefinitions, employeeFieldConfigurations]);

  // Card tone helper
  const tCard = isDarkMode ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800 shadow-sm";
  const tInput = isDarkMode ? "bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-500" : "bg-white border-slate-300 text-slate-800 shadow-sm placeholder:text-slate-400";
  const tMuted = isDarkMode ? "text-slate-400" : "text-slate-500";

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

      {/* HEADER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-sky-600 via-indigo-600 to-slate-800 p-5 rounded-2xl text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Users size={22} className="text-sky-300" />
            <h1 className="text-xl font-black tracking-tight">Employee Master P0</h1>
          </div>
          <p className="text-xs text-sky-100 mt-1">
            Centralized HR Repository • {employees.length} Employees Loaded
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowSensitive(prev => !prev)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white backdrop-blur transition flex items-center gap-1.5"
            title="Toggle sensitive field masking"
          >
            {showSensitive ? <EyeOff size={14} /> : <Eye size={14} />}
            {showSensitive ? 'Mask Sensitive Info' : 'Show Sensitive Info'}
          </button>

          {isManagementOrAdmin && (
            <button
              onClick={() => setViewMode(prev => prev === 'list' ? 'config' : 'list')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/15 hover:bg-white/25 text-white backdrop-blur transition flex items-center gap-1.5"
            >
              <Settings size={14} />
              {viewMode === 'list' ? 'Configure Records' : 'Back to Employee List'}
            </button>
          )}

          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 rounded-xl text-xs font-black bg-white text-sky-900 hover:bg-sky-50 shadow-md transition flex items-center gap-1.5"
          >
            <UserPlus size={15} />
            Add Employee
          </button>
        </div>
      </div>

      {/* VIEW MODE: CONFIGURATION SCREEN (MANAGEMENT/ADMIN ONLY) */}
      {viewMode === 'config' ? (
        <div className={`p-5 rounded-2xl border ${tCard} space-y-4`}>
          <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Settings size={16} className="text-sky-500" />
                Employee Record Definition & Configuration
              </h2>
              <p className={`text-xs mt-0.5 ${tMuted}`}>
                Manage system field configurations per operating company. Restricted to management/admin roles.
              </p>
            </div>
            {!isManagementOrAdmin && (
              <span className="text-xs font-bold text-rose-500 flex items-center gap-1">
                <Lock size={13} /> Read-only (Junior HR)
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="p-2.5">Field Key / Label</th>
                  <th className="p-2.5">Field Type</th>
                  <th className="p-2.5 text-center">Enabled</th>
                  <th className="p-2.5 text-center">Required</th>
                  <th className="p-2.5 text-center">Sensitive</th>
                  <th className="p-2.5 text-center">Display Order</th>
                  <th className="p-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeConfigurations.map(({ definition: def, configuration: config }) => (
                  <tr key={def.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                    <td className="p-2.5 font-bold">
                      {def.label}
                      <span className="block text-[10px] font-normal text-slate-400">{def.field_key}</span>
                    </td>
                    <td className="p-2.5 font-mono text-[11px]">{def.field_type}</td>
                    <td className="p-2.5 text-center">
                      <input
                        type="checkbox"
                        disabled={!isManagementOrAdmin}
                        checked={config.enabled !== false}
                        onChange={e => saveFieldConfiguration({ field_definition_id: def.id, enabled: e.target.checked })}
                        className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                    </td>
                    <td className="p-2.5 text-center">
                      <input
                        type="checkbox"
                        disabled={!isManagementOrAdmin}
                        checked={Boolean(config.required)}
                        onChange={e => saveFieldConfiguration({ field_definition_id: def.id, required: e.target.checked })}
                        className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                    </td>
                    <td className="p-2.5 text-center">
                      <input
                        type="checkbox"
                        disabled={!isManagementOrAdmin}
                        checked={Boolean(config.sensitive)}
                        onChange={e => saveFieldConfiguration({ field_definition_id: def.id, sensitive: e.target.checked })}
                        className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                    </td>
                    <td className="p-2.5 text-center">
                      <input
                        type="number"
                        disabled={!isManagementOrAdmin}
                        value={config.display_order || 10}
                        onChange={e => saveFieldConfiguration({ field_definition_id: def.id, display_order: Number(e.target.value) })}
                        className={`w-16 p-1 text-center rounded text-xs border ${tInput}`}
                      />
                    </td>
                    <td className="p-2.5 text-right">
                      {isManagementOrAdmin ? (
                        <span className="text-[10px] font-bold text-emerald-600">Configured</span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Locked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VIEW MODE: EMPLOYEE LIST & FILTERS */
        <div className="space-y-4">
          {/* SEARCH & FILTERS BAR */}
          <div className={`p-4 rounded-2xl border ${tCard} space-y-3`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2.5">
              {/* Search Box (Non-Sensitive) */}
              <div className="lg:col-span-2 relative">
                <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search code, name, email, mobile..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border outline-none focus:border-sky-500 ${tInput}`}
                />
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className={`w-full py-2 px-2.5 text-xs rounded-xl border outline-none focus:border-sky-500 ${tInput}`}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Probation">Probation</option>
                  <option value="Notice Period">Notice Period</option>
                  <option value="Resigned">Resigned</option>
                  <option value="Terminated">Terminated</option>
                  <option value="Retired">Retired</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  className={`w-full py-2 px-2.5 text-xs rounded-xl border outline-none focus:border-sky-500 ${tInput}`}
                >
                  <option value="ALL">All Types</option>
                  <option value="Permanent">Permanent</option>
                  <option value="Contract">Contract</option>
                  <option value="Temporary">Temporary</option>
                  <option value="Consultant">Consultant</option>
                  <option value="Apprentice">Apprentice</option>
                  <option value="Intern">Intern</option>
                </select>
              </div>

              {/* Department Filter */}
              <div>
                <select
                  value={deptFilter}
                  onChange={e => setDeptFilter(e.target.value)}
                  className={`w-full py-2 px-2.5 text-xs rounded-xl border outline-none focus:border-sky-500 ${tInput}`}
                >
                  <option value="ALL">All Departments</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {/* Company Filter */}
              <div>
                <select
                  value={companyFilter}
                  onChange={e => setCompanyFilter(e.target.value)}
                  className={`w-full py-2 px-2.5 text-xs rounded-xl border outline-none focus:border-sky-500 ${tInput}`}
                >
                  <option value="ALL">All Companies</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Actions & Meta */}
            <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className={`text-[11px] ${tMuted}`}>
                Showing <b>{filteredEmployees.length}</b> of <b>{employees.length}</b> employee records
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDeptModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-1"
                >
                  <Building2 size={12} /> Add Department
                </button>
                <button
                  onClick={() => setIsDesigModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-1"
                >
                  <UserPlus size={12} /> Add Designation
                </button>
              </div>
            </div>
          </div>

          {/* EMPLOYEE LIST TABLE */}
          <div className={`p-4 rounded-2xl border ${tCard} overflow-hidden`}>
            {isLoading ? (
              <div className="p-8 text-center text-xs italic text-slate-400">Loading employee master data...</div>
            ) : filteredEmployees.length === 0 ? (
              <div className="p-10 text-center space-y-3">
                <Users size={32} className="mx-auto text-slate-300 dark:text-slate-700" />
                <p className="text-xs italic text-slate-400">No employee records match the selected filters.</p>
                <button
                  onClick={() => handleOpenModal()}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-600 text-white hover:bg-sky-500 transition"
                >
                  Create First Employee
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="py-3 px-3">Code & Name</th>
                      <th className="py-3 px-3">Department</th>
                      <th className="py-3 px-3">Designation</th>
                      <th className="py-3 px-3">Primary Company</th>
                      <th className="py-3 px-3">Location</th>
                      <th className="py-3 px-3">Joining Date</th>
                      <th className="py-3 px-3">Type</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {filteredEmployees.map(emp => {
                      const dept = departments.find(d => d.id === emp.department_id);
                      const desig = designations.find(d => d.id === emp.designation_id);
                      const comp = companies.find(c => c.id === emp.tenant_company_id);

                      return (
                        <tr key={emp.id} className="hover:bg-sky-50/40 dark:hover:bg-slate-800/50 transition">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                                {(emp.first_name || 'E')[0]}
                              </div>
                              <div>
                                <p className="font-bold text-sky-950 dark:text-sky-100">
                                  {emp.display_name || `${emp.first_name} ${emp.last_name}`}
                                </p>
                                <span className="text-[10px] font-mono text-sky-600 dark:text-sky-400 font-bold">
                                  {emp.employee_code}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-medium">{dept?.name || '—'}</td>
                          <td className="py-3 px-3 font-medium">{desig?.name || '—'}</td>
                          <td className="py-3 px-3 text-slate-500">{comp?.name || '—'}</td>
                          <td className="py-3 px-3 text-slate-500">{emp.current_city || emp.permanent_city || '—'}</td>
                          <td className="py-3 px-3 font-mono text-[11px]">{emp.joining_date || '—'}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {emp.employment_type || 'Permanent'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              emp.employment_status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' :
                              emp.employment_status === 'Probation' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' :
                              emp.employment_status === 'Notice Period' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400' :
                              'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                              {emp.employment_status || 'Active'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleOpenModal(emp)}
                              className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-100 dark:hover:bg-sky-950 transition"
                              title="Edit Employee Master Record"
                            >
                              <Edit2 size={14} />
                            </button>
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

      {/* ADD / EDIT EMPLOYEE MODAL DRAWER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in">
          <div className={`w-full max-w-4xl h-full ${tCard} flex flex-col shadow-2xl border-l`}>
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <UserPlus size={18} className="text-sky-500" />
                  {selectedEmployee ? `Edit Employee: ${empForm.display_name || empForm.employee_code}` : 'Create New Employee Record'}
                </h2>
                <p className={`text-xs ${tMuted}`}>
                  {selectedEmployee ? `Employee Code: ${empForm.employee_code}` : 'Enter personal, employment, compliance, and custom field details.'}
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex gap-1 overflow-x-auto p-2 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0">
              {[
                ['personal', 'Personal & Address'],
                ['employment', 'Employment & Company'],
                ['compliance', 'Statutory (PF/ESI/Tax)'],
                ['bank', 'Bank Accounts'],
                ['family', 'Family & Nominees'],
                ['documents', 'Documents'],
                ['custom', 'Configurable Fields']
              ].map(([tabKey, tabLabel]) => (
                <button
                  key={tabKey}
                  onClick={() => setModalTab(tabKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    modalTab === tabKey
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {tabLabel}
                </button>
              ))}
            </div>

            {/* Modal Content Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* TAB 1: PERSONAL & ADDRESS */}
              {modalTab === 'personal' && (
                <div className="space-y-6">
                  <form onSubmit={handleSaveEmployee} className="space-y-5">
                    <div className="border-b pb-2 border-slate-200 dark:border-slate-800">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                        Section A — Basic Personal Details
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold mb-1">Employee Code *</label>
                        <input
                          type="text"
                          required
                          value={empForm.employee_code}
                          onChange={e => setEmpForm({ ...empForm, employee_code: e.target.value })}
                          className={`w-full p-2 rounded-xl border outline-none ${tInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1">First Name *</label>
                        <input
                          type="text"
                          required
                          value={empForm.first_name}
                          onChange={e => setEmpForm({ ...empForm, first_name: e.target.value })}
                          className={`w-full p-2 rounded-xl border outline-none ${tInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1">Middle Name</label>
                        <input
                          type="text"
                          value={empForm.middle_name}
                          onChange={e => setEmpForm({ ...empForm, middle_name: e.target.value })}
                          className={`w-full p-2 rounded-xl border outline-none ${tInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1">Last Name</label>
                        <input
                          type="text"
                          value={empForm.last_name}
                          onChange={e => setEmpForm({ ...empForm, last_name: e.target.value })}
                          className={`w-full p-2 rounded-xl border outline-none ${tInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1">Display Name</label>
                        <input
                          type="text"
                          value={empForm.display_name}
                          placeholder="Auto-generated if empty"
                          onChange={e => setEmpForm({ ...empForm, display_name: e.target.value })}
                          className={`w-full p-2 rounded-xl border outline-none ${tInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1">Date of Birth</label>
                        <input
                          type="date"
                          value={empForm.date_of_birth}
                          onChange={e => setEmpForm({ ...empForm, date_of_birth: e.target.value })}
                          className={`w-full p-2 rounded-xl border outline-none ${tInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1">Gender</label>
                        <select
                          value={empForm.gender}
                          onChange={e => setEmpForm({ ...empForm, gender: e.target.value })}
                          className={`w-full p-2 rounded-xl border outline-none ${tInput}`}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1">Marital Status</label>
                        <select
                          value={empForm.marital_status}
                          onChange={e => setEmpForm({ ...empForm, marital_status: e.target.value })}
                          className={`w-full p-2 rounded-xl border outline-none ${tInput}`}
                        >
                          <option value="Single">Single</option>
                          <option value="Married">Married</option>
                          <option value="Divorced">Divorced</option>
                          <option value="Widowed">Widowed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1">Blood Group</label>
                        <select
                          value={empForm.blood_group}
                          onChange={e => setEmpForm({ ...empForm, blood_group: e.target.value })}
                          className={`w-full p-2 rounded-xl border outline-none ${tInput}`}
                        >
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1">Personal Mobile</label>
                        <input
                          type="text"
                          value={empForm.personal_mobile}
                          onChange={e => setEmpForm({ ...empForm, personal_mobile: e.target.value })}
                          className={`w-full p-2 rounded-xl border outline-none ${tInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1">Personal Email</label>
                        <input
                          type="email"
                          value={empForm.personal_email}
                          onChange={e => setEmpForm({ ...empForm, personal_email: e.target.value })}
                          className={`w-full p-2 rounded-xl border outline-none ${tInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1">Official Email</label>
                        <input
                          type="email"
                          value={empForm.official_email}
                          onChange={e => setEmpForm({ ...empForm, official_email: e.target.value })}
                          className={`w-full p-2 rounded-xl border outline-none ${tInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1">Father Name</label>
                        <input
                          type="text"
                          value={empForm.father_name}
                          onChange={e => setEmpForm({ ...empForm, father_name: e.target.value })}
                          className={`w-full p-2 rounded-xl border outline-none ${tInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1">Mother Name</label>
                        <input
                          type="text"
                          value={empForm.mother_name}
                          onChange={e => setEmpForm({ ...empForm, mother_name: e.target.value })}
                          className={`w-full p-2 rounded-xl border outline-none ${tInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1">Emergency Contact Name</label>
                        <input
                          type="text"
                          value={empForm.emergency_contact_name}
                          onChange={e => setEmpForm({ ...empForm, emergency_contact_name: e.target.value })}
                          className={`w-full p-2 rounded-xl border outline-none ${tInput}`}
                        />
                      </div>
                    </div>

                    {/* ADDRESS SECTION */}
                    <div className="border-t pt-4 border-slate-200 dark:border-slate-800 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                        Address Details
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Permanent Address */}
                        <div className="space-y-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                          <h4 className="text-xs font-bold">Permanent Address</h4>
                          <textarea
                            rows={2}
                            placeholder="Street / House address"
                            value={empForm.permanent_address}
                            onChange={e => setEmpForm({ ...empForm, permanent_address: e.target.value })}
                            className={`w-full p-2 rounded-xl text-xs border outline-none ${tInput}`}
                          />
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <input
                              type="text"
                              placeholder="City"
                              value={empForm.permanent_city}
                              onChange={e => setEmpForm({ ...empForm, permanent_city: e.target.value })}
                              className={`p-1.5 rounded-lg border ${tInput}`}
                            />
                            <input
                              type="text"
                              placeholder="State"
                              value={empForm.permanent_state}
                              onChange={e => setEmpForm({ ...empForm, permanent_state: e.target.value })}
                              className={`p-1.5 rounded-lg border ${tInput}`}
                            />
                            <input
                              type="text"
                              placeholder="PIN Code"
                              value={empForm.permanent_pin}
                              onChange={e => setEmpForm({ ...empForm, permanent_pin: e.target.value })}
                              className={`p-1.5 rounded-lg border ${tInput}`}
                            />
                            <input
                              type="text"
                              placeholder="Country"
                              value={empForm.permanent_country}
                              onChange={e => setEmpForm({ ...empForm, permanent_country: e.target.value })}
                              className={`p-1.5 rounded-lg border ${tInput}`}
                            />
                          </div>
                        </div>

                        {/* Current Address */}
                        <div className="space-y-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold">Current Address</h4>
                            <label className="flex items-center gap-1 text-[11px] text-sky-600 font-bold cursor-pointer">
                              <input
                                type="checkbox"
                                checked={empForm.same_as_permanent}
                                onChange={e => handleSameAddressChange(e.target.checked)}
                                className="rounded border-slate-300 text-sky-600"
                              />
                              Same as Permanent
                            </label>
                          </div>
                          <textarea
                            rows={2}
                            placeholder="Current address"
                            disabled={empForm.same_as_permanent}
                            value={empForm.current_address}
                            onChange={e => setEmpForm({ ...empForm, current_address: e.target.value })}
                            className={`w-full p-2 rounded-xl text-xs border outline-none ${tInput}`}
                          />
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <input
                              type="text"
                              placeholder="City"
                              disabled={empForm.same_as_permanent}
                              value={empForm.current_city}
                              onChange={e => setEmpForm({ ...empForm, current_city: e.target.value })}
                              className={`p-1.5 rounded-lg border ${tInput}`}
                            />
                            <input
                              type="text"
                              placeholder="State"
                              disabled={empForm.same_as_permanent}
                              value={empForm.current_state}
                              onChange={e => setEmpForm({ ...empForm, current_state: e.target.value })}
                              className={`p-1.5 rounded-lg border ${tInput}`}
                            />
                            <input
                              type="text"
                              placeholder="PIN Code"
                              disabled={empForm.same_as_permanent}
                              value={empForm.current_pin}
                              onChange={e => setEmpForm({ ...empForm, current_pin: e.target.value })}
                              className={`p-1.5 rounded-lg border ${tInput}`}
                            />
                            <input
                              type="text"
                              placeholder="Country"
                              disabled={empForm.same_as_permanent}
                              value={empForm.current_country}
                              onChange={e => setEmpForm({ ...empForm, current_country: e.target.value })}
                              className={`p-1.5 rounded-lg border ${tInput}`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-3">
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-600 text-white hover:bg-sky-500 shadow-md transition flex items-center gap-1.5"
                      >
                        <Save size={14} /> Save Personal & Address Details
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 2: EMPLOYMENT & COMPANY */}
              {modalTab === 'employment' && (
                <form onSubmit={handleSaveEmployee} className="space-y-5">
                  <div className="border-b pb-2 border-slate-200 dark:border-slate-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                      Section B — Employment Details & Company Scope
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold mb-1">Joining Date *</label>
                      <input
                        type="date"
                        required
                        value={empForm.joining_date}
                        onChange={e => setEmpForm({ ...empForm, joining_date: e.target.value })}
                        className={`w-full p-2 rounded-xl border outline-none ${tInput}`}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold mb-1">Confirmation Date</label>
                      <input
                        type="date"
                        value={empForm.confirmation_date}
                        onChange={e => setEmpForm({ ...empForm, confirmation_date: e.target.value })}
                        className={`w-full p-2 rounded-xl border outline-none ${tInput}`}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold mb-1">Employment Status</label>
                      <select
                        value={empForm.employment_status}
                        onChange={e => setEmpForm({ ...empForm, employment_status: e.target.value })}
                        className={`w-full p-2 rounded-xl border outline-none ${tInput}`}
                      >
                        {['Active', 'Probation', 'Notice Period', 'Resigned', 'Terminated', 'Retired', 'Inactive'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold mb-1">Employment Type</label>
                      <select
                        value={empForm.employment_type}
                        onChange={e => setEmpForm({ ...empForm, employment_type: e.target.value })}
                        className={`w-full p-2 rounded-xl border outline-none ${tInput}`}
                      >
                        {['Permanent', 'Contract', 'Temporary', 'Consultant', 'Apprentice', 'Intern'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold mb-1">Department</label>
                      <select
                        value={empForm.department_id}
                        onChange={e => setEmpForm({ ...empForm, department_id: e.target.value })}
                        className={`w-full p-2 rounded-xl border outline-none ${tInput}`}
                      >
                        <option value="">Select Department</option>
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold mb-1">Designation</label>
                      <select
                        value={empForm.designation_id}
                        onChange={e => setEmpForm({ ...empForm, designation_id: e.target.value })}
                        className={`w-full p-2 rounded-xl border outline-none ${tInput}`}
                      >
                        <option value="">Select Designation</option>
                        {designations.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold mb-1">Grade</label>
                      <input
                        type="text"
                        placeholder="e.g. M1, E2"
                        value={empForm.grade}
                        onChange={e => setEmpForm({ ...empForm, grade: e.target.value })}
                        className={`w-full p-2 rounded-xl border outline-none ${tInput}`}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold mb-1">Cost Centre</label>
                      <input
                        type="text"
                        placeholder="e.g. CC-PROJECTS"
                        value={empForm.cost_centre}
                        onChange={e => setEmpForm({ ...empForm, cost_centre: e.target.value })}
                        className={`w-full p-2 rounded-xl border outline-none ${tInput}`}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold mb-1">Shift</label>
                      <input
                        type="text"
                        value={empForm.shift}
                        onChange={e => setEmpForm({ ...empForm, shift: e.target.value })}
                        className={`w-full p-2 rounded-xl border outline-none ${tInput}`}
                      />
                    </div>
                  </div>

                  {/* MULTI-COMPANY ASSIGNMENTS */}
                  <div className="border-t pt-4 border-slate-200 dark:border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold">Operating Company Assignments</h4>
                    <p className={`text-xs ${tMuted}`}>
                      Select primary operating company and additional authorized companies via <code className="text-sky-500 font-mono">employee_company_assignments</code>.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {companies.map(comp => {
                        const isPrimary = empForm.tenant_company_id === comp.id;
                        const isAssigned = assignedCompanies.includes(comp.id);

                        return (
                          <div
                            key={comp.id}
                            className={`p-3 rounded-xl border flex items-center justify-between ${
                              isPrimary ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/30' : 'border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            <label className="flex items-center gap-2 cursor-pointer font-bold">
                              <input
                                type="checkbox"
                                checked={isAssigned || isPrimary}
                                disabled={isPrimary}
                                onChange={e => {
                                  if (e.target.checked) {
                                    setAssignedCompanies(prev => [...prev, comp.id]);
                                  } else {
                                    setAssignedCompanies(prev => prev.filter(id => id !== comp.id));
                                  }
                                }}
                                className="rounded text-sky-600"
                              />
                              {comp.name}
                            </label>

                            <button
                              type="button"
                              onClick={() => {
                                setEmpForm({ ...empForm, tenant_company_id: comp.id });
                                if (!assignedCompanies.includes(comp.id)) {
                                  setAssignedCompanies(prev => [...prev, comp.id]);
                                }
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isPrimary ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                              }`}
                            >
                              {isPrimary ? 'Primary Scope' : 'Set as Primary'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-600 text-white hover:bg-sky-500 shadow-md transition flex items-center gap-1.5"
                    >
                      <Save size={14} /> Save Employment Details
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: STATUTORY & COMPLIANCE (PF, ESI, TAX) */}
              {modalTab === 'compliance' && (
                <div className="space-y-6 text-xs">
                  {/* PF Section */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h4 className="font-bold text-sky-600 flex items-center gap-1.5">
                        <ShieldCheck size={15} /> EPF / PF Details (employee_pf_details)
                      </h4>
                      <button
                        onClick={handleSavePf}
                        className="px-3 py-1 rounded-lg bg-sky-600 text-white text-[11px] font-bold"
                      >
                        Save PF Details
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <label className="flex items-center gap-2 font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pfForm.pf_applicable}
                          onChange={e => setPfForm({ ...pfForm, pf_applicable: e.target.checked })}
                          className="rounded text-sky-600"
                        />
                        PF Applicable
                      </label>
                      <div>
                        <label className="block text-[11px] font-bold mb-1">UAN (Universal Account No)</label>
                        <input
                          type="text"
                          value={showSensitive ? pfForm.uan : maskValue(pfForm.uan)}
                          onChange={e => setPfForm({ ...pfForm, uan: e.target.value })}
                          className={`w-full p-2 rounded-xl border ${tInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1">PF Member ID</label>
                        <input
                          type="text"
                          value={pfForm.pf_member_id}
                          onChange={e => setPfForm({ ...pfForm, pf_member_id: e.target.value })}
                          className={`w-full p-2 rounded-xl border ${tInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1">Previous UAN</label>
                        <input
                          type="text"
                          value={pfForm.previous_uan}
                          onChange={e => setPfForm({ ...pfForm, previous_uan: e.target.value })}
                          className={`w-full p-2 rounded-xl border ${tInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1">PF Joining Date</label>
                        <input
                          type="date"
                          value={pfForm.pf_joining_date}
                          onChange={e => setPfForm({ ...pfForm, pf_joining_date: e.target.value })}
                          className={`w-full p-2 rounded-xl border ${tInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1">PF Wage</label>
                        <input
                          type="number"
                          value={pfForm.pf_wage}
                          onChange={e => setPfForm({ ...pfForm, pf_wage: e.target.value })}
                          className={`w-full p-2 rounded-xl border ${tInput}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ESI Section */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h4 className="font-bold text-emerald-600 flex items-center gap-1.5">
                        <Heart size={15} /> ESI Details (employee_esi_details)
                      </h4>
                      <button
                        onClick={handleSaveEsi}
                        className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold"
                      >
                        Save ESI Details
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <label className="flex items-center gap-2 font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={esiForm.esi_applicable}
                          onChange={e => setEsiForm({ ...esiForm, esi_applicable: e.target.checked })}
                          className="rounded text-emerald-600"
                        />
                        ESI Applicable
                      </label>
                      <div>
                        <label className="block text-[11px] font-bold mb-1">Registration Date</label>
                        <input
                          type="date"
                          value={esiForm.registration_date}
                          onChange={e => setEsiForm({ ...esiForm, registration_date: e.target.value })}
                          className={`w-full p-2 rounded-xl border ${tInput}`}
                        />
                      </div>
                      <label className="flex items-center gap-2 font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={esiForm.aadhaar_linked}
                          onChange={e => setEsiForm({ ...esiForm, aadhaar_linked: e.target.checked })}
                          className="rounded text-emerald-600"
                        />
                        Aadhaar Linked with ESI
                      </label>
                    </div>
                  </div>

                  {/* Tax Section */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h4 className="font-bold text-amber-600 flex items-center gap-1.5">
                        <Landmark size={15} /> Income Tax / PAN Details (employee_tax_details)
                      </h4>
                      <button
                        onClick={handleSaveTax}
                        className="px-3 py-1 rounded-lg bg-amber-600 text-white text-[11px] font-bold"
                      >
                        Save Tax Details
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold mb-1">PAN Number</label>
                        <input
                          type="text"
                          value={showSensitive ? taxForm.pan : maskValue(taxForm.pan)}
                          onChange={e => setTaxForm({ ...taxForm, pan: e.target.value })}
                          className={`w-full p-2 rounded-xl border ${tInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1">Tax Regime</label>
                        <select
                          value={taxForm.tax_regime}
                          onChange={e => setTaxForm({ ...taxForm, tax_regime: e.target.value })}
                          className={`w-full p-2 rounded-xl border ${tInput}`}
                        >
                          <option value="New">New Tax Regime</option>
                          <option value="Old">Old Tax Regime</option>
                        </select>
                      </div>
                      <label className="flex items-center gap-2 font-bold cursor-pointer mt-5">
                        <input
                          type="checkbox"
                          checked={taxForm.tds_applicable}
                          onChange={e => setTaxForm({ ...taxForm, tds_applicable: e.target.checked })}
                          className="rounded text-amber-600"
                        />
                        TDS Applicable
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: BANK ACCOUNTS */}
              {modalTab === 'bank' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h4 className="font-bold text-sky-600 flex items-center gap-1.5">
                        <Landmark size={15} /> Primary Salary Bank Account (employee_bank_accounts)
                      </h4>
                      <button
                        onClick={handleSaveBank}
                        className="px-3 py-1 rounded-lg bg-sky-600 text-white text-[11px] font-bold"
                      >
                        Save Bank Account
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold mb-1">Account Holder Name</label>
                        <input
                          type="text"
                          value={bankForm.account_holder_name}
                          onChange={e => setBankForm({ ...bankForm, account_holder_name: e.target.value })}
                          className={`w-full p-2 rounded-xl border ${tInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1">Bank Name</label>
                        <input
                          type="text"
                          value={bankForm.bank_name}
                          onChange={e => setBankForm({ ...bankForm, bank_name: e.target.value })}
                          className={`w-full p-2 rounded-xl border ${tInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1">Account Number</label>
                        <input
                          type="text"
                          value={showSensitive ? bankForm.account_number : maskValue(bankForm.account_number)}
                          onChange={e => setBankForm({ ...bankForm, account_number: e.target.value })}
                          className={`w-full p-2 rounded-xl border ${tInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1">IFSC Code</label>
                        <input
                          type="text"
                          value={bankForm.ifsc_code}
                          onChange={e => setBankForm({ ...bankForm, ifsc_code: e.target.value })}
                          className={`w-full p-2 rounded-xl border ${tInput}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1">Account Type</label>
                        <select
                          value={bankForm.account_type}
                          onChange={e => setBankForm({ ...bankForm, account_type: e.target.value })}
                          className={`w-full p-2 rounded-xl border ${tInput}`}
                        >
                          <option value="Savings">Savings Account</option>
                          <option value="Salary">Salary Account</option>
                          <option value="Current">Current Account</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1">Verification Status</label>
                        <select
                          value={bankForm.verification_status}
                          onChange={e => setBankForm({ ...bankForm, verification_status: e.target.value })}
                          className={`w-full p-2 rounded-xl border ${tInput}`}
                        >
                          <option value="Unverified">Unverified</option>
                          <option value="Verified">Verified</option>
                          <option value="Pending">Pending</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: FAMILY & NOMINEES */}
              {modalTab === 'family' && (
                <div className="space-y-6 text-xs">
                  {/* Dependents */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-sky-600">Family Dependents (employee_dependents)</h4>
                    <form onSubmit={handleAddDependent} className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      <input
                        type="text"
                        required
                        placeholder="Dependent Name"
                        value={depForm.name}
                        onChange={e => setDepForm({ ...depForm, name: e.target.value })}
                        className={`p-2 rounded-lg border ${tInput}`}
                      />
                      <select
                        value={depForm.relationship}
                        onChange={e => setDepForm({ ...depForm, relationship: e.target.value })}
                        className={`p-2 rounded-lg border ${tInput}`}
                      >
                        {['Spouse', 'Child', 'Father', 'Mother', 'Sibling', 'Other'].map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      <input
                        type="date"
                        value={depForm.date_of_birth}
                        onChange={e => setDepForm({ ...depForm, date_of_birth: e.target.value })}
                        className={`p-2 rounded-lg border ${tInput}`}
                      />
                      <button type="submit" className="bg-sky-600 text-white font-bold rounded-lg p-2 hover:bg-sky-500">
                        + Add Dependent
                      </button>
                    </form>

                    <div className="space-y-1">
                      {employeeDependents.map(dep => (
                        <div key={dep.id} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="font-bold">{dep.name}</span> ({dep.relationship}) • DOB: {dep.date_of_birth || '—'}
                          </div>
                          <button onClick={() => deleteDependent(dep.id, selectedEmployee.id)} className="text-rose-500 hover:text-rose-700">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Nominees */}
                  <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-indigo-600">PF/ESI Nominees (employee_nominees)</h4>
                      <span className="text-[11px] text-slate-500 font-bold">
                        Total Share: {employeeNominees.reduce((a, n) => a + (Number(n.percentage) || 0), 0)}% / 100%
                      </span>
                    </div>

                    <form onSubmit={handleAddNominee} className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      <input
                        type="text"
                        required
                        placeholder="Nominee Name"
                        value={nomForm.nominee_name}
                        onChange={e => setNomForm({ ...nomForm, nominee_name: e.target.value })}
                        className={`p-2 rounded-lg border ${tInput}`}
                      />
                      <input
                        type="number"
                        min="1"
                        max="100"
                        placeholder="Share %"
                        value={nomForm.percentage}
                        onChange={e => setNomForm({ ...nomForm, percentage: Number(e.target.value) })}
                        className={`p-2 rounded-lg border ${tInput}`}
                      />
                      <select
                        value={nomForm.nomination_category}
                        onChange={e => setNomForm({ ...nomForm, nomination_category: e.target.value })}
                        className={`p-2 rounded-lg border ${tInput}`}
                      >
                        <option value="PF">PF Nomination</option>
                        <option value="ESI">ESI Nomination</option>
                        <option value="Gratuity">Gratuity Nomination</option>
                      </select>
                      <button type="submit" className="bg-indigo-600 text-white font-bold rounded-lg p-2 hover:bg-indigo-500">
                        + Add Nominee
                      </button>
                    </form>

                    <div className="space-y-1">
                      {employeeNominees.map(nom => (
                        <div key={nom.id} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="font-bold">{nom.nominee_name}</span> ({nom.relationship}) — <b className="text-indigo-600">{nom.percentage}%</b> [{nom.nomination_category}]
                          </div>
                          <button onClick={() => deleteNominee(nom.id, selectedEmployee.id)} className="text-rose-500 hover:text-rose-700">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: DOCUMENTS */}
              {modalTab === 'documents' && (
                <div className="space-y-4 text-xs">
                  <h4 className="font-bold text-sky-600">Employee Documents (employee_documents)</h4>
                  <form onSubmit={handleAddDocument} className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <input
                      type="text"
                      required
                      placeholder="Document Name (e.g. Passport, Offer Letter)"
                      value={docForm.document_name}
                      onChange={e => setDocForm({ ...docForm, document_name: e.target.value })}
                      className={`p-2 rounded-lg border ${tInput}`}
                    />
                    <select
                      value={docForm.document_type}
                      onChange={e => setDocForm({ ...docForm, document_type: e.target.value })}
                      className={`p-2 rounded-lg border ${tInput}`}
                    >
                      {['Identity', 'Education', 'Experience', 'Joining', 'Offer', 'Certification', 'Contract'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <input
                      type="date"
                      value={docForm.issue_date}
                      onChange={e => setDocForm({ ...docForm, issue_date: e.target.value })}
                      className={`p-2 rounded-lg border ${tInput}`}
                    />
                    <button type="submit" className="bg-sky-600 text-white font-bold rounded-lg p-2 hover:bg-sky-500">
                      + Add Record
                    </button>
                  </form>

                  <div className="space-y-1">
                    {employeeDocuments.map(doc => (
                      <div key={doc.id} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="font-bold">{doc.document_name}</span> [{doc.document_type}] • Issued: {doc.issue_date || '—'}
                        </div>
                        <button onClick={() => deleteDocument(doc.id, selectedEmployee.id)} className="text-rose-500 hover:text-rose-700">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 7: CONFIGURABLE EMPLOYEE RECORDS */}
              {modalTab === 'custom' && (
                <div className="space-y-4 text-xs">
                  <div className="border-b pb-2 border-slate-200 dark:border-slate-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                      Configurable Employee Records (employee_field_definitions & values)
                    </h3>
                    <p className={`text-xs mt-1 ${tMuted}`}>
                      Dynamically rendered based on active company configuration (e.g. Aadhaar, Voter ID, Passport, Notes).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeConfigurations.map(({ definition: def, configuration: config }) => {
                      if (config.enabled === false) return null; // Respect enabled configuration

                      const val = fieldValueMap[def.id] || '';

                      return (
                        <div key={def.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                          <label className="block font-bold">
                            {def.label} {config.required && <span className="text-rose-500">*</span>}
                          </label>
                          <div className="flex gap-2">
                            <input
                              type={config.sensitive && !showSensitive ? "password" : "text"}
                              placeholder={`Enter ${def.label}`}
                              value={val}
                              onChange={e => setFieldValueMap({ ...fieldValueMap, [def.id]: e.target.value })}
                              className={`flex-1 p-2 rounded-lg border outline-none ${tInput}`}
                            />
                            <button
                              onClick={() => handleSaveFieldValueClick(def.id, val)}
                              className="px-3 py-1 bg-sky-600 text-white font-bold rounded-lg text-[11px] hover:bg-sky-500 shrink-0"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DEPARTMENT MODAL */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-md ${tCard} p-5 rounded-2xl space-y-4 border shadow-2xl`}>
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm">Add New Department</h3>
              <button onClick={() => setIsDeptModalOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSaveDept} className="space-y-3 text-xs">
              <input
                type="text"
                required
                placeholder="Department Name *"
                value={deptForm.name}
                onChange={e => setDeptForm({ ...deptForm, name: e.target.value })}
                className={`w-full p-2 rounded-xl border ${tInput}`}
              />
              <input
                type="text"
                placeholder="Department Code (e.g. HR, ENG)"
                value={deptForm.code}
                onChange={e => setDeptForm({ ...deptForm, code: e.target.value })}
                className={`w-full p-2 rounded-xl border ${tInput}`}
              />
              <textarea
                placeholder="Description"
                value={deptForm.description}
                onChange={e => setDeptForm({ ...deptForm, description: e.target.value })}
                className={`w-full p-2 rounded-xl border ${tInput}`}
              />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsDeptModalOpen(false)} className="px-3 py-1.5 rounded-lg border">Cancel</button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-sky-600 text-white font-bold">Save Department</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DESIGNATION MODAL */}
      {isDesigModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-md ${tCard} p-5 rounded-2xl space-y-4 border shadow-2xl`}>
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm">Add New Designation</h3>
              <button onClick={() => setIsDesigModalOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSaveDesig} className="space-y-3 text-xs">
              <input
                type="text"
                required
                placeholder="Designation Name *"
                value={desigForm.name}
                onChange={e => setDesigForm({ ...desigForm, name: e.target.value })}
                className={`w-full p-2 rounded-xl border ${tInput}`}
              />
              <input
                type="text"
                placeholder="Designation Code (e.g. PM, SE)"
                value={desigForm.code}
                onChange={e => setDesigForm({ ...desigForm, code: e.target.value })}
                className={`w-full p-2 rounded-xl border ${tInput}`}
              />
              <input
                type="text"
                placeholder="Grade / Level (e.g. M1)"
                value={desigForm.grade}
                onChange={e => setDesigForm({ ...desigForm, grade: e.target.value })}
                className={`w-full p-2 rounded-xl border ${tInput}`}
              />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsDesigModalOpen(false)} className="px-3 py-1.5 rounded-lg border">Cancel</button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-sky-600 text-white font-bold">Save Designation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
