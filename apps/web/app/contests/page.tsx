// apps/web/app/contests/page.tsx

"use client";

import { useEffect } from "react";
import { useFlashMessageActions } from "../../context/FlashMessageContext";
import { ClientNavigation } from "../../components/ClientNavigation";
import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";
import { Logo } from "../../components/Logo";

export default function ContestsPage() {
    const { showFlashMessage } = useFlashMessageActions();

    useEffect(() => {
        showFlashMessage("info", "Contests feature is coming soon! Get ready for exciting competitive programming battles.");
    }, [showFlashMessage]);

    return (
        <div className="min-h-screen bg-background">
            <ClientNavigation />
            
            <main className="container mx-auto px-4 py-20">
                <div className="text-center max-w-2xl mx-auto">
                    <div className="mb-8">
                        <Logo size="lg" className="mx-auto" />
                    </div>
                    
                    <h1 className="text-4xl font-bold text-foreground mb-4">
                        Contests Section
                    </h1>
                    
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-warning/10 border border-warning/20 rounded-full text-warning text-sm font-medium mb-6">
                        <Zap className="w-4 h-4" />
                        Coming Soon
                    </div>
                    
                    <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                        Prepare for intense competitive programming battles! Our contests section will feature 
                        timed challenges, global leaderboards, and exciting prizes.
                    </p>
                    
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-foreground">What to expect:</h3>
                        <ul className="text-muted-foreground space-y-2">
                            <li>• Weekly Programming Contests</li>
                            <li>• Global Leaderboards & Rankings</li>
                            <li>• Real-time Contest Environment</li>
                            <li>• Performance Analytics</li>
                            <li>• Prizes and Recognition</li>
                        </ul>
                    </div>
                    
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>
            </main>
        </div>
    );
}