import React, { useState } from 'react';
import { Plus, CheckCircle2, Circle, Trash2, CalendarClock, Building2, AlertTriangle, Edit2 } from 'lucide-react';
import { useCrm } from '../context/CrmContext';

export default function TaskPanel() {
  const { isDarkMode, userRole, rightView, setRightView, missingData, companies, reminders, toggleReminder, handleDeleteReminder, openGlobalReminderModal, openEditReminderModal, navigateToContext } = useCrm();
  
  const [activeTab, setActiveTab] = useState('pending'); 

  const sortByTargetDate = (a, b) => {
    if (!a.target_date && !b.target_date) return 0;
    if (!a.target_date) return 1;
    if (!b.target_date) return -1;
    return new Date(a.target_date) - new Date(b.target_date);
  };

  const safeReminders = reminders || [];
  const pendingTasks = safeReminders.filter(r => !r.is_completed && !r.is_deleted).sort(sortByTargetDate);
  const completedTasks = safeReminders.filter(r => r.is_completed && !r.is_deleted).sort(sortByTargetDate);
  const displayedTasks = activeTab === 'pending' ? pendingTasks : completedTasks;

  const tCard = isDarkMode ? "bg-slate-900/60 border-slate-800/80" : "bg-white border-slate-200 shadow-xs";
  const tHeader = isDarkMode ? "bg-slate-900/90 border-slate-800" : "bg-slate-50/80 border-slate-200";
  const tText = isDarkMode ? "text-slate-200" : "text-slate-800 font-medium";
  const tMuted = isDarkMode ? "text-slate-400" : "text-slate-500";
  const tHover = isDarkMode ? "hover:bg-slate-800/60" : "hover:bg-slate-100";
  const customScrollbar = `[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full ${isDarkMode ? '[&::-webkit-scrollbar-thumb]:bg-slate-700 hover:[&::-webkit-scrollbar-thumb]:bg-slate-600' : '[&::-webkit-scrollbar-thumb]:bg-slate-300 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400'}`;

  return (
    <div className={`w-full lg:w-72 xl:w-80 min-h-[45vh] lg:min-h-0 rounded-xl flex flex-col overflow-hidden border shrink-0 transition-colors ${tCard}`}>
      
      {/* PANEL HEADER TABS */}
      <div className={`px-3 py-2 flex justify-between items-center border-b shrink-0 ${tHeader}`}>
        <div className={`p-0.5 rounded-xl flex items-center gap-1 text-xs font-bold border ${isDarkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-100/90 border-slate-200'}`}>
          <button
            onClick={() => setRightView('tasks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              rightView === 'tasks'
                ? (isDarkMode ? 'bg-sky-600 text-white shadow-xs' : 'bg-white text-sky-600 shadow-xs')
                : `${tMuted} hover:text-slate-800 dark:hover:text-slate-200`
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => setRightView('alerts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              rightView === 'alerts'
                ? 'bg-rose-600 text-white shadow-xs'
                : `${tMuted} hover:text-rose-500`
            }`}
          >
            <span>Action Required</span>
            {(missingData || []).length > 0 && (
              <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${
                rightView === 'alerts' ? 'bg-white/20 text-white' : 'bg-rose-600 text-white'
              }`}>
                {(missingData || []).length}
              </span>
            )}
          </button>
        </div>
        <button 
          onClick={openGlobalReminderModal} 
          className={`p-1.5 rounded-xl border transition text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-500/10 cursor-pointer ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'}`} 
          title="Add Global Reminder / Task"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* SUB-TABS: PENDING VS COMPLETED */}
      {rightView === 'tasks' && (
        <div className={`flex border-b text-[10px] font-semibold uppercase tracking-wider shrink-0 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <button onClick={() => setActiveTab('pending')} className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 transition-colors ${activeTab === 'pending' ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 bg-amber-500/10' : tMuted}`}>
            Pending {pendingTasks.length > 0 && <span className="bg-rose-500 text-white px-1.5 py-0.2 rounded-full text-[9px] font-bold">{pendingTasks.length}</span>}
          </button>
          <button onClick={() => setActiveTab('completed')} className={`flex-1 py-1.5 transition-colors ${activeTab === 'completed' ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/10' : tMuted}`}>
            Completed
          </button>
        </div>
      )}

      {/* TASK LIST FEED */}
      <div className={`flex-1 overflow-y-auto p-2.5 space-y-2 ${customScrollbar}`}>
        {rightView === 'alerts' ? (
          (missingData || []).length === 0 ? (
             <div className="flex flex-col items-center justify-center mt-8 opacity-60">
               <CheckCircle2 size={28} className="text-emerald-500 mb-1.5"/>
               <p className={`text-center text-xs font-medium italic ${tMuted}`}>All projects have complete PO/WO/BOQ data.</p>
             </div>
          ) : (
            (missingData || []).map(w => {
              const companyName = (companies || []).find(c => c.id === w.company_id)?.name || 'Unknown Client'
              let missingItems = []
              if (!w.po_number) missingItems.push('PO')
              if (!w.wo_number) missingItems.push('WO')
              if (!w.boq_url) missingItems.push('BOQ')

              return (
                <div key={w.id} onClick={() => navigateToContext(w.company_id, w.unit_id, w.id)} className={`p-2.5 rounded-lg border cursor-pointer hover:border-rose-400 transition shadow-xs ${isDarkMode ? 'border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10' : 'border-rose-200 bg-rose-50/70 hover:bg-rose-100'}`}>
                  <div className="flex items-center gap-1.5 mb-0.5 text-rose-600 dark:text-rose-400">
                    <AlertTriangle size={13} className="shrink-0" />
                    <p className="text-xs font-semibold truncate">{w.title}</p>
                  </div>
                  <p className={`text-[10px] font-medium ${tMuted}`}>Client: {companyName}</p>
                  <p className="text-[9px] text-rose-600 dark:text-rose-400 font-bold mt-1 bg-rose-500/10 inline-block px-1.5 py-0.5 rounded border border-rose-500/20">
                    Missing: {missingItems.join(', ')}
                  </p>
                </div>
              )
            })
          )
        ) : (
          displayedTasks.length === 0 ? (
             <p className={`text-center text-xs font-medium italic mt-8 ${tMuted}`}>No {activeTab} tasks.</p>
          ) : (
            displayedTasks.map(r => (
              <div key={r.id} className={`group flex items-start gap-2 p-2.5 rounded-lg border transition-all shadow-xs ${r.is_completed ? (isDarkMode ? 'bg-slate-900/30 border-slate-800/80 opacity-50' : 'bg-slate-50 border-slate-200 opacity-50') : (isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200')}`}>
                <button onClick={() => toggleReminder(r.id, r.is_completed)} className={`mt-0.5 transition-colors shrink-0 ${r.is_completed ? 'text-emerald-600 dark:text-emerald-400' : tMuted + ' hover:text-sky-600'}`}>
                  {r.is_completed ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                </button>
                
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigateToContext(r.company_id, r.unit_id, r.work_id, null, r.stage_name)}>
                  <p className={`text-xs leading-relaxed font-medium mb-1 ${r.is_completed ? 'line-through opacity-50' : ''} ${tText}`}>{r.content}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {r.target_date && <span className="flex items-center gap-1 text-[9px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-1.5 py-0.2 rounded shadow-xs"><CalendarClock size={9}/> {new Date(r.target_date).toLocaleDateString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}</span>}
                    {r.companies && <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border shadow-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>{r.companies.name}</span>}
                  </div>
                </div>
                
                <div className="flex items-center gap-0.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => openEditReminderModal(r)} className={`p-1.5 min-w-[28px] min-h-[28px] flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${tMuted} hover:text-sky-600 transition`} title="Edit & Reschedule Task"><Edit2 size={13} /></button>
                  {/* RBAC: Only Admins can delete tasks */}
                  {userRole === 'admin' && (
                    <button onClick={() => handleDeleteReminder(r.id)} className={`p-1.5 min-w-[28px] min-h-[28px] flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${tMuted} hover:text-rose-600 transition`} title="Delete Reminder"><Trash2 size={13} /></button>
                  )}
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  )
}