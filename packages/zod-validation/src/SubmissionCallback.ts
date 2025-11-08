// /packages/zod-validation/src/SubmissionCallback.ts

import { z } from "zod";

// This validator accepts a string, a number, or null/undefined.
const stringOrNumber = z.union([
    z.string(),
    z.number()
]).optional().nullable(); // Use optional().nullable() to handle missing or null values

export const submissionCallback = z.object({
    token: z.string(),
    status: z.object({
        id: z.number(),
        description: z.string()
    }),
    time: stringOrNumber,
    memory: stringOrNumber,
});

export type SubmissionCallback = z.infer<typeof submissionCallback>;