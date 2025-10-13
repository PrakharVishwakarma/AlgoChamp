// app/web/components/RegisterForm.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertTriangle, Loader2 } from "lucide-react";
import { useFlashMessageActions } from "../context/FlashMessageContext";
import { Logo } from "./Logo";

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
    const { showFlashMessage } = useFlashMessageActions();

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
            showFlashMessage("warn", "Please fix the form errors before submitting.");
            return;
        }

        setIsLoading(true);
        setErrors({});
        showFlashMessage("info", "Creating your account...");

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
                    showFlashMessage("error", "An account with this email already exists. Please try signing in instead.");
                } else if (data.error) {
                    // Handle Zod validation errors
                    const fieldErrors: FormErrors = {};
                    data.error.forEach((err: { path?: string[]; message: string }) => {
                        if (err.path && err.path.length > 0) {
                            fieldErrors[err.path[0] as keyof FormErrors] = err.message;
                        }
                    });
                    setErrors(fieldErrors);
                    showFlashMessage("error", "Please fix the form errors and try again.");
                } else {
                    setErrors({ general: data.message || "Registration failed. Please try again." });
                    showFlashMessage("error", data.message || "Registration failed. Please try again.");
                }
                return;
            }

            // Success - show success message and redirect
            showFlashMessage("success", "Account created successfully! Redirecting to sign in...");

            // Brief delay to let user see the success message
            setTimeout(() => {
                router.push("/api/auth/signin?callbackUrl=/dashboard?from=register");
            }, 2000);
        } catch (error) {
            console.error("Registration error:", error);
            setErrors({ general: "Network error. Please check your connection and try again." });
            showFlashMessage("error", "Network error. Please check your connection and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const inputClasses = (fieldName: keyof FormErrors) => {
        const baseClasses = "w-full px-4 py-3 bg-input border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200";
        const errorClasses = errors[fieldName]
            ? "border-destructive/50 focus:ring-destructive/20 focus:border-destructive"
            : "border-border focus:ring-primary/20 focus:border-primary hover:border-accent";
        return `${baseClasses} ${errorClasses}`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/5 to-background">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-info/5 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-[33rem]">
                {/* Header */}
                <div className="text-center mb-6 flex flex-row items-center gap-4 justify-center ">
                    <div className="min-w-20">
                        <Logo size="md" className="mx-auto" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-1">
                            Join AlgoChamp
                        </h1>
                        <p className="text-foreground/70">
                            Start your competitive programming journey
                        </p>
                    </div>
                </div>

                {/* Registration Form */}
                <div className="bg-card/60 backdrop-blur-xl border border-border rounded-xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
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
                                    <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                                        <AlertTriangle className="w-4 h-4" />
                                        {errors.firstName}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
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
                                    <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                                        <AlertTriangle className="w-4 h-4" />
                                        {errors.lastName}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
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
                                <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                                    <AlertTriangle className="w-4 h-4" />
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
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
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    disabled={isLoading}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                                    <AlertTriangle className="w-4 h-4" />
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* General Error */}
                        {errors.general && (
                            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                                <p className="text-destructive text-sm flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
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
                                    <Loader2 className="animate-spin h-5 w-5" />
                                    Creating Account...
                                </span>
                            ) : (
                                "Create Account"
                            )}
                        </button>

                        {/* Sign In Link */}
                        <div className="text-center pt-4 border-t border-border">
                            <p className="text-muted-foreground">
                                Already have an account?{" "}
                                <Link
                                    href="/api/auth/signin"
                                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                                >
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-muted-foreground/80 text-sm">
                        By creating an account, you agree to our{" "}
                        <Link href="/terms" className="text-primary hover:text-primary/80 font-medium transition-colors">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-primary hover:text-primary/80 font-medium transition-colors">
                            Privacy Policy
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}