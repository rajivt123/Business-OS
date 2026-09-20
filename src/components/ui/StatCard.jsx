import React from 'react';

/**
 * Reusable StatCard Component
 */
export function StatCard({
  title,
  value,
  change,
  changeType = 'neutral', // 'positive' | 'negative' | 'neutral'
  icon: Icon,
  subtitle,
  className = '',
}) {
  const changeColors = {
    positive: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400',
    negative: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400',
    neutral: 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400',
  };

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs flex flex-col justify-between gap-3 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400">{title}</span>
        {Icon && (
          <div className="p-2 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {value}
        </span>

        {change && (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[12px] font-semibold ${changeColors[changeType] || changeColors.neutral}`}>
            {change}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-[12px] text-slate-400 dark:text-slate-500">
          {subtitle}
        </p>
      )}
    </div>
  );
}
