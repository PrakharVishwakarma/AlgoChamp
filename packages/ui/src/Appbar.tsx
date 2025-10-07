import { Button } from "./button";
import Link from "next/link";

interface AppbarProps {
    user?: {
        name?: string | null;
        id?: string;
    };
    onSignin: () => void;
    onSignout: () => void;
}

export const Appbar = ({ user, onSignin, onSignout }: AppbarProps) => {
    return (
        <header className="sticky top-0 z-50">
            <div className="flex justify-between items-center px-8 py-4 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 shadow-lg backdrop-blur-md border-b border-gray-600">
                {/* Logo */}
                <Link href="/" className="text-2xl font-extrabold tracking-wide text-white drop-shadow-lg hover:text-blue-400 transition-colors">
                    <span className="font-mono">🚀 AlgoChamp</span>
                </Link>

                {/* Navigation */}
                <nav className="hidden md:flex items-center space-x-6">
                    <Link href="/problems" className="text-gray-300 hover:text-white transition-colors">
                        Problems
                    </Link>
                    <Link href="/contests" className="text-gray-300 hover:text-white transition-colors">
                        Contests
                    </Link>
                    <Link href="/leaderboard" className="text-gray-300 hover:text-white transition-colors">
                        Leaderboard
                    </Link>
                </nav>

                {/* User Actions */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            {/* User Info */}
                            <div className="hidden sm:flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-semibold text-sm">
                                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                                <span className="text-gray-300">
                                    {user.name || 'User'}
                                </span>
                            </div>

                            {/* Dashboard Button */}
                            <Link
                                href="/dashboard"
                                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 hover:scale-105 transition duration-300"
                            >
                                Dashboard
                            </Link>

                            {/* Logout Button */}
                            <Button onClick={onSignout}>Logout</Button>
                        </>
                    ) : (
                        <>
                            {/* Register Button */}
                            <Link
                                href="/register"
                                className="px-4 py-2 text-sm font-semibold text-white bg-green-500 rounded-lg shadow-md hover:bg-green-600 hover:scale-105 transition duration-300"
                            >
                                Register
                            </Link>

                            {/* Login Button */}
                            <Button onClick={onSignin}>Login</Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};


