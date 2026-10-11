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
  const { fetchEmployees } = employeeContext;

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

  // 3. Create & Submit Request via Backend Atomic RPC: submit_approval_request_atomic(jsonb)
  const createAndSubmitRequest = async ({
    request_type,
    subject_employee_id,
    entity_type = 'employee',
    entity_id = null,
    title,
    description = '',
    payload,
    current_snapshot,
    priority = 'normal',
    workflow_id = null,
    request_number = null
  }) => {
    if (!authUserId) return { success: false, error: 'Authentication required to submit request.' };
    if (!request_type) return { success: false, error: 'request_type is required.' };

    try {
      setIsLoading(true);

      // Parse payload to JSON object
      let parsedPayload = {};
      if (payload) {
        if (typeof payload === 'string') {
          try {
            parsedPayload = JSON.parse(payload);
          } catch {
            parsedPayload = {};
          }
        } else if (typeof payload === 'object') {
          parsedPayload = payload;
        }
      }

      // Parse current snapshot to JSON object/null
      let parsedSnapshot = null;
      if (current_snapshot) {
        if (typeof current_snapshot === 'string') {
          try {
            parsedSnapshot = JSON.parse(current_snapshot);
          } catch {
            parsedSnapshot = null;
          }
        } else if (typeof current_snapshot === 'object') {
          parsedSnapshot = current_snapshot;
        }
      }

      // Request number generation matching existing UI convention if not supplied
      let generatedReqNum = request_number;
      if (!generatedReqNum) {
        const prefix = request_type === 'employee_change' ? 'EMP-CHG' : 'REQ';
        const randomPart = Math.floor(100000 + Math.random() * 900000);
        generatedReqNum = `${prefix}-${randomPart}`;
      }

      // Resolve matching workflow if not explicitly provided
      let resolvedWorkflowId = workflow_id || null;
      if (!resolvedWorkflowId && workflows.length > 0) {
        const matchedWf = workflows.find(
          w => w.request_type === request_type &&
               (w.tenant_company_id === activeOperatingCompanyId || !w.tenant_company_id)
        );
        if (matchedWf) {
          resolvedWorkflowId = matchedWf.id;
        }
      }

      const submissionPayload = {
        tenant_id: tenantId || null,
        tenant_company_id: activeOperatingCompanyId || null,
        request_type,
        title: title || `Request ${generatedReqNum}`,
        description: description || null,
        payload: parsedPayload,
        current_snapshot: parsedSnapshot,
        subject_employee_id: subject_employee_id || null,
        entity_type: entity_type || (request_type === 'employee_change' ? 'employee' : null),
        entity_id: entity_id || subject_employee_id || null,
        priority: priority || 'normal',
        workflow_id: resolvedWorkflowId,
        request_number: generatedReqNum
      };

      const { data, error: rpcErr } = await supabase.rpc('submit_approval_request_atomic', {
        p_payload: submissionPayload
      });

      if (rpcErr) {
        console.error('Error invoking submit_approval_request_atomic RPC:', rpcErr);
        return { success: false, error: rpcErr.message };
      }

      if (!data || !data.success) {
        const errorMsg = data?.error || 'Failed to submit approval request.';
        return { success: false, error: errorMsg };
      }

      // Notify approvers/managers
      if (createNotification) {
        createNotification({
          title: `New Request Submitted: ${data.request_number || generatedReqNum}`,
          message: `${submissionPayload.title} submitted and awaiting review.`,
          entity_type: 'approval_request',
          entity_id: data.request_id,
          tenant_company_id: activeOperatingCompanyId
        });
      }

      await fetchRequests(activeOperatingCompanyId);

      const createdRequest = {
        id: data.request_id,
        request_number: data.request_number || generatedReqNum,
        status: data.status || 'pending_approval',
        request_type,
        title: submissionPayload.title,
        description: submissionPayload.description,
        payload: parsedPayload,
        current_snapshot: parsedSnapshot,
        subject_employee_id: submissionPayload.subject_employee_id,
        entity_type: submissionPayload.entity_type,
        entity_id: submissionPayload.entity_id,
        priority: submissionPayload.priority,
        workflow_id: submissionPayload.workflow_id,
        tenant_id: submissionPayload.tenant_id,
        tenant_company_id: submissionPayload.tenant_company_id
      };

      return {
        success: true,
        request_id: data.request_id,
        request_number: data.request_number || generatedReqNum,
        status: data.status,
        request: createdRequest,
        data
      };
    } catch (err) {
      console.error('Error submitting request:', err);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Process Approval Action (Approve / Return / Reject / Withdraw) via Backend Atomic RPC
  const processApprovalAction = async ({ requestId, action, comments = '' }) => {
    if (!authUserId) return { success: false, error: 'Authentication required.' };
    if (!requestId) return { success: false, error: 'Approval request ID is required.' };

    const normalizedAction = (action || '').toLowerCase().trim();
    const trimmedComments = (comments || '').trim();

    if (!['approve', 'reject', 'return', 'withdraw'].includes(normalizedAction)) {
      return { success: false, error: `Invalid action '${action}'. Must be approve, reject, return, or withdraw.` };
    }

    if (['reject', 'return'].includes(normalizedAction) && !trimmedComments) {
      return {
        success: false,
        error: normalizedAction === 'reject'
          ? 'Rejection comments are required.'
          : 'Return comments are required for corrections.'
      };
    }

    try {
      setIsLoading(true);

      const { data, error: rpcErr } = await supabase.rpc('process_approval_request_action_atomic', {
        p_request_id: requestId,
        p_action: normalizedAction,
        p_comments: trimmedComments || null
      });

      if (rpcErr) {
        console.error('Error in process_approval_request_action_atomic RPC:', rpcErr);
        const errMsg = rpcErr.message || 'Error processing approval action.';
        const isConflict = errMsg.includes('Snapshot conflict') ||
                           errMsg.includes('Employee Master changed') ||
                           errMsg.includes('SNAPSHOT_CONFLICT');
        return {
          success: false,
          error: errMsg,
          conflict: isConflict
        };
      }

      if (!data || !data.success) {
        const errorMsg = data?.error || `Failed to process ${normalizedAction} action.`;
        return { success: false, error: errorMsg };
      }

      const targetReq = requests.find(r => r.id === requestId);

      // If employee change reached final approval/applied, refresh Employee Master
      if (
        (data.final_approved || data.status === 'applied' || data.status === 'approved') &&
        targetReq?.request_type === 'employee_change' &&
        fetchEmployees
      ) {
        try {
          await fetchEmployees(activeOperatingCompanyId);
        } catch (empErr) {
          console.error('Error refreshing employees after approval:', empErr);
        }
      }

      // Refresh requests list
      await fetchRequests(activeOperatingCompanyId);

      // Send UI Notifications
      if (createNotification && targetReq) {
        if (normalizedAction === 'reject') {
          createNotification({
            title: `Request Rejected: ${targetReq.request_number}`,
            message: `Your request '${targetReq.title}' was rejected. Reason: ${trimmedComments}`,
            entity_type: 'approval_request',
            entity_id: requestId,
            tenant_company_id: activeOperatingCompanyId
          });
        } else if (normalizedAction === 'return') {
          createNotification({
            title: `Request Returned for Correction: ${targetReq.request_number}`,
            message: `Your request '${targetReq.title}' was returned. Reason: ${trimmedComments}`,
            entity_type: 'approval_request',
            entity_id: requestId,
            tenant_company_id: activeOperatingCompanyId
          });
        } else if (normalizedAction === 'approve') {
          if (data.final_approved || data.status === 'approved' || data.status === 'applied') {
            createNotification({
              title: `Request Approved: ${targetReq.request_number}`,
              message: `Request '${targetReq.title}' has received final approval and changes were applied.`,
              entity_type: 'approval_request',
              entity_id: requestId,
              tenant_company_id: activeOperatingCompanyId
            });
          }
        } else if (normalizedAction === 'withdraw') {
          createNotification({
            title: `Request Withdrawn: ${targetReq.request_number}`,
            message: `Request '${targetReq.title}' was withdrawn.`,
            entity_type: 'approval_request',
            entity_id: requestId,
            tenant_company_id: activeOperatingCompanyId
          });
        }
      }

      const updatedRequest = targetReq ? {
        ...targetReq,
        status: data.status,
        current_step_order: data.advanced ? (targetReq.current_step_order || 1) + 1 : targetReq.current_step_order
      } : null;

      return {
        success: true,
        status: data.status,
        advanced: Boolean(data.advanced),
        finalApproved: Boolean(data.final_approved),
        request: updatedRequest,
        data
      };
    } catch (err) {
      console.error('Error in processApprovalAction:', err);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Action convenience wrappers for ApprovalCenter consumers
  const approveStep = async (requestId, comments = '') => {
    return await processApprovalAction({ requestId, action: 'approve', comments });
  };

  const returnStep = async (requestId, comments = '') => {
    return await processApprovalAction({ requestId, action: 'return', comments });
  };

  const rejectStep = async (requestId, comments = '') => {
    return await processApprovalAction({ requestId, action: 'reject', comments });
  };

  // 5. Apply Employee Change Payload via Atomic RPC
  const applyEmployeeChange = async (targetReq) => {
    const requestId = targetReq?.id || targetReq;
    if (!requestId) return { success: false, error: 'Approval request ID is required.' };

    try {
      const { data, error: rpcErr } = await supabase.rpc('apply_employee_change_request_atomic', {
        p_approval_request_id: requestId
      });

      if (rpcErr) {
        console.error('Error invoking apply_employee_change_request_atomic RPC:', rpcErr);
        const errMsg = rpcErr.message || 'Failed to apply employee change.';
        return {
          success: false,
          conflict: errMsg.includes('Snapshot conflict') || errMsg.includes('Employee Master changed') || errMsg.includes('SNAPSHOT_CONFLICT'),
          error: errMsg
        };
      }

      if (!data || !data.success) {
        const errorMsg = data?.error || 'Failed to apply employee change via atomic RPC.';
        return {
          success: false,
          conflict: data?.code === 'SNAPSHOT_CONFLICT',
          error: errorMsg
        };
      }

      if (fetchEmployees) {
        await fetchEmployees(activeOperatingCompanyId);
      }
      await fetchRequests(activeOperatingCompanyId);

      return { success: true, data };
    } catch (err) {
      console.error('Error in applyEmployeeChange:', err);
      return { success: false, error: err.message };
    }
  };

  // 6. Resubmit Returned Request via Backend Atomic RPC: resubmit_approval_request_atomic(uuid, jsonb)
  const resubmitRequest = async (requestId, updatedPayload) => {
    if (!authUserId) return { success: false, error: 'Authentication required.' };
    if (!requestId) return { success: false, error: 'Request ID is required.' };

    let payloadObj = {};
    if (updatedPayload) {
      if (typeof updatedPayload === 'string') {
        try {
          payloadObj = JSON.parse(updatedPayload);
        } catch {
          payloadObj = {};
        }
      } else if (typeof updatedPayload === 'object') {
        payloadObj = updatedPayload;
      }
    }

    try {
      setIsLoading(true);

      const { data, error: rpcErr } = await supabase.rpc('resubmit_approval_request_atomic', {
        p_request_id: requestId,
        p_updated_payload: payloadObj
      });

      if (rpcErr) {
        console.error('Error in resubmit_approval_request_atomic RPC:', rpcErr);
        return { success: false, error: rpcErr.message };
      }

      if (!data || !data.success) {
        const errorMsg = data?.error || 'Failed to resubmit request.';
        return { success: false, error: errorMsg };
      }

      await fetchRequests(activeOperatingCompanyId);

      const targetReq = requests.find(r => r.id === requestId);
      if (createNotification && targetReq) {
        createNotification({
          title: `Request Resubmitted: ${targetReq.request_number}`,
          message: `Request '${targetReq.title}' was resubmitted for approval.`,
          entity_type: 'approval_request',
          entity_id: requestId,
          tenant_company_id: activeOperatingCompanyId
        });
      }

      return {
        success: true,
        request_id: data.request_id,
        status: data.status,
        data
      };
    } catch (err) {
      console.error('Error resubmitting request:', err);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // 7. Withdraw Eligible Pending Request via Backend Atomic RPC
  const withdrawRequest = async (requestId, comments = '') => {
    return await processApprovalAction({
      requestId,
      action: 'withdraw',
      comments: comments || 'Withdrawn by requester.'
    });
  };

  const value = {
    requests,
    requestSteps,
    requestActions,
    workflows,
    workflowSteps,
    isLoading,
    isApprovalLoading: isLoading,
    error,
    isManagementOrAdmin,
    selectedRequestId,
    setSelectedRequestId,
    createAndSubmitRequest,
    processApprovalAction,
    approveStep,
    returnStep,
    rejectStep,
    resubmitRequest,
    withdrawRequest,
    applyEmployeeChange,
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
