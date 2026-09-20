import React from 'react';

/**
 * Reusable LoadingSkeleton Component
 * variant: card | text | avatar | table-row
 */
export function LoadingSkeleton({
  variant = 'text',
  count = 1,
  className = '',
}) {
  const items = Array.from({ length: count });

  if (variant === 'card') {
    return (
      <div className={`space-y-3 ${className}`}>
        {items.map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'avatar') {
    return (
      <div className={`flex items-center gap-3 animate-pulse ${className}`}>
        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2.5 ${className}`}>
      {items.map((_, i) => (
        <div
          key={i}
          className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-full"
          style={{ width: i === items.length - 1 && count > 1 ? '70%' : '100%' }}
        />
      ))}
    </div>
  );
}
