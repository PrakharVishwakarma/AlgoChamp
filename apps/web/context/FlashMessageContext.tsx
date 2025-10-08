// apps/web/context/FlashMessageContext.tsx

import React, { createContext, useContext, useState, ReactNode, useCallback, useRef } from "react";

import type { FlashMessage, FlashMessageType } from "../app/lib/flashTypes";

// Create a context for flash messages state
const FlashMessageContext = createContext<FlashMessage[] | undefined>(undefined);

// Create a context for flash message actions
interface FlashMessageActions {
    showFlashMessage: (type: FlashMessageType, message: string, duration?: number) => void;
    removeFlashMessage: (id: string) => void;
    clearAllFlashMessages: () => void;
}

const FlashMessageDispatchContext = createContext<FlashMessageActions | undefined>(undefined);

export const FlashMessageProvider = ({ children }: { children: ReactNode }) => {
    const [messages, setMessages] = useState<FlashMessage[]>([]);
    const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

    const removeFlashMessage = useCallback((id: string) => {
        setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== id));
        
        // Clear the timeout for this message
        const timeout = timeoutRefs.current.get(id);
        if (timeout) {
            clearTimeout(timeout);
            timeoutRefs.current.delete(id);
        }
    }, []);

    const showFlashMessage = useCallback((type: FlashMessageType, message: string, duration: number = 5000) => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newMessage: FlashMessage = { id, type, message };

        setMessages((prevMessages) => [...prevMessages, newMessage]);

        // Auto-remove after specified duration
        if (duration > 0) {
            const timeout = setTimeout(() => {
                removeFlashMessage(id);
            }, duration);
            
            timeoutRefs.current.set(id, timeout);
        }
    }, [removeFlashMessage]);

    const clearAllFlashMessages = useCallback(() => {
        // Clear all timeouts
        timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
        timeoutRefs.current.clear();
        
        // Clear all messages
        setMessages([]);
    }, []);

    const actions: FlashMessageActions = {
        showFlashMessage,
        removeFlashMessage,
        clearAllFlashMessages,
    };

    return (
        <FlashMessageContext.Provider value={messages}>
            <FlashMessageDispatchContext.Provider value={actions}>
                {children}
            </FlashMessageDispatchContext.Provider>
        </FlashMessageContext.Provider>
    );
}

// Hook to access flash messages
export const useFlashMessages = () => {
    const context = useContext(FlashMessageContext);
    if (!context) {
        throw new Error("useFlashMessages must be used within a FlashMessageProvider");
    }
    return context;
};

// Hook to access flash message actions
export const useFlashMessageActions = () => {
    const context = useContext(FlashMessageDispatchContext);
    if (!context) {
        throw new Error("useFlashMessageActions must be used within a FlashMessageProvider");
    }
    return context;
};

// Convenience hook for showing flash messages (backward compatibility)
export const useShowFlashMessage = () => {
    const { showFlashMessage } = useFlashMessageActions();
    return showFlashMessage;
};

