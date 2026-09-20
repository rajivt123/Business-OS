import React, { useState, useRef, useEffect } from 'react';
import CenterPanel from './CenterPanel';
import TaskPanel from './TaskPanel';
import Modals from './Modals';
import AiChatModal from '../ai/AiChatModal';
import { 
  FileText, Building, MapPin, Plus, X, ChevronDown, 
  Check, Briefcase, CalendarClock, Users, ListChecks, Bell 
} from 'lucide-react'; 
import { useCrm } from '../../context/CrmContext';

export default function CrmWorkspace({ embedded = false }) {
  const { 
    operatingCompanies,
    activeOperatingCompanyId,
    activeOperatingCompany,
    setActiveOperatingCompanyId,
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
    refreshAllData, toastMessage
  } = useCrm();

  const [isOpCompanyOpen, setIsOpCompanyOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [isUnitOpen, setIsUnitOpen] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const opCompanyDropdownRef = useRef(null);
  const companyDropdownRef = useRef(null);
  const unitDropdownRef = useRef(null);
  const createMenuRef = useRef(null);

  const activeCompany = (companies || []).find(c => c.id === activeCompanyId);
  const activeUnit = (units || []).find(u => u.id === activeUnitId);

  // Close popovers on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (opCompanyDropdownRef.current && !opCompanyDropdownRef.current.contains(event.target)) {
        setIsOpCompanyOpen(false);
      }
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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar relative font-scale-${fontSize || 'md'}`}>
      <Modals />
      <AiChatModal />

      {/* CRM CONTEXT TOOLBAR ROW */}
      <div className="space-y-3 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          {/* CUSTOMER & UNIT SELECTORS */}
          <div className="grid grid-cols-2 gap-2 flex-1 min-w-0">
            {/* CUSTOMER / CLIENT COMPANY SELECTOR */}
            <div className="relative min-w-0" ref={companyDropdownRef}>
              <button
                onClick={() => { setIsCompanyOpen(!isCompanyOpen); setIsOpCompanyOpen(false); setIsUnitOpen(false); }}
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
                <div className="os-popover left-0 top-11 w-72 z-50">
                  <div className="os-popover-label">Select Customer / Client</div>
                  <div className="max-h-60 overflow-y-auto custom-scrollbar">
                    <button
                      onClick={() => { setActiveCompanyId(null); setIsCompanyOpen(false); }}
                      className={`os-company-option ${activeCompanyId === null ? 'selected' : ''}`}
                    >
                      <div><b>All Customers</b></div>
                      {activeCompanyId === null && <Check size={14} className="text-sky-500 shrink-0" />}
                    </button>
                    {(companies || []).map(c => (
                      <button
                        key={c.id}
                        onClick={() => { setActiveCompanyId(c.id); setIsCompanyOpen(false); }}
                        className={`os-company-option ${activeCompanyId === c.id ? 'selected' : ''}`}
                      >
                        <div><b>{c.name}</b></div>
                        {activeCompanyId === c.id && <Check size={14} className="text-sky-500 shrink-0" />}
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
                onClick={() => { setIsUnitOpen(!isUnitOpen); setIsOpCompanyOpen(false); setIsCompanyOpen(false); }}
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
                <div className="os-popover right-0 sm:left-0 top-11 w-64 z-50">
                  <div className="os-popover-label">Select Unit / Site</div>
                  <div className="max-h-60 overflow-y-auto custom-scrollbar">
                    <button
                      onClick={() => { setActiveUnitId(null); setIsUnitOpen(false); }}
                      className={`os-company-option ${activeUnitId === null ? 'selected' : ''}`}
                    >
                      <div><b>All Units</b></div>
                      {activeUnitId === null && <Check size={14} className="text-sky-500 shrink-0" />}
                    </button>
                    {(units || []).map(u => (
                      <button
                        key={u.id}
                        onClick={() => { setActiveUnitId(u.id); setIsUnitOpen(false); }}
                        className={`os-company-option ${activeUnitId === u.id ? 'selected' : ''}`}
                      >
                        <div><b>{u.name}</b></div>
                        {activeUnitId === u.id && <Check size={14} className="text-sky-500 shrink-0" />}
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

        </div>
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