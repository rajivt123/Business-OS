import React, { useEffect } from 'react';
import { AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'amber', // 'amber' | 'rose' | 'sky' | 'emerald'
  loading = false
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toneConfig = {
    amber: {
      icon: AlertTriangle,
      badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
      btn: 'bg-amber-600 hover:bg-amber-500 text-white'
    },
    rose: {
      icon: AlertTriangle,
      badge: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
      btn: 'bg-rose-600 hover:bg-rose-500 text-white'
    },
    emerald: {
      icon: CheckCircle2,
      badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      btn: 'bg-emerald-600 hover:bg-emerald-500 text-white'
    },
    sky: {
      icon: Info,
      badge: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
      btn: 'bg-sky-600 hover:bg-sky-500 text-white'
    }
  };

  const currentTone = toneConfig[tone] || toneConfig.amber;
  const IconComponent = currentTone.icon;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden p-6 space-y-4">
        <div className="flex items-start gap-3.5">
          <div className={`p-2.5 rounded-xl border ${currentTone.badge} shrink-0`}>
            <IconComponent size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              {title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="os-secondary cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50 ${currentTone.btn}`}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
