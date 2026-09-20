import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from './Input';
import { Button } from './Button';

/**
 * Reusable FilterBar Component
 */
export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filters = [], // Array of { id, label, value, options, onChange }
  onReset,
  children,
  className = '',
}) {
  const hasActiveFilters = searchValue || filters.some((f) => f.value);

  return (
    <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl mb-4 ${className}`}>
      <div className="flex-1 flex flex-wrap items-center gap-2.5">
        {onSearchChange !== undefined && (
          <div className="w-full sm:w-64">
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              icon={Search}
            />
          </div>
        )}

        {filters.map((filter) => (
          <select
            key={filter.id}
            value={filter.value || ''}
            onChange={(e) => filter.onChange(e.target.value)}
            className="px-3 py-2 text-[13px] rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="">All {filter.label}</option>
            {filter.options.map((opt) => (
              <option key={opt.value ?? opt} value={opt.value ?? opt}>
                {opt.label ?? opt}
              </option>
            ))}
          </select>
        ))}

        {hasActiveFilters && onReset && (
          <Button variant="ghost" size="sm" icon={X} onClick={onReset}>
            Clear
          </Button>
        )}
      </div>

      {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
    </div>
  );
}
