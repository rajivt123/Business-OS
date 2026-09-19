import React, { useState, useRef, useEffect } from 'react';
import CenterPanel from './CenterPanel';
import TaskPanel from './TaskPanel';
import Modals from './Modals';
import AiChatModal from '../ai/AiChatModal';
import { Menu, Search, FileText, Sparkles, ShieldCheck, Sun, Moon, LogOut, Flame, ChevronRight, Building, MapPin, Plus, X, ChevronDown, Check, RefreshCw, Briefcase } from 'lucide-react'; 
import { useCrm } from '../../context/CrmContext';

export default function CrmWorkspace({ embedded = false }) {
  const { 
    isDarkMode,
    setIsDarkMode,
    onSignOut,
    userRole,
    isSidebarOpen,
    setIsSidebarOpen,
    setIsAdminPanelOpen,
    fetchProfiles,
    setIsAiChatOpen,
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
    setFontSize,
    increaseFontSize,
    decreaseFontSize,
    searchQuery, handleSearch, searchResults, jumpToSearchResult, setSearchQuery,
    handleAddCompany, handleAddUnit,
    refreshAllData, toastMessage
  } = useCrm();

  const [isOpCompanyOpen, setIsOpCompanyOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [isUnitOpen, setIsUnitOpen] = useState(false);
  
  // Pull to Refresh State & Refs
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const mainContentRef = useRef(null);

  const opCompanyDropdownRef = useRef(null);
  const searchContainerRef = useRef(null);
  const companyDropdownRef = useRef(null);
  const unitDropdownRef = useRef(null);

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

  const tHeader = isDarkMode ? "bg-slate-900/90 border-slate-800/80" : "bg-white/90 border-slate-200/80";

  return (
    <div className={`flex-1 flex flex-col overflow-hidden relative font-scale-${fontSize || 'md'} ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50/70 text-slate-900'}`}>
      <Modals />
      <AiChatModal />

      {/* Top Navigation Header */}
      {!embedded && (
      <header className={`px-3 py-2 border-b flex flex-col md:flex-row md:items-center justify-between gap-2 shrink-0 transition-colors ${tHeader}`}>
        
        {/* Main Header Row */}
        <div className="flex items-center justify-between w-full md:w-auto gap-2">
          {/* Left Side: Drawer Toggle & Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-max shrink-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className={`p-2 rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 shrink-0 ${
                isDarkMode 
                  ? 'bg-slate-800/80 border-slate-700/70 text-slate-300 hover:bg-slate-700 hover:text-white' 
                  : 'bg-slate-100/80 border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
              }`}
              title="Open Client Navigation Sidebar"
            >
              <Menu size={18} />
            </button>
            
            {/* Logo Brand: RAJIV CRM */}
            <div className="flex items-center gap-2 shrink-0 min-w-max">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 shrink-0">
                <Flame size={18} className="fill-white/20" />
              </div>
              <div className="flex items-center gap-1 font-extrabold tracking-tight shrink-0">
                <span className="bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent text-sm sm:text-base">RAJIV</span>
                <span className="bg-sky-600 text-white px-1.5 py-0.5 rounded text-[10px] tracking-widest font-black shadow-xs">CRM</span>
              </div>
            </div>

            {/* COLORFUL OPERATING COMPANY, CLIENT & UNIT DROPDOWN POP OVERS (DESKTOP) */}
            <div className="hidden lg:flex items-center gap-1.5 pl-3 border-l border-slate-200/80 dark:border-slate-800 text-xs">
              
              {/* OPERATING COMPANY DROPDOWN */}
              <div className="relative" ref={opCompanyDropdownRef}>
                <button
                  onClick={() => { setIsOpCompanyOpen(!isOpCompanyOpen); setIsCompanyOpen(false); setIsUnitOpen(false); }}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all font-bold text-xs shadow-2xs ${
                    isDarkMode 
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20' 
                      : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                  }`}
                  title="Our Operating Entity / Legal Company"
                >
                  <Briefcase size={14} className="text-amber-500 shrink-0" />
                  <span className="truncate max-w-[150px]">
                    {activeOperatingCompany ? activeOperatingCompany.name : 'ALL COMPANIES'}
                  </span>
                  <ChevronDown size={14} className="text-amber-500/70 shrink-0" />
                </button>

                {/* Operating Company Dropdown Menu Popover */}
                {isOpCompanyOpen && (
                  <div className={`absolute top-full left-0 mt-1.5 w-64 rounded-2xl shadow-2xl border p-1.5 z-50 transition-all ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <div className={`px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Select Operating Company
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {/* ALL COMPANIES Option */}
                      <button
                        onClick={() => { setActiveOperatingCompanyId(null); setIsOpCompanyOpen(false); }}
                        className={`w-full text-left p-2 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                          activeOperatingCompanyId === null
                            ? (isDarkMode ? 'bg-amber-500/20 text-amber-400 font-bold' : 'bg-amber-50 text-amber-800 font-bold')
                            : (isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100')
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                            ALL
                          </div>
                          <div className="flex flex-col truncate">
                            <span className="truncate font-bold">ALL COMPANIES</span>
                            <span className="text-[9px] opacity-75">Authorized Operating Companies</span>
                          </div>
                        </div>
                        {activeOperatingCompanyId === null && <Check size={14} className="text-amber-500 shrink-0" />}
                      </button>

                      {/* Authorized Operating Companies List */}
                      {(operatingCompanies || []).map(comp => {
                        const isSelected = comp.id === activeOperatingCompanyId;
                        return (
                          <button
                            key={comp.id}
                            onClick={() => { setActiveOperatingCompanyId(comp.id); setIsOpCompanyOpen(false); }}
                            className={`w-full text-left p-2 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                              isSelected
                                ? (isDarkMode ? 'bg-amber-500/20 text-amber-400 font-bold' : 'bg-amber-50 text-amber-800 font-bold')
                                : (isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100')
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-slate-600 to-slate-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                                {comp.name.charAt(0)}
                              </div>
                              <div className="flex flex-col truncate">
                                <span className="truncate font-bold">{comp.name}</span>
                                {comp.tax_id && <span className="text-[9px] opacity-75">GST: {comp.tax_id}</span>}
                              </div>
                            </div>
                            {isSelected && <Check size={14} className="text-amber-500 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <ChevronRight size={13} className="text-slate-400 shrink-0" />

              {/* COMPANY / CLIENT DROPDOWN */}
              <div className="relative" ref={companyDropdownRef}>
                <button
                  onClick={() => { setIsCompanyOpen(!isCompanyOpen); setIsUnitOpen(false); }}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all font-bold text-xs shadow-2xs ${
                    isDarkMode 
                      ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700' 
                      : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <Building size={14} className="text-indigo-500" />
                  <span className="truncate max-w-[140px]">{activeCompany ? activeCompany.name : 'Select Client'}</span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {/* Company Dropdown Menu Popover */}
                {isCompanyOpen && (
                  <div className={`absolute top-full left-0 mt-1.5 w-60 rounded-2xl shadow-2xl border p-1.5 z-50 transition-all ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <div className={`px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Select Client / Company
                    </div>

                    <div className="max-h-52 overflow-y-auto space-y-1">
                      {(companies || []).map(c => {
                        const isSelected = c.id === activeCompanyId;
                        return (
                          <button
                            key={c.id}
                            onClick={() => { setActiveCompanyId(c.id); setIsCompanyOpen(false); }}
                            className={`w-full text-left p-2 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                              isSelected
                                ? (isDarkMode ? 'bg-sky-500/20 text-sky-400 font-bold' : 'bg-sky-50 text-sky-700 font-bold')
                                : (isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100')
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-indigo-500 to-sky-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                                {c.name.charAt(0)}
                              </div>
                              <span className="truncate">{c.name}</span>
                            </div>
                            {isSelected && <Check size={14} className="text-sky-500 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-1 pt-1.5 border-t border-slate-200/60 dark:border-slate-800">
                      <button
                        onClick={() => { setIsCompanyOpen(false); handleAddCompany(); }}
                        className="w-full p-2 rounded-xl text-xs font-bold text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/50 flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Plus size={14} /> Add New Company
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* UNIT DROPDOWN */}
              {activeUnit && (
                <>
                  <ChevronRight size={13} className="text-slate-400 shrink-0" />
                  <div className="relative" ref={unitDropdownRef}>
                    <button
                      onClick={() => { setIsUnitOpen(!isUnitOpen); setIsCompanyOpen(false); }}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all font-bold text-xs shadow-2xs ${
                        isDarkMode 
                          ? 'bg-slate-800/80 border-slate-700 text-sky-400 hover:bg-slate-700' 
                          : 'bg-sky-50/80 border-sky-200 text-sky-700 hover:bg-sky-100'
                      }`}
                    >
                      <MapPin size={14} className="text-sky-500" />
                      <span className="truncate max-w-[120px]">{activeUnit ? activeUnit.name : 'Select Unit'}</span>
                      <ChevronDown size={14} className="text-slate-400" />
                    </button>

                    {isUnitOpen && (
                      <div className={`absolute top-full left-0 mt-1.5 w-56 rounded-2xl shadow-2xl border p-1.5 z-50 transition-all ${
                        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                      }`}>
                        <div className={`px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          Select Unit
                        </div>

                        <div className="max-h-52 overflow-y-auto space-y-1">
                          {(units || []).map(u => {
                            const isSelected = u.id === activeUnitId;
                            return (
                              <button
                                key={u.id}
                                onClick={() => { setActiveUnitId(u.id); setIsUnitOpen(false); }}
                                className={`w-full text-left p-2 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                                  isSelected
                                    ? (isDarkMode ? 'bg-sky-500/20 text-sky-400 font-bold' : 'bg-sky-50 text-sky-700 font-bold')
                                    : (isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100')
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate pr-2">
                                  <MapPin size={13} className="text-sky-500 shrink-0" />
                                  <span className="truncate">{u.name}</span>
                                </div>
                                {isSelected && <Check size={14} className="text-sky-500 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>

                        <div className="mt-1 pt-1.5 border-t border-slate-200/60 dark:border-slate-800">
                          <button
                            onClick={() => { setIsUnitOpen(false); handleAddUnit(activeCompanyId); }}
                            className="w-full p-2 rounded-xl text-xs font-bold text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/50 flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <Plus size={14} /> Add New Unit
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Toolbar Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* DYNAMIC MULTI-STEP FONT SIZE CONTROLS */}
            <div className={`flex items-center rounded-xl border p-0.5 text-xs font-bold shrink-0 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200 shadow-xs'}`}>
              <button
                onClick={decreaseFontSize}
                className={`w-6 sm:w-7 h-6 rounded-lg flex items-center justify-center font-extrabold text-sm transition active:scale-95 cursor-pointer ${
                  isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-200 text-slate-700'
                }`}
                title="Decrease Font Size (-)"
              >
                -
              </button>
              <button
                onClick={() => setFontSize('100')}
                className={`px-1.5 sm:px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition flex items-center justify-center cursor-pointer ${
                  fontSize === '100' || fontSize === 'md'
                    ? (isDarkMode ? 'bg-slate-800 text-sky-400 font-extrabold' : 'bg-white text-sky-600 font-extrabold shadow-xs') 
                    : (isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-200')
                }`}
                title="Reset Default Font Size (100%)"
              >
                {fontSize === '80' || fontSize === 'xs' ? '80%' : fontSize === '90' || fontSize === 'sm' ? '90%' : fontSize === '100' || fontSize === 'md' ? '100%' : fontSize === '110' || fontSize === 'lg' ? '110%' : fontSize === '120' || fontSize === 'xl' ? '120%' : '130%'}
              </button>
              <button
                onClick={increaseFontSize}
                className={`w-6 sm:w-7 h-6 rounded-lg flex items-center justify-center font-extrabold text-sm transition active:scale-95 cursor-pointer ${
                  isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-200 text-slate-700'
                }`}
                title="Increase Font Size (+ 3 steps up to 130%)"
              >
                +
              </button>
            </div>

            {userRole === 'admin' && (
              <button
                onClick={() => { setIsAdminPanelOpen(true); fetchProfiles(); }}
                className={`flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-semibold transition hover:scale-105 active:scale-95 shrink-0 ${
                  isDarkMode 
                    ? 'bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/20' 
                    : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
                }`}
                title="Admin Control Panel"
              >
                <ShieldCheck size={16} />
                <span className="hidden lg:inline">Admin Panel</span>
              </button>
            )}

            {/* Theme Toggle Button */}
            {setIsDarkMode && (
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-xl border transition hover:scale-105 active:scale-95 shrink-0 ${
                  isDarkMode 
                    ? 'bg-slate-800/80 border-slate-700 text-amber-400 hover:bg-slate-700' 
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            )}

            {/* Sign Out Button */}
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="flex items-center gap-1 p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition hover:scale-105 active:scale-95 shrink-0"
                title="Sign Out of Account"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Search Bar Container (Taller height h-11 / h-12) */}
        <div className="relative w-full md:max-w-md md:mx-auto" ref={searchContainerRef}>
          <div className={`flex items-center px-3.5 py-2.5 sm:py-3 rounded-xl border h-11 sm:h-12 shadow-xs transition-all duration-200 ${
            isDarkMode 
              ? 'bg-slate-950/80 border-slate-800 text-slate-200 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500/30' 
              : 'bg-white border-slate-300 text-slate-800 focus-within:border-sky-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-sky-500/30'
          }`}>
            <Search size={18} className={`shrink-0 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
            <input
              type="text"
              placeholder="Search PO, WO, or project title..."
              value={searchQuery}
              onChange={handleSearch}
              className="bg-transparent border-none outline-none ml-2.5 text-xs sm:text-sm font-medium w-full placeholder:text-slate-400"
            />
            {searchQuery ? (
              <button 
                onClick={() => { handleSearch({ target: { value: '' } }); }} 
                className="p-1 rounded text-slate-400 hover:text-rose-500 transition shrink-0"
                title="Clear Search"
              >
                <X size={15} />
              </button>
            ) : (
              <span className="hidden lg:inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">⌘K</span>
            )}
          </div>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className={`absolute top-full left-0 right-0 mt-1.5 rounded-2xl shadow-2xl border overflow-hidden z-50 transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border-b flex justify-between items-center ${isDarkMode ? 'bg-slate-950/50 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                <span>Matching Projects ({searchResults.length})</span>
                <button onClick={() => { handleSearch({ target: { value: '' } }); }} className="text-slate-400 hover:text-rose-500"><X size={12} /></button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => {
                      jumpToSearchResult(result);
                      handleSearch({ target: { value: '' } });
                    }}
                    className={`w-full text-left px-3 py-2 border-b last:border-0 transition flex flex-col gap-1 ${isDarkMode ? 'border-slate-800 hover:bg-slate-800/60' : 'border-slate-100 hover:bg-sky-50/70'}`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-sky-500 shrink-0" />
                      <span className={`text-xs font-semibold truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{result.title}</span>
                    </div>
                    <div className="flex gap-1.5 pl-5">
                      {result.po_number && <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold border ${isDarkMode ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>PO: {result.po_number}</span>}
                      {result.wo_number && <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold border ${isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-white text-slate-600 border-slate-200'}`}>WO: {result.wo_number}</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>
      )}

      {/* Pull-To-Refresh Mobile Indicator Banner */}
      {(pullDistance > 0 || isRefreshing) && (
        <div 
          className="w-full flex items-center justify-center gap-2 text-xs font-bold transition-all duration-200 overflow-hidden bg-sky-500/10 text-sky-600 dark:text-sky-400 border-b border-sky-500/20 shrink-0"
          style={{ height: `${isRefreshing ? 42 : pullDistance}px`, opacity: Math.min(1, pullDistance / 40) }}
        >
          <RefreshCw size={16} className={`shrink-0 ${isRefreshing ? 'animate-spin text-sky-500' : ''}`} style={{ transform: `rotate(${pullDistance * 3}deg)` }} />
          <span>{isRefreshing ? 'Refreshing CRM data...' : pullDistance >= 50 ? 'Release to refresh' : 'Pull down to refresh'}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div 
        ref={mainContentRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="flex-1 flex flex-col lg:flex-row gap-4 p-3 sm:p-4 overflow-y-auto lg:overflow-hidden min-h-0 pb-20 lg:pb-4"
      >
        <CenterPanel />
        <TaskPanel />
      </div>

      {/* Floating AI Assistant Button (Bottom Right Corner) */}
      {!embedded && (
        <button
          onClick={() => setIsAiChatOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 sm:gap-2.5 px-3 py-2.5 sm:px-4.5 sm:py-3 rounded-full bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 hover:from-sky-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-2xl shadow-indigo-600/40 border border-indigo-400/30 transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
          title="Open AI Assistant"
        >
          <Sparkles size={16} className="animate-pulse text-amber-300 shrink-0" />
          <span className="text-xs sm:text-sm">AI Assistant</span>
        </button>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-slate-900/95 dark:bg-slate-100/95 text-white dark:text-slate-900 text-xs font-extrabold rounded-full shadow-2xl backdrop-blur-md border border-slate-700/60 dark:border-slate-300/60 animate-bounce">
          {toastMessage}
        </div>
      )}
    </div>
  );
}