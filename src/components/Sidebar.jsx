import React, { useState } from 'react';
import { X, Search, Building2, ChevronRight, Folder, Plus, Edit2, Trash2, MapPin, Sparkles, Briefcase } from 'lucide-react';
import { useCrm } from '../context/CrmContext';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { 
    isDarkMode, 
    operatingCompanies,
    activeOperatingCompanyId,
    setActiveOperatingCompanyId,
    companies, activeCompanyId, setActiveCompanyId, 
    units, activeUnitId, setActiveUnitId,
    handleAddCompany,
    handleRenameCompany,
    handleDeleteCompany,
    handleRenameUnit,
    handleDeleteUnit,
    handleAddUnit
  } = useCrm();

  const [searchTerm, setSearchTerm] = useState('');

  const filteredCompanies = (companies || []).filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tBg = isDarkMode ? 'bg-slate-900/95 border-slate-800/90' : 'bg-white/95 border-slate-200/80';
  const tText = isDarkMode ? 'text-slate-200' : 'text-slate-800';
  const tMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const tInput = isDarkMode ? 'bg-slate-950/80 border-slate-800 text-slate-200 focus-within:border-sky-500' : 'bg-slate-100/70 border-slate-200 text-slate-800 focus-within:border-sky-500 focus-within:bg-white';
  const tHover = isDarkMode ? 'hover:bg-slate-800/70' : 'hover:bg-slate-100';
  const customScrollbar = `[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full ${isDarkMode ? '[&::-webkit-scrollbar-thumb]:bg-slate-700 hover:[&::-webkit-scrollbar-thumb]:bg-slate-600' : '[&::-webkit-scrollbar-thumb]:bg-slate-300 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400'}`;

  return (
    <>
      {/* Dark Overlay for Mobile & Desktop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sliding Glass Drawer Panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 sm:w-84 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col border-r backdrop-blur-2xl ${tBg} ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Sidebar Header */}
        <div className={`flex justify-between items-center px-4 py-3.5 border-b shrink-0 ${isDarkMode ? 'border-slate-800/80 bg-slate-900/60' : 'border-slate-200/80 bg-slate-50/50'}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Building2 size={18} />
            </div>
            <div>
              <h2 className={`font-extrabold text-sm tracking-tight ${tText}`}>Client Directory</h2>
              <p className={`text-[10px] ${tMuted}`}>Manage clients & unit locations</p>
            </div>
          </div>

          <button 
            onClick={() => setIsOpen(false)} 
            className={`p-2 rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 ${isDarkMode ? 'text-slate-400 hover:text-white bg-slate-800/80 border-slate-700/80' : 'text-slate-500 hover:text-slate-900 bg-slate-100 border-slate-200'}`}
            title="Close Drawer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Operating Company Context Switcher Block */}
        <div className="px-3 pt-3 pb-1 shrink-0">
          <div className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50/80 border-amber-200'}`}>
            <div className="flex items-center gap-1.5 mb-1 text-amber-600 dark:text-amber-400">
              <Briefcase size={13} />
              <label className="text-[10px] font-extrabold uppercase tracking-wider">
                Operating Company Context
              </label>
            </div>
            <select
              value={activeOperatingCompanyId || 'ALL'}
              onChange={(e) => {
                const val = e.target.value;
                setActiveOperatingCompanyId(val === 'ALL' ? null : val);
              }}
              className={`w-full rounded-lg px-2.5 py-1.5 text-xs font-bold border outline-none cursor-pointer ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-amber-500' 
                  : 'bg-white border-slate-300 text-slate-800 focus:border-amber-500'
              }`}
            >
              <option value="ALL">ALL COMPANIES (Consolidated)</option>
              {(operatingCompanies || []).map(comp => (
                <option key={comp.id} value={comp.id}>
                  {comp.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 pt-1 shrink-0">
          <div className={`flex items-center px-3 py-2 rounded-xl border transition-all shadow-xs ${tInput}`}>
            <Search size={15} className={`shrink-0 ${tMuted}`} />
            <input
              type="text"
              placeholder="Search client companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none ml-2 text-xs w-full placeholder:text-slate-400"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="p-0.5 rounded text-slate-400 hover:text-rose-500">
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Client & Unit Directory List */}
        <div className={`flex-1 overflow-y-auto px-2.5 pb-4 space-y-1.5 ${customScrollbar}`}>
          <div className="px-2 pb-1 flex justify-between items-center">
            <span className={`text-[10px] font-extrabold uppercase tracking-wider ${tMuted}`}>Client List ({filteredCompanies.length})</span>
          </div>

          {filteredCompanies.length === 0 ? (
            <div className="text-center py-8 opacity-60 text-xs italic">
              No clients found matching "{searchTerm}"
            </div>
          ) : (
            filteredCompanies.map(company => {
              const isCompanyActive = activeCompanyId === company.id;
              const companyUnits = units.filter(u => u.company_id === company.id);

              return (
                <div key={company.id} className="space-y-1">
                  {/* Company Row Button */}
                  <div
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 group ${
                      isCompanyActive
                        ? (isDarkMode ? 'bg-sky-500/15 border-sky-500/30 text-sky-400 font-bold shadow-xs' : 'bg-sky-50 border-sky-200 text-sky-700 font-bold shadow-xs')
                        : `${tText} ${isDarkMode ? 'border-slate-800/60 bg-slate-900/40 hover:bg-slate-800/60' : 'border-slate-100 bg-white hover:bg-slate-50'}`
                    }`}
                  >
                    <button
                      onClick={() => setActiveCompanyId(company.id)}
                      className="flex items-center gap-2.5 flex-1 text-left min-w-0"
                    >
                      <div className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center text-white shrink-0 shadow-xs ${
                        isCompanyActive 
                          ? 'bg-gradient-to-tr from-sky-500 to-indigo-600' 
                          : 'bg-slate-400 dark:bg-slate-700'
                      }`}>
                        {company.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-xs block truncate leading-tight">{company.name}</span>
                        <span className={`text-[9px] font-medium block ${tMuted}`}>{companyUnits.length} Unit{companyUnits.length === 1 ? '' : 's'}</span>
                      </div>
                    </button>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRenameCompany(company.id, company.name); }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-slate-800 transition"
                        title="Rename Client"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteCompany(company.id); }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition"
                        title="Delete Client"
                      >
                        <Trash2 size={13} />
                      </button>
                      <ChevronRight size={15} className={`transition-transform duration-200 ${isCompanyActive ? 'rotate-90 text-sky-500' : 'text-slate-400'}`} />
                    </div>
                  </div>

                  {/* Expanded Unit Sub-Tree */}
                  {isCompanyActive && (
                    <div className="pl-4 pr-1 space-y-1.5 py-1.5 border-l-2 border-sky-500/30 ml-3">
                      {companyUnits.map(unit => {
                        const isUnitActive = activeUnitId === unit.id;
                        return (
                          <div
                            key={unit.id}
                            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all ${
                              isUnitActive
                                ? (isDarkMode ? 'bg-slate-800 border border-slate-700 text-sky-400 font-bold shadow-xs' : 'bg-white border border-slate-200/90 text-sky-700 font-bold shadow-xs')
                                : `${tMuted} hover:text-sky-500 ${tHover}`
                            }`}
                          >
                            <button
                              onClick={() => { setActiveUnitId(unit.id); setIsOpen(false); }}
                              className="flex items-center gap-2 flex-1 text-left min-w-0"
                            >
                              <MapPin size={13} className={isUnitActive ? 'text-sky-500 shrink-0' : 'text-slate-400 shrink-0'} />
                              <span className="truncate">{unit.name}</span>
                            </button>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleRenameUnit(unit.id, unit.name); }}
                                className="p-1 rounded text-slate-400 hover:text-sky-500 transition"
                                title="Rename Unit"
                              >
                                <Edit2 size={11} />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteUnit(unit.id); }}
                                className="p-1 rounded text-slate-400 hover:text-rose-500 transition"
                                title="Delete Unit"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* + Add Unit Button */}
                      <button 
                        onClick={() => handleAddUnit(company.id)} 
                        className={`w-full flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-bold text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 border border-dashed border-sky-500/30 transition-all duration-200 mt-1 cursor-pointer`}
                      >
                        <Plus size={14} /> <span>Add Unit</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
        
        {/* Fixed Bottom Action: ADD NEW CLIENT */}
        <div className={`p-3.5 border-t shrink-0 ${isDarkMode ? 'border-slate-800/80 bg-slate-900/80' : 'border-slate-200/80 bg-slate-50/80'}`}>
          <button 
            onClick={handleAddCompany} 
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-md shadow-sky-500/20 active:scale-95 cursor-pointer"
          >
            <Plus size={16} /> Add New Client
          </button>
        </div>

      </div>
    </>
  );
}