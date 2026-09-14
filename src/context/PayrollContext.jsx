import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useCrm } from './CrmContext';
import { useEmployee } from './EmployeeContext';
import { useAttendance } from './AttendanceContext';
import { useLeave } from './LeaveContext';

const PayrollContext = createContext(null);

export function PayrollProvider({ children }) {
  const crmContext = useCrm() || {};
  const {
    tenantId,
    activeOperatingCompanyId,
    userRole,
    tenantRole,
    currentUser,
    session
  } = crmContext;

  const { employees = [] } = useEmployee() || {};
  const { attendanceDailyRecords = [] } = useAttendance() || {};
  const { leaveRequests = [] } = useLeave() || {};

  const authUserId = session?.user?.id || currentUser?.id;

  // Role Management check aligned with existing Business OS role model (OWNER / ADMIN / MANAGER)
  const isManagementOrAdmin = useMemo(() => {
    const r = (userRole || '').toLowerCase();
    const tr = (tenantRole || '').toLowerCase();
    const allowed = ['owner', 'admin', 'manager'];
    return allowed.includes(r) || allowed.includes(tr);
  }, [userRole, tenantRole]);

  // Admin-only role check for authoritative backend approval workflows
  const isAdmin = useMemo(() => {
    const r = (userRole || '').toLowerCase();
    const tr = (tenantRole || '').toLowerCase();
    const allowed = ['owner', 'admin'];
    return allowed.includes(r) || allowed.includes(tr);
  }, [userRole, tenantRole]);

  // Primary State Collections connected to live Supabase Payroll Foundation tables
  const [payrollSettings, setPayrollSettings] = useState(null);
  const [payrollComponents, setPayrollComponents] = useState([]);
  const [statutoryRules, setStatutoryRules] = useState([]);
  const [employeeSalaryStructures, setEmployeeSalaryStructures] = useState([]);
  const [salaryStructureItems, setSalaryStructureItems] = useState([]);
  const [payrollPeriods, setPayrollPeriods] = useState([]);
  const [payrollRuns, setPayrollRuns] = useState([]);
  const [payrollRunItems, setPayrollRunItems] = useState([]);
  const [payrollRunItemComponents, setPayrollRunItemComponents] = useState([]);
  const [payrollAccountMappings, setPayrollAccountMappings] = useState([]);
  const [payrollPaymentBatches, setPayrollPaymentBatches] = useState([]);
  const [payrollPaymentItems, setPayrollPaymentItems] = useState([]);
  const [payrollBankFileProfiles, setPayrollBankFileProfiles] = useState([]);
  const [payrollBankFiles, setPayrollBankFiles] = useState([]);
  const [payrollBankReconciliations, setPayrollBankReconciliations] = useState([]);
  const [payrollStatutorySettlements, setPayrollStatutorySettlements] = useState([]);
  const [payrollDashboardSummary, setPayrollDashboardSummary] = useState(null);
  const [payrollIntegrity, setPayrollIntegrity] = useState(null);
  const [selectedPayrollRunId, setSelectedPayrollRunId] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch Payroll Settings
  const fetchPayrollSettings = useCallback(async (opCoId) => {
    try {
      let query = supabase.from('payroll_settings').select('*');
      if (opCoId) query = query.eq('tenant_company_id', opCoId);
      const { data, error: err } = await query.order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (err) throw err;
      setPayrollSettings(data || null);
    } catch (err) {
      console.error('Error fetching payroll_settings:', err);
    }
  }, []);

  // 2. Fetch Payroll Components
  const fetchPayrollComponents = useCallback(async (opCoId) => {
    try {
      let query = supabase.from('payroll_components').select('*');
      if (opCoId) query = query.eq('tenant_company_id', opCoId);
      const { data, error: err } = await query.order('code');
      if (err) throw err;
      setPayrollComponents(data || []);
    } catch (err) {
      console.error('Error fetching payroll_components:', err);
    }
  }, []);

  // 3. Fetch Statutory Rules
  const fetchStatutoryRules = useCallback(async (opCoId) => {
    try {
      let query = supabase.from('payroll_statutory_rules').select('*');
      if (opCoId) query = query.eq('tenant_company_id', opCoId);
      const { data, error: err } = await query.order('effective_from', { ascending: false });
      if (err) throw err;
      setStatutoryRules(data || []);
    } catch (err) {
      console.error('Error fetching payroll_statutory_rules:', err);
    }
  }, []);

  // 4. Fetch Employee Salary Structures & Items
  const fetchSalaryStructures = useCallback(async (opCoId) => {
    try {
      let query = supabase.from('employee_salary_structures').select('*');
      if (opCoId) query = query.eq('tenant_company_id', opCoId);
      const { data, error: err } = await query.order('created_at', { ascending: false });
      if (err) throw err;
      setEmployeeSalaryStructures(data || []);

      if (data && data.length > 0) {
        const structIds = data.map(s => s.id);
        const { data: items, error: itemsErr } = await supabase
          .from('employee_salary_structure_items')
          .select('*')
          .in('salary_structure_id', structIds);
        if (!itemsErr) setSalaryStructureItems(items || []);
      } else {
        setSalaryStructureItems([]);
      }
    } catch (err) {
      console.error('Error fetching employee_salary_structures:', err);
    }
  }, []);

  // 5. Fetch Payroll Periods & Runs (Read-Only Foundation)
  const fetchPayrollPeriods = useCallback(async (opCoId) => {
    try {
      let query = supabase.from('payroll_periods').select('*');
      if (opCoId) query = query.eq('tenant_company_id', opCoId);
      const { data, error: err } = await query.order('pay_date', { ascending: false });
      if (err) throw err;
      setPayrollPeriods(data || []);
    } catch (err) {
      console.error('Error fetching payroll_periods:', err);
    }
  }, []);

  const fetchPayrollRuns = useCallback(async (opCoId) => {
    try {
      let query = supabase.from('payroll_runs').select('*');
      if (opCoId) query = query.eq('tenant_company_id', opCoId);
      const { data, error: err } = await query.order('created_at', { ascending: false });
      if (err) throw err;
      setPayrollRuns(data || []);

      if (data && data.length > 0) {
        const runIds = data.map(r => r.id);
        const { data: items } = await supabase.from('payroll_run_items').select('*').in('payroll_run_id', runIds);
        setPayrollRunItems(items || []);

        if (items && items.length > 0) {
          const itemIds = items.map(i => i.id);
          const { data: compItems } = await supabase.from('payroll_run_item_components').select('*').in('payroll_run_item_id', itemIds);
          setPayrollRunItemComponents(compItems || []);
        } else {
          setPayrollRunItemComponents([]);
        }
      } else {
        setPayrollRunItems([]);
        setPayrollRunItemComponents([]);
      }
    } catch (err) {
      console.error('Error fetching payroll_runs:', err);
    }
  }, []);

  const [taxDeclarations, setTaxDeclarations] = useState([]);
  const [previousEmployerRecords, setPreviousEmployerRecords] = useState([]);

  // 6. Fetch Tax Declarations & Previous Employer Records
  const fetchTaxDeclarations = useCallback(async (opCoId) => {
    try {
      let query = supabase.from('payroll_tax_declarations').select('*');
      if (opCoId) query = query.eq('tenant_company_id', opCoId);
      const { data, error: err } = await query.order('created_at', { ascending: false });
      if (err) throw err;
      setTaxDeclarations(data || []);

      if (data && data.length > 0) {
        const decIds = data.map(d => d.id);
        const { data: prevItems } = await supabase
          .from('payroll_tax_previous_employers')
          .select('*')
          .in('tax_declaration_id', decIds);
        setPreviousEmployerRecords(prevItems || []);
      } else {
        setPreviousEmployerRecords([]);
      }
    } catch (err) {
      console.error('Error fetching payroll_tax_declarations:', err);
    }
  }, []);

  // 7. Fetch Payroll Account Mappings
  const fetchPayrollAccountMappings = useCallback(async (opCoId) => {
    try {
      let query = supabase.from('payroll_account_mappings').select('*');
      if (opCoId) query = query.eq('tenant_company_id', opCoId);
      const { data, error: err } = await query;
      if (err) throw err;
      setPayrollAccountMappings(data || []);
    } catch (err) {
      console.error('Error fetching payroll_account_mappings:', err);
    }
  }, []);

  // 8. Fetch Payroll Payment Batches & Items
  const fetchPayrollPaymentBatches = useCallback(async (opCoId) => {
    try {
      let query = supabase.from('payroll_payment_batches').select('*');
      if (opCoId) query = query.eq('tenant_company_id', opCoId);
      const { data, error: err } = await query.order('created_at', { ascending: false });
      if (err) throw err;
      setPayrollPaymentBatches(data || []);

      if (data && data.length > 0) {
        const batchIds = data.map(b => b.id);
        const { data: items } = await supabase.from('payroll_payment_items').select('*').in('payment_batch_id', batchIds);
        setPayrollPaymentItems(items || []);
      } else {
        setPayrollPaymentItems([]);
      }
    } catch (err) {
      console.error('Error fetching payroll_payment_batches:', err);
    }
  }, []);

  // 9. Fetch Payroll Bank File Profiles & Files (P2B Read-Only)
  const fetchBankFileProfiles = useCallback(async (opCoId) => {
    try {
      let query = supabase.from('payroll_bank_file_profiles').select('*');
      if (opCoId) query = query.eq('tenant_company_id', opCoId);
      const { data, error: err } = await query.order('created_at', { ascending: false });
      if (err) throw err;
      setPayrollBankFileProfiles(data || []);
    } catch (err) {
      console.error('Error fetching payroll_bank_file_profiles:', err);
    }
  }, []);

  const fetchBankFiles = useCallback(async (opCoId) => {
    try {
      let query = supabase.from('payroll_bank_files').select('*');
      if (opCoId) query = query.eq('tenant_company_id', opCoId);
      const { data, error: err } = await query.order('created_at', { ascending: false });
      if (err) throw err;
      setPayrollBankFiles(data || []);
    } catch (err) {
      console.error('Error fetching payroll_bank_files:', err);
    }
  }, []);

  const fetchBankReconciliations = useCallback(async (opCoId) => {
    try {
      let query = supabase.from('payroll_bank_reconciliations').select('*');
      if (opCoId) query = query.eq('tenant_company_id', opCoId);
      const { data, error: err } = await query.order('created_at', { ascending: false });
      if (!err) setPayrollBankReconciliations(data || []);
    } catch (err) {
      console.error('Error fetching payroll_bank_reconciliations:', err);
    }
  }, []);

  const fetchStatutorySettlements = useCallback(async (opCoId) => {
    try {
      let query = supabase.from('payroll_statutory_settlements').select('*');
      if (opCoId) query = query.eq('tenant_company_id', opCoId);
      const { data, error: err } = await query.order('created_at', { ascending: false });
      if (!err) setPayrollStatutorySettlements(data || []);
    } catch (err) {
      console.error('Error fetching payroll_statutory_settlements:', err);
    }
  }, []);

  const fetchDashboardSummary = useCallback(async (opCoId) => {
    try {
      const { data, error: err } = await supabase.rpc('get_payroll_dashboard_summary_atomic', {
        p_tenant_id: tenantId || null,
        p_tenant_company_id: opCoId || null
      });
      if (!err && data) setPayrollDashboardSummary(data);
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
    }
  }, [tenantId]);

  const fetchPayrollIntegrity = useCallback(async (opCoId, runId) => {
    const targetRunId = runId || selectedPayrollRunId;
    if (!tenantId || !opCoId || !targetRunId) {
      setPayrollIntegrity(null);
      return;
    }
    try {
      const { data, error: err } = await supabase.rpc('get_payroll_accounting_e2e_integrity_atomic', {
        p_tenant_id: tenantId,
        p_tenant_company_id: opCoId,
        p_payroll_run_id: targetRunId
      });
      if (err) {
        console.error('[PayrollContext] Error fetching payroll accounting e2e integrity:', err);
        setPayrollIntegrity(null);
        if (err.code === '42501') {
          setError('Authorization error (42501) accessing payroll accounting E2E integrity');
        }
        return;
      }
      setPayrollIntegrity(data || null);
    } catch (err) {
      console.error('[PayrollContext] Error fetching payroll accounting e2e integrity:', err);
      setPayrollIntegrity(null);
    }
  }, [tenantId, selectedPayrollRunId]);

  // Primary data loader
  const fetchAllPayrollData = useCallback(async (opCoId) => {
    if (!authUserId) return;
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchPayrollSettings(opCoId),
        fetchPayrollComponents(opCoId),
        fetchStatutoryRules(opCoId),
        fetchSalaryStructures(opCoId),
        fetchPayrollPeriods(opCoId),
        fetchPayrollRuns(opCoId),
        fetchTaxDeclarations(opCoId),
        fetchPayrollAccountMappings(opCoId),
        fetchPayrollPaymentBatches(opCoId),
        fetchBankFileProfiles(opCoId),
        fetchBankFiles(opCoId),
        fetchBankReconciliations(opCoId),
        fetchStatutorySettlements(opCoId),
        fetchDashboardSummary(opCoId),
        fetchPayrollIntegrity(opCoId, selectedPayrollRunId)
      ]);
    } catch (err) {
      console.error('Error loading payroll foundation data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [authUserId, fetchPayrollSettings, fetchPayrollComponents, fetchStatutoryRules, fetchSalaryStructures, fetchPayrollPeriods, fetchPayrollRuns, fetchTaxDeclarations, fetchPayrollAccountMappings, fetchPayrollPaymentBatches, fetchBankFileProfiles, fetchBankFiles, fetchBankReconciliations, fetchStatutorySettlements, fetchDashboardSummary, fetchPayrollIntegrity, selectedPayrollRunId]);

  useEffect(() => {
    if (authUserId) {
      fetchAllPayrollData(activeOperatingCompanyId);
    }
  }, [authUserId, activeOperatingCompanyId, fetchAllPayrollData]);

  useEffect(() => {
    if (activeOperatingCompanyId && selectedPayrollRunId) {
      fetchPayrollIntegrity(activeOperatingCompanyId, selectedPayrollRunId);
    }
  }, [activeOperatingCompanyId, selectedPayrollRunId, fetchPayrollIntegrity]);

  // --- CRUD Operations ---

  // 1. Save Payroll Settings (Create / Update)
  const savePayrollSettings = async (settingsPayload) => {
    if (!isManagementOrAdmin) return { success: false, error: 'Unauthorized: Management role required.' };
    try {
      const payload = {
        tenant_id: tenantId || null,
        tenant_company_id: activeOperatingCompanyId || null,
        pay_day: settingsPayload.pay_day ? parseInt(settingsPayload.pay_day, 10) : 30,
        status: settingsPayload.status || 'active',
        updated_at: new Date().toISOString()
      };

      if (settingsPayload.id) {
        const { data, error: err } = await supabase.from('payroll_settings').update(payload).eq('id', settingsPayload.id).select('*').single();
        if (err) throw err;
        setPayrollSettings(data);
        return { success: true, data };
      } else {
        payload.created_at = new Date().toISOString();
        const { data, error: err } = await supabase.from('payroll_settings').insert([payload]).select('*').single();
        if (err) throw err;
        setPayrollSettings(data);
        return { success: true, data };
      }
    } catch (err) {
      console.error('Error saving payroll_settings:', err);
      return { success: false, error: err.message };
    }
  };

  // 2. Save Payroll Component (Create / Update)
  const savePayrollComponent = async (componentPayload) => {
    if (!isManagementOrAdmin) return { success: false, error: 'Unauthorized: Management role required.' };
    try {
      const payload = {
        tenant_id: tenantId || null,
        tenant_company_id: activeOperatingCompanyId || null,
        code: (componentPayload.code || '').trim().toUpperCase(),
        name: (componentPayload.name || '').trim(),
        component_type: componentPayload.component_type || 'Earning',
        status: componentPayload.status || 'active',
        updated_at: new Date().toISOString()
      };

      if (componentPayload.id) {
        const { data, error: err } = await supabase.from('payroll_components').update(payload).eq('id', componentPayload.id).select('*').single();
        if (err) throw err;
        await fetchPayrollComponents(activeOperatingCompanyId);
        return { success: true, data };
      } else {
        payload.created_at = new Date().toISOString();
        const { data, error: err } = await supabase.from('payroll_components').insert([payload]).select('*').single();
        if (err) throw err;
        await fetchPayrollComponents(activeOperatingCompanyId);
        return { success: true, data };
      }
    } catch (err) {
      console.error('Error saving payroll_components:', err);
      return { success: false, error: err.message };
    }
  };

  // Deactivate Payroll Component (Soft Deactivation - Preserve History, No SQL Delete)
  const deactivatePayrollComponent = async (id) => {
    if (!isManagementOrAdmin) return { success: false, error: 'Unauthorized: Management role required.' };
    try {
      const { error: err } = await supabase
        .from('payroll_components')
        .update({ status: 'inactive', updated_at: new Date().toISOString() })
        .eq('id', id);
      if (err) throw err;
      await fetchPayrollComponents(activeOperatingCompanyId);
      return { success: true };
    } catch (err) {
      console.error('Error deactivating payroll_components:', err);
      return { success: false, error: err.message };
    }
  };

  // Backwards compatibility alias (soft deactivation only)
  const deletePayrollComponent = deactivatePayrollComponent;

  // 3. Save Statutory Rule (Create / Update)
  const saveStatutoryRule = async (rulePayload) => {
    if (!isManagementOrAdmin) return { success: false, error: 'Unauthorized: Management role required.' };
    try {
      const payload = {
        tenant_id: tenantId || null,
        tenant_company_id: activeOperatingCompanyId || null,
        effective_from: rulePayload.effective_from || new Date().toISOString().split('T')[0],
        effective_to: rulePayload.effective_to || null,
        financial_year: rulePayload.financial_year || '2026-2027',
        status: rulePayload.status || 'active',
        updated_at: new Date().toISOString()
      };

      if (rulePayload.id) {
        const { data, error: err } = await supabase.from('payroll_statutory_rules').update(payload).eq('id', rulePayload.id).select('*').single();
        if (err) throw err;
        await fetchStatutoryRules(activeOperatingCompanyId);
        return { success: true, data };
      } else {
        payload.created_at = new Date().toISOString();
        const { data, error: err } = await supabase.from('payroll_statutory_rules').insert([payload]).select('*').single();
        if (err) throw err;
        await fetchStatutoryRules(activeOperatingCompanyId);
        return { success: true, data };
      }
    } catch (err) {
      console.error('Error saving payroll_statutory_rules:', err);
      return { success: false, error: err.message };
    }
  };

  // 4. Save Employee Salary Structure & Items (Versioned / Additive - Preserve History, No SQL Delete)
  const saveSalaryStructure = async (structurePayload, items = []) => {
    if (!isManagementOrAdmin) return { success: false, error: 'Unauthorized: Management role required.' };
    try {
      const effectiveFromDate = structurePayload.effective_from || new Date().toISOString().split('T')[0];

      // End-date / deactivate any existing active salary structure for this employee to enforce versioning
      if (structurePayload.employee_id) {
        await supabase
          .from('employee_salary_structures')
          .update({
            status: 'inactive',
            effective_to: effectiveFromDate,
            updated_at: new Date().toISOString()
          })
          .eq('employee_id', structurePayload.employee_id)
          .eq('status', 'active');
      }

      const payload = {
        tenant_id: tenantId || null,
        tenant_company_id: activeOperatingCompanyId || null,
        employee_id: structurePayload.employee_id,
        effective_from: effectiveFromDate,
        effective_to: structurePayload.effective_to || null,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: structData, error: err } = await supabase
        .from('employee_salary_structures')
        .insert([payload])
        .select('*')
        .single();
      if (err) throw err;

      // Save structure items for the newly versioned salary structure
      if (items && items.length > 0) {
        const itemsToInsert = items.map(item => ({
          tenant_id: tenantId || null,
          tenant_company_id: activeOperatingCompanyId || null,
          salary_structure_id: structData.id,
          amount: parseFloat(item.amount || 0),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { error: itemsErr } = await supabase
          .from('employee_salary_structure_items')
          .insert(itemsToInsert);
        if (itemsErr) throw itemsErr;
      }

      await fetchSalaryStructures(activeOperatingCompanyId);
      return { success: true, data: structData };
    } catch (err) {
      console.error('Error saving employee_salary_structures:', err);
      return { success: false, error: err.message };
    }
  };

  // End / Deactivate Salary Structure (Soft End-date - Preserve History, No SQL Delete)
  const deactivateSalaryStructure = async (id) => {
    if (!isManagementOrAdmin) return { success: false, error: 'Unauthorized: Management role required.' };
    try {
      const today = new Date().toISOString().split('T')[0];
      const { error: err } = await supabase
        .from('employee_salary_structures')
        .update({
          status: 'inactive',
          effective_to: today,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      if (err) throw err;
      await fetchSalaryStructures(activeOperatingCompanyId);
      return { success: true };
    } catch (err) {
      console.error('Error ending employee_salary_structures:', err);
      return { success: false, error: err.message };
    }
  };

  // Backwards compatibility alias (soft end-date only)
  const deleteSalaryStructure = deactivateSalaryStructure;

  // 5. Save Payroll Period
  const savePayrollPeriod = async (periodPayload) => {
    if (!isManagementOrAdmin) return { success: false, error: 'Unauthorized: Management role required.' };
    try {
      const payload = {
        tenant_id: tenantId || null,
        tenant_company_id: activeOperatingCompanyId || null,
        period_code: (periodPayload.period_code || '').trim(),
        period_name: (periodPayload.period_name || '').trim(),
        pay_date: periodPayload.pay_date || new Date().toISOString().split('T')[0],
        status: periodPayload.status || 'draft',
        updated_at: new Date().toISOString()
      };

      if (periodPayload.id) {
        const { data, error: err } = await supabase.from('payroll_periods').update(payload).eq('id', periodPayload.id).select('*').single();
        if (err) throw err;
        await fetchPayrollPeriods(activeOperatingCompanyId);
        return { success: true, data };
      } else {
        payload.created_at = new Date().toISOString();
        const { data, error: err } = await supabase.from('payroll_periods').insert([payload]).select('*').single();
        if (err) throw err;
        await fetchPayrollPeriods(activeOperatingCompanyId);
        return { success: true, data };
      }
    } catch (err) {
      console.error('Error saving payroll_periods:', err);
      return { success: false, error: err.message };
    }
  };

  // 6. Calculate Payroll Run via calculate_payroll_run_atomic Server RPC
  const calculatePayrollRun = async (payrollRunId) => {
    if (!isManagementOrAdmin) return { success: false, error: 'Unauthorized: Management role required.' };
    if (!payrollRunId) return { success: false, error: 'Payroll Run ID is required.' };

    try {
      const { data, error: err } = await supabase.rpc('calculate_payroll_run_atomic', {
        p_payroll_run_id: payrollRunId
      });

      if (err) {
        const errMsg = err.message || '';
        const isTdsError = /tds/i.test(errMsg) || /tax engine/i.test(errMsg) || /tds engine required/i.test(errMsg);

        return {
          success: false,
          isTdsBlocker: isTdsError,
          error: isTdsError
            ? 'TDS Engine Blocker: The server TDS calculation engine is required for TDS-enabled payroll runs before completing calculation.'
            : (err.message || 'Server RPC error during payroll calculation.')
        };
      }

      if (data && data.success === false) {
        const errMsg = data.error || data.message || 'Payroll calculation failed on server.';
        const isTdsError = /tds/i.test(errMsg) || /tax engine/i.test(errMsg);

        return {
          success: false,
          isTdsBlocker: isTdsError,
          error: isTdsError
            ? 'TDS Engine Blocker: The server TDS calculation engine is required for TDS-enabled payroll runs before completing calculation.'
            : errMsg
        };
      }

      await fetchAllPayrollData(activeOperatingCompanyId);
      return { success: true, data };
    } catch (err) {
      console.error('Error executing calculate_payroll_run_atomic:', err);
      const errMsg = err.message || '';
      const isTdsError = /tds/i.test(errMsg) || /tax engine/i.test(errMsg);

      return {
        success: false,
        isTdsBlocker: isTdsError,
        error: isTdsError
          ? 'TDS Engine Blocker: The server TDS calculation engine is required for TDS-enabled payroll runs before completing calculation.'
          : (err.message || 'Unexpected calculation failure.')
      };
    }
  };

  // 6b. Create Payroll Run via create_payroll_run_atomic Server RPC
  const createPayrollRun = async (runPayload) => {
    if (!isManagementOrAdmin) return { success: false, error: 'Unauthorized: Management role required.' };
    if (!runPayload.payroll_period_id) return { success: false, error: 'Payroll Period ID is required.' };
    try {
      const payload = {
        tenant_id: tenantId || null,
        tenant_company_id: activeOperatingCompanyId || null,
        payroll_period_id: runPayload.payroll_period_id,
        run_type: runPayload.run_type || 'regular',
        notes: runPayload.notes || null,
        idempotency_key: runPayload.idempotency_key || crypto.randomUUID()
      };
      const { data, error: err } = await supabase.rpc('create_payroll_run_atomic', { p_payload: payload });
      if (err) throw err;
      if (data && data.success === false) {
        return { success: false, error: data.error || data.message || 'Failed to create payroll run.' };
      }
      await fetchAllPayrollData(activeOperatingCompanyId);
      return { success: true, data };
    } catch (err) {
      console.error('Error executing create_payroll_run_atomic:', err);
      return { success: false, error: err.message || 'Failed to create payroll run.' };
    }
  };

  // 6c. Submit Payroll Run for Approval via submit_payroll_run_for_approval_atomic Server RPC
  const submitPayrollRunForApproval = async (payrollRunId) => {
    if (!isManagementOrAdmin) return { success: false, error: 'Unauthorized: Management role required.' };
    if (!payrollRunId) return { success: false, error: 'Payroll Run ID is required.' };
    try {
      const { data, error: err } = await supabase.rpc('submit_payroll_run_for_approval_atomic', {
        p_payroll_run_id: payrollRunId
      });
      if (err) throw err;
      if (data && data.success === false) {
        return { success: false, error: data.error || data.message || 'Failed to submit payroll run for approval.' };
      }
      await fetchAllPayrollData(activeOperatingCompanyId);
      return { success: true, data };
    } catch (err) {
      console.error('Error executing submit_payroll_run_for_approval_atomic:', err);
      return { success: false, error: err.message || 'Failed to submit payroll run for approval.' };
    }
  };

  // 6d. Approve Payroll Run via approve_payroll_run_atomic Server RPC
  const approvePayrollRun = async (payrollRunId, comments = 'Approved') => {
    if (!isAdmin) return { success: false, error: 'Unauthorized: Admin role required to approve payroll run.' };
    if (!payrollRunId) return { success: false, error: 'Payroll Run ID is required.' };
    try {
      const { data, error: err } = await supabase.rpc('approve_payroll_run_atomic', {
        p_payroll_run_id: payrollRunId,
        p_comments: comments || 'Approved'
      });
      if (err) throw err;
      if (data && data.success === false) {
        return { success: false, error: data.error || data.message || 'Failed to approve payroll run.' };
      }
      await fetchAllPayrollData(activeOperatingCompanyId);
      return { success: true, data };
    } catch (err) {
      console.error('Error executing approve_payroll_run_atomic:', err);
      return { success: false, error: err.message || 'Failed to approve payroll run.' };
    }
  };

  // 6e. Finalize Payroll Run with Accounting via finalize_payroll_run_with_accounting_atomic Server RPC
  const finalizePayrollRunWithAccounting = async (payrollRunId) => {
    if (!isManagementOrAdmin) return { success: false, error: 'Unauthorized: Management role required.' };
    if (!payrollRunId) return { success: false, error: 'Payroll Run ID is required.' };
    try {
      const { data, error: err } = await supabase.rpc('finalize_payroll_run_with_accounting_atomic', {
        p_payroll_run_id: payrollRunId
      });
      if (err) throw err;
      if (data && data.success === false) {
        return { success: false, error: data.error || data.message || 'Failed to finalize payroll run with accounting.' };
      }
      await fetchAllPayrollData(activeOperatingCompanyId);
      return { success: true, data };
    } catch (err) {
      console.error('Error executing finalize_payroll_run_with_accounting_atomic:', err);
      return { success: false, error: err.message || 'Failed to finalize payroll run with accounting.' };
    }
  };

  // 6f. Upsert Payroll Account Mapping via upsert_payroll_account_mapping_atomic Server RPC
  const upsertPayrollAccountMapping = async (mappingPayload) => {
    if (!isManagementOrAdmin) return { success: false, error: 'Unauthorized: Management role required.' };
    if (!mappingPayload.mapping_key || !mappingPayload.account_id) {
      return { success: false, error: 'Mapping Key and Account ID are required.' };
    }
    try {
      const payload = {
        tenant_id: tenantId || null,
        tenant_company_id: activeOperatingCompanyId || null,
        mapping_key: mappingPayload.mapping_key,
        account_id: mappingPayload.account_id,
        description: mappingPayload.description || null,
        idempotency_key: mappingPayload.idempotency_key || crypto.randomUUID()
      };
      const { data, error: err } = await supabase.rpc('upsert_payroll_account_mapping_atomic', { p_payload: payload });
      if (err) throw err;
      if (data && data.success === false) {
        return { success: false, error: data.error || data.message || 'Failed to update payroll account mapping.' };
      }
      await fetchPayrollAccountMappings(activeOperatingCompanyId);
      return { success: true, data };
    } catch (err) {
      console.error('Error executing upsert_payroll_account_mapping_atomic:', err);
      return { success: false, error: err.message || 'Failed to update payroll account mapping.' };
    }
  };

  // 6g. Create Salary Payment Batch via create_payroll_payment_batch_atomic
  const createPayrollPaymentBatch = async (batchPayload) => {
    if (!isManagementOrAdmin) return { success: false, error: 'Unauthorized: Management role required.' };
    if (!batchPayload.payroll_run_id || !batchPayload.bank_account_id) {
      return { success: false, error: 'Payroll Run ID and Bank Account ID are required.' };
    }
    try {
      const payload = {
        tenant_id: tenantId || null,
        tenant_company_id: activeOperatingCompanyId || null,
        payroll_run_id: batchPayload.payroll_run_id,
        bank_account_id: batchPayload.bank_account_id,
        payment_date: batchPayload.payment_date || new Date().toISOString().split('T')[0],
        notes: batchPayload.notes || null,
        idempotency_key: batchPayload.idempotency_key || crypto.randomUUID()
      };
      const { data, error: err } = await supabase.rpc('create_payroll_payment_batch_atomic', { p_payload: payload });
      if (err) throw err;
      if (data && data.success === false) {
        return { success: false, error: data.error || data.message || 'Failed to create payment batch.' };
      }
      await fetchAllPayrollData(activeOperatingCompanyId);
      return { success: true, data };
    } catch (err) {
      console.error('Error executing create_payroll_payment_batch_atomic:', err);
      return { success: false, error: err.message || 'Failed to create payment batch.' };
    }
  };

  // 6h. Submit Salary Payment Batch for Approval via submit_payroll_payment_batch_for_approval_atomic
  const submitPayrollPaymentBatchForApproval = async (paymentBatchId) => {
    if (!isManagementOrAdmin) return { success: false, error: 'Unauthorized: Management role required.' };
    if (!paymentBatchId) return { success: false, error: 'Payment Batch ID is required.' };
    try {
      const { data, error: err } = await supabase.rpc('submit_payroll_payment_batch_for_approval_atomic', {
        p_payment_batch_id: paymentBatchId
      });
      if (err) throw err;
      if (data && data.success === false) {
        return { success: false, error: data.error || data.message || 'Failed to submit payment batch for approval.' };
      }
      await fetchAllPayrollData(activeOperatingCompanyId);
      return { success: true, data };
    } catch (err) {
      console.error('Error executing submit_payroll_payment_batch_for_approval_atomic:', err);
      return { success: false, error: err.message || 'Failed to submit payment batch for approval.' };
    }
  };

  // 6i. Approve Salary Payment Batch via approve_payroll_payment_batch_atomic (Admin Only)
  const approvePayrollPaymentBatch = async (paymentBatchId, comments = 'Approved') => {
    if (!isAdmin) return { success: false, error: 'Unauthorized: Admin role required to approve payment batch.' };
    if (!paymentBatchId) return { success: false, error: 'Payment Batch ID is required.' };
    try {
      const { data, error: err } = await supabase.rpc('approve_payroll_payment_batch_atomic', {
        p_payment_batch_id: paymentBatchId,
        p_comments: comments || 'Approved'
      });
      if (err) throw err;
      if (data && data.success === false) {
        return { success: false, error: data.error || data.message || 'Failed to approve payment batch.' };
      }
      await fetchAllPayrollData(activeOperatingCompanyId);
      return { success: true, data };
    } catch (err) {
      console.error('Error executing approve_payroll_payment_batch_atomic:', err);
      return { success: false, error: err.message || 'Failed to approve payment batch.' };
    }
  };

  // 6j. Process & Disburse Salary Payment Batch via process_payroll_payment_batch_atomic (Admin Only)
  const processPayrollPaymentBatch = async (paymentBatchId, bankReference = '') => {
    if (!isAdmin) return { success: false, error: 'Unauthorized: Admin role required to disburse salary payment batch.' };
    if (!paymentBatchId) return { success: false, error: 'Payment Batch ID is required.' };
    try {
      const { data, error: err } = await supabase.rpc('process_payroll_payment_batch_atomic', {
        p_payment_batch_id: paymentBatchId,
        p_bank_reference: bankReference || null
      });
      if (err) throw err;
      if (data && data.success === false) {
        return { success: false, error: data.error || data.message || 'Failed to process payment batch.' };
      }
      await fetchAllPayrollData(activeOperatingCompanyId);
      return { success: true, data };
    } catch (err) {
      console.error('Error executing process_payroll_payment_batch_atomic:', err);
      return { success: false, error: err.message || 'Failed to process payment batch.' };
    }
  };

  // 6k. Cancel Salary Payment Batch via cancel_payroll_payment_batch_atomic
  const cancelPayrollPaymentBatch = async (paymentBatchId, reason = '') => {
    if (!isManagementOrAdmin) return { success: false, error: 'Unauthorized: Management role required.' };
    if (!paymentBatchId) return { success: false, error: 'Payment Batch ID is required.' };
    try {
      const { data, error: err } = await supabase.rpc('cancel_payroll_payment_batch_atomic', {
        p_payment_batch_id: paymentBatchId,
        p_reason: reason || null
      });
      if (err) throw err;
      if (data && data.success === false) {
        return { success: false, error: data.error || data.message || 'Failed to cancel payment batch.' };
      }
      await fetchAllPayrollData(activeOperatingCompanyId);
      return { success: true, data };
    } catch (err) {
      console.error('Error executing cancel_payroll_payment_batch_atomic:', err);
      return { success: false, error: err.message || 'Failed to cancel payment batch.' };
    }
  };

  // 6l. Upsert Bank File Profile via upsert_payroll_bank_file_profile_atomic (Admin/Owner Only)
  const upsertBankFileProfile = async (profilePayload) => {
    if (!isAdmin) return { success: false, error: 'Unauthorized: Admin/Owner role required to configure bank file profiles.' };
    if (!profilePayload.profile_code || !profilePayload.bank_name) {
      return { success: false, error: 'Profile Code and Bank Name are required.' };
    }
    try {
      const payload = {
        id: profilePayload.id || undefined,
        tenant_id: tenantId || null,
        tenant_company_id: activeOperatingCompanyId || null,
        profile_code: (profilePayload.profile_code || '').trim(),
        bank_name: (profilePayload.bank_name || '').trim(),
        format_type: profilePayload.format_type || 'CSV',
        config_json: profilePayload.config_json || {},
        is_active: profilePayload.is_active !== undefined ? profilePayload.is_active : true,
        idempotency_key: profilePayload.idempotency_key || crypto.randomUUID()
      };
      const { data, error: err } = await supabase.rpc('upsert_payroll_bank_file_profile_atomic', { p_payload: payload });
      if (err) throw err;
      if (data && data.success === false) {
        return { success: false, error: data.error || data.message || 'Failed to upsert bank file profile.' };
      }
      await fetchBankFileProfiles(activeOperatingCompanyId);
      return { success: true, data };
    } catch (err) {
      console.error('Error executing upsert_payroll_bank_file_profile_atomic:', err);
      return { success: false, error: err.message || 'Failed to upsert bank file profile.' };
    }
  };

  // 6m. Generate Bank File via generate_payroll_bank_file_atomic (Admin/Owner Only)
  const generateBankFile = async (paymentBatchId, profileId) => {
    if (!isAdmin) return { success: false, error: 'Unauthorized: Admin/Owner role required to generate bank files.' };
    if (!paymentBatchId || !profileId) {
      return { success: false, error: 'Payment Batch ID and Profile ID are required.' };
    }
    try {
      const { data, error: err } = await supabase.rpc('generate_payroll_bank_file_atomic', {
        p_payment_batch_id: paymentBatchId,
        p_profile_id: profileId
      });
      if (err) throw err;
      if (data && data.success === false) {
        return { success: false, error: data.error || data.message || 'Failed to generate bank file.' };
      }
      await Promise.all([
        fetchBankFiles(activeOperatingCompanyId),
        fetchPayrollPaymentBatches(activeOperatingCompanyId)
      ]);
      return { success: true, data };
    } catch (err) {
      console.error('Error executing generate_payroll_bank_file_atomic:', err);
      return { success: false, error: err.message || 'Failed to generate bank file.' };
    }
  };

  // 6n. Record Bank File Submission via record_payroll_bank_file_submission_atomic (Admin/Owner Only)
  const recordBankFileSubmission = async (bankFileId, externalReference = '') => {
    if (!isAdmin) return { success: false, error: 'Unauthorized: Admin/Owner role required to submit bank files.' };
    if (!bankFileId) return { success: false, error: 'Bank File ID is required.' };
    try {
      const { data, error: err } = await supabase.rpc('record_payroll_bank_file_submission_atomic', {
        p_bank_file_id: bankFileId,
        p_external_reference: externalReference || null
      });
      if (err) throw err;
      if (data && data.success === false) {
        return { success: false, error: data.error || data.message || 'Failed to record bank file submission.' };
      }
      await Promise.all([
        fetchBankFiles(activeOperatingCompanyId),
        fetchPayrollPaymentBatches(activeOperatingCompanyId)
      ]);
      return { success: true, data };
    } catch (err) {
      console.error('Error executing record_payroll_bank_file_submission_atomic:', err);
      return { success: false, error: err.message || 'Failed to record bank file submission.' };
    }
  };

  // 6o. Record Bank File Result via record_payroll_bank_file_result_atomic (Admin/Owner Only)
  const recordBankFileResult = async (bankFileId, result, externalReference = '', rejectionReason = '') => {
    if (!isAdmin) return { success: false, error: 'Unauthorized: Admin/Owner role required to record bank file result.' };
    if (!bankFileId || !result) {
      return { success: false, error: 'Bank File ID and Result (accepted/rejected) are required.' };
    }
    if (result === 'rejected' && !rejectionReason?.trim()) {
      return { success: false, error: 'Rejection reason is mandatory when recording a rejected bank result.' };
    }
    try {
      const { data, error: err } = await supabase.rpc('record_payroll_bank_file_result_atomic', {
        p_bank_file_id: bankFileId,
        p_result: result,
        p_external_reference: externalReference || null,
        p_rejection_reason: rejectionReason || null
      });
      if (err) throw err;
      if (data && data.success === false) {
        return { success: false, error: data.error || data.message || 'Failed to record bank file result.' };
      }
      await Promise.all([
        fetchBankFiles(activeOperatingCompanyId),
        fetchPayrollPaymentBatches(activeOperatingCompanyId)
      ]);
      return { success: true, data };
    } catch (err) {
      console.error('Error executing record_payroll_bank_file_result_atomic:', err);
      return { success: false, error: err.message || 'Failed to record bank file result.' };
    }
  };

  // 6p. Match Payroll Bank Transaction via match_payroll_bank_transaction_atomic (Manager/Admin)
  const matchPayrollBankTransaction = async (matchPayload) => {
    if (!isManagementOrAdmin) return { success: false, error: 'Unauthorized: Management role required to reconcile bank transactions.' };
    try {
      const payload = {
        tenant_id: tenantId || null,
        tenant_company_id: activeOperatingCompanyId || null,
        bank_transaction_id: matchPayload.bank_transaction_id,
        payroll_payment_item_id: matchPayload.payroll_payment_item_id,
        payroll_payment_batch_id: matchPayload.payroll_payment_batch_id || null,
        matched_amount: parseFloat(matchPayload.matched_amount || 0),
        status: matchPayload.status || 'matched',
        match_method: matchPayload.match_method || 'manual',
        external_reference: matchPayload.external_reference || null,
        notes: matchPayload.notes || null,
        idempotency_key: matchPayload.idempotency_key || crypto.randomUUID()
      };
      const { data, error: err } = await supabase.rpc('match_payroll_bank_transaction_atomic', { p_payload: payload });
      if (err) throw err;
      if (data && data.success === false) {
        return { success: false, error: data.error || data.message || 'Failed to match bank transaction.' };
      }
      await Promise.all([
        fetchBankReconciliations(activeOperatingCompanyId),
        fetchPayrollPaymentBatches(activeOperatingCompanyId),
        fetchDashboardSummary(activeOperatingCompanyId)
      ]);
      return { success: true, data };
    } catch (err) {
      console.error('Error executing match_payroll_bank_transaction_atomic:', err);
      return { success: false, error: err.message || 'Failed to match bank transaction.' };
    }
  };

  // 6q. Unmatch Payroll Bank Transaction via unmatch_payroll_bank_transaction_atomic (Admin Only)
  const unmatchPayrollBankTransaction = async (reconciliationId, reason = '') => {
    if (!isAdmin) return { success: false, error: 'Unauthorized: Admin role required to unmatch bank transactions.' };
    if (!reconciliationId) return { success: false, error: 'Reconciliation ID is required.' };
    try {
      const { data, error: err } = await supabase.rpc('unmatch_payroll_bank_transaction_atomic', {
        p_reconciliation_id: reconciliationId,
        p_reason: reason || null
      });
      if (err) throw err;
      if (data && data.success === false) {
        return { success: false, error: data.error || data.message || 'Failed to unmatch bank transaction.' };
      }
      await Promise.all([
        fetchBankReconciliations(activeOperatingCompanyId),
        fetchPayrollPaymentBatches(activeOperatingCompanyId),
        fetchDashboardSummary(activeOperatingCompanyId)
      ]);
      return { success: true, data };
    } catch (err) {
      console.error('Error executing unmatch_payroll_bank_transaction_atomic:', err);
      return { success: false, error: err.message || 'Failed to unmatch bank transaction.' };
    }
  };

  // 6r. Generate Statutory Export via generate_payroll_statutory_export_atomic
  const generateStatutoryExport = async (payrollPeriodId, statutoryType) => {
    if (!isManagementOrAdmin) return { success: false, error: 'Unauthorized: Management role required.' };
    if (!payrollPeriodId || !statutoryType) return { success: false, error: 'Period ID and Statutory Type are required.' };
    try {
      const { data, error: err } = await supabase.rpc('generate_payroll_statutory_export_atomic', {
        p_payroll_period_id: payrollPeriodId,
        p_statutory_type: statutoryType
      });
      if (err) throw err;
      if (data && data.success === false) {
        return { success: false, error: data.error || data.message || 'Failed to generate statutory export.' };
      }
      return { success: true, data };
    } catch (err) {
      console.error('Error executing generate_payroll_statutory_export_atomic:', err);
      return { success: false, error: err.message || 'Failed to generate statutory export.' };
    }
  };

  // 6s. Generate PF ECR File via generate_payroll_pf_ecr_atomic
  const generatePfEcrExport = async (payrollPeriodId) => {
    if (!isManagementOrAdmin) return { success: false, error: 'Unauthorized: Management role required.' };
    if (!payrollPeriodId) return { success: false, error: 'Period ID is required.' };
    try {
      const { data, error: err } = await supabase.rpc('generate_payroll_pf_ecr_atomic', {
        p_payroll_period_id: payrollPeriodId
      });
      if (err) throw err;
      if (data && data.success === false) {
        return { success: false, error: data.error || data.message || 'Failed to generate PF ECR file.' };
      }
      return { success: true, data };
    } catch (err) {
      console.error('Error executing generate_payroll_pf_ecr_atomic:', err);
      return { success: false, error: err.message || 'Failed to generate PF ECR file.' };
    }
  };

  // 6t. Generate ESI Export File via generate_payroll_esi_export_atomic
  const generateEsiExport = async (payrollPeriodId) => {
    if (!isManagementOrAdmin) return { success: false, error: 'Unauthorized: Management role required.' };
    if (!payrollPeriodId) return { success: false, error: 'Period ID is required.' };
    try {
      const { data, error: err } = await supabase.rpc('generate_payroll_esi_export_atomic', {
        p_payroll_period_id: payrollPeriodId
      });
      if (err) throw err;
      if (data && data.success === false) {
        return { success: false, error: data.error || data.message || 'Failed to generate ESI export file.' };
      }
      return { success: true, data };
    } catch (err) {
      console.error('Error executing generate_payroll_esi_export_atomic:', err);
      return { success: false, error: err.message || 'Failed to generate ESI export file.' };
    }
  };

  // 6u. Process Statutory Payment via process_payroll_statutory_payment_atomic (Admin/Owner Only)
  const processStatutoryPayment = async (settlementId, bankAccountId, referenceNo = '') => {
    if (!isAdmin) return { success: false, error: 'Unauthorized: Admin/Owner role required to process statutory payment.' };
    if (!settlementId || !bankAccountId) return { success: false, error: 'Settlement ID and Bank Account ID are required.' };
    try {
      const { data, error: err } = await supabase.rpc('process_payroll_statutory_payment_atomic', {
        p_settlement_id: settlementId,
        p_bank_account_id: bankAccountId,
        p_reference_no: referenceNo || null
      });
      if (err) throw err;
      if (data && data.success === false) {
        return { success: false, error: data.error || data.message || 'Failed to process statutory payment.' };
      }
      await Promise.all([
        fetchStatutorySettlements(activeOperatingCompanyId),
        fetchDashboardSummary(activeOperatingCompanyId)
      ]);
      return { success: true, data };
    } catch (err) {
      console.error('Error executing process_payroll_statutory_payment_atomic:', err);
      return { success: false, error: err.message || 'Failed to process statutory payment.' };
    }
  };

  // 6v. Generate Employee Payslip via generate_payroll_payslip_atomic
  const generatePayslip = async (payrollRunItemId) => {
    if (!payrollRunItemId) return { success: false, error: 'Payroll Run Item ID is required.' };
    try {
      const { data, error: err } = await supabase.rpc('generate_payroll_payslip_atomic', {
        p_payroll_run_item_id: payrollRunItemId
      });
      if (err) throw err;
      if (data && data.success === false) {
        return { success: false, error: data.error || data.message || 'Failed to generate payslip.' };
      }
      return { success: true, data };
    } catch (err) {
      console.error('Error executing generate_payroll_payslip_atomic:', err);
      return { success: false, error: err.message || 'Failed to generate payslip.' };
    }
  };

  // 6w. Generate Form 16 Preparation Statement via generate_payroll_form16_preparation_atomic
  const generateForm16Preparation = async (employeeId, taxYear) => {
    if (!employeeId || !taxYear) return { success: false, error: 'Employee ID and Tax Year are required.' };
    try {
      const { data, error: err } = await supabase.rpc('generate_payroll_form16_preparation_atomic', {
        p_employee_id: employeeId,
        p_tax_year: taxYear
      });
      if (err) throw err;
      if (data && data.success === false) {
        return { success: false, error: data.error || data.message || 'Failed to generate Form 16 preparation statement.' };
      }
      return { success: true, data };
    } catch (err) {
      console.error('Error executing generate_payroll_form16_preparation_atomic:', err);
      return { success: false, error: err.message || 'Failed to generate Form 16 preparation statement.' };
    }
  };

  // 7. Save / Submit Tax Declaration & Previous Employer Records
  const saveTaxDeclaration = async (decPayload, prevEmployers = []) => {
    try {
      const payload = {
        tenant_id: tenantId || null,
        tenant_company_id: activeOperatingCompanyId || null,
        employee_id: decPayload.employee_id,
        tax_year: decPayload.tax_year || '2026-2027',
        tax_regime: decPayload.tax_regime || 'new_regime',
        residency_status: decPayload.residency_status || 'resident',
        tds_applicable: decPayload.tds_applicable !== undefined ? decPayload.tds_applicable : true,
        projected_annual_salary: parseFloat(decPayload.projected_annual_salary || 0),
        other_income: parseFloat(decPayload.other_income || 0),
        home_loan_interest: parseFloat(decPayload.home_loan_interest || 0),
        previous_employer_income: parseFloat(decPayload.previous_employer_income || 0),
        previous_employer_tds: parseFloat(decPayload.previous_employer_tds || 0),
        hra_data: decPayload.hra_data || {},
        deduction_data: decPayload.deduction_data || {},
        exemption_data: decPayload.exemption_data || {},
        evidence_data: decPayload.evidence_data || {},
        declaration_status: decPayload.declaration_status || 'submitted',
        updated_at: new Date().toISOString()
      };

      let decResult;
      if (decPayload.id) {
        const { data, error: err } = await supabase
          .from('payroll_tax_declarations')
          .update(payload)
          .eq('id', decPayload.id)
          .select('*')
          .single();
        if (err) throw err;
        decResult = data;
      } else {
        payload.created_at = new Date().toISOString();
        const { data, error: err } = await supabase
          .from('payroll_tax_declarations')
          .insert([payload])
          .select('*')
          .single();
        if (err) throw err;
        decResult = data;
      }

      if (prevEmployers && prevEmployers.length > 0) {
        const prevItemsToInsert = prevEmployers.map(pe => ({
          tenant_id: tenantId || null,
          tenant_company_id: activeOperatingCompanyId || null,
          tax_declaration_id: decResult.id,
          employer_name: pe.employer_name || '',
          salary_income: parseFloat(pe.salary_income || 0),
          tds_deducted: parseFloat(pe.tds_deducted || 0),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        await supabase.from('payroll_tax_previous_employers').insert(prevItemsToInsert);
      }

      await fetchTaxDeclarations(activeOperatingCompanyId);
      return { success: true, data: decResult };
    } catch (err) {
      console.error('Error saving payroll_tax_declarations:', err);
      return { success: false, error: err.message };
    }
  };

  const updateTaxDeclarationStatus = async (declarationId, status) => {
    if (!isManagementOrAdmin) return { success: false, error: 'Unauthorized: Management role required.' };
    try {
      const { data, error: err } = await supabase
        .from('payroll_tax_declarations')
        .update({
          declaration_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', declarationId)
        .select('*')
        .single();
      if (err) throw err;
      await fetchTaxDeclarations(activeOperatingCompanyId);
      return { success: true, data };
    } catch (err) {
      console.error('Error updating declaration_status:', err);
      return { success: false, error: err.message };
    }
  };

  // Derived Summary
  const payrollSummary = useMemo(() => {
    const totalEmployees = employees.length;
    const activeStructuresCount = employeeSalaryStructures.filter(s => s.status === 'active').length;
    const activeRunsCount = payrollRuns.filter(r => ['draft', 'calculated', 'under_review'].includes(r.status)).length;

    return {
      totalEmployees,
      configuredEmployeesCount: activeStructuresCount,
      unconfiguredEmployeesCount: Math.max(0, totalEmployees - activeStructuresCount),
      activeRunsCount
    };
  }, [employees, employeeSalaryStructures, payrollRuns]);

  const value = {
    payrollSettings,
    payrollComponents,
    statutoryRules,
    employeeSalaryStructures,
    salaryStructureItems,
    payrollPeriods,
    payrollRuns,
    payrollRunItems,
    payrollRunItemComponents,
    taxDeclarations,
    previousEmployerRecords,
    payrollAccountMappings,
    payrollPaymentBatches,
    payrollPaymentItems,
    payrollBankFileProfiles,
    payrollBankFiles,
    payrollBankReconciliations,
    payrollStatutorySettlements,
    payrollDashboardSummary,
    payrollIntegrity,
    selectedPayrollRunId,
    setSelectedPayrollRunId,
    fetchPayrollIntegrity,
    isLoading,
    error,
    isManagementOrAdmin,
    isAdmin,
    payrollSummary,
    fetchAllPayrollData,
    savePayrollSettings,
    savePayrollComponent,
    deactivatePayrollComponent,
    deletePayrollComponent,
    saveStatutoryRule,
    saveSalaryStructure,
    deactivateSalaryStructure,
    deleteSalaryStructure,
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
    updateTaxDeclarationStatus,
    // Context Consumers for Data Integrity
    consumedMasterData: {
      employeesCount: employees.length,
      attendanceRecordsCount: attendanceDailyRecords.length,
      leaveRequestsCount: leaveRequests.length
    }
  };

  return <PayrollContext.Provider value={value}>{children}</PayrollContext.Provider>;
}

export function usePayroll() {
  const context = useContext(PayrollContext);
  if (!context) {
    throw new Error('usePayroll must be used within a PayrollProvider');
  }
  return context;
}
