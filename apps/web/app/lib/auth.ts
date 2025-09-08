import { db } from "@repo/db/client";
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcrypt";

export const authOptions = { 
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email", placeholder: "your-email@example.com", required: true },
                password: { label: "Password", type: "password", required: true }
            },
            // TODO: User credentials type from next-aut
            async authorize(credentials: any) {
                // Do zod validation, OTP validation here

                const existingUser = await db.user.findFirst({
                    where: {
                        email: credentials.email
                    }
                });

                if (existingUser) {
                    const passwordValidation = await bcrypt.compare(credentials.password, existingUser.password);
                    if (passwordValidation) {
                        return {
                            id: existingUser.id.toString(),
                            name: existingUser.firstName,
                            email: existingUser.email
                        }
                    }else{
                        return null;
                    }
                }else{
                    return null
                }
            },
        })
    ],
    secret: process.env.JWT_SECRET || "secret",
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) token.sub = user.id;
            return token
        },
        async session({ token, session }: any) {
            session.user.id = token.sub
            return session
        }
    }
}
