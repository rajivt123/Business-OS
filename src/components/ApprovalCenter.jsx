import React, { useState, useMemo } from 'react';
import { useApproval } from '../context/ApprovalContext';
import { useCrm, getUserDisplayName } from '../context/CrmContext';
import { useEmployee } from '../context/EmployeeContext';
import {
  ClipboardCheck, Clock, CheckCircle2, XCircle, RotateCcw, Ban, AlertTriangle,
  FileText, User, ChevronRight, Eye, Check, X, Send, ShieldAlert, SlidersHorizontal, Search
} from 'lucide-react';

export default function ApprovalCenter() {
  const {
    requests = [], requestSteps = [], requestActions = [],
    approveStep, returnStep, rejectStep, withdrawRequest, isApprovalLoading
  } = useApproval() || {};
  const { currentUser, session, tenantRole, activeOperatingCompany, profiles = [], tenantMembers = [] } = useCrm() || {};
  const { employees = [] } = useEmployee() || {};

  const authUserId = session?.user?.id || currentUser?.id;
  const currentRole = (tenantRole || 'TEAM').toUpperCase();

  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'my_requests' | 'approved' | 'rejected' | 'returned'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionModal, setActionModal] = useState(null); // { type: 'approve' | 'return' | 'reject', request }
  const [commentText, setCommentText] = useState('');
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to resolve employee name
  const resolveEmployeeName = (empId) => {
    if (!empId) return 'N/A';
    const emp = employees.find(e => e.id === empId);
    if (emp) return `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.employee_code;
    return empId;
  };

  // Filter requests by active company
  const companyScopedRequests = useMemo(() => {
    if (!activeOperatingCompany?.id) return requests;
    return requests.filter(r => !r.tenant_company_id || r.tenant_company_id === activeOperatingCompany.id);
  }, [requests, activeOperatingCompany]);

  // Tab categorization logic
  const pendingApprovals = useMemo(() => {
    return companyScopedRequests.filter(r => {
      if (!['pending_approval', 'submitted'].includes(r.status)) return false;
      // Get current active step
      const steps = requestSteps.filter(s => s.request_id === r.id);
      const currentStep = steps.find(s => s.step_order === r.current_step_order);
      if (!currentStep) return true; // Default visible if step details pending

      // Check if user is approver by role or explicit ID
      if (currentStep.approver_type === 'role') {
        if (currentStep.approver_role === currentRole) return true;
        if (['OWNER', 'ADMIN'].includes(currentRole)) return true;
      }
      return false;
    });
  }, [companyScopedRequests, requestSteps, currentRole]);

  const myRequests = useMemo(() => {
    return companyScopedRequests.filter(r => r.requested_by === authUserId);
  }, [companyScopedRequests, authUserId]);

  const approvedRequests = useMemo(() => {
    return companyScopedRequests.filter(r => ['approved', 'applied'].includes(r.status));
  }, [companyScopedRequests]);

  const rejectedRequests = useMemo(() => {
    return companyScopedRequests.filter(r => r.status === 'rejected');
  }, [companyScopedRequests]);

  const returnedRequests = useMemo(() => {
    return companyScopedRequests.filter(r => r.status === 'returned');
  }, [companyScopedRequests]);

  // Current display list based on tab
  const displayedRequests = useMemo(() => {
    let list = [];
    if (activeTab === 'pending') list = pendingApprovals;
    else if (activeTab === 'my_requests') list = myRequests;
    else if (activeTab === 'approved') list = approvedRequests;
    else if (activeTab === 'rejected') list = rejectedRequests;
    else if (activeTab === 'returned') list = returnedRequests;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r =>
        (r.request_number || '').toLowerCase().includes(q) ||
        (r.title || '').toLowerCase().includes(q) ||
        (r.request_type || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeTab, pendingApprovals, myRequests, approvedRequests, rejectedRequests, returnedRequests, searchQuery]);

  // Maker-Checker Check
  const checkMakerChecker = (request) => {
    if (!request) return { isMaker: false, reason: '' };

    // Find subject employee's linked_user_id / user_id if available
    const subjectEmp = employees.find(e => e.id === request.subject_employee_id);
    const subjectUserId = subjectEmp?.linked_user_id || subjectEmp?.user_id;

    if (request.requested_by === authUserId) {
      return { isMaker: true, reason: 'Maker-Checker Rule: You are the requester of this approval item and cannot approve it.' };
    }
    if (subjectUserId && subjectUserId === authUserId) {
      return { isMaker: true, reason: 'Maker-Checker Rule: You are the subject employee of this approval item and cannot self-approve changes.' };
    }
    return { isMaker: false, reason: '' };
  };

  // Action handlers
  const handleConfirmAction = async () => {
    if (!actionModal || !actionModal.request) return;
    const { type, request } = actionModal;

    if ((type === 'reject' || type === 'return') && !commentText.trim()) {
      setActionError('Comment / reason is required for rejecting or returning a request.');
      return;
    }

    setIsSubmitting(true);
    setActionError(null);

    let res;
    if (type === 'approve') {
      res = await approveStep(request.id, commentText);
    } else if (type === 'return') {
      res = await returnStep(request.id, commentText);
    } else if (type === 'reject') {
      res = await rejectStep(request.id, commentText);
    }

    setIsSubmitting(false);

    if (res.success) {
      setActionSuccess(`Request ${request.request_number} ${type}d successfully.`);
      setActionModal(null);
      setCommentText('');
      if (selectedRequest?.id === request.id) {
        setSelectedRequest(res.request || null);
      }
    } else {
      setActionError(res.error || `Failed to ${type} request.`);
    }
  };

  const handleWithdraw = async (requestId) => {
    setIsSubmitting(true);
    const res = await withdrawRequest(requestId);
    setIsSubmitting(false);
    if (res.success) {
      setActionSuccess('Request withdrawn successfully.');
      setSelectedRequest(null);
    } else {
      setActionError(res.error || 'Failed to withdraw request.');
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner Alert */}
      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)}><X size={14} /></button>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
        <div className="os-card p-4">
          <div className="flex items-center justify-between text-amber-500">
            <Clock size={18} />
            <span className="text-[10px] font-black uppercase">Pending</span>
          </div>
          <div className="mt-3 text-2xl font-black">{pendingApprovals.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">Awaiting Your Action</div>
        </div>

        <div className="os-card p-4">
          <div className="flex items-center justify-between text-sky-500">
            <FileText size={18} />
            <span className="text-[10px] font-black uppercase">My Requests</span>
          </div>
          <div className="mt-3 text-2xl font-black">{myRequests.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">Submitted By You</div>
        </div>

        <div className="os-card p-4">
          <div className="flex items-center justify-between text-emerald-500">
            <CheckCircle2 size={18} />
            <span className="text-[10px] font-black uppercase">Approved</span>
          </div>
          <div className="mt-3 text-2xl font-black">{approvedRequests.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">Applied & Completed</div>
        </div>

        <div className="os-card p-4">
          <div className="flex items-center justify-between text-indigo-500">
            <RotateCcw size={18} />
            <span className="text-[10px] font-black uppercase">Returned</span>
          </div>
          <div className="mt-3 text-2xl font-black">{returnedRequests.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">Needs Correction</div>
        </div>

        <div className="os-card p-4">
          <div className="flex items-center justify-between text-rose-500">
            <XCircle size={18} />
            <span className="text-[10px] font-black uppercase">Rejected</span>
          </div>
          <div className="mt-3 text-2xl font-black">{rejectedRequests.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">Closed / Denied</div>
        </div>
      </div>

      {/* Main Approval Table Card */}
      <div className="os-card overflow-hidden">
        {/* Navigation Tabs and Search */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'pending'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Clock size={13} /> Pending ({pendingApprovals.length})
            </button>
            <button
              onClick={() => setActiveTab('my_requests')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'my_requests'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <FileText size={13} /> My Requests ({myRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'approved'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <CheckCircle2 size={13} /> Approved ({approvedRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('returned')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'returned'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <RotateCcw size={13} /> Returned ({returnedRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'rejected'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <XCircle size={13} /> Rejected ({rejectedRequests.length})
            </button>
          </div>

          <div className="relative w-full md:w-64">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search request #, title..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                <th className="px-4 py-3">Request #</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Title & Subject</th>
                <th className="px-4 py-3">Requester</th>
                <th className="px-4 py-3">Step</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedRequests.map(req => {
                const makerCheck = checkMakerChecker(req);
                const requesterName = getUserDisplayName(req.requested_by, profiles, tenantMembers);
                const subjectName = resolveEmployeeName(req.subject_employee_id);

                return (
                  <tr key={req.id} className="border-b border-slate-100 dark:border-slate-800/70 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition text-xs">
                    <td className="px-4 py-3 font-extrabold text-sky-600 dark:text-sky-400">
                      {req.request_number}
                    </td>
                    <td className="px-4 py-3 font-semibold uppercase text-[10px] text-slate-500">
                      {req.request_type?.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      <div className="text-slate-800 dark:text-slate-200">{req.title}</div>
                      <div className="text-[10px] text-slate-400">Subject: {subjectName}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">
                      {requesterName}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-500">
                      Step {req.current_step_order}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        req.status === 'applied' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300' :
                        req.status === 'approved' ? 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/50 dark:text-sky-300' :
                        req.status === 'pending_approval' ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300' :
                        req.status === 'returned' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300' :
                        req.status === 'cancelled' ? 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300' :
                        'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-[11px]">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="os-secondary text-xs px-2.5 py-1"
                      >
                        Review
                      </button>

                      {activeTab === 'pending' && (
                        <>
                          <button
                            onClick={() => {
                              if (makerCheck.isMaker) {
                                setActionError(makerCheck.reason);
                              } else {
                                setActionModal({ type: 'approve', request: req });
                                setCommentText('');
                                setActionError(null);
                              }
                            }}
                            disabled={makerCheck.isMaker}
                            title={makerCheck.isMaker ? makerCheck.reason : 'Approve Step'}
                            className={`os-primary text-xs px-2.5 py-1 ${makerCheck.isMaker ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <Check size={12} /> Approve
                          </button>
                          <button
                            onClick={() => {
                              setActionModal({ type: 'return', request: req });
                              setCommentText('');
                              setActionError(null);
                            }}
                            className="os-secondary text-xs px-2 py-1 text-indigo-600 dark:text-indigo-400"
                            title="Return for Correction"
                          >
                            <RotateCcw size={12} />
                          </button>
                          <button
                            onClick={() => {
                              setActionModal({ type: 'reject', request: req });
                              setCommentText('');
                              setActionError(null);
                            }}
                            className="os-secondary text-xs px-2 py-1 text-rose-600 dark:text-rose-400"
                            title="Reject Request"
                          >
                            <X size={12} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}

              {displayedRequests.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-xs italic text-slate-400">
                    No approval requests found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Review Modal */}
      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          requestSteps={requestSteps.filter(s => s.request_id === selectedRequest.id)}
          requestActions={requestActions.filter(a => a.request_id === selectedRequest.id)}
          authUserId={authUserId}
          currentRole={currentRole}
          profiles={profiles}
          tenantMembers={tenantMembers}
          employees={employees}
          onClose={() => setSelectedRequest(null)}
          onApprove={() => {
            const check = checkMakerChecker(selectedRequest);
            if (check.isMaker) setActionError(check.reason);
            else { setActionModal({ type: 'approve', request: selectedRequest }); setCommentText(''); setActionError(null); }
          }}
          onReturn={() => { setActionModal({ type: 'return', request: selectedRequest }); setCommentText(''); setActionError(null); }}
          onReject={() => { setActionModal({ type: 'reject', request: selectedRequest }); setCommentText(''); setActionError(null); }}
          onWithdraw={() => handleWithdraw(selectedRequest.id)}
        />
      )}

      {/* Action Dialog Modal (Approve / Return / Reject) */}
      {actionModal && (
        <div className="fixed inset-0 z-[110] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase flex items-center gap-2">
                {actionModal.type === 'approve' && <CheckCircle2 className="text-emerald-500" size={18} />}
                {actionModal.type === 'return' && <RotateCcw className="text-indigo-500" size={18} />}
                {actionModal.type === 'reject' && <XCircle className="text-rose-500" size={18} />}
                <span>{actionModal.type} Request {actionModal.request.request_number}</span>
              </h3>
              <button onClick={() => setActionModal(null)}><X size={16} /></button>
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertTriangle size={15} />
                <span>{actionError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-300">
                {actionModal.type === 'approve' && 'Confirm approval of this step. Modified fields will be committed to Employee Master upon final step approval.'}
                {actionModal.type === 'return' && 'Specify reason for returning request back to creator for correction:'}
                {actionModal.type === 'reject' && 'Specify reason for rejecting request permanently:'}
              </p>

              <div>
                <label className="font-bold block mb-1">
                  Comments {actionModal.type !== 'approve' ? '(Required)' : '(Optional)'}
                </label>
                <textarea
                  rows={3}
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Enter comments or explanation..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="os-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAction}
                  disabled={isSubmitting}
                  className={`os-primary flex items-center gap-1.5 ${
                    actionModal.type === 'reject' ? 'bg-rose-600 hover:bg-rose-500' :
                    actionModal.type === 'return' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-emerald-600 hover:bg-emerald-500'
                  }`}
                >
                  <Send size={13} />
                  <span>{isSubmitting ? 'Processing...' : `Confirm ${actionModal.type}`}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Request Detail Modal Component
function RequestDetailModal({
  request, requestSteps, requestActions, authUserId, currentRole,
  profiles, tenantMembers, employees, onClose, onApprove, onReturn, onReject, onWithdraw
}) {
  const payloadObj = useMemo(() => {
    try {
      return typeof request.payload === 'string' ? JSON.parse(request.payload) : request.payload || {};
    } catch (e) {
      return {};
    }
  }, [request.payload]);

  const snapshotObj = useMemo(() => {
    try {
      return typeof request.current_snapshot === 'string' ? JSON.parse(request.current_snapshot) : request.current_snapshot || {};
    } catch (e) {
      return {};
    }
  }, [request.current_snapshot]);

  const subjectEmp = employees.find(e => e.id === request.subject_employee_id);
  const subjectUserId = subjectEmp?.user_id;

  const isMaker = request.requested_by === authUserId || (subjectUserId && subjectUserId === authUserId);
  const canActOnStep = ['pending_approval', 'submitted'].includes(request.status) && !isMaker;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-sky-600 dark:text-sky-400">{request.request_number}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {request.request_type?.replace('_', ' ')}
              </span>
            </div>
            <h2 className="text-base font-black text-slate-900 dark:text-white mt-1">{request.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{request.description}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>

        {/* Maker Checker Alert */}
        {isMaker && ['pending_approval', 'submitted'].includes(request.status) && (
          <div className="p-3.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 text-xs font-bold flex items-center gap-2">
            <ShieldAlert size={16} className="shrink-0 text-amber-600" />
            <span>Maker-Checker Guard Active: As the request creator or subject employee, you cannot approve this item.</span>
          </div>
        )}

        {/* Request Overview Grid */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[9px] uppercase font-black text-slate-400 block mb-1">Requester</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {getUserDisplayName(request.requested_by, profiles, tenantMembers)}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[9px] uppercase font-black text-slate-400 block mb-1">Subject Employee</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {subjectEmp ? `${subjectEmp.first_name} ${subjectEmp.last_name}` : 'N/A'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[9px] uppercase font-black text-slate-400 block mb-1">Current Status</span>
            <span className="font-bold uppercase text-sky-600 dark:text-sky-400">{request.status}</span>
          </div>
        </div>

        {/* Payload vs Snapshot Diff View */}
        <div className="space-y-2">
          <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">Proposed Field Changes</h3>
          <div className="os-card overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase text-slate-400 bg-slate-50 dark:bg-slate-900">
                  <th className="px-4 py-2">Field</th>
                  <th className="px-4 py-2">Current Value (Snapshot)</th>
                  <th className="px-4 py-2">Requested Value (Payload)</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(payloadObj).map(field => (
                  <tr key={field} className="border-b border-slate-100 dark:border-slate-800/60">
                    <td className="px-4 py-2.5 font-bold uppercase text-[10px] text-slate-500">{field.replace('_', ' ')}</td>
                    <td className="px-4 py-2.5 text-slate-400 font-mono text-[11px]">{String(snapshotObj[field] ?? '—')}</td>
                    <td className="px-4 py-2.5 font-bold text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                      {String(payloadObj[field] ?? '—')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Steps Timeline */}
        <div className="space-y-2">
          <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">Approval Steps</h3>
          <div className="space-y-2">
            {requestSteps.map(step => (
              <div key={step.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    step.status === 'approved' ? 'bg-emerald-500 text-white' :
                    step.status === 'pending' ? 'bg-amber-500 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {step.step_order}
                  </div>
                  <div>
                    <div className="font-bold">Step {step.step_order}: {step.approver_role || step.approver_type} Approver</div>
                    <div className="text-[10px] text-slate-400">Type: {step.approver_type}</div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  step.status === 'approved' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' :
                  step.status === 'pending' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' :
                  'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {step.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Audit History */}
        {requestActions.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">Audit History</h3>
            <div className="space-y-2 max-h-36 overflow-y-auto">
              {requestActions.map(action => (
                <div key={action.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs flex items-start justify-between">
                  <div>
                    <div className="font-bold flex items-center gap-1.5">
                      <span className="uppercase text-[10px] text-sky-600">{action.action}</span>
                      <span className="text-[10px] text-slate-400">by {getUserDisplayName(action.actor_id, profiles, tenantMembers)}</span>
                    </div>
                    {action.comments && <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">"{action.comments}"</p>}
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">{new Date(action.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
          <button onClick={onClose} className="os-secondary">Close</button>

          <div className="flex gap-2">
            {canActOnStep && (
              <>
                <button onClick={onReturn} className="os-secondary text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <RotateCcw size={13} /> Return
                </button>
                <button onClick={onReject} className="os-secondary text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <X size={13} /> Reject
                </button>
                <button onClick={onApprove} className="os-primary bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1">
                  <Check size={13} /> Approve Step
                </button>
              </>
            )}
            {isMaker && ['pending_approval', 'submitted', 'returned'].includes(request.status) && (
              <button onClick={onWithdraw} className="os-secondary text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <Ban size={13} /> Withdraw Request
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
