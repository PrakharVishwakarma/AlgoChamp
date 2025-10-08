// /apps/web/components/ClientNavigation.tsx

"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Navigation } from "./Navigation";
import { useFlashMessageActions } from "../context/FlashMessageContext";

export function ClientNavigation() {
    const session = useSession();
    const { showFlashMessage } = useFlashMessageActions();
    
    const handleSignIn = async () => {
        try {
            showFlashMessage("info", "Redirecting to sign in...");
            await signIn();
        } catch {
            showFlashMessage("error", "Failed to redirect to sign in. Please try again.");
        }
    };

    const handleSignOut = async () => {
        try {
            showFlashMessage("info", "Signing out...");
            await signOut({ redirect: true, callbackUrl: "/" });
            showFlashMessage("success", "You have been signed out successfully!");
        } catch {
            showFlashMessage("error", "Failed to sign out. Please try again.");
        }
    };
    
    return (
        <Navigation 
            onSignin={handleSignIn} 
            onSignout={handleSignOut} 
            user={session.data?.user}
        />
    );
}