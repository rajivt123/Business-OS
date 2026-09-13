import React, { useEffect } from 'react'
import { ChevronRight, Plus, FileText, Edit2, Trash2, Settings, AlertCircle, CheckCircle2, Circle, History, Check, Paperclip, Send, Loader2, Bell, X, ArrowRightLeft, Sparkles, Eye, Users, UserPlus, Shield } from 'lucide-react'
import { useCrm } from '../context/CrmContext'

export default function CenterPanel() {
  const {
    isDarkMode, userRole, tenantRole, currentUser, profiles, companies, activeCompanyId, handleRenameCompany, units, activeUnitId, handleRenameUnit, works, activeWorkId, setActiveWorkId,
    centerView, setCenterView, activeStageIndex, setActiveStageIndex, openStageManager, stageDefinitions, isStageDefinitionsLoading, openStageAssignmentModal,
    issues, activeIssueId, setActiveIssueId, setIsIssueModalOpen, toggleIssueStatus,
    logs, logInput, setLogInput, editingLogId, setEditingLogId, editLogContent, setEditLogContent, setHistoryLog, attachment, setAttachment, isUploading, setIsBinModalOpen,
    reminders, openNewWorkModal, openEditWorkModal, handleDeleteWork, openMoveLogModal,
    startEditingLog, saveLogEdit, handleDeleteLog, openReminderForLog, handleAddLog, aiSummary, setAiSummary, isAiLoading, handleSummarizeProject,
    openDocPreview,
    projectAssignments, setIsProjectTeamModalOpen, getActiveProjectAssignments, tenantMembers, getUserDisplayName
  } = useCrm()

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

  const tCard = isDarkMode ? "bg-slate-900/70 border-slate-800/60 shadow-lg" : "bg-white border-slate-200/70 shadow-xs"
  const tHeader = isDarkMode ? "bg-slate-900/90 border-slate-800/80" : "bg-slate-50/80 border-slate-200/70"
  const tText = isDarkMode ? "text-slate-200" : "text-slate-800 font-medium"
  const tMuted = isDarkMode ? "text-slate-400" : "text-slate-500"
  const tInput = isDarkMode ? "bg-slate-950 border-slate-800/80 text-slate-200 focus:border-sky-500" : "bg-white border-slate-200/80 text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-sky-500"
  const customScrollbar = `[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full ${isDarkMode ? '[&::-webkit-scrollbar-thumb]:bg-slate-700 hover:[&::-webkit-scrollbar-thumb]:bg-slate-600' : '[&::-webkit-scrollbar-thumb]:bg-slate-300 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400'}`

  const currentStageName = activeStages[activeStageIndex]?.name || activeWork?.stages?.[activeStageIndex] || ''
  const logPlaceholderText = centerView === 'pipeline' ? `Log update for ${currentStageName}...` : `Log update for issue...`

  return (
    <div className={`flex-1 w-full min-h-[65vh] lg:min-h-0 rounded-xl flex flex-col overflow-hidden border transition-all duration-200 ${tCard}`}>

      {/* PANEL BODY CONTENT AREA */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* PROJECTS / WORKS COLUMN (LEFT SIDE OF CENTER PANEL) */}
        <div className={`lg:w-64 xl:w-72 border-b lg:border-b-0 lg:border-r flex flex-col shrink-0 ${isDarkMode ? 'bg-slate-950/40 border-slate-800/80' : 'bg-slate-50/60 border-slate-200/70'}`}>
          {/* Work Column Header */}
          <div className="flex justify-between items-center px-3 py-2 border-b border-slate-200/70 dark:border-slate-800/80 shrink-0">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Projects & POs</span>
            <button 
              onClick={openNewWorkModal} 
              disabled={!activeUnitId} 
              className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition-all duration-200 shadow-xs hover:scale-105 active:scale-95 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
            >
              <Plus size={13} /> <span>New PO/WO</span>
            </button>
          </div>

          {/* Work Cards List */}
          <div className={`flex-1 flex flex-row lg:flex-col gap-2 p-2.5 overflow-x-auto lg:overflow-x-hidden lg:overflow-y-auto ${customScrollbar}`}>
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
                    className={`cursor-pointer p-2.5 rounded-xl border flex flex-col gap-1.5 transition-all duration-200 text-xs shrink-0 w-[78vw] sm:w-60 lg:w-auto ${
                      isActive 
                        ? (isDarkMode ? 'border-sky-500/80 bg-sky-500/10 shadow-md shadow-sky-500/10' : 'bg-white border-l-4 border-l-sky-600 border-slate-200/80 shadow-md shadow-sky-500/5') 
                        : (isDarkMode ? 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700 hover:-translate-y-0.5' : 'border-slate-200/80 bg-white hover:border-sky-300 hover:-translate-y-0.5')
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div className={`flex gap-1.5 items-center min-w-0 ${isActive ? (isDarkMode ? 'text-sky-400' : 'text-sky-700 font-semibold') : tText}`}>
                        <FileText size={15} className="shrink-0 text-sky-500" /> 
                        <span className="font-semibold text-xs leading-snug whitespace-normal truncate">{w.title}</span>
                      </div>
                      {isActive && (
                        <div className="flex gap-0.5 shrink-0">
                          <button onClick={(e) => { e.stopPropagation(); openEditWorkModal(w) }} className="text-sky-600 hover:text-sky-500 p-1 rounded hover:bg-sky-50 dark:hover:bg-sky-900/30 transition" title="Edit PO/WO"><Edit2 size={13}/></button>
                          {/* RBAC: Only Admins can delete projects */}
                          {userRole === 'admin' && (
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteWork(w.id) }} className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-900/30 transition" title="Delete Work"><Trash2 size={13}/></button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-auto pt-0.5">
                      {w.po_number && (
                        w.po_file_url ? (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); openDocPreview(w.po_file_url, `${w.title} - PO Document`); }}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border cursor-pointer hover:scale-105 transition flex items-center gap-1 ${isDarkMode ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-200/70'}`}
                            title="Instant View PO Document"
                          >
                            <Eye size={10} /> PO: {w.po_number}
                          </button>
                        ) : (
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border ${isDarkMode ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-200/70'}`}>PO: {w.po_number}</span>
                        )
                      )}

                      {w.wo_number && (
                        w.wo_file_url ? (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); openDocPreview(w.wo_file_url, `${w.title} - WO Document`); }}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border cursor-pointer hover:scale-105 transition flex items-center gap-1 ${isDarkMode ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 'bg-sky-50 text-sky-700 border-sky-200/70'}`}
                            title="Instant View WO Document"
                          >
                            <Eye size={10} /> WO: {w.wo_number}
                          </button>
                        ) : (
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border ${isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200/70'}`}>WO: {w.wo_number}</span>
                        )
                      )}

                      {w.boq_url && (
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); openDocPreview(w.boq_url, `${w.title} - BOQ`); }} 
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border cursor-pointer hover:scale-105 transition flex items-center gap-1 ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-indigo-50 text-indigo-700 border-indigo-200/70'}`}
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

        {/* WORK CONTENT AREA (STAGE STEPPER, LOG FEED & AI BANNER) */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-transparent">
          {!activeUnitId ? ( 
            <div className={`flex-1 flex items-center justify-center text-xs font-medium m-6 border border-dashed rounded-xl ${isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
              Select a Unit from the navigation header or sidebar.
            </div>
          ) : !activeWorkId ? ( 
            <div className={`flex-1 flex items-center justify-center text-xs font-medium m-6 border border-dashed rounded-xl ${isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
              Select or Create a PO/WO project card.
            </div>
          ) : (
            <>
              {/* TAB SWITCHER & ASSIGNED TEAM BAR */}
              <div className={`px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 dark:border-slate-800/80 shrink-0 ${tHeader}`}>
                 <div className="flex gap-5 items-center">
                   <button onClick={() => setCenterView('pipeline')} className={`text-xs font-semibold transition-colors ${centerView === 'pipeline' ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-500 pb-1 -mb-2' : tMuted + ' hover:text-slate-700 dark:hover:text-slate-300'}`}>
                     Pipeline Status
                   </button>
                   <button onClick={() => setCenterView('issues')} className={`text-xs font-semibold flex items-center gap-1.5 transition-colors ${centerView === 'issues' ? 'text-rose-600 border-b-2 border-rose-500 pb-1 -mb-2' : tMuted + ' hover:text-rose-500'}`}>
                     Issues & Snags {openIssuesCount > 0 && <span className="bg-rose-600 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">{openIssuesCount}</span>}
                   </button>
                 </div>

                 {/* ASSIGNED TEAM STACK & MANAGE BUTTON */}
                 <div className="flex items-center gap-2 text-xs">
                   <div className="flex items-center gap-1.5">
                     <Users size={14} className="text-purple-500 shrink-0" />
                     <span className={`text-[11px] font-bold ${tMuted}`}>Team:</span>
                     {activeAssignments.length === 0 ? (
                       <span className="text-[11px] italic text-slate-400">Unassigned</span>
                     ) : (
                       <div className="flex items-center gap-1 max-w-[280px] overflow-x-auto">
                         {activeAssignments.slice(0, 3).map(assignment => {
                           const displayName = getUserDisplayName ? getUserDisplayName(assignment.user_id, profiles, tenantMembers) : assignment.user_id;
                           const userLabel = displayName.includes('@') ? displayName.split('@')[0] : displayName;
                           const roleLabel = assignment.project_role === 'lead' ? 'Lead' : assignment.project_role === 'reviewer' ? 'Reviewer' : 'Member';
                           const badgeStyle = assignment.project_role === 'lead'
                             ? 'bg-purple-500/15 text-purple-400 border-purple-500/30 font-bold'
                             : assignment.project_role === 'reviewer'
                             ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-bold'
                             : 'bg-sky-500/15 text-sky-400 border-sky-500/30 font-bold';

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
                       className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
                         isDarkMode ? 'bg-purple-500/15 border-purple-500/30 text-purple-300 hover:bg-purple-500/25' : 'bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100 shadow-xs'
                       }`}
                       title="Manage Project Team Assignments"
                     >
                       <UserPlus size={12} />
                       <span>Manage Team</span>
                     </button>
                   )}
                 </div>
              </div>

              {/* STAGE PROCESS STEPPER BAR */}
              <div className={`px-3.5 py-2 border-b border-slate-200/70 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto shrink-0 ${tHeader} ${customScrollbar}`}>
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
                                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                                    isActive
                                      ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-500/20 scale-105'
                                      : (isDarkMode ? 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-slate-200' : 'bg-slate-200/70 text-slate-600 hover:bg-slate-300 hover:text-slate-900')
                                  }`}
                                >
                                  <span className="opacity-75 mr-1">{index + 1}.</span> {stage.name}
                                </button>
                                {canManageStageAssignments && (
                                  <button
                                    type="button"
                                    onClick={() => openStageAssignmentModal(stage.id)}
                                    className={`p-1.5 rounded-full border transition ${
                                      isDarkMode
                                        ? 'border-purple-500/20 text-purple-300 hover:bg-purple-500/10'
                                        : 'border-purple-200 text-purple-600 hover:bg-purple-50'
                                    }`}
                                    title={`Manage ${stage.name} responsibility`}
                                  >
                                    <Users size={11} />
                                  </button>
                                )}
                              </div>
                              {index < activeStages.length - 1 && (
                                <div className={`w-4 sm:w-6 h-0.5 mx-1.5 shrink-0 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {canManageStageDefinitions && (
                      <button
                        onClick={openStageManager}
                        className={`ml-auto flex items-center whitespace-nowrap gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition shrink-0 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 shadow-xs'}`}
                      >
                        <Settings size={13} /> Manage Stages
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button onClick={() => setIsIssueModalOpen(true)} className="px-2.5 py-1 rounded-lg border border-rose-500/30 text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 shadow-xs">
                      <Plus size={13}/> Report Issue
                    </button>
                    {(issues || []).map(issue => (
                      <div key={issue.id} className={`flex rounded-lg overflow-hidden border transition-all ${activeIssueId === issue.id ? 'border-rose-600 shadow-xs' : isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                        <button onClick={() => setActiveIssueId(issue.id)} className={`px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${activeIssueId === issue.id ? 'bg-rose-600 text-white' : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{issue.title}</button>
                        <button onClick={() => toggleIssueStatus(issue.id, issue.status)} className={`px-2 py-1 text-[9px] font-bold tracking-wider uppercase border-l transition-colors ${activeIssueId === issue.id ? (issue.status === 'open' ? 'bg-rose-800 border-rose-700 text-white' : 'bg-emerald-600 border-emerald-500 text-white') : (isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500')}`}>{issue.status === 'open' ? 'RESOLVE' : 'REOPEN'}</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>


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