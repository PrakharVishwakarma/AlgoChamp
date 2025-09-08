import { Button } from "./button";
import Link from "next/link";

interface AppbarProps {
    user?: {
        name?: string | null;
    };
    onSignin: any;
    onSignout: any;
}

export const Appbar = ({ user, onSignin, onSignout }: AppbarProps) => {
    return (
        <div className="flex justify-between items-center px-8 py-4 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 shadow-lg backdrop-blur-md border-b border-gray-600">
            {/* Logo */}
            <div className="text-2xl font-extrabold tracking-wide text-white drop-shadow-lg">
                <p className="font-mono">🚀 AlgoChamp</p>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-6">
                {user ? (
                    <>
                        {/* Dashboard Button */}
                        <Link
                            href="/dashboard"
                            className="px-6 py-2 text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 hover:scale-105 transition duration-300"
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
                            className="px-6 py-2 text-lg font-semibold text-white bg-green-500 rounded-lg shadow-md hover:bg-green-600 hover:scale-105 transition duration-300"
                        >
                            Register
                        </Link>

                        {/* Login Button */}
                        <Button onClick={onSignin}>Login</Button>
                    </>
                )}
            </div>
        </div>
    );
};


