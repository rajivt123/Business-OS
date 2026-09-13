import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useCrm } from './CrmContext';

const EmployeeContext = createContext(null);

export function EmployeeProvider({ children }) {
  const crmContext = useCrm() || {};
  const {
    tenantId,
    activeOperatingCompanyId,
    userRole,
    tenantRole,
    currentUser,
    session,
    companies = []
  } = crmContext;

  const authUserId = session?.user?.id || currentUser?.id;

  // Primary State
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [employeeCompanyAssignments, setEmployeeCompanyAssignments] = useState([]);
  const [employeeFieldDefinitions, setEmployeeFieldDefinitions] = useState([]);
  const [employeeFieldConfigurations, setEmployeeFieldConfigurations] = useState([]);
  const [employeeFieldValues, setEmployeeFieldValues] = useState([]);

  // Sub-records for current/selected employee
  const [employeePfDetails, setEmployeePfDetails] = useState([]);
  const [employeeEsiDetails, setEmployeeEsiDetails] = useState([]);
  const [employeeTaxDetails, setEmployeeTaxDetails] = useState([]);
  const [employeeBankAccounts, setEmployeeBankAccounts] = useState([]);
  const [employeeDependents, setEmployeeDependents] = useState([]);
  const [employeeNominees, setEmployeeNominees] = useState([]);
  const [employeeDocuments, setEmployeeDocuments] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Role permissions check aligned with existing Business OS role model (OWNER / ADMIN / MANAGER)
  const isManagementOrAdmin = useMemo(() => {
    const r = (userRole || '').toLowerCase();
    const tr = (tenantRole || '').toLowerCase();
    const allowedRoles = ['owner', 'admin', 'manager'];
    return allowedRoles.includes(r) || allowedRoles.includes(tr);
  }, [userRole, tenantRole]);

  // Data fetching functions
  const fetchDepartments = useCallback(async (opCoId) => {
    try {
      let query = supabase.from('departments').select('*').order('name');
      if (opCoId) query = query.eq('tenant_company_id', opCoId);
      const { data, error } = await query;
      if (error) throw error;
      setDepartments(data || []);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  }, []);

  const fetchDesignations = useCallback(async (opCoId) => {
    try {
      let query = supabase.from('designations').select('*').order('name');
      if (opCoId) query = query.eq('tenant_company_id', opCoId);
      const { data, error } = await query;
      if (error) throw error;
      setDesignations(data || []);
    } catch (err) {
      console.error('Error fetching designations:', err);
    }
  }, []);

  const fetchFieldDefinitions = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('employee_field_definitions').select('*').order('label');
      if (error) throw error;
      setEmployeeFieldDefinitions(data || []);
    } catch (err) {
      console.error('Error fetching field definitions:', err);
    }
  }, []);

  const fetchFieldConfigurations = useCallback(async (opCoId) => {
    try {
      let query = supabase.from('employee_field_configurations').select('*').order('display_order');
      if (opCoId) query = query.eq('tenant_company_id', opCoId);
      const { data, error } = await query;
      if (error) throw error;
      setEmployeeFieldConfigurations(data || []);
    } catch (err) {
      console.error('Error fetching field configurations:', err);
    }
  }, []);

  const fetchEmployees = useCallback(async (opCoId) => {
    setIsLoading(true);
    try {
      let query = supabase.from('employees').select('*').order('created_at', { ascending: false });
      if (opCoId) query = query.eq('tenant_company_id', opCoId);
      const { data, error } = await query;
      if (error) throw error;
      setEmployees(data || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCompanyAssignments = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('employee_company_assignments').select('*');
      if (error) throw error;
      setEmployeeCompanyAssignments(data || []);
    } catch (err) {
      console.error('Error fetching company assignments:', err);
    }
  }, []);

  const fetchFieldValues = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('employee_field_values').select('*');
      if (error) throw error;
      setEmployeeFieldValues(data || []);
    } catch (err) {
      console.error('Error fetching field values:', err);
    }
  }, []);

  const fetchEmployeeSubRecords = useCallback(async (employeeId) => {
    if (!employeeId) return;
    try {
      const [pf, esi, tax, bank, dep, nom, doc] = await Promise.all([
        supabase.from('employee_pf_details').select('*').eq('employee_id', employeeId),
        supabase.from('employee_esi_details').select('*').eq('employee_id', employeeId),
        supabase.from('employee_tax_details').select('*').eq('employee_id', employeeId),
        supabase.from('employee_bank_accounts').select('*').eq('employee_id', employeeId),
        supabase.from('employee_dependents').select('*').eq('employee_id', employeeId),
        supabase.from('employee_nominees').select('*').eq('employee_id', employeeId),
        supabase.from('employee_documents').select('*').eq('employee_id', employeeId)
      ]);

      setEmployeePfDetails(pf.data || []);
      setEmployeeEsiDetails(esi.data || []);
      setEmployeeTaxDetails(tax.data || []);
      setEmployeeBankAccounts(bank.data || []);
      setEmployeeDependents(dep.data || []);
      setEmployeeNominees(nom.data || []);
      setEmployeeDocuments(doc.data || []);
    } catch (err) {
      console.error('Error fetching employee sub records:', err);
    }
  }, []);

  // Primary load effect
  useEffect(() => {
    if (authUserId) {
      fetchEmployees(activeOperatingCompanyId);
      fetchDepartments(activeOperatingCompanyId);
      fetchDesignations(activeOperatingCompanyId);
      fetchFieldDefinitions();
      fetchFieldConfigurations(activeOperatingCompanyId);
      fetchCompanyAssignments();
      fetchFieldValues();
    }
  }, [
    authUserId,
    activeOperatingCompanyId,
    fetchEmployees,
    fetchDepartments,
    fetchDesignations,
    fetchFieldDefinitions,
    fetchFieldConfigurations,
    fetchCompanyAssignments,
    fetchFieldValues
  ]);

  // CRUD Actions
  const saveEmployee = async (employeeData, additionalCompanyIds = []) => {
    try {
      const payload = {
        ...employeeData,
        tenant_id: tenantId || employeeData.tenant_id || null,
        tenant_company_id: activeOperatingCompanyId || employeeData.tenant_company_id || null,
        created_by: authUserId || null,
        updated_at: new Date().toISOString()
      };

      let resultEmployee = null;
      if (employeeData.id) {
        const { data, error } = await supabase
          .from('employees')
          .update(payload)
          .eq('id', employeeData.id)
          .select('*')
          .single();
        if (error) throw error;
        resultEmployee = data;
      } else {
        const { data, error } = await supabase
          .from('employees')
          .insert([payload])
          .select('*')
          .single();
        if (error) throw error;
        resultEmployee = data;
      }

      // Handle multi-company assignments in employee_company_assignments
      if (resultEmployee && resultEmployee.id) {
        const empId = resultEmployee.id;
        // Delete old assignments
        await supabase.from('employee_company_assignments').delete().eq('employee_id', empId);
        
        const assignmentsToInsert = [];
        // Primary company
        if (resultEmployee.tenant_company_id) {
          assignmentsToInsert.push({
            employee_id: empId,
            tenant_id: tenantId || null,
            tenant_company_id: resultEmployee.tenant_company_id,
            is_primary: true,
            status: 'Active',
            created_by: authUserId || null
          });
        }
        // Additional companies
        for (const cid of additionalCompanyIds) {
          if (cid !== resultEmployee.tenant_company_id) {
            assignmentsToInsert.push({
              employee_id: empId,
              tenant_id: tenantId || null,
              tenant_company_id: cid,
              is_primary: false,
              status: 'Active',
              created_by: authUserId || null
            });
          }
        }

        if (assignmentsToInsert.length > 0) {
          await supabase.from('employee_company_assignments').insert(assignmentsToInsert);
        }
      }

      await fetchEmployees(activeOperatingCompanyId);
      await fetchCompanyAssignments();
      return { success: true, employee: resultEmployee };
    } catch (err) {
      console.error('Error saving employee:', err);
      return { success: false, error: err.message };
    }
  };

  const saveDepartment = async (deptData) => {
    try {
      const payload = {
        ...deptData,
        tenant_id: tenantId || null,
        tenant_company_id: activeOperatingCompanyId || deptData.tenant_company_id || null,
        created_by: authUserId || null
      };

      if (deptData.id) {
        const { error } = await supabase.from('departments').update(payload).eq('id', deptData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('departments').insert([payload]);
        if (error) throw error;
      }
      await fetchDepartments(activeOperatingCompanyId);
      return { success: true };
    } catch (err) {
      console.error('Error saving department:', err);
      return { success: false, error: err.message };
    }
  };

  const saveDesignation = async (desigData) => {
    try {
      const payload = {
        ...desigData,
        tenant_id: tenantId || null,
        tenant_company_id: activeOperatingCompanyId || desigData.tenant_company_id || null,
        created_by: authUserId || null
      };

      if (desigData.id) {
        const { error } = await supabase.from('designations').update(payload).eq('id', desigData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('designations').insert([payload]);
        if (error) throw error;
      }
      await fetchDesignations(activeOperatingCompanyId);
      return { success: true };
    } catch (err) {
      console.error('Error saving designation:', err);
      return { success: false, error: err.message };
    }
  };

  const savePfDetails = async (pfData) => {
    try {
      const payload = {
        ...pfData,
        tenant_id: tenantId || null,
        created_by: authUserId || null
      };
      if (pfData.id) {
        const { error } = await supabase.from('employee_pf_details').update(payload).eq('id', pfData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('employee_pf_details').insert([payload]);
        if (error) throw error;
      }
      await fetchEmployeeSubRecords(pfData.employee_id);
      return { success: true };
    } catch (err) {
      console.error('Error saving PF details:', err);
      return { success: false, error: err.message };
    }
  };

  const saveEsiDetails = async (esiData) => {
    try {
      const payload = {
        ...esiData,
        tenant_id: tenantId || null,
        created_by: authUserId || null
      };
      if (esiData.id) {
        const { error } = await supabase.from('employee_esi_details').update(payload).eq('id', esiData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('employee_esi_details').insert([payload]);
        if (error) throw error;
      }
      await fetchEmployeeSubRecords(esiData.employee_id);
      return { success: true };
    } catch (err) {
      console.error('Error saving ESI details:', err);
      return { success: false, error: err.message };
    }
  };

  const saveTaxDetails = async (taxData) => {
    try {
      const payload = {
        ...taxData,
        tenant_id: tenantId || null,
        created_by: authUserId || null
      };
      if (taxData.id) {
        const { error } = await supabase.from('employee_tax_details').update(payload).eq('id', taxData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('employee_tax_details').insert([payload]);
        if (error) throw error;
      }
      await fetchEmployeeSubRecords(taxData.employee_id);
      return { success: true };
    } catch (err) {
      console.error('Error saving Tax details:', err);
      return { success: false, error: err.message };
    }
  };

  const saveBankAccount = async (bankData) => {
    try {
      const payload = {
        ...bankData,
        tenant_id: tenantId || null,
        created_by: authUserId || null
      };
      if (bankData.id) {
        const { error } = await supabase.from('employee_bank_accounts').update(payload).eq('id', bankData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('employee_bank_accounts').insert([payload]);
        if (error) throw error;
      }
      await fetchEmployeeSubRecords(bankData.employee_id);
      return { success: true };
    } catch (err) {
      console.error('Error saving bank account:', err);
      return { success: false, error: err.message };
    }
  };

  const saveDependent = async (depData) => {
    try {
      const payload = {
        ...depData,
        tenant_id: tenantId || null,
        created_by: authUserId || null
      };
      if (depData.id) {
        const { error } = await supabase.from('employee_dependents').update(payload).eq('id', depData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('employee_dependents').insert([payload]);
        if (error) throw error;
      }
      await fetchEmployeeSubRecords(depData.employee_id);
      return { success: true };
    } catch (err) {
      console.error('Error saving dependent:', err);
      return { success: false, error: err.message };
    }
  };

  const deleteDependent = async (id, employeeId) => {
    try {
      const { error } = await supabase.from('employee_dependents').delete().eq('id', id);
      if (error) throw error;
      await fetchEmployeeSubRecords(employeeId);
      return { success: true };
    } catch (err) {
      console.error('Error deleting dependent:', err);
      return { success: false, error: err.message };
    }
  };

  const saveNominee = async (nomData) => {
    try {
      const payload = {
        ...nomData,
        tenant_id: tenantId || null,
        created_by: authUserId || null
      };
      if (nomData.id) {
        const { error } = await supabase.from('employee_nominees').update(payload).eq('id', nomData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('employee_nominees').insert([payload]);
        if (error) throw error;
      }
      await fetchEmployeeSubRecords(nomData.employee_id);
      return { success: true };
    } catch (err) {
      console.error('Error saving nominee:', err);
      return { success: false, error: err.message };
    }
  };

  const deleteNominee = async (id, employeeId) => {
    try {
      const { error } = await supabase.from('employee_nominees').delete().eq('id', id);
      if (error) throw error;
      await fetchEmployeeSubRecords(employeeId);
      return { success: true };
    } catch (err) {
      console.error('Error deleting nominee:', err);
      return { success: false, error: err.message };
    }
  };

  const saveDocument = async (docData) => {
    try {
      const payload = {
        ...docData,
        tenant_id: tenantId || null,
        created_by: authUserId || null
      };
      if (docData.id) {
        const { error } = await supabase.from('employee_documents').update(payload).eq('id', docData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('employee_documents').insert([payload]);
        if (error) throw error;
      }
      await fetchEmployeeSubRecords(docData.employee_id);
      return { success: true };
    } catch (err) {
      console.error('Error saving document:', err);
      return { success: false, error: err.message };
    }
  };

  const deleteDocument = async (id, employeeId) => {
    try {
      const { error } = await supabase.from('employee_documents').delete().eq('id', id);
      if (error) throw error;
      await fetchEmployeeSubRecords(employeeId);
      return { success: true };
    } catch (err) {
      console.error('Error deleting document:', err);
      return { success: false, error: err.message };
    }
  };

  const saveFieldValue = async (valueData) => {
    try {
      const payload = {
        ...valueData,
        tenant_id: tenantId || null,
        created_by: authUserId || null
      };
      // Check if existing record for employee_id + field_definition_id
      const existing = employeeFieldValues.find(
        v => v.employee_id === valueData.employee_id && v.field_definition_id === valueData.field_definition_id
      );

      if (existing) {
        const { error } = await supabase
          .from('employee_field_values')
          .update({ value: valueData.value, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('employee_field_values').insert([payload]);
        if (error) throw error;
      }
      await fetchFieldValues();
      return { success: true };
    } catch (err) {
      console.error('Error saving field value:', err);
      return { success: false, error: err.message };
    }
  };

  // Operation-level Permission Guarded Configuration Write Methods
  const saveFieldDefinition = async (defData) => {
    // Permission Guard: Junior HR cannot write field definitions
    if (!isManagementOrAdmin) {
      return {
        success: false,
        error: 'Permission Denied: Only management or admin roles can create or modify record definitions.'
      };
    }

    try {
      const payload = {
        ...defData,
        tenant_id: tenantId || null,
        created_by: authUserId || null
      };
      if (defData.id) {
        const { error } = await supabase.from('employee_field_definitions').update(payload).eq('id', defData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('employee_field_definitions').insert([payload]);
        if (error) throw error;
      }
      await fetchFieldDefinitions();
      return { success: true };
    } catch (err) {
      console.error('Error saving field definition:', err);
      return { success: false, error: err.message };
    }
  };

  const saveFieldConfiguration = async (configData) => {
    // Permission Guard: Junior HR cannot write field configurations
    if (!isManagementOrAdmin) {
      return {
        success: false,
        error: 'Permission Denied: Only management or admin roles can modify field configurations.'
      };
    }

    try {
      const payload = {
        ...configData,
        tenant_id: tenantId || null,
        tenant_company_id: activeOperatingCompanyId || configData.tenant_company_id || null,
        created_by: authUserId || null
      };

      const existing = employeeFieldConfigurations.find(
        c => c.field_definition_id === configData.field_definition_id &&
             (c.tenant_company_id === payload.tenant_company_id || (!c.tenant_company_id && !payload.tenant_company_id))
      );

      if (existing) {
        const { error } = await supabase
          .from('employee_field_configurations')
          .update(payload)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('employee_field_configurations').insert([payload]);
        if (error) throw error;
      }
      await fetchFieldConfigurations(activeOperatingCompanyId);
      return { success: true };
    } catch (err) {
      console.error('Error saving field configuration:', err);
      return { success: false, error: err.message };
    }
  };

  const value = {
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
    error,
    isManagementOrAdmin,
    fetchEmployees,
    fetchDepartments,
    fetchDesignations,
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
    saveFieldConfiguration,
    companies
  };

  return <EmployeeContext.Provider value={value}>{children}</EmployeeContext.Provider>;
}

export function useEmployee() {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error('useEmployee must be used within an EmployeeProvider');
  }
  return context;
}
