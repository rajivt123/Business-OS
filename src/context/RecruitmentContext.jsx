import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useCrm } from './CrmContext';
import { useEmployee } from './EmployeeContext';

const RecruitmentContext = createContext(null);

export async function sha256Hex(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function RecruitmentProvider({ children }) {
  const crmContext = useCrm() || {};
  const {
    tenantId,
    activeOperatingCompanyId,
    userRole,
    tenantRole,
    currentUser,
    session
  } = crmContext;

  const employeeContext = useEmployee() || {};
  const { saveEmployee } = employeeContext;

  const authUserId = session?.user?.id || currentUser?.id;

  // Management permission check (OWNER / ADMIN / MANAGER)
  const isManagementOrAdmin = useMemo(() => {
    const r = (userRole || '').toLowerCase();
    const tr = (tenantRole || '').toLowerCase();
    const allowedRoles = ['owner', 'admin', 'manager'];
    return allowedRoles.includes(r) || allowedRoles.includes(tr);
  }, [userRole, tenantRole]);

  // State collections
  const [jobPositions, setJobPositions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [onboardingRecords, setOnboardingRecords] = useState([]);
  const [applicationLinks, setApplicationLinks] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Selected item states
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [selectedPositionId, setSelectedPositionId] = useState(null);

  // Data Fetchers (Scoped by activeOperatingCompanyId)
  const fetchJobPositions = useCallback(async (opCoId) => {
    setIsLoading(true);
    try {
      let query = supabase.from('job_positions').select('*').order('created_at', { ascending: false });
      if (opCoId) query = query.eq('tenant_company_id', opCoId);
      const { data, error } = await query;
      if (error) throw error;
      setJobPositions(data || []);
    } catch (err) {
      console.error('Error fetching job positions:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCandidates = useCallback(async (opCoId) => {
    try {
      let query = supabase.from('recruitment_candidates').select('*').order('created_at', { ascending: false });
      if (opCoId) query = query.eq('tenant_company_id', opCoId);
      const { data, error } = await query;
      if (error) throw error;
      setCandidates(data || []);
    } catch (err) {
      console.error('Error fetching candidates:', err);
    }
  }, []);

  const fetchInterviews = useCallback(async (opCoId) => {
    try {
      let query = supabase.from('candidate_interviews').select('*').order('created_at', { ascending: false });
      if (opCoId) query = query.eq('tenant_company_id', opCoId);
      const { data, error } = await query;
      if (error) throw error;
      setInterviews(data || []);
    } catch (err) {
      console.error('Error fetching candidate interviews:', err);
    }
  }, []);

  const fetchOnboardingRecords = useCallback(async (opCoId) => {
    try {
      let query = supabase.from('candidate_onboarding').select('*').order('created_at', { ascending: false });
      if (opCoId) query = query.eq('tenant_company_id', opCoId);
      const { data, error } = await query;
      if (error) throw error;
      setOnboardingRecords(data || []);
    } catch (err) {
      console.error('Error fetching onboarding records:', err);
    }
  }, []);

  const fetchApplicationLinks = useCallback(async (opCoId) => {
    try {
      let query = supabase.from('recruitment_application_links').select('*').order('created_at', { ascending: false });
      if (opCoId) query = query.eq('tenant_company_id', opCoId);
      const { data, error } = await query;
      if (error) throw error;
      setApplicationLinks(data || []);
    } catch (err) {
      console.error('Error fetching application links:', err);
    }
  }, []);

  // Reset and Refetch when activeOperatingCompanyId or authUserId changes
  useEffect(() => {
    if (authUserId) {
      setSelectedCandidateId(null);
      setSelectedPositionId(null);

      fetchJobPositions(activeOperatingCompanyId);
      fetchCandidates(activeOperatingCompanyId);
      fetchInterviews(activeOperatingCompanyId);
      fetchOnboardingRecords(activeOperatingCompanyId);
      fetchApplicationLinks(activeOperatingCompanyId);
    }
  }, [
    authUserId,
    activeOperatingCompanyId,
    fetchJobPositions,
    fetchCandidates,
    fetchInterviews,
    fetchOnboardingRecords,
    fetchApplicationLinks
  ]);

  // CRUD & Workflow Operations (All guarded at data-operation level)

  // 1. Job Position Mutations
  const saveJobPosition = async (posData) => {
    if (!isManagementOrAdmin) return { success: false, error: 'Permission Denied: Only management or admin roles can manage job positions.' };
    try {
      const payload = {
        ...posData,
        tenant_id: tenantId || null,
        tenant_company_id: activeOperatingCompanyId || posData.tenant_company_id || null,
        created_by: authUserId || null,
        updated_at: new Date().toISOString()
      };
      let resData = null;
      if (posData.id) {
        const { data, error } = await supabase.from('job_positions').update(payload).eq('id', posData.id).select('*').single();
        if (error) throw error;
        resData = data;
      } else {
        const { data, error } = await supabase.from('job_positions').insert([payload]).select('*').single();
        if (error) throw error;
        resData = data;
      }
      await fetchJobPositions(activeOperatingCompanyId);
      return { success: true, position: resData };
    } catch (err) {
      console.error('Error saving job position:', err);
      return { success: false, error: err.message };
    }
  };

  // 2. Generate Public Application Link
  const createApplicationLink = async (jobPositionId, expiresInDays = 30) => {
    if (!isManagementOrAdmin) return { success: false, error: 'Permission Denied: Only management or admin roles can generate application links.' };
    try {
      const rawToken = Array.from(crypto.getRandomValues(new Uint8Array(24)))
        .map(b => b.toString(16).padStart(2, '0')).join('');
      const tokenHash = await sha256Hex(rawToken);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (expiresInDays || 30));

      const payload = {
        tenant_id: tenantId || null,
        tenant_company_id: activeOperatingCompanyId || null,
        job_position_id: jobPositionId,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
        status: 'active',
        created_by: authUserId || null
      };

      const { data, error } = await supabase.from('recruitment_application_links').insert([payload]).select('*').single();
      if (error) throw error;

      await fetchApplicationLinks(activeOperatingCompanyId);
      return { success: true, link: data, rawToken };
    } catch (err) {
      console.error('Error creating application link:', err);
      return { success: false, error: err.message };
    }
  };

  // 3. Candidate Mutations
  const saveCandidate = async (candData) => {
    if (!isManagementOrAdmin) return { success: false, error: 'Permission Denied: Only management or admin roles can manage candidates.' };
    try {
      const payload = {
        ...candData,
        tenant_id: tenantId || null,
        tenant_company_id: activeOperatingCompanyId || candData.tenant_company_id || null,
        updated_at: new Date().toISOString()
      };
      let resData = null;
      if (candData.id) {
        const { data, error } = await supabase.from('recruitment_candidates').update(payload).eq('id', candData.id).select('*').single();
        if (error) throw error;
        resData = data;
      } else {
        const { data, error } = await supabase.from('recruitment_candidates').insert([payload]).select('*').single();
        if (error) throw error;
        resData = data;
      }
      await fetchCandidates(activeOperatingCompanyId);
      return { success: true, candidate: resData };
    } catch (err) {
      console.error('Error saving candidate:', err);
      return { success: false, error: err.message };
    }
  };

  const updateCandidateStatus = async (candidateId, status, notes = null) => {
    if (!isManagementOrAdmin) return { success: false, error: 'Permission Denied: Only management or admin roles can update candidate status.' };
    try {
      const payload = {
        status,
        updated_at: new Date().toISOString()
      };
      if (notes !== null) payload.notes = notes;

      const { data, error } = await supabase.from('recruitment_candidates').update(payload).eq('id', candidateId).select('*').single();
      if (error) throw error;

      await fetchCandidates(activeOperatingCompanyId);
      return { success: true, candidate: data };
    } catch (err) {
      console.error('Error updating candidate status:', err);
      return { success: false, error: err.message };
    }
  };

  // 4. Candidate Interview Mutations
  const saveCandidateInterview = async (interviewData) => {
    if (!isManagementOrAdmin) return { success: false, error: 'Permission Denied: Only management or admin roles can manage interviews.' };
    try {
      const payload = {
        ...interviewData,
        tenant_id: tenantId || null,
        tenant_company_id: activeOperatingCompanyId || interviewData.tenant_company_id || null,
        created_by: authUserId || null,
        updated_at: new Date().toISOString()
      };
      let resData = null;
      if (interviewData.id) {
        const { data, error } = await supabase.from('candidate_interviews').update(payload).eq('id', interviewData.id).select('*').single();
        if (error) throw error;
        resData = data;
      } else {
        const { data, error } = await supabase.from('candidate_interviews').insert([payload]).select('*').single();
        if (error) throw error;
        resData = data;
      }
      await fetchInterviews(activeOperatingCompanyId);
      return { success: true, interview: resData };
    } catch (err) {
      console.error('Error saving candidate interview:', err);
      return { success: false, error: err.message };
    }
  };

  // 5. Selection -> Onboarding Link / Manual Record
  const createCandidateOnboarding = async (candidateId, method = 'manual') => {
    if (!isManagementOrAdmin) return { success: false, error: 'Permission Denied: Only management or admin roles can create candidate onboarding.' };
    try {
      let rawToken = null;
      let tokenHash = null;

      if (method === 'link') {
        rawToken = Array.from(crypto.getRandomValues(new Uint8Array(24)))
          .map(b => b.toString(16).padStart(2, '0')).join('');
        tokenHash = await sha256Hex(rawToken);
      }

      const payload = {
        tenant_id: tenantId || null,
        tenant_company_id: activeOperatingCompanyId || null,
        candidate_id: candidateId,
        token_hash: tokenHash,
        status: 'onboarding_pending',
        created_by: authUserId || null,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase.from('candidate_onboarding').insert([payload]).select('*').single();
      if (error) throw error;

      // Update candidate status to Selected
      await supabase.from('recruitment_candidates').update({ status: 'Selected', updated_at: new Date().toISOString() }).eq('id', candidateId);

      await fetchOnboardingRecords(activeOperatingCompanyId);
      await fetchCandidates(activeOperatingCompanyId);
      return { success: true, onboarding: data, rawToken };
    } catch (err) {
      console.error('Error creating candidate onboarding:', err);
      return { success: false, error: err.message };
    }
  };

  const updateOnboardingStatus = async (onboardingId, status) => {
    if (!isManagementOrAdmin) return { success: false, error: 'Permission Denied: Only management or admin roles can update onboarding status.' };
    try {
      const payload = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'Submitted') payload.submitted_at = new Date().toISOString();
      if (status === 'HR Verification') payload.verified_at = new Date().toISOString();
      if (status === 'Approved') payload.approved_at = new Date().toISOString();

      const { data, error } = await supabase.from('candidate_onboarding').update(payload).eq('id', onboardingId).select('*').single();
      if (error) throw error;

      await fetchOnboardingRecords(activeOperatingCompanyId);
      return { success: true, onboarding: data };
    } catch (err) {
      console.error('Error updating onboarding status:', err);
      return { success: false, error: err.message };
    }
  };

  // 6. Convert Candidate to Active Employee (Without duplicate creation)
  const convertCandidateToEmployee = async (candidateId, onboardingId, employeeData) => {
    if (!isManagementOrAdmin) return { success: false, error: 'Permission Denied: Only management or admin roles can approve onboarding & convert to employee.' };
    try {
      let createdEmployeeId = employeeData?.id || null;

      // Create new employee if employeeId is not provided
      if (!createdEmployeeId) {
        if (!saveEmployee) {
          throw new Error('EmployeeContext saveEmployee method is unavailable.');
        }
        const empPayload = {
          first_name: employeeData.first_name,
          last_name: employeeData.last_name || '',
          email: employeeData.email,
          mobile: employeeData.mobile,
          department_id: employeeData.department_id || null,
          designation_id: employeeData.designation_id || null,
          joining_date: employeeData.joining_date || new Date().toISOString().split('T')[0],
          status: 'ACTIVE',
          tenant_company_id: activeOperatingCompanyId || null
        };
        const empRes = await saveEmployee(empPayload);
        if (!empRes.success) {
          throw new Error(empRes.error || 'Failed to create employee record');
        }
        createdEmployeeId = empRes.employee?.id;
      }

      if (!createdEmployeeId) {
        throw new Error('No employee ID resolved for conversion');
      }

      // Link candidate and candidate_onboarding records to employee_id
      await supabase.from('recruitment_candidates').update({
        employee_id: createdEmployeeId,
        status: 'Employee Active',
        updated_at: new Date().toISOString()
      }).eq('id', candidateId);

      if (onboardingId) {
        await supabase.from('candidate_onboarding').update({
          employee_id: createdEmployeeId,
          status: 'Approved',
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }).eq('id', onboardingId);
      }

      await fetchCandidates(activeOperatingCompanyId);
      await fetchOnboardingRecords(activeOperatingCompanyId);

      return { success: true, employeeId: createdEmployeeId };
    } catch (err) {
      console.error('Error converting candidate to employee:', err);
      return { success: false, error: err.message };
    }
  };

  // 7. Public Application RPC Submission helper
  const submitPublicApplication = async (payload) => {
    try {
      const { data, error } = await supabase.rpc('submit_recruitment_application', payload);
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('Error submitting public application via RPC:', err);
      return { success: false, error: err.message };
    }
  };

  const value = {
    jobPositions,
    candidates,
    interviews,
    onboardingRecords,
    applicationLinks,
    isLoading,
    error,
    isManagementOrAdmin,
    selectedCandidateId,
    setSelectedCandidateId,
    selectedPositionId,
    setSelectedPositionId,
    saveJobPosition,
    createApplicationLink,
    saveCandidate,
    updateCandidateStatus,
    saveCandidateInterview,
    createCandidateOnboarding,
    updateOnboardingStatus,
    convertCandidateToEmployee,
    submitPublicApplication,
    sha256Hex
  };

  return <RecruitmentContext.Provider value={value}>{children}</RecruitmentContext.Provider>;
}

export function useRecruitment() {
  const context = useContext(RecruitmentContext);
  if (!context) {
    throw new Error('useRecruitment must be used within a RecruitmentProvider');
  }
  return context;
}
