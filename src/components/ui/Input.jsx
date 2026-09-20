import React from 'react';

/**
 * Reusable Input Component
 */
export function Input({
  label,
  error,
  helperText,
  icon: Icon,
  iconPosition = 'left',
  isDisabled = false,
  required = false,
  className = '',
  inputClassName = '',
  id,
  type = 'text',
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-[13px] font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
          {label}
          {required && <span className="text-red-500 font-bold">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && iconPosition === 'left' && (
          <div className="absolute left-3 text-slate-400 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={inputId}
          type={type}
          disabled={isDisabled}
          className={`
            w-full px-3.5 py-2 text-[14px] leading-relaxed rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400
            transition-colors duration-150 outline-none
            focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
            disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-300 dark:border-slate-700'}
            ${Icon && iconPosition === 'left' ? 'pl-9' : ''}
            ${Icon && iconPosition === 'right' ? 'pr-9' : ''}
            ${inputClassName}
          `}
          {...props}
        />

        {Icon && iconPosition === 'right' && (
          <div className="absolute right-3 text-slate-400 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      {error && <span className="text-[12px] text-red-600 font-medium dark:text-red-400">{error}</span>}
      {!error && helperText && <span className="text-[12px] text-slate-500 dark:text-slate-400">{helperText}</span>}
    </div>
  );
}
