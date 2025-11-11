// /packages/zod-validation/src/ContestValidation.ts

import { z } from 'zod';

/**
 * Schema for creating a new contest.
 * This will be used in a Server Action, so we use z.coerce
 * to correctly handle FormData (which sends everything as strings).
 */
const BaseContestSchema = z.object({
  title: z
    .string()
    .min(3, { message: 'Title must be at least 3 characters long.' })
    .max(100, { message: 'Title must be 100 characters or less.' }),

  description: z
    .string()
    .max(10000, { message: 'Description must be 10,000 characters or less.' })
    .optional(),

  startTime: z.coerce.date({
    invalid_type_error: 'Please enter a valid start date and time.',
  }),

  endTime: z.coerce.date({
    invalid_type_error: 'Please enter a valid end date and time.',
  }),
});

export const CreateContestSchema = BaseContestSchema.refine(
  (data) => data.endTime > data.startTime,
  {
    message: 'The end date must be after the start date.',
    path: ['endTime'], // This attaches the error to the endTime field
  }
);

export type CreateContestInput = z.infer<typeof CreateContestSchema>;

export const UpdateContestSchema = BaseContestSchema.extend({
  contestId: z.string().cuid({ message: 'Invalid Contest ID.' }),
}).refine((data) => data.endTime > data.startTime, {
  message: 'The end date must be after the start date.',
  path: ['endTime'],
});

export type UpdateContestInput = z.infer<typeof UpdateContestSchema>;

/**
 * --- ADD THIS NEW SCHEMA ---
 * Schema for UPDATING the points of a problem in a contest.
 */
export const UpdateProblemPointsSchema = z.object({
  contestProblemId: z.string().cuid({ message: 'Invalid Problem link ID.' }),
  points: z
    .coerce // Coerce string from FormData to number
    .number({ invalid_type_error: 'Points must be a number.' })
    .min(0, { message: 'Points cannot be negative.' })
    .default(100),
});
export type UpdateProblemPointsInput = z.infer<
  typeof UpdateProblemPointsSchema
>;

/**
 * --- ADD THIS NEW SCHEMA ---
 * Schema for ADDING a problem to a contest.
 */
export const AddProblemToContestSchema = z.object({
  contestId: z.string().cuid({ message: 'Invalid Contest ID.' }),
  problemId: z.string().cuid({ message: 'Invalid Problem ID.' }),
});
export type AddProblemToContestInput = z.infer<
  typeof AddProblemToContestSchema
>;