import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useCrm } from './CrmContext';

const HrPolicyContext = createContext(null);

export function HrPolicyProvider({ children }) {
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

  // Selected Policy Set ID for active company
  const [activePolicySetId, setActivePolicySetId] = useState(null);

  // State collections
  const [hrPolicySets, setHrPolicySets] = useState([]);
  const [employeeCategories, setEmployeeCategories] = useState([]);
  const [workLocations, setWorkLocations] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leavePolicyRules, setLeavePolicyRules] = useState([]);
  const [attendancePolicies, setAttendancePolicies] = useState([]);
  const [weeklyOffPolicies, setWeeklyOffPolicies] = useState([]);
  const [holidayCalendars, setHolidayCalendars] = useState([]);
  const [holidayCalendarDays, setHolidayCalendarDays] = useState([]);
  const [overtimePolicies, setOvertimePolicies] = useState([]);
  const [compOffPolicies, setCompOffPolicies] = useState([]);
  const [approvalWorkflows, setApprovalWorkflows] = useState([]);
  const [approvalWorkflowSteps, setApprovalWorkflowSteps] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Management permission check
  const isManagementOrAdmin = useMemo(() => {
    const r = (userRole || '').toLowerCase();
    const tr = (tenantRole || '').toLowerCase();
    return r === 'admin' || tr === 'admin' || r === 'hr' || r === 'management' || r === 'owner';
  }, [userRole, tenantRole]);

  // Fetch functions per company
  const fetchPolicySets = useCallback(async (opCoId) => {
    setIsLoading(true);
    try {
      let query = supabase.from('hr_policy_sets').select('*').order('created_at', { ascending: false });
      if (opCoId) query = query.eq('tenant_company_id', opCoId);
      const { data, error } = await query;
      if (error) throw error;
      setHrPolicySets(data || []);
      if (data && data.length > 0) {
        setActivePolicySetId(data[0].id);
      } else {
        setActivePolicySetId(null);
      }
    } catch (err) {
      console.error('Error fetching HR Policy Sets:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async (opCoId) => {
    try {
      let query = supabase.from('employee_categories').select('*').order('name');
      if (opCoId) query = query.eq('tenant_company_id', opCoId);
      const { data, error } = await query;
      if (error) throw error;
      setEmployeeCategories(data || []);
    } catch (err) {
      console.error('Error fetching employee categories:', err);
    }
  }, []);

  const fetchWorkLocations = useCallback(async (opCoId) => {
    try {
      let query = supabase.from('work_locations').select('*').order('name');
      if (opCoId) query = query.eq('tenant_company_id', opCoId);
      const { data, error } = await query;
      if (error) throw error;
      setWorkLocations(data || []);
    } catch (err) {
      console.error('Error fetching work locations:', err);
    }
  }, []);

  const fetchLeaveTypes = useCallback(async (opCoId) => {
    try {
      let query = supabase.from('leave_types').select('*').order('name');
      if (opCoId) query = query.eq('tenant_company_id', opCoId);
      const { data, error } = await query;
      if (error) throw error;
      setLeaveTypes(data || []);
    } catch (err) {
      console.error('Error fetching leave types:', err);
    }
  }, []);

  const fetchHolidayCalendars = useCallback(async (opCoId) => {
    try {
      let query = supabase.from('holiday_calendars').select('*').order('year', { ascending: false });
      if (opCoId) query = query.eq('tenant_company_id', opCoId);
      const { data, error } = await query;
      if (error) throw error;
      setHolidayCalendars(data || []);

      if (data && data.length > 0) {
        const calIds = data.map(c => c.id);
        const { data: days } = await supabase.from('holiday_calendar_days').select('*').in('holiday_calendar_id', calIds).order('holiday_date');
        setHolidayCalendarDays(days || []);
      } else {
        setHolidayCalendarDays([]);
      }
    } catch (err) {
      console.error('Error fetching holiday calendars:', err);
    }
  }, []);

  const fetchApprovalWorkflows = useCallback(async (opCoId) => {
    try {
      let query = supabase.from('approval_workflows').select('*').order('name');
      if (opCoId) query = query.eq('tenant_company_id', opCoId);
      const { data, error } = await query;
      if (error) throw error;
      setApprovalWorkflows(data || []);

      if (data && data.length > 0) {
        const wfIds = data.map(w => w.id);
        const { data: steps } = await supabase.from('approval_workflow_steps').select('*').in('approval_workflow_id', wfIds).order('step_order');
        setApprovalWorkflowSteps(steps || []);
      } else {
        setApprovalWorkflowSteps([]);
      }
    } catch (err) {
      console.error('Error fetching approval workflows:', err);
    }
  }, []);

  const fetchPolicySetDetails = useCallback(async (policySetId) => {
    if (!policySetId) {
      setLeavePolicyRules([]);
      setAttendancePolicies([]);
      setWeeklyOffPolicies([]);
      setOvertimePolicies([]);
      setCompOffPolicies([]);
      return;
    }
    try {
      const [lr, ap, wo, ot, co] = await Promise.all([
        supabase.from('leave_policy_rules').select('*').eq('hr_policy_set_id', policySetId),
        supabase.from('attendance_policies').select('*').eq('hr_policy_set_id', policySetId),
        supabase.from('weekly_off_policies').select('*').eq('hr_policy_set_id', policySetId),
        supabase.from('overtime_policies').select('*').eq('hr_policy_set_id', policySetId),
        supabase.from('comp_off_policies').select('*').eq('hr_policy_set_id', policySetId)
      ]);

      setLeavePolicyRules(lr.data || []);
      setAttendancePolicies(ap.data || []);
      setWeeklyOffPolicies(wo.data || []);
      setOvertimePolicies(ot.data || []);
      setCompOffPolicies(co.data || []);
    } catch (err) {
      console.error('Error fetching policy set details:', err);
    }
  }, []);

  // Main load effect
  useEffect(() => {
    if (authUserId) {
      fetchPolicySets(activeOperatingCompanyId);
      fetchCategories(activeOperatingCompanyId);
      fetchWorkLocations(activeOperatingCompanyId);
      fetchLeaveTypes(activeOperatingCompanyId);
      fetchHolidayCalendars(activeOperatingCompanyId);
      fetchApprovalWorkflows(activeOperatingCompanyId);
    }
  }, [
    authUserId,
    activeOperatingCompanyId,
    fetchPolicySets,
    fetchCategories,
    fetchWorkLocations,
    fetchLeaveTypes,
    fetchHolidayCalendars,
    fetchApprovalWorkflows
  ]);

  // Load details when activePolicySetId changes
  useEffect(() => {
    if (activePolicySetId) {
      fetchPolicySetDetails(activePolicySetId);
    }
  }, [activePolicySetId, fetchPolicySetDetails]);

  // CRUD Methods (Guarded at data-operation level)
  const savePolicySet = async (policyData) => {
    if (!isManagementOrAdmin) return { success: false, error: 'Permission Denied: Only management or admin roles can configure policy sets.' };
    try {
      const payload = {
        ...policyData,
        tenant_id: tenantId || null,
        tenant_company_id: activeOperatingCompanyId || policyData.tenant_company_id || null,
        created_by: authUserId || null,
        updated_at: new Date().toISOString()
      };
      let resData = null;
      if (policyData.id) {
        const { data, error } = await supabase.from('hr_policy_sets').update(payload).eq('id', policyData.id).select('*').single();
        if (error) throw error;
        resData = data;
      } else {
        const { data, error } = await supabase.from('hr_policy_sets').insert([payload]).select('*').single();
        if (error) throw error;
        resData = data;
      }
      await fetchPolicySets(activeOperatingCompanyId);
      if (resData?.id) setActivePolicySetId(resData.id);
      return { success: true, policySet: resData };
    } catch (err) {
      console.error('Error saving policy set:', err);
      return { success: false, error: err.message };
    }
  };

  const saveEmployeeCategory = async (catData) => {
    if (!isManagementOrAdmin) return { success: false, error: 'Permission Denied: Only management or admin roles can configure categories.' };
    try {
      const payload = {
        ...catData,
        tenant_id: tenantId || null,
        tenant_company_id: activeOperatingCompanyId || catData.tenant_company_id || null,
        updated_at: new Date().toISOString()
      };
      if (catData.id) {
        const { error } = await supabase.from('employee_categories').update(payload).eq('id', catData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('employee_categories').insert([payload]);
        if (error) throw error;
      }
      await fetchCategories(activeOperatingCompanyId);
      return { success: true };
    } catch (err) {
      console.error('Error saving category:', err);
      return { success: false, error: err.message };
    }
  };

  const saveWorkLocation = async (locData) => {
    if (!isManagementOrAdmin) return { success: false, error: 'Permission Denied: Only management or admin roles can configure work locations.' };
    try {
      const payload = {
        ...locData,
        tenant_id: tenantId || null,
        tenant_company_id: activeOperatingCompanyId || locData.tenant_company_id || null,
        updated_at: new Date().toISOString()
      };
      if (locData.id) {
        const { error } = await supabase.from('work_locations').update(payload).eq('id', locData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('work_locations').insert([payload]);
        if (error) throw error;
      }
      await fetchWorkLocations(activeOperatingCompanyId);
      return { success: true };
    } catch (err) {
      console.error('Error saving work location:', err);
      return { success: false, error: err.message };
    }
  };

  const saveLeaveType = async (typeData) => {
    if (!isManagementOrAdmin) return { success: false, error: 'Permission Denied: Only management or admin roles can configure leave types.' };
    try {
      const payload = {
        ...typeData,
        tenant_id: tenantId || null,
        tenant_company_id: activeOperatingCompanyId || typeData.tenant_company_id || null,
        updated_at: new Date().toISOString()
      };
      if (typeData.id) {
        const { error } = await supabase.from('leave_types').update(payload).eq('id', typeData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('leave_types').insert([payload]);
        if (error) throw error;
      }
      await fetchLeaveTypes(activeOperatingCompanyId);
      return { success: true };
    } catch (err) {
      console.error('Error saving leave type:', err);
      return { success: false, error: err.message };
    }
  };

  const saveLeavePolicyRule = async (ruleData) => {
    if (!isManagementOrAdmin) return { success: false, error: 'Permission Denied: Only management or admin roles can configure leave rules.' };
    if (!activePolicySetId) return { success: false, error: 'Please select or create an HR Policy Set first.' };
    try {
      const payload = {
        ...ruleData,
        tenant_id: tenantId || null,
        hr_policy_set_id: activePolicySetId,
        updated_at: new Date().toISOString()
      };
      if (ruleData.id) {
        const { error } = await supabase.from('leave_policy_rules').update(payload).eq('id', ruleData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('leave_policy_rules').insert([payload]);
        if (error) throw error;
      }
      await fetchPolicySetDetails(activePolicySetId);
      return { success: true };
    } catch (err) {
      console.error('Error saving leave policy rule:', err);
      return { success: false, error: err.message };
    }
  };

  const saveAttendancePolicy = async (attData) => {
    if (!isManagementOrAdmin) return { success: false, error: 'Permission Denied: Only management or admin roles can configure attendance policies.' };
    if (!activePolicySetId) return { success: false, error: 'Please select or create an HR Policy Set first.' };
    try {
      const payload = {
        ...attData,
        tenant_id: tenantId || null,
        hr_policy_set_id: activePolicySetId,
        updated_at: new Date().toISOString()
      };
      if (attData.id) {
        const { error } = await supabase.from('attendance_policies').update(payload).eq('id', attData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('attendance_policies').insert([payload]);
        if (error) throw error;
      }
      await fetchPolicySetDetails(activePolicySetId);
      return { success: true };
    } catch (err) {
      console.error('Error saving attendance policy:', err);
      return { success: false, error: err.message };
    }
  };

  const saveWeeklyOffPolicy = async (woData) => {
    if (!isManagementOrAdmin) return { success: false, error: 'Permission Denied: Only management or admin roles can configure weekly off policies.' };
    if (!activePolicySetId) return { success: false, error: 'Please select or create an HR Policy Set first.' };
    try {
      const payload = {
        ...woData,
        tenant_id: tenantId || null,
        hr_policy_set_id: activePolicySetId,
        updated_at: new Date().toISOString()
      };
      if (woData.id) {
        const { error } = await supabase.from('weekly_off_policies').update(payload).eq('id', woData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('weekly_off_policies').insert([payload]);
        if (error) throw error;
      }
      await fetchPolicySetDetails(activePolicySetId);
      return { success: true };
    } catch (err) {
      console.error('Error saving weekly off policy:', err);
      return { success: false, error: err.message };
    }
  };

  const saveHolidayCalendar = async (calData) => {
    if (!isManagementOrAdmin) return { success: false, error: 'Permission Denied: Only management or admin roles can configure holiday calendars.' };
    try {
      const payload = {
        ...calData,
        tenant_id: tenantId || null,
        tenant_company_id: activeOperatingCompanyId || calData.tenant_company_id || null,
        updated_at: new Date().toISOString()
      };
      if (calData.id) {
        const { error } = await supabase.from('holiday_calendars').update(payload).eq('id', calData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('holiday_calendars').insert([payload]);
        if (error) throw error;
      }
      await fetchHolidayCalendars(activeOperatingCompanyId);
      return { success: true };
    } catch (err) {
      console.error('Error saving holiday calendar:', err);
      return { success: false, error: err.message };
    }
  };

  const saveHolidayCalendarDay = async (dayData) => {
    if (!isManagementOrAdmin) return { success: false, error: 'Permission Denied: Only management or admin roles can add holiday dates.' };
    try {
      const payload = {
        ...dayData,
        tenant_id: tenantId || null
      };
      if (dayData.id) {
        const { error } = await supabase.from('holiday_calendar_days').update(payload).eq('id', dayData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('holiday_calendar_days').insert([payload]);
        if (error) throw error;
      }
      await fetchHolidayCalendars(activeOperatingCompanyId);
      return { success: true };
    } catch (err) {
      console.error('Error saving holiday day:', err);
      return { success: false, error: err.message };
    }
  };

  const saveOvertimePolicy = async (otData) => {
    if (!isManagementOrAdmin) return { success: false, error: 'Permission Denied: Only management or admin roles can configure overtime policies.' };
    if (!activePolicySetId) return { success: false, error: 'Please select or create an HR Policy Set first.' };
    try {
      const payload = {
        ...otData,
        tenant_id: tenantId || null,
        hr_policy_set_id: activePolicySetId,
        updated_at: new Date().toISOString()
      };
      if (otData.id) {
        const { error } = await supabase.from('overtime_policies').update(payload).eq('id', otData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('overtime_policies').insert([payload]);
        if (error) throw error;
      }
      await fetchPolicySetDetails(activePolicySetId);
      return { success: true };
    } catch (err) {
      console.error('Error saving overtime policy:', err);
      return { success: false, error: err.message };
    }
  };

  const saveCompOffPolicy = async (coData) => {
    if (!isManagementOrAdmin) return { success: false, error: 'Permission Denied: Only management or admin roles can configure comp-off policies.' };
    if (!activePolicySetId) return { success: false, error: 'Please select or create an HR Policy Set first.' };
    try {
      const payload = {
        ...coData,
        tenant_id: tenantId || null,
        hr_policy_set_id: activePolicySetId,
        updated_at: new Date().toISOString()
      };
      if (coData.id) {
        const { error } = await supabase.from('comp_off_policies').update(payload).eq('id', coData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('comp_off_policies').insert([payload]);
        if (error) throw error;
      }
      await fetchPolicySetDetails(activePolicySetId);
      return { success: true };
    } catch (err) {
      console.error('Error saving comp-off policy:', err);
      return { success: false, error: err.message };
    }
  };

  const saveApprovalWorkflow = async (wfData, steps = []) => {
    if (!isManagementOrAdmin) return { success: false, error: 'Permission Denied: Only management or admin roles can configure approval workflows.' };
    try {
      const payload = {
        ...wfData,
        tenant_id: tenantId || null,
        tenant_company_id: activeOperatingCompanyId || wfData.tenant_company_id || null,
        updated_at: new Date().toISOString()
      };

      let workflowRes = null;
      if (wfData.id) {
        const { data, error } = await supabase.from('approval_workflows').update(payload).eq('id', wfData.id).select('*').single();
        if (error) throw error;
        workflowRes = data;
      } else {
        const { data, error } = await supabase.from('approval_workflows').insert([payload]).select('*').single();
        if (error) throw error;
        workflowRes = data;
      }

      if (workflowRes?.id && steps.length > 0) {
        await supabase.from('approval_workflow_steps').delete().eq('approval_workflow_id', workflowRes.id);
        const stepsToInsert = steps.map((s, idx) => ({
          approval_workflow_id: workflowRes.id,
          tenant_id: tenantId || null,
          step_order: idx + 1,
          approver_type: s.approver_type || 'Role',
          approver_role: s.approver_role || 'Manager',
          updated_at: new Date().toISOString()
        }));
        await supabase.from('approval_workflow_steps').insert(stepsToInsert);
      }

      await fetchApprovalWorkflows(activeOperatingCompanyId);
      return { success: true, workflow: workflowRes };
    } catch (err) {
      console.error('Error saving approval workflow:', err);
      return { success: false, error: err.message };
    }
  };

  const value = {
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
    error,
    isManagementOrAdmin,
    companies,
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
  };

  return <HrPolicyContext.Provider value={value}>{children}</HrPolicyContext.Provider>;
}

export function useHrPolicy() {
  const context = useContext(HrPolicyContext);
  if (!context) {
    throw new Error('useHrPolicy must be used within an HrPolicyProvider');
  }
  return context;
}
