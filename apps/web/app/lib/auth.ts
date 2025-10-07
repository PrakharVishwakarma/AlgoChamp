// apps/web/app/lib/auth.ts

import { db } from "@repo/db";
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcrypt";
import type { NextAuthOptions, User, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

// ✅ Define proper types for credentials
interface Credentials {
    email: string;
    password: string;
}

// ✅ Define the user type that gets returned from authorize
interface AuthUser {
    id: string;
    name: string | null;
    email: string;
}

// ✅ CRITICAL: Extend NextAuth types to include user id
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        }
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email", placeholder: "your-email@example.com", required: true },
                password: { label: "Password", type: "password", required: true }
            },
            // ✅ FIX 1: Properly typed credentials instead of any
            async authorize(credentials: Credentials | undefined): Promise<AuthUser | null> {
                // Validate that credentials exist
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                // TODO: Add Zod validation here for better input validation

                try {
                    const existingUser = await db.user.findFirst({
                        where: {
                            email: credentials.email
                        }
                    });

                    if (existingUser) {
                        const passwordValidation = await bcrypt.compare(credentials.password, existingUser.password);
                        if (passwordValidation) {
                            return {
                                id: existingUser.id,
                                name: existingUser.firstName,
                                email: existingUser.email
                            }
                        } else {
                            return null;
                        }
                    } else {
                        return null;
                    }
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            },
        })
    ],
    secret: process.env.NEXTAUTH_JWT_SECRET || "secret",
    callbacks: {
        // ✅ FIX 2: Properly typed JWT callback
        async jwt({ token, user }: { token: JWT; user?: User | AuthUser }): Promise<JWT> {
            if (user) {
                token.sub = user.id;
            }
            return token;
        },
        // ✅ FIX 3: Properly typed session callback with null safety
        async session({ token, session }: { token: JWT; session: Session }): Promise<Session> {
            // Safe access with proper null checking
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }
            return session;
        }
    }
}
