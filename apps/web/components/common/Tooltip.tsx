// apps/web/app/problems/[slug]/_components/Tooltip.tsx
"use client";

import { useState, useRef, useEffect, ReactNode } from 'react';

interface TooltipProps {
    content: string;
    children: ReactNode;
    delay?: number;
    className?: string;
    position?: 'top' | 'bottom' | 'bottom-right';
}

export function Tooltip({ content, children, delay = 500, className = '', position = 'bottom-right' }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const showTooltip = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                let top: number, left: number;

                switch (position) {
                    case 'top':
                        top = rect.top - 8;
                        left = rect.left + rect.width / 2;
                        break;
                    case 'bottom':
                        top = rect.bottom + 8;
                        left = rect.left + rect.width / 2;
                        break;
                    case 'bottom-right':
                    default:
                        top = rect.bottom + 8;
                        left = rect.right - 8; // Position at bottom-right of button
                        break;
                }

                setTooltipPosition({ top, left });
                setIsVisible(true);
            }
        }, delay);
    };

    const hideTooltip = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(false);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const getTransform = () => {
        switch (position) {
            case 'top':
                return 'translate(-50%, -100%)';
            case 'bottom':
                return 'translate(-50%, 0%)';
            case 'bottom-right':
            default:
                return 'translate(-100%, 0%)';
        }
    };

    const getArrowClasses = () => {
        switch (position) {
            case 'top':
                return 'absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-popover';
            case 'bottom':
                return 'absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-popover';
            case 'bottom-right':
            default:
                return 'absolute bottom-full right-3 border-4 border-transparent border-b-popover';
        }
    };

    return (
        <>
            <div
                ref={containerRef}
                onMouseEnter={showTooltip}
                onMouseLeave={hideTooltip}
                onFocus={showTooltip}
                onBlur={hideTooltip}
                className={`relative ${className}`}
            >
                {children}
            </div>

            {isVisible && tooltipPosition && (
                <div
                    className="fixed z-[100000] pointer-events-none"
                    style={{
                        top: tooltipPosition.top,
                        left: tooltipPosition.left,
                        transform: getTransform(),
                    }}
                >
                    <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 text-xs text-popover-foreground shadow-xl animate-in fade-in-0 zoom-in-95 duration-200">
                        <div className="flex items-center gap-1 whitespace-nowrap font-medium">
                            {content}
                        </div>
                        {/* Tooltip Arrow */}
                        <div className={getArrowClasses()} />
                    </div>
                </div>
            )}
        </>
    );
}