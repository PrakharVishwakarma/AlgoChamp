// apps/web/components/WelcomeDashboard.tsx

"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useFlashMessageActions } from "../context/FlashMessageContext";
import UserInfo from "./UserInfo";

export default function WelcomeDashboard() {
    const { showFlashMessage } = useFlashMessageActions();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Check if user just signed in successfully
        const justSignedIn = searchParams?.get('signin') === 'success';
        const fromRegistration = searchParams?.get('from') === 'register';
        
        if (justSignedIn) {
            if (fromRegistration) {
                showFlashMessage("success", "Welcome to AlgoChamp! Your account has been created and you're now signed in.");
            } else {
                showFlashMessage("success", "Welcome back! You have successfully signed in.");
            }
        }
    }, [searchParams, showFlashMessage]);

    return <UserInfo />;
}