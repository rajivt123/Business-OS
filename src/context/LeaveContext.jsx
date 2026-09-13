import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useCrm } from './CrmContext';
import { useEmployee } from './EmployeeContext';
import { useApproval } from './ApprovalContext';
import { useHrPolicy } from './HrPolicyContext';

const LeaveContext = createContext(null);

export function LeaveProvider({ children }) {
  const crmContext = useCrm() || {};
  const {
    tenantId,
    activeOperatingCompanyId,
    currentUser,
    session,
    userRole,
    tenantRole,
    createNotification
  } = crmContext;

  const { employees = [] } = useEmployee() || {};
  const { createAndSubmitRequest, requests: approvalRequests = [] } = useApproval() || {};
  const { leaveTypes = [], leavePolicyRules = [], holidayCalendarDays = [], weeklyOffPolicies = [] } = useHrPolicy() || {};

  const authUserId = session?.user?.id || currentUser?.id;
  const currentRole = (tenantRole || 'TEAM').toUpperCase();
  const isManagement = ['OWNER', 'ADMIN', 'MANAGER'].includes(currentRole);

  // Current authenticated user's linked employee profile
  const currentEmployee = useMemo(() => {
    if (!authUserId) return null;
    return employees.find(e => e.user_id === authUserId || e.email === currentUser?.email) || null;
  }, [employees, authUserId, currentUser]);

  // State collections from DB tables
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveRequestDays, setLeaveRequestDays] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [leaveLedger, setLeaveLedger] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch Leave Data scoped to active operating company
  const fetchLeaveData = useCallback(async (opCoId) => {
    setIsLoading(true);
    setError(null);
    try {
      let reqQ = supabase.from('leave_requests').select('*').order('created_at', { ascending: false });
      let daysQ = supabase.from('leave_request_days').select('*').order('leave_date', { ascending: true });
      let balQ = supabase.from('leave_balances').select('*');
      let ledgerQ = supabase.from('leave_ledger').select('*').order('created_at', { ascending: false });

      if (opCoId) {
        reqQ = reqQ.eq('tenant_company_id', opCoId);
        daysQ = daysQ.eq('tenant_company_id', opCoId);
        balQ = balQ.eq('tenant_company_id', opCoId);
        ledgerQ = ledgerQ.eq('tenant_company_id', opCoId);
      }

      const [reqRes, daysRes, balRes, ledgerRes] = await Promise.all([
        reqQ, daysQ, balQ, ledgerQ
      ]);

      setLeaveRequests(reqRes.data || []);
      setLeaveRequestDays(daysRes.data || []);
      setLeaveBalances(balRes.data || []);
      setLeaveLedger(ledgerRes.data || []);
    } catch (err) {
      console.error('Error fetching leave management data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authUserId) {
      fetchLeaveData(activeOperatingCompanyId);
    }
  }, [authUserId, activeOperatingCompanyId, fetchLeaveData]);

  // 2. Date-by-Date Leave Calculation Algorithm
  // Classifies dates into exact DB day_types: 'working_day' | 'weekly_off' | 'holiday' | 'leave' | 'half_day' | 'non_working'
  const calculateLeaveDays = useCallback(({ from_date, to_date, half_day_type = null }) => {
    if (!from_date || !to_date) return { total_days: 0, dateBreakdown: [] };

    const start = new Date(from_date);
    const end = new Date(to_date);
    const dateBreakdown = [];
    let totalDays = 0;

    const activeWeeklyOff = weeklyOffPolicies.find(w => w.tenant_company_id === activeOperatingCompanyId || !w.tenant_company_id);

    const current = new Date(start);
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      const dayOfWeek = current.getDay(); // 0 = Sun, 6 = Sat

      // Check if Public Holiday
      const isHoliday = holidayCalendarDays.some(h => h.holiday_date === dateStr);

      // Check if Weekly Off
      let isWeeklyOff = false;
      if (dayOfWeek === 0) { // Sunday
        isWeeklyOff = activeWeeklyOff ? activeWeeklyOff.sunday_off !== false : true;
      } else if (dayOfWeek === 6) { // Saturday
        if (activeWeeklyOff && activeWeeklyOff.saturday_off_type === 'all') isWeeklyOff = true;
      }

      let dayType = 'working_day';
      let dayCount = 1.0;

      if (isHoliday) {
        dayType = 'holiday';
        dayCount = 0.0;
      } else if (isWeeklyOff) {
        dayType = 'weekly_off';
        dayCount = 0.0;
      } else if (half_day_type && half_day_type !== 'none' && dateStr === from_date && from_date === to_date) {
        dayType = 'half_day';
        dayCount = 0.5;
      }

      totalDays += dayCount;
      dateBreakdown.push({
        leave_date: dateStr,
        day_type: dayType,
        day_count: dayCount
      });

      current.setDate(current.getDate() + 1);
    }

    return { total_days: totalDays, dateBreakdown };
  }, [holidayCalendarDays, weeklyOffPolicies, activeOperatingCompanyId]);

  // 3. Apply for Leave (Self-Service)
  // Reserves pending balance, creates leave_requests + leave_request_days, submits Approval Engine request
  const applyLeave = async ({ leave_type_id, from_date, to_date, half_day_type = null, reason }) => {
    if (!currentEmployee) {
      return { success: false, error: 'No active employee profile linked to current user session.' };
    }

    const { total_days, dateBreakdown } = calculateLeaveDays({ from_date, to_date, half_day_type });
    if (total_days <= 0) {
      return { success: false, error: 'Selected date range contains no billable working days (only holidays/weekly offs).' };
    }

    // Balance check
    const empBalance = leaveBalances.find(b => b.employee_id === currentEmployee.id && b.leave_type_id === leave_type_id);
    const available = empBalance ? Number(empBalance.available_balance || 0) : 0;

    if (available < total_days) {
      return {
        success: false,
        error: `Insufficient leave balance. Available: ${available} days, Requested: ${total_days} days.`
      };
    }

    const leaveType = leaveTypes.find(t => t.id === leave_type_id);
    const leaveTypeName = leaveType ? leaveType.name : 'Leave';

    try {
      const nowIso = new Date().toISOString();

      // Create leave_requests record in DB
      const requestPayload = {
        tenant_id: tenantId || null,
        tenant_company_id: activeOperatingCompanyId || null,
        employee_id: currentEmployee.id,
        leave_type_id,
        from_date,
        to_date,
        total_days,
        half_day_type: half_day_type && half_day_type !== 'none' ? half_day_type : null,
        reason: reason || `Application for ${leaveTypeName}`,
        status: 'pending_approval',
        created_at: nowIso,
        updated_at: nowIso
      };

      const { data: newLeaveReq, error: reqErr } = await supabase
        .from('leave_requests')
        .insert([requestPayload])
        .select('*')
        .single();

      if (reqErr) throw reqErr;

      // Insert leave_request_days entries for each date
      const daysToInsert = dateBreakdown.map(d => ({
        tenant_id: tenantId || null,
        tenant_company_id: activeOperatingCompanyId || null,
        leave_request_id: newLeaveReq.id,
        leave_date: d.leave_date,
        day_type: d.day_type,
        calculation_snapshot: JSON.stringify({
          day_count: d.day_count,
          half_day_type: d.day_type === 'half_day' ? half_day_type : null
        }),
        created_at: nowIso,
        updated_at: nowIso
      }));

      const { error: daysErr } = await supabase.from('leave_request_days').insert(daysToInsert);
      if (daysErr) throw daysErr;

      // Reserve Pending Balance: pending += total_days, available_balance -= total_days
      const updatedPending = Number(empBalance?.pending || 0) + total_days;
      const updatedAvailable = Math.max(0, available - total_days);

      if (empBalance && empBalance.id) {
        await supabase
          .from('leave_balances')
          .update({
            pending: updatedPending,
            available_balance: updatedAvailable,
            updated_at: nowIso
          })
          .eq('id', empBalance.id);
      } else {
        await supabase.from('leave_balances').insert([{
          tenant_id: tenantId || null,
          tenant_company_id: activeOperatingCompanyId || null,
          employee_id: currentEmployee.id,
          leave_type_id,
          accrued: available,
          used: 0,
          pending: total_days,
          available_balance: updatedAvailable,
          created_at: nowIso,
          updated_at: nowIso
        }]);
      }

      // Submit Approval Request to Common Approval Engine P0
      const approvalRes = await createAndSubmitRequest({
        request_type: 'leave_application',
        subject_employee_id: currentEmployee.id,
        entity_type: 'leave_request',
        entity_id: newLeaveReq.id,
        title: `Leave Application (${leaveTypeName}) for ${currentEmployee.first_name} ${currentEmployee.last_name}`,
        description: `Requested ${total_days} day(s) from ${from_date} to ${to_date}. Reason: ${reason || 'N/A'}`,
        payload: {
          leave_request_id: newLeaveReq.id,
          employee_id: currentEmployee.id,
          leave_type_id,
          from_date,
          to_date,
          total_days,
          half_day_type
        },
        current_snapshot: {
          available_balance_before: available,
          total_days_requested: total_days
        },
        priority: 'normal'
      });

      // SUBMISSION FAILURE ROLLBACK GUARD:
      // If Approval Engine submission fails, release pending reservation and set leave_requests status = 'cancelled'
      if (!approvalRes.success) {
        console.warn('Approval Engine submission failed. Rolling back pending balance reservation...');

        // Restore pending balance
        if (empBalance && empBalance.id) {
          await supabase
            .from('leave_balances')
            .update({
              pending: Number(empBalance.pending || 0),
              available_balance: available,
              updated_at: new Date().toISOString()
            })
            .eq('id', empBalance.id);
        }

        // Mark request cancelled
        await supabase.from('leave_requests').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', newLeaveReq.id);

        await fetchLeaveData(activeOperatingCompanyId);
        return { success: false, error: `Approval Submission Failed: ${approvalRes.error}. Balance reservation rolled back.` };
      }

      // Link approval_request_id to leave_requests
      await supabase
        .from('leave_requests')
        .update({ approval_request_id: approvalRes.request.id, updated_at: new Date().toISOString() })
        .eq('id', newLeaveReq.id);

      await fetchLeaveData(activeOperatingCompanyId);

      if (createNotification) {
        createNotification({
          title: `Leave Application Submitted: ${leaveTypeName}`,
          message: `Requested ${total_days} day(s) from ${from_date} to ${to_date}.`,
          entity_type: 'leave_request',
          entity_id: newLeaveReq.id,
          tenant_company_id: activeOperatingCompanyId
        });
      }

      return { success: true, leaveRequest: newLeaveReq };
    } catch (err) {
      console.error('Error applying for leave:', err);
      return { success: false, error: err.message };
    }
  };

  // 4. Process Final Step Approval from Approval Engine
  // Calls live atomic Supabase RPC: process_leave_approval_atomic(p_leave_request_id)
  // No client-side direct mutations to leave_balances or leave_ledger!
  const processLeaveApproval = useCallback(async (approvalRequest) => {
    try {
      const payload = typeof approvalRequest.payload === 'string' ? JSON.parse(approvalRequest.payload) : approvalRequest.payload;
      const { leave_request_id } = payload || {};

      if (!leave_request_id) {
        return { success: false, error: 'Missing leave_request_id in approval request payload.' };
      }

      const leaveReq = leaveRequests.find(r => r.id === leave_request_id);
      if (!leaveReq) return { success: false, error: 'Leave request record not found.' };

      // APPLIED-STATE PROTECTION GUARD: If request is already applied, return early
      if (['applied'].includes(leaveReq.status)) {
        return { success: true, message: 'Leave request is already applied.' };
      }

      // Invoke Live Supabase Atomic RPC
      const { data: rpcRes, error: rpcErr } = await supabase.rpc('process_leave_approval_atomic', {
        p_leave_request_id: leave_request_id
      });

      if (rpcErr) {
        console.error('RPC Error in process_leave_approval_atomic:', rpcErr);
        return { success: false, error: rpcErr.message || 'Atomic leave approval RPC failed.' };
      }

      if (rpcRes && rpcRes.success === false) {
        return { success: false, error: rpcRes.error || 'Failed to process leave approval via RPC.' };
      }

      await fetchLeaveData(activeOperatingCompanyId);
      return { success: true, ...rpcRes };
    } catch (err) {
      console.error('Error processing leave approval:', err);
      return { success: false, error: err.message };
    }
  }, [leaveRequests, activeOperatingCompanyId, fetchLeaveData]);

  // Automatic sync with ApprovalContext requests
  useEffect(() => {
    if (!approvalRequests || approvalRequests.length === 0) return;

    const approvedLeaveApps = approvalRequests.filter(
      ar => ar.request_type === 'leave_application' && ar.status === 'approved'
    );

    approvedLeaveApps.forEach(ar => {
      const payload = typeof ar.payload === 'string' ? JSON.parse(ar.payload) : ar.payload;
      if (payload && payload.leave_request_id) {
        const targetLeaveReq = leaveRequests.find(r => r.id === payload.leave_request_id);
        if (targetLeaveReq && targetLeaveReq.status === 'pending_approval') {
          processLeaveApproval(ar);
        }
      }
    });
  }, [approvalRequests, leaveRequests, processLeaveApproval]);

  // 5. Cancel / Withdraw Leave Request
  // Calls live atomic Supabase RPC: cancel_leave_atomic(p_leave_request_id)
  // No client-side direct mutations to leave_balances or leave_ledger!
  const cancelLeave = async (leaveRequestId) => {
    try {
      const leaveReq = leaveRequests.find(r => r.id === leaveRequestId);
      if (!leaveReq) return { success: false, error: 'Leave request not found.' };

      if (leaveReq.status === 'cancelled') {
        return { success: true, message: 'Leave request is already cancelled.' };
      }

      if (leaveReq.employee_id !== currentEmployee?.id && !isManagement) {
        return { success: false, error: 'Unauthorized to cancel this leave request.' };
      }

      // Invoke Live Supabase Atomic RPC
      const { data: rpcRes, error: rpcErr } = await supabase.rpc('cancel_leave_atomic', {
        p_leave_request_id: leaveRequestId
      });

      if (rpcErr) {
        console.error('RPC Error in cancel_leave_atomic:', rpcErr);
        return { success: false, error: rpcErr.message || 'Atomic leave cancellation RPC failed.' };
      }

      if (rpcRes && rpcRes.success === false) {
        return { success: false, error: rpcRes.error || 'Failed to cancel leave request via RPC.' };
      }

      await fetchLeaveData(activeOperatingCompanyId);
      return { success: true, ...rpcRes };
    } catch (err) {
      console.error('Error cancelling leave request:', err);
      return { success: false, error: err.message };
    }
  };

  // 6. Management Accrual / Adjustment Entry
  const accrueLeave = async ({ employee_id, leave_type_id, quantity, reason }) => {
    if (!isManagement) return { success: false, error: 'Unauthorized: Management role required to accrue leave.' };

    try {
      const nowIso = new Date().toISOString();
      const amount = Number(quantity);

      // Append ledger entry to leave_ledger: transaction_type = 'accrual'
      const ledgerEntry = {
        tenant_id: tenantId || null,
        tenant_company_id: activeOperatingCompanyId || null,
        employee_id,
        leave_type_id,
        transaction_type: 'accrual',
        quantity: amount,
        reason: reason || 'Annual / Management Leave Accrual',
        reference_type: 'manual',
        created_by: authUserId,
        created_at: nowIso
      };
      await supabase.from('leave_ledger').insert([ledgerEntry]);

      // Update leave_balances: accrued += amount, available_balance += amount
      const empBal = leaveBalances.find(b => b.employee_id === employee_id && b.leave_type_id === leave_type_id);
      if (empBal) {
        const updatedAccrued = Number(empBal.accrued || 0) + amount;
        const updatedAvailable = Number(empBal.available_balance || 0) + amount;
        await supabase
          .from('leave_balances')
          .update({ accrued: updatedAccrued, available_balance: updatedAvailable, updated_at: nowIso })
          .eq('id', empBal.id);
      } else {
        await supabase.from('leave_balances').insert([{
          tenant_id: tenantId || null,
          tenant_company_id: activeOperatingCompanyId || null,
          employee_id,
          leave_type_id,
          accrued: amount,
          used: 0,
          pending: 0,
          available_balance: amount,
          created_at: nowIso,
          updated_at: nowIso
        }]);
      }

      await fetchLeaveData(activeOperatingCompanyId);
      return { success: true };
    } catch (err) {
      console.error('Error accruing leave:', err);
      return { success: false, error: err.message };
    }
  };

  const value = {
    leaveRequests,
    leaveRequestDays,
    leaveBalances,
    leaveLedger,
    isLoading,
    error,
    currentEmployee,
    isManagement,
    calculateLeaveDays,
    applyLeave,
    processLeaveApproval,
    cancelLeave,
    accrueLeave,
    fetchLeaveData
  };

  return <LeaveContext.Provider value={value}>{children}</LeaveContext.Provider>;
}

export function useLeave() {
  const context = useContext(LeaveContext);
  if (!context) {
    throw new Error('useLeave must be used within a LeaveProvider');
  }
  return context;
}
