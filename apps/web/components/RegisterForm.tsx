"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!firstName || !email || !password || !lastName) {
            setError("All fields are necessary.");
            return;
        }

        try {
            const res = await fetch("api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    password,
                }),
            });

            if (!res.ok) {
                setError(res.statusText || "Something went wrong at the server side.");
                return;
            } 
            router.push("/api/auth/signin");
        } catch (error) {
            console.log("Error during registration: ", error);
            setError("Something went wrong at the server side. Please try again later.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 p-5">
            <div className="bg-white/20 backdrop-blur-md shadow-xl rounded-lg p-6 border border-white/20 w-full max-w-md transform transition duration-500">
                <h1 className="text-3xl font-extrabold text-white text-center mb-6 animate-fade-in">
                    Register
                </h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        onChange={(e) => setFirstName(e.target.value)}
                        type="text"
                        placeholder="First Name"
                        className="w-full bg-white/35 border border-white/30 text-black placeholder-black/75 text-lg rounded-md p-3 outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-300"
                    />
                    <input
                        onChange={(e) => setLastName(e.target.value)}
                        type="text"
                        placeholder="Last Name"
                        className="w-full bg-white/35 border border-white/30 text-black placeholder-black/75 text-lg rounded-md p-3 outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-300"
                    />
                    <input
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        placeholder="Email"
                        className="w-full bg-white/35 border border-white/30 text-black placeholder-black/75 text-lg rounded-md p-3 outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-300"
                    />
                    <input
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        placeholder="Password"
                        className="w-full bg-white/35 border border-white/30 text-white placeholder-white/70 text-lg rounded-md p-3 outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-300"
                    />
                    <button className="w-full bg-gradient-to-r from-green-400 to-green-600 text-white font-bold text-lg py-3 rounded-md shadow-lg hover:from-green-500 hover:to-green-700 transition-all duration-300 transform hover:scale-105">
                        Register
                    </button>

                    {error && (
                        <div className="bg-red-500 text-white text-sm py-2 px-4 rounded-md text-center animate-bounce">
                            {error}
                        </div>
                    )}

                    <Link className="text-white text-sm text-center mt-3 block hover:underline transition-all duration-300" href={"/api/auth/signin"}>
                        Already have an account? <span className="font-bold">Login</span>
                    </Link>
                </form>
            </div>
        </div>
    )
}