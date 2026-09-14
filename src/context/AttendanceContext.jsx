import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useCrm } from './CrmContext';
import { useEmployee } from './EmployeeContext';
import { useApproval } from './ApprovalContext';

const AttendanceContext = createContext(null);

export function AttendanceProvider({ children }) {
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
  const { createAndSubmitRequest } = useApproval() || {};

  const authUserId = session?.user?.id || currentUser?.id;
  const currentRole = (tenantRole || 'TEAM').toUpperCase();
  const isManagement = ['OWNER', 'ADMIN', 'MANAGER'].includes(currentRole);

  // Current authenticated user's linked employee profile
  const currentEmployee = useMemo(() => {
    if (!authUserId) return null;
    return employees.find(e => e.linked_user_id === authUserId || e.email === currentUser?.email) || null;
  }, [employees, authUserId, currentUser]);

  // State collections from DB tables
  const [shifts, setShifts] = useState([]);
  const [employeeShifts, setEmployeeShifts] = useState([]);
  const [devices, setDevices] = useState([]);
  const [events, setEvents] = useState([]);
  const [authEvents, setAuthEvents] = useState([]);
  const [dailyRecords, setDailyRecords] = useState([]);
  const [faceProfiles, setFaceProfiles] = useState([]);
  const [featureSettings, setFeatureSettings] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Feature settings resolution
  const activeCompanySettings = useMemo(() => {
    if (featureSettings) {
      return {
        attendanceEnabled: Boolean(featureSettings.attendance_enabled),
        shiftFeatureEnabled: Boolean(featureSettings.shift_enabled),
        faceVerificationEnabled: Boolean(featureSettings.face_verification_enabled),
        correctionApprovalEnabled: Boolean(featureSettings.correction_enabled),
        mobileAttendanceEnabled: true,
        tabletAttendanceEnabled: true
      };
    }
    return {
      attendanceEnabled: true,
      shiftFeatureEnabled: true,
      faceVerificationEnabled: true,
      mobileAttendanceEnabled: true,
      tabletAttendanceEnabled: true,
      correctionApprovalEnabled: true
    };
  }, [featureSettings]);

  // 1. Fetch Attendance Data scoped to active operating company
  const fetchAttendanceData = useCallback(async (opCoId) => {
    setIsLoading(true);
    setError(null);
    try {
      let shiftsQ = supabase.from('attendance_shifts').select('*').order('created_at', { ascending: false });
      let empShiftsQ = supabase.from('attendance_employee_shifts').select('*').order('created_at', { ascending: false });
      let devicesQ = supabase.from('attendance_devices').select('*').order('created_at', { ascending: false });
      let eventsQ = supabase.from('attendance_events').select('*').order('created_at', { ascending: false }).limit(100);
      let authEventsQ = supabase.from('attendance_authentication_events').select('*').order('created_at', { ascending: false }).limit(100);
      let recordsQ = supabase.from('attendance_daily_records').select('*').order('attendance_date', { ascending: false }).limit(100);
      let facesQ = supabase.from('attendance_face_profiles').select('*');
      let settingsQ = supabase.from('attendance_feature_settings').select('*');

      if (opCoId) {
        shiftsQ = shiftsQ.eq('tenant_company_id', opCoId);
        empShiftsQ = empShiftsQ.eq('tenant_company_id', opCoId);
        devicesQ = devicesQ.eq('tenant_company_id', opCoId);
        eventsQ = eventsQ.eq('tenant_company_id', opCoId);
        authEventsQ = authEventsQ.eq('tenant_company_id', opCoId);
        recordsQ = recordsQ.eq('tenant_company_id', opCoId);
        facesQ = facesQ.eq('tenant_company_id', opCoId);
        settingsQ = settingsQ.eq('tenant_company_id', opCoId);
      }

      const [shiftsRes, empShiftsRes, devicesRes, eventsRes, authEventsRes, recordsRes, facesRes, settingsRes] = await Promise.all([
        shiftsQ, empShiftsQ, devicesQ, eventsQ, authEventsQ, recordsQ, facesQ, settingsQ
      ]);

      setShifts(shiftsRes.data || []);
      setEmployeeShifts(empShiftsRes.data || []);
      setDevices(devicesRes.data || []);
      setEvents(eventsRes.data || []);
      setAuthEvents(authEventsRes.data || []);
      setDailyRecords(recordsRes.data || []);
      setFaceProfiles(facesRes.data || []);
      setFeatureSettings(settingsRes.data && settingsRes.data.length > 0 ? settingsRes.data[0] : null);
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authUserId) {
      fetchAttendanceData(activeOperatingCompanyId);
    }
  }, [authUserId, activeOperatingCompanyId, fetchAttendanceData]);

  // Update company feature settings
  const updateCompanySettings = async (newSettings) => {
    try {
      const payload = {
        tenant_id: tenantId || null,
        tenant_company_id: activeOperatingCompanyId || null,
        attendance_enabled: newSettings.attendanceEnabled !== undefined ? newSettings.attendanceEnabled : activeCompanySettings.attendanceEnabled,
        shift_enabled: newSettings.shiftFeatureEnabled !== undefined ? newSettings.shiftFeatureEnabled : activeCompanySettings.shiftFeatureEnabled,
        face_verification_enabled: newSettings.faceVerificationEnabled !== undefined ? newSettings.faceVerificationEnabled : activeCompanySettings.faceVerificationEnabled,
        correction_enabled: newSettings.correctionApprovalEnabled !== undefined ? newSettings.correctionApprovalEnabled : activeCompanySettings.correctionApprovalEnabled,
        updated_at: new Date().toISOString()
      };

      if (featureSettings && featureSettings.id) {
        await supabase.from('attendance_feature_settings').update(payload).eq('id', featureSettings.id);
      } else {
        payload.created_at = new Date().toISOString();
        await supabase.from('attendance_feature_settings').insert([payload]);
      }

      await fetchAttendanceData(activeOperatingCompanyId);
      return { success: true };
    } catch (err) {
      console.error('Error updating attendance feature settings:', err);
      return { success: false, error: err.message };
    }
  };

  // 2. Strict 1:1 Face Verification Boundary Check
  // Resolves target employee, verifies against ONLY that employee's active profile
  const verifyFaceProfile = async (targetEmployeeId) => {
    if (!activeCompanySettings.faceVerificationEnabled) {
      return { success: true, bypassed: true, message: 'Face verification is disabled in settings.' };
    }

    const emp = employees.find(e => e.id === targetEmployeeId);
    if (!emp) {
      return { success: false, error: 'Employee not found.' };
    }

    // Check target employee's 1:1 face profile
    const profile = faceProfiles.find(fp => fp.employee_id === targetEmployeeId);
    if (!profile) {
      // Record failed authentication evidence
      await recordAuthEvent({
        verified_employee_id: targetEmployeeId,
        authentication_method: 'face',
        liveness_result: 'failed',
        metadata: { reason: 'No registered face profile found for employee' }
      });

      return {
        success: false,
        error: `Security Check Failed: No face profile registered for employee ${emp.first_name} ${emp.last_name}.`
      };
    }

    // Boundary check: No external face verification provider configured
    // STRICT SECURITY RULE: Must NEVER result in successful attendance when face verification is required!
    await recordAuthEvent({
      verified_employee_id: targetEmployeeId,
      authentication_method: 'face',
      liveness_result: 'unconfigured_provider',
      metadata: { reason: 'Face verification provider not configured' }
    });

    return {
      success: false,
      unconfigured: true,
      message: 'Face verification provider not configured. Attendance punch rejected.',
      verified_employee: `${emp.first_name} ${emp.last_name}`
    };
  };

  // Helper: Record authentication evidence in attendance_authentication_events
  const recordAuthEvent = async ({ verified_employee_id, authentication_method, liveness_result, device_id = null, metadata = {} }) => {
    try {
      const payload = {
        tenant_id: tenantId || null,
        tenant_company_id: activeOperatingCompanyId || null,
        verified_employee_id: verified_employee_id || null,
        authentication_method,
        liveness_result,
        device_id: device_id || null,
        metadata: JSON.stringify(metadata),
        created_at: new Date().toISOString()
      };
      await supabase.from('attendance_authentication_events').insert([payload]);
    } catch (err) {
      console.error('Error recording authentication evidence event:', err);
    }
  };

  // 3. Record Raw Attendance Event (Check-in / Check-out)
  // SECURITY GATE: Normal employee CANNOT pass arbitrary employee_id to create attendance for another employee!
  const recordPunch = async ({
    employee_id,
    event_type, // 'check_in' | 'check_out'
    device_id = null,
    latitude = null,
    longitude = null,
    metadata = {}
  }) => {
    if (!activeCompanySettings.attendanceEnabled) {
      return { success: false, error: 'Attendance module is currently disabled for this company.' };
    }

    // SECURITY GUARANTEE: For normal self-service, enforce authenticated user's linked employee ID!
    let targetEmpId = currentEmployee?.id;

    // Only Tablet Kiosk or Management roles can specify an external employee_id
    if (device_id || isManagement) {
      if (employee_id) targetEmpId = employee_id;
    }

    if (!targetEmpId) {
      return { success: false, error: 'Security Violation: No authorized employee profile linked to current user session.' };
    }

    try {
      const nowIso = new Date().toISOString();
      const payload = {
        tenant_id: tenantId || null,
        tenant_company_id: activeOperatingCompanyId || null,
        employee_id: targetEmpId,
        event_type,
        device_id: device_id || null,
        latitude: latitude || null,
        longitude: longitude || null,
        metadata: JSON.stringify({
          client_timestamp: nowIso,
          source: device_id ? 'kiosk' : 'mobile',
          ...metadata
        }),
        verification_status: metadata.verification_status || 'unverified',
        created_at: nowIso // Server-generated timestamp is authoritative
      };

      const { data: newEvent, error: err } = await supabase
        .from('attendance_events')
        .insert([payload])
        .select('*')
        .single();

      if (err) throw err;

      // Re-calculate today's daily record
      const todayDateStr = new Date().toISOString().split('T')[0];
      await calculateDailyAttendance(targetEmpId, todayDateStr);

      await fetchAttendanceData(activeOperatingCompanyId);

      if (createNotification) {
        createNotification({
          title: `Attendance Punch: ${event_type === 'check_in' ? 'Check In' : 'Check Out'}`,
          message: `Recorded ${event_type.replace('_', ' ')} at ${new Date().toLocaleTimeString()}`,
          entity_type: 'attendance_event',
          entity_id: newEvent.id,
          tenant_company_id: activeOperatingCompanyId
        });
      }

      return { success: true, event: newEvent };
    } catch (err) {
      console.error('Error recording attendance punch:', err);
      return { success: false, error: err.message };
    }
  };

  // 4. Daily Attendance Calculation Logic
  const calculateDailyAttendance = async (employee_id, dateStr) => {
    try {
      const dayEvents = events.filter(e => {
        if (e.employee_id !== employee_id) return false;
        const eDate = new Date(e.created_at).toISOString().split('T')[0];
        return eDate === dateStr;
      }).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

      if (dayEvents.length === 0) return;

      const firstPunch = dayEvents[0];
      const lastPunch = dayEvents.length > 1 ? dayEvents[dayEvents.length - 1] : null;

      // Resolve employee-specific shift first from attendance_employee_shifts
      let shift = null;
      if (activeCompanySettings.shiftFeatureEnabled) {
        const empShiftAssignment = employeeShifts.find(es => es.employee_id === employee_id && es.status === 'active');
        if (empShiftAssignment) {
          shift = shifts.find(s => s.id === empShiftAssignment.shift_id);
        }
        if (!shift && shifts.length > 0) {
          shift = shifts[0]; // General company shift default
        }
      }

      let lateMinutes = 0;
      let earlyDepartureMinutes = 0;
      let calculatedStatus = 'present';

      if (shift && shift.start_time) {
        const [shiftStartH, shiftStartM] = shift.start_time.split(':').map(Number);
        const firstPunchDate = new Date(firstPunch.created_at);
        const shiftStartDate = new Date(firstPunchDate);
        shiftStartDate.setHours(shiftStartH, shiftStartM, 0, 0);

        const diffMinutes = Math.floor((firstPunchDate - shiftStartDate) / (1000 * 60));
        const grace = Number(shift.grace_minutes || 15);

        if (diffMinutes > grace) {
          lateMinutes = diffMinutes - grace;
          calculatedStatus = 'late';
        }
      }

      if (shift && shift.end_time && lastPunch) {
        const [shiftEndH, shiftEndM] = shift.end_time.split(':').map(Number);
        const lastPunchDate = new Date(lastPunch.created_at);
        const shiftEndDate = new Date(lastPunchDate);
        shiftEndDate.setHours(shiftEndH, shiftEndM, 0, 0);

        const diffEndMinutes = Math.floor((shiftEndDate - lastPunchDate) / (1000 * 60));
        if (diffEndMinutes > 0) {
          earlyDepartureMinutes = diffEndMinutes;
        }
      }

      const policySnapshot = {
        shift_name: shift?.name || 'Standard Hours (No Shift)',
        grace_minutes: shift?.grace_minutes || 15,
        shift_feature_on: activeCompanySettings.shiftFeatureEnabled,
        calculated_at: new Date().toISOString()
      };

      const recordPayload = {
        tenant_id: tenantId || null,
        tenant_company_id: activeOperatingCompanyId || null,
        employee_id,
        attendance_date: dateStr,
        status: calculatedStatus,
        late_minutes: lateMinutes,
        early_departure_minutes: earlyDepartureMinutes,
        policy_snapshot: JSON.stringify(policySnapshot),
        calculation_version: 1,
        updated_at: new Date().toISOString()
      };

      const existing = dailyRecords.find(r => r.employee_id === employee_id && r.attendance_date === dateStr);
      if (existing) {
        await supabase.from('attendance_daily_records').update(recordPayload).eq('id', existing.id);
      } else {
        recordPayload.created_at = new Date().toISOString();
        await supabase.from('attendance_daily_records').insert([recordPayload]);
      }
    } catch (err) {
      console.error('Error calculating daily attendance:', err);
    }
  };

  // 5. Shift Management & Employee Shift Assignments
  const saveShift = async (shiftData) => {
    try {
      const payload = {
        tenant_id: tenantId || null,
        tenant_company_id: activeOperatingCompanyId || null,
        name: shiftData.name,
        code: shiftData.code || shiftData.name.substring(0, 4).toUpperCase(),
        start_time: shiftData.start_time,
        end_time: shiftData.end_time,
        grace_minutes: Number(shiftData.grace_minutes || 15),
        cross_midnight: Boolean(shiftData.cross_midnight),
        status: shiftData.status || 'active',
        updated_at: new Date().toISOString()
      };

      if (shiftData.id) {
        const { error: err } = await supabase.from('attendance_shifts').update(payload).eq('id', shiftData.id);
        if (err) throw err;
      } else {
        payload.created_at = new Date().toISOString();
        const { error: err } = await supabase.from('attendance_shifts').insert([payload]);
        if (err) throw err;
      }

      await fetchAttendanceData(activeOperatingCompanyId);
      return { success: true };
    } catch (err) {
      console.error('Error saving attendance shift:', err);
      return { success: false, error: err.message };
    }
  };

  const assignShiftToEmployee = async ({ employee_id, shift_id, effective_from = null, effective_to = null }) => {
    try {
      const payload = {
        tenant_id: tenantId || null,
        tenant_company_id: activeOperatingCompanyId || null,
        employee_id,
        shift_id,
        effective_from: effective_from || new Date().toISOString().split('T')[0],
        effective_to: effective_to || null,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await supabase.from('attendance_employee_shifts').insert([payload]);
      await fetchAttendanceData(activeOperatingCompanyId);
      return { success: true };
    } catch (err) {
      console.error('Error assigning employee shift:', err);
      return { success: false, error: err.message };
    }
  };

  // 6. Kiosk Device Registration
  const registerDevice = async ({ device_name, device_type = 'tablet', latitude = null, longitude = null }) => {
    try {
      const payload = {
        tenant_id: tenantId || null,
        tenant_company_id: activeOperatingCompanyId || null,
        device_name,
        device_type,
        latitude,
        longitude,
        status: 'active',
        registered_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newDevice, error: err } = await supabase
        .from('attendance_devices')
        .insert([payload])
        .select('*')
        .single();

      if (err) throw err;

      await fetchAttendanceData(activeOperatingCompanyId);
      return { success: true, device: newDevice };
    } catch (err) {
      console.error('Error registering kiosk device:', err);
      return { success: false, error: err.message };
    }
  };

  const toggleDeviceStatus = async (device_id, newStatus) => {
    try {
      const { error: err } = await supabase
        .from('attendance_devices')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', device_id);

      if (err) throw err;

      await fetchAttendanceData(activeOperatingCompanyId);
      return { success: true };
    } catch (err) {
      console.error('Error updating device status:', err);
      return { success: false, error: err.message };
    }
  };

  // 7. RPC-Backed Face Profile Enrollment & Revocation
  const enrollFaceProfile = async ({
    employee_id,
    verification_provider,
    provider_subject_ref,
    tenant_company_id = null
  }) => {
    try {
      const targetCompanyId = tenant_company_id || activeOperatingCompanyId || null;
      const { data, error: rpcErr } = await supabase.rpc('enroll_attendance_face_profile', {
        p_employee_id: employee_id,
        p_verification_provider: verification_provider,
        p_provider_subject_ref: provider_subject_ref,
        p_tenant_company_id: targetCompanyId,
        p_tenant_id: tenantId || null
      });

      if (rpcErr) {
        console.error('Error in enroll_attendance_face_profile RPC:', rpcErr);
        return { success: false, error: rpcErr.message || rpcErr.details || 'Enrollment RPC failed.' };
      }

      await fetchAttendanceData(activeOperatingCompanyId);
      return { success: true, data };
    } catch (err) {
      console.error('Error enrolling face profile:', err);
      return { success: false, error: err.message };
    }
  };

  const revokeFaceProfile = async ({
    employee_id,
    reason,
    tenant_company_id = null
  }) => {
    try {
      const targetCompanyId = tenant_company_id || activeOperatingCompanyId || null;
      const { data, error: rpcErr } = await supabase.rpc('revoke_attendance_face_profile', {
        p_employee_id: employee_id,
        p_reason: reason || 'Revoked by administrator',
        p_tenant_company_id: targetCompanyId,
        p_tenant_id: tenantId || null
      });

      if (rpcErr) {
        console.error('Error in revoke_attendance_face_profile RPC:', rpcErr);
        return { success: false, error: rpcErr.message || rpcErr.details || 'Revocation RPC failed.' };
      }

      await fetchAttendanceData(activeOperatingCompanyId);
      return { success: true, data };
    } catch (err) {
      console.error('Error revoking face profile:', err);
      return { success: false, error: err.message };
    }
  };

  // Legacy wrapper for backwards compatibility
  const registerFaceProfile = async (employee_id, provider = 'configured_provider', subjectRef = `ref-${employee_id}`) => {
    return await enrollFaceProfile({
      employee_id,
      verification_provider: provider,
      provider_subject_ref: subjectRef
    });
  };

  // 8. Attendance Correction Request via Approval Engine
  const submitAttendanceCorrection = async ({ employee_id, attendance_date, requested_punch_time, reason }) => {
    if (!createAndSubmitRequest) {
      return { success: false, error: 'Approval Context is not available.' };
    }

    const emp = employees.find(e => e.id === employee_id) || currentEmployee;
    const empName = emp ? `${emp.first_name} ${emp.last_name}` : 'Employee';

    return await createAndSubmitRequest({
      request_type: 'attendance_correction',
      subject_employee_id: emp?.id || null,
      entity_type: 'attendance',
      entity_id: emp?.id || null,
      title: `Attendance Correction for ${empName} (${attendance_date})`,
      description: reason || 'Requested correction to attendance punch time.',
      payload: {
        employee_id: emp?.id,
        attendance_date,
        requested_punch_time,
        reason
      },
      current_snapshot: {
        attendance_date,
        status: 'uncorrected'
      },
      priority: 'normal'
    });
  };

  const value = {
    shifts,
    employeeShifts,
    devices,
    events,
    authEvents,
    dailyRecords,
    faceProfiles,
    featureSettings,
    isLoading,
    error,
    currentEmployee,
    activeCompanySettings,
    updateCompanySettings,
    recordPunch,
    calculateDailyAttendance,
    saveShift,
    assignShiftToEmployee,
    registerDevice,
    toggleDeviceStatus,
    registerFaceProfile,
    enrollFaceProfile,
    revokeFaceProfile,
    verifyFaceProfile,
    submitAttendanceCorrection,
    fetchAttendanceData
  };

  return <AttendanceContext.Provider value={value}>{children}</AttendanceContext.Provider>;
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
}
