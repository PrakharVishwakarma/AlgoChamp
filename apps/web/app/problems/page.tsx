// apps/web/app/problems/page.tsx

import { JSX } from "react";
import { Target, Clock, TrendingUp, Users, Zap } from "lucide-react";
import Link from "next/link";
import { ClientNavigation } from "../../components/ClientNavigation";
import { Logo } from "../../components/Logo";

export default function ProblemsPage(): JSX.Element {
    return (
        <div className="min-h-screen bg-background">
            <ClientNavigation />
            
            <main className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="mb-6">
                        <Logo size="lg" className="mx-auto" />
                    </div>
                    <h1 className="text-4xl font-bold text-foreground mb-4">Practice Problems</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        🎉 Welcome! You&apos;re now accessing a protected route. Only authenticated users can see this page.
                    </p>
                </div>

                {/* Protected Route Demo */}
                <div className="bg-success/10 border border-success/20 rounded-lg p-6 mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-3 h-3 bg-success rounded-full"></div>
                        <h2 className="text-lg font-semibold text-success">✅ Route Protection Working!</h2>
                    </div>
                    <p className="text-success/80">
                        This is a protected route. If you can see this page, it means you are successfully authenticated 
                        and our middleware is working correctly. Unauthenticated users would be redirected to the sign-in page.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-card border border-border rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Target className="w-6 h-6 text-primary" />
                            <h3 className="font-semibold text-foreground">Total Problems</h3>
                        </div>
                        <p className="text-3xl font-bold text-foreground">500+</p>
                        <p className="text-sm text-muted-foreground">Active challenges</p>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Clock className="w-6 h-6 text-info" />
                            <h3 className="font-semibold text-foreground">Your Solved</h3>
                        </div>
                        <p className="text-3xl font-bold text-foreground">42</p>
                        <p className="text-sm text-muted-foreground">Keep going!</p>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-6 h-6 text-success" />
                            <h3 className="font-semibold text-foreground">Success Rate</h3>
                        </div>
                        <p className="text-3xl font-bold text-foreground">78%</p>
                        <p className="text-sm text-muted-foreground">Great progress!</p>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Users className="w-6 h-6 text-warning" />
                            <h3 className="font-semibold text-foreground">Global Rank</h3>
                        </div>
                        <p className="text-3xl font-bold text-foreground">#1,247</p>
                        <p className="text-sm text-muted-foreground">Top 10%</p>
                    </div>
                </div>

                {/* Coming Soon Section */}
                <div className="bg-card border border-border rounded-lg p-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-warning/10 border border-warning/20 rounded-full text-warning text-sm font-medium mb-6">
                        <Zap className="w-4 h-4" />
                        Coming Soon
                    </div>
                    
                    <h2 className="text-2xl font-bold text-foreground mb-4">
                        Full Problem Set Loading...
                    </h2>
                    
                    <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
                        We&apos;re working hard to bring you an amazing collection of programming problems. 
                        From beginner-friendly challenges to advanced algorithmic puzzles!
                    </p>
                    
                    <div className="space-y-4 mb-8">
                        <h3 className="text-xl font-semibold text-foreground">What to expect:</h3>
                        <div className="grid md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                                500+ Curated Programming Problems
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <div className="w-2 h-2 bg-info rounded-full"></div>
                                Difficulty levels from Easy to Expert
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <div className="w-2 h-2 bg-success rounded-full"></div>
                                Multiple programming language support
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <div className="w-2 h-2 bg-warning rounded-full"></div>
                                Real-time code execution and testing
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-4">
                        <Link 
                            href="/dashboard"
                            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                            Back to Dashboard
                        </Link>
                        <Link 
                            href="/contests"
                            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors"
                        >
                            View Contests
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}