import React from 'react';

/**
 * Reusable Select Component
 */
export function Select({
  label,
  options = [],
  error,
  helperText,
  isDisabled = false,
  required = false,
  className = '',
  id,
  children,
  placeholder = 'Select an option...',
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={selectId} className="text-[13px] font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
          {label}
          {required && <span className="text-red-500 font-bold">*</span>}
        </label>
      )}

      <select
        id={selectId}
        disabled={isDisabled}
        className={`
          w-full px-3.5 py-2 text-[14px] leading-relaxed rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100
          transition-colors duration-150 outline-none cursor-pointer
          focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
          disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-300 dark:border-slate-700'}
        `}
        {...props}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value ?? opt.id ?? opt} value={opt.value ?? opt.id ?? opt}>
            {opt.label ?? opt.name ?? opt}
          </option>
        ))}
        {children}
      </select>

      {error && <span className="text-[12px] text-red-600 font-medium dark:text-red-400">{error}</span>}
      {!error && helperText && <span className="text-[12px] text-slate-500 dark:text-slate-400">{helperText}</span>}
    </div>
  );
}
