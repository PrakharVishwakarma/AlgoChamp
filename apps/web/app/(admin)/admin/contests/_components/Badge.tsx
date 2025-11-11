// /apps/web/app/(admin)/admin/contests/_components/Badge.tsx

import * as React from 'react';

// Define the styles for our variants
const variantStyles = {
  default: 'border-transparent bg-primary text-primary-foreground shadow',
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
  destructive:
    'border-transparent bg-destructive text-destructive-foreground shadow',
  outline: 'text-foreground',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variantStyles;
}

/**
 * A simple, manual Badge component created locally for the admin workspace.
 * It does not use cva or tailwind-merge.
 */
function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  // Base classes for all badges
  const baseClasses =
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors';

  // Get the variant-specific classes
  const variantClasses = variantStyles[variant] || variantStyles.default;

  // Combine them all
  const combinedClasses = `${baseClasses} ${variantClasses} ${className || ''}`;

  return <div className={combinedClasses} {...props} />;
}

export { Badge };