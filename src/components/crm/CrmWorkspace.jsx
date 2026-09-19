import React, { useState, useRef, useEffect } from 'react';
import CenterPanel from './CenterPanel';
import TaskPanel from './TaskPanel';
import Modals from './Modals';
import AiChatModal from '../ai/AiChatModal';
import { 
  Search, FileText, Building, MapPin, Plus, X, ChevronDown, 
  Check, RefreshCw, Briefcase, CalendarClock, Users, ListChecks, Bell 
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
    searchQuery, handleSearch, searchResults, jumpToSearchResult, setSearchQuery,
    handleAddCompany, handleAddUnit,
    openNewWorkModal, openNewTask, openGlobalReminderModal, openNewContactModal,
    openNewEnquiryModal, openNewFollowUpModal,
    refreshAllData, toastMessage
  } = useCrm();

  const [isOpCompanyOpen, setIsOpCompanyOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [isUnitOpen, setIsUnitOpen] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  
  // Pull to Refresh State & Refs
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const mainContentRef = useRef(null);

  const opCompanyDropdownRef = useRef(null);
  const searchContainerRef = useRef(null);
  const companyDropdownRef = useRef(null);
  const unitDropdownRef = useRef(null);
  const createMenuRef = useRef(null);

  const activeCompany = (companies || []).find(c => c.id === activeCompanyId);
  const activeUnit = (units || []).find(u => u.id === activeUnitId);

  // Close popovers on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        if (setSearchQuery) setSearchQuery('');
      }
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
  }, [setSearchQuery]);

  // Touch handlers for Mobile Pull-To-Refresh
  const handleTouchStart = (e) => {
    if (mainContentRef.current && mainContentRef.current.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    } else {
      touchStartY.current = 0;
    }
  };

  const handleTouchMove = (e) => {
    if (touchStartY.current <= 0 || isRefreshing) return;
    if (mainContentRef.current && mainContentRef.current.scrollTop > 0) return;

    const currentY = e.touches[0].clientY;
    const dy = currentY - touchStartY.current;
    if (dy > 0) {
      const dist = Math.min(Math.pow(dy, 0.85), 90);
      setPullDistance(dist);
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= 50 && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(50);
      if (refreshAllData) {
        await refreshAllData();
      }
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
      }, 500);
    } else {
      setPullDistance(0);
    }
    touchStartY.current = 0;
  };

  return (
    <div className={`flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar relative font-scale-${fontSize || 'md'}`}>
      <Modals />
      <AiChatModal />

      {/* CRM CONTEXT & SEARCH TOOLBAR ROW */}
      <div className="space-y-3 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:items-center gap-2">
          
          {/* OPERATING COMPANY SELECTOR */}
          <div className="relative min-w-0" ref={opCompanyDropdownRef}>
            <button
              onClick={() => { setIsOpCompanyOpen(!isOpCompanyOpen); setIsCompanyOpen(false); setIsUnitOpen(false); }}
              className="os-secondary w-full justify-between gap-2 text-xs cursor-pointer"
              title="Filter by Operating Company"
            >
              <div className="flex items-center gap-2 truncate">
                <Briefcase size={14} className="text-amber-500 shrink-0" />
                <span className="truncate font-bold">
                  {activeOperatingCompany ? activeOperatingCompany.name : 'ALL COMPANIES'}
                </span>
              </div>
              <ChevronDown size={13} className="text-slate-400 shrink-0" />
            </button>

            {isOpCompanyOpen && (
              <div className="os-popover left-0 top-11 w-72 z-50">
                <div className="os-popover-label">Operating Company Context</div>
                <button
                  onClick={() => { setActiveOperatingCompanyId(null); setIsOpCompanyOpen(false); }}
                  className={`os-company-option ${activeOperatingCompanyId === null ? 'selected' : ''}`}
                >
                  <div>
                    <b>ALL COMPANIES</b>
                    <small>Consolidated authorized view</small>
                  </div>
                  {activeOperatingCompanyId === null && <Check size={14} className="text-sky-500 shrink-0" />}
                </button>
                {(operatingCompanies || []).map(comp => (
                  <button
                    key={comp.id}
                    onClick={() => { setActiveOperatingCompanyId(comp.id); setIsOpCompanyOpen(false); }}
                    className={`os-company-option ${activeOperatingCompanyId === comp.id ? 'selected' : ''}`}
                  >
                    <div>
                      <b>{comp.name}</b>
                      {comp.tax_id && <small>GST: {comp.tax_id}</small>}
                    </div>
                    {activeOperatingCompanyId === comp.id && <Check size={14} className="text-sky-500 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

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
              <div className="os-popover left-0 top-11 w-64 z-50">
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

          {/* CRM SEARCH BAR */}
          <div className="relative flex-1 min-w-0" ref={searchContainerRef}>
            <div className="os-global-search w-full">
              <Search size={14} className="shrink-0 text-slate-400" />
              <input
                type="text"
                placeholder="Search customers, projects, contacts, enquiries..."
                value={searchQuery || ''}
                onChange={handleSearch}
              />
              {searchQuery && (
                <button 
                  onClick={() => handleSearch({ target: { value: '' } })} 
                  className="text-slate-400 hover:text-rose-500 cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {searchResults && searchResults.length > 0 && (
              <div className="os-popover left-0 right-0 top-11 z-50 overflow-hidden p-0 max-h-72 overflow-y-auto custom-scrollbar">
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 flex justify-between items-center text-slate-400">
                  <span>Search Results ({searchResults.length})</span>
                  <button onClick={() => handleSearch({ target: { value: '' } })} className="hover:text-rose-500"><X size={12} /></button>
                </div>
                {searchResults.map((result, idx) => (
                  <button
                    key={result.id || idx}
                    onClick={() => {
                      jumpToSearchResult(result);
                      handleSearch({ target: { value: '' } });
                    }}
                    className="os-company-option rounded-none border-b border-slate-100 dark:border-slate-800/60 last:border-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText size={14} className="text-sky-500 shrink-0" />
                      <div className="truncate">
                        <b className="truncate block">{result.label || result.title || result.name}</b>
                        <small className="truncate block">{result.subtext || result.po_number || ''}</small>
                      </div>
                    </div>
                    {result.result_type && (
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-500 border border-sky-500/30 shrink-0">
                        {result.result_type}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Pull-To-Refresh Banner */}
      {(pullDistance > 0 || isRefreshing) && (
        <div 
          className="w-full flex items-center justify-center gap-2 text-xs font-bold transition-all duration-200 overflow-hidden bg-sky-500/10 text-sky-600 dark:text-sky-400 border-b border-sky-500/20 shrink-0 mb-3"
          style={{ height: `${isRefreshing ? 36 : pullDistance}px`, opacity: Math.min(1, pullDistance / 40) }}
        >
          <RefreshCw size={14} className={`shrink-0 ${isRefreshing ? 'animate-spin text-sky-500' : ''}`} style={{ transform: `rotate(${pullDistance * 3}deg)` }} />
          <span>{isRefreshing ? 'Refreshing CRM data...' : pullDistance >= 50 ? 'Release to refresh' : 'Pull down to refresh'}</span>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div 
        ref={mainContentRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_340px] gap-4 min-h-0"
      >
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