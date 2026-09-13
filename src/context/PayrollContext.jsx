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
        fetchTaxDeclarations(opCoId)
      ]);
    } catch (err) {
      console.error('Error loading payroll foundation data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [authUserId, fetchPayrollSettings, fetchPayrollComponents, fetchStatutoryRules, fetchSalaryStructures, fetchPayrollPeriods, fetchPayrollRuns, fetchTaxDeclarations]);

  useEffect(() => {
    if (authUserId) {
      fetchAllPayrollData(activeOperatingCompanyId);
    }
  }, [authUserId, activeOperatingCompanyId, fetchAllPayrollData]);

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
    isLoading,
    error,
    isManagementOrAdmin,
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
    calculatePayrollRun,
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
