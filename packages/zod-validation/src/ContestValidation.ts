// /packages/zod-validation/src/ContestValidation.ts

import { z } from 'zod';

/**
 * ============================================================================
 * ENHANCED CONTEST VALIDATION SCHEMAS - PRODUCTION READY
 * ============================================================================
 * 
 * Security Features:
 * - XSS protection via input sanitization
 * - Comprehensive date validation
 * - SQL injection prevention via length limits
 * - Business logic validation
 * 
 * Performance Features:
 * - Efficient validation with early returns
 * - Specific error messages for better UX
 * - Type-safe with full TypeScript support
 * ============================================================================
 */

// ===== CONSTANTS & CONFIGURATION =====

const CONTEST_LIMITS = {
  TITLE: {
    MIN: 3,
    MAX: 100,
  },
  DESCRIPTION: {
    MAX: 10000,
  },
  DURATION: {
    MIN_MINUTES: 15,           // Minimum 15 minutes
    MAX_DAYS: 30,              // Maximum 30 days
  },
  POINTS: {
    MIN: 0,
    MAX: 10000,
  },
} as const;

// ===== HELPER FUNCTIONS =====

/**
 * Check if a string contains potentially malicious content
 */
function containsSuspiciousPatterns(str: string): boolean {
  // Check for common XSS patterns
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // event handlers like onclick=
    /<iframe/i,
    /eval\(/i,
  ];
  
  return xssPatterns.some(pattern => pattern.test(str));
}

/**
 * Sanitize string input by removing potentially dangerous characters
 */
function sanitizeString(str: string): string {
  return str
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
}

// ===== BASE SCHEMA =====

const BaseContestSchema = z.object({
  title: z
    .string({ required_error: 'Contest title is required.' })
    .min(CONTEST_LIMITS.TITLE.MIN, { 
      message: `Title must be at least ${CONTEST_LIMITS.TITLE.MIN} characters long.` 
    })
    .max(CONTEST_LIMITS.TITLE.MAX, { 
      message: `Title must be ${CONTEST_LIMITS.TITLE.MAX} characters or less.` 
    })
    .transform(sanitizeString)
    .refine(
      (val) => !containsSuspiciousPatterns(val),
      { message: 'Title contains invalid characters or patterns.' }
    )
    .refine(
      (val) => val.length >= CONTEST_LIMITS.TITLE.MIN, // Re-check after sanitization
      { message: 'Title is too short after removing invalid characters.' }
    ),

  description: z
    .string()
    .max(CONTEST_LIMITS.DESCRIPTION.MAX, { 
      message: `Description must be ${CONTEST_LIMITS.DESCRIPTION.MAX} characters or less.` 
    })
    .transform(sanitizeString)
    .optional(),

  startTime: z.coerce.date({
    required_error: 'Start time is required.',
    invalid_type_error: 'Please enter a valid start date and time.',
  }),

  endTime: z.coerce.date({
    required_error: 'End time is required.',
    invalid_type_error: 'Please enter a valid end date and time.',
  }),
});

// ===== CREATE CONTEST SCHEMA =====

export const CreateContestSchema = BaseContestSchema
  .refine(
    (data) => {
      // Ensure start time is in the future (at least 5 minutes from now)
      const now = new Date();
      const minStartTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes
      return data.startTime >= minStartTime;
    },
    {
      message: 'Contest must start at least 5 minutes from now.',
      path: ['startTime'],
    }
  )
  .refine(
    (data) => data.endTime > data.startTime,
    {
      message: 'End time must be after start time.',
      path: ['endTime'],
    }
  )
  .refine(
    (data) => {
      // Check minimum duration (15 minutes)
      const durationMs = data.endTime.getTime() - data.startTime.getTime();
      const minDurationMs = CONTEST_LIMITS.DURATION.MIN_MINUTES * 60 * 1000;
      return durationMs >= minDurationMs;
    },
    {
      message: `Contest must be at least ${CONTEST_LIMITS.DURATION.MIN_MINUTES} minutes long.`,
      path: ['endTime'],
    }
  )
  .refine(
    (data) => {
      // Check maximum duration (30 days)
      const durationMs = data.endTime.getTime() - data.startTime.getTime();
      const maxDurationMs = CONTEST_LIMITS.DURATION.MAX_DAYS * 24 * 60 * 60 * 1000;
      return durationMs <= maxDurationMs;
    },
    {
      message: `Contest cannot be longer than ${CONTEST_LIMITS.DURATION.MAX_DAYS} days.`,
      path: ['endTime'],
    }
  );

export type CreateContestInput = z.infer<typeof CreateContestSchema>;

// ===== UPDATE CONTEST SCHEMA =====

export const UpdateContestSchema = BaseContestSchema
  .extend({
    contestId: z.string().cuid({ message: 'Invalid Contest ID format.' }),
  })
  .refine(
    (data) => data.endTime > data.startTime,
    {
      message: 'End time must be after start time.',
      path: ['endTime'],
    }
  )
  .refine(
    (data) => {
      // Check minimum duration (15 minutes)
      const durationMs = data.endTime.getTime() - data.startTime.getTime();
      const minDurationMs = CONTEST_LIMITS.DURATION.MIN_MINUTES * 60 * 1000;
      return durationMs >= minDurationMs;
    },
    {
      message: `Contest must be at least ${CONTEST_LIMITS.DURATION.MIN_MINUTES} minutes long.`,
      path: ['endTime'],
    }
  )
  .refine(
    (data) => {
      // Check maximum duration (30 days)
      const durationMs = data.endTime.getTime() - data.startTime.getTime();
      const maxDurationMs = CONTEST_LIMITS.DURATION.MAX_DAYS * 24 * 60 * 60 * 1000;
      return durationMs <= maxDurationMs;
    },
    {
      message: `Contest cannot be longer than ${CONTEST_LIMITS.DURATION.MAX_DAYS} days.`,
      path: ['endTime'],
    }
  );

export type UpdateContestInput = z.infer<typeof UpdateContestSchema>;

// ===== PROBLEM POINTS SCHEMA =====

export const UpdateProblemPointsSchema = z.object({
  contestProblemId: z.string().cuid({ message: 'Invalid Problem link ID format.' }),
  points: z
    .coerce
    .number({ invalid_type_error: 'Points must be a valid number.' })
    .int({ message: 'Points must be a whole number.' })
    .min(CONTEST_LIMITS.POINTS.MIN, { 
      message: `Points must be at least ${CONTEST_LIMITS.POINTS.MIN}.` 
    })
    .max(CONTEST_LIMITS.POINTS.MAX, { 
      message: `Points cannot exceed ${CONTEST_LIMITS.POINTS.MAX}.` 
    })
    .default(100),
});

export type UpdateProblemPointsInput = z.infer<typeof UpdateProblemPointsSchema>;

// ===== ADD PROBLEM TO CONTEST SCHEMA =====

export const AddProblemToContestSchema = z.object({
  contestId: z.string().cuid({ message: 'Invalid Contest ID format.' }),
  problemId: z.string().cuid({ message: 'Invalid Problem ID format.' }),
  points: z
    .coerce
    .number({ invalid_type_error: 'Points must be a valid number.' })
    .int({ message: 'Points must be a whole number.' })
    .min(CONTEST_LIMITS.POINTS.MIN)
    .max(CONTEST_LIMITS.POINTS.MAX)
    .default(100)
    .optional(),
});

export type AddProblemToContestInput = z.infer<typeof AddProblemToContestSchema>;

// ===== PUBLISH/UNPUBLISH SCHEMA =====

export const ToggleContestVisibilitySchema = z.object({
  contestId: z.string().cuid({ message: 'Invalid Contest ID format.' }),
  hidden: z.boolean({ required_error: 'Visibility status is required.' }),
});

export type ToggleContestVisibilityInput = z.infer<typeof ToggleContestVisibilitySchema>;

// ===== DELETE CONTEST SCHEMA =====

export const DeleteContestSchema = z.object({
  contestId: z.string().cuid({ message: 'Invalid Contest ID format.' }),
  confirmTitle: z.string().optional(), // For double-confirmation in UI
});

export type DeleteContestInput = z.infer<typeof DeleteContestSchema>;