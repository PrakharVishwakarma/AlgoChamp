import { NextResponse } from "next/server";
import { db } from "@repo/db/client";
import bcrypt from "bcrypt";
import { userValidation } from "@repo/zod-validation/userValidation"; 


export async function POST(req: Request) {
    try {
        const jsonData = await req.json();
        // console.log(jsonData);
        // Validate the request body using Zod
        const result = userValidation.safeParse(jsonData);
        if (!result.success) {
            return NextResponse.json({ error: result.error.errors }, { status: 400 });
        }

        // console.log(result.data)
        const { email, password, firstName, lastName } = result.data;

        // Check if user already exists
        const existingUser = await db.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ message: "User already exists" }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = await db.user.create({
            data: { email, password: hashedPassword, firstName, lastName },
        });

        return NextResponse.json({ message: "User created successfully", user }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
