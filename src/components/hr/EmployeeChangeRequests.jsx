import { useState, useMemo } from 'react';
import { useApproval } from '../../context/ApprovalContext';
import { useEmployee } from '../../context/EmployeeContext';
import { useCrm } from '../../context/CrmContext';
import {
  FileText, Plus, UserCheck, AlertCircle, CheckCircle2, Clock, X, Send, RotateCcw, Ban, ChevronRight
} from 'lucide-react';

export default function EmployeeChangeRequests({ targetEmployee = null, onClose = null }) {
  const { requests, requestSteps, requestActions, createAndSubmitRequest, resubmitRequest, withdrawRequest } = useApproval();
  const { employees, employeeFieldDefinitions = [], employeeFieldConfigurations = [] } = useEmployee() || {};
  const { currentUser, session } = useCrm() || {};

  const authUserId = session?.user?.id || currentUser?.id;

  // Determine subject employee: targetEmployee or authenticated user's linked employee
  const currentEmployee = useMemo(() => {
    if (targetEmployee) return targetEmployee;
    return employees.find(e => e.user_id === authUserId || e.email === currentUser?.email) || employees[0] || null;
  }, [targetEmployee, employees, authUserId, currentUser]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [noticeBanner, setNoticeBanner] = useState(null);
  const [selectedReqDetail, setSelectedReqDetail] = useState(null);

  // Field change form state
  const [formFields, setFormFields] = useState({
    mobile: currentEmployee?.mobile || '',
    email: currentEmployee?.email || '',
    address: currentEmployee?.address || '',
    emergency_contact: currentEmployee?.emergency_contact || '',
    marital_status: currentEmployee?.marital_status || 'Single',
    reason: ''
  });

  const [resubmitPayload, setResubmitPayload] = useState({});
  const [resubmitReqId, setResubmitReqId] = useState(null);

  // Filter requests pertaining to subject employee or requested by user
  const myRequests = useMemo(() => {
    if (!currentEmployee) return [];
    return requests.filter(r => r.subject_employee_id === currentEmployee.id || r.requested_by === authUserId);
  }, [requests, currentEmployee, authUserId]);

  const handleOpenCreateModal = () => {
    if (!currentEmployee) {
      setNoticeBanner({ type: 'error', text: 'No active employee profile linked to current user.' });
      return;
    }
    setFormFields({
      mobile: currentEmployee.mobile || '',
      email: currentEmployee.email || '',
      address: currentEmployee.address || '',
      emergency_contact: currentEmployee.emergency_contact || '',
      marital_status: currentEmployee.marital_status || 'Single',
      reason: ''
    });
    setIsCreateModalOpen(true);
  };

  const handleSubmitChangeRequest = async (e) => {
    e.preventDefault();
    if (!currentEmployee) return;

    // Build payload of changed fields
    const payload = {};
    const snapshot = {};

    if (formFields.mobile !== currentEmployee.mobile) {
      payload.mobile = formFields.mobile;
      snapshot.mobile = currentEmployee.mobile || '';
    }
    if (formFields.email !== currentEmployee.email) {
      payload.email = formFields.email;
      snapshot.email = currentEmployee.email || '';
    }
    if (formFields.address !== currentEmployee.address) {
      payload.address = formFields.address;
      snapshot.address = currentEmployee.address || '';
    }
    if (formFields.emergency_contact !== currentEmployee.emergency_contact) {
      payload.emergency_contact = formFields.emergency_contact;
      snapshot.emergency_contact = currentEmployee.emergency_contact || '';
    }
    if (formFields.marital_status !== currentEmployee.marital_status) {
      payload.marital_status = formFields.marital_status;
      snapshot.marital_status = currentEmployee.marital_status || 'Single';
    }

    if (Object.keys(payload).length === 0) {
      setNoticeBanner({ type: 'error', text: 'Please modify at least one field to request a change.' });
      return;
    }

    const res = await createAndSubmitRequest({
      request_type: 'employee_change',
      subject_employee_id: currentEmployee.id,
      entity_type: 'employee',
      entity_id: currentEmployee.id,
      title: `Profile Update for ${currentEmployee.first_name} ${currentEmployee.last_name}`,
      description: formFields.reason || 'Requested updates to personal profile information.',
      payload,
      current_snapshot: snapshot,
      priority: 'normal'
    });

    if (res.success) {
      setIsCreateModalOpen(false);
      setNoticeBanner({ type: 'success', text: `Change request ${res.request.request_number} submitted for approval.` });
    } else {
      setNoticeBanner({ type: 'error', text: res.error });
    }
  };

  const handleWithdraw = async (reqId) => {
    const res = await withdrawRequest(reqId);
    if (res.success) {
      setNoticeBanner({ type: 'success', text: 'Request withdrawn successfully.' });
    } else {
      setNoticeBanner({ type: 'error', text: res.error });
    }
  };

  const handleResubmit = async (e) => {
    e.preventDefault();
    if (!resubmitReqId) return;
    const res = await resubmitRequest(resubmitReqId, resubmitPayload);
    if (res.success) {
      setResubmitReqId(null);
      setNoticeBanner({ type: 'success', text: 'Request resubmitted successfully for approval.' });
    } else {
      setNoticeBanner({ type: 'error', text: res.error });
    }
  };

  return (
    <div className="space-y-4">
      {noticeBanner && (
        <div className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between ${
          noticeBanner.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800' : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {noticeBanner.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            <span>{noticeBanner.text}</span>
          </div>
          <button onClick={() => setNoticeBanner(null)}><X size={14} /></button>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Employee Change Requests</h3>
          <p className="text-xs text-slate-400">Submit requests for profile modifications requiring management approval</p>
        </div>
        <button onClick={handleOpenCreateModal} className="os-primary flex items-center gap-1.5 cursor-pointer">
          <Plus size={14} /> Request Profile Change
        </button>
      </div>

      {/* Requests History List */}
      <div className="os-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase text-slate-400">
                <th className="px-4 py-3">Request #</th>
                <th className="px-4 py-3">Title & Description</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Submitted Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {myRequests.map(req => {
                const reqPayload = typeof req.payload === 'string' ? JSON.parse(req.payload) : req.payload;
                return (
                  <tr key={req.id} className="border-b border-slate-100 dark:border-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition text-xs">
                    <td className="px-4 py-3 font-bold text-sky-600 dark:text-sky-400">{req.request_number}</td>
                    <td className="px-4 py-3 font-semibold">
                      <div>{req.title}</div>
                      <div className="text-[10px] text-slate-400">Fields: {Object.keys(reqPayload || {}).join(', ')}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        req.status === 'applied' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' :
                        req.status === 'approved' ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300' :
                        req.status === 'pending_approval' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' :
                        req.status === 'returned' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300' :
                        req.status === 'cancelled' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' :
                        'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{new Date(req.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <button onClick={() => setSelectedReqDetail(req)} className="os-secondary text-xs px-2 py-1">
                        Details
                      </button>
                      {req.status === 'returned' && (
                        <button onClick={() => { setResubmitReqId(req.id); setResubmitPayload(reqPayload); }} className="os-primary text-xs px-2 py-1">
                          <RotateCcw size={12} /> Correct & Resubmit
                        </button>
                      )}
                      {['pending_approval', 'returned', 'submitted'].includes(req.status) && (
                        <button onClick={() => handleWithdraw(req.id)} className="os-secondary text-xs px-2 py-1 text-rose-600">
                          <Ban size={12} /> Withdraw
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {myRequests.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-xs italic text-slate-400">
                    No change requests submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase">Request Employee Profile Change</h3>
              <button onClick={() => setIsCreateModalOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmitChangeRequest} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Mobile Number</label>
                  <input type="tel" value={formFields.mobile} onChange={e => setFormFields({...formFields, mobile: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" />
                </div>
                <div>
                  <label className="font-bold block mb-1">Personal Email</label>
                  <input type="email" value={formFields.email} onChange={e => setFormFields({...formFields, email: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" />
                </div>
              </div>
              <div>
                <label className="font-bold block mb-1">Residential Address</label>
                <input type="text" value={formFields.address} onChange={e => setFormFields({...formFields, address: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Emergency Contact</label>
                  <input type="text" value={formFields.emergency_contact} onChange={e => setFormFields({...formFields, emergency_contact: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" placeholder="Name & Phone" />
                </div>
                <div>
                  <label className="font-bold block mb-1">Marital Status</label>
                  <select value={formFields.marital_status} onChange={e => setFormFields({...formFields, marital_status: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-bold block mb-1">Reason for Request</label>
                <textarea rows={2} value={formFields.reason} onChange={e => setFormFields({...formFields, reason: e.target.value})} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800" placeholder="Reason for updating details..." />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="os-secondary">Cancel</button>
                <button type="submit" className="os-primary flex items-center gap-1"><Send size={13} /> Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedReqDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase">Request Details: {selectedReqDetail.request_number}</h3>
              <button onClick={() => setSelectedReqDetail(null)}><X size={16} /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Status</span>
                  <span className="font-bold">{selectedReqDetail.status}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Submitted On</span>
                  <span className="font-bold">{new Date(selectedReqDetail.created_at).toLocaleString()}</span>
                </div>
              </div>
              <div>
                <h4 className="font-bold mb-1">Requested Payload:</h4>
                <pre className="p-2.5 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto">
                  {JSON.stringify(typeof selectedReqDetail.payload === 'string' ? JSON.parse(selectedReqDetail.payload) : selectedReqDetail.payload, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="font-bold mb-1">Snapshot at Submission:</h4>
                <pre className="p-2.5 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto">
                  {JSON.stringify(typeof selectedReqDetail.current_snapshot === 'string' ? JSON.parse(selectedReqDetail.current_snapshot) : selectedReqDetail.current_snapshot, null, 2)}
                </pre>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedReqDetail(null)} className="os-primary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
