import { z } from "zod";

export const submissionCallback = z.object({
    token: z.string(),
    status: z.object({
        id: z.number(),
        description: z.string()
    }),
    time: z.string().optional(),  // Judge0 sometimes returns time as a string
    memory: z.string().optional() // Judge0 sometimes returns memory as a string
});

export type SubmissionCallback = z.infer<typeof submissionCallback>;
