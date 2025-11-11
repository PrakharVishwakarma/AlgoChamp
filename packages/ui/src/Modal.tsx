// /packages/ui/src/modal.tsx
'use client';

import * as React from 'react';
import { X } from 'lucide-react';

// A simple, self-contained Modal component
interface ModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

export function Modal({ open, onOpenChange, children }: ModalProps) {
    if (!open) return null;

    return (
        // Backdrop
        <div
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 p-4 pt-[10vh] md:items-center md:pt-4"
        >
            {/* Modal Content */}
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative z-50 grid w-full max-w-lg gap-4 rounded-lg border bg-background p-6 shadow-lg"
            >
                {children}
                <button
                    onClick={() => onOpenChange(false)}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
            </div>
        </div>
    );
}

export function ModalHeader({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`flex flex-col space-y-1.5 text-center sm:text-left ${className || ''
                }`}
        >
            {children}
        </div>
    );
}

export function ModalTitle({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <h2
            className={`text-lg font-semibold leading-none tracking-tight ${className || ''
                }`}
        >
            {children}
        </h2>
    );
}

export function ModalDescription({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <p className={`text-sm text-muted-foreground ${className || ''}`}>
            {children}
        </p>
    );
}

export function ModalBody({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return <div className={className}>{children}</div>;
}

export function ModalFooter({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className || ''
                }`}
        >
            {children}
        </div>
    );
}

export const ModalContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
    // This fragment allows the original <ModalContent> tag to work
    // as the styling is handled by the parent Modal.
    <>{children}</>
));
ModalContent.displayName = 'ModalContent';