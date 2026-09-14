import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { useEmployee } from '../../context/EmployeeContext';
import { useCrm } from '../../context/CrmContext';
import {
  UserCheck, Camera, ShieldAlert, ShieldCheck, AlertCircle, CheckCircle2,
  X, Search, RefreshCw, Building2, Lock, Sparkles, ArrowRight, User
} from 'lucide-react';

export default function FaceEnrollmentModal({ isOpen, onClose, onEnrollSuccess }) {
  const {
    faceProfiles = [],
    enrollFaceProfile,
    revokeFaceProfile,
    activeCompanySettings
  } = useAttendance();

  const { employees = [] } = useEmployee() || {};
  const { operatingCompanies = [], activeOperatingCompany } = useCrm() || {};

  // Form State
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [isIdentityConfirmed, setIsIdentityConfirmed] = useState(false);
  const [revocationReason, setRevocationReason] = useState('');
  const [showRevokePrompt, setShowRevokePrompt] = useState(false);

  // Camera & Capture State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedFrame, setCapturedFrame] = useState(null);
  const [qualityCheck, setQualityCheck] = useState(null); // { pass: boolean, brightness: number, message: string }
  const [providerSubjectRefInput, setProviderSubjectRefInput] = useState('');
  const [customProviderInput, setCustomProviderInput] = useState('');

  // Status & Loading State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusNotice, setStatusNotice] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  // Default company setup
  useEffect(() => {
    if (activeOperatingCompany?.id) {
      setSelectedCompanyId(activeOperatingCompany.id);
    } else if (operatingCompanies.length > 0) {
      setSelectedCompanyId(operatingCompanies[0].id);
    }
  }, [activeOperatingCompany, operatingCompanies]);

  // Clean up camera stream on unmount or close
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Filter employees by operating company and search query
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      if (selectedCompanyId && emp.tenant_company_id && emp.tenant_company_id !== selectedCompanyId) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase();
      const code = (emp.employee_code || '').toLowerCase();
      const desig = (emp.designation || emp.job_title || '').toLowerCase();
      const dept = (emp.department || '').toLowerCase();
      return fullName.includes(q) || code.includes(q) || desig.includes(q) || dept.includes(q);
    });
  }, [employees, selectedCompanyId, searchQuery]);

  // Selected Employee object
  const selectedEmployee = useMemo(() => {
    return employees.find(e => e.id === selectedEmpId) || null;
  }, [employees, selectedEmpId]);

  // Selected Employee's existing face profile
  const existingProfile = useMemo(() => {
    if (!selectedEmpId) return null;
    return faceProfiles.find(fp => fp.employee_id === selectedEmpId && fp.enrollment_status === 'active') ||
           faceProfiles.find(fp => fp.employee_id === selectedEmpId) || null;
  }, [faceProfiles, selectedEmpId]);

  // Start Camera Feed
  const handleStartCamera = async () => {
    setStatusNotice(null);
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera access error:', err);
      setStatusNotice({
        type: 'error',
        text: `Camera Access Error: ${err.message}. Please check browser camera permissions.`
      });
    }
  };

  // Capture Image & Perform Browser Quality Check
  const handleCaptureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedFrame(dataUrl);

    // Browser-side quality check (sample pixel brightness/contrast)
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let totalBrightness = 0;
    const pixels = imgData.data;
    for (let i = 0; i < pixels.length; i += 16) { // sample every 4th pixel
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      totalBrightness += (r + g + b) / 3;
    }
    const avgBrightness = Math.round(totalBrightness / (pixels.length / 16));

    let checkPass = true;
    let checkMsg = 'Quality Check Passed: Good lighting and resolution.';

    if (avgBrightness < 40) {
      checkPass = false;
      checkMsg = 'Quality Check Failed: Lighting too dark. Please ensure face is well illuminated.';
    } else if (avgBrightness > 220) {
      checkPass = false;
      checkMsg = 'Quality Check Failed: Image overexposed. Reduce direct bright light source.';
    }

    setQualityCheck({ pass: checkPass, brightness: avgBrightness, message: checkMsg });
  };

  // Handle Revoke Existing Profile
  const handleRevokeExisting = async () => {
    if (!selectedEmpId) return;
    setIsSubmitting(true);
    setStatusNotice(null);

    const res = await revokeFaceProfile({
      employee_id: selectedEmpId,
      reason: revocationReason || 'Revoked prior to re-enrollment',
      tenant_company_id: selectedCompanyId
    });

    setIsSubmitting(false);
    if (res.success) {
      setShowRevokePrompt(false);
      setStatusNotice({ type: 'success', text: 'Existing face profile revoked successfully. You may now proceed with re-enrollment.' });
    } else {
      setStatusNotice({ type: 'error', text: `Revocation Failed: ${res.error}` });
    }
  };

  // Handle Final Enrollment Submission via Supabase RPC
  const handleSubmitEnrollment = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) {
      setStatusNotice({ type: 'error', text: 'Please select an employee.' });
      return;
    }
    if (!isIdentityConfirmed) {
      setStatusNotice({ type: 'error', text: 'You must explicitly confirm employee identity before enrolling.' });
      return;
    }

    // Configured Biometric Verification Provider Check
    const configuredProvider = activeCompanySettings?.verificationProvider || customProviderInput.trim();
    if (!configuredProvider) {
      setStatusNotice({
        type: 'error',
        text: 'Biometric Provider Unconfigured: No verified biometric provider is configured for this company. Biometric enrollment cannot be completed without a registered provider.'
      });
      return;
    }

    const subjectRef = providerSubjectRefInput.trim();
    if (!subjectRef) {
      setStatusNotice({
        type: 'error',
        text: 'Biometric Provider Reference Missing: Please enter or provide the provider subject reference returned by the biometric provider.'
      });
      return;
    }

    setIsSubmitting(true);
    setStatusNotice(null);

    const res = await enrollFaceProfile({
      employee_id: selectedEmployee.id,
      verification_provider: configuredProvider,
      provider_subject_ref: subjectRef,
      tenant_company_id: selectedCompanyId
    });

    setIsSubmitting(false);
    if (res.success) {
      stopCamera();
      setStatusNotice({ type: 'success', text: `Face Profile enrolled successfully for ${selectedEmployee.first_name} ${selectedEmployee.last_name}!` });
      if (onEnrollSuccess) onEnrollSuccess(res.data);
      setTimeout(() => {
        handleCloseModal();
      }, 2000);
    } else {
      setStatusNotice({ type: 'error', text: `Enrollment RPC Rejected: ${res.error}` });
    }
  };

  const handleCloseModal = () => {
    stopCamera();
    setSelectedEmpId('');
    setIsIdentityConfirmed(false);
    setCapturedFrame(null);
    setQualityCheck(null);
    setStatusNotice(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="p-5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-500 dark:bg-sky-500/20 dark:text-sky-400">
              <UserCheck size={22} />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-slate-100">HR Face Profile Enrollment</h2>
              <p className="text-xs text-slate-400">Administrative biometric enrollment & provider subject binding</p>
            </div>
          </div>
          <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl transition">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Status Notice */}
          {statusNotice && (
            <div className={`p-4 rounded-2xl text-xs font-bold flex items-start gap-3 ${
              statusNotice.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800' : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800'
            }`}>
              {statusNotice.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
              <span className="leading-relaxed">{statusNotice.text}</span>
            </div>
          )}

          {/* Step 1: Select Operating Company & Search Employee */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                Operating Company
              </label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3 top-3 text-slate-400" />
                <select
                  value={selectedCompanyId}
                  onChange={e => { setSelectedCompanyId(e.target.value); setSelectedEmpId(''); setIsIdentityConfirmed(false); }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-sky-500"
                >
                  <option value="">All Operating Companies</option>
                  {operatingCompanies.map(co => (
                    <option key={co.id} value={co.id}>{co.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                Search Employee
              </label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by code, name, designation..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Employee Dropdown Selection */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-500 dark:text-slate-400 mb-1.5">
              Select Target Employee ({filteredEmployees.length} available)
            </label>
            <select
              value={selectedEmpId}
              onChange={e => { setSelectedEmpId(e.target.value); setIsIdentityConfirmed(false); setCapturedFrame(null); setQualityCheck(null); }}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-sky-500"
            >
              <option value="">-- Choose Employee for Face Enrollment --</option>
              {filteredEmployees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.employee_code ? `[${emp.employee_code}] ` : ''}{emp.first_name} {emp.last_name} - {emp.designation || emp.job_title || 'Staff'} ({emp.status || 'Active'})
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Employee Identity Card & Enrollment Guard */}
          {selectedEmployee && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-400 block">Target Employee Identity</span>
                  <h3 className="text-base font-black text-slate-900 dark:text-slate-100 mt-0.5">
                    {selectedEmployee.first_name} {selectedEmployee.last_name}
                  </h3>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                  (selectedEmployee.status || '').toLowerCase() === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                  {selectedEmployee.status || 'Active'}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Employee Code</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{selectedEmployee.employee_code || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Company</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {operatingCompanies.find(c => c.id === (selectedEmployee.tenant_company_id || selectedCompanyId))?.name || 'Primary Company'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Department / Role</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{selectedEmployee.department || selectedEmployee.designation || 'Staff'}</span>
                </div>
              </div>

              {/* Existing Active Profile Guard */}
              {existingProfile && (
                <div className="mt-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertCircle size={16} className="text-amber-500" />
                    <span>Existing Face Profile Registered</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300/90">
                    This employee already has an active profile (Status: <strong>{existingProfile.enrollment_status || 'active'}</strong>, Provider: <strong>{existingProfile.verification_provider}</strong>, Enrolled: <strong>{new Date(existingProfile.enrolled_at || existingProfile.created_at).toLocaleDateString()}</strong>).
                    To prevent silent overwrites, you must revoke the active profile before re-enrolling.
                  </p>
                  {!showRevokePrompt ? (
                    <button
                      onClick={() => setShowRevokePrompt(true)}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold transition flex items-center gap-1.5 mt-1"
                    >
                      <ShieldAlert size={14} /> Revoke Active Profile Before Re-enrollment
                    </button>
                  ) : (
                    <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 space-y-2.5 mt-2">
                      <label className="block text-[10px] font-black uppercase text-slate-500">Reason for Revocation</label>
                      <input
                        type="text"
                        placeholder="e.g. Re-enrollment due to updated biometric template..."
                        value={revocationReason}
                        onChange={e => setRevocationReason(e.target.value)}
                        className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      />
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setShowRevokePrompt(false)} className="px-2.5 py-1 text-[11px] font-bold text-slate-500">Cancel</button>
                        <button
                          onClick={handleRevokeExisting}
                          disabled={isSubmitting}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold transition"
                        >
                          Confirm Revocation via RPC
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Identity Confirmation Requirement */}
              {!existingProfile && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={isIdentityConfirmed}
                      onChange={e => setIsIdentityConfirmed(e.target.checked)}
                      className="h-4 w-4 rounded text-sky-500 focus:ring-sky-500 cursor-pointer"
                    />
                    <span>I explicitly confirm that I have verified the identity of {selectedEmployee.first_name} {selectedEmployee.last_name}.</span>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Camera Interface & Quality Checks */}
          {selectedEmployee && !existingProfile && isIdentityConfirmed && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Camera Feed & Quality Verification</h4>
                  <p className="text-[11px] text-slate-400">Capture face frame for biometric provider input</p>
                </div>
                {!isCameraActive ? (
                  <button onClick={handleStartCamera} className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm">
                    <Camera size={14} /> Open Camera
                  </button>
                ) : (
                  <button onClick={handleCaptureFrame} className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm">
                    <Camera size={14} /> Capture Frame Snapshot
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Live Camera Stream */}
                <div className="relative aspect-video rounded-xl bg-slate-900 overflow-hidden border border-slate-800 flex items-center justify-center">
                  <video ref={videoRef} playsInline muted className={`w-full h-full object-cover ${!isCameraActive ? 'hidden' : ''}`} />
                  {!isCameraActive && (
                    <div className="text-center p-4 text-slate-500 text-xs">
                      <Camera size={32} className="mx-auto mb-2 opacity-40" />
                      <span>Click "Open Camera" to activate webcam feed</span>
                    </div>
                  )}
                  <canvas ref={canvasRef} className="hidden" />
                </div>

                {/* Captured Frame Preview & Quality Results */}
                <div className="relative aspect-video rounded-xl bg-slate-900 overflow-hidden border border-slate-800 flex items-center justify-center">
                  {capturedFrame ? (
                    <img src={capturedFrame} alt="Captured face frame" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4 text-slate-500 text-xs">
                      <User size={32} className="mx-auto mb-2 opacity-40" />
                      <span>Captured frame preview will appear here</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quality Check Indicator */}
              {qualityCheck && (
                <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  qualityCheck.pass ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {qualityCheck.pass ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{qualityCheck.message} (Sample Brightness Index: {qualityCheck.brightness})</span>
                </div>
              )}

              {/* Step 5: Biometric Verification Provider Configuration */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">Biometric Verification Provider Details</h4>

                {!activeCompanySettings?.verificationProvider && !customProviderInput && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2">
                    <ShieldAlert size={16} className="shrink-0" />
                    <span>Biometric Provider Unconfigured: No default provider configured in company settings. Please specify the provider identifier below.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Verification Provider Identifier</label>
                    <input
                      type="text"
                      placeholder="e.g. aws_rekognition, azure_face, custom_biometric_v1"
                      value={customProviderInput || activeCompanySettings?.verificationProvider || ''}
                      onChange={e => setCustomProviderInput(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Provider Subject Reference Token</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. sub-rekognition-xyz-987456"
                      value={providerSubjectRefInput}
                      onChange={e => setProviderSubjectRefInput(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={handleCloseModal} className="os-secondary text-xs px-4 py-2.5">
              Cancel
            </button>
            <button
              onClick={handleSubmitEnrollment}
              disabled={isSubmitting || !selectedEmployee || !isIdentityConfirmed || existingProfile}
              className="os-primary bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-xs px-5 py-2.5 flex items-center gap-2 shadow-lg"
            >
              {isSubmitting ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
              Call Supabase RPC Enroll
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
