import { z } from 'zod';

export const userValidation = z.object({
    firstName: z.string()
        .min(2, { message: "First name must be at least 2 characters long" })
        .max(50, { message: "First name must be at most 50 characters long" })
        .regex(/^[A-Za-z]+$/, { message: "First name can only contain alphabetic characters" }),

    lastName: z.string()
        .min(2, { message: "Last name must be at least 2 characters long" })
        .max(50, { message: "Last name must be at most 50 characters long" })
        .regex(/^[A-Za-z]+$/, { message: "Last name can only contain alphabetic characters" }),

    email: z.string()
        .email({ message: "Invalid email address" }),

    password: z.string()
        .min(6, { message: "Password must be at least 8 characters long" })
        .max(100, { message: "Password must be at most 100 characters long" })
});

export type UserType = z.infer<typeof userValidation>;
