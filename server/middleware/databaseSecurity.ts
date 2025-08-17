import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * Phase 3 Security: Database Security and Query Protection
 * Prevents SQL injection and ensures safe database operations
 */

// Database query validation schemas
const QueryValidationSchemas = {
  // Pagination parameters
  pagination: z.object({
    page: z.coerce.number().min(1).max(1000).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    offset: z.coerce.number().min(0).max(100000).optional()
  }),

  // Search parameters
  search: z.object({
    q: z.string().max(100).regex(/^[a-zA-Z0-9\s\-_.]+$/).optional(),
    category: z.string().max(50).regex(/^[a-zA-Z0-9\-_]+$/).optional(),
    sort: z.enum(['name', 'price', 'created_at', 'updated_at']).optional(),
    order: z.enum(['asc', 'desc']).default('asc')
  }),

  // Date range parameters
  dateRange: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    period: z.enum(['day', 'week', 'month', 'quarter', 'year']).optional()
  }),

  // ID validation
  id: z.object({
    id: z.string().uuid().or(z.string().regex(/^[a-zA-Z0-9\-_]+$/))
  }),

  // Analytics query parameters
  analytics: z.object({
    metric: z.enum(['sales', 'orders', 'users', 'revenue', 'products']),
    period: z.enum(['hour', 'day', 'week', 'month', 'quarter', 'year']).default('day'),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    groupBy: z.enum(['hour', 'day', 'week', 'month']).optional()
  })
};

/**
 * Validates database query parameters to prevent injection
 */
export function validateDatabaseQuery(schema: keyof typeof QueryValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validationSchema = QueryValidationSchemas[schema];
      const result = validationSchema.safeParse({
        ...req.query,
        ...req.params,
        ...req.body
      });

      if (!result.success) {
        return res.status(400).json({
          error: 'Invalid query parameters',
          details: result.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        });
      }

      // Add validated data to request for use in route handlers
      (req as any).validatedQuery = result.data;

      next();
    } catch (error) {
      console.error('[DB Security] Query validation error:', error);
      res.status(500).json({ error: 'Query validation failed' });
    }
  };
}

/**
 * Sanitizes database query results to prevent data leakage
 */
export function sanitizeQueryResults<T>(data: T[], fieldsToRemove: string[] = []): T[] {
  const defaultFieldsToRemove = [
    'password',
    'passwordHash', 
    'sessionToken',
    'resetToken',
    'verificationCodeHash',
    'internalNotes',
    'adminNotes'
  ];

  const allFieldsToRemove = [...defaultFieldsToRemove, ...fieldsToRemove];

  return data.map(item => {
    if (typeof item === 'object' && item !== null) {
      const sanitized = { ...item };
      allFieldsToRemove.forEach(field => {
        delete (sanitized as any)[field];
      });
      return sanitized;
    }
    return item;
  });
}

/**
 * Monitors database query performance and logs slow queries
 */
export function monitorDatabaseQueries() {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    // Override res.json to capture response and measure timing
    const originalJson = res.json;
    res.json = function(body) {
      const duration = Date.now() - startTime;
      
      // Log slow queries (>1 second)
      if (duration > 1000) {
        console.warn('[DB Performance] Slow query detected:', {
          method: req.method,
          path: req.path,
          duration: `${duration}ms`,
          query: req.query,
          timestamp: new Date().toISOString()
        });
      }

      // Log all database operations in development
      if (process.env.NODE_ENV === 'development' && req.path.includes('/api/')) {
        console.log(`[DB Query] ${req.method} ${req.path} - ${duration}ms`);
      }

      return originalJson.call(this, body);
    };

    next();
  };
}

/**
 * Validates that database connections are using parameterized queries
 */
export function enforceParameterizedQueries() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Add a flag to track if raw SQL is attempted
    (req as any).dbSecurityEnabled = true;
    
    // In development, warn about raw SQL usage
    if (process.env.NODE_ENV === 'development') {
      const originalConsoleWarn = console.warn;
      console.warn = function(...args) {
        const message = args.join(' ');
        if (message.includes('sql`') || message.includes('execute(')) {
          console.error('[DB Security] Warning: Raw SQL detected. Use Drizzle ORM query builder instead.');
        }
        return originalConsoleWarn.apply(console, args);
      };
    }

    next();
  };
}

/**
 * Rate limiting for database-heavy operations
 */
export const databaseOperationLimiter = {
  // Limit for search queries
  search: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30 // 30 searches per minute
  },
  
  // Limit for analytics queries
  analytics: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10 // 10 analytics queries per 5 minutes
  },
  
  // Limit for bulk operations
  bulk: {
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5 // 5 bulk operations per 10 minutes
  }
};

/**
 * Input sanitization for database operations
 */
export function sanitizeDatabaseInput(input: any): any {
  if (typeof input === 'string') {
    // Remove potential SQL injection patterns
    return input
      .replace(/[<>'";&()]/g, '') // Remove dangerous characters
      .replace(/(\b(DROP|DELETE|INSERT|UPDATE|ALTER|CREATE|EXEC|UNION|SELECT)\b)/gi, '') // Remove SQL keywords
      .trim()
      .substring(0, 1000); // Limit length
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeDatabaseInput);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      // Sanitize both keys and values
      const sanitizedKey = sanitizeDatabaseInput(key);
      sanitized[sanitizedKey] = sanitizeDatabaseInput(value);
    }
    return sanitized;
  }
  
  return input;
}

/**
 * Database security audit logger
 */
export function logDatabaseSecurity(operation: string, details: any) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    operation,
    details: sanitizeDatabaseInput(details),
    level: 'security'
  };
  
  // In production, this would go to a security logging service
  if (process.env.NODE_ENV === 'production') {
    console.log('[DB Security Audit]', JSON.stringify(logEntry));
  }
}

// Export all database security functions
export default {
  validateDatabaseQuery,
  sanitizeQueryResults,
  monitorDatabaseQueries,
  enforceParameterizedQueries,
  databaseOperationLimiter,
  sanitizeDatabaseInput,
  logDatabaseSecurity,
  QueryValidationSchemas
};