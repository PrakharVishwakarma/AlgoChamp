// /apps/web/app/(admin)/admin/contests/utils/error-logger.ts

/**
 * ============================================================================
 * COMPREHENSIVE ERROR LOGGING UTILITY
 * ============================================================================
 * 
 * Structured error logging for production-ready error tracking and debugging
 * 
 * Features:
 * - Structured log format
 * - Error categorization
 * - Severity levels
 * - Performance tracking
 * - User context
 * - Stack trace sanitization
 * ============================================================================
 */

import { ErrorSeverity, type AppError } from '../types/errors';

// ===== LOG LEVELS =====

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}

// ===== LOG ENTRY INTERFACE =====

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  context?: Record<string, unknown>;
  performance?: {
    duration?: number;
    memory?: number;
  };
  tags?: string[];
}

// ===== ERROR LOGGER CLASS =====

export class ErrorLogger {
  private static instance: ErrorLogger;
  private logs: LogEntry[] = [];
  private maxLogsInMemory = 1000;

  private constructor() {
    // Cleanup old logs every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * Log an error with full context
   */
  logError(
    error: Error | AppError,
    context?: Record<string, unknown>,
    userId?: string
  ): void {
    const isError = error instanceof Error;
    
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      category: 'application',
      message: error.message,
      userId,
      error: {
        name: isError ? error.name : 'AppError',
        message: error.message,
        stack: isError ? this.sanitizeStack(error.stack) : undefined,
      },
      context,
    };

    // Add AppError specific fields
    if ('code' in error && error.code) {
      entry.error!.code = error.code;
      entry.category = this.categorizeError(error);
      
      // Determine log level from severity
      if ('severity' in error) {
        entry.level = this.severityToLogLevel(error.severity);
      }
    }

    this.write(entry);
  }

  /**
   * Log a warning
   */
  logWarning(
    message: string,
    context?: Record<string, unknown>,
    userId?: string
  ): void {
    this.write({
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      category: 'application',
      message,
      userId,
      context,
    });
  }

  /**
   * Log an info message
   */
  logInfo(
    message: string,
    context?: Record<string, unknown>,
    userId?: string
  ): void {
    this.write({
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      category: 'application',
      message,
      userId,
      context,
    });
  }

  /**
   * Log a debug message (development only)
   */
  logDebug(
    message: string,
    context?: Record<string, unknown>
  ): void {
    // Only log in development (client-side check)
    if (typeof window === 'undefined') {
      this.write({
        timestamp: new Date().toISOString(),
        level: LogLevel.DEBUG,
        category: 'debug',
        message,
        context,
      });
    }
  }

  /**
   * Log performance metrics
   */
  logPerformance(
    operation: string,
    duration: number,
    context?: Record<string, unknown>
  ): void {
    // Only log if duration is significant (> 1 second)
    if (duration > 1000) {
      this.write({
        timestamp: new Date().toISOString(),
        level: LogLevel.WARN,
        category: 'performance',
        message: `Slow operation: ${operation}`,
        performance: { duration },
        context,
        tags: ['performance', 'slow-operation'],
      });
    }
  }

  /**
   * Get recent logs (for debugging)
   */
  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logs.slice(-count);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  // ===== PRIVATE METHODS =====

  private write(entry: LogEntry): void {
    // Write to console with appropriate method
    this.writeToConsole(entry);

    // Store in memory for debugging
    this.logs.push(entry);
    if (this.logs.length > this.maxLogsInMemory) {
      this.logs.shift();
    }

    // TODO: In production, send to external logging service
    // this.sendToExternalService(entry);
  }

  private writeToConsole(entry: LogEntry): void {
    const prefix = `[${entry.level}][${entry.category}]`;
    const message = `${prefix} ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, entry);
        break;
      case LogLevel.INFO:
        console.info(message, entry);
        break;
      case LogLevel.WARN:
        console.warn(message, entry);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(message, entry);
        break;
      default:
        console.log(message, entry);
    }
  }

  private sanitizeStack(stack?: string): string | undefined {
    if (!stack) return undefined;

    // Remove sensitive paths and normalize
    return stack
      .split('\n')
      .map(line => {
        // Remove full file system paths
        return line.replace(/(?:file:\/\/)?[A-Z]:\\[^\s]+/gi, '<path>');
      })
      .join('\n');
  }

  private categorizeError(error: AppError): string {
    const code = error.code;
    
    if (code.includes('AUTH') || code.includes('PERMISSION')) {
      return 'authentication';
    }
    if (code.includes('VALIDATION') || code.includes('INVALID')) {
      return 'validation';
    }
    if (code.includes('DATABASE') || code.includes('NOT_FOUND')) {
      return 'database';
    }
    if (code.includes('RATE_LIMIT')) {
      return 'rate-limiting';
    }
    
    return 'application';
  }

  private severityToLogLevel(severity: ErrorSeverity): LogLevel {
    switch (severity) {
      case ErrorSeverity.LOW:
        return LogLevel.INFO;
      case ErrorSeverity.MEDIUM:
        return LogLevel.WARN;
      case ErrorSeverity.HIGH:
        return LogLevel.ERROR;
      case ErrorSeverity.CRITICAL:
        return LogLevel.FATAL;
      default:
        return LogLevel.ERROR;
    }
  }

  private cleanup(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    this.logs = this.logs.filter(log => {
      const logTime = new Date(log.timestamp).getTime();
      return logTime > oneHourAgo;
    });
  }
}

// ===== SINGLETON INSTANCE =====

export const logger = ErrorLogger.getInstance();

// ===== CONVENIENCE FUNCTIONS =====

/**
 * Log an error
 */
export function logError(
  error: Error | AppError,
  context?: Record<string, unknown>,
  userId?: string
): void {
  logger.logError(error, context, userId);
}

/**
 * Log a warning
 */
export function logWarning(
  message: string,
  context?: Record<string, unknown>,
  userId?: string
): void {
  logger.logWarning(message, context, userId);
}

/**
 * Log info
 */
export function logInfo(
  message: string,
  context?: Record<string, unknown>,
  userId?: string
): void {
  logger.logInfo(message, context, userId);
}

/**
 * Log debug (development only)
 */
export function logDebug(
  message: string,
  context?: Record<string, unknown>
): void {
  logger.logDebug(message, context);
}

/**
 * Log performance metrics
 */
export function logPerformance(
  operation: string,
  duration: number,
  context?: Record<string, unknown>
): void {
  logger.logPerformance(operation, duration, context);
}

/**
 * Wrap async function with performance logging
 */
export function withPerformanceLog<T extends (...args: never[]) => Promise<unknown>>(
  fn: T,
  operationName: string
): T {
  return (async (...args: Parameters<T>) => {
    const start = Date.now();
    try {
      const result = await fn(...args);
      const duration = Date.now() - start;
      logPerformance(operationName, duration);
      return result as ReturnType<T>;
    } catch (error) {
      const duration = Date.now() - start;
      logError(
        error instanceof Error ? error : new Error('Unknown error'),
        { operationName, duration }
      );
      throw error;
    }
  }) as T;
}

/**
 * Create a performance timer
 */
export function createTimer(operationName: string) {
  const start = Date.now();
  
  return {
    end: () => {
      const duration = Date.now() - start;
      logPerformance(operationName, duration);
      return duration;
    },
  };
}
