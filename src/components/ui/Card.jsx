import React from 'react';

/**
 * Reusable Card Component
 */
export function Card({
  title,
  subtitle,
  action,
  children,
  footer,
  className = '',
  bodyClassName = '',
  headerClassName = '',
}) {
  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs overflow-hidden flex flex-col ${className}`}>
      {(title || subtitle || action) && (
        <div className={`px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4 ${headerClassName}`}>
          <div className="flex flex-col gap-0.5">
            {title && <h3 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">{title}</h3>}
            {subtitle && <p className="text-[13px] text-slate-500 dark:text-slate-400">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={`p-5 flex-1 ${bodyClassName}`}>{children}</div>
      {footer && (
        <div className="px-5 py-3.5 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
          {footer}
        </div>
      )}
    </div>
  );
}
