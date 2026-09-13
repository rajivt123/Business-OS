import React, { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { X, AlertCircle, Bell, Trash2, RotateCcw, History, Paperclip, Loader2, ChevronUp, ChevronDown, Plus, ShieldCheck, ArrowRightLeft, CalendarClock, Search, Users, UserPlus, UserCheck, UserX, UserMinus, Lock, Copy, Check, Database, AlertTriangle, Download, ExternalLink, Eye, FileText, FileSpreadsheet } from 'lucide-react'
import { useCrm, getUserDisplayName } from '../context/CrmContext'

export default function Modals() {
  const {
    isDarkMode, userRole, tenantRole, promptModal, closePrompt, confirmModal, closeConfirm,
    isIssueModalOpen, setIsIssueModalOpen, issueTitleInput, setIssueTitleInput, handleAddIssue,
    isReminderModalOpen, setIsReminderModalOpen, reminderForm, setReminderForm, submitReminder,
    editReminderModal, setEditReminderModal, editReminderForm, setEditReminderForm, handleSaveReminderEdit,
    companies, modalUnits, modalWorks, handleModalCompanyChange, handleModalUnitChange,
    reminders, handleDeleteReminder, handleRestoreReminder, handlePermanentDeleteReminder,
    isBinModalOpen, setIsBinModalOpen, logs, handleRestoreLog, handlePermanentDeleteLog,
    historyLog, setHistoryLog, isWorkModalOpen, setIsWorkModalOpen, editingWorkId, workForm, setWorkForm, boqFile, setBoqFile, poFile, setPoFile, woFile, setWoFile, isWorkUploading, submitWork,
    isStageManagerOpen, setIsStageManagerOpen, editedStages, moveStage, updateStageName, updateStageDescription, removeStage, restoreStage, addNewStage, saveStages,
    stageDefinitions, isStageDefinitionsLoading,
    isStageAssignmentModalOpen, stageAssignmentTargetId, closeStageAssignmentModal, stageAssignments, isStageAssignmentsLoading, assignUserToStage, endStageAssignment, getStageAssignments,
    isAdminPanelOpen, setIsAdminPanelOpen, profiles, isFetchingProfiles, fetchProfiles, currentUser, handleUpdateUserRole, handleApproveUser, handleTerminateUser, handleAdminCreateUser,
    moveLogModal, setMoveLogModal, handleMoveLogStage, activeWorkId, works,
    docPreviewModal, closeDocPreview,
    isProjectTeamModalOpen, setIsProjectTeamModalOpen, projectAssignments, isAssignmentsLoading, assignUserToProject, endProjectAssignment, tenantMembers, isFetchingTenantMembers, fetchTenantMembers, tenantId,
    units, contacts, enquiries, followUps,
    isContactModalOpen, setIsContactModalOpen, editingContact, contactForm, setContactForm, saveContact,
    isEnquiryModalOpen, setIsEnquiryModalOpen, editingEnquiry, enquiryForm, setEnquiryForm, saveEnquiry,
    isFollowUpModalOpen, setIsFollowUpModalOpen, editingFollowUp, followUpForm, setFollowUpForm, saveFollowUp
  } = useCrm()

  const [promptInput, setPromptInput] = useState('')
  const [binTab, setBinTab] = useState('logs') 

  const deletedLogs = logs.filter(log => log.is_deleted)
  const deletedReminders = reminders.filter(r => r.is_deleted)

  useEffect(() => { if (promptModal?.isOpen) setPromptInput(promptModal.defaultValue || '') }, [promptModal])

  const tText = isDarkMode ? "text-slate-200" : "text-slate-800 font-medium"
  const tMuted = isDarkMode ? "text-slate-400" : "text-slate-500"
  const tInput = isDarkMode ? "bg-slate-950 border-slate-700 text-slate-200" : "bg-white border-slate-300 text-slate-800 shadow-sm placeholder:text-slate-400"
  const tModal = isDarkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200 shadow-2xl"
  const customScrollbar = `[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full ${isDarkMode ? '[&::-webkit-scrollbar-thumb]:bg-slate-700 hover:[&::-webkit-scrollbar-thumb]:bg-slate-600' : '[&::-webkit-scrollbar-thumb]:bg-slate-300 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400'}`

  return (
    <>
      {/* CONTACT MODAL */}
      {isContactModalOpen && (
        <ContactModal
          tModal={tModal}
          tText={tText}
          tMuted={tMuted}
          tInput={tInput}
          isDarkMode={isDarkMode}
          setIsContactModalOpen={setIsContactModalOpen}
          editingContact={editingContact}
          contactForm={contactForm}
          setContactForm={setContactForm}
          saveContact={saveContact}
          companies={companies}
          units={units}
        />
      )}

      {/* ENQUIRY MODAL */}
      {isEnquiryModalOpen && (
        <EnquiryModal
          tModal={tModal}
          tText={tText}
          tMuted={tMuted}
          tInput={tInput}
          isDarkMode={isDarkMode}
          setIsEnquiryModalOpen={setIsEnquiryModalOpen}
          editingEnquiry={editingEnquiry}
          enquiryForm={enquiryForm}
          setEnquiryForm={setEnquiryForm}
          saveEnquiry={saveEnquiry}
          companies={companies}
          contacts={contacts}
          tenantMembers={tenantMembers}
          profiles={profiles}
          getUserDisplayName={getUserDisplayName}
        />
      )}

      {/* FOLLOW-UP MODAL */}
      {isFollowUpModalOpen && (
        <FollowUpModal
          tModal={tModal}
          tText={tText}
          tMuted={tMuted}
          tInput={tInput}
          isDarkMode={isDarkMode}
          setIsFollowUpModalOpen={setIsFollowUpModalOpen}
          editingFollowUp={editingFollowUp}
          followUpForm={followUpForm}
          setFollowUpForm={setFollowUpForm}
          saveFollowUp={saveFollowUp}
          companies={companies}
          enquiries={enquiries}
          tenantMembers={tenantMembers}
          profiles={profiles}
          getUserDisplayName={getUserDisplayName}
        />
      )}

      {/* INSTANT DOCUMENT PREVIEW MODAL */}
      <DocPreviewModal
        docPreviewModal={docPreviewModal}
        closeDocPreview={closeDocPreview}
        isDarkMode={isDarkMode}
        tModal={tModal}
        tText={tText}
      />
      {/* ADMIN CONTROL PANEL MODAL */}
      {isAdminPanelOpen && (
        <AdminControlPanelModal
          tModal={tModal}
          tText={tText}
          tMuted={tMuted}
          customScrollbar={customScrollbar}
          isDarkMode={isDarkMode}
          setIsAdminPanelOpen={setIsAdminPanelOpen}
          profiles={profiles}
          tenantMembers={tenantMembers}
          isFetchingProfiles={isFetchingProfiles}
          currentUser={currentUser}
          handleUpdateUserRole={handleUpdateUserRole}
          handleApproveUser={handleApproveUser}
          handleTerminateUser={handleTerminateUser}
          handleAdminCreateUser={handleAdminCreateUser}
        />
      )}

      {/* PROJECT TEAM & ASSIGNMENTS MODAL */}
      {isProjectTeamModalOpen && (
        <ProjectTeamModal
          tModal={tModal}
          tText={tText}
          tMuted={tMuted}
          tInput={tInput}
          customScrollbar={customScrollbar}
          isDarkMode={isDarkMode}
          setIsProjectTeamModalOpen={setIsProjectTeamModalOpen}
          activeWorkId={activeWorkId}
          works={works}
          projectAssignments={projectAssignments}
          isAssignmentsLoading={isAssignmentsLoading}
          assignUserToProject={assignUserToProject}
          endProjectAssignment={endProjectAssignment}
          profiles={profiles}
          fetchProfiles={fetchProfiles}
          tenantMembers={tenantMembers}
          isFetchingTenantMembers={isFetchingTenantMembers}
          fetchTenantMembers={fetchTenantMembers}
          tenantId={tenantId}
          tenantRole={tenantRole}
          userRole={userRole}
          currentUser={currentUser}
        />
      )}

      {/* STAGE ASSIGNMENT MODAL */}
      {isStageAssignmentModalOpen && (
        <StageAssignmentModal
          tModal={tModal}
          tText={tText}
          tMuted={tMuted}
          tInput={tInput}
          customScrollbar={customScrollbar}
          isDarkMode={isDarkMode}
          activeWorkId={activeWorkId}
          stageAssignmentTargetId={stageAssignmentTargetId}
          stageDefinitions={stageDefinitions}
          stageAssignments={stageAssignments}
          isStageAssignmentsLoading={isStageAssignmentsLoading}
          closeStageAssignmentModal={closeStageAssignmentModal}
          assignUserToStage={assignUserToStage}
          endStageAssignment={endStageAssignment}
          profiles={profiles}
          tenantMembers={tenantMembers}
          projectAssignments={projectAssignments}
          tenantRole={tenantRole}
          userRole={userRole}
          currentUser={currentUser}
        />
      )}

      {/* MOVE LOG STAGE MODAL */}
      {moveLogModal?.isOpen && moveLogModal.log && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm rounded-2xl">
          <div className={`${tModal} border p-6 rounded-2xl w-full max-w-md`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-bold flex items-center gap-2 ${tText}`}>
                <ArrowRightLeft size={18} className="text-indigo-500"/> Move Log to Different Stage
              </h3>
              <button onClick={() => setMoveLogModal({ isOpen: false, log: null })} className={`${tMuted} hover:text-rose-500`}><X size={20} /></button>
            </div>
            
            <div className={`p-3 rounded-lg border mb-4 text-xs ${isDarkMode ? 'bg-slate-950/50 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
              <span className="font-bold text-[10px] uppercase text-indigo-500 block mb-1">Current Stage: {moveLogModal.log.stage_name}</span>
              <p className="line-clamp-2 italic">"{moveLogModal.log.content}"</p>
            </div>

            <label className={`block text-xs font-bold mb-2 ${tMuted}`}>Select Target Pipeline Stage:</label>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {(stageDefinitions || []).filter(s => s.status === 'active').sort((a,b) => a.display_order - b.display_order).map((stg, idx) => {
                const isCurrent = stg.name === moveLogModal.log.stage_name;
                return (
                  <button
                    key={idx}
                    disabled={isCurrent}
                    onClick={() => handleMoveLogStage(moveLogModal.log.id, stg.name)}
                    className={`w-full text-left p-3 rounded-lg border text-xs font-bold flex items-center justify-between transition ${
                      isCurrent
                        ? (isDarkMode ? 'bg-slate-800/40 border-slate-800 text-slate-500 opacity-50 cursor-not-allowed' : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed')
                        : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-sky-950 hover:border-sky-500' : 'bg-white border-slate-300 text-slate-700 hover:bg-sky-50 hover:border-sky-400')
                    }`}
                  >
                    <span>{idx + 1}. {stg.name}</span>
                    {isCurrent ? <span className="text-[10px] font-normal">(Current)</span> : <span className="text-sky-500">Move Here →</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* EDIT & RESCHEDULE TASK MODAL */}
      {editReminderModal?.isOpen && editReminderModal.reminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm rounded-2xl">
          <div className={`${tModal} border p-6 rounded-2xl w-full max-w-md flex flex-col max-h-[90%]`}>
            <div className="flex justify-between items-center mb-5">
              <h3 className={`text-lg font-bold flex items-center gap-2 ${tText}`}>
                <CalendarClock size={18} className="text-amber-500"/> Reschedule & Edit Task
              </h3>
              <button onClick={() => setEditReminderModal({ isOpen: false, reminder: null })} className={`${tMuted} hover:text-rose-500`}><X size={20} /></button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveReminderEdit(editReminderModal.reminder.id, editReminderForm.content, editReminderForm.target_date);
              }}
              className="space-y-4 flex-1 overflow-y-auto pr-1"
            >
              <div>
                <label className={`block text-[10px] font-bold mb-1 uppercase ${tMuted}`}>Task Description</label>
                <textarea
                  required
                  value={editReminderForm.content}
                  onChange={e => setEditReminderForm({ ...editReminderForm, content: e.target.value })}
                  className={`w-full rounded-lg p-2.5 outline-none focus:border-amber-500 text-sm border min-h-15 ${tInput}`}
                />
              </div>

              <div>
                <label className={`block text-[10px] font-bold mb-1 uppercase ${tMuted}`}>New Priority Date & Time</label>
                <input
                  type="datetime-local"
                  value={editReminderForm.target_date}
                  onChange={e => setEditReminderForm({ ...editReminderForm, target_date: e.target.value })}
                  className={`w-full rounded-lg p-2 outline-none focus:border-amber-500 text-sm border ${tInput}`}
                  style={{ colorScheme: isDarkMode ? 'dark' : 'light' }}
                />
              </div>

              {/* Reschedule History timeline */}
              {Array.isArray(editReminderModal.reminder.reschedule_history) && editReminderModal.reminder.reschedule_history.length > 0 && (
                <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-amber-50/50 border-amber-200'}`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-2 block flex items-center gap-1">
                    <History size={12} /> Prior Schedule History ({editReminderModal.reminder.reschedule_history.length})
                  </span>
                  <div className="space-y-2 text-xs">
                    {[...editReminderModal.reminder.reschedule_history].reverse().map((h, i) => (
                      <div key={i} className={`p-2 rounded border text-[11px] ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-amber-100 text-slate-600'}`}>
                        <div className="flex justify-between font-bold mb-0.5">
                          <span>Date: {h.previous_date ? new Date(h.previous_date).toLocaleString() : 'No date set'}</span>
                          <span className="text-[9px] opacity-60">{new Date(h.rescheduled_at).toLocaleDateString()}</span>
                        </div>
                        {h.previous_content && <p className="truncate opacity-80">"{h.previous_content}"</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditReminderModal({ isOpen: false, reminder: null })}
                  className={`px-4 py-2 text-xs font-bold rounded-lg border transition ${isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-amber-600 text-white hover:bg-amber-500 transition shadow-md"
                >
                  Save & Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {promptModal?.isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm rounded-2xl">
          <div className={`${tModal} border p-6 rounded-2xl w-full max-w-sm shadow-xl`}>
            <div className="flex justify-between items-center mb-5">
              <h3 className={`text-lg font-bold ${tText}`}>{promptModal.title}</h3>
              <button onClick={() => closePrompt(null)} className={`${tMuted} hover:text-rose-500 transition-colors`}><X size={20} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); closePrompt(promptInput); }} className="space-y-4">
              <input type="text" autoFocus value={promptInput} onChange={(e) => setPromptInput(e.target.value)} placeholder={promptModal.placeholder} className={`w-full rounded-lg p-3 outline-none focus:border-sky-500 text-sm border ${tInput}`} />
              <div className="flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => closePrompt(null)} className={`px-4 py-2 text-sm font-bold rounded-lg border transition ${isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>Cancel</button>
                <button type="submit" disabled={!promptInput.trim()} className="px-5 py-2 text-sm font-bold rounded-lg bg-sky-600 text-white hover:bg-sky-500 disabled:opacity-50 transition shadow-md">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FIXED: Changed z-[110] to z-110 */}
      {confirmModal?.isOpen && (
        <div className="fixed inset-0 z-110 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm rounded-2xl">
          <div className={`${tModal} border p-6 rounded-2xl w-full max-w-sm shadow-xl`}>
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle size={24} className="text-rose-500 shrink-0" />
              <h3 className={`text-base font-bold ${tText}`}>{confirmModal.message}</h3>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => closeConfirm(false)} className={`px-4 py-2 text-sm font-bold rounded-lg border transition ${isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>Cancel</button>
              <button onClick={() => closeConfirm(true)} className="px-5 py-2 text-sm font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-500 transition shadow-md">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm rounded-2xl">
          <div className={`${tModal} border p-6 rounded-2xl w-full max-w-md`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-lg font-bold flex items-center gap-2 text-rose-500`}><AlertCircle size={18}/> Report Issue</h3>
              <button onClick={() => setIsIssueModalOpen(false)} className={`${tMuted} hover:text-rose-500`}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddIssue} className="space-y-4">
              <label className={`block text-xs font-bold mb-1 ${tMuted}`}>Issue Description</label>
              <input required autoFocus type="text" value={issueTitleInput} onChange={e => setIssueTitleInput(e.target.value)} placeholder="e.g., Hydrant Line Excess Quantity" className={`w-full rounded-lg p-3 outline-none focus:border-rose-500 text-sm border ${tInput}`} />
              <button type="submit" className="w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold py-2.5 rounded-lg transition mt-4 shadow-md">Save Issue</button>
            </form>
          </div>
        </div>
      )}

      {isReminderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm rounded-2xl">
          <div className={`${tModal} border p-6 rounded-2xl w-full max-w-md`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-lg font-bold flex items-center gap-2 ${tText}`}><Bell size={18} className="text-amber-500"/> Schedule Task</h3>
              <button onClick={() => setIsReminderModalOpen(false)} className={`${tMuted} hover:text-rose-500`}><X size={20} /></button>
            </div>
            <form onSubmit={submitReminder} className="space-y-4">
              <textarea required value={reminderForm.content} onChange={e => setReminderForm({...reminderForm, content: e.target.value})} placeholder="Task / Note" className={`w-full rounded-lg p-2.5 outline-none focus:border-amber-500 text-sm border min-h-15 ${tInput}`} />
              <div>
                <label className={`block text-[10px] font-bold mb-1 uppercase ${tMuted}`}>Date & Time (Optional)</label>
                <input type="datetime-local" value={reminderForm.target_date} onChange={e => setReminderForm({...reminderForm, target_date: e.target.value})} className={`w-full rounded-lg p-2 outline-none focus:border-amber-500 text-sm border ${tInput}`} style={{colorScheme: isDarkMode ? 'dark' : 'light'}} />
              </div>
              <div className={`p-3 rounded-lg border space-y-3 ${isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <h4 className={`text-[10px] uppercase font-bold tracking-wider ${tMuted}`}>Context (Auto-Links to Data)</h4>
                <select value={reminderForm.company_id} onChange={e => handleModalCompanyChange(e.target.value)} className={`w-full rounded p-1.5 text-xs border outline-none ${tInput}`}>
                  <option value="">-- Client --</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {reminderForm.company_id && (
                  <select value={reminderForm.unit_id} onChange={e => handleModalUnitChange(e.target.value)} className={`w-full rounded p-1.5 text-xs border outline-none ${tInput}`}>
                    <option value="">-- Unit --</option>
                    {modalUnits.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                )}
                {reminderForm.unit_id && (
                  <select value={reminderForm.work_id} onChange={e => setReminderForm({...reminderForm, work_id: e.target.value})} className={`w-full rounded p-1.5 text-xs border outline-none ${tInput}`}>
                    <option value="">-- PO / WO --</option>
                    {modalWorks.map(w => <option key={w.id} value={w.id}>{w.title}</option>)}
                  </select>
                )}
              </div>
              <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2.5 rounded-lg transition mt-4 shadow-md">Save Task</button>
            </form>
          </div>
        </div>
      )}

      {isBinModalOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm rounded-2xl">
          <div className={`${tModal} border p-6 rounded-2xl w-full max-w-2xl flex flex-col max-h-[90%]`}>
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h3 className={`text-lg font-bold flex items-center gap-2 ${tText}`}><Trash2 size={18} className="text-rose-500"/> Recycle Bin</h3>
              <button onClick={() => setIsBinModalOpen(false)} className={`${tMuted} hover:text-rose-500`}><X size={20} /></button>
            </div>
            <div className={`flex border-b mb-4 text-sm font-bold ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <button onClick={() => setBinTab('logs')} className={`px-4 py-2 transition-colors ${binTab === 'logs' ? 'text-sky-500 border-b-2 border-sky-500' : tMuted}`}>Deleted Logs ({deletedLogs.length})</button>
              <button onClick={() => setBinTab('tasks')} className={`px-4 py-2 transition-colors ${binTab === 'tasks' ? 'text-sky-500 border-b-2 border-sky-500' : tMuted}`}>Deleted Tasks ({deletedReminders.length})</button>
            </div>
            <div className={`flex-1 overflow-y-auto space-y-3 pr-2 ${customScrollbar}`}>
              {binTab === 'logs' && (
                deletedLogs.length === 0 ? <p className={`text-sm italic text-center mt-10 ${tMuted}`}>No deleted logs.</p> : deletedLogs.map(log => (
                  <div key={log.id} className={`p-4 rounded-xl border shadow-sm ${isDarkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <p className={`text-[13px] leading-snug whitespace-pre-wrap opacity-70 ${tText}`}>{log.content}</p>
                    <div className={`mt-4 pt-3 flex items-center justify-between border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-300'}`}>
                      <span className={`text-[10px] ${tMuted}`}>{new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                      <div className="flex gap-4">
                        <button onClick={() => handleRestoreLog(log.id)} className="text-[10px] font-bold text-emerald-600 hover:text-emerald-500 uppercase tracking-wider flex items-center gap-1 transition"><RotateCcw size={12}/> Restore</button>
                        {userRole === 'admin' && <button onClick={() => handlePermanentDeleteLog(log.id)} className="text-[10px] font-bold text-rose-600 hover:text-rose-500 uppercase tracking-wider flex items-center gap-1 transition"><Trash2 size={12}/> Delete Forever</button>}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {binTab === 'tasks' && (
                deletedReminders.length === 0 ? <p className={`text-sm italic text-center mt-10 ${tMuted}`}>No deleted tasks.</p> : deletedReminders.map(task => (
                  <div key={task.id} className={`p-4 rounded-xl border shadow-sm ${isDarkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <p className={`text-[13px] leading-snug whitespace-pre-wrap opacity-70 ${tText}`}>{task.content}</p>
                    <div className={`mt-4 pt-3 flex items-center justify-between border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-300'}`}>
                      <span className={`text-[10px] ${tMuted}`}>{new Date(task.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                      <div className="flex gap-4">
                        <button onClick={() => handleRestoreReminder(task.id)} className="text-[10px] font-bold text-emerald-600 hover:text-emerald-500 uppercase tracking-wider flex items-center gap-1 transition"><RotateCcw size={12}/> Restore</button>
                        {userRole === 'admin' && <button onClick={() => handlePermanentDeleteReminder(task.id)} className="text-[10px] font-bold text-rose-600 hover:text-rose-500 uppercase tracking-wider flex items-center gap-1 transition"><Trash2 size={12}/> Delete Forever</button>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {historyLog && userRole === 'admin' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm rounded-2xl">
          <div className={`${tModal} border p-6 rounded-2xl w-full max-w-lg flex flex-col max-h-[90%]`}>
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h3 className={`text-lg font-bold flex items-center gap-2 ${tText}`}><History size={18} className="text-sky-500"/> Edit History</h3>
              <button onClick={() => setHistoryLog(null)} className={`${tMuted} hover:text-sky-500`}><X size={20} /></button>
            </div>
            <div className={`flex-1 overflow-y-auto pr-2 space-y-4 ${customScrollbar}`}>
              <div className={`p-4 rounded-lg border-l-4 border-l-sky-500 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
                <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider mb-1 block">Current Version</span>
                <p className={`text-sm ${tText}`}>{historyLog.content}</p>
              </div>
              {[...(historyLog.previous_versions || [])].reverse().map((ver, i) => (
                <div key={i} className={`p-4 rounded-lg border border-dashed ${isDarkMode ? 'bg-slate-950/50 border-slate-700' : 'bg-white border-slate-300 shadow-sm'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${tMuted}`}>Version {historyLog.previous_versions.length - i}</span>
                    <span className={`text-[10px] ${tMuted}`}>{new Date(ver.changed_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                  <p className={`text-sm opacity-80 ${tText}`}>{ver.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isWorkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm rounded-2xl">
          <div className={`${tModal} border p-6 rounded-2xl w-full max-w-md`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-lg font-bold ${tText}`}>{editingWorkId ? 'Edit PO/WO' : 'New PO/WO'}</h3>
              <button onClick={() => setIsWorkModalOpen(false)} className={`${tMuted} hover:text-sky-500`}><X size={20} /></button>
            </div>
            <form onSubmit={submitWork} className="space-y-4">
              <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${tMuted}`}>System / Title</label>
              <input required type="text" value={workForm.title} onChange={e => setWorkForm({...workForm, title: e.target.value})} className={`w-full rounded-lg p-2.5 outline-none focus:border-sky-500 text-sm border ${tInput}`} />
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${tMuted}`}>PO Number</label>
                  <input type="text" value={workForm.po_number} onChange={e => setWorkForm({...workForm, po_number: e.target.value})} className={`w-full rounded-lg p-2.5 outline-none focus:border-amber-500 text-sm border ${tInput}`} />
                </div>
                <div className="flex-1">
                  <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${tMuted}`}>WO Number</label>
                  <input type="text" value={workForm.wo_number} onChange={e => setWorkForm({...workForm, wo_number: e.target.value})} className={`w-full rounded-lg p-2.5 outline-none focus:border-sky-500 text-sm border ${tInput}`} />
                </div>
              </div>
              {/* PO File Attachment */}
              <div className={`p-3 rounded-lg border border-dashed ${isDarkMode ? 'border-slate-700 bg-slate-900/50' : 'border-slate-300 bg-slate-50'}`}>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${tMuted}`}>PO Document File (Optional)</label>
                {workForm.po_file_url && !poFile && (
                  <div className="flex items-center gap-2 mb-2 text-xs text-amber-500 font-medium">
                    <Paperclip size={14}/> Existing PO Attached
                    <button type="button" onClick={() => setWorkForm({...workForm, po_file_url: ''})} className="text-rose-500 ml-auto hover:underline">Remove</button>
                  </div>
                )}
                <input type="file" onChange={e => setPoFile(e.target.files[0])} className={`w-full text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 ${tText}`} />
              </div>

              {/* WO File Attachment */}
              <div className={`p-3 rounded-lg border border-dashed ${isDarkMode ? 'border-slate-700 bg-slate-900/50' : 'border-slate-300 bg-slate-50'}`}>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${tMuted}`}>WO Document File (Optional)</label>
                {workForm.wo_file_url && !woFile && (
                  <div className="flex items-center gap-2 mb-2 text-xs text-sky-500 font-medium">
                    <Paperclip size={14}/> Existing WO Attached
                    <button type="button" onClick={() => setWorkForm({...workForm, wo_file_url: ''})} className="text-rose-500 ml-auto hover:underline">Remove</button>
                  </div>
                )}
                <input type="file" onChange={e => setWoFile(e.target.files[0])} className={`w-full text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 ${tText}`} />
              </div>

              {/* BOQ File Attachment */}
              <div className={`p-3 rounded-lg border border-dashed ${isDarkMode ? 'border-slate-700 bg-slate-900/50' : 'border-slate-300 bg-slate-50'}`}>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${tMuted}`}>BOQ Document File (Optional)</label>
                {workForm.boq_url && !boqFile && (
                  <div className="flex items-center gap-2 mb-2 text-xs text-indigo-500 font-medium">
                    <Paperclip size={14}/> Existing BOQ Attached 
                    <button type="button" onClick={() => setWorkForm({...workForm, boq_url: ''})} className="text-rose-500 ml-auto hover:underline">Remove</button>
                  </div>
                )}
                <input type="file" onChange={e => setBoqFile(e.target.files[0])} className={`w-full text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 ${tText}`} />
              </div>

              <button type="submit" disabled={isWorkUploading} className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition mt-4 shadow-md flex items-center justify-center gap-2">
                {isWorkUploading ? <Loader2 size={16} className="animate-spin" /> : null}
                {isWorkUploading ? 'Saving...' : 'Save Document'}
              </button>
            </form>
          </div>
        </div>
      )}

      {isStageManagerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm rounded-2xl p-4">
          <div className={`${tModal} border p-5 sm:p-6 rounded-2xl w-full max-w-2xl flex flex-col max-h-[90vh] shadow-2xl`}>
            <div className="flex justify-between items-center mb-4 shrink-0">
              <div>
                <h3 className={`text-lg font-bold ${tText}`}>Manage Pipeline Stages</h3>
                <p className={`text-[10px] mt-0.5 ${tMuted}`}>
                  Normalized stage definitions • inactive stages are retained for history
                </p>
              </div>
              <button onClick={() => setIsStageManagerOpen(false)} className={`${tMuted} hover:text-rose-500 p-1`}>
                <X size={20} />
              </button>
            </div>

            <div className={`flex-1 overflow-y-auto space-y-2 pr-1 mb-4 ${customScrollbar}`}>
              {isStageDefinitionsLoading ? (
                <div className={`py-10 flex items-center justify-center gap-2 text-xs ${tMuted}`}>
                  <Loader2 size={16} className="animate-spin text-sky-500" /> Loading stage definitions...
                </div>
              ) : editedStages.length === 0 ? (
                <div className={`py-10 text-center text-xs ${tMuted}`}>
                  No stages defined yet. Add the first stage below.
                </div>
              ) : (
                editedStages.map((stage, index) => {
                  const inactive = stage.status === 'inactive';
                  return (
                    <div
                      key={stage.id || `new-${index}`}
                      className={`p-2.5 rounded-xl border ${
                        inactive
                          ? (isDarkMode ? 'bg-slate-950/40 border-slate-800 opacity-65' : 'bg-slate-100 border-slate-200 opacity-70')
                          : (isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200')
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col gap-0.5 shrink-0">
                          <button type="button" onClick={() => moveStage(index, 'up')} disabled={index === 0 || inactive} className="text-slate-500 hover:text-sky-500 disabled:opacity-20 p-0.5">
                            <ChevronUp size={14} />
                          </button>
                          <button type="button" onClick={() => moveStage(index, 'down')} disabled={index === editedStages.length - 1 || inactive} className="text-slate-500 hover:text-sky-500 disabled:opacity-20 p-0.5">
                            <ChevronDown size={14} />
                          </button>
                        </div>

                        <span className={`text-[10px] font-black w-6 text-center ${tMuted}`}>
                          {index + 1}
                        </span>

                        <input
                          type="text"
                          value={stage.name || ''}
                          disabled={inactive}
                          onChange={e => updateStageName(index, e.target.value)}
                          className={`flex-1 min-w-0 rounded-lg p-2 text-sm border outline-none focus:border-sky-500 disabled:cursor-not-allowed ${tInput}`}
                          placeholder="Stage name"
                        />

                        {inactive ? (
                          <button type="button" onClick={() => restoreStage(index)} className="text-emerald-500 hover:text-emerald-400 p-2" title="Restore stage">
                            <RotateCcw size={16} />
                          </button>
                        ) : (
                          <button type="button" onClick={() => removeStage(index)} className="text-slate-500 hover:text-rose-600 p-2" title="Deactivate stage">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      {!inactive && (
                        <input
                          type="text"
                          value={stage.description || ''}
                          onChange={e => updateStageDescription(index, e.target.value)}
                          className={`w-full mt-2 rounded-lg p-2 text-[11px] border outline-none focus:border-sky-500 ${tInput}`}
                          placeholder="Optional description / responsibility"
                        />
                      )}

                      {inactive && (
                        <div className="mt-1 ml-14 text-[9px] font-bold uppercase tracking-wider text-amber-500">
                          Inactive • retained for history
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-3 items-stretch sm:items-center pt-4 border-t border-slate-700/50 shrink-0">
              <button
                onClick={addNewStage}
                className="flex items-center justify-center gap-1.5 text-sm text-sky-600 hover:text-sky-500 font-bold"
              >
                <Plus size={16} /> Add New Stage
              </button>
              <button
                onClick={saveStages}
                disabled={isStageDefinitionsLoading}
                className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold py-2 px-6 rounded-lg transition shadow-md"
              >
                Save Pipeline
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  )
}


function StageAssignmentModal({
  tModal, tText, tMuted, tInput, customScrollbar, isDarkMode,
  activeWorkId, stageAssignmentTargetId, stageDefinitions, stageAssignments,
  isStageAssignmentsLoading, closeStageAssignmentModal, assignUserToStage,
  endStageAssignment, profiles, tenantMembers, projectAssignments,
  tenantRole, userRole, currentUser
}) {
  const activeStages = (stageDefinitions || [])
    .filter(s => s.status === 'active')
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  const [selectedStageId, setSelectedStageId] = useState(stageAssignmentTargetId || '');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('responsible');
  const [showHistory, setShowHistory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (stageAssignmentTargetId) setSelectedStageId(stageAssignmentTargetId);
  }, [stageAssignmentTargetId]);

  const activeProjectTeam = (projectAssignments || []).filter(a => a.status === 'active');

  const eligibleUsers = activeProjectTeam
    .map(a => {
      const tm = (tenantMembers || []).find(m =>
        m.user_id && String(m.user_id).trim().toLowerCase() === String(a.user_id).trim().toLowerCase()
      );
      const email = tm?.email || tm?.user_email || tm?.invited_email || tm?.member_email ||
        getUserDisplayName(a.user_id, profiles, tenantMembers);
      return {
        user_id: a.user_id,
        email,
        project_role: a.project_role
      };
    })
    .filter((u, index, arr) => arr.findIndex(x => x.user_id === u.user_id) === index)
    .filter(u => u.user_id !== currentUser?.id);

  const stageRows = (stageAssignments || [])
    .filter(a => a.stage_id === selectedStageId)
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === 'active' ? -1 : 1;
      return new Date(b.created_at || b.assigned_at) - new Date(a.created_at || a.assigned_at);
    });

  const activeRows = stageRows.filter(a => a.status === 'active');
  const endedRows = stageRows.filter(a => a.status === 'ended');

  const canManage =
    ['OWNER', 'ADMIN', 'MANAGER'].includes((tenantRole || '').toUpperCase()) ||
    userRole === 'admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStageId || !selectedUserId) {
      alert('Select both a stage and a project teammate.');
      return;
    }

    setIsSubmitting(true);
    const result = await assignUserToStage({
      workId: activeWorkId,
      stageId: selectedStageId,
      userId: selectedUserId,
      stageRole: selectedRole
    });
    setIsSubmitting(false);

    if (result?.success) {
      setSelectedUserId('');
      setSelectedRole('responsible');
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className={`${tModal} border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl`}>
        <div className="p-5 border-b border-slate-200/60 dark:border-slate-800 shrink-0 flex items-center justify-between">
          <div>
            <h3 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${tText}`}>
              <ShieldCheck size={19} className="text-purple-500" />
              Stage Responsibility
            </h3>
            <p className={`text-[10px] mt-0.5 ${tMuted}`}>
              Assign project-team members to a specific pipeline stage.
            </p>
          </div>
          <button onClick={closeStageAssignmentModal} className={`${tMuted} hover:text-rose-500 p-1`}>
            <X size={19} />
          </button>
        </div>

        <div className={`flex-1 overflow-y-auto p-5 space-y-4 ${customScrollbar}`}>
          <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-purple-950/20 border-purple-500/20' : 'bg-purple-50 border-purple-200'}`}>
            <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${tMuted}`}>
              Pipeline Stage
            </label>
            <select
              value={selectedStageId}
              onChange={e => setSelectedStageId(e.target.value)}
              className={`w-full rounded-xl p-2.5 text-xs font-semibold border outline-none ${tInput}`}
            >
              <option value="">-- Select Stage --</option>
              {activeStages.map((stage, index) => (
                <option key={stage.id} value={stage.id}>
                  {index + 1}. {stage.name}
                </option>
              ))}
            </select>
          </div>

          {canManage && (
            <form onSubmit={handleSubmit} className={`p-4 rounded-xl border space-y-3 ${isDarkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <UserPlus size={14} className="text-purple-500" />
                <span className={`text-[11px] font-bold uppercase tracking-wider ${tMuted}`}>
                  Assign Stage User
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_150px_auto] gap-3 items-end">
                <div>
                  <label className={`block text-[10px] font-bold uppercase mb-1 ${tMuted}`}>Project Teammate</label>
                  <select
                    required
                    value={selectedUserId}
                    onChange={e => setSelectedUserId(e.target.value)}
                    className={`w-full rounded-xl p-2.5 text-xs font-semibold border outline-none ${tInput}`}
                  >
                    <option value="">-- Select Teammate --</option>
                    {eligibleUsers.map(u => (
                      <option key={u.user_id} value={u.user_id}>
                        {u.email} ({u.project_role || 'member'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-[10px] font-bold uppercase mb-1 ${tMuted}`}>Stage Role</label>
                  <select
                    value={selectedRole}
                    onChange={e => setSelectedRole(e.target.value)}
                    className={`w-full rounded-xl p-2.5 text-xs font-bold border outline-none ${tInput}`}
                  >
                    <option value="responsible">Responsible</option>
                    <option value="lead">Lead</option>
                    <option value="contributor">Contributor</option>
                    <option value="reviewer">Reviewer</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !selectedStageId || !selectedUserId}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                  Assign
                </button>
              </div>

              {eligibleUsers.length === 0 && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400">
                  No available project teammates. Assign users to the project team first.
                </p>
              )}
            </form>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[11px] font-extrabold uppercase tracking-wider ${tMuted}`}>
                Active Stage Users ({activeRows.length})
              </span>
              {isStageAssignmentsLoading && <Loader2 size={13} className="animate-spin text-sky-500" />}
            </div>

            {activeRows.length === 0 ? (
              <div className={`py-6 text-center border border-dashed rounded-xl text-xs ${tMuted}`}>
                No users assigned to this stage.
              </div>
            ) : (
              <div className="space-y-2">
                {activeRows.map(row => {
                  const tm = (tenantMembers || []).find(m =>
                    m.user_id && String(m.user_id).trim().toLowerCase() === String(row.user_id).trim().toLowerCase()
                  );
                  const assignerTm = (tenantMembers || []).find(m =>
                    m.user_id && String(m.user_id).trim().toLowerCase() === String(row.assigned_by).trim().toLowerCase()
                  );
                  const userDisplayName = tm?.email || tm?.user_email || tm?.invited_email || tm?.member_email ||
                    getUserDisplayName(row.user_id, profiles, tenantMembers);
                  const assignerDisplayName = assignerTm?.email || assignerTm?.user_email || assignerTm?.invited_email || assignerTm?.member_email ||
                    getUserDisplayName(row.assigned_by, profiles, tenantMembers);
                  const roleLabel = row.stage_role.charAt(0).toUpperCase() + row.stage_role.slice(1);

                  return (
                    <div key={row.id} className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                          {(userDisplayName || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className={`text-xs font-bold truncate ${tText}`} title={userDisplayName}>
                            {userDisplayName}
                          </div>
                          <div className={`text-[10px] ${tMuted}`}>
                            {roleLabel} • Assigned {new Date(row.assigned_at).toLocaleDateString()}
                            {row.assigned_by ? ` by ${assignerDisplayName}` : ''}
                          </div>
                        </div>
                      </div>
                      {canManage && (
                        <button
                          onClick={() => endStageAssignment(row.id)}
                          className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-rose-500 border border-rose-500/20 hover:bg-rose-500/10 shrink-0"
                        >
                          End
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {endedRows.length > 0 && (
            <div className="border-t border-slate-200/60 dark:border-slate-800 pt-3">
              <button
                onClick={() => setShowHistory(v => !v)}
                className={`text-xs font-bold flex items-center gap-1.5 ${tMuted}`}
              >
                <History size={14} />
                Assignment History ({endedRows.length})
                <span className="text-[9px] text-sky-500">{showHistory ? '▲' : '▼'}</span>
              </button>

              {showHistory && (
                <div className="space-y-2 mt-2">
                  {endedRows.map(row => {
                    const tm = (tenantMembers || []).find(m =>
                      m.user_id && String(m.user_id).trim().toLowerCase() === String(row.user_id).trim().toLowerCase()
                    );
                    const assignerTm = (tenantMembers || []).find(m =>
                      m.user_id && String(m.user_id).trim().toLowerCase() === String(row.assigned_by).trim().toLowerCase()
                    );
                    const userDisplayName = tm?.email || tm?.user_email || tm?.invited_email || tm?.member_email ||
                      getUserDisplayName(row.user_id, profiles, tenantMembers);
                    const assignerDisplayName = assignerTm?.email || assignerTm?.user_email || assignerTm?.invited_email || assignerTm?.member_email ||
                      getUserDisplayName(row.assigned_by, profiles, tenantMembers);
                    return (
                      <div key={row.id} className={`p-3 rounded-xl border text-[10px] opacity-75 ${isDarkMode ? 'bg-slate-950/40 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                        <div className="flex justify-between gap-2 font-bold">
                          <span className="truncate" title={userDisplayName}>{userDisplayName}</span>
                          <span>{row.stage_role} • Ended</span>
                        </div>
                        <div className="flex justify-between gap-2 mt-1">
                          <span>Assigned {new Date(row.assigned_at).toLocaleDateString()} {row.assigned_by ? `by ${assignerDisplayName}` : ''}</span>
                          <span>Ended {row.ended_at ? new Date(row.ended_at).toLocaleDateString() : '—'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminControlPanelModal({
  tModal, tText, tMuted, customScrollbar, isDarkMode, setIsAdminPanelOpen,
  profiles, tenantMembers, isFetchingProfiles, currentUser, handleUpdateUserRole, handleApproveUser, handleTerminateUser, handleAdminCreateUser
}) {
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'pending'
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState('Team')
  const [isSubmittingUser, setIsSubmittingUser] = useState(false)

  const pendingProfiles = profiles.filter(p => !p.role || p.role.toLowerCase() === 'guest' || p.role.toLowerCase() === 'pending')
  const filteredProfiles = (activeTab === 'pending' ? pendingProfiles : profiles).filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (p.email && p.email.toLowerCase().includes(q)) || (p.id && p.id.toLowerCase().includes(q)) || (p.role && p.role.toLowerCase().includes(q));
  })

  const handleRoleChangeSelect = (profileId, selectedValue) => {
    if (selectedValue === '__CUSTOM__') {
      const customRole = window.prompt("Enter new custom role name (e.g. Executive, Lead, Operations):")
      if (customRole && customRole.trim()) {
        handleUpdateUserRole(profileId, customRole.trim())
      }
    } else {
      handleUpdateUserRole(profileId, selectedValue)
    }
  }

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    if (!newEmail || !newEmail.trim()) return;
    setIsSubmittingUser(true);
    const success = await handleAdminCreateUser(newEmail.trim(), newRole);
    setIsSubmittingUser(false);
    if (success) {
      setNewEmail('');
      setShowAddForm(false);
    }
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm rounded-2xl p-4">
      <div className={`${tModal} border p-6 rounded-2xl w-full max-w-3xl flex flex-col max-h-[90vh] shadow-2xl`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0 border-b border-slate-200/60 dark:border-slate-800 pb-3">
          <div className="flex items-start justify-between w-full sm:w-auto">
            <div>
              <h3 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${tText}`}>
                <ShieldCheck size={20} className="text-purple-500 shrink-0"/> Admin Control Panel
              </h3>
              <p className={`text-[11px] sm:text-xs mt-0.5 ${tMuted}`}>Manage team permissions, assign roles, approve requests, or add users.</p>
            </div>
            <button onClick={() => setIsAdminPanelOpen(false)} className={`sm:hidden ${tMuted} hover:text-rose-500 transition-colors p-1 -mr-1`}>
              <X size={20} />
            </button>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition shadow-xs ${
                showAddForm
                  ? 'bg-slate-700 text-white'
                  : 'bg-purple-600 hover:bg-purple-500 text-white'
              }`}
            >
              <UserPlus size={14} /> {showAddForm ? 'Cancel' : '+ Add User'}
            </button>
            <button onClick={() => setIsAdminPanelOpen(false)} className={`hidden sm:block ${tMuted} hover:text-rose-500 transition-colors p-1.5 rounded-lg border ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-100'}`}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Add User Form Card */}
        {showAddForm && (
          <form
            onSubmit={handleCreateUserSubmit}
            className={`mb-4 p-3.5 rounded-2xl border space-y-3 shrink-0 shadow-inner ${
              isDarkMode ? 'bg-slate-950/80 border-purple-500/40' : 'bg-purple-50/70 border-purple-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider flex flex-wrap items-center gap-1.5 ${isDarkMode ? 'text-purple-400' : 'text-purple-800'}`}>
                <UserPlus size={14} /> Create User Account (Default Password: <code className="bg-purple-900/30 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">crm12345</code>)
              </span>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <div className="flex-1 min-w-0">
                <label className={`block text-[10px] font-bold uppercase mb-1 ${tMuted}`}>User Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="teammate@company.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className={`w-full rounded-xl p-2 text-xs border outline-none ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200 focus:border-purple-500' : 'bg-white border-slate-300 text-slate-800 focus:border-purple-500'
                  }`}
                />
              </div>

              <div className="w-full sm:w-44">
                <label className={`block text-[10px] font-bold uppercase mb-1 ${tMuted}`}>Assign Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className={`w-full rounded-xl p-2 text-xs font-bold border outline-none ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 text-purple-300' : 'bg-white border-slate-300 text-purple-900'
                  }`}
                >
                  <option value="Team">Team (Standard)</option>
                  <option value="admin">Admin (Full Access)</option>
                  <option value="member">Member (Standard)</option>
                  <option value="guest">Guest (Read Only)</option>
                </select>
              </div>

              <div className="flex items-end w-full sm:w-auto">
                <button
                  type="submit"
                  disabled={isSubmittingUser}
                  className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSubmittingUser ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                  {isSubmittingUser ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Tab Navigation & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4 shrink-0 pb-3 border-b border-slate-700/40">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-purple-600 text-white shadow-md'
                  : isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-slate-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Users size={14} /> All Teammates ({profiles.length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition relative cursor-pointer ${
                activeTab === 'pending'
                  ? 'bg-amber-600 text-white shadow-md'
                  : isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-slate-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <UserPlus size={14} /> Pending
              {pendingProfiles.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] bg-rose-500 text-white font-black animate-pulse">
                  {pendingProfiles.length}
                </span>
              )}
            </button>
          </div>

          <div className="relative w-full sm:w-60">
            <Search size={14} className={`absolute left-2.5 top-2.5 ${tMuted}`} />
            <input
              type="text"
              placeholder="Filter email, role, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border outline-none ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-purple-500' : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-purple-500'
              }`}
            />
          </div>
        </div>

        {/* User Profiles List */}
        <div className={`flex-1 overflow-y-auto space-y-3 pr-1 ${customScrollbar}`}>
          {isFetchingProfiles ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 size={24} className="animate-spin text-purple-500" />
              <span className={`text-xs ${tMuted}`}>Fetching user profiles & permissions...</span>
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="text-center py-12">
              <Users size={32} className={`mx-auto mb-2 opacity-40 ${tMuted}`} />
              <p className={`text-sm font-medium ${tText}`}>No user accounts found</p>
              <p className={`text-xs ${tMuted}`}>
                {activeTab === 'pending' ? 'There are currently no pending access requests.' : 'Try adjusting your search filter.'}
              </p>
            </div>
          ) : (
            filteredProfiles.map(profile => {
              const currentRole = profile.role || 'guest';
              const normalizedRole = currentRole.toLowerCase();
              const isTerminated = normalizedRole === 'terminated';
              const isSelf = (currentUser?.id && profile.id === currentUser.id) || 
                             (currentUser?.email && profile.email && profile.email.toLowerCase() === currentUser.email.toLowerCase());

              return (
                <div
                  key={profile.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition shadow-xs ${
                    isSelf
                      ? (isDarkMode ? 'bg-purple-950/30 border-purple-500/50' : 'bg-purple-50/80 border-purple-200')
                      : isTerminated
                      ? (isDarkMode ? 'bg-rose-950/20 border-rose-900/40 opacity-75' : 'bg-rose-50/50 border-rose-200')
                      : normalizedRole === 'admin'
                      ? (isDarkMode ? 'bg-purple-950/20 border-purple-900/40' : 'bg-purple-50/40 border-purple-200')
                      : (isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200')
                  }`}
                >
                  {/* Info */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className={`text-xs sm:text-sm font-bold truncate max-w-[200px] sm:max-w-md ${tText}`} title={profile.email || profile.id}>
                        {getUserDisplayName(profile, profiles, tenantMembers, currentUser)}
                      </p>
                      {isSelf && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-purple-600 text-white shadow-xs flex items-center gap-1 shrink-0">
                          <Lock size={9} /> You
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider shrink-0 ${
                        normalizedRole === 'admin'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : normalizedRole === 'team' || normalizedRole === 'member'
                          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          : normalizedRole === 'terminated'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {currentRole}
                      </span>
                    </div>
                    <p className={`text-[10px] sm:text-[11px] ${tMuted}`}>
                      Joined: {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'} • ID: {profile.id.slice(0, 8)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 justify-between sm:justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/50 dark:border-slate-800/60">
                    {/* Tab 2: Pending Requests Quick Accept / Reject */}
                    {activeTab === 'pending' && !isSelf && !isTerminated && (
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleApproveUser(profile.id, 'Team')}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs"
                        >
                          <UserCheck size={14} /> Accept as Team
                        </button>
                        <button
                          onClick={() => handleTerminateUser(profile.id)}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition shadow-xs"
                        >
                          <UserX size={14} /> Reject
                        </button>
                      </div>
                    )}

                    {/* Role Dropdown / Lock Badge */}
                    {activeTab === 'all' && (
                      isSelf ? (
                        <div
                          title="Admin cannot modify their own role"
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${
                            isDarkMode ? 'bg-purple-950/60 border-purple-500/50 text-purple-300' : 'bg-purple-100 border-purple-300 text-purple-800'
                          }`}
                        >
                          <Lock size={12} /> Admin (Locked)
                        </div>
                      ) : (
                        <select
                          value={currentRole}
                          onChange={(e) => handleRoleChangeSelect(profile.id, e.target.value)}
                          className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border outline-none cursor-pointer transition max-w-[200px] sm:max-w-xs ${
                            normalizedRole === 'admin'
                              ? (isDarkMode ? 'bg-purple-950/60 border-purple-500 text-purple-300' : 'bg-purple-100 border-purple-300 text-purple-800')
                              : normalizedRole === 'team' || normalizedRole === 'member'
                              ? (isDarkMode ? 'bg-sky-950/60 border-sky-500 text-sky-300' : 'bg-sky-100 border-sky-300 text-sky-800')
                              : normalizedRole === 'terminated'
                              ? (isDarkMode ? 'bg-rose-950/60 border-rose-500 text-rose-300' : 'bg-rose-100 border-rose-300 text-rose-800')
                              : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-200 border-slate-300 text-slate-600')
                          }`}
                        >
                          <option value="admin">Admin (Full Access)</option>
                          <option value="Team">Team (Standard Access)</option>
                          <option value="member">Member (Standard Access)</option>
                          <option value="guest">Guest (Read Only / Pending)</option>
                          <option value="terminated">Terminated (Revoked)</option>
                          <option value="__CUSTOM__">+ Custom Role...</option>
                        </select>
                      )
                    )}

                    {/* Terminate button for other active users */}
                    {activeTab === 'all' && !isSelf && !isTerminated && (
                      <button
                        title="Terminate User Access"
                        onClick={() => handleTerminateUser(profile.id)}
                        className={`p-2 rounded-xl border transition ${
                          isDarkMode ? 'border-rose-900/50 text-rose-400 hover:bg-rose-950' : 'border-rose-200 text-rose-600 hover:bg-rose-50'
                        }`}
                      >
                        <UserMinus size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// --- INSTANT EXCEL SPREADSHEET VIEWER COMPONENT ---
function ExcelPreviewViewer({ url, isDarkMode }) {
  const [viewMode, setViewMode] = useState('original'); // 'original' vs 'data'
  const [sheets, setSheets] = useState({});
  const [sheetNames, setSheetNames] = useState([]);
  const [activeSheet, setActiveSheet] = useState('');
  const [filterText, setFilterText] = useState('');

  const encodedUrl = encodeURIComponent(url);
  const officeWebUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;

  useEffect(() => {
    if (viewMode !== 'data' || sheetNames.length > 0) return;
    let isMounted = true;
    async function loadExcelData() {
      try {
        let arrayBuffer;
        if (url.startsWith('data:')) {
          const res = await fetch(url);
          arrayBuffer = await res.arrayBuffer();
        } else {
          const response = await fetch(url);
          arrayBuffer = await response.arrayBuffer();
        }
        const wb = XLSX.read(arrayBuffer, { type: 'arraybuffer', cellDates: true });
        if (wb.SheetNames && wb.SheetNames.length > 0) {
          const parsed = {};
          wb.SheetNames.forEach(name => {
            parsed[name] = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: '' });
          });
          if (isMounted) {
            setSheets(parsed);
            setSheetNames(wb.SheetNames);
            setActiveSheet(wb.SheetNames[0]);
          }
        }
      } catch (err) {
        console.error("Data parse error:", err);
      }
    }
    loadExcelData();
    return () => { isMounted = false; };
  }, [url, viewMode, sheetNames.length]);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-xl relative">
      {/* VIEW MODE TOGGLE BAR */}
      <div className="px-3 py-1.5 border-b flex items-center justify-between gap-2 bg-slate-100 dark:bg-slate-900 shrink-0 border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-950 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setViewMode('original')}
            className={`px-3 py-1 rounded-lg transition cursor-pointer ${
              viewMode === 'original'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Original Excel View
          </button>
          <button
            onClick={() => setViewMode('data')}
            className={`px-3 py-1 rounded-lg transition cursor-pointer ${
              viewMode === 'data'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Raw Data Sheet
          </button>
        </div>

        {viewMode === 'data' && (
          <div className="flex items-center gap-2 max-w-xs">
            <Search size={14} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search content..."
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
              className="w-full text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none focus:border-sky-500"
            />
          </div>
        )}
      </div>

      {/* VIEWER BODY */}
      <div className="flex-1 overflow-hidden relative bg-white dark:bg-slate-950">
        {viewMode === 'original' ? (
          <iframe
            src={officeWebUrl}
            className="w-full h-full border-0 bg-white z-10"
            title="Original Excel View"
          />
        ) : (
          <div className="w-full h-full flex flex-col overflow-hidden bg-white dark:bg-slate-950">
            {sheetNames.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-2">
                <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-semibold text-sky-600">Extracting raw sheet data...</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-auto p-0">
                  <table className="w-full border-collapse text-xs text-left min-w-max">
                    <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold z-10 border-b border-slate-300 dark:border-slate-700">
                      <tr>
                        <th className="p-2 border-r border-slate-300 dark:border-slate-700 w-12 text-center text-[10px] bg-slate-200 dark:bg-slate-900 sticky left-0 z-20">#</th>
                        {Array.from({ length: (sheets[activeSheet] || []).reduce((max, r) => Math.max(max, Array.isArray(r) ? r.length : 0), 0) }).map((_, cIdx) => (
                          <th key={cIdx} className="p-2 border-r border-slate-300 dark:border-slate-700 min-w-[100px] text-[11px] font-extrabold uppercase text-center bg-slate-100 dark:bg-slate-800">
                            {String.fromCharCode(65 + (cIdx % 26))}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono text-[11px]">
                      {(filterText
                        ? (sheets[activeSheet] || []).filter(r => Array.isArray(r) && r.some(c => String(c).toLowerCase().includes(filterText.toLowerCase())))
                        : (sheets[activeSheet] || [])
                      ).map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-sky-50/60 dark:hover:bg-slate-900/70 transition">
                          <td className="p-2 border-r border-slate-200 dark:border-slate-800 text-center text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-900/50 select-none sticky left-0 z-10">
                            {rIdx + 1}
                          </td>
                          {Array.from({ length: (sheets[activeSheet] || []).reduce((max, r) => Math.max(max, Array.isArray(r) ? r.length : 0), 0) }).map((_, cIdx) => (
                            <td key={cIdx} className="p-2 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap overflow-hidden text-ellipsis max-w-[280px]">
                              {Array.isArray(row) && row[cIdx] !== undefined ? String(row[cIdx]) : ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {sheetNames.length > 1 && (
                  <div className="px-3 py-1.5 border-t bg-slate-100 dark:bg-slate-900 flex items-center gap-1.5 overflow-x-auto shrink-0 border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Sheets:</span>
                    {sheetNames.map(name => (
                      <button
                        key={name}
                        onClick={() => setActiveSheet(name)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                          activeSheet === name
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// --- INSTANT DOCUMENT PREVIEW MODAL COMPONENT ---
function DocPreviewModal({ docPreviewModal, closeDocPreview, isDarkMode, tModal, tText }) {
  if (!docPreviewModal?.isOpen || !docPreviewModal?.url) return null;

  const { url, title } = docPreviewModal;
  const lowerUrl = url.toLowerCase();
  const isImage = lowerUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i) || lowerUrl.startsWith('data:image');
  const isExcel = lowerUrl.match(/\.(xlsx|xls|csv|ods)($|\?)/i) || lowerUrl.includes('.xlsx') || lowerUrl.includes('.xls') || lowerUrl.includes('.csv');
  const isWordOrDoc = lowerUrl.match(/\.(docx|doc|pptx|ppt)($|\?)/i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-slate-950/80 backdrop-blur-md transition-all">
      <div className={`w-full max-w-5xl h-[88vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${tModal}`}>
        
        {/* Top Bar with Document Title & Action Controls */}
        <div className={`px-4 py-3 border-b flex items-center justify-between shrink-0 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-center gap-2 min-w-0 pr-2">
            {isExcel ? (
              <FileSpreadsheet size={18} className="text-emerald-500 shrink-0" />
            ) : (
              <FileText size={18} className="text-sky-500 shrink-0" />
            )}
            <span className={`font-bold text-xs sm:text-sm truncate ${tText}`}>{title || 'Document Preview'}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Download Button */}
            <a
              href={url}
              download
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-lg transition shadow-sm"
              title="Download File to your device"
            >
              <Download size={14} />
              <span>Download</span>
            </a>

            {/* Open in New Tab Button */}
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition border ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
              title="Open document in new browser tab"
            >
              <ExternalLink size={14} />
              <span className="hidden sm:inline">Open External</span>
            </a>

            {/* Close Button */}
            <button
              onClick={closeDocPreview}
              className={`p-1.5 rounded-lg border transition ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-rose-400' : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-rose-600'
              }`}
              title="Close Preview"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Document Content Viewer Body */}
        <div className="flex-1 overflow-hidden bg-slate-950/5 dark:bg-slate-950/40 relative flex items-center justify-center p-2">
          {isImage ? (
            <div className="w-full h-full flex items-center justify-center p-2 overflow-auto">
              <img src={url} alt={title} className="max-h-full max-w-full object-contain rounded-xl shadow-lg border border-slate-200 dark:border-slate-800" />
            </div>
          ) : isExcel ? (
            <ExcelPreviewViewer url={url} isDarkMode={isDarkMode} />
          ) : isWordOrDoc ? (
            <iframe src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`} className="w-full h-full border-0 rounded-xl bg-white" title={title} />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center relative rounded-xl overflow-hidden bg-white dark:bg-slate-950 shadow-inner">
              <iframe
                src={url}
                className="w-full h-full border-0 rounded-xl bg-white dark:bg-slate-950 z-10"
                title={title}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function ProjectTeamModal({
  tModal, tText, tMuted, tInput, customScrollbar, isDarkMode,
  setIsProjectTeamModalOpen, activeWorkId, works, projectAssignments,
  isAssignmentsLoading, assignUserToProject, endProjectAssignment, profiles, fetchProfiles,
  tenantMembers, isFetchingTenantMembers, fetchTenantMembers, tenantId, tenantRole, userRole, currentUser
}) {
  const activeWork = (works || []).find(w => w.id === activeWorkId);
  const activeAssignments = (projectAssignments || []).filter(a => a.status === 'active');
  const endedAssignments = (projectAssignments || []).filter(a => a.status === 'ended');

  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('member'); // 'lead' | 'member' | 'reviewer'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (fetchProfiles) fetchProfiles();
    if (fetchTenantMembers) fetchTenantMembers(tenantId);
  }, [tenantId]);

  // Derive active team users from tenant_memberships (authoritative active tenant members).
  // Exclude: terminated/inactive members, current Admin/user, and users already actively assigned to this project.
  const eligibleTeammates = (tenantMembers || [])
    .filter(m => (m.status === 'active' || !m.status) && (m.user_id || m.id))
    .map(member => {
      const targetUserId = member.user_id || member.id;
      const normId = String(targetUserId).trim().toLowerCase();
      const tm = (tenantMembers || []).find(m =>
        (m.user_id && String(m.user_id).trim().toLowerCase() === normId) ||
        (m.id && String(m.id).trim().toLowerCase() === normId)
      );
      const profileObj = (profiles || []).find(p =>
        (p.id && String(p.id).trim().toLowerCase() === normId) ||
        (p.user_id && String(p.user_id).trim().toLowerCase() === normId)
      );
      const email = member.email || member.user_email || member.invited_email || member.member_email ||
        (Array.isArray(member.profiles) ? member.profiles[0]?.email : member.profiles?.email) ||
        tm?.email || (Array.isArray(tm?.profiles) ? tm?.profiles[0]?.email : tm?.profiles?.email) ||
        profileObj?.email || profileObj?.user_email ||
        getUserDisplayName(targetUserId, profiles, tenantMembers);
      return {
        user_id: targetUserId, // Authoritative Auth User ID from tenant_memberships
        email,
        role: member.role || 'Team'
      };
    })
    .filter(u => {
      // Exclude current logged-in user / Admin
      if (currentUser?.id && u.user_id === currentUser.id) return false;
      if (currentUser?.email && u.email?.toLowerCase() === currentUser.email.toLowerCase()) return false;

      // Exclude users already actively assigned to the current project
      const isAlreadyAssigned = activeAssignments.some(a => a.user_id === u.user_id);
      if (isAlreadyAssigned) return false;

      return true;
    });

  const canManage = userRole === 'admin' || tenantRole === 'OWNER' || tenantRole === 'ADMIN' || tenantRole === 'MANAGER';

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      alert("Please select a user to assign.");
      return;
    }
    setIsSubmitting(true);
    const res = await assignUserToProject({
      workId: activeWorkId,
      userId: selectedUserId,
      projectRole: selectedRole
    });
    setIsSubmitting(false);
    if (res.success) {
      setSelectedUserId('');
      setSelectedRole('member');
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm rounded-2xl p-4">
      <div className={`${tModal} border p-6 rounded-2xl w-full max-w-2xl flex flex-col max-h-[90vh] shadow-2xl`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-4 shrink-0 pb-3 border-b border-slate-200/60 dark:border-slate-800">
          <div>
            <h3 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${tText}`}>
              <Users size={20} className="text-purple-500 shrink-0"/> Project Team & Assignments
            </h3>
            <p className={`text-[11px] sm:text-xs mt-0.5 ${tMuted}`}>
              Project: <span className="font-bold text-sky-500">{activeWork?.title || 'Selected Project'}</span>
            </p>
          </div>
          <button onClick={() => setIsProjectTeamModalOpen(false)} className={`${tMuted} hover:text-rose-500 transition-colors p-1.5 rounded-lg border ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-100'}`}>
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className={`flex-1 overflow-y-auto space-y-4 pr-1 ${customScrollbar}`}>
          
          {/* ASSIGN USER FORM (For Managers/Admins) */}
          {canManage && (
            <form onSubmit={handleAssignSubmit} className={`p-4 rounded-2xl border space-y-3 shrink-0 ${isDarkMode ? 'bg-purple-950/20 border-purple-500/30' : 'bg-purple-50/70 border-purple-200'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDarkMode ? 'text-purple-300' : 'text-purple-900'}`}>
                  <UserPlus size={14} /> Assign Teammate to Project
                </span>
                {isFetchingTenantMembers && <Loader2 size={13} className="animate-spin text-purple-500" />}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                <div className="flex-1 min-w-0">
                  <label className={`block text-[10px] font-bold uppercase mb-1 ${tMuted}`}>Select Tenant Teammate</label>
                  <select
                    required
                    value={selectedUserId}
                    onChange={e => setSelectedUserId(e.target.value)}
                    className={`w-full rounded-xl p-2.5 text-xs font-semibold border outline-none ${tInput}`}
                  >
                    <option value="">{isFetchingTenantMembers ? '-- Loading Teammates... --' : '-- Select Teammate --'}</option>
                    {eligibleTeammates.map(u => (
                      <option key={u.user_id} value={u.user_id}>
                        {u.email || u.user_id} ({u.role || 'Team'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full sm:w-36">
                  <label className={`block text-[10px] font-bold uppercase mb-1 ${tMuted}`}>Project Role</label>
                  <select
                    value={selectedRole}
                    onChange={e => setSelectedRole(e.target.value)}
                    className={`w-full rounded-xl p-2.5 text-xs font-bold border outline-none ${tInput}`}
                  >
                    <option value="member">Member</option>
                    <option value="lead">Lead</option>
                    <option value="reviewer">Reviewer</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !selectedUserId}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                  {isSubmitting ? 'Assigning...' : 'Assign User'}
                </button>
              </div>
            </form>
          )}

          {/* ACTIVE ASSIGNMENTS LIST */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className={`text-[11px] font-extrabold uppercase tracking-wider ${tMuted}`}>
                Active Team Members ({activeAssignments.length})
              </span>
              {(isAssignmentsLoading || isFetchingTenantMembers) && <Loader2 size={13} className="animate-spin text-sky-500" />}
            </div>

            {activeAssignments.length === 0 ? (
              <div className={`text-center py-6 border border-dashed rounded-2xl text-xs ${tMuted}`}>
                {isFetchingTenantMembers || isAssignmentsLoading ? 'Loading team members...' : 'No active team members assigned to this project yet.'}
              </div>
            ) : (
              activeAssignments.map(assignment => {
                const normAssigneeId = String(assignment.user_id || '').trim().toLowerCase();
                const normAssignerId = String(assignment.assigned_by || '').trim().toLowerCase();

                const tm = (tenantMembers || []).find(m =>
                  (m.user_id && String(m.user_id).trim().toLowerCase() === normAssigneeId) ||
                  (m.id && String(m.id).trim().toLowerCase() === normAssigneeId)
                );
                const assignerTm = (tenantMembers || []).find(m =>
                  (m.user_id && String(m.user_id).trim().toLowerCase() === normAssignerId) ||
                  (m.id && String(m.id).trim().toLowerCase() === normAssignerId)
                );

                const assigneeProfile = (profiles || []).find(p =>
                  (p.id && String(p.id).trim().toLowerCase() === normAssigneeId) ||
                  (p.user_id && String(p.user_id).trim().toLowerCase() === normAssigneeId)
                );
                const assignerProfile = (profiles || []).find(p =>
                  (p.id && String(p.id).trim().toLowerCase() === normAssignerId) ||
                  (p.user_id && String(p.user_id).trim().toLowerCase() === normAssignerId)
                );

                const userDisplayName = tm?.email || tm?.user_email || tm?.invited_email || tm?.member_email ||
                  (Array.isArray(tm?.profiles) ? tm?.profiles[0]?.email : tm?.profiles?.email) ||
                  assigneeProfile?.email || assigneeProfile?.user_email ||
                  getUserDisplayName(assignment.user_id, profiles, tenantMembers);
                const assignerDisplayName = assignerTm?.email || assignerTm?.user_email || assignerTm?.invited_email || assignerTm?.member_email ||
                  (Array.isArray(assignerTm?.profiles) ? assignerTm?.profiles[0]?.email : assignerTm?.profiles?.email) ||
                  assignerProfile?.email || assignerProfile?.user_email ||
                  getUserDisplayName(assignment.assigned_by, profiles, tenantMembers);

                const roleBadge = assignment.project_role === 'lead'
                  ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                  : assignment.project_role === 'reviewer'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-sky-500/20 text-sky-400 border-sky-500/40';

                const roleDisplay = assignment.project_role === 'lead' ? 'Lead' : assignment.project_role === 'reviewer' ? 'Reviewer' : 'Member';

                return (
                  <div key={assignment.id} className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs text-white shrink-0 ${
                        assignment.project_role === 'lead' ? 'bg-gradient-to-tr from-purple-600 to-indigo-600' : 'bg-gradient-to-tr from-sky-500 to-indigo-500'
                      }`}>
                        {(userDisplayName || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold truncate ${tText}`} title={userDisplayName}>
                            {userDisplayName}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${roleBadge}`}>
                            {roleDisplay}
                          </span>
                        </div>
                        <p className={`text-[10px] ${tMuted} mt-0.5`}>
                          Assigned: {new Date(assignment.assigned_at).toLocaleDateString()} by {assignerDisplayName}
                        </p>
                      </div>
                    </div>

                    {canManage && (
                      <button
                        onClick={() => endProjectAssignment(assignment.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-500/20 hover:border-rose-500/40 transition shrink-0 cursor-pointer"
                        title="End Assignment"
                      >
                        End Assignment
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* HISTORICAL / ENDED ASSIGNMENTS TOGGLE */}
          {endedAssignments.length > 0 && (
            <div className="pt-2 border-t border-slate-700/40">
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className={`text-xs font-bold flex items-center gap-1.5 transition ${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <History size={14} />
                <span>Assignment History ({endedAssignments.length} Ended)</span>
                <span className="text-[10px] text-sky-500 ml-1">{showHistory ? '▲ Hide' : '▼ Show'}</span>
              </button>

              {showHistory && (
                <div className="space-y-2 mt-2 pt-1">
                  {endedAssignments.map(assignment => {
                    const normAssigneeId = String(assignment.user_id || '').trim().toLowerCase();
                    const normAssignerId = String(assignment.assigned_by || '').trim().toLowerCase();

                    const tm = (tenantMembers || []).find(m =>
                      (m.user_id && String(m.user_id).trim().toLowerCase() === normAssigneeId) ||
                      (m.id && String(m.id).trim().toLowerCase() === normAssigneeId)
                    );
                    const assignerTm = (tenantMembers || []).find(m =>
                      (m.user_id && String(m.user_id).trim().toLowerCase() === normAssignerId) ||
                      (m.id && String(m.id).trim().toLowerCase() === normAssignerId)
                    );

                    const assigneeProfile = (profiles || []).find(p =>
                      (p.id && String(p.id).trim().toLowerCase() === normAssigneeId) ||
                      (p.user_id && String(p.user_id).trim().toLowerCase() === normAssigneeId)
                    );
                    const assignerProfile = (profiles || []).find(p =>
                      (p.id && String(p.id).trim().toLowerCase() === normAssignerId) ||
                      (p.user_id && String(p.user_id).trim().toLowerCase() === normAssignerId)
                    );

                    const userDisplayName = tm?.email || tm?.user_email || tm?.invited_email || tm?.member_email ||
                      (Array.isArray(tm?.profiles) ? tm?.profiles[0]?.email : tm?.profiles?.email) ||
                      assigneeProfile?.email || assigneeProfile?.user_email ||
                      getUserDisplayName(assignment.user_id, profiles, tenantMembers);
                    const assignerDisplayName = assignerTm?.email || assignerTm?.user_email || assignerTm?.invited_email || assignerTm?.member_email ||
                      (Array.isArray(assignerTm?.profiles) ? assignerTm?.profiles[0]?.email : assignerTm?.profiles?.email) ||
                      assignerProfile?.email || assignerProfile?.user_email ||
                      getUserDisplayName(assignment.assigned_by, profiles, tenantMembers);
                    const roleDisplay = assignment.project_role === 'lead' ? 'Lead' : assignment.project_role === 'reviewer' ? 'Reviewer' : 'Member';

                    return (
                      <div key={assignment.id} className={`p-3 rounded-2xl border text-xs opacity-75 ${isDarkMode ? 'bg-slate-950/40 border-slate-800/80 text-slate-400' : 'bg-slate-100/70 border-slate-200 text-slate-600'}`}>
                        <div className="flex justify-between font-bold mb-1">
                          <span className="truncate" title={userDisplayName}>{userDisplayName}</span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] uppercase font-bold border border-slate-700 bg-slate-800 text-slate-400">
                            {roleDisplay} (Ended)
                          </span>
                        </div>
                        <div className="flex justify-between text-[10px] opacity-75">
                          <span>Assigned: {new Date(assignment.assigned_at).toLocaleDateString()} by {assignerDisplayName}</span>
                          <span>Ended: {assignment.ended_at ? new Date(assignment.ended_at).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function ContactModal({
  tModal, tText, tMuted, tInput, isDarkMode, setIsContactModalOpen, editingContact, contactForm, setContactForm, saveContact, companies, units
}) {
  const [submitting, setSubmitting] = useState(false);
  const companyUnits = (units || []).filter(u => u.company_id === contactForm.company_id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await saveContact(contactForm);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className={`${tModal} border p-6 rounded-2xl w-full max-w-lg shadow-2xl my-auto`}>
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <h3 className={`text-base font-extrabold flex items-center gap-2 ${tText}`}>
            <Users size={18} className="text-sky-500" />
            {editingContact ? 'Edit Contact' : 'Create New Contact'}
          </h3>
          <button onClick={() => setIsContactModalOpen(false)} className={`${tMuted} hover:text-rose-500 transition`}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className={`block font-bold mb-1 ${tMuted}`}>Contact Name *</label>
            <input
              type="text"
              required
              value={contactForm.name || ''}
              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              placeholder="e.g. John Doe"
              className={`w-full p-2.5 rounded-xl border outline-none font-semibold ${tInput}`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block font-bold mb-1 ${tMuted}`}>Customer / Client Company *</label>
              <select
                required
                value={contactForm.company_id || ''}
                onChange={(e) => setContactForm({ ...contactForm, company_id: e.target.value, unit_id: '' })}
                className={`w-full p-2.5 rounded-xl border outline-none font-semibold ${tInput}`}
              >
                <option value="">Select Customer...</option>
                {(companies || []).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block font-bold mb-1 ${tMuted}`}>Client Unit (Optional)</label>
              <select
                value={contactForm.unit_id || ''}
                onChange={(e) => setContactForm({ ...contactForm, unit_id: e.target.value })}
                className={`w-full p-2.5 rounded-xl border outline-none font-semibold ${tInput}`}
              >
                <option value="">All Units / General</option>
                {companyUnits.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block font-bold mb-1 ${tMuted}`}>Email</label>
              <input
                type="email"
                value={contactForm.email || ''}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                placeholder="john@company.com"
                className={`w-full p-2.5 rounded-xl border outline-none ${tInput}`}
              />
            </div>

            <div>
              <label className={`block font-bold mb-1 ${tMuted}`}>Phone</label>
              <input
                type="text"
                value={contactForm.phone || ''}
                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                placeholder="+91 9876543210"
                className={`w-full p-2.5 rounded-xl border outline-none ${tInput}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block font-bold mb-1 ${tMuted}`}>Designation</label>
              <input
                type="text"
                value={contactForm.designation || ''}
                onChange={(e) => setContactForm({ ...contactForm, designation: e.target.value })}
                placeholder="Purchase Manager"
                className={`w-full p-2.5 rounded-xl border outline-none ${tInput}`}
              />
            </div>

            <div>
              <label className={`block font-bold mb-1 ${tMuted}`}>Department</label>
              <input
                type="text"
                value={contactForm.department || ''}
                onChange={(e) => setContactForm({ ...contactForm, department: e.target.value })}
                placeholder="Procurement"
                className={`w-full p-2.5 rounded-xl border outline-none ${tInput}`}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_primary"
              checked={Boolean(contactForm.is_primary)}
              onChange={(e) => setContactForm({ ...contactForm, is_primary: e.target.checked })}
              className="rounded text-sky-600 focus:ring-sky-500"
            />
            <label htmlFor="is_primary" className={`font-bold cursor-pointer select-none ${tText}`}>
              Mark as Primary Contact for this Customer
            </label>
          </div>

          <div>
            <label className={`block font-bold mb-1 ${tMuted}`}>Notes</label>
            <textarea
              rows={2}
              value={contactForm.notes || ''}
              onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
              placeholder="Additional details..."
              className={`w-full p-2.5 rounded-xl border outline-none ${tInput}`}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsContactModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {submitting && <Loader2 size={13} className="animate-spin" />}
              <span>{editingContact ? 'Save Changes' : 'Create Contact'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EnquiryModal({
  tModal, tText, tMuted, tInput, isDarkMode, setIsEnquiryModalOpen, editingEnquiry, enquiryForm, setEnquiryForm, saveEnquiry, companies, contacts, tenantMembers, profiles, getUserDisplayName
}) {
  const [submitting, setSubmitting] = useState(false);
  const companyContacts = (contacts || []).filter(c => c.company_id === enquiryForm.company_id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await saveEnquiry(enquiryForm);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className={`${tModal} border p-6 rounded-2xl w-full max-w-lg shadow-2xl my-auto`}>
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <h3 className={`text-base font-extrabold flex items-center gap-2 ${tText}`}>
            <FileText size={18} className="text-indigo-500" />
            {editingEnquiry ? 'Edit Sales Enquiry' : 'Create Sales Enquiry'}
          </h3>
          <button onClick={() => setIsEnquiryModalOpen(false)} className={`${tMuted} hover:text-rose-500 transition`}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className={`block font-bold mb-1 ${tMuted}`}>Enquiry Title *</label>
            <input
              type="text"
              required
              value={enquiryForm.title || ''}
              onChange={(e) => setEnquiryForm({ ...enquiryForm, title: e.target.value })}
              placeholder="e.g. Supply of HVAC Control System 200 Units"
              className={`w-full p-2.5 rounded-xl border outline-none font-semibold ${tInput}`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block font-bold mb-1 ${tMuted}`}>Customer Company *</label>
              <select
                required
                value={enquiryForm.company_id || ''}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, company_id: e.target.value, contact_id: '' })}
                className={`w-full p-2.5 rounded-xl border outline-none font-semibold ${tInput}`}
              >
                <option value="">Select Customer...</option>
                {(companies || []).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block font-bold mb-1 ${tMuted}`}>Customer Contact (Optional)</label>
              <select
                value={enquiryForm.contact_id || ''}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, contact_id: e.target.value })}
                className={`w-full p-2.5 rounded-xl border outline-none font-semibold ${tInput}`}
              >
                <option value="">Select Contact Person...</option>
                {companyContacts.map(c => (
                  <option key={c.id} value={c.id}>{c.name} {c.designation ? `(${c.designation})` : ''}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={`block font-bold mb-1 ${tMuted}`}>Status</label>
              <select
                value={enquiryForm.status || 'new'}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, status: e.target.value })}
                className={`w-full p-2.5 rounded-xl border outline-none font-semibold ${tInput}`}
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="proposal">Proposal</option>
                <option value="negotiation">Negotiation</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            <div>
              <label className={`block font-bold mb-1 ${tMuted}`}>Priority</label>
              <select
                value={enquiryForm.priority || 'medium'}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, priority: e.target.value })}
                className={`w-full p-2.5 rounded-xl border outline-none font-semibold ${tInput}`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className={`block font-bold mb-1 ${tMuted}`}>Lead Source</label>
              <select
                value={enquiryForm.source || 'website'}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, source: e.target.value })}
                className={`w-full p-2.5 rounded-xl border outline-none font-semibold ${tInput}`}
              >
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="exhibition">Exhibition</option>
                <option value="cold_call">Cold Call</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={`block font-bold mb-1 ${tMuted}`}>Assigned Sales Rep</label>
              <select
                value={enquiryForm.assigned_to || ''}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, assigned_to: e.target.value })}
                className={`w-full p-2.5 rounded-xl border outline-none font-semibold ${tInput}`}
              >
                <option value="">Unassigned</option>
                {(tenantMembers || []).map(tm => {
                  const uId = tm.user_id || tm.id;
                  const dName = getUserDisplayName(uId, profiles, tenantMembers);
                  return <option key={uId} value={uId}>{dName}</option>;
                })}
              </select>
            </div>

            <div>
              <label className={`block font-bold mb-1 ${tMuted}`}>Enquiry Date</label>
              <input
                type="date"
                value={enquiryForm.enquiry_date || ''}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, enquiry_date: e.target.value })}
                className={`w-full p-2.5 rounded-xl border outline-none ${tInput}`}
              />
            </div>

            <div>
              <label className={`block font-bold mb-1 ${tMuted}`}>Next Follow-up</label>
              <input
                type="date"
                value={enquiryForm.next_followup_date || ''}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, next_followup_date: e.target.value })}
                className={`w-full p-2.5 rounded-xl border outline-none ${tInput}`}
              />
            </div>
          </div>

          <div>
            <label className={`block font-bold mb-1 ${tMuted}`}>Description / Scope Details</label>
            <textarea
              rows={3}
              value={enquiryForm.description || ''}
              onChange={(e) => setEnquiryForm({ ...enquiryForm, description: e.target.value })}
              placeholder="Requirement summary, budget range, specifications..."
              className={`w-full p-2.5 rounded-xl border outline-none ${tInput}`}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsEnquiryModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {submitting && <Loader2 size={13} className="animate-spin" />}
              <span>{editingEnquiry ? 'Save Changes' : 'Create Enquiry'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FollowUpModal({
  tModal, tText, tMuted, tInput, isDarkMode, setIsFollowUpModalOpen, editingFollowUp, followUpForm, setFollowUpForm, saveFollowUp, companies, enquiries, tenantMembers, profiles, getUserDisplayName
}) {
  const [submitting, setSubmitting] = useState(false);
  const companyEnquiries = (enquiries || []).filter(e => e.company_id === followUpForm.company_id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await saveFollowUp(followUpForm);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className={`${tModal} border p-6 rounded-2xl w-full max-w-lg shadow-2xl my-auto`}>
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <h3 className={`text-base font-extrabold flex items-center gap-2 ${tText}`}>
            <CalendarClock size={18} className="text-amber-500" />
            {editingFollowUp ? 'Edit Follow-up Activity' : 'Schedule New Follow-up'}
          </h3>
          <button onClick={() => setIsFollowUpModalOpen(false)} className={`${tMuted} hover:text-rose-500 transition`}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block font-bold mb-1 ${tMuted}`}>Customer Company *</label>
              <select
                required
                value={followUpForm.company_id || ''}
                onChange={(e) => setFollowUpForm({ ...followUpForm, company_id: e.target.value, enquiry_id: '' })}
                className={`w-full p-2.5 rounded-xl border outline-none font-semibold ${tInput}`}
              >
                <option value="">Select Customer...</option>
                {(companies || []).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block font-bold mb-1 ${tMuted}`}>Linked Enquiry (Optional)</label>
              <select
                value={followUpForm.enquiry_id || ''}
                onChange={(e) => setFollowUpForm({ ...followUpForm, enquiry_id: e.target.value })}
                className={`w-full p-2.5 rounded-xl border outline-none font-semibold ${tInput}`}
              >
                <option value="">General Follow-up / None</option>
                {companyEnquiries.map(enq => (
                  <option key={enq.id} value={enq.id}>{enq.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={`block font-bold mb-1 ${tMuted}`}>Activity Type *</label>
              <select
                required
                value={followUpForm.activity_type || 'call'}
                onChange={(e) => setFollowUpForm({ ...followUpForm, activity_type: e.target.value })}
                className={`w-full p-2.5 rounded-xl border outline-none font-semibold ${tInput}`}
              >
                <option value="call">Phone Call</option>
                <option value="meeting">In-Person Meeting</option>
                <option value="email">Email Follow-up</option>
                <option value="site_visit">Site Visit</option>
                <option value="quote_sent">Quote / Proposal Follow-up</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className={`block font-bold mb-1 ${tMuted}`}>Due Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={followUpForm.due_date || ''}
                onChange={(e) => setFollowUpForm({ ...followUpForm, due_date: e.target.value })}
                className={`w-full p-2.5 rounded-xl border outline-none ${tInput}`}
              />
            </div>

            <div>
              <label className={`block font-bold mb-1 ${tMuted}`}>Status</label>
              <select
                value={followUpForm.status || 'pending'}
                onChange={(e) => setFollowUpForm({ ...followUpForm, status: e.target.value })}
                className={`w-full p-2.5 rounded-xl border outline-none font-semibold ${tInput}`}
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className={`block font-bold mb-1 ${tMuted}`}>Assigned User</label>
            <select
              value={followUpForm.assigned_to || ''}
              onChange={(e) => setFollowUpForm({ ...followUpForm, assigned_to: e.target.value })}
              className={`w-full p-2.5 rounded-xl border outline-none font-semibold ${tInput}`}
            >
              <option value="">Assign User...</option>
              {(tenantMembers || []).map(tm => {
                const uId = tm.user_id || tm.id;
                const dName = getUserDisplayName(uId, profiles, tenantMembers);
                return <option key={uId} value={uId}>{dName}</option>;
              })}
            </select>
          </div>

          <div>
            <label className={`block font-bold mb-1 ${tMuted}`}>Activity Notes / Minutes</label>
            <textarea
              rows={3}
              value={followUpForm.notes || ''}
              onChange={(e) => setFollowUpForm({ ...followUpForm, notes: e.target.value })}
              placeholder="Action items, discussion outcome, agenda..."
              className={`w-full p-2.5 rounded-xl border outline-none ${tInput}`}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsFollowUpModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {submitting && <Loader2 size={13} className="animate-spin" />}
              <span>{editingFollowUp ? 'Save Changes' : 'Schedule Follow-up'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}