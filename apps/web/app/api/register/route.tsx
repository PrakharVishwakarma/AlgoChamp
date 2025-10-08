// apps/web/app/api/register/route.tsx

import { NextResponse } from "next/server";
import { db } from "@repo/db";
import bcrypt from "bcrypt";
import { userValidation } from "@repo/zod-validation/userValidation"; 

export async function POST(req: Request) {
    try {
        const jsonData = await req.json();
        
        // Validate the request body using Zod
        const result = userValidation.safeParse(jsonData);
        if (!result.success) {
            return NextResponse.json({ 
                error: result.error.errors,
                message: "Validation failed"
            }, { status: 400 });
        }

        const { email, password, firstName, lastName } = result.data;

        // Check if user already exists
        const existingUser = await db.user.findUnique({ 
            where: { email: email.toLowerCase() } 
        });
        
        if (existingUser) {
            return NextResponse.json({ 
                message: "User already exists" 
            }, { status: 400 });
        }

        // Hash password with higher cost for better security
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new user
        const user = await db.user.create({
            data: { 
                email: email.toLowerCase(),
                password: hashedPassword, 
                firstName: firstName.trim(), 
                lastName: lastName.trim() 
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                createdAt: true
            }
        });

        return NextResponse.json({ 
            message: "Account created successfully! Please sign in to continue.",
            user 
        }, { status: 201 });
        
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ 
            message: "Internal server error. Please try again later." 
        }, { status: 500 });
    }
}
