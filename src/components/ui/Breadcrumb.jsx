import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Reusable Breadcrumb Component
 * Items: Array of { label: string, onClick?: () => void, href?: string }
 */
export function Breadcrumb({ items = [], className = '' }) {
  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-1.5 text-[13px] text-slate-500 dark:text-slate-400 overflow-x-auto custom-scrollbar py-0.5 ${className}`}>
      <button
        type="button"
        onClick={() => items[0]?.onClick?.()}
        className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
      >
        <Home className="w-3.5 h-3.5" />
      </button>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                {item.label}
              </span>
            ) : (
              <button
                type="button"
                onClick={item.onClick}
                className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors truncate cursor-pointer shrink-0"
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
