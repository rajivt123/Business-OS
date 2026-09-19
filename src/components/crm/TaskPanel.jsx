import React, { useState } from 'react';
import {
  AlertTriangle, CalendarClock, CheckCircle2, Circle, ClipboardList, Edit2,
  Plus, Save, Trash2, UserMinus, UserPlus, X
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';

export default function TaskPanel() {
  const {
    isDarkMode, userRole, rightView, setRightView, missingData, companies, reminders,
    toggleReminder, handleDeleteReminder, openGlobalReminderModal, openEditReminderModal,
    navigateToContext, activeWorkId, tasks, isTasksLoading, isTaskEditorOpen, taskForm,
    setTaskForm, taskAssignees, isTaskAssigneesLoading, taskAssigneeForm,
    setTaskAssigneeForm, openNewTask, openEditTask, closeTaskEditor, saveTask,
    getEligibleTaskAssignees, assignUserToTask, endTaskAssignment, stageDefinitions,
    profiles, tenantMembers, getUserDisplayName
  } = useCrm();

  const [taskMode, setTaskMode] = useState('7f');
  const [activeReminderTab, setActiveReminderTab] = useState('pending');

  const safeReminders = reminders || [];
  const sortByTargetDate = (a, b) => {
    if (!a.target_date && !b.target_date) return 0;
    if (!a.target_date) return 1;
    if (!b.target_date) return -1;
    return new Date(a.target_date) - new Date(b.target_date);
  };
  const pendingReminders = safeReminders.filter(r => !r.is_completed && !r.is_deleted).sort(sortByTargetDate);
  const completedReminders = safeReminders.filter(r => r.is_completed && !r.is_deleted).sort(sortByTargetDate);
  const displayedReminders = activeReminderTab === 'pending' ? pendingReminders : completedReminders;
  const activeTasks = (tasks || []).filter(task => !['completed', 'cancelled'].includes(task.status));
  const closedTasks = (tasks || []).filter(task => ['completed', 'cancelled'].includes(task.status));
  const taskCandidates = getEligibleTaskAssignees ? getEligibleTaskAssignees() : [];
  const activeTaskAssignees = (taskAssignees || []).filter(assignment => assignment.status === 'active');
  const endedTaskAssignees = (taskAssignees || []).filter(assignment => assignment.status === 'ended');

  const tCard = 'os-card';
  const tHeader = 'border-b border-[var(--os-border)] bg-[var(--os-surface-2)]';
  const tText = 'text-[var(--os-text)] font-semibold';
  const tMuted = 'text-[var(--os-muted)]';
  const inputClass = 'os-input';
  const customScrollbar = 'custom-scrollbar';

  const renderAlerts = () => (
    <div className={`flex-1 overflow-y-auto p-2.5 space-y-2 ${customScrollbar}`}>
      {(missingData || []).length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-8 opacity-60">
          <CheckCircle2 size={28} className="text-emerald-500 mb-1.5" />
          <p className={`text-center text-xs font-medium italic ${tMuted}`}>All projects have complete PO/WO/BOQ data.</p>
        </div>
      ) : (missingData || []).map(work => {
        const companyName = (companies || []).find(company => company.id === work.company_id)?.name || 'Unknown Client';
        const missingItems = [!work.po_number && 'PO', !work.wo_number && 'WO', !work.boq_url && 'BOQ'].filter(Boolean);
        return (
          <div key={work.id} onClick={() => navigateToContext(work.company_id, work.unit_id, work.id)} className={`p-2.5 rounded-lg border cursor-pointer hover:border-rose-400 transition ${isDarkMode ? 'border-rose-500/30 bg-rose-500/5' : 'border-rose-200 bg-rose-50/70'}`}>
            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400"><AlertTriangle size={13} /><p className="text-xs font-semibold truncate">{work.title}</p></div>
            <p className={`text-[10px] font-medium ${tMuted}`}>Client: {companyName}</p>
            <p className="text-[9px] text-rose-600 dark:text-rose-400 font-bold mt-1">Missing: {missingItems.join(', ')}</p>
          </div>
        );
      })}
    </div>
  );

  const renderReminders = () => (
    <div className={`flex-1 overflow-y-auto p-2.5 space-y-2 ${customScrollbar}`}>
      {displayedReminders.length === 0 ? (
        <p className={`text-center text-xs font-medium italic mt-8 ${tMuted}`}>No {activeReminderTab} reminders.</p>
      ) : displayedReminders.map(reminder => (
        <div key={reminder.id} className={`group flex items-start gap-2 p-2.5 rounded-lg border ${reminder.is_completed ? 'opacity-50' : ''} ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
          <button onClick={() => toggleReminder(reminder.id, reminder.is_completed)} className={`mt-0.5 shrink-0 ${tMuted}`}>
            {reminder.is_completed ? <CheckCircle2 size={15} /> : <Circle size={15} />}
          </button>
          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigateToContext(reminder.company_id, reminder.unit_id, reminder.work_id, null, reminder.stage_name)}>
            <p className={`text-xs leading-relaxed font-medium mb-1 ${reminder.is_completed ? 'line-through' : ''} ${tText}`}>{reminder.content}</p>
            {reminder.target_date && <span className="flex items-center gap-1 text-[9px] font-semibold text-amber-700 dark:text-amber-400"><CalendarClock size={9} /> {new Date(reminder.target_date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>}
          </div>
          <div className="flex items-center shrink-0">
            <button onClick={() => openEditReminderModal(reminder)} className={`p-1.5 ${tMuted}`} title="Edit reminder"><Edit2 size={13} /></button>
            {userRole === 'admin' && <button onClick={() => handleDeleteReminder(reminder.id)} className={`p-1.5 ${tMuted}`} title="Delete reminder"><Trash2 size={13} /></button>}
          </div>
        </div>
      ))}
    </div>
  );

  const renderTasks = () => (
    <div className={`flex-1 overflow-y-auto p-2.5 space-y-2 ${customScrollbar}`}>
      <div className="flex items-center justify-between px-1 pb-1">
        <span className={`text-[10px] font-black uppercase tracking-wider ${tMuted}`}>{activeWorkId ? `${activeTasks.length} active · ${closedTasks.length} closed` : 'Select a project'}</span>
        {isTasksLoading && <span className="text-[10px] text-sky-500">Loading...</span>}
      </div>
      {activeTasks.length + closedTasks.length === 0 ? (
        <p className={`text-center text-xs font-medium italic mt-8 ${tMuted}`}>No 7F tasks for this project.</p>
      ) : [...activeTasks, ...closedTasks].map(task => (
        <button key={task.id} onClick={() => openEditTask(task)} className={`w-full text-left p-2.5 rounded-lg border transition ${['completed', 'cancelled'].includes(task.status) ? 'opacity-55' : ''} ${isDarkMode ? 'bg-slate-900/90 border-slate-800 hover:border-sky-600' : 'bg-white border-slate-200 hover:border-sky-300'}`}>
          <div className="flex items-start justify-between gap-2"><span className={`text-xs font-bold truncate ${tText}`}>{task.title}</span><span className={`text-[9px] font-black uppercase ${task.priority === 'critical' ? 'text-rose-600' : task.priority === 'high' ? 'text-amber-600' : 'text-slate-400'}`}>{task.priority}</span></div>
          <div className={`flex flex-wrap gap-1 mt-1.5 text-[9px] ${tMuted}`}><span>{task.status.replace('_', ' ')}</span>{task.stage_id && <span>• {(stageDefinitions || []).find(stage => stage.id === task.stage_id)?.name || 'Stage task'}</span>}{task.due_date && <span>• due {new Date(task.due_date).toLocaleDateString()}</span>}</div>
        </button>
      ))}
    </div>
  );

  return (
    <div className="os-card w-full lg:w-72 xl:w-80 min-h-0 flex flex-col overflow-hidden shrink-0">
      <div className={`px-3.5 py-2.5 flex justify-between items-center ${tHeader}`}>
        <div className="p-0.5 rounded-full flex items-center gap-1 text-xs font-bold border border-[var(--os-border)] bg-[var(--os-surface)]">
          <button onClick={() => { setRightView('tasks'); setTaskMode('7f'); }} className={`os-tab ${rightView === 'tasks' && taskMode === '7f' ? 'active' : ''}`}>7F Tasks</button>
          <button onClick={() => { setRightView('tasks'); setTaskMode('reminders'); }} className={`os-tab ${rightView === 'tasks' && taskMode === 'reminders' ? 'active' : ''}`}>Reminders</button>
          <button onClick={() => setRightView('alerts')} className={`os-tab ${rightView === 'alerts' ? 'active text-rose-600' : ''}`}>Alerts</button>
        </div>
        <button onClick={taskMode === '7f' ? openNewTask : openGlobalReminderModal} disabled={taskMode === '7f' && !activeWorkId} className="os-primary py-1 px-2.5 text-xs disabled:opacity-40 cursor-pointer" title={taskMode === '7f' ? 'Create project task' : 'Add reminder'}><Plus size={14} /></button>
      </div>

      {rightView === 'tasks' && taskMode === 'reminders' && (
        <div className="flex border-b border-[var(--os-border)] text-[10px] font-bold uppercase tracking-wider bg-[var(--os-surface-2)]">
          <button onClick={() => setActiveReminderTab('pending')} className={`flex-1 py-1.5 text-center ${activeReminderTab === 'pending' ? 'text-amber-600 border-b-2 border-amber-500 font-extrabold' : tMuted}`}>Pending {pendingReminders.length > 0 && `(${pendingReminders.length})`}</button>
          <button onClick={() => setActiveReminderTab('completed')} className={`flex-1 py-1.5 text-center ${activeReminderTab === 'completed' ? 'text-emerald-600 border-b-2 border-emerald-500 font-extrabold' : tMuted}`}>Completed</button>
        </div>
      )}

      {rightView === 'alerts' ? renderAlerts() : rightView === 'tasks' && taskMode === '7f' ? renderTasks() : renderReminders()}

      {isTaskEditorOpen && (
        <div className="os-modal-backdrop">
          <div className="os-modal-content os-modal-md p-5 my-auto">
            <div className="os-modal-head border-b-0 p-0 mb-4"><h3 className={`text-base font-extrabold flex items-center gap-2 ${tText}`}><ClipboardList size={17} className="text-sky-500" /> {taskForm.title ? 'Edit Task' : 'Create Task'}</h3><button onClick={closeTaskEditor} className="os-icon-btn"><X size={16} /></button></div>
            <div className="space-y-3">
              <input className={`w-full ${inputClass}`} placeholder="Task title" value={taskForm.title} onChange={event => setTaskForm({ ...taskForm, title: event.target.value })} />
              <textarea className={`w-full ${inputClass} min-h-[70px]`} rows="3" placeholder="Description (optional)" value={taskForm.description} onChange={event => setTaskForm({ ...taskForm, description: event.target.value })} />
              <div className="grid grid-cols-2 gap-2"><select className={inputClass} value={taskForm.status} onChange={event => setTaskForm({ ...taskForm, status: event.target.value })}>{['not_started', 'in_progress', 'blocked', 'completed', 'cancelled'].map(value => <option key={value} value={value}>{value.replace('_', ' ')}</option>)}</select><select className={inputClass} value={taskForm.priority} onChange={event => setTaskForm({ ...taskForm, priority: event.target.value })}>{['low', 'medium', 'high', 'critical'].map(value => <option key={value} value={value}>{value}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-2"><input type="datetime-local" className={inputClass} value={taskForm.due_date} onChange={event => setTaskForm({ ...taskForm, due_date: event.target.value })} /><select className={inputClass} value={taskForm.stage_id} onChange={event => setTaskForm({ ...taskForm, stage_id: event.target.value })}><option value="">Project-level task</option>{(stageDefinitions || []).filter(stage => stage.status === 'active' && stage.work_id === activeWorkId).map(stage => <option key={stage.id} value={stage.id}>{stage.name}</option>)}</select></div>
              <button onClick={saveTask} className="os-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"><Save size={14} /> Save Task</button>
            </div>

            {taskForm.title && (
              <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`text-[10px] uppercase tracking-wider font-black ${tMuted}`}>Assignees</h4>
                  {isTaskAssigneesLoading && <span className="text-[10px] text-sky-500">Loading...</span>}
                </div>
                <div className="grid grid-cols-[1fr_110px_auto] gap-2 mb-3">
                  <select className={`min-w-0 ${inputClass}`} value={taskAssigneeForm.user_id} onChange={event => setTaskAssigneeForm({ ...taskAssigneeForm, user_id: event.target.value })}>
                    <option value="">Project member</option>
                    {taskCandidates.map(candidate => {
                      const tm = (tenantMembers || []).find(m => m.user_id && String(m.user_id).trim().toLowerCase() === String(candidate.user_id).trim().toLowerCase());
                      const email = candidate.email || tm?.email || tm?.user_email || tm?.invited_email || tm?.member_email || getUserDisplayName(candidate.user_id, profiles, tenantMembers);
                      return <option key={candidate.user_id} value={candidate.user_id}>{email}</option>;
                    })}
                  </select>
                  <select className={inputClass} value={taskAssigneeForm.role} onChange={event => setTaskAssigneeForm({ ...taskAssigneeForm, role: event.target.value })}>
                    {['assignee', 'accountable', 'reviewer'].map(role => <option key={role} value={role}>{role}</option>)}
                  </select>
                  <button onClick={() => assignUserToTask({ userId: taskAssigneeForm.user_id, role: taskAssigneeForm.role }).then(result => result?.success && setTaskAssigneeForm({ user_id: '', role: 'assignee' }))} disabled={!taskAssigneeForm.user_id} className="rounded-xl bg-indigo-600 text-white px-2.5 disabled:opacity-40">
                    <UserPlus size={13} />
                  </button>
                </div>
                {activeTaskAssignees.map(assignment => {
                  const tm = (tenantMembers || []).find(m => m.user_id && String(m.user_id).trim().toLowerCase() === String(assignment.user_id).trim().toLowerCase());
                  const displayName = tm?.email || tm?.user_email || tm?.invited_email || tm?.member_email || getUserDisplayName(assignment.user_id, profiles, tenantMembers);
                  return (
                    <div key={assignment.id} className={`flex items-center justify-between gap-2 p-2 rounded-lg border mb-1 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                      <span className={`text-[10px] truncate ${tText}`}>{displayName} <b className="text-sky-500">({assignment.role})</b></span>
                      <button onClick={() => endTaskAssignment(assignment.id)} className="text-rose-500 p-1" title="End assignment"><UserMinus size={13} /></button>
                    </div>
                  );
                })}
                {endedTaskAssignees.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    <p className={`text-[10px] uppercase tracking-wider font-black ${tMuted}`}>Assignment history</p>
                    {endedTaskAssignees.map(assignment => {
                      const tm = (tenantMembers || []).find(m => m.user_id && String(m.user_id).trim().toLowerCase() === String(assignment.user_id).trim().toLowerCase());
                      const displayName = tm?.email || tm?.user_email || tm?.invited_email || tm?.member_email || getUserDisplayName(assignment.user_id, profiles, tenantMembers);
                      return (
                        <div key={assignment.id} className={`p-2 rounded-lg border text-[10px] ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                          <div className="flex justify-between gap-2">
                            <span className="truncate">{displayName}</span>
                            <span>{assignment.role}</span>
                          </div>
                          <div className="mt-1">Assigned {assignment.assigned_at ? new Date(assignment.assigned_at).toLocaleDateString() : '—'} · Ended {assignment.ended_at ? new Date(assignment.ended_at).toLocaleDateString() : '—'}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {taskCandidates.length === 0 && <p className="text-[10px] text-amber-600 mt-2">No active project members are eligible.</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
