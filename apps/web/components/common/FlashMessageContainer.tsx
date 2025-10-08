// /apps/web/components/common/FlashMessageContainer.tsx

"use client";

import { useState, useEffect } from "react";
import { useFlashMessages, useFlashMessageActions } from "../../context/FlashMessageContext";

import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

import type { FlashMessageType, FlashMessage } from "../../app/lib/flashTypes";

const iconMap: Record<FlashMessageType, React.ReactNode> = {
    success: <CheckCircle className="w-5 h-5 text-success" />,
    error: <XCircle className="w-5 h-5 text-destructive" />,
    info: <Info className="w-5 h-5 text-info" />,
    warn: <AlertTriangle className="w-5 h-5 text-warning" />,
};

const styleMap: Record<FlashMessageType, { container: string, text: string, title: string }> = {
    success: { 
        container: "bg-card/95 border-success/30 shadow-success/10", 
        text: "text-foreground", 
        title: "text-success" 
    },
    error: { 
        container: "bg-card/95 border-destructive/30 shadow-destructive/10", 
        text: "text-foreground", 
        title: "text-destructive" 
    },
    info: { 
        container: "bg-card/95 border-info/30 shadow-info/10", 
        text: "text-foreground", 
        title: "text-info" 
    },
    warn: { 
        container: "bg-card/95 border-warning/30 shadow-warning/10", 
        text: "text-foreground", 
        title: "text-warning" 
    },
};

const FlashMessageItem = ({ message }: { message: FlashMessage }) => {
    const [isRemoving, setIsRemoving] = useState(false);
    const { removeFlashMessage } = useFlashMessageActions();
    const styles = styleMap[message.type];

    const handleRemove = () => {
        setIsRemoving(true);
        // Wait for exit animation before actually removing
        setTimeout(() => {
            removeFlashMessage(message.id);
        }, 300);
    };

    useEffect(() => {
        // Add entrance animation delay
        const timer = setTimeout(() => {
            setIsRemoving(false);
        }, 50);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            className={`
                flex items-start gap-3 p-4 rounded-lg shadow-2xl border backdrop-blur-md
                transition-all duration-300 ease-in-out transform
                ${isRemoving ? 'animate-slide-out' : 'animate-slide-in'}
                ${styles.container}
                hover:scale-[1.02] hover:shadow-xl
                focus-within:ring-2 focus-within:ring-blue-500/50
            `}
            role="alert"
            aria-live="polite"
            aria-atomic="true"
        >
            <div className="flex-shrink-0 mt-0.5">{iconMap[message.type]}</div>
            
            <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${styles.title}`}>
                    {message.type.charAt(0).toUpperCase() + message.type.slice(1)}
                </p>
                <p className={`text-sm leading-relaxed ${styles.text}`}>
                    {message.message}
                </p>
            </div>

            <button
                onClick={handleRemove}
                className="flex-shrink-0 p-1 rounded-full transition-colors duration-200 hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Dismiss notification"
                type="button"
            >
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
        </div>
    );
};

export const FlashMessageContainer = () => {
    const messages = useFlashMessages();

    if (messages.length === 0) return null;

    return (
        <div 
            className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 w-full max-w-md pointer-events-none"
            aria-label="Flash messages"
        >
            {messages.map((msg) => (
                <div key={msg.id} className="pointer-events-auto w-full">
                    <FlashMessageItem message={msg} />
                </div>
            ))}
        </div>
    );
};