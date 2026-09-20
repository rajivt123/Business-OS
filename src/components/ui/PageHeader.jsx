import React from 'react';

/**
 * Reusable PageHeader Component
 * Contains Title, Subtitle, optional Badge/Status, Breadcrumb slot, and Actions slot.
 */
export function PageHeader({
  title,
  subtitle,
  breadcrumb,
  badge,
  actions,
  className = '',
}) {
  return (
    <div className={`flex flex-col gap-3 pb-5 mb-6 border-b border-slate-200 dark:border-slate-800 ${className}`}>
      {breadcrumb && <div>{breadcrumb}</div>}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {title}
            </h1>
            {badge && <div>{badge}</div>}
          </div>
          {subtitle && (
            <p className="text-[14px] text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">{actions}</div>}
      </div>
    </div>
  );
}
