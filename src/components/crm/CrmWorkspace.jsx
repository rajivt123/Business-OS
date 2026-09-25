import React, { useState, useRef, useEffect } from 'react';
import CenterPanel from './CenterPanel';
import TaskPanel from './TaskPanel';
import Modals from './Modals';
import AiChatModal from '../ai/AiChatModal';
import { 
  Building, MapPin, Plus, ChevronDown, Check, Sparkles 
} from 'lucide-react'; 
import { useCrm } from '../../context/CrmContext';

export default function CrmWorkspace({ embedded = false }) {
  const { 
    companies,
    activeCompanyId,
    setActiveCompanyId,
    units,
    activeUnitId,
    setActiveUnitId,
    fontSize,
    handleAddCompany, handleAddUnit,
    openNewWorkModal, openNewTask, openGlobalReminderModal, openNewContactModal,
    openNewEnquiryModal, openNewFollowUpModal,
    refreshAllData, toastMessage,
    setIsAiChatOpen
  } = useCrm();

  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [isUnitOpen, setIsUnitOpen] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const companyDropdownRef = useRef(null);
  const unitDropdownRef = useRef(null);
  const createMenuRef = useRef(null);

  const activeCompany = (companies || []).find(c => c.id === activeCompanyId);
  const activeUnit = (units || []).find(u => u.id === activeUnitId);

  // Close popovers on click outside and escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target)) {
        setIsCompanyOpen(false);
      }
      if (unitDropdownRef.current && !unitDropdownRef.current.contains(event.target)) {
        setIsUnitOpen(false);
      }
      if (createMenuRef.current && !createMenuRef.current.contains(event.target)) {
        setShowCreateMenu(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsCompanyOpen(false);
        setIsUnitOpen(false);
        setShowCreateMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className={`flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar relative font-scale-${fontSize || 'md'}`}>
      <Modals />
      <AiChatModal />

      {/* CRM CONTEXT TOOLBAR ROW */}
      <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="grid grid-cols-2 gap-2 max-w-xl flex-1 min-w-[260px]">
          {/* CUSTOMER / CLIENT COMPANY SELECTOR */}
          <div className="relative min-w-0" ref={companyDropdownRef}>
            <button
              onClick={() => { setIsCompanyOpen(!isCompanyOpen); setIsUnitOpen(false); }}
              className="os-secondary w-full justify-between gap-2 text-xs cursor-pointer"
              title="Filter by Customer / Client"
            >
              <div className="flex items-center gap-2 truncate">
                <Building size={14} className="text-indigo-500 shrink-0" />
                <span className="truncate font-bold">{activeCompany ? activeCompany.name : 'All Customers'}</span>
              </div>
              <ChevronDown size={13} className="text-slate-400 shrink-0" />
            </button>

            {isCompanyOpen && (
              <div className="os-popover-menu left-0 top-11 w-72 z-50">
                <div className="os-popover-title">Select Customer / Client</div>
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  <button
                    onClick={() => { setActiveCompanyId(null); setIsCompanyOpen(false); }}
                    className={`os-menu-item justify-between ${activeCompanyId === null ? 'active' : ''}`}
                  >
                    <div className="font-medium text-xs">All Customers</div>
                    {activeCompanyId === null && <Check size={14} className="text-blue-600 shrink-0" />}
                  </button>
                  {(companies || []).map(c => (
                    <button
                      key={c.id}
                      onClick={() => { setActiveCompanyId(c.id); setIsCompanyOpen(false); }}
                      className={`os-menu-item justify-between ${activeCompanyId === c.id ? 'active' : ''}`}
                    >
                      <div className="font-medium text-xs">{c.name}</div>
                      {activeCompanyId === c.id && <Check size={14} className="text-blue-600 shrink-0" />}
                    </button>
                  ))}
                </div>
                <div className="mt-1 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => { setIsCompanyOpen(false); handleAddCompany(); }}
                    className="w-full os-link justify-center py-1.5"
                  >
                    <Plus size={13} /> Add New Customer
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* UNIT SELECTOR */}
          <div className="relative min-w-0" ref={unitDropdownRef}>
            <button
              onClick={() => { setIsUnitOpen(!isUnitOpen); setIsCompanyOpen(false); }}
              className="os-secondary w-full justify-between gap-2 text-xs cursor-pointer"
              title="Filter by Unit / Site"
            >
              <div className="flex items-center gap-2 truncate">
                <MapPin size={14} className="text-sky-500 shrink-0" />
                <span className="truncate font-bold">{activeUnit ? activeUnit.name : 'All Units'}</span>
              </div>
              <ChevronDown size={13} className="text-slate-400 shrink-0" />
            </button>

            {isUnitOpen && (
              <div className="os-popover-menu right-0 sm:left-0 top-11 w-64 z-50">
                <div className="os-popover-title">Select Unit / Site</div>
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  <button
                    onClick={() => { setActiveUnitId(null); setIsUnitOpen(false); }}
                    className={`os-menu-item justify-between ${activeUnitId === null ? 'active' : ''}`}
                  >
                    <div className="font-medium text-xs">All Units</div>
                    {activeUnitId === null && <Check size={14} className="text-blue-600 shrink-0" />}
                  </button>
                  {(units || []).map(u => (
                    <button
                      key={u.id}
                      onClick={() => { setActiveUnitId(u.id); setIsUnitOpen(false); }}
                      className={`os-menu-item justify-between ${activeUnitId === u.id ? 'active' : ''}`}
                    >
                      <div className="font-medium text-xs">{u.name}</div>
                      {activeUnitId === u.id && <Check size={14} className="text-blue-600 shrink-0" />}
                    </button>
                  ))}
                </div>
                <div className="mt-1 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => { setIsUnitOpen(false); handleAddUnit(activeCompanyId); }}
                    className="w-full os-link justify-center py-1.5"
                  >
                    <Plus size={13} /> Add New Unit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsAiChatOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer shrink-0 ml-auto"
          title="Open RAJIV AI Assistant"
        >
          <Sparkles size={14} className="animate-pulse" />
          <span>Ask RAJIV AI</span>
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_340px] gap-4 min-h-0 w-full min-w-0">
        <CenterPanel />
        <TaskPanel />
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-900/95 dark:bg-slate-100/95 text-white dark:text-slate-900 text-xs font-bold rounded-full shadow-2xl backdrop-blur-md border border-slate-700 dark:border-slate-300 animate-bounce">
          {toastMessage}
        </div>
      )}
    </div>
  );
}