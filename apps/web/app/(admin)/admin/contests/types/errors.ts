// /apps/web/app/(admin)/admin/contests/types/errors.ts

/**
 * ============================================================================
 * TYPED ERROR SYSTEM FOR ADMIN CONTEST WORKSPACE
 * ============================================================================
 * 
 * Replaces generic string errors with typed error objects for:
 * - Better error handling
 * - Type safety
 * - Easier debugging
 * - Consistent error responses
 * ============================================================================
 */

// ===== ERROR CODES =====

export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  INVALID_ID = 'INVALID_ID',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  
  // Database
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  DATABASE_ERROR = 'DATABASE_ERROR',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  
  // Business Logic
  CONTEST_NOT_FOUND = 'CONTEST_NOT_FOUND',
  PROBLEM_NOT_FOUND = 'PROBLEM_NOT_FOUND',
  DUPLICATE_PROBLEM = 'DUPLICATE_PROBLEM',
  CONTEST_HAS_SUBMISSIONS = 'CONTEST_HAS_SUBMISSIONS',
  INVALID_DATE_RANGE = 'INVALID_DATE_RANGE',
  CONTEST_IN_PAST = 'CONTEST_IN_PAST',
  
  // Unknown
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

// ===== ERROR SEVERITY =====

export enum ErrorSeverity {
  LOW = 'LOW',         // User error, no action needed
  MEDIUM = 'MEDIUM',   // Unexpected but handled
  HIGH = 'HIGH',       // Needs investigation
  CRITICAL = 'CRITICAL', // System failure
}

// ===== TYPED ERROR INTERFACE =====

export interface AppError {
  code: ErrorCode;
  message: string;
  severity: ErrorSeverity;
  field?: string;          // Field that caused the error
  details?: unknown;       // Additional context
  timestamp?: string;      // When the error occurred
  requestId?: string;      // For tracking
}

// ===== ERROR FACTORY FUNCTIONS =====

export function createError(
  code: ErrorCode,
  message: string,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  field?: string,
  details?: unknown
): AppError {
  return {
    code,
    message,
    severity,
    field,
    details,
    timestamp: new Date().toISOString(),
  };
}

// Authentication Errors
export const AuthErrors = {
  unauthorized: () => createError(
    ErrorCode.UNAUTHORIZED,
    'You must be logged in to perform this action.',
    ErrorSeverity.LOW
  ),
  
  permissionDenied: () => createError(
    ErrorCode.PERMISSION_DENIED,
    'You do not have permission to perform this action.',
    ErrorSeverity.MEDIUM
  ),
  
  sessionExpired: () => createError(
    ErrorCode.SESSION_EXPIRED,
    'Your session has expired. Please log in again.',
    ErrorSeverity.LOW
  ),
};

// Validation Errors
export const ValidationErrors = {
  invalidInput: (field?: string, details?: string) => createError(
    ErrorCode.INVALID_INPUT,
    details || 'Invalid input provided.',
    ErrorSeverity.LOW,
    field
  ),
  
  invalidId: (field?: string) => createError(
    ErrorCode.INVALID_ID,
    'Invalid ID format.',
    ErrorSeverity.LOW,
    field
  ),
};

// Rate Limiting Errors
export const RateLimitErrors = {
  exceeded: (action?: string) => createError(
    ErrorCode.RATE_LIMIT_EXCEEDED,
    `Too many ${action || 'requests'}. Please wait a moment and try again.`,
    ErrorSeverity.MEDIUM
  ),
};

// Database Errors
export const DatabaseErrors = {
  notFound: (resource: string) => createError(
    ErrorCode.NOT_FOUND,
    `${resource} not found.`,
    ErrorSeverity.LOW
  ),
  
  alreadyExists: (resource: string) => createError(
    ErrorCode.ALREADY_EXISTS,
    `${resource} already exists.`,
    ErrorSeverity.LOW
  ),
  
  databaseError: (details?: string) => createError(
    ErrorCode.DATABASE_ERROR,
    'A database error occurred. Please try again.',
    ErrorSeverity.HIGH,
    undefined,
    details
  ),
  
  transactionFailed: (details?: string) => createError(
    ErrorCode.TRANSACTION_FAILED,
    'Operation failed. No changes were made.',
    ErrorSeverity.HIGH,
    undefined,
    details
  ),
};

// Contest-Specific Errors
export const ContestErrors = {
  notFound: () => createError(
    ErrorCode.CONTEST_NOT_FOUND,
    'Contest not found.',
    ErrorSeverity.LOW
  ),
  
  hasSubmissions: (count: number) => createError(
    ErrorCode.CONTEST_HAS_SUBMISSIONS,
    `Cannot delete contest with ${count} submissions. Please archive it instead.`,
    ErrorSeverity.MEDIUM,
    undefined,
    { submissionCount: count }
  ),
  
  invalidDateRange: () => createError(
    ErrorCode.INVALID_DATE_RANGE,
    'End time must be after start time.',
    ErrorSeverity.LOW,
    'endTime'
  ),
  
  inPast: () => createError(
    ErrorCode.CONTEST_IN_PAST,
    'Contest must start in the future.',
    ErrorSeverity.LOW,
    'startTime'
  ),
};

// Problem-Specific Errors
export const ProblemErrors = {
  notFound: () => createError(
    ErrorCode.PROBLEM_NOT_FOUND,
    'Problem not found.',
    ErrorSeverity.LOW
  ),
  
  duplicateInContest: () => createError(
    ErrorCode.DUPLICATE_PROBLEM,
    'This problem is already in the contest.',
    ErrorSeverity.LOW
  ),
};

// Generic Errors
export const GenericErrors = {
  unknown: (details?: unknown) => createError(
    ErrorCode.UNKNOWN_ERROR,
    'An unexpected error occurred. Please try again.',
    ErrorSeverity.HIGH,
    undefined,
    details
  ),
  
  internal: (details?: unknown) => createError(
    ErrorCode.INTERNAL_ERROR,
    'An internal error occurred. Our team has been notified.',
    ErrorSeverity.CRITICAL,
    undefined,
    details
  ),
};

// ===== ERROR RESULT TYPE =====

export type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: AppError };

// ===== HELPER FUNCTIONS =====

/**
 * Create a success result
 */
export function success<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

/**
 * Create an error result
 */
export function failure(error: AppError): ActionResult<never> {
  return { success: false, error };
}

/**
 * Convert AppError to legacy string error format
 * For backwards compatibility with existing components
 */
export function errorToString(error: AppError): string {
  return error.message;
}

/**
 * Convert AppError to field errors format
 * For form validation compatibility
 */
export function errorToFieldErrors(error: AppError): Record<string, string[]> {
  if (error.field) {
    return { [error.field]: [error.message] };
  }
  return {};
}

/**
 * Check if an error should be logged
 */
export function shouldLogError(error: AppError): boolean {
  return error.severity === ErrorSeverity.HIGH || error.severity === ErrorSeverity.CRITICAL;
}

/**
 * Get user-friendly error message
 * Hides sensitive details in production
 */
export function getUserMessage(error: AppError): string {
  // In production, hide sensitive error details
  if (error.severity === ErrorSeverity.CRITICAL) {
    return 'A system error occurred. Our team has been notified.';
  }
  return error.message;
}
