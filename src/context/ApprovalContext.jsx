import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useCrm } from './CrmContext';
import { useEmployee } from './EmployeeContext';

const ApprovalContext = createContext(null);

export function ApprovalProvider({ children }) {
  const crmContext = useCrm() || {};
  const {
    tenantId,
    activeOperatingCompanyId,
    userRole,
    tenantRole,
    currentUser,
    session,
    createNotification
  } = crmContext;

  const employeeContext = useEmployee() || {};
  const { employees = [], saveEmployee } = employeeContext;

  const authUserId = session?.user?.id || currentUser?.id;

  // Management / Role permission helpers (OWNER / ADMIN / MANAGER / TEAM / VIEWER)
  const isManagementOrAdmin = useMemo(() => {
    const r = (userRole || '').toLowerCase();
    const tr = (tenantRole || '').toLowerCase();
    const allowed = ['owner', 'admin', 'manager'];
    return allowed.includes(r) || allowed.includes(tr);
  }, [userRole, tenantRole]);

  // State collections
  const [requests, setRequests] = useState([]);
  const [requestSteps, setRequestSteps] = useState([]);
  const [requestActions, setRequestActions] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [workflowSteps, setWorkflowSteps] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Selected request state
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  // 1. Fetch Workflows
  const fetchWorkflows = useCallback(async (opCoId) => {
    try {
      let query = supabase.from('approval_workflows').select('*').eq('status', 'ACTIVE');
      if (opCoId) query = query.eq('tenant_company_id', opCoId);
      const { data, error } = await query;
      if (error) throw error;
      setWorkflows(data || []);

      if (data && data.length > 0) {
        const wfIds = data.map(w => w.id);
        const { data: steps } = await supabase.from('approval_workflow_steps').select('*').in('approval_workflow_id', wfIds).order('step_order');
        setWorkflowSteps(steps || []);
      } else {
        setWorkflowSteps([]);
      }
    } catch (err) {
      console.error('Error fetching workflows:', err);
    }
  }, []);

  // 2. Fetch Requests, Steps, Actions
  const fetchRequests = useCallback(async (opCoId) => {
    setIsLoading(true);
    try {
      let query = supabase.from('approval_requests').select('*').order('created_at', { ascending: false });
      if (opCoId) query = query.eq('tenant_company_id', opCoId);
      const { data, error } = await query;
      if (error) throw error;
      setRequests(data || []);

      if (data && data.length > 0) {
        const reqIds = data.map(r => r.id);
        const [stepsRes, actionsRes] = await Promise.all([
          supabase.from('approval_request_steps').select('*').in('request_id', reqIds).order('step_order'),
          supabase.from('approval_request_actions').select('*').in('request_id', reqIds).order('created_at', { ascending: true })
        ]);
        setRequestSteps(stepsRes.data || []);
        setRequestActions(actionsRes.data || []);
      } else {
        setRequestSteps([]);
        setRequestActions([]);
      }
    } catch (err) {
      console.error('Error fetching approval requests:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reset & refetch when company or user changes
  useEffect(() => {
    if (authUserId) {
      setSelectedRequestId(null);
      fetchWorkflows(activeOperatingCompanyId);
      fetchRequests(activeOperatingCompanyId);
    }
  }, [authUserId, activeOperatingCompanyId, fetchWorkflows, fetchRequests]);

  // Helper: Record an immutable action in approval_request_actions
  const recordAction = async ({ requestId, action, fromStatus, toStatus, comments = null, metadata = null }) => {
    try {
      const payload = {
        tenant_id: tenantId || null,
        tenant_company_id: activeOperatingCompanyId || null,
        request_id: requestId,
        action,
        from_status: fromStatus,
        to_status: toStatus,
        actor_id: authUserId,
        comments,
        metadata: metadata ? JSON.stringify(metadata) : null,
        created_at: new Date().toISOString()
      };
      await supabase.from('approval_request_actions').insert([payload]);
    } catch (err) {
      console.error('Error recording approval action:', err);
    }
  };

  // 3. Create & Submit Request (Supports Employee Change and future request types)
  const createAndSubmitRequest = async ({
    request_type,
    subject_employee_id,
    entity_type = 'employee',
    entity_id = null,
    title,
    description = '',
    payload,
    current_snapshot,
    priority = 'normal'
  }) => {
    if (!authUserId) return { success: false, error: 'Authentication required to submit request.' };

    try {
      // Generate safe request number: e.g. EMP-CHG-100293
      const prefix = request_type === 'employee_change' ? 'EMP-CHG' : 'REQ';
      const randomPart = Math.floor(100000 + Math.random() * 900000);
      const requestNumber = `${prefix}-${randomPart}`;

      // Resolve matching workflow
      const matchedWf = workflows.find(w => w.request_type === request_type && (w.tenant_company_id === activeOperatingCompanyId || !w.tenant_company_id));
      const matchedSteps = matchedWf ? workflowSteps.filter(s => s.approval_workflow_id === matchedWf.id).sort((a, b) => a.step_order - b.step_order) : [];

      const requestPayload = {
        tenant_id: tenantId || null,
        tenant_company_id: activeOperatingCompanyId || null,
        request_type,
        request_number: requestNumber,
        requested_by: authUserId,
        subject_employee_id: subject_employee_id || null,
        entity_type,
        entity_id: entity_id || subject_employee_id || null,
        title: title || `Request ${requestNumber}`,
        description,
        payload: typeof payload === 'string' ? payload : JSON.stringify(payload),
        current_snapshot: typeof current_snapshot === 'string' ? current_snapshot : JSON.stringify(current_snapshot),
        status: 'pending_approval',
        priority,
        workflow_id: matchedWf?.id || null,
        current_step_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newReq, error: reqErr } = await supabase.from('approval_requests').insert([requestPayload]).select('*').single();
      if (reqErr) throw reqErr;

      // Snapshot workflow steps into approval_request_steps
      if (matchedSteps.length > 0) {
        const stepsToInsert = matchedSteps.map((s, idx) => ({
          tenant_id: tenantId || null,
          tenant_company_id: activeOperatingCompanyId || null,
          request_id: newReq.id,
          step_order: idx + 1,
          approver_type: s.approver_type || 'Role',
          approver_role: s.approver_role || 'Manager',
          workflow_step_id: s.id,
          status: idx === 0 ? 'pending' : 'queued',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        await supabase.from('approval_request_steps').insert(stepsToInsert);
      } else {
        // Fallback 1-step Manager approval
        const fallbackStep = {
          tenant_id: tenantId || null,
          tenant_company_id: activeOperatingCompanyId || null,
          request_id: newReq.id,
          step_order: 1,
          approver_type: 'Role',
          approver_role: 'Manager',
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        await supabase.from('approval_request_steps').insert([fallbackStep]);
      }

      // Record actions
      await recordAction({ requestId: newReq.id, action: 'submitted', fromStatus: 'draft', toStatus: 'pending_approval' });

      // Notify approvers/managers
      if (createNotification) {
        createNotification({
          title: `New Request Submitted: ${requestNumber}`,
          message: `${title} submitted and awaiting review.`,
          entity_type: 'approval_request',
          entity_id: newReq.id,
          tenant_company_id: activeOperatingCompanyId
        });
      }

      await fetchRequests(activeOperatingCompanyId);
      return { success: true, request: newReq };
    } catch (err) {
      console.error('Error submitting request:', err);
      return { success: false, error: err.message };
    }
  };

  // 4. Process Approval Action (Approve / Return / Reject) with Maker-Checker & Conflict Protection
  const processApprovalAction = async ({ requestId, action, comments = '' }) => {
    if (!authUserId) return { success: false, error: 'Authentication required.' };

    try {
      const targetReq = requests.find(r => r.id === requestId);
      if (!targetReq) return { success: false, error: 'Approval request not found.' };

      // Verification: Company Scope
      if (activeOperatingCompanyId && targetReq.tenant_company_id && targetReq.tenant_company_id !== activeOperatingCompanyId) {
        return { success: false, error: 'Unauthorized: Request belongs to another operating company.' };
      }

      // Verification: Current Status
      if (!['pending_approval', 'submitted'].includes(targetReq.status)) {
        return { success: false, error: `Cannot process request in '${targetReq.status}' status.` };
      }

      // Maker-Checker Rule Enforcement
      if (targetReq.requested_by === authUserId) {
        return { success: false, error: 'Maker-Checker Violation: Requester cannot approve their own request.' };
      }

      const subjectEmp = employees.find(e => e.id === targetReq.subject_employee_id);
      if (subjectEmp && subjectEmp.user_id && subjectEmp.user_id === authUserId) {
        return { success: false, error: 'Maker-Checker Violation: You cannot approve a request concerning yourself.' };
      }

      const steps = requestSteps.filter(s => s.request_id === requestId).sort((a, b) => a.step_order - b.step_order);
      const currentStep = steps.find(s => s.step_order === targetReq.current_step_order) || steps[0];

      if (action === 'reject') {
        if (!comments || !comments.trim()) {
          return { success: false, error: 'Rejection comments are required.' };
        }
        await supabase.from('approval_requests').update({ status: 'rejected', updated_at: new Date().toISOString() }).eq('id', requestId);
        if (currentStep) {
          await supabase.from('approval_request_steps').update({ status: 'rejected', comments, updated_at: new Date().toISOString() }).eq('id', currentStep.id);
        }
        await recordAction({ requestId, action: 'rejected', fromStatus: targetReq.status, toStatus: 'rejected', comments });

        if (createNotification) {
          createNotification({
            title: `Request Rejected: ${targetReq.request_number}`,
            message: `Your request '${targetReq.title}' was rejected. Reason: ${comments}`,
            entity_type: 'approval_request',
            entity_id: requestId,
            tenant_company_id: activeOperatingCompanyId
          });
        }

        await fetchRequests(activeOperatingCompanyId);
        return { success: true };
      }

      if (action === 'return') {
        if (!comments || !comments.trim()) {
          return { success: false, error: 'Return comments are required for corrections.' };
        }
        await supabase.from('approval_requests').update({ status: 'returned', updated_at: new Date().toISOString() }).eq('id', requestId);
        if (currentStep) {
          await supabase.from('approval_request_steps').update({ status: 'returned', comments, updated_at: new Date().toISOString() }).eq('id', currentStep.id);
        }
        await recordAction({ requestId, action: 'returned', fromStatus: targetReq.status, toStatus: 'returned', comments });

        if (createNotification) {
          createNotification({
            title: `Request Returned for Correction: ${targetReq.request_number}`,
            message: `Your request '${targetReq.title}' was returned. Reason: ${comments}`,
            entity_type: 'approval_request',
            entity_id: requestId,
            tenant_company_id: activeOperatingCompanyId
          });
        }

        await fetchRequests(activeOperatingCompanyId);
        return { success: true };
      }

      if (action === 'approve') {
        // Mark current step approved
        if (currentStep) {
          await supabase.from('approval_request_steps').update({ status: 'approved', comments, updated_at: new Date().toISOString() }).eq('id', currentStep.id);
        }

        const isLastStep = !steps.some(s => s.step_order > targetReq.current_step_order);

        if (!isLastStep) {
          // Advance to next step
          const nextStepOrder = targetReq.current_step_order + 1;
          await supabase.from('approval_requests').update({ current_step_order: nextStepOrder, updated_at: new Date().toISOString() }).eq('id', requestId);
          const nextStep = steps.find(s => s.step_order === nextStepOrder);
          if (nextStep) {
            await supabase.from('approval_request_steps').update({ status: 'pending', updated_at: new Date().toISOString() }).eq('id', nextStep.id);
          }
          await recordAction({ requestId, action: 'approved_step', fromStatus: targetReq.status, toStatus: 'pending_approval', comments });

          await fetchRequests(activeOperatingCompanyId);
          return { success: true, advanced: true };
        }

        // Final Approval reached! Apply change or detect snapshot conflict
        await supabase.from('approval_requests').update({ status: 'approved', updated_at: new Date().toISOString() }).eq('id', requestId);
        await recordAction({ requestId, action: 'approved', fromStatus: targetReq.status, toStatus: 'approved', comments });

        // Execute application logic for Employee Change Request
        if (targetReq.request_type === 'employee_change') {
          const applyRes = await applyEmployeeChange(targetReq);
          if (!applyRes.success) {
            await fetchRequests(activeOperatingCompanyId);
            return { success: false, conflict: true, error: applyRes.error };
          }
        }

        await fetchRequests(activeOperatingCompanyId);
        return { success: true, finalApproved: true };
      }

      return { success: false, error: `Invalid action '${action}'.` };
    } catch (err) {
      console.error('Error processing approval action:', err);
      return { success: false, error: err.message };
    }
  };

  // 5. Apply Employee Change Payload with Snapshot Conflict Detection
  const applyEmployeeChange = async (targetReq) => {
    try {
      const subjectEmp = employees.find(e => e.id === targetReq.subject_employee_id);
      if (!subjectEmp) {
        throw new Error('Target employee record not found in Employee Master.');
      }

      const snapshot = typeof targetReq.current_snapshot === 'string' ? JSON.parse(targetReq.current_snapshot) : targetReq.current_snapshot;
      const payload = typeof targetReq.payload === 'string' ? JSON.parse(targetReq.payload) : targetReq.payload;

      // Snapshot Conflict Check: Ensure current Employee Master values match snapshot
      let conflictDetected = false;
      const conflictKeys = [];

      if (snapshot && typeof snapshot === 'object') {
        for (const [key, expectedVal] of Object.entries(snapshot)) {
          if (subjectEmp[key] !== undefined && String(subjectEmp[key] || '') !== String(expectedVal || '')) {
            conflictDetected = true;
            conflictKeys.push(`${key} (Expected: "${expectedVal}", Live: "${subjectEmp[key]}")`);
          }
        }
      }

      if (conflictDetected) {
        // STOP automatic application! Set status = 'failed'
        const conflictMsg = `Snapshot Conflict: Live Employee Master data changed since request submission. Conflicts: ${conflictKeys.join(', ')}`;
        await supabase.from('approval_requests').update({ status: 'failed', updated_at: new Date().toISOString() }).eq('id', targetReq.id);
        await recordAction({ requestId: targetReq.id, action: 'failed', fromStatus: 'approved', toStatus: 'failed', comments: conflictMsg });

        if (createNotification) {
          createNotification({
            title: `Application Failed: ${targetReq.request_number}`,
            message: conflictMsg,
            entity_type: 'approval_request',
            entity_id: targetReq.id,
            tenant_company_id: activeOperatingCompanyId
          });
        }
        return { success: false, error: conflictMsg };
      }

      // Snapshot matches! Apply payload to Employee Master
      const updatedEmpPayload = {
        ...subjectEmp,
        ...payload,
        id: subjectEmp.id,
        tenant_company_id: activeOperatingCompanyId || subjectEmp.tenant_company_id
      };

      if (!saveEmployee) {
        throw new Error('EmployeeContext saveEmployee method is unavailable.');
      }

      const saveRes = await saveEmployee(updatedEmpPayload);
      if (!saveRes.success) {
        throw new Error(saveRes.error || 'Failed to update Employee Master.');
      }

      // Mark request as applied
      await supabase.from('approval_requests').update({ status: 'applied', updated_at: new Date().toISOString() }).eq('id', targetReq.id);
      await recordAction({ requestId: targetReq.id, action: 'applied', fromStatus: 'approved', toStatus: 'applied', comments: 'Successfully applied to Employee Master.' });

      if (createNotification) {
        createNotification({
          title: `Request Applied: ${targetReq.request_number}`,
          message: `Change request for ${subjectEmp.first_name} ${subjectEmp.last_name} applied to Employee Master.`,
          entity_type: 'approval_request',
          entity_id: targetReq.id,
          tenant_company_id: activeOperatingCompanyId
        });
      }

      return { success: true };
    } catch (err) {
      console.error('Error applying employee change:', err);
      return { success: false, error: err.message };
    }
  };

  // 6. Resubmit Returned Request
  const resubmitRequest = async (requestId, updatedPayload) => {
    if (!authUserId) return { success: false, error: 'Authentication required.' };
    try {
      const targetReq = requests.find(r => r.id === requestId);
      if (!targetReq) return { success: false, error: 'Request not found.' };
      if (targetReq.requested_by !== authUserId) return { success: false, error: 'Only original requester can resubmit request.' };
      if (targetReq.status !== 'returned') return { success: false, error: 'Only returned requests can be resubmitted.' };

      const payloadStr = typeof updatedPayload === 'string' ? updatedPayload : JSON.stringify(updatedPayload);
      await supabase.from('approval_requests').update({
        payload: payloadStr,
        status: 'pending_approval',
        current_step_order: 1,
        updated_at: new Date().toISOString()
      }).eq('id', requestId);

      // Reset steps
      const steps = requestSteps.filter(s => s.request_id === requestId);
      for (const s of steps) {
        const nextStatus = s.step_order === 1 ? 'pending' : 'queued';
        await supabase.from('approval_request_steps').update({ status: nextStatus, comments: null, updated_at: new Date().toISOString() }).eq('id', s.id);
      }

      await recordAction({ requestId, action: 'resubmitted', fromStatus: 'returned', toStatus: 'pending_approval', comments: 'Resubmitted with updated values.' });
      await fetchRequests(activeOperatingCompanyId);
      return { success: true };
    } catch (err) {
      console.error('Error resubmitting request:', err);
      return { success: false, error: err.message };
    }
  };

  // 7. Withdraw Eligible Pending Request
  const withdrawRequest = async (requestId) => {
    if (!authUserId) return { success: false, error: 'Authentication required.' };
    try {
      const targetReq = requests.find(r => r.id === requestId);
      if (!targetReq) return { success: false, error: 'Request not found.' };
      if (targetReq.requested_by !== authUserId && !isManagementOrAdmin) {
        return { success: false, error: 'Unauthorized to withdraw this request.' };
      }
      if (!['pending_approval', 'returned', 'submitted'].includes(targetReq.status)) {
        return { success: false, error: `Cannot withdraw request in '${targetReq.status}' status.` };
      }

      await supabase.from('approval_requests').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', requestId);
      await recordAction({ requestId, action: 'withdrawn', fromStatus: targetReq.status, toStatus: 'cancelled', comments: 'Withdrawn by requester.' });

      await fetchRequests(activeOperatingCompanyId);
      return { success: true };
    } catch (err) {
      console.error('Error withdrawing request:', err);
      return { success: false, error: err.message };
    }
  };

  const value = {
    requests,
    requestSteps,
    requestActions,
    workflows,
    workflowSteps,
    isLoading,
    error,
    isManagementOrAdmin,
    selectedRequestId,
    setSelectedRequestId,
    createAndSubmitRequest,
    processApprovalAction,
    resubmitRequest,
    withdrawRequest,
    fetchRequests
  };

  return <ApprovalContext.Provider value={value}>{children}</ApprovalContext.Provider>;
}

export function useApproval() {
  const context = useContext(ApprovalContext);
  if (!context) {
    throw new Error('useApproval must be used within an ApprovalProvider');
  }
  return context;
}
