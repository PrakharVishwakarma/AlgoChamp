// /packages/ui/src/switch.tsx

'use client';

import * as React from 'react';

/**
 * A simple, accessible Switch component for your UI library.
 */

interface SwitchProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  thumbClassName?: string;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      checked,
      onCheckedChange,
      className = '',
      thumbClassName = '',
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseClasses =
      'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';
    
    const stateClasses = checked
      ? 'bg-primary'
      : 'bg-input';
    
    const disabledClasses =
      disabled ? 'cursor-not-allowed opacity-50' : '';

    const thumbBaseClasses =
      'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform';
    
    const thumbStateClasses = checked
      ? 'translate-x-5'
      : 'translate-x-0';

    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onCheckedChange(!checked)}
        disabled={disabled}
        className={`${baseClasses} ${stateClasses} ${disabledClasses} ${className}`}
        ref={ref}
        {...props}
      >
        <span
          className={`${thumbBaseClasses} ${thumbStateClasses} ${thumbClassName}`}
        />
      </button>
    );
  },
);
Switch.displayName = 'Switch';