import { useState } from 'react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { Send, CheckCircle2, AlertCircle, FileText, Briefcase, User, MapPin, Building2, Calendar, ShieldCheck, X } from 'lucide-react';

export default function PublicApplicationForm({ token, positionTitle = '', onClose = null }) {
  const { submitPublicApplication } = useRecruitment();

  const [formData, setFormData] = useState({
    p_token: token || '',
    p_first_name: '',
    p_middle_name: '',
    p_last_name: '',
    p_mobile: '',
    p_email: '',
    p_address: '',
    p_city: '',
    p_state: '',
    p_pin: '',
    p_position_applied: positionTitle || '',
    p_preferred_location: '',
    p_total_experience_years: '',
    p_relevant_experience_years: '',
    p_current_company: '',
    p_current_ctc: '',
    p_expected_ctc: '',
    p_notice_period_days: '',
    p_highest_qualification: '',
    p_resume_url: '',
    p_willing_to_relocate: false,
    p_source: 'Public Application Link',
    p_availability_date: '',
    p_consent_given: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorBanner, setErrorBanner] = useState('');

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorBanner('');

    if (!formData.p_first_name.trim()) {
      setErrorBanner('First Name is required.');
      return;
    }
    if (!formData.p_mobile.trim()) {
      setErrorBanner('Mobile Number is required.');
      return;
    }
    if (!formData.p_consent_given) {
      setErrorBanner('You must provide consent to process your application.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        p_total_experience_years: formData.p_total_experience_years ? parseFloat(formData.p_total_experience_years) : 0,
        p_relevant_experience_years: formData.p_relevant_experience_years ? parseFloat(formData.p_relevant_experience_years) : 0,
        p_current_ctc: formData.p_current_ctc ? parseFloat(formData.p_current_ctc) : 0,
        p_expected_ctc: formData.p_expected_ctc ? parseFloat(formData.p_expected_ctc) : 0,
        p_notice_period_days: formData.p_notice_period_days ? parseInt(formData.p_notice_period_days, 10) : 0,
        p_availability_date: formData.p_availability_date || null,
        p_resume_url: formData.p_resume_url || null
      };

      const res = await submitPublicApplication(payload);
      if (res.success) {
        setSuccess(true);
      } else {
        setErrorBanner(res.error || 'Failed to submit application. Link may be invalid or expired.');
      }
    } catch (err) {
      setErrorBanner(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto p-6 my-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center dark:bg-emerald-950/40 dark:border-emerald-800">
        <div className="h-16 w-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-xl font-black text-emerald-900 dark:text-emerald-200">Application Submitted Successfully!</h2>
        <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-2">
          Thank you for applying. Our recruitment team will review your candidate profile and get in touch with you shortly.
        </p>
        {onClose && (
          <button onClick={onClose} className="mt-6 os-primary">
            Close Form
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 rounded-2xl bg-white border border-slate-200 shadow-xl dark:bg-slate-900 dark:border-slate-800">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-sky-500 text-white flex items-center justify-center">
            <Briefcase size={20} />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-800 dark:text-slate-100">Job Application Portal</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {positionTitle ? `Applying for: ${positionTitle}` : 'Fill in your professional candidate details'}
            </p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500">
            <X size={18} />
          </button>
        )}
      </div>

      {errorBanner && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300">
          <AlertCircle size={16} />
          <span>{errorBanner}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Personal Details */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <User size={13} /> Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.p_first_name}
                onChange={e => handleChange('p_first_name', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                placeholder="John"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Middle Name</label>
              <input
                type="text"
                value={formData.p_middle_name}
                onChange={e => handleChange('p_middle_name', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                placeholder="M."
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Last Name</label>
              <input
                type="text"
                value={formData.p_last_name}
                onChange={e => handleChange('p_last_name', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                placeholder="Doe"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Mobile Number *</label>
              <input
                type="tel"
                required
                value={formData.p_mobile}
                onChange={e => handleChange('p_mobile', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                placeholder="+91 9876543210"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Email Address</label>
              <input
                type="email"
                value={formData.p_email}
                onChange={e => handleChange('p_email', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Position Applied</label>
              <input
                type="text"
                value={formData.p_position_applied}
                onChange={e => handleChange('p_position_applied', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                placeholder="e.g. Senior Site Engineer"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <MapPin size={13} /> Address & Location
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Address</label>
              <input
                type="text"
                value={formData.p_address}
                onChange={e => handleChange('p_address', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                placeholder="Flat / Street address"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">City</label>
              <input
                type="text"
                value={formData.p_city}
                onChange={e => handleChange('p_city', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                placeholder="City"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">State & PIN</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={formData.p_state}
                  onChange={e => handleChange('p_state', e.target.value)}
                  className="w-2/3 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  placeholder="State"
                />
                <input
                  type="text"
                  value={formData.p_pin}
                  onChange={e => handleChange('p_pin', e.target.value)}
                  className="w-1/3 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  placeholder="PIN"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Experience & Professional Details */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Building2 size={13} /> Professional Experience & Compensation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Total Experience (Years)</label>
              <input
                type="number"
                step="0.5"
                value={formData.p_total_experience_years}
                onChange={e => handleChange('p_total_experience_years', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                placeholder="5"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Relevant Experience</label>
              <input
                type="number"
                step="0.5"
                value={formData.p_relevant_experience_years}
                onChange={e => handleChange('p_relevant_experience_years', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                placeholder="3"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Current Company</label>
              <input
                type="text"
                value={formData.p_current_company}
                onChange={e => handleChange('p_current_company', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                placeholder="Current Employer"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Highest Qualification</label>
              <input
                type="text"
                value={formData.p_highest_qualification}
                onChange={e => handleChange('p_highest_qualification', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                placeholder="B.Tech / MBA"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Current CTC (₹)</label>
              <input
                type="number"
                value={formData.p_current_ctc}
                onChange={e => handleChange('p_current_ctc', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                placeholder="600000"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Expected CTC (₹)</label>
              <input
                type="number"
                value={formData.p_expected_ctc}
                onChange={e => handleChange('p_expected_ctc', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                placeholder="800000"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Notice Period (Days)</label>
              <input
                type="number"
                value={formData.p_notice_period_days}
                onChange={e => handleChange('p_notice_period_days', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                placeholder="30"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Preferred Location</label>
              <input
                type="text"
                value={formData.p_preferred_location}
                onChange={e => handleChange('p_preferred_location', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                placeholder="Head Office / Site A"
              />
            </div>
          </div>
        </div>

        {/* Resume & Preferences */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <FileText size={13} /> Resume & Availability
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Resume Link (Google Drive / Dropbox / Cloud URL)</label>
              <input
                type="url"
                value={formData.p_resume_url}
                onChange={e => handleChange('p_resume_url', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                placeholder="https://drive.google.com/..."
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Earliest Availability Date</label>
              <input
                type="date"
                value={formData.p_availability_date}
                onChange={e => handleChange('p_availability_date', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.p_willing_to_relocate}
                onChange={e => handleChange('p_willing_to_relocate', e.target.checked)}
                className="rounded text-sky-500"
              />
              Willing to relocate if required
            </label>
          </div>
        </div>

        {/* Consent & Declaration */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <label className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
            <input
              type="checkbox"
              required
              checked={formData.p_consent_given}
              onChange={e => handleChange('p_consent_given', e.target.checked)}
              className="mt-0.5 rounded text-sky-500"
            />
            <span>
              I declare that all the information provided above is true and accurate. I consent to the operating company processing my candidate application for recruitment purposes. *
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          {onClose && (
            <button type="button" onClick={onClose} className="os-secondary">
              Cancel
            </button>
          )}
          <button type="submit" disabled={isSubmitting} className="os-primary flex items-center gap-1.5">
            <Send size={14} />
            <span>{isSubmitting ? 'Submitting...' : 'Submit Application'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
