import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

/**
 * Phase 2 Security: Centralized input validation middleware
 * Ensures all request data is validated before processing
 */

// Generic validation middleware factory
export function validateRequest(schema: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate body if schema provided
      if (schema.body && req.body) {
        const result = schema.body.safeParse(req.body);
        if (!result.success) {
          return res.status(400).json({
            error: 'Invalid request body',
            details: result.error.errors
          });
        }
        req.body = result.data;
      }

      // Validate query if schema provided
      if (schema.query && req.query) {
        const result = schema.query.safeParse(req.query);
        if (!result.success) {
          return res.status(400).json({
            error: 'Invalid query parameters',
            details: result.error.errors
          });
        }
        req.query = result.data;
      }

      // Validate params if schema provided
      if (schema.params && req.params) {
        const result = schema.params.safeParse(req.params);
        if (!result.success) {
          return res.status(400).json({
            error: 'Invalid URL parameters',
            details: result.error.errors
          });
        }
        req.params = result.data;
      }

      next();
    } catch (error) {
      res.status(500).json({
        error: 'Validation error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}

// Common validation schemas for reuse
export const commonSchemas = {
  // ID validation
  id: z.string().min(1).max(255),
  
  // Email validation
  email: z.string().email().toLowerCase(),
  
  // Pagination
  pagination: z.object({
    page: z.string().optional().transform(val => {
      const num = parseInt(val || '1');
      return isNaN(num) || num < 1 ? 1 : num;
    }),
    limit: z.string().optional().transform(val => {
      const num = parseInt(val || '20');
      return isNaN(num) || num < 1 ? 20 : Math.min(num, 100);
    })
  }),
  
  // Date range
  dateRange: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional()
  }),
  
  // Search query
  searchQuery: z.string().min(1).max(100),
  
  // Sort parameters
  sort: z.object({
    field: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional().default('desc')
  }),
  
  // Money amount (in cents)
  amount: z.number().int().positive(),
  
  // Currency code - ZAR only
  currency: z.literal('ZAR').default('ZAR'),
  
  // Phone number
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  
  // Strong password
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  
  // UUID
  uuid: z.string().uuid(),
  
  // URL
  url: z.string().url(),
  
  // Boolean from string
  booleanString: z.enum(['true', 'false']).transform(val => val === 'true')
};

// Sanitize input to prevent XSS
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Remove script tags and dangerous HTML
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (input && typeof input === 'object') {
    const sanitized: any = {};
    for (const key in input) {
      if (input.hasOwnProperty(key)) {
        sanitized[key] = sanitizeInput(input[key]);
      }
    }
    return sanitized;
  }
  
  return input;
}

// Middleware to sanitize all inputs
export function sanitizeMiddleware(req: Request, res: Response, next: NextFunction) {
  req.body = sanitizeInput(req.body);
  req.query = sanitizeInput(req.query);
  req.params = sanitizeInput(req.params);
  next();
}

// Validate content type
export function validateContentType(expectedType: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.get('content-type');
    if (!contentType || !contentType.includes(expectedType)) {
      return res.status(415).json({
        error: 'Unsupported Media Type',
        expected: expectedType,
        received: contentType
      });
    }
    next();
  };
}

// Validate request size
export function validateRequestSize(maxSizeBytes: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.get('content-length') || '0');
    if (contentLength > maxSizeBytes) {
      return res.status(413).json({
        error: 'Request Entity Too Large',
        maxSize: maxSizeBytes,
        received: contentLength
      });
    }
    next();
  };
}