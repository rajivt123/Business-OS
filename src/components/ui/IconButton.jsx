import React from 'react';

/**
 * Reusable IconButton Component
 */
export function IconButton({
  icon: Icon,
  label,
  variant = 'ghost',
  size = 'md',
  isDisabled = false,
  className = '',
  onClick,
  title,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0';

  const sizeStyles = {
    sm: 'p-1.5 w-8 h-8 text-xs',
    md: 'p-2 w-9 h-9 text-sm',
    lg: 'p-2.5 w-10 h-10 text-base',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-500',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
    outline: 'border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 focus:ring-slate-400 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800',
    ghost: 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-400 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
    danger: 'text-red-600 hover:bg-red-50 focus:ring-red-400 dark:hover:bg-red-950/40',
  };

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={onClick}
      title={title || label}
      aria-label={label || title}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.ghost} ${className}`}
      {...props}
    >
      {Icon && <Icon className={iconSizes[size] || iconSizes.md} />}
    </button>
  );
}
