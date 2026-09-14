import React, { useState, useMemo } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { useEmployee } from '../../context/EmployeeContext';
import { useCrm } from '../../context/CrmContext';
import FaceEnrollmentModal from './FaceEnrollmentModal';
import {
  Clock, CalendarCheck2, LogIn, LogOut, ShieldCheck, Settings, Tablet, UserCheck,
  AlertCircle, CheckCircle2, SlidersHorizontal, Plus, AlertTriangle, X, Search,
  RefreshCw, MapPin, Sparkles, Send, Ban, Lock, ShieldAlert
} from 'lucide-react';

export default function AttendanceWorkspace() {
  const {
    shifts = [], devices = [], events = [], dailyRecords = [], faceProfiles = [],
    isLoading, currentEmployee, activeCompanySettings, updateCompanySettings,
    recordPunch, saveShift, registerDevice, toggleDeviceStatus,
    enrollFaceProfile, revokeFaceProfile, verifyFaceProfile, submitAttendanceCorrection
  } = useAttendance();

  const { employees = [] } = useEmployee() || {};
  const { activeOperatingCompany, operatingCompanies = [], tenantRole } = useCrm() || {};

  const currentRole = (tenantRole || 'TEAM').toUpperCase();
  const isManagement = ['OWNER', 'ADMIN', 'MANAGER'].includes(currentRole);

  const [activeTab, setActiveTab] = useState('my_attendance'); // 'my_attendance' | 'shifts' | 'settings' | 'kiosk' | 'corrections' | 'face_profiles'
  const [notice, setNotice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFaceEnrollModalOpen, setIsFaceEnrollModalOpen] = useState(false);
  const [revokeTargetProfile, setRevokeTargetProfile] = useState(null);
  const [revokeReasonInput, setRevokeReasonInput] = useState('');

  // Today's Date Str (YYYY-MM-DD)
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Today's events for current employee
  const todayEvents = useMemo(() => {
    if (!currentEmployee) return [];
    return events.filter(e => {
      if (e.employee_id !== currentEmployee.id) return false;
      const eDate = new Date(e.created_at).toISOString().split('T')[0];
      return eDate === todayStr;
    }).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }, [events, currentEmployee, todayStr]);

  const firstPunch = todayEvents.length > 0 ? todayEvents[0] : null;
  const lastPunch = todayEvents.length > 1 ? todayEvents[todayEvents.length - 1] : (todayEvents.length === 1 ? todayEvents[0] : null);

  // Worked Hours calculation
  const workedHoursStr = useMemo(() => {
    if (!firstPunch) return '0h 0m';
    const end = lastPunch ? new Date(lastPunch.created_at) : new Date();
    const diffMs = end - new Date(firstPunch.created_at);
    const hrs = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hrs}h ${mins}m`;
  }, [firstPunch, lastPunch]);

  // Today's daily record for current employee
  const todayRecord = useMemo(() => {
    if (!currentEmployee) return null;
    return dailyRecords.find(r => r.employee_id === currentEmployee.id && r.attendance_date === todayStr);
  }, [dailyRecords, currentEmployee, todayStr]);

  // Punch Action Handlers
  const handleCheckIn = async () => {
    setIsSubmitting(true);
    const res = await recordPunch({
      employee_id: currentEmployee?.id,
      event_type: 'check_in',
      metadata: { verification_status: 'verified' }
    });
    setIsSubmitting(false);
    if (res.success) {
      setNotice({ type: 'success', text: 'Checked in successfully!' });
    } else {
      setNotice({ type: 'error', text: res.error });
    }
  };

  const handleCheckOut = async () => {
    setIsSubmitting(true);
    const res = await recordPunch({
      employee_id: currentEmployee?.id,
      event_type: 'check_out',
      metadata: { verification_status: 'verified' }
    });
    setIsSubmitting(false);
    if (res.success) {
      setNotice({ type: 'success', text: 'Checked out successfully!' });
    } else {
      setNotice({ type: 'error', text: res.error });
    }
  };

  // State for Modals
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [shiftForm, setShiftForm] = useState({ name: '', code: '', start_time: '09:00', end_time: '18:00', grace_minutes: 15, cross_midnight: false });

  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [deviceForm, setDeviceForm] = useState({ device_name: '', device_type: 'tablet' });

  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [correctionForm, setCorrectionForm] = useState({ attendance_date: todayStr, requested_punch_time: '09:00', reason: '' });

  // Kiosk Terminal Mode State
  const [isKioskMode, setIsKioskMode] = useState(false);
  const [kioskLookupInput, setKioskLookupInput] = useState('');
  const [kioskResolvedEmp, setKioskResolvedEmp] = useState(null);
  const [kioskStatusMsg, setKioskStatusMsg] = useState(null);

  const handleSaveShift = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await saveShift(shiftForm);
    setIsSubmitting(false);
    if (res.success) {
      setIsShiftModalOpen(false);
      setNotice({ type: 'success', text: 'Shift saved successfully!' });
    } else {
      setNotice({ type: 'error', text: res.error });
    }
  };

  const handleRegisterDevice = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await registerDevice(deviceForm);
    setIsSubmitting(false);
    if (res.success) {
      setIsDeviceModalOpen(false);
      setNotice({ type: 'success', text: 'Device registered successfully!' });
    } else {
      setNotice({ type: 'error', text: res.error });
    }
  };

  const handleSubmitCorrection = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await submitAttendanceCorrection({
      employee_id: currentEmployee?.id,
      attendance_date: correctionForm.attendance_date,
      requested_punch_time: correctionForm.requested_punch_time,
      reason: correctionForm.reason
    });
    setIsSubmitting(false);
    if (res.success) {
      setIsCorrectionModalOpen(false);
      setNotice({ type: 'success', text: 'Attendance correction request submitted for approval.' });
    } else {
      setNotice({ type: 'error', text: res.error });
    }
  };

  // Kiosk lookup handler
  const handleKioskLookup = (e) => {
    e.preventDefault();
    setKioskStatusMsg(null);
    const q = kioskLookupInput.trim().toLowerCase();
    const found = employees.find(emp =>
      (emp.mobile || '').toLowerCase() === q ||
      (emp.employee_code || '').toLowerCase() === q ||
      (emp.first_name || '').toLowerCase().includes(q)
    );

    if (found) {
      setKioskResolvedEmp(found);
    } else {
      setKioskResolvedEmp(null);
      setKioskStatusMsg({ type: 'error', text: 'No employee found matching input code/mobile.' });
    }
  };

  // Kiosk Face Verification & Punch Execution
  const handleKioskFacePunch = async (eventType) => {
    if (!kioskResolvedEmp) return;
    setIsSubmitting(true);
    setKioskStatusMsg(null);

    // Boundary check for face verification
    const faceRes = await verifyFaceProfile(kioskResolvedEmp.id);
    if (!faceRes.success && !faceRes.bypassed) {
      setKioskStatusMsg({
        type: 'error',
        text: faceRes.unconfigured
          ? `Face verification provider not configured for verified employee ${faceRes.verified_employee}.`
          : faceRes.error
      });
      setIsSubmitting(false);
      return;
    }

    // Record punch if face verification passes/bypasses
    const res = await recordPunch({
      employee_id: kioskResolvedEmp.id,
      event_type: eventType,
      metadata: { verification_status: faceRes.bypassed ? 'bypassed' : 'verified' }
    });

    setIsSubmitting(false);
    if (res.success) {
      setKioskStatusMsg({ type: 'success', text: `Punch ${eventType.replace('_', ' ')} recorded for ${kioskResolvedEmp.first_name} ${kioskResolvedEmp.last_name}!` });
      setTimeout(() => {
        setKioskResolvedEmp(null);
        setKioskLookupInput('');
        setKioskStatusMsg(null);
      }, 3000);
    } else {
      setKioskStatusMsg({ type: 'error', text: res.error });
    }
  };

  if (isKioskMode) {
    return (
      <div className="fixed inset-0 z-[200] bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-7 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-sky-500/20 text-sky-400">
                <Tablet size={24} />
              </div>
              <div>
                <h2 className="text-lg font-black">Tablet Kiosk Terminal</h2>
                <p className="text-xs text-slate-400">{activeOperatingCompany?.name || 'Registered Kiosk Mode'}</p>
              </div>
            </div>
            <button onClick={() => setIsKioskMode(false)} className="os-secondary text-xs">
              Exit Kiosk Mode
            </button>
          </div>

          {kioskStatusMsg && (
            <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
              kioskStatusMsg.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}>
              <AlertCircle size={18} />
              <span>{kioskStatusMsg.text}</span>
            </div>
          )}

          {!kioskResolvedEmp ? (
            <form onSubmit={handleKioskLookup} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-2">Identify Employee</label>
                <input
                  type="text"
                  required
                  placeholder="Enter Employee Code or Mobile Number..."
                  value={kioskLookupInput}
                  onChange={e => setKioskLookupInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-semibold text-white outline-none focus:border-sky-500"
                />
              </div>
              <button type="submit" className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3.5 rounded-2xl transition shadow-lg">
                Identify Employee
              </button>
            </form>
          ) : (
            <div className="space-y-5 text-center">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400 font-bold uppercase">Resolved Employee</div>
                <div className="text-lg font-black text-white mt-1">{kioskResolvedEmp.first_name} {kioskResolvedEmp.last_name}</div>
                <div className="text-xs text-sky-400 font-mono mt-0.5">{kioskResolvedEmp.employee_code || kioskResolvedEmp.mobile}</div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 font-medium">
                Face verification active: Resolving profile boundary...
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleKioskFacePunch('check_in')}
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg"
                >
                  <LogIn size={18} /> Check In
                </button>
                <button
                  onClick={() => handleKioskFacePunch('check_out')}
                  disabled={isSubmitting}
                  className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg"
                >
                  <LogOut size={18} /> Check Out
                </button>
              </div>

              <button onClick={() => setKioskResolvedEmp(null)} className="text-xs text-slate-400 hover:text-white font-bold">
                ← Identify Different Employee
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Revoke Face Profile from list handler
  const handleRevokeProfileFromList = async (e) => {
    e.preventDefault();
    if (!revokeTargetProfile) return;
    setIsSubmitting(true);
    const res = await revokeFaceProfile({
      employee_id: revokeTargetProfile.employee_id,
      reason: revokeReasonInput || 'Revoked by HR Administrator',
      tenant_company_id: revokeTargetProfile.tenant_company_id
    });
    setIsSubmitting(false);
    if (res.success) {
      setRevokeTargetProfile(null);
      setRevokeReasonInput('');
      setNotice({ type: 'success', text: 'Face profile revoked successfully via Supabase RPC!' });
    } else {
      setNotice({ type: 'error', text: `Revocation RPC Failed: ${res.error}` });
    }
  };

  return (
    <div className="space-y-5">
      {notice && (
        <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-between ${
          notice.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800' : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {notice.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{notice.text}</span>
          </div>
          <button onClick={() => setNotice(null)}><X size={14} /></button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('my_attendance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'my_attendance'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Clock size={14} /> My Attendance
          </button>

          <button
            onClick={() => setActiveTab('shifts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'shifts'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <CalendarCheck2 size={14} /> Shifts & Schedules
          </button>

          {isManagement && (
            <button
              onClick={() => setActiveTab('face_profiles')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'face_profiles'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <UserCheck size={14} /> Face Profiles
            </button>
          )}

          {isManagement && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Settings size={14} /> Settings
            </button>
          )}

          <button
            onClick={() => setActiveTab('kiosk')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'kiosk'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Tablet size={14} /> Kiosk Devices
          </button>

          <button
            onClick={() => setActiveTab('corrections')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'corrections'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <ShieldCheck size={14} /> Corrections
          </button>
        </div>

        <button onClick={() => setIsKioskMode(true)} className="os-secondary text-xs flex items-center gap-1.5">
          <Tablet size={14} /> Launch Kiosk Mode
        </button>
      </div>

      {/* Tab 1: My Attendance */}
      {activeTab === 'my_attendance' && (
        <div className="space-y-5">
          {/* Today's Overview Banner */}
          <div className="os-card p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 block">Today's Status</span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                  todayEvents.length > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {todayEvents.length > 0 ? (todayRecord?.status || 'Present') : 'Not Checked In'}
                </span>
                {todayRecord?.late_minutes > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200">
                    Late ({todayRecord.late_minutes}m)
                  </span>
                )}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 block">First / Last Punch</span>
              <div className="text-xs font-bold mt-1 text-slate-800 dark:text-slate-200">
                In: {firstPunch ? new Date(firstPunch.created_at).toLocaleTimeString() : '—'}
              </div>
              <div className="text-xs font-bold text-slate-500">
                Out: {lastPunch && lastPunch.id !== firstPunch?.id ? new Date(lastPunch.created_at).toLocaleTimeString() : '—'}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 block">Total Worked Time</span>
              <div className="text-lg font-black text-sky-600 dark:text-sky-400 mt-1">{workedHoursStr}</div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCheckIn}
                disabled={isSubmitting}
                className="os-primary bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1.5 text-xs py-2.5 px-4"
              >
                <LogIn size={15} /> Check In
              </button>
              <button
                onClick={handleCheckOut}
                disabled={isSubmitting || todayEvents.length === 0}
                className="os-secondary text-amber-600 dark:text-amber-400 border-amber-300 flex items-center gap-1.5 text-xs py-2.5 px-4"
              >
                <LogOut size={15} /> Check Out
              </button>
            </div>
          </div>

          {/* Today's Punch History Timeline */}
          <div className="os-card overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider">Punch Events Timeline</h3>
              <span className="text-[10px] text-slate-400">{todayEvents.length} punches today</span>
            </div>

            <div className="p-4 space-y-3">
              {todayEvents.map((evt, idx) => (
                <div key={evt.id || idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-black ${
                      evt.event_type === 'check_in' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}>
                      {evt.event_type === 'check_in' ? <LogIn size={15} /> : <LogOut size={15} />}
                    </div>
                    <div>
                      <div className="font-bold uppercase text-[11px]">{evt.event_type?.replace('_', ' ')}</div>
                      <div className="text-[10px] text-slate-400">Recorded via {evt.device_id ? 'Tablet Kiosk' : 'Mobile App'}</div>
                    </div>
                  </div>
                  <div className="font-bold text-slate-700 dark:text-slate-300">
                    {new Date(evt.created_at).toLocaleTimeString()}
                  </div>
                </div>
              ))}

              {todayEvents.length === 0 && (
                <p className="p-4 text-center text-xs italic text-slate-400">No punch events recorded today.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Shifts & Schedules */}
      {activeTab === 'shifts' && (
        <div className="space-y-4">
          {!activeCompanySettings.shiftFeatureEnabled && (
            <div className="p-3.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 text-xs font-bold flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>Shift Feature is OFF for this company. Attendance functions without mandatory shift rules.</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Shift Definitions</h3>
              <p className="text-xs text-slate-400">Configure operating company work shifts, grace minutes, and cross-midnight timing</p>
            </div>
            {isManagement && (
              <button onClick={() => { setShiftForm({ name: '', code: '', start_time: '09:00', end_time: '18:00', grace_minutes: 15, cross_midnight: false }); setIsShiftModalOpen(true); }} className="os-primary flex items-center gap-1.5 cursor-pointer">
                <Plus size={14} /> Add Shift
              </button>
            )}
          </div>

          <div className="os-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase text-slate-400 bg-slate-50 dark:bg-slate-900">
                    <th className="px-4 py-3">Shift Name</th>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Timing</th>
                    <th className="px-4 py-3">Grace</th>
                    <th className="px-4 py-3">Cross Midnight</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.map(s => (
                    <tr key={s.id} className="border-b border-slate-100 dark:border-slate-800/60">
                      <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{s.name}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{s.code}</td>
                      <td className="px-4 py-3 font-bold text-sky-600 dark:text-sky-400">{s.start_time} - {s.end_time}</td>
                      <td className="px-4 py-3">{s.grace_minutes || 15} mins</td>
                      <td className="px-4 py-3">{s.cross_midnight ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700">
                          {s.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {shifts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-xs italic text-slate-400">
                        No shift definitions configured yet. Defaulting to General Shift (09:00 - 18:00).
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Face Profiles & Enrollment (Management Only) */}
      {activeTab === 'face_profiles' && isManagement && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Face Profiles & Biometric Enrollment</h3>
              <p className="text-xs text-slate-400">Manage employee biometric face profiles & provider subject references</p>
            </div>
            <button
              onClick={() => setIsFaceEnrollModalOpen(true)}
              className="os-primary flex items-center gap-1.5 cursor-pointer bg-sky-600 hover:bg-sky-500"
            >
              <UserCheck size={14} /> Enroll Employee Face
            </button>
          </div>

          <div className="os-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase text-slate-400 bg-slate-50 dark:bg-slate-900">
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Biometric Provider</th>
                    <th className="px-4 py-3">Subject Reference</th>
                    <th className="px-4 py-3">Enrollment Status</th>
                    <th className="px-4 py-3">Enrolled Date</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {faceProfiles.map(fp => {
                    const emp = employees.find(e => e.id === fp.employee_id);
                    const empName = emp ? `${emp.first_name} ${emp.last_name}` : (fp.employee_id || 'Unknown Employee');
                    const empCode = emp?.employee_code || '';
                    const opCo = operatingCompanies.find(c => c.id === fp.tenant_company_id);
                    const statusStr = (fp.enrollment_status || 'active').toLowerCase();

                    return (
                      <tr key={fp.id} className="border-b border-slate-100 dark:border-slate-800/60">
                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">
                          <div>{empName}</div>
                          {empCode && <div className="text-[10px] font-mono text-slate-400">{empCode}</div>}
                        </td>
                        <td className="px-4 py-3 text-slate-500">{opCo?.name || 'Primary Company'}</td>
                        <td className="px-4 py-3 font-mono text-[11px] text-sky-600 dark:text-sky-400 font-bold">
                          {fp.verification_provider || 'provider_unspecified'}
                        </td>
                        <td className="px-4 py-3 font-mono text-[10px] text-slate-400">
                          {fp.provider_subject_ref || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            statusStr === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : (statusStr === 'revoked' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200')
                          }`}>
                            {statusStr}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          {fp.enrolled_at || fp.created_at ? new Date(fp.enrolled_at || fp.created_at).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {statusStr === 'active' ? (
                            <button
                              onClick={() => { setRevokeTargetProfile(fp); setRevokeReasonInput(''); }}
                              className="os-secondary text-xs text-rose-600 border-rose-200 hover:bg-rose-50 px-2.5 py-1 cursor-pointer"
                            >
                              Revoke
                            </button>
                          ) : (
                            <button
                              onClick={() => setIsFaceEnrollModalOpen(true)}
                              className="os-secondary text-xs text-sky-600 border-sky-200 hover:bg-sky-50 px-2.5 py-1 cursor-pointer"
                            >
                              Re-Enroll
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {faceProfiles.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-xs italic text-slate-400">
                        No face profiles enrolled yet. Click "Enroll Employee Face" to register a biometric profile.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Attendance Settings */}
      {activeTab === 'settings' && isManagement && (
        <div className="os-card p-5 space-y-5">
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Company Attendance Policies</h3>
            <p className="text-xs text-slate-400">Toggle operational attendance features for {activeOperatingCompany?.name || 'Current Operating Company'}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold">Attendance Module</div>
                <div className="text-[10px] text-slate-400">Enable/disable attendance tracking for company</div>
              </div>
              <input
                type="checkbox"
                checked={activeCompanySettings.attendanceEnabled}
                onChange={e => updateCompanySettings({ attendanceEnabled: e.target.checked })}
                className="h-5 w-5 rounded text-sky-500"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold">Shift Feature</div>
                <div className="text-[10px] text-slate-400">Enforce work shift rules & grace minutes</div>
              </div>
              <input
                type="checkbox"
                checked={activeCompanySettings.shiftFeatureEnabled}
                onChange={e => updateCompanySettings({ shiftFeatureEnabled: e.target.checked })}
                className="h-5 w-5 rounded text-sky-500"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold">Face Verification</div>
                <div className="text-[10px] text-slate-400">Verify employee face boundary at kiosk</div>
              </div>
              <input
                type="checkbox"
                checked={activeCompanySettings.faceVerificationEnabled}
                onChange={e => updateCompanySettings({ faceVerificationEnabled: e.target.checked })}
                className="h-5 w-5 rounded text-sky-500"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold">Mobile Attendance</div>
                <div className="text-[10px] text-slate-400">Allow employees to punch from mobile app</div>
              </div>
              <input
                type="checkbox"
                checked={activeCompanySettings.mobileAttendanceEnabled}
                onChange={e => updateCompanySettings({ mobileAttendanceEnabled: e.target.checked })}
                className="h-5 w-5 rounded text-sky-500"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold">Tablet / Kiosk Mode</div>
                <div className="text-[10px] text-slate-400">Allow punches via registered kiosk tablets</div>
              </div>
              <input
                type="checkbox"
                checked={activeCompanySettings.tabletAttendanceEnabled}
                onChange={e => updateCompanySettings({ tabletAttendanceEnabled: e.target.checked })}
                className="h-5 w-5 rounded text-sky-500"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold">Correction Approval Flow</div>
                <div className="text-[10px] text-slate-400">Require approval engine workflow for corrections</div>
              </div>
              <input
                type="checkbox"
                checked={activeCompanySettings.correctionApprovalEnabled}
                onChange={e => updateCompanySettings({ correctionApprovalEnabled: e.target.checked })}
                className="h-5 w-5 rounded text-sky-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Kiosk / Tablet Devices */}
      {activeTab === 'kiosk' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Registered Tablet Kiosks</h3>
              <p className="text-xs text-slate-400">Manage site/office kiosk devices for sandboxed attendance mode</p>
            </div>
            {isManagement && (
              <button onClick={() => { setDeviceForm({ device_name: '', device_type: 'tablet' }); setIsDeviceModalOpen(true); }} className="os-primary flex items-center gap-1.5 cursor-pointer">
                <Plus size={14} /> Register Kiosk Device
              </button>
            )}
          </div>

          <div className="os-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase text-slate-400 bg-slate-50 dark:bg-slate-900">
                    <th className="px-4 py-3">Device Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Registered Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map(d => (
                    <tr key={d.id} className="border-b border-slate-100 dark:border-slate-800/60">
                      <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{d.device_name}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500 uppercase">{d.device_type}</td>
                      <td className="px-4 py-3 text-slate-400">{new Date(d.registered_at || d.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          d.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => toggleDeviceStatus(d.id, d.status === 'active' ? 'suspended' : 'active')}
                          className="os-secondary text-xs px-2 py-1"
                        >
                          {d.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {devices.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-xs italic text-slate-400">
                        No kiosk devices registered yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Corrections */}
      {activeTab === 'corrections' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Attendance Corrections</h3>
              <p className="text-xs text-slate-400">Request attendance punch adjustments via Common Approval Engine</p>
            </div>
            <button onClick={() => { setCorrectionForm({ attendance_date: todayStr, requested_punch_time: '09:00', reason: '' }); setIsCorrectionModalOpen(true); }} className="os-primary flex items-center gap-1.5 cursor-pointer">
              <Plus size={14} /> Request Correction
            </button>
          </div>

          <div className="os-card p-5">
            <p className="text-xs text-slate-500 leading-relaxed">
              All attendance corrections are routed through the Common Approval Engine P0 (`request_type: 'attendance_correction'`). Silent edits and evidence deletions are strictly prohibited.
            </p>
          </div>
        </div>
      )}

      {/* Add Shift Modal */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase">Create Shift Definition</h3>
              <button onClick={() => setIsShiftModalOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSaveShift} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Shift Name</label>
                <input type="text" required value={shiftForm.name} onChange={e => setShiftForm({...shiftForm, name: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" placeholder="General Shift" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Start Time</label>
                  <input type="time" required value={shiftForm.start_time} onChange={e => setShiftForm({...shiftForm, start_time: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" />
                </div>
                <div>
                  <label className="font-bold block mb-1">End Time</label>
                  <input type="time" required value={shiftForm.end_time} onChange={e => setShiftForm({...shiftForm, end_time: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" />
                </div>
              </div>
              <div>
                <label className="font-bold block mb-1">Grace Minutes</label>
                <input type="number" value={shiftForm.grace_minutes} onChange={e => setShiftForm({...shiftForm, grace_minutes: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input type="checkbox" checked={shiftForm.cross_midnight} onChange={e => setShiftForm({...shiftForm, cross_midnight: e.target.checked})} className="h-4 w-4 rounded text-sky-500" />
                <label className="font-bold">Cross Midnight Shift</label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsShiftModalOpen(false)} className="os-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="os-primary">Save Shift</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Device Modal */}
      {isDeviceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase">Register Tablet Kiosk</h3>
              <button onClick={() => setIsDeviceModalOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleRegisterDevice} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Device Name / Location</label>
                <input type="text" required value={deviceForm.device_name} onChange={e => setDeviceForm({...deviceForm, device_name: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" placeholder="Head Office Main Gate Tablet" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsDeviceModalOpen(false)} className="os-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="os-primary">Register Device</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Correction Request Modal */}
      {isCorrectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase">Request Attendance Correction</h3>
              <button onClick={() => setIsCorrectionModalOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmitCorrection} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Attendance Date</label>
                <input type="date" required value={correctionForm.attendance_date} onChange={e => setCorrectionForm({...correctionForm, attendance_date: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" />
              </div>
              <div>
                <label className="font-bold block mb-1">Requested Punch Time</label>
                <input type="time" required value={correctionForm.requested_punch_time} onChange={e => setCorrectionForm({...correctionForm, requested_punch_time: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" />
              </div>
              <div>
                <label className="font-bold block mb-1">Reason for Correction</label>
                <textarea rows={3} required value={correctionForm.reason} onChange={e => setCorrectionForm({...correctionForm, reason: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" placeholder="Missed check-in punch due to site meeting..." />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsCorrectionModalOpen(false)} className="os-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="os-primary flex items-center gap-1"><Send size={13} /> Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revoke Profile Reason Modal */}
      {revokeTargetProfile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase text-rose-600 flex items-center gap-2">
                <ShieldAlert size={18} /> Revoke Face Enrollment
              </h3>
              <button onClick={() => setRevokeTargetProfile(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleRevokeProfileFromList} className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-400">
                Are you sure you want to revoke the face enrollment profile for employee <strong>{employees.find(e => e.id === revokeTargetProfile.employee_id)?.first_name || revokeTargetProfile.employee_id}</strong>? This action calls the Supabase `revoke_attendance_face_profile` RPC.
              </p>
              <div>
                <label className="font-bold block mb-1">Reason for Revocation</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Employee requested biometric profile reset..."
                  value={revokeReasonInput}
                  onChange={e => setRevokeReasonInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setRevokeTargetProfile(null)} className="os-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="os-primary bg-rose-600 hover:bg-rose-500 text-white font-bold">
                  Confirm Revoke via RPC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HR Face Enrollment Modal */}
      <FaceEnrollmentModal
        isOpen={isFaceEnrollModalOpen}
        onClose={() => setIsFaceEnrollModalOpen(false)}
        onEnrollSuccess={() => {
          setNotice({ type: 'success', text: 'Employee face profile enrolled successfully!' });
        }}
      />
    </div>
  );
}
