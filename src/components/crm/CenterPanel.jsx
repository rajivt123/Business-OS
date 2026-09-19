import React, { useEffect, useState } from 'react'
import { ChevronRight, Plus, FileText, Edit2, Trash2, Settings, AlertCircle, CheckCircle2, Circle, History, Check, Paperclip, Send, Loader2, Bell, X, ArrowRightLeft, Sparkles, Eye, Users, UserPlus, Shield, Phone, Mail, CalendarClock, Tag, Filter, CheckSquare, Square, Building2 } from 'lucide-react'
import { useCrm } from '../../context/CrmContext'

export default function CenterPanel() {
  const {
    isDarkMode, userRole, tenantRole, currentUser, profiles, companies, activeCompanyId, setActiveCompanyId, handleRenameCompany, units, activeUnitId, setActiveUnitId, handleRenameUnit, works, activeWorkId, setActiveWorkId,
    centerView, setCenterView, activeStageIndex, setActiveStageIndex, openStageManager, stageDefinitions, isStageDefinitionsLoading, openStageAssignmentModal,
    issues, activeIssueId, setActiveIssueId, setIsIssueModalOpen, toggleIssueStatus,
    logs, logInput, setLogInput, editingLogId, setEditingLogId, editLogContent, setEditLogContent, setHistoryLog, attachment, setAttachment, isUploading, setIsBinModalOpen,
    reminders, openNewWorkModal, openEditWorkModal, handleDeleteWork, openMoveLogModal,
    startEditingLog, saveLogEdit, handleDeleteLog, openReminderForLog, handleAddLog, aiSummary, setAiSummary, isAiLoading, handleSummarizeProject,
    openDocPreview,
    projectAssignments, setIsProjectTeamModalOpen, getActiveProjectAssignments, tenantMembers, getUserDisplayName,
    contacts, isContactsLoading, openNewContactModal, openEditContactModal, handleDeleteContact,
    enquiries, isEnquiriesLoading, openNewEnquiryModal, openEditEnquiryModal, handleDeleteEnquiry, saveEnquiry,
    followUps, isFollowUpsLoading, openNewFollowUpModal, openEditFollowUpModal, handleDeleteFollowUp, toggleFollowUpStatus
  } = useCrm()

  const pendingFollowUpsCount = (followUps || []).filter(f => f.status === 'pending').length

  const activeCompany = (companies || []).find(c => c.id === activeCompanyId)
  const activeUnit = (units || []).find(u => u.id === activeUnitId)
  const activeWork = (works || []).find(w => w.id === activeWorkId)
  
  const activeAssignments = getActiveProjectAssignments ? getActiveProjectAssignments(activeWorkId) : []
  const activeStages = (stageDefinitions || [])
    .filter(s => s.status === 'active')
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
  const isProjectLead = activeAssignments.some(
    a => a.user_id === currentUser?.id && a.project_role === 'lead'
  )
  const canManageAssignments = userRole === 'admin' || tenantRole === 'OWNER' || tenantRole === 'ADMIN' || tenantRole === 'MANAGER'
  const canManageStageDefinitions = canManageAssignments
  const canManageStageAssignments = canManageAssignments || isProjectLead

  const visibleLogs = (logs || []).filter(log => !log.is_deleted)
  const deletedLogs = (logs || []).filter(log => log.is_deleted)
  const deletedReminders = (reminders || []).filter(r => r.is_deleted)
  const totalDeleted = deletedLogs.length + deletedReminders.length 
  const openIssuesCount = (issues || []).filter(i => i.status === 'open').length

  useEffect(() => {
    if (activeWorkId) { const activeCard = document.getElementById(`work-card-${activeWorkId}`); if (activeCard) activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }) }
  }, [activeWorkId])

  const tCard = "os-card"
  const tHeader = "border-b border-[var(--os-border)] bg-[var(--os-surface-2)]"
  const tText = isDarkMode ? "text-slate-100" : "text-slate-900 font-semibold"
  const tMuted = "text-[var(--os-muted)]"
  const tInput = "os-input"
  const customScrollbar = "custom-scrollbar"

  const currentStageName = activeStages[activeStageIndex]?.name || activeWork?.stages?.[activeStageIndex] || ''
  const logPlaceholderText = centerView === 'pipeline' ? `Log update for ${currentStageName}...` : `Log update for issue...`

  return (
    <div className="os-card flex-1 w-full min-h-0 flex flex-col overflow-hidden">

      {/* PANEL BODY CONTENT AREA */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* PROJECTS / WORKS COLUMN (LEFT SIDE OF CENTER PANEL) */}
        <div className="lg:w-64 xl:w-72 border-b lg:border-b-0 lg:border-r border-[var(--os-border)] bg-[var(--os-surface-2)] flex flex-col shrink-0">
          {/* Work Column Header */}
          <div className="flex justify-between items-center px-3.5 py-2.5 border-b border-[var(--os-border)] shrink-0">
            <span className="os-label font-bold mb-0">Projects & POs</span>
            <button 
              onClick={openNewWorkModal} 
              disabled={!activeUnitId} 
              className="os-primary py-1 px-2.5 text-xs disabled:opacity-40 cursor-pointer"
            >
              <Plus size={13} /> <span>New PO/WO</span>
            </button>
          </div>

          {/* Work Cards List */}
          <div className="flex-1 flex flex-row lg:flex-col gap-2 p-2.5 overflow-x-auto lg:overflow-x-hidden lg:overflow-y-auto custom-scrollbar">
            {(works || []).length === 0 ? (
              <div className="text-[11px] text-slate-400 p-3 italic text-center">No PO/WO projects found.</div>
            ) : (
              (works || []).map(w => {
                const isActive = activeWorkId === w.id;
                return (
                  <div 
                    key={w.id} 
                    id={`work-card-${w.id}`} 
                    onClick={() => setActiveWorkId(w.id)} 
                    className={`cursor-pointer p-3 rounded-xl border transition-all text-xs shrink-0 w-[78vw] sm:w-60 lg:w-auto ${
                      isActive 
                        ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/30 shadow-xs' 
                        : 'border-[var(--os-border)] bg-[var(--os-surface)] hover:border-sky-300 dark:hover:border-sky-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div className={`flex gap-1.5 items-center min-w-0 ${isActive ? 'text-sky-600 dark:text-sky-400 font-bold' : tText}`}>
                        <FileText size={15} className="shrink-0 text-sky-500" /> 
                        <span className="font-semibold text-xs leading-snug whitespace-normal truncate">{w.title}</span>
                      </div>
                      {isActive && (
                        <div className="flex gap-0.5 shrink-0">
                          <button onClick={(e) => { e.stopPropagation(); openEditWorkModal(w) }} className="os-link p-1" title="Edit PO/WO"><Edit2 size={13}/></button>
                          {/* RBAC: Only Admins can delete projects */}
                          {userRole === 'admin' && (
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteWork(w.id) }} className="text-slate-400 hover:text-rose-600 p-1 rounded transition" title="Delete Work"><Trash2 size={13}/></button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-auto pt-1">
                      {w.po_number && (
                        w.po_file_url ? (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); openDocPreview(w.po_file_url, `${w.title} - PO Document`); }}
                            className="os-tab bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 py-0.5 px-1.5 text-[9px] font-bold tracking-wider uppercase flex items-center gap-1 cursor-pointer"
                            title="Instant View PO Document"
                          >
                            <Eye size={10} /> PO: {w.po_number}
                          </button>
                        ) : (
                          <span className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 py-0.5 px-1.5 rounded text-[9px] font-bold tracking-wider uppercase">PO: {w.po_number}</span>
                        )
                      )}

                      {w.wo_number && (
                        w.wo_file_url ? (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); openDocPreview(w.wo_file_url, `${w.title} - WO Document`); }}
                            className="os-tab bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 text-sky-700 dark:text-sky-400 py-0.5 px-1.5 text-[9px] font-bold tracking-wider uppercase flex items-center gap-1 cursor-pointer"
                            title="Instant View WO Document"
                          >
                            <Eye size={10} /> WO: {w.wo_number}
                          </button>
                        ) : (
                          <span className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 py-0.5 px-1.5 rounded text-[9px] font-bold tracking-wider uppercase">WO: {w.wo_number}</span>
                        )
                      )}

                      {w.boq_url && (
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); openDocPreview(w.boq_url, `${w.title} - BOQ`); }} 
                          className="os-tab bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400 py-0.5 px-1.5 text-[9px] font-bold tracking-wider uppercase flex items-center gap-1 cursor-pointer"
                          title="Instant View BOQ Document"
                        >
                          <Eye size={10} /> BOQ
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* WORK CONTENT AREA (CRM VIEWS, STAGE STEPPER & LOG FEED) */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-transparent">
          {/* TAB SWITCHER & ASSIGNED TEAM BAR */}
          <div className="px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--os-border)] bg-[var(--os-surface)] shrink-0">
            <div className="flex gap-1 items-center overflow-x-auto custom-scrollbar py-0.5">
              <button onClick={() => setCenterView('pipeline')} className={`os-tab ${centerView === 'pipeline' ? 'active' : ''}`}>
                Pipeline Status
              </button>
              <button onClick={() => setCenterView('contacts')} className={`os-tab flex items-center gap-1 ${centerView === 'contacts' ? 'active' : ''}`}>
                Contacts {(contacts || []).length > 0 && <span className="bg-sky-500/20 text-sky-600 dark:text-sky-400 text-[9px] px-1.5 py-0.2 rounded-full font-bold">{(contacts || []).length}</span>}
              </button>
              <button onClick={() => setCenterView('enquiries')} className={`os-tab flex items-center gap-1 ${centerView === 'enquiries' ? 'active' : ''}`}>
                Enquiries {(enquiries || []).length > 0 && <span className="bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[9px] px-1.5 py-0.2 rounded-full font-bold">{(enquiries || []).length}</span>}
              </button>
              <button onClick={() => setCenterView('follow_ups')} className={`os-tab flex items-center gap-1 ${centerView === 'follow_ups' ? 'active' : ''}`}>
                Follow-ups {pendingFollowUpsCount > 0 && <span className="bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[9px] px-1.5 py-0.2 rounded-full font-bold">{pendingFollowUpsCount}</span>}
              </button>
              <button onClick={() => setCenterView('issues')} className={`os-tab flex items-center gap-1 ${centerView === 'issues' ? 'active' : ''}`}>
                Issues & Snags {openIssuesCount > 0 && <span className="bg-rose-600 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">{openIssuesCount}</span>}
              </button>
            </div>

            {/* ASSIGNED TEAM STACK & MANAGE BUTTON */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <Users size={14} className="text-purple-500 shrink-0" />
                <span className="text-[11px] font-bold text-[var(--os-muted)]">Team:</span>
                {activeAssignments.length === 0 ? (
                  <span className="text-[11px] italic text-slate-400">Unassigned</span>
                ) : (
                  <div className="flex items-center gap-1 max-w-[280px] overflow-x-auto custom-scrollbar">
                    {activeAssignments.slice(0, 3).map(assignment => {
                      const displayName = getUserDisplayName ? getUserDisplayName(assignment.user_id, profiles, tenantMembers) : assignment.user_id;
                      const userLabel = displayName.includes('@') ? displayName.split('@')[0] : displayName;
                      const roleLabel = assignment.project_role === 'lead' ? 'Lead' : assignment.project_role === 'reviewer' ? 'Reviewer' : 'Member';
                      const badgeStyle = assignment.project_role === 'lead'
                        ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 font-bold'
                        : assignment.project_role === 'reviewer'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold'
                        : 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30 font-bold';

                      return (
                        <span key={assignment.id} className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 shrink-0 ${badgeStyle}`} title={`${displayName} - ${roleLabel}`}>
                          <span>{userLabel}</span>
                          <span className="text-[9px] opacity-75">({roleLabel})</span>
                        </span>
                      );
                    })}
                    {activeAssignments.length > 3 && (
                      <span className="text-[10px] font-bold text-slate-400">+{activeAssignments.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>

              {canManageAssignments && (
                <button
                  onClick={() => setIsProjectTeamModalOpen(true)}
                  className="os-secondary text-[11px] h-7 px-2.5 cursor-pointer"
                  title="Manage Project Team Assignments"
                >
                  <UserPlus size={12} />
                  <span>Manage Team</span>
                </button>
              )}
            </div>
          </div>

          {/* STAGE PROCESS STEPPER BAR */}
          <div className="px-3.5 py-2 border-b border-[var(--os-border)] bg-[var(--os-surface-2)] flex items-center gap-2 overflow-x-auto shrink-0 custom-scrollbar">
                {centerView === 'pipeline' ? (
                  <div className="flex items-center flex-1 min-w-0">
                    {isStageDefinitionsLoading ? (
                      <div className={`text-[11px] ${tMuted} flex items-center gap-1.5`}>
                        <Loader2 size={13} className="animate-spin" /> Loading stages...
                      </div>
                    ) : activeStages.length === 0 ? (
                      <div className={`text-[11px] italic ${tMuted}`}>No active stages defined.</div>
                    ) : (
                      <div className="flex items-center min-w-0 overflow-x-auto">
                        {activeStages.map((stage, index) => {
                          const isActive = activeStageIndex === index
                          return (
                            <div key={stage.id} className="flex items-center shrink-0">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setActiveStageIndex(index)}
                                  className={`os-tab px-3 py-1 font-semibold whitespace-nowrap ${
                                    isActive
                                      ? 'active font-bold'
                                      : 'hover:bg-slate-200 dark:hover:bg-slate-800'
                                  }`}
                                >
                                  <span className="opacity-75 mr-1">{index + 1}.</span> {stage.name}
                                </button>
                                {canManageStageAssignments && (
                                  <button
                                    type="button"
                                    onClick={() => openStageAssignmentModal(stage.id)}
                                    className="p-1 rounded-full border border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition"
                                    title={`Manage ${stage.name} responsibility`}
                                  >
                                    <Users size={11} />
                                  </button>
                                )}
                              </div>
                              {index < activeStages.length - 1 && (
                                <div className="w-4 sm:w-6 h-0.5 mx-1.5 shrink-0 bg-[var(--os-border)]" />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {canManageStageDefinitions && (
                      <button
                        onClick={openStageManager}
                        className="ml-auto os-secondary text-[11px] h-7 px-2.5 shrink-0 cursor-pointer"
                      >
                        <Settings size={13} /> Manage Stages
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button onClick={() => setIsIssueModalOpen(true)} className="os-secondary text-rose-600 dark:text-rose-400 h-7 px-2.5 text-xs font-semibold cursor-pointer">
                      <Plus size={13}/> Report Issue
                    </button>
                    {(issues || []).map(issue => (
                      <div key={issue.id} className={`flex rounded-lg overflow-hidden border transition-all ${activeIssueId === issue.id ? 'border-rose-600 shadow-xs' : 'border-[var(--os-border)]'}`}>
                        <button onClick={() => setActiveIssueId(issue.id)} className={`px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${activeIssueId === issue.id ? 'bg-rose-600 text-white' : 'bg-[var(--os-surface-2)] text-[var(--os-text)]'}`}>{issue.title}</button>
                        <button onClick={() => toggleIssueStatus(issue.id, issue.status)} className={`px-2 py-1 text-[9px] font-bold tracking-wider uppercase border-l transition-colors ${activeIssueId === issue.id ? (issue.status === 'open' ? 'bg-rose-800 border-rose-700 text-white' : 'bg-emerald-600 border-emerald-500 text-white') : 'bg-[var(--os-surface)] border-[var(--os-border)] text-slate-500'}`}>{issue.status === 'open' ? 'RESOLVE' : 'REOPEN'}</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

          {/* CRM FULL VIEW PANELS (CONTACTS, ENQUIRIES, FOLLOW-UPS) */}
          {centerView === 'contacts' ? (
            <ContactsView
              isDarkMode={isDarkMode}
              tCard={tCard}
              tText={tText}
              tMuted={tMuted}
              customScrollbar={customScrollbar}
              contacts={contacts}
              isContactsLoading={isContactsLoading}
              companies={companies}
              units={units}
              activeCompanyId={activeCompanyId}
              setActiveCompanyId={setActiveCompanyId}
              openNewContactModal={openNewContactModal}
              openEditContactModal={openEditContactModal}
              handleDeleteContact={handleDeleteContact}
              openNewEnquiryModal={openNewEnquiryModal}
            />
          ) : centerView === 'enquiries' ? (
            <EnquiriesView
              isDarkMode={isDarkMode}
              tCard={tCard}
              tText={tText}
              tMuted={tMuted}
              customScrollbar={customScrollbar}
              enquiries={enquiries}
              isEnquiriesLoading={isEnquiriesLoading}
              companies={companies}
              contacts={contacts}
              activeCompanyId={activeCompanyId}
              setActiveCompanyId={setActiveCompanyId}
              openNewEnquiryModal={openNewEnquiryModal}
              openEditEnquiryModal={openEditEnquiryModal}
              handleDeleteEnquiry={handleDeleteEnquiry}
              saveEnquiry={saveEnquiry}
              openNewFollowUpModal={openNewFollowUpModal}
              openNewWorkModal={openNewWorkModal}
              tenantMembers={tenantMembers}
              profiles={profiles}
              getUserDisplayName={getUserDisplayName}
            />
          ) : centerView === 'follow_ups' ? (
            <FollowUpsView
              isDarkMode={isDarkMode}
              tCard={tCard}
              tText={tText}
              tMuted={tMuted}
              customScrollbar={customScrollbar}
              followUps={followUps}
              isFollowUpsLoading={isFollowUpsLoading}
              companies={companies}
              enquiries={enquiries}
              activeCompanyId={activeCompanyId}
              setActiveCompanyId={setActiveCompanyId}
              openNewFollowUpModal={openNewFollowUpModal}
              openEditFollowUpModal={openEditFollowUpModal}
              handleDeleteFollowUp={handleDeleteFollowUp}
              toggleFollowUpStatus={toggleFollowUpStatus}
              tenantMembers={tenantMembers}
              profiles={profiles}
              getUserDisplayName={getUserDisplayName}
            />
          ) : !activeUnitId ? (
            <div className={`flex-1 flex items-center justify-center text-xs font-medium m-6 border border-dashed rounded-xl ${isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
              Select a Unit from the navigation header or sidebar.
            </div>
          ) : !activeWorkId ? (
            <div className={`flex-1 flex items-center justify-center text-xs font-medium m-6 border border-dashed rounded-xl ${isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
              Select or Create a PO/WO project card.
            </div>
          ) : (
            <>


              {/* LOG FEED & AI BANNER CONTAINER */}
              <div className={`flex-1 flex flex-col min-h-0 ${isDarkMode ? 'bg-slate-950/20' : 'bg-slate-50/40'}`}>
                
                {/* AI PROJECT ASSISTANT BANNER */}
                {centerView === 'pipeline' && visibleLogs.length > 0 && (
                  <div className={`m-3 p-3 rounded-xl border shadow-xs transition-all ${isDarkMode ? 'bg-gradient-to-r from-sky-950/40 via-indigo-950/40 to-slate-900 border-indigo-500/20' : 'bg-gradient-to-r from-sky-50/60 via-indigo-50/60 to-purple-50/60 border-indigo-200/80'}`}>
                    <div className="flex justify-between items-center">
                      <h4 className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>
                        <Sparkles size={14} className="text-amber-400 shrink-0" /> AI Project Assistant
                      </h4>
                      <button 
                        onClick={handleSummarizeProject} 
                        disabled={isAiLoading} 
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-[11px] font-semibold rounded-md transition shadow-xs flex items-center gap-1 cursor-pointer"
                      >
                        {isAiLoading ? <Loader2 size={13} className="animate-spin" /> : '✨'} 
                        {isAiLoading ? 'Analyzing...' : 'Summarize Project'}
                      </button>
                    </div>
                    
                    {aiSummary && (
                      <div className={`mt-2.5 p-2.5 rounded-lg text-xs border relative ${isDarkMode ? 'bg-slate-950/60 border-indigo-500/20 text-slate-300' : 'bg-white border-indigo-100 text-slate-700 shadow-xs'}`}>
                        <button onClick={() => setAiSummary('')} className="absolute top-2 right-2 text-slate-400 hover:text-rose-500"><X size={13}/></button>
                        <p className="pr-4 leading-relaxed">{aiSummary}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* STAGE UPDATE LOG FEED */}
                <div className={`flex-1 overflow-y-auto p-3 space-y-2.5 ${customScrollbar}`}>
                  {visibleLogs.length === 0 ? (
                    <div className={`h-full flex items-center justify-center text-xs font-medium border border-dashed rounded-xl p-4 ${isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                      {centerView === 'issues' && !activeIssueId ? 'Create or select an issue above to start logging.' : 'No active logs for this stage yet. Type below to add an update!'}
                    </div>
                  ) : (
                    visibleLogs.map(log => {
                      const isEditing = editingLogId === log.id
                      const hasEdits = log.edit_count > 0
                      const logReminder = (reminders || []).find(r => r.log_id === log.id && !r.is_completed && !r.is_deleted);

                      return (
                        <div key={log.id} className={`shrink-0 px-3 py-2.5 rounded-xl border shadow-xs group transition-all duration-200 ${isDarkMode ? 'bg-slate-900/90 border-slate-800/80 hover:border-slate-700' : 'bg-white border-slate-200/70 hover:border-sky-300'}`}>
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex gap-2 items-center">
                              {hasEdits && <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>Edited ({log.edit_count})</span>}
                              {hasEdits && userRole === 'admin' && <button onClick={() => setHistoryLog(log)} className="text-[9px] font-bold text-sky-600 hover:text-sky-500 flex items-center gap-1 transition"><History size={10} /> History</button>}
                            </div>
                            <div className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity flex gap-0.5">
                              {!isEditing && (
                                <>
                                  <button type="button" onClick={() => openMoveLogModal(log)} className={`p-1.5 min-w-[28px] min-h-[28px] flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${tMuted} hover:text-indigo-500 transition`} title="Move to Different Stage"><ArrowRightLeft size={13} /></button>
                                  <button type="button" onClick={() => startEditingLog(log)} className={`p-1.5 min-w-[28px] min-h-[28px] flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${tMuted} hover:text-sky-600 transition`} title="Edit Log"><Edit2 size={13} /></button>
                                </>
                              )}
                              {/* RBAC: Only Admins can delete logs */}
                              {userRole === 'admin' && (
                                <button type="button" onClick={() => handleDeleteLog(log.id)} className={`p-1.5 min-w-[28px] min-h-[28px] flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${tMuted} hover:text-rose-600 transition`} title="Move to Bin"><Trash2 size={13} /></button>
                              )}
                            </div>
                          </div>
                          {isEditing ? (
                            <div className="flex flex-col gap-2">
                              <textarea value={editLogContent} onChange={e => setEditLogContent(e.target.value)} className={`w-full rounded p-2 text-xs outline-none border focus:border-sky-500 min-h-10 ${tInput}`} />
                              <div className="flex justify-end gap-2 mt-1">
                                <button type="button" onClick={() => setEditingLogId(null)} className={`px-3 py-1.5 text-xs font-semibold rounded border ${tMuted} hover:bg-slate-800/40`}>Cancel</button>
                                <button type="button" onClick={() => saveLogEdit(log)} className="px-3 py-1.5 text-xs font-semibold rounded bg-sky-600 text-white hover:bg-sky-500 flex items-center gap-1"><Check size={13}/> Save</button>
                              </div>
                            </div>
                          ) : (
                            <p className={`text-xs leading-relaxed whitespace-pre-wrap ${tText}`}>{log.content}</p>
                          )}
                          
                          {log.attachment_url && (
                            <div className="mt-2 mb-1">
                              {log.attachment_url.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                                <img 
                                  src={log.attachment_url} 
                                  alt="Attached file" 
                                  onClick={() => openDocPreview(log.attachment_url, 'Log Attachment')} 
                                  className="max-h-40 rounded-xl border border-slate-200 dark:border-slate-800 object-cover cursor-pointer hover:opacity-90 transition-all duration-200 shadow-xs" 
                                />
                              ) : (
                                <button 
                                  type="button" 
                                  onClick={() => openDocPreview(log.attachment_url, 'Log Attachment')} 
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border shadow-xs ${isDarkMode ? 'bg-slate-950 border-slate-800 text-sky-400 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 text-sky-700 hover:bg-slate-100'}`}
                                >
                                  <Eye size={13} /> Instant View Attachment
                                </button>
                              )}
                            </div>
                          )}

                          <div className={`mt-1.5 flex items-center justify-between text-[10px] font-medium ${tMuted}`}>
                            {logReminder ? (
                              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[10px] font-semibold transition">
                                <Bell size={10} /> 
                                {logReminder.target_date ? `Reminder: ${new Date(logReminder.target_date).toLocaleDateString([], {month:'short', day:'numeric'})}` : 'Reminder Active'}
                              </span>
                            ) : (
                              <button onClick={() => openReminderForLog(log)} className="text-amber-600 hover:text-amber-500 flex items-center gap-1 font-semibold transition">
                                <Bell size={10} /> Set Reminder
                              </button>
                            )}
                            <span>{new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
                
                {/* STICKY INPUT BAR AT BOTTOM OF CENTER PANEL */}
                <div className={`p-2.5 sm:p-3 border-t border-slate-200/70 dark:border-slate-800/80 shrink-0 flex flex-col gap-2 ${tHeader}`}>
                  {attachment && (
                    <div className="flex items-center justify-between bg-sky-50 border border-sky-200 dark:bg-sky-500/10 dark:border-sky-500/30 rounded-lg px-2.5 py-1 mb-0.5 shadow-xs">
                      <span className="text-xs font-semibold text-sky-700 dark:text-sky-400 truncate flex items-center gap-1"><Paperclip size={12}/> {attachment.name}</span>
                      <button onClick={() => setAttachment(null)} className="text-slate-400 hover:text-rose-500"><X size={13}/></button>
                    </div>
                  )}

                  <form onSubmit={handleAddLog} className="flex gap-2 w-full">
                    <input type="file" id="file-upload" className="hidden" onChange={e => setAttachment(e.target.files[0])} disabled={centerView === 'issues' && !activeIssueId || isUploading} />
                    <label htmlFor="file-upload" className={`cursor-pointer flex items-center justify-center px-2.5 rounded-lg border transition-all duration-200 shadow-xs ${centerView === 'issues' && !activeIssueId ? 'opacity-50 cursor-not-allowed' : isDarkMode ? 'border-slate-800 hover:bg-slate-800 bg-slate-900' : 'border-slate-300 hover:bg-slate-100 bg-white'}`}><Paperclip size={15} className={tMuted} /></label>
                    <input type="text" value={logInput} onChange={e => setLogInput(e.target.value)} disabled={centerView === 'issues' && !activeIssueId || isUploading} placeholder={logPlaceholderText} className={`flex-1 rounded-lg px-3 py-1.5 text-xs outline-none border shadow-inner disabled:opacity-50 ${tInput}`} />
                    <button type="submit" disabled={(!logInput.trim() && !attachment) || (centerView === 'issues' && !activeIssueId) || isUploading} className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white px-3.5 py-1.5 rounded-lg transition-all duration-200 shadow-xs flex items-center gap-1.5 font-semibold text-xs cursor-pointer hover:scale-105 active:scale-95">
                      {isUploading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />} {isUploading ? 'Uploading...' : 'Post'}
                    </button>
                  </form>
                  
                  <div className="flex justify-end items-center px-0.5">
                    {/* RBAC: Only Admins can see or use the Recycle Bin */}
                    {userRole === 'admin' && totalDeleted > 0 ? (
                      <button onClick={() => setIsBinModalOpen(true)} className="text-[10px] font-semibold text-rose-600 hover:text-rose-500 flex items-center gap-1 uppercase tracking-wider transition">
                        <Trash2 size={11}/> Recycle Bin ({totalDeleted})
                      </button>
                    ) : <div/>}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function ContactsView({
  isDarkMode, tCard, tText, tMuted, customScrollbar, contacts, isContactsLoading, companies, units, activeCompanyId, setActiveCompanyId, openNewContactModal, openEditContactModal, handleDeleteContact, openNewEnquiryModal
}) {
  const [filterQuery, setFilterQuery] = useState('');
  const activeCompany = (companies || []).find(c => c.id === activeCompanyId);

  const displayedContacts = (contacts || []).filter(c => {
    if (activeCompanyId && c.company_id !== activeCompanyId) return false;
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q) ||
      (c.designation || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 dark:border-slate-800/80 pb-3">
        <div>
          <h2 className={`text-base font-extrabold flex items-center gap-2 ${tText}`}>
            <Users size={18} className="text-sky-500" />
            Customer Contacts {activeCompany ? `— ${activeCompany.name}` : ''}
          </h2>
          <p className={`text-xs ${tMuted}`}>Manage client directory, primary contacts, and designations</p>
        </div>

        <div className="flex items-center gap-2">
          {activeCompanyId && (
            <button
              onClick={() => setActiveCompanyId(null)}
              className="px-2.5 py-1 rounded-lg border text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Show All Customers
            </button>
          )}
          <button
            onClick={() => openNewContactModal(activeCompanyId)}
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} /> Add Contact
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          placeholder="Filter contacts by name, email, phone..."
          className={`flex-1 px-3 py-1.5 rounded-xl border text-xs outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}
        />
      </div>

      <div className={`flex-1 overflow-y-auto space-y-2.5 pr-1 ${customScrollbar}`}>
        {isContactsLoading ? (
          <div className="flex items-center justify-center p-8 text-xs text-slate-400 gap-2">
            <Loader2 size={16} className="animate-spin" /> Loading contacts...
          </div>
        ) : displayedContacts.length === 0 ? (
          <div className={`p-8 text-center border border-dashed rounded-2xl text-xs ${isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
            No contacts found. Click "+ Add Contact" to add client contacts.
          </div>
        ) : (
          displayedContacts.map(contact => {
            const comp = (companies || []).find(c => c.id === contact.company_id);
            const unit = (units || []).find(u => u.id === contact.unit_id);

            return (
              <div
                key={contact.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isDarkMode ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200/80 hover:border-sky-300 shadow-xs'}`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-extrabold text-sm ${tText}`}>{contact.name}</span>
                    {contact.is_primary && (
                      <span className="px-2 py-0.2 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-500 border border-amber-500/30">
                        Primary Contact
                      </span>
                    )}
                    {contact.designation && (
                      <span className={`text-xs ${tMuted}`}>• {contact.designation}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs flex-wrap">
                    {comp && (
                      <button
                        onClick={() => setActiveCompanyId(comp.id)}
                        className="font-bold text-sky-600 hover:underline flex items-center gap-1"
                      >
                        <Building2 size={12} /> {comp.name} {unit ? `(${unit.name})` : ''}
                      </button>
                    )}
                    {contact.email && (
                      <a href={`mailto:${contact.email}`} className={`flex items-center gap-1 ${tMuted} hover:text-sky-500`}>
                        <Mail size={12} /> {contact.email}
                      </a>
                    )}
                    {contact.phone && (
                      <span className={`flex items-center gap-1 ${tMuted}`}>
                        <Phone size={12} /> {contact.phone}
                      </span>
                    )}
                  </div>

                  {contact.notes && (
                    <p className={`text-xs italic pt-1 ${tMuted}`}>{contact.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => openNewEnquiryModal(contact.company_id, contact.id)}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-indigo-500/30 text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400 hover:bg-indigo-100 transition cursor-pointer"
                  >
                    + Enquiry
                  </button>
                  <button
                    onClick={() => openEditContactModal(contact)}
                    className="p-1.5 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/30 rounded-lg transition cursor-pointer"
                    title="Edit Contact"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteContact(contact.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition cursor-pointer"
                    title="Delete Contact"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function EnquiriesView({
  isDarkMode, tCard, tText, tMuted, customScrollbar, enquiries, isEnquiriesLoading, companies, contacts, activeCompanyId, setActiveCompanyId, openNewEnquiryModal, openEditEnquiryModal, handleDeleteEnquiry, saveEnquiry, openNewFollowUpModal, openNewWorkModal, tenantMembers, profiles, getUserDisplayName
}) {
  const [statusFilter, setStatusFilter] = useState('all');
  const activeCompany = (companies || []).find(c => c.id === activeCompanyId);

  const displayedEnquiries = (enquiries || []).filter(e => {
    if (activeCompanyId && e.company_id !== activeCompanyId) return false;
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    return true;
  });

  const getStatusBadge = (status) => {
    const s = (status || 'new').toLowerCase();
    if (s === 'won') return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30';
    if (s === 'lost') return 'bg-rose-500/15 text-rose-500 border-rose-500/30';
    if (s === 'proposal' || s === 'negotiation') return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
    if (s === 'contacted') return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
    return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  };

  const getPriorityBadge = (priority) => {
    const p = (priority || 'medium').toLowerCase();
    if (p === 'urgent') return 'bg-rose-600 text-white font-extrabold';
    if (p === 'high') return 'bg-amber-500/20 text-amber-500 border border-amber-500/30 font-bold';
    return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 dark:border-slate-800/80 pb-3">
        <div>
          <h2 className={`text-base font-extrabold flex items-center gap-2 ${tText}`}>
            <FileText size={18} className="text-indigo-500" />
            Sales Enquiries / Leads {activeCompany ? `— ${activeCompany.name}` : ''}
          </h2>
          <p className={`text-xs ${tMuted}`}>Track incoming customer inquiries, proposals, and pipeline leads</p>
        </div>

        <div className="flex items-center gap-2">
          {activeCompanyId && (
            <button
              onClick={() => setActiveCompanyId(null)}
              className="px-2.5 py-1 rounded-lg border text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Show All Customers
            </button>
          )}
          <button
            onClick={() => openNewEnquiryModal(activeCompanyId)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} /> New Enquiry
          </button>
        </div>
      </div>

      {/* Status Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {['all', 'new', 'contacted', 'proposal', 'negotiation', 'won', 'lost'].map(st => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              statusFilter === st
                ? 'bg-indigo-600 text-white shadow-xs'
                : isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-200/70 text-slate-600 hover:bg-slate-300'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      <div className={`flex-1 overflow-y-auto space-y-2.5 pr-1 ${customScrollbar}`}>
        {isEnquiriesLoading ? (
          <div className="flex items-center justify-center p-8 text-xs text-slate-400 gap-2">
            <Loader2 size={16} className="animate-spin" /> Loading enquiries...
          </div>
        ) : displayedEnquiries.length === 0 ? (
          <div className={`p-8 text-center border border-dashed rounded-2xl text-xs ${isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
            No enquiries found. Click "+ New Enquiry" to add customer enquiries.
          </div>
        ) : (
          displayedEnquiries.map(enquiry => {
            const comp = (companies || []).find(c => c.id === enquiry.company_id) || enquiry.company;
            const contact = (contacts || []).find(c => c.id === enquiry.contact_id) || enquiry.contact;
            const assignedName = enquiry.assigned_to ? getUserDisplayName(enquiry.assigned_to, profiles, tenantMembers) : 'Unassigned';

            return (
              <div
                key={enquiry.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-2 ${isDarkMode ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200/80 hover:border-indigo-300 shadow-xs'}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <h3 className={`font-extrabold text-sm ${tText}`}>{enquiry.title}</h3>
                    <div className="flex items-center gap-2 text-xs flex-wrap">
                      {comp && (
                        <button
                          onClick={() => setActiveCompanyId(comp.id)}
                          className="font-bold text-sky-600 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Building2 size={12} /> {comp.name}
                        </button>
                      )}
                      {contact && (
                        <span className={`flex items-center gap-1 ${tMuted}`}>
                          • Contact: {contact.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={enquiry.status || 'new'}
                      onChange={(e) => saveEnquiry({ ...enquiry, status: e.target.value })}
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border outline-none cursor-pointer ${getStatusBadge(enquiry.status)}`}
                    >
                      <option value="new">NEW</option>
                      <option value="contacted">CONTACTED</option>
                      <option value="proposal">PROPOSAL</option>
                      <option value="negotiation">NEGOTIATION</option>
                      <option value="won">WON</option>
                      <option value="lost">LOST</option>
                    </select>

                    <span className={`text-[10px] px-2 py-0.5 rounded-md uppercase font-bold ${getPriorityBadge(enquiry.priority)}`}>
                      {enquiry.priority || 'medium'}
                    </span>
                  </div>
                </div>

                {enquiry.description && (
                  <p className={`text-xs leading-relaxed ${tText}`}>{enquiry.description}</p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-xs">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-[11px] ${tMuted}`}>Source: <b>{enquiry.source || 'website'}</b></span>
                    <span className={`text-[11px] ${tMuted}`}>Assigned: <b>{assignedName}</b></span>
                    {enquiry.next_followup_date && (
                      <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1">
                        <CalendarClock size={12} /> Follow-up: {new Date(enquiry.next_followup_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openNewFollowUpModal(enquiry.company_id, enquiry.id)}
                      className="px-2 py-1 text-[11px] font-bold rounded-lg border border-amber-500/30 text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 hover:bg-amber-100 transition cursor-pointer flex items-center gap-1"
                    >
                      <CalendarClock size={12} /> + Follow-up
                    </button>
                    <button
                      onClick={() => openNewWorkModal()}
                      className="px-2 py-1 text-[11px] font-bold rounded-lg border border-emerald-500/30 text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 hover:bg-emerald-100 transition cursor-pointer flex items-center gap-1"
                      title="Convert Enquiry to Active PO/WO Project"
                    >
                      <Plus size={12} /> Convert Project
                    </button>
                    <button
                      onClick={() => openEditEnquiryModal(enquiry)}
                      className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition cursor-pointer"
                      title="Edit Enquiry"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteEnquiry(enquiry.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition cursor-pointer"
                      title="Delete Enquiry"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function FollowUpsView({
  isDarkMode, tCard, tText, tMuted, customScrollbar, followUps, isFollowUpsLoading, companies, enquiries, activeCompanyId, setActiveCompanyId, openNewFollowUpModal, openEditFollowUpModal, handleDeleteFollowUp, toggleFollowUpStatus, tenantMembers, profiles, getUserDisplayName
}) {
  const [statusTab, setStatusTab] = useState('pending');
  const activeCompany = (companies || []).find(c => c.id === activeCompanyId);

  const displayedFollowUps = (followUps || []).filter(f => {
    if (activeCompanyId && f.company_id !== activeCompanyId) return false;
    if (statusTab === 'pending' && f.status !== 'pending') return false;
    if (statusTab === 'completed' && f.status !== 'completed') return false;
    return true;
  });

  const getActivityBadge = (type) => {
    const t = (type || 'call').toLowerCase();
    if (t === 'meeting') return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
    if (t === 'email') return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
    if (t === 'site_visit') return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30';
    if (t === 'quote_sent') return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
    return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 dark:border-slate-800/80 pb-3">
        <div>
          <h2 className={`text-base font-extrabold flex items-center gap-2 ${tText}`}>
            <CalendarClock size={18} className="text-amber-500" />
            CRM Follow-ups & Activities {activeCompany ? `— ${activeCompany.name}` : ''}
          </h2>
          <p className={`text-xs ${tMuted}`}>Schedule calls, meetings, and follow-up activities for customer leads</p>
        </div>

        <div className="flex items-center gap-2">
          {activeCompanyId && (
            <button
              onClick={() => setActiveCompanyId(null)}
              className="px-2.5 py-1 rounded-lg border text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Show All Customers
            </button>
          )}
          <button
            onClick={() => openNewFollowUpModal(activeCompanyId)}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} /> Schedule Follow-up
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setStatusTab('pending')}
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition cursor-pointer ${
            statusTab === 'pending'
              ? 'bg-amber-600 text-white shadow-xs'
              : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200/70 text-slate-600'
          }`}
        >
          Pending ({(followUps || []).filter(f => f.status === 'pending').length})
        </button>
        <button
          onClick={() => setStatusTab('completed')}
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition cursor-pointer ${
            statusTab === 'completed'
              ? 'bg-emerald-600 text-white shadow-xs'
              : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200/70 text-slate-600'
          }`}
        >
          Completed ({(followUps || []).filter(f => f.status === 'completed').length})
        </button>
        <button
          onClick={() => setStatusTab('all')}
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition cursor-pointer ${
            statusTab === 'all'
              ? 'bg-slate-700 text-white shadow-xs'
              : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200/70 text-slate-600'
          }`}
        >
          All ({(followUps || []).length})
        </button>
      </div>

      <div className={`flex-1 overflow-y-auto space-y-2.5 pr-1 ${customScrollbar}`}>
        {isFollowUpsLoading ? (
          <div className="flex items-center justify-center p-8 text-xs text-slate-400 gap-2">
            <Loader2 size={16} className="animate-spin" /> Loading follow-ups...
          </div>
        ) : displayedFollowUps.length === 0 ? (
          <div className={`p-8 text-center border border-dashed rounded-2xl text-xs ${isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
            No follow-ups found in this view.
          </div>
        ) : (
          displayedFollowUps.map(followUp => {
            const comp = (companies || []).find(c => c.id === followUp.company_id) || followUp.company;
            const enq = (enquiries || []).find(e => e.id === followUp.enquiry_id) || followUp.enquiry;
            const assignedName = followUp.assigned_to ? getUserDisplayName(followUp.assigned_to, profiles, tenantMembers) : 'Unassigned';
            const isDone = followUp.status === 'completed';

            return (
              <div
                key={followUp.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                  isDone
                    ? isDarkMode ? 'bg-slate-900/40 border-slate-800/60 opacity-75' : 'bg-slate-50 border-slate-200/70 opacity-75'
                    : isDarkMode ? 'bg-slate-900/80 border-slate-800 hover:border-amber-500/30' : 'bg-white border-slate-200/80 hover:border-amber-300 shadow-xs'
                }`}
              >
                <button
                  onClick={() => toggleFollowUpStatus(followUp.id, followUp.status)}
                  className="mt-0.5 text-amber-500 hover:text-amber-400 transition cursor-pointer shrink-0"
                  title={isDone ? 'Mark as Pending' : 'Mark as Completed'}
                >
                  {isDone ? <CheckSquare size={18} className="text-emerald-500" /> : <Square size={18} />}
                </button>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${getActivityBadge(followUp.activity_type)}`}>
                        {followUp.activity_type || 'call'}
                      </span>
                      {comp && (
                        <button
                          onClick={() => setActiveCompanyId(comp.id)}
                          className="font-bold text-xs text-sky-600 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Building2 size={11} /> {comp.name}
                        </button>
                      )}
                      {enq && (
                        <span className={`text-xs font-semibold ${tMuted}`}>
                          — {enq.title}
                        </span>
                      )}
                    </div>

                    <span className={`text-xs font-bold ${isDone ? 'text-emerald-500' : 'text-amber-500'}`}>
                      Due: {new Date(followUp.due_date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>

                  {followUp.notes && (
                    <p className={`text-xs leading-relaxed ${isDone ? 'line-through opacity-75' : tText}`}>{followUp.notes}</p>
                  )}

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className={tMuted}>Assigned: <b>{assignedName}</b></span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditFollowUpModal(followUp)}
                        className="p-1 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded transition cursor-pointer"
                        title="Edit Follow-up"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteFollowUp(followUp.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded transition cursor-pointer"
                        title="Delete Follow-up"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}