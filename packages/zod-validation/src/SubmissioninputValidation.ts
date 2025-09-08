import { z } from "zod";

export const submissioninputValidation = z.object({
    problemId: z.string(),
    languageId: z.enum(["js", "cpp", "rs"]),
    code: z.string(),
    activeContestId: z.string().optional(),
});

export type SubmissionInputType = z.infer<typeof submissioninputValidation>;
