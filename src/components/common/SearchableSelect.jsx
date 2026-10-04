import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

export default function SearchableSelect({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Select...", 
  searchPlaceholder = "Search...", 
  disabled = false,
  className = "",
  renderOption = null // Custom render function for options
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    const lower = search.toLowerCase();
    return options.filter(opt => 
      (opt.label || '').toLowerCase().includes(lower) ||
      (opt.sublabel || '').toLowerCase().includes(lower) ||
      (opt.code || '').toLowerCase().includes(lower)
    );
  }, [options, search]);

  const selectedOption = useMemo(() => options.find(o => o.value === value), [options, value]);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <div 
        className={`flex items-center justify-between w-full p-2.5 bg-slate-50 dark:bg-slate-900 border ${isOpen ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-slate-200 dark:border-slate-800'} rounded-xl text-xs font-semibold cursor-pointer transition-all ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? 'text-slate-900 dark:text-slate-100 truncate' : 'text-slate-400 truncate'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {value && !disabled && (
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelect('');
              }}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-rose-500 transition-colors"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-[100] top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-72">
          <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>
          </div>
          
          <div className="overflow-y-auto custom-scrollbar flex-1 p-1">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 italic">No results found</div>
            ) : (
              filteredOptions.map((opt) => (
                <div 
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={`px-3 py-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                    value === opt.value 
                      ? 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-3">
                    {renderOption ? renderOption(opt) : (
                      <>
                        <div className="font-bold text-xs truncate text-slate-700 dark:text-slate-200">
                          {opt.label}
                        </div>
                        {(opt.sublabel || opt.code) && (
                          <div className="text-[10px] text-slate-500 truncate mt-0.5 flex items-center gap-2">
                            {opt.code && <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">{opt.code}</span>}
                            {opt.sublabel && <span>{opt.sublabel}</span>}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  {value === opt.value && <Check size={16} className="text-sky-600 dark:text-sky-400 shrink-0" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
