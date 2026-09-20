import React from 'react';
import { Clock, User, Activity } from 'lucide-react';

/**
 * Reusable ActivityFeed Component
 * items: Array of { id, title, description, timestamp, user, icon }
 */
export function ActivityFeed({
  items = [],
  emptyMessage = 'No recent activity',
  className = '',
}) {
  if (items.length === 0) {
    return (
      <div className={`p-6 text-center text-slate-400 dark:text-slate-500 text-[13px] ${className}`}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {items.map((item, index) => {
        const Icon = item.icon || Activity;
        const isLast = index === items.length - 1;

        return (
          <div key={item.id || index} className="relative flex gap-3">
            {!isLast && (
              <div className="absolute left-4 top-8 bottom-0 w-px bg-slate-200 dark:bg-slate-800 -ml-px" />
            )}
            <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0 z-10 h-8 w-8 flex items-center justify-center">
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 pt-0.5 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[14px] font-semibold text-slate-800 dark:text-slate-200">
                  {item.title}
                </span>
                {item.timestamp && (
                  <span className="text-[12px] text-slate-400 dark:text-slate-500 flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" />
                    {item.timestamp}
                  </span>
                )}
              </div>
              {item.description && (
                <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              )}
              {item.user && (
                <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 pt-1">
                  <User className="w-3 h-3 text-slate-400" />
                  {item.user}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
