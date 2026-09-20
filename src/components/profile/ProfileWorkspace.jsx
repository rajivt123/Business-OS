import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, Briefcase, Building2, Shield, Clock, Globe,
  Calendar, KeyRound, Check, X, RefreshCw, AlertTriangle, CheckCircle2,
  Lock, ArrowLeft, Eye, EyeOff, Save, UserCheck, ShieldCheck, Sparkles
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import { supabase } from '../../lib/supabase';

const TIMEZONE_OPTIONS = [
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST, UTC+05:30)' },
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'America/New_York (EST, UTC-05:00)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST, UTC-08:00)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET, UTC+01:00)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST, UTC+04:00)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT, UTC+08:00)' },
];

const LOCALE_OPTIONS = [
  { value: 'en-IN', label: 'English (India) - en-IN' },
  { value: 'en-US', label: 'English (United States) - en-US' },
  { value: 'en-GB', label: 'English (United Kingdom) - en-GB' },
  { value: 'hi-IN', label: 'Hindi (India) - hi-IN' },
];

export default function ProfileWorkspace({ onNavigate }) {
  const {
    myProfile,
    myProfileMembership,
    isMyProfileLoading,
    myProfileError,
    fetchMyProfile,
    updateMyProfile,
    currentUser,
    isDarkMode
  } = useCrm();

  // Edit Profile Form State
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');

  const [form, setForm] = useState({
    display_name: '',
    full_name: '',
    phone: '',
    job_title: '',
    department: '',
    timezone: 'Asia/Kolkata',
    locale: 'en-IN',
    avatar_url: ''
  });

  // Security / Change Password Form State
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');

  // Sync form with loaded profile data
  useEffect(() => {
    if (myProfile) {
      setForm({
        display_name: myProfile.display_name || '',
        full_name: myProfile.full_name || '',
        phone: myProfile.phone || '',
        job_title: myProfile.job_title || '',
        department: myProfile.department || '',
        timezone: myProfile.timezone || 'Asia/Kolkata',
        locale: myProfile.locale || 'en-IN',
        avatar_url: myProfile.avatar_url || ''
      });
    }
  }, [myProfile]);

  const handleStartEdit = () => {
    setSaveSuccessMsg('');
    setSaveErrorMsg('');
    if (myProfile) {
      setForm({
        display_name: myProfile.display_name || '',
        full_name: myProfile.full_name || '',
        phone: myProfile.phone || '',
        job_title: myProfile.job_title || '',
        department: myProfile.department || '',
        timezone: myProfile.timezone || 'Asia/Kolkata',
        locale: myProfile.locale || 'en-IN',
        avatar_url: myProfile.avatar_url || ''
      });
    }
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSaveErrorMsg('');
    setSaveSuccessMsg('');
    if (myProfile) {
      setForm({
        display_name: myProfile.display_name || '',
        full_name: myProfile.full_name || '',
        phone: myProfile.phone || '',
        job_title: myProfile.job_title || '',
        department: myProfile.department || '',
        timezone: myProfile.timezone || 'Asia/Kolkata',
        locale: myProfile.locale || 'en-IN',
        avatar_url: myProfile.avatar_url || ''
      });
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg('');
    setSaveErrorMsg('');

    const payload = {
      display_name: form.display_name.trim(),
      full_name: form.full_name.trim(),
      phone: form.phone.trim(),
      job_title: form.job_title.trim(),
      department: form.department.trim(),
      timezone: form.timezone,
      locale: form.locale,
      avatar_url: form.avatar_url.trim()
    };

    const res = await updateMyProfile(payload);
    setIsSaving(false);
    if (res.success) {
      setSaveSuccessMsg('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } else {
      setSaveErrorMsg(res.error || 'Failed to update profile.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccessMsg('');
    setPasswordErrorMsg('');

    const { newPassword, confirmPassword } = passwordForm;

    if (!newPassword || newPassword.length < 6) {
      setPasswordErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg('New password and confirm password do not match.');
      return;
    }

    setIsChangingPassword(true);

    try {
      const { data, error } = await supabase.auth.updateUser({ password: newPassword });
      setIsChangingPassword(false);

      if (error) {
        setPasswordErrorMsg(error.message || 'Failed to update password.');
      } else {
        setPasswordSuccessMsg('Password updated successfully!');
        setPasswordForm({ newPassword: '', confirmPassword: '' });
        setTimeout(() => setPasswordSuccessMsg(''), 4000);
      }
    } catch (err) {
      setIsChangingPassword(false);
      setPasswordErrorMsg(err?.message || 'An unexpected error occurred while updating password.');
    }
  };

  const getInitials = () => {
    const name = myProfile?.display_name || myProfile?.full_name || currentUser?.email || 'User';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Action Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onNavigate && (
            <button
              onClick={() => onNavigate('dashboard')}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Back to Dashboard"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Workspace</span>
            </button>
          )}
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>My Profile</span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                Account Settings
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage your identity, personal details, work role and security preferences.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              onClick={handleStartEdit}
              disabled={isMyProfileLoading || !!myProfileError}
              className="os-primary flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <UserCheck size={15} />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="os-secondary cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="os-primary flex items-center gap-1.5 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Global Alerts */}
      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2.5">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {saveErrorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center gap-2.5">
          <AlertTriangle size={18} className="shrink-0" />
          <span>{saveErrorMsg}</span>
        </div>
      )}

      {/* Explicit RPC Load Error State with Retry Button */}
      {myProfileError && (
        <div className="os-card p-6 border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="text-sm font-black text-rose-900 dark:text-rose-200">Failed to load user profile</h3>
              <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                {myProfileError}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Authoritative profile RPC (<code>get_my_profile_atomic</code>) returned an error. Please click Retry below to re-fetch profile data.
              </p>
              <div className="pt-2">
                <button
                  onClick={fetchMyProfile}
                  disabled={isMyProfileLoading}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={14} className={isMyProfileLoading ? 'animate-spin' : ''} />
                  <span>{isMyProfileLoading ? 'Retrying...' : 'Retry Profile Load'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isMyProfileLoading && !myProfile && !myProfileError && (
        <div className="space-y-4 animate-pulse">
          <div className="h-32 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          <div className="grid md:grid-cols-2 gap-4">
            <div className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      )}

      {/* Profile Main Content */}
      {myProfile && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Avatar & Summary */}
          <div className="space-y-6">
            <div className="os-card p-6 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="relative mb-4">
                {form.avatar_url || myProfile.avatar_url ? (
                  <img
                    src={form.avatar_url || myProfile.avatar_url}
                    alt="Avatar"
                    className="w-24 h-24 rounded-3xl object-cover border-4 border-white dark:border-slate-800 shadow-xl"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-sky-500/20 border-4 border-white dark:border-slate-800">
                    {getInitials()}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white" title="Active Account">
                  <Check size={12} />
                </div>
              </div>

              <h2 className="text-base font-black text-slate-900 dark:text-white">
                {myProfile.display_name || myProfile.full_name || 'No Name Set'}
              </h2>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                {myProfile.job_title || 'No Job Title'} {myProfile.department ? `· ${myProfile.department}` : ''}
              </p>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                  Role: {myProfileMembership?.tenant_role || myProfile.role || 'MEMBER'}
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Status: {myProfileMembership?.membership_status || 'ACTIVE'}
                </span>
              </div>

              <div className="w-full border-t border-slate-200/80 dark:border-slate-800 my-5" />

              <div className="w-full space-y-3 text-left text-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5"><Mail size={14} className="text-sky-500" /> Email</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200 truncate max-w-[170px]" title={myProfile.email}>{myProfile.email}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5"><Phone size={14} className="text-indigo-500" /> Phone</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">{myProfile.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5"><Building2 size={14} className="text-amber-500" /> Tenant</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200 truncate max-w-[170px]">{myProfileMembership?.tenant_name || 'Organization'}</span>
                </div>
              </div>
            </div>

            {/* Account Info Card */}
            <div className="os-card p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-3">
                <Calendar size={16} className="text-sky-500" />
                <h3 className="text-xs font-black uppercase tracking-wider">Account Information</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Account Created Date</label>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                    {formatDate(myProfile.created_at)}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">User ID / Identity</label>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 font-mono text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {myProfile.id}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Forms & Details */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Personal Information Card */}
              <div className="os-card p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-sky-500" />
                    <h3 className="text-xs font-black uppercase tracking-wider">Personal Information</h3>
                  </div>
                  {isEditing && (
                    <span className="text-[10px] font-bold uppercase text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">Editing</span>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                      Display Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={form.display_name}
                      onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                      placeholder="e.g. Rajiv Kumar"
                      className={`w-full rounded-xl p-3 outline-none text-xs font-medium border transition ${
                        isEditing
                          ? 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 focus:border-sky-500 text-slate-900 dark:text-white'
                          : 'bg-slate-100/60 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 cursor-not-allowed'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      placeholder="e.g. Rajiv Kumar Sharma"
                      className={`w-full rounded-xl p-3 outline-none text-xs font-medium border transition ${
                        isEditing
                          ? 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 focus:border-sky-500 text-slate-900 dark:text-white'
                          : 'bg-slate-100/60 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 cursor-not-allowed'
                      }`}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                        Email Address
                      </label>
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Lock size={10} /> Read-only
                      </span>
                    </div>
                    <input
                      type="email"
                      readOnly
                      disabled
                      value={myProfile.email || ''}
                      className="w-full rounded-xl p-3 text-xs font-medium border bg-slate-100 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      disabled={!isEditing}
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                      className={`w-full rounded-xl p-3 outline-none text-xs font-medium border transition ${
                        isEditing
                          ? 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 focus:border-sky-500 text-slate-900 dark:text-white'
                          : 'bg-slate-100/60 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 cursor-not-allowed'
                      }`}
                    />
                  </div>

                  {isEditing && (
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                        Avatar Image URL
                      </label>
                      <input
                        type="url"
                        value={form.avatar_url}
                        onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full rounded-xl p-3 outline-none text-xs font-medium border bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 focus:border-sky-500 text-slate-900 dark:text-white"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Work Information Card */}
              <div className="os-card p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Briefcase size={16} className="text-indigo-500" />
                    <h3 className="text-xs font-black uppercase tracking-wider">Work Information</h3>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                      Job Title
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={form.job_title}
                      onChange={(e) => setForm({ ...form, job_title: e.target.value })}
                      placeholder="e.g. Senior Project Manager"
                      className={`w-full rounded-xl p-3 outline-none text-xs font-medium border transition ${
                        isEditing
                          ? 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 focus:border-sky-500 text-slate-900 dark:text-white'
                          : 'bg-slate-100/60 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 cursor-not-allowed'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                      Department
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      placeholder="e.g. Engineering & Fire Systems"
                      className={`w-full rounded-xl p-3 outline-none text-xs font-medium border transition ${
                        isEditing
                          ? 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 focus:border-sky-500 text-slate-900 dark:text-white'
                          : 'bg-slate-100/60 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 cursor-not-allowed'
                      }`}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                        Tenant / Organization
                      </label>
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Lock size={10} /> Read-only
                      </span>
                    </div>
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={myProfileMembership?.tenant_name || 'Organization'}
                      className="w-full rounded-xl p-3 text-xs font-medium border bg-slate-100 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                        Tenant Role & Membership Status
                      </label>
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Lock size={10} /> Read-only
                      </span>
                    </div>
                    <div className="p-3 rounded-xl border bg-slate-100 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300">
                        {myProfileMembership?.tenant_role || myProfile.role || 'MEMBER'}
                      </span>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        {myProfileMembership?.membership_status || 'ACTIVE'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferences Card */}
              <div className="os-card p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-amber-500" />
                    <h3 className="text-xs font-black uppercase tracking-wider">Regional Preferences</h3>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                      Timezone
                    </label>
                    <select
                      disabled={!isEditing}
                      value={form.timezone}
                      onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                      className={`w-full rounded-xl p-3 outline-none text-xs font-medium border transition ${
                        isEditing
                          ? 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 focus:border-sky-500 text-slate-900 dark:text-white cursor-pointer'
                          : 'bg-slate-100/60 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 cursor-not-allowed'
                      }`}
                    >
                      {TIMEZONE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                      Locale
                    </label>
                    <select
                      disabled={!isEditing}
                      value={form.locale}
                      onChange={(e) => setForm({ ...form, locale: e.target.value })}
                      className={`w-full rounded-xl p-3 outline-none text-xs font-medium border transition ${
                        isEditing
                          ? 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 focus:border-sky-500 text-slate-900 dark:text-white cursor-pointer'
                          : 'bg-slate-100/60 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 cursor-not-allowed'
                      }`}
                    >
                      {LOCALE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Form Action Controls inside Edit mode */}
              {isEditing && (
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="os-secondary cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="os-primary flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>

            {/* Security Section Card */}
            <div className="os-card p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-3">
                <ShieldCheck size={16} className="text-emerald-500" />
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider">Account Security</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Update your account password securely via Supabase Auth</p>
                </div>
              </div>

              {passwordSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>{passwordSuccessMsg}</span>
                </div>
              )}

              {passwordErrorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{passwordErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 pt-1">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                      New Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        placeholder="Min 6 characters"
                        className="w-full rounded-xl pl-3 pr-10 py-3 outline-none text-xs font-medium border bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 focus:border-sky-500 text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                      Confirm New Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        placeholder="Re-enter new password"
                        className="w-full rounded-xl pl-3 pr-10 py-3 outline-none text-xs font-medium border bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 focus:border-sky-500 text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    {isChangingPassword ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound size={14} />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
