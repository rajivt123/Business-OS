import { useState, useMemo, useEffect } from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { useEmployee } from '../../context/EmployeeContext';
import { useCrm } from '../../context/CrmContext';
import PublicApplicationForm from './PublicApplicationForm';
import {
  Briefcase, Users, Calendar, CheckCircle2, UserCheck, Clock, Plus, Search, Filter,
  Link, Copy, Check, Eye, Edit2, ShieldAlert, Sparkles, Send, FileText, ChevronRight,
  AlertCircle, ThumbsUp, ThumbsDown, Award, MapPin, Building2, UserPlus, X, RefreshCw,
  Upload, Download
} from 'lucide-react';
import {
  listBusinessAttachments,
  createBusinessAttachmentDownloadUrl,
  uploadBusinessAttachment,
  formatBytes
} from '../../lib/storageService';

const CANDIDATE_STATUSES = [
  'Applied',
  'Shortlisted',
  'Interview Scheduled',
  'Interviewed',
  'Selected',
  'Rejected',
  'On Hold',
  'Withdrawn',
  'Employee Active'
];

const RECOMMENDATIONS = [
  'Strong Yes',
  'Yes',
  'Hold',
  'No',
  'Strong No'
];

export default function RecruitmentWorkspace() {
  const {
    jobPositions,
    candidates,
    interviews,
    onboardingRecords,
    applicationLinks,
    isLoading,
    isManagementOrAdmin,
    saveJobPosition,
    createApplicationLink,
    saveCandidate,
    updateCandidateStatus,
    saveCandidateInterview,
    createCandidateOnboarding,
    updateOnboardingStatus,
    convertCandidateToEmployee
  } = useRecruitment();

  const { departments = [], designations = [], employees = [] } = useEmployee() || {};
  const { isDarkMode, activeOperatingCompany } = useCrm() || {};

  // Internal tab state: 'dashboard' | 'positions' | 'candidates' | 'interviews' | 'onboarding'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [positionFilter, setPositionFilter] = useState('ALL');

  // Modal States
  const [isPositionModalOpen, setIsPositionModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);

  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [generatedLinkToken, setGeneratedLinkToken] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [onboardingCandidate, setOnboardingCandidate] = useState(null);
  const [onboardingMethod, setOnboardingMethod] = useState('manual');
  const [generatedOnboardingToken, setGeneratedOnboardingToken] = useState('');

  const [isPublicFormModalOpen, setIsPublicFormModalOpen] = useState(false);
  const [publicFormToken, setPublicFormToken] = useState('');

  const [noticeBanner, setNoticeBanner] = useState(null);

  // Position Form State
  const [posForm, setPosForm] = useState({
    id: null,
    title: '',
    department_id: '',
    designation_id: '',
    openings: 1,
    preferred_location: '',
    employment_type: 'Full Time',
    salary_min: '',
    salary_max: '',
    application_deadline: '',
    description: '',
    status: 'ACTIVE'
  });

  // Interview Form State
  const [interviewForm, setInterviewForm] = useState({
    id: null,
    candidate_id: '',
    interviewer_employee_id: '',
    scheduled_at: '',
    round_name: 'Technical Round 1',
    technical_rating: 3,
    communication_rating: 3,
    experience_rating: 3,
    overall_rating: 3,
    comments: '',
    recommended_position: '',
    recommended_salary: '',
    recommendation: 'Yes',
    status: 'COMPLETED'
  });

  // Conversion Form State
  const [conversionForm, setConversionForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile: '',
    department_id: '',
    designation_id: '',
    joining_date: new Date().toISOString().split('T')[0]
  });

  // Candidate Resume R2 State
  const [candidateResumeAttachment, setCandidateResumeAttachment] = useState(null);
  const [isLoadingResume, setIsLoadingResume] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  useEffect(() => {
    if (!selectedCandidate?.id) {
      setCandidateResumeAttachment(null);
      return;
    }
    let active = true;
    setIsLoadingResume(true);
    listBusinessAttachments({
      entityType: 'recruitment_candidate',
      entityId: selectedCandidate.id,
      fieldKey: 'resume'
    }).then(res => {
      if (active && res?.success && res.attachments?.length > 0) {
        setCandidateResumeAttachment(res.attachments[0]);
      } else if (active) {
        setCandidateResumeAttachment(null);
      }
    }).catch(err => {
      console.error('Failed to load candidate resume attachment:', err);
      if (active) setCandidateResumeAttachment(null);
    }).finally(() => {
      if (active) setIsLoadingResume(false);
    });
    return () => { active = false; };
  }, [selectedCandidate?.id]);

  const handleOpenCandidateResume = async (attachmentId, download = false) => {
    try {
      const res = await createBusinessAttachmentDownloadUrl({ attachmentId });
      if (res?.download_url) {
        if (download) {
          const a = document.createElement('a');
          a.href = res.download_url;
          a.download = candidateResumeAttachment?.file_name || 'Resume';
          a.target = '_blank';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else {
          window.open(res.download_url, '_blank', 'noopener,noreferrer');
        }
      } else {
        alert('Unable to generate download URL for resume.');
      }
    } catch (err) {
      console.error('Download resume error:', err);
      alert('Failed to open resume: ' + (err.message || 'Unknown error'));
    }
  };

  const handleUploadCandidateResume = async (file) => {
    if (!file || !selectedCandidate?.id) return;
    setIsUploadingResume(true);
    try {
      const res = await uploadBusinessAttachment({
        entityType: 'recruitment_candidate',
        entityId: selectedCandidate.id,
        fieldKey: 'resume',
        file
      });
      if (res?.success) {
        setCandidateResumeAttachment(res.attachment);
        alert('Candidate resume uploaded to R2 successfully!');
      } else {
        alert(res?.error || 'Failed to upload resume.');
      }
    } catch (err) {
      console.error('Upload resume error:', err);
      alert('Failed to upload resume: ' + err.message);
    } finally {
      setIsUploadingResume(false);
    }
  };

  // Dashboard Metrics
  const metrics = useMemo(() => {
    const openPositions = jobPositions.filter(p => p.status === 'ACTIVE').length;
    const totalApplications = candidates.length;
    const shortlisted = candidates.filter(c => c.status === 'Shortlisted').length;
    const interviewsCount = candidates.filter(c => c.status === 'Interview Scheduled' || c.status === 'Interviewed').length;
    const selected = candidates.filter(c => c.status === 'Selected').length;
    const onboardingPending = onboardingRecords.filter(o => o.status !== 'Approved').length;

    return { openPositions, totalApplications, shortlisted, interviewsCount, selected, onboardingPending };
  }, [jobPositions, candidates, onboardingRecords]);

  // Filtered Candidates List
  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const nameMatch = `${c.first_name || ''} ${c.last_name || ''} ${c.email || ''} ${c.mobile || ''}`
        .toLowerCase().includes(searchQuery.toLowerCase());
      const statusMatch = statusFilter === 'ALL' || c.status === statusFilter;
      const positionMatch = positionFilter === 'ALL' || c.job_position_id === positionFilter;
      return nameMatch && statusMatch && positionMatch;
    });
  }, [candidates, searchQuery, statusFilter, positionFilter]);

  // Handlers
  const handleOpenNewPosition = () => {
    setPosForm({
      id: null,
      title: '',
      department_id: '',
      designation_id: '',
      openings: 1,
      preferred_location: '',
      employment_type: 'Full Time',
      salary_min: '',
      salary_max: '',
      application_deadline: '',
      description: '',
      status: 'ACTIVE'
    });
    setEditingPosition(null);
    setIsPositionModalOpen(true);
  };

  const handleEditPosition = (pos) => {
    setPosForm({
      id: pos.id,
      title: pos.title || '',
      department_id: pos.department_id || '',
      designation_id: pos.designation_id || '',
      openings: pos.openings || 1,
      preferred_location: pos.preferred_location || '',
      employment_type: pos.employment_type || 'Full Time',
      salary_min: pos.salary_min || '',
      salary_max: pos.salary_max || '',
      application_deadline: pos.application_deadline ? pos.application_deadline.split('T')[0] : '',
      description: pos.description || '',
      status: pos.status || 'ACTIVE'
    });
    setEditingPosition(pos);
    setIsPositionModalOpen(true);
  };

  const handleSavePosition = async (e) => {
    e.preventDefault();
    const res = await saveJobPosition(posForm);
    if (res.success) {
      setIsPositionModalOpen(false);
      setNoticeBanner({ type: 'success', text: 'Job Position saved successfully.' });
    } else {
      setNoticeBanner({ type: 'error', text: res.error });
    }
  };

  const handleGenerateLink = async (posId) => {
    const res = await createApplicationLink(posId);
    if (res.success) {
      const fullUrl = `${window.location.origin}${window.location.pathname}?apply_token=${res.rawToken}`;
      setGeneratedLinkToken(fullUrl);
      setCopiedLink(false);
      setIsLinkModalOpen(true);
    } else {
      setNoticeBanner({ type: 'error', text: res.error });
    }
  };

  const handleOpenInterviewModal = (candidate) => {
    setInterviewForm({
      id: null,
      candidate_id: candidate.id,
      interviewer_employee_id: employees[0]?.id || '',
      scheduled_at: new Date().toISOString().slice(0, 16),
      round_name: 'Technical Round 1',
      technical_rating: 4,
      communication_rating: 4,
      experience_rating: 4,
      overall_rating: 4,
      comments: '',
      recommended_position: candidate.job_position_id || '',
      recommended_salary: candidate.expected_ctc || '',
      recommendation: 'Yes',
      status: 'COMPLETED'
    });
    setSelectedCandidate(candidate);
    setIsInterviewModalOpen(true);
  };

  const handleSaveInterview = async (e) => {
    e.preventDefault();
    const res = await saveCandidateInterview(interviewForm);
    if (res.success) {
      await updateCandidateStatus(interviewForm.candidate_id, 'Interviewed');
      setIsInterviewModalOpen(false);
      setNoticeBanner({ type: 'success', text: 'Interview evaluation recorded successfully.' });
    } else {
      setNoticeBanner({ type: 'error', text: res.error });
    }
  };

  const handleStartOnboarding = async (candidate, method = 'manual') => {
    setOnboardingCandidate(candidate);
    setOnboardingMethod(method);

    const res = await createCandidateOnboarding(candidate.id, method);
    if (res.success) {
      if (method === 'link' && res.rawToken) {
        const linkUrl = `${window.location.origin}${window.location.pathname}?onboard_token=${res.rawToken}`;
        setGeneratedOnboardingToken(linkUrl);
      }
      setIsOnboardingModalOpen(true);
      setNoticeBanner({ type: 'success', text: 'Candidate marked Selected and Onboarding initiated.' });
    } else {
      setNoticeBanner({ type: 'error', text: res.error });
    }
  };

  const handleConvertCandidate = async (cand, onboardingRecord) => {
    setConversionForm({
      first_name: cand.first_name || '',
      last_name: cand.last_name || '',
      email: cand.email || '',
      mobile: cand.mobile || '',
      department_id: cand.department_id || '',
      designation_id: '',
      joining_date: new Date().toISOString().split('T')[0]
    });
    setSelectedCandidate(cand);
    // Execute conversion directly
    const res = await convertCandidateToEmployee(cand.id, onboardingRecord?.id, {
      first_name: cand.first_name,
      last_name: cand.last_name,
      email: cand.email,
      mobile: cand.mobile,
      department_id: cand.department_id,
      joining_date: new Date().toISOString().split('T')[0]
    });
    if (res.success) {
      setNoticeBanner({ type: 'success', text: 'Candidate converted to Active Employee successfully.' });
    } else {
      setNoticeBanner({ type: 'error', text: res.error });
    }
  };

  return (
    <div className="space-y-5">
      {/* Notice Banner */}
      {noticeBanner && (
        <div className={`p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between transition ${
          noticeBanner.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
            : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {noticeBanner.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{noticeBanner.text}</span>
          </div>
          <button onClick={() => setNoticeBanner(null)} className="opacity-70 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Permission Warning Banner */}
      {!isManagementOrAdmin && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300">
          <ShieldAlert size={16} />
          <span>Read-Only View: Only Management or Admin roles can create job positions, evaluate interviews, or approve candidate onboarding.</span>
        </div>
      )}

      {/* Primary Sub-Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Sparkles size={14} /> Dashboard
        </button>
        <button
          onClick={() => setActiveTab('positions')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'positions'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Briefcase size={14} /> Job Positions ({metrics.openPositions})
        </button>
        <button
          onClick={() => setActiveTab('candidates')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'candidates'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Users size={14} /> Candidate Pipeline ({metrics.totalApplications})
        </button>
        <button
          onClick={() => setActiveTab('interviews')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'interviews'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Calendar size={14} /> Interviews ({interviews.length})
        </button>
        <button
          onClick={() => setActiveTab('onboarding')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'onboarding'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <UserCheck size={14} /> Onboarding & Approvals ({metrics.onboardingPending})
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODULE 1: DASHBOARD */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'dashboard' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="os-card p-4">
              <div className="flex items-center justify-between">
                <div className="h-8 w-8 rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300 flex items-center justify-center">
                  <Briefcase size={16} />
                </div>
              </div>
              <div className="mt-3 text-2xl font-black">{metrics.openPositions}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Open Positions</div>
            </div>

            <div className="os-card p-4">
              <div className="flex items-center justify-between">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300 flex items-center justify-center">
                  <Users size={16} />
                </div>
              </div>
              <div className="mt-3 text-2xl font-black">{metrics.totalApplications}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Total Applications</div>
            </div>

            <div className="os-card p-4">
              <div className="flex items-center justify-between">
                <div className="h-8 w-8 rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300 flex items-center justify-center">
                  <Award size={16} />
                </div>
              </div>
              <div className="mt-3 text-2xl font-black">{metrics.shortlisted}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Shortlisted</div>
            </div>

            <div className="os-card p-4">
              <div className="flex items-center justify-between">
                <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300 flex items-center justify-center">
                  <Calendar size={16} />
                </div>
              </div>
              <div className="mt-3 text-2xl font-black">{metrics.interviewsCount}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Interviews</div>
            </div>

            <div className="os-card p-4">
              <div className="flex items-center justify-between">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300 flex items-center justify-center">
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <div className="mt-3 text-2xl font-black">{metrics.selected}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Selected</div>
            </div>

            <div className="os-card p-4">
              <div className="flex items-center justify-between">
                <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300 flex items-center justify-center">
                  <UserCheck size={16} />
                </div>
              </div>
              <div className="mt-3 text-2xl font-black">{metrics.onboardingPending}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Onboarding Pending</div>
            </div>
          </div>

          {/* Quick Actions & Recent Candidates */}
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 os-card overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider">Recent Candidate Applications</h3>
                <button onClick={() => setActiveTab('candidates')} className="os-link text-xs">
                  View All Candidates <ChevronRight size={13} />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[9px] font-black uppercase text-slate-400">
                      <th className="px-4 py-2.5">Candidate Name</th>
                      <th className="px-4 py-2.5">Position</th>
                      <th className="px-4 py-2.5">Mobile / Email</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5">Applied Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.slice(0, 5).map(c => {
                      const pos = jobPositions.find(p => p.id === c.job_position_id);
                      return (
                        <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition text-xs font-semibold border-b border-slate-100 dark:border-slate-800/60">
                          <td className="px-4 py-3 font-bold">{c.first_name} {c.last_name}</td>
                          <td className="px-4 py-3">{pos?.title || 'General Application'}</td>
                          <td className="px-4 py-3">{c.mobile || c.email}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
                              {c.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-400">{new Date(c.created_at).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                    {candidates.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-4 text-xs italic text-slate-400 text-center">
                          No candidate applications recorded yet for this company context.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="os-card p-4 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider mb-2">Recruitment Actions</h3>
              {isManagementOrAdmin && (
                <button onClick={handleOpenNewPosition} className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:border-sky-400 transition">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-sky-500 text-white flex items-center justify-center">
                      <Plus size={14} />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Create Job Position</div>
                      <div className="text-[10px] text-slate-400">Add opening for company</div>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-400" />
                </button>
              )}

              <button onClick={() => { setPublicFormToken(''); setIsPublicFormModalOpen(true); }} className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:border-sky-400 transition">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-indigo-500 text-white flex items-center justify-center">
                    <FileText size={14} />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Preview Public Application</div>
                    <div className="text-[10px] text-slate-400">Test candidate submission portal</div>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODULE 2: JOB POSITIONS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'positions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xs font-black uppercase tracking-wider">Company Job Openings</h3>
            {isManagementOrAdmin && (
              <button onClick={handleOpenNewPosition} className="os-primary flex items-center gap-1.5 cursor-pointer">
                <Plus size={14} /> Post New Position
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobPositions.map(pos => {
              const dept = departments.find(d => d.id === pos.department_id);
              const desig = designations.find(d => d.id === pos.designation_id);
              const candCount = candidates.filter(c => c.job_position_id === pos.id).length;

              return (
                <div key={pos.id} className="os-card p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">{pos.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{dept?.name || 'General Department'} · {desig?.name || 'General Designation'}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        pos.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {pos.status}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-slate-400" />
                        <span>Location: {pos.preferred_location || 'Not Specified'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users size={13} className="text-slate-400" />
                        <span>Openings: <b>{pos.openings}</b> | Applied: <b>{candCount}</b></span>
                      </div>
                      {pos.salary_min && pos.salary_max && (
                        <div className="flex items-center gap-1.5">
                          <Award size={13} className="text-slate-400" />
                          <span>Salary Range: ₹{pos.salary_min.toLocaleString()} - ₹{pos.salary_max.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button onClick={() => handleGenerateLink(pos.id)} className="os-secondary text-xs flex items-center gap-1 py-1 px-2.5">
                      <Link size={12} /> Share Application Link
                    </button>
                    {isManagementOrAdmin && (
                      <button onClick={() => handleEditPosition(pos)} className="os-secondary text-xs p-1.5">
                        <Edit2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {jobPositions.length === 0 && (
              <div className="col-span-full p-8 text-center os-card italic text-xs text-slate-400">
                No job positions created for this operating company yet. Click "Post New Position" to begin.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODULE 3: CANDIDATE MANAGEMENT */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'candidates' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 os-card p-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidate name, email, mobile..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-bold"
              >
                <option value="ALL">All Statuses</option>
                {CANDIDATE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <select
                value={positionFilter}
                onChange={e => setPositionFilter(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-bold"
              >
                <option value="ALL">All Positions</option>
                {jobPositions.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
          </div>

          {/* Candidate Table */}
          <div className="os-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase text-slate-400">
                    <th className="px-4 py-3">Candidate</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Position</th>
                    <th className="px-4 py-3">Experience</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.map(cand => {
                    const pos = jobPositions.find(p => p.id === cand.job_position_id);
                    return (
                      <tr key={cand.id} className="border-b border-slate-100 dark:border-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition text-xs">
                        <td className="px-4 py-3 font-bold">
                          <div>{cand.first_name} {cand.last_name}</div>
                          <div className="text-[10px] text-slate-400">{cand.highest_qualification || 'Degree Not Specified'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div>{cand.mobile}</div>
                          <div className="text-[10px] text-slate-400">{cand.email}</div>
                        </td>
                        <td className="px-4 py-3 font-semibold">{pos?.title || 'General'}</td>
                        <td className="px-4 py-3">{cand.notice_period_days ? `${cand.notice_period_days} Days Notice` : 'Immediate'}</td>
                        <td className="px-4 py-3">
                          <select
                            disabled={!isManagementOrAdmin}
                            value={cand.status}
                            onChange={e => updateCandidateStatus(cand.id, e.target.value)}
                            className="text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer"
                          >
                            {CANDIDATE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-right space-x-1">
                          <button
                            onClick={() => { setSelectedCandidate(cand); setIsCandidateModalOpen(true); }}
                            className="os-secondary text-xs px-2 py-1"
                          >
                            <Eye size={12} /> Detail
                          </button>
                          {isManagementOrAdmin && (
                            <button
                              onClick={() => handleOpenInterviewModal(cand)}
                              className="os-secondary text-xs px-2 py-1"
                            >
                              <Calendar size={12} /> Interview
                            </button>
                          )}
                          {isManagementOrAdmin && cand.status !== 'Selected' && cand.status !== 'Employee Active' && (
                            <button
                              onClick={() => handleStartOnboarding(cand, 'manual')}
                              className="os-primary text-xs px-2 py-1"
                            >
                              Select & Onboard
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredCandidates.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-xs italic text-slate-400">
                        No candidates match your current filter parameters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODULE 4: INTERVIEWS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'interviews' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider">Candidate Interview Evaluations</h3>
          </div>

          <div className="os-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase text-slate-400">
                    <th className="px-4 py-3">Candidate</th>
                    <th className="px-4 py-3">Round</th>
                    <th className="px-4 py-3">Ratings (Tech / Comm / Exp / Overall)</th>
                    <th className="px-4 py-3">Recommendation</th>
                    <th className="px-4 py-3">Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {interviews.map(inv => {
                    const cand = candidates.find(c => c.id === inv.candidate_id);
                    return (
                      <tr key={inv.id} className="border-b border-slate-100 dark:border-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition text-xs font-semibold">
                        <td className="px-4 py-3 font-bold">{cand ? `${cand.first_name} ${cand.last_name}` : 'Unknown Candidate'}</td>
                        <td className="px-4 py-3">{inv.round_name}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          T: {inv.technical_rating}/5 | C: {inv.communication_rating}/5 | E: {inv.experience_rating}/5 | <b>O: {inv.overall_rating}/5</b>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black ${
                            inv.recommendation.includes('Yes') ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                          }`}>
                            {inv.recommendation}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{inv.comments || 'No comments'}</td>
                      </tr>
                    );
                  })}
                  {interviews.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-xs italic text-slate-400">
                        No candidate interview evaluations recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODULE 5: ONBOARDING & APPROVALS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'onboarding' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider">Candidate Onboarding Lifecycle</h3>
          </div>

          <div className="os-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase text-slate-400">
                    <th className="px-4 py-3">Candidate</th>
                    <th className="px-4 py-3">Onboarding Lifecycle Status</th>
                    <th className="px-4 py-3">Employee Conversion Status</th>
                    <th className="px-4 py-3 text-right">HR Action</th>
                  </tr>
                </thead>
                <tbody>
                  {onboardingRecords.map(ob => {
                    const cand = candidates.find(c => c.id === ob.candidate_id);
                    return (
                      <tr key={ob.id} className="border-b border-slate-100 dark:border-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition text-xs">
                        <td className="px-4 py-3 font-bold">
                          <div>{cand ? `${cand.first_name} ${cand.last_name}` : 'Selected Candidate'}</div>
                          <div className="text-[10px] text-slate-400">{cand?.mobile}</div>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            disabled={!isManagementOrAdmin || ob.status === 'Approved'}
                            value={ob.status}
                            onChange={e => updateOnboardingStatus(ob.id, e.target.value)}
                            className="text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                          >
                            <option value="onboarding_pending">Onboarding Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Submitted">Submitted</option>
                            <option value="HR Verification">HR Verification</option>
                            <option value="Approved">Approved</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          {ob.employee_id ? (
                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                              <CheckCircle2 size={13} /> Converted (ID: {ob.employee_id.slice(0, 8)}...)
                            </span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400 font-bold">
                              Pending Employee Record
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isManagementOrAdmin && !ob.employee_id && cand && (
                            <button
                              onClick={() => handleConvertCandidate(cand, ob)}
                              className="os-primary text-xs px-2.5 py-1"
                            >
                              <UserPlus size={13} /> Approve & Convert to Employee
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {onboardingRecords.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-xs italic text-slate-400">
                        No candidate onboarding records currently active.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODALS */}
      {/* ------------------------------------------------------------- */}

      {/* 1. Job Position Modal */}
      {isPositionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase">{editingPosition ? 'Edit Job Position' : 'Create Job Position'}</h3>
              <button onClick={() => setIsPositionModalOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSavePosition} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Position Title *</label>
                <input required type="text" value={posForm.title} onChange={e => setPosForm({...posForm, title: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" placeholder="e.g. Senior Site Supervisor" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Department</label>
                  <select value={posForm.department_id} onChange={e => setPosForm({...posForm, department_id: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Designation</label>
                  <select value={posForm.designation_id} onChange={e => setPosForm({...posForm, designation_id: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                    <option value="">Select Designation</option>
                    {designations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold block mb-1">Openings</label>
                  <input type="number" value={posForm.openings} onChange={e => setPosForm({...posForm, openings: parseInt(e.target.value, 10)})} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" />
                </div>
                <div>
                  <label className="font-bold block mb-1">Employment Type</label>
                  <select value={posForm.employment_type} onChange={e => setPosForm({...posForm, employment_type: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                    <option value="Full Time">Full Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Part Time">Part Time</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Preferred Location</label>
                  <input type="text" value={posForm.preferred_location} onChange={e => setPosForm({...posForm, preferred_location: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" placeholder="Head Office / Site A" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Salary Min (₹)</label>
                  <input type="number" value={posForm.salary_min} onChange={e => setPosForm({...posForm, salary_min: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" />
                </div>
                <div>
                  <label className="font-bold block mb-1">Salary Max (₹)</label>
                  <input type="number" value={posForm.salary_max} onChange={e => setPosForm({...posForm, salary_max: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" />
                </div>
              </div>
              <div>
                <label className="font-bold block mb-1">Job Description</label>
                <textarea rows={3} value={posForm.description} onChange={e => setPosForm({...posForm, description: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" placeholder="Responsibilities and qualifications..." />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsPositionModalOpen(false)} className="os-secondary">Cancel</button>
                <button type="submit" className="os-primary">Save Position</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Generated Public Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase flex items-center gap-1.5 text-emerald-600">
                <Link size={16} /> Generated Application Link
              </h3>
              <button onClick={() => setIsLinkModalOpen(false)}><X size={16} /></button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Share this secure public application link with candidates. The token is hashed with SHA-256 in the database.
            </p>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono break-all flex items-center justify-between gap-2">
              <span className="truncate">{generatedLinkToken}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedLinkToken);
                  setCopiedLink(true);
                }}
                className="os-primary text-xs shrink-0"
              >
                {copiedLink ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setIsLinkModalOpen(false)} className="os-primary">Done</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Candidate Detail Modal */}
      {isCandidateModalOpen && selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black">{selectedCandidate.first_name} {selectedCandidate.last_name}</h3>
                <p className="text-xs text-slate-400">{selectedCandidate.mobile} · {selectedCandidate.email}</p>
              </div>
              <button onClick={() => setIsCandidateModalOpen(false)}><X size={16} /></button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Employer</span>
                <span className="font-bold">{selectedCandidate.current_company || 'N/A'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Current / Expected CTC</span>
                <span className="font-bold">₹{selectedCandidate.current_ctc || 0} / ₹{selectedCandidate.expected_ctc || 0}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Notice Period</span>
                <span className="font-bold">{selectedCandidate.notice_period_days || 0} Days</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Highest Qualification</span>
                <span className="font-bold">{selectedCandidate.highest_qualification || 'N/A'}</span>
              </div>
            </div>

            {/* Candidate Resume: Universal R2 + Legacy Fallback */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FileText size={14} className="text-sky-500" /> Candidate Resume
                </span>
                {candidateResumeAttachment ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenCandidateResume(candidateResumeAttachment.id, false)}
                      className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1"
                    >
                      <Eye size={12} /> Preview R2
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenCandidateResume(candidateResumeAttachment.id, true)}
                      className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:underline flex items-center gap-1"
                    >
                      <Download size={12} /> Download
                    </button>
                  </div>
                ) : selectedCandidate.resume_url ? (
                  <a
                    href={selectedCandidate.resume_url}
                    target="_blank"
                    rel="noreferrer"
                    className="os-link flex items-center gap-1 font-bold text-xs"
                  >
                    <FileText size={13} /> Open Legacy Resume
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-400">No resume attached</span>
                )}
              </div>

              {candidateResumeAttachment && (
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  File: <span className="font-medium text-slate-800 dark:text-slate-200">{candidateResumeAttachment.file_name}</span> ({formatBytes(candidateResumeAttachment.file_size_bytes)})
                </div>
              )}

              <div className="pt-1 flex items-center gap-2">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 shadow-sm transition">
                  <Upload size={12} />
                  <span>{isUploadingResume ? 'Uploading to R2...' : candidateResumeAttachment ? 'Replace Resume (R2)' : 'Upload Resume (R2)'}</span>
                  <input
                    type="file"
                    className="hidden"
                    disabled={isUploadingResume}
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleUploadCandidateResume(e.target.files[0]);
                        e.target.value = '';
                      }
                    }}
                  />
                </label>
                {isLoadingResume && <span className="text-[10px] text-slate-400">Checking R2 storage...</span>}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button onClick={() => setIsCandidateModalOpen(false)} className="os-primary">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Interview Scheduler Modal */}
      {isInterviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase">Candidate Interview Evaluation</h3>
              <button onClick={() => setIsInterviewModalOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSaveInterview} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Round Name</label>
                  <input type="text" value={interviewForm.round_name} onChange={e => setInterviewForm({...interviewForm, round_name: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" />
                </div>
                <div>
                  <label className="font-bold block mb-1">Interviewer Employee</label>
                  <select value={interviewForm.interviewer_employee_id} onChange={e => setInterviewForm({...interviewForm, interviewer_employee_id: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                    <option value="">Select Employee</option>
                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                {['technical_rating', 'communication_rating', 'experience_rating', 'overall_rating'].map(field => (
                  <div key={field} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <label className="text-[9px] font-black uppercase block text-slate-400 mb-1">{field.replace('_rating', '')}</label>
                    <input type="number" min="1" max="5" value={interviewForm[field]} onChange={e => setInterviewForm({...interviewForm, [field]: parseInt(e.target.value, 10)})} className="w-full text-center p-1 rounded font-bold" />
                  </div>
                ))}
              </div>
              <div>
                <label className="font-bold block mb-1">Recommendation</label>
                <select value={interviewForm.recommendation} onChange={e => setInterviewForm({...interviewForm, recommendation: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold">
                  {RECOMMENDATIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="font-bold block mb-1">Interviewer Comments</label>
                <textarea rows={3} value={interviewForm.comments} onChange={e => setInterviewForm({...interviewForm, comments: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" placeholder="Strengths, weaknesses, technical domain knowledge..." />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsInterviewModalOpen(false)} className="os-secondary">Cancel</button>
                <button type="submit" className="os-primary">Save Evaluation</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Preview Public Application Modal */}
      {isPublicFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl my-8">
            <PublicApplicationForm token={publicFormToken} onClose={() => setIsPublicFormModalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
