// /apps/web/components/ClientNavigation.tsx

"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Appbar } from "@repo/ui/appbar";

export function ClientNavigation() {
    const session = useSession();
    
    return (
        <Appbar 
            onSignin={signIn} 
            onSignout={signOut} 
            user={session.data?.user} 
        />
    );
}