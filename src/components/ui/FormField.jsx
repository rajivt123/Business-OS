import React from 'react';

/**
 * Generic FormField wrapper component for custom inputs or rich controls
 */
export function FormField({
  label,
  error,
  helperText,
  required = false,
  children,
  className = '',
  id,
}) {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="text-[13px] font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
          {label}
          {required && <span className="text-red-500 font-bold">*</span>}
        </label>
      )}
      {children}
      {error && <span className="text-[12px] text-red-600 font-medium dark:text-red-400">{error}</span>}
      {!error && helperText && <span className="text-[12px] text-slate-500 dark:text-slate-400">{helperText}</span>}
    </div>
  );
}
