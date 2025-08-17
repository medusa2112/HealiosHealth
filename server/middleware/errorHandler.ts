import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

/**
 * Phase 3 Security: Global Error Handler
 * Provides secure error handling with production-safe responses
 */

interface ErrorDetails {
  name: string;
  message: string;
  stack?: string;
  statusCode?: number;
  code?: string;
  path?: string;
  timestamp: string;
  requestId?: string;
}

/**
 * Custom application error class
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Sanitizes error messages for production
 */
function sanitizeErrorMessage(error: Error, isDevelopment: boolean): string {
  if (isDevelopment) {
    return error.message;
  }

  // In production, return generic messages for security
  const sanitizedMessages: { [key: string]: string } = {
    'ENOTFOUND': 'Service temporarily unavailable',
    'ECONNREFUSED': 'Service temporarily unavailable',
    'ETIMEDOUT': 'Request timeout',
    'ValidationError': 'Invalid input provided',
    'CastError': 'Invalid data format',
    'MongoError': 'Database operation failed',
    'JsonWebTokenError': 'Authentication failed',
    'TokenExpiredError': 'Session expired',
    'SyntaxError': 'Invalid request format'
  };

  // Check for known error types
  for (const [errorType, message] of Object.entries(sanitizedMessages)) {
    if (error.name.includes(errorType) || error.message.includes(errorType)) {
      return message;
    }
  }

  // Default generic message for unknown errors
  return 'An unexpected error occurred';
}

/**
 * Determines if error should be logged
 */
function shouldLogError(error: Error, statusCode: number): boolean {
  // Always log server errors (5xx)
  if (statusCode >= 500) return true;
  
  // Log security-related errors
  if (error.message.includes('CSRF') || 
      error.message.includes('authentication') ||
      error.message.includes('unauthorized') ||
      error.message.includes('forbidden')) {
    return true;
  }
  
  // Don't log client errors (4xx) unless they're suspicious
  return false;
}

/**
 * Logs security-relevant errors
 */
function logSecurityError(error: Error, req: Request, statusCode: number) {
  const securityLog = {
    timestamp: new Date().toISOString(),
    level: 'security',
    error: {
      name: error.name,
      message: error.message,
      statusCode,
      code: (error as any).code
    },
    request: {
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      referer: req.get('Referer'),
      sessionId: req.sessionID
    }
  };

  console.error('[Security Error]', JSON.stringify(securityLog));
}

/**
 * Handles Zod validation errors
 */
function handleZodError(error: ZodError): { statusCode: number; message: string; details?: any } {
  const details = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
    input: (err as any).received || (err as any).input
  }));

  return {
    statusCode: 400,
    message: 'Validation failed',
    details
  };
}

/**
 * Handles database-related errors
 */
function handleDatabaseError(error: Error): { statusCode: number; message: string } {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Handle specific database errors
  if (error.message.includes('unique constraint') || error.message.includes('duplicate')) {
    return {
      statusCode: 409,
      message: 'Resource already exists'
    };
  }

  if (error.message.includes('not found') || error.message.includes('does not exist')) {
    return {
      statusCode: 404,
      message: 'Resource not found'
    };
  }

  if (error.message.includes('foreign key constraint')) {
    return {
      statusCode: 400,
      message: 'Invalid reference to related resource'
    };
  }

  // Generic database error
  return {
    statusCode: 500,
    message: isDevelopment ? error.message : 'Database operation failed'
  };
}

/**
 * Handles authentication and authorization errors
 */
function handleAuthError(error: Error): { statusCode: number; message: string } {
  if (error.message.includes('token') || error.message.includes('jwt')) {
    return {
      statusCode: 401,
      message: 'Authentication failed'
    };
  }

  if (error.message.includes('permission') || error.message.includes('forbidden')) {
    return {
      statusCode: 403,
      message: 'Access denied'
    };
  }

  return {
    statusCode: 401,
    message: 'Authentication required'
  };
}

/**
 * Main error handling middleware
 */
export function globalErrorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  let statusCode = 500;
  let message = 'Internal server error';
  let details: any = undefined;

  // Handle different error types
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = sanitizeErrorMessage(error, isDevelopment);
  } else if (error instanceof ZodError) {
    const zodResult = handleZodError(error);
    statusCode = zodResult.statusCode;
    message = zodResult.message;
    details = zodResult.details;
  } else if (error.name.includes('Database') || error.name.includes('Sequelize') || error.name.includes('Mongo')) {
    const dbResult = handleDatabaseError(error);
    statusCode = dbResult.statusCode;
    message = dbResult.message;
  } else if (error.name.includes('Auth') || error.message.includes('unauthorized')) {
    const authResult = handleAuthError(error);
    statusCode = authResult.statusCode;
    message = authResult.message;
  } else {
    // Generic error handling
    message = sanitizeErrorMessage(error, isDevelopment);
    
    // Extract status code from error if available
    if ((error as any).statusCode) {
      statusCode = (error as any).statusCode;
    } else if ((error as any).status) {
      statusCode = (error as any).status;
    }
  }

  // Log errors that should be logged
  if (shouldLogError(error, statusCode)) {
    const errorDetails: ErrorDetails = {
      name: error.name,
      message: error.message,
      stack: isDevelopment ? error.stack : undefined,
      statusCode,
      code: (error as any).code,
      path: req.path,
      timestamp: new Date().toISOString(),
      requestId: req.get('X-Request-ID')
    };

    console.error('[Error Handler]', errorDetails);
    
    // Log security-relevant errors separately
    if (statusCode === 401 || statusCode === 403 || statusCode >= 500) {
      logSecurityError(error, req, statusCode);
    }
  }

  // Prepare response
  const response: any = {
    error: true,
    message,
    statusCode,
    timestamp: new Date().toISOString()
  };

  // Add details for validation errors
  if (details) {
    response.details = details;
  }

  // Add stack trace in development
  if (isDevelopment && error.stack) {
    response.stack = error.stack;
    response.originalMessage = error.message;
  }

  // Add request ID if available
  if (req.get('X-Request-ID')) {
    response.requestId = req.get('X-Request-ID');
  }

  res.status(statusCode).json(response);
}

/**
 * Async error wrapper for route handlers
 */
export function asyncErrorHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response) {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404, 'ROUTE_NOT_FOUND');
  res.status(404).json({
    error: true,
    message: error.message,
    statusCode: 404,
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
}

/**
 * Uncaught exception handler
 */
export function setupUncaughtExceptionHandlers() {
  process.on('uncaughtException', (error: Error) => {
    console.error('[Uncaught Exception]', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    // Graceful shutdown
    process.exit(1);
  });

  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    console.error('[Unhandled Rejection]', {
      reason: reason?.message || reason,
      stack: reason?.stack,
      timestamp: new Date().toISOString()
    });
    
    // Graceful shutdown
    process.exit(1);
  });
}

// Export all error handling functions
export default {
  AppError,
  globalErrorHandler,
  asyncErrorHandler,
  notFoundHandler,
  setupUncaughtExceptionHandlers
};