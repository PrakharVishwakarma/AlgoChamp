// apps/web/components/Navigation.tsx

"use client";

import Link from "next/link";
import { Trophy, Users, BarChart3, User, LayoutDashboard } from "lucide-react";
import { Button } from "@repo/ui/button";
import { ThemeToggle } from "./theme/ThemeToggle";
import { Logo } from "./Logo";

interface NavigationProps {
    user?: {
        name?: string | null;
        id?: string;
    };
    onSignin: () => void;
    onSignout: () => void;
}

export const Navigation = ({ user, onSignin, onSignout }: NavigationProps) => {
    return (
        <header className="sticky top-0 z-50">
            <div className="flex justify-between items-center px-8 py-4 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity min-w-10">
                    <Logo size="sm" priority />
                    <p className="font-bold text-2xl">AlgoChamp</p>
                </Link>

                {/* Navigation */}
                <nav className="hidden md:flex items-center space-x-6">
                    {user && (<Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                    </Link>)}

                    <Link href="/problems" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <Trophy className="w-4 h-4" />
                        Problems
                    </Link>
                    <Link href="/contests" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <Users className="w-4 h-4" />
                        Contests
                    </Link>
                    <Link href="/leaderboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <BarChart3 className="w-4 h-4" />
                        Leaderboard
                    </Link>
                </nav>

                {/* User Actions */}
                <div className="flex items-center gap-4">
                    {/* Theme Toggle */}
                    <ThemeToggle variant="button" />

                    {user ? (
                        <>
                            {/* User Info */}
                            <div className="hidden sm:flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-primary-foreground" />
                                </div>
                                <span className="text-muted-foreground">
                                    {user.name || 'User'}
                                </span>
                            </div>

                            {/* Logout Button */}
                            <Button variant="secondary" onClick={onSignout}>
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            {/* Register Button */}
                            <Link href="/register">
                                <Button variant="success">
                                    Register
                                </Button>
                            </Link>

                            {/* Login Button */}
                            <Button onClick={onSignin}>
                                Login
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};