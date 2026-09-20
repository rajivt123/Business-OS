import React, { useEffect } from 'react';
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react';
import { Button } from './Button';
import { IconButton } from './IconButton';

/**
 * Reusable ConfirmationDialog Component
 */
export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger', // danger | warning | info
  isLoading = false,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) return null;

  const icons = {
    danger: <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
    info: <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
  };

  const iconBg = {
    danger: 'bg-rose-100 dark:bg-rose-950/60',
    warning: 'bg-amber-100 dark:bg-amber-950/60',
    info: 'bg-blue-100 dark:bg-blue-950/60',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={() => !isLoading && onClose()}
      />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden p-6 flex flex-col gap-5 z-10">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full shrink-0 ${iconBg[variant] || iconBg.danger}`}>
            {icons[variant] || icons.danger}
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
            {message && <p className="text-[14px] text-slate-600 dark:text-slate-400 leading-relaxed">{message}</p>}
          </div>
          <IconButton icon={X} label="Close dialog" onClick={onClose} isDisabled={isLoading} size="sm" />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} isDisabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
