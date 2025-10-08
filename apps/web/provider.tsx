"use client"

import { SessionProvider } from "next-auth/react";
import { FlashMessageProvider } from "./context/FlashMessageContext";
import { ThemeProvider } from "./context/ThemeContext";

export const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <SessionProvider>
            <ThemeProvider defaultTheme="dark" enableSystem={true}>
                <FlashMessageProvider>
                    {children}
                </FlashMessageProvider>
            </ThemeProvider>
        </SessionProvider>
    );
}