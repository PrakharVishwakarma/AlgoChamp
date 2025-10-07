"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface FormErrors {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    general?: string;
}

export default function RegisterForm() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter();

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!firstName.trim()) {
            newErrors.firstName = "First name is required";
        } else if (firstName.length < 2) {
            newErrors.firstName = "First name must be at least 2 characters";
        } else if (!/^[A-Za-z]+$/.test(firstName)) {
            newErrors.firstName = "First name can only contain letters";
        }

        if (!lastName.trim()) {
            newErrors.lastName = "Last name is required";
        } else if (lastName.length < 2) {
            newErrors.lastName = "Last name must be at least 2 characters";
        } else if (!/^[A-Za-z]+$/.test(lastName)) {
            newErrors.lastName = "Last name can only contain letters";
        }

        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    email: email.trim().toLowerCase(),
                    password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 400 && data.message === "User already exists") {
                    setErrors({ email: "An account with this email already exists" });
                } else if (data.error) {
                    // Handle Zod validation errors
                    const fieldErrors: FormErrors = {};
                    data.error.forEach((err: { path?: string[]; message: string }) => {
                        if (err.path && err.path.length > 0) {
                            fieldErrors[err.path[0] as keyof FormErrors] = err.message;
                        }
                    });
                    setErrors(fieldErrors);
                } else {
                    setErrors({ general: data.message || "Registration failed. Please try again." });
                }
                return;
            }

            // Success - redirect to sign in
            router.push("/api/auth/signin?callbackUrl=/dashboard");
        } catch (error) {
            console.error("Registration error:", error);
            setErrors({ general: "Network error. Please check your connection and try again." });
        } finally {
            setIsLoading(false);
        }
    };

    const inputClasses = (fieldName: keyof FormErrors) => {
        const baseClasses = "w-full px-4 py-3 bg-slate-800/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200";
        const errorClasses = errors[fieldName] 
            ? "border-red-500 focus:ring-red-500/50 focus:border-red-500" 
            : "border-slate-600 focus:ring-blue-500/50 focus:border-blue-500 hover:border-slate-500";
        return `${baseClasses} ${errorClasses}`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-950 via-slate-900 to-gray-900">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
                        <span className="text-2xl">🚀</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Join AlgoChamp
                    </h1>
                    <p className="text-slate-400">
                        Start your competitive programming journey
                    </p>
                </div>

                {/* Registration Form */}
                <div className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-slate-300 mb-2">
                                    First Name
                                </label>
                                <input
                                    id="firstName"
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="John"
                                    className={inputClasses('firstName')}
                                    disabled={isLoading}
                                />
                                {errors.firstName && (
                                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                                        <span className="text-xs">⚠️</span>
                                        {errors.firstName}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-slate-300 mb-2">
                                    Last Name
                                </label>
                                <input
                                    id="lastName"
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Doe"
                                    className={inputClasses('lastName')}
                                    disabled={isLoading}
                                />
                                {errors.lastName && (
                                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                                        <span className="text-xs">⚠️</span>
                                        {errors.lastName}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="john.doe@example.com"
                                className={inputClasses('email')}
                                disabled={isLoading}
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                                    <span className="text-xs">⚠️</span>
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Create a strong password"
                                    className={inputClasses('password')}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                    disabled={isLoading}
                                >
                                    {showPassword ? "🙈" : "👁️"}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                                    <span className="text-xs">⚠️</span>
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* General Error */}
                        {errors.general && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                <p className="text-red-400 text-sm flex items-center gap-2">
                                    <span>❌</span>
                                    {errors.general}
                                </p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Creating Account...
                                </span>
                            ) : (
                                "Create Account"
                            )}
                        </button>

                        {/* Sign In Link */}
                        <div className="text-center pt-4 border-t border-slate-700">
                            <p className="text-slate-400">
                                Already have an account?{" "}
                                <Link
                                    href="/api/auth/signin"
                                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                                >
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-slate-500 text-sm">
                        By creating an account, you agree to our{" "}
                        <Link href="/terms" className="text-blue-400 hover:text-blue-300 transition-colors">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-blue-400 hover:text-blue-300 transition-colors">
                            Privacy Policy
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}