// /packages/ui/src/label.tsx
'use client'; // Required for forwardRef components in App Router

import * as React from 'react';

// A simple, accessible label component
export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={`text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className || ''
      }`}
    {...props}
  />
));
Label.displayName = 'Label';