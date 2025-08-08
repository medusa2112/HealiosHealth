import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

/**
 * Comprehensive request/response logging middleware
 * Tracks all HTTP requests and responses with detailed context
 */

interface RequestLogContext {
  method: string;
  url: string;
  ip?: string;
  userAgent?: string;
  userId?: string;
  sessionId?: string;
  bodySize?: number;
  bodyKeys?: string[];
  query?: any;
  params?: any;
  headers?: any;
}

interface ResponseLogContext extends RequestLogContext {
  statusCode: number;
  duration: number;
  responseSize?: number;
  error?: string;
}

// Middleware to log all incoming requests
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  // Attach request ID for tracking
  (req as any).requestId = requestId;
  
  // Log incoming request
  const requestContext: RequestLogContext = {
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    userId: (req as any).userId || (req.session as any)?.userId || (req.user as any)?.id,
    sessionId: req.sessionID,
    bodySize: req.body ? JSON.stringify(req.body).length : 0,
    bodyKeys: req.body ? Object.keys(req.body) : [],
    query: req.query,
    params: req.params
  };
  
  // Log request details
  logger.info('REQUEST', `${req.method} ${req.url}`, {
    requestId,
    ...requestContext
  });
  
  // Log request body for POST/PUT/PATCH (excluding sensitive data)
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    const sanitizedBody = sanitizeRequestBody(req.body);
    logger.debug('REQUEST_BODY', `${req.method} ${req.url}`, {
      requestId,
      body: sanitizedBody
    });
  }
  
  // Capture response
  const originalSend = res.send;
  res.send = function(data: any) {
    const duration = Date.now() - startTime;
    
    // Log response
    const responseContext: ResponseLogContext = {
      ...requestContext,
      statusCode: res.statusCode,
      duration,
      responseSize: data ? JSON.stringify(data).length : 0
    };
    
    // Determine log level based on status code
    if (res.statusCode >= 500) {
      logger.error('RESPONSE', `${req.method} ${req.url} - ${res.statusCode}`, {
        requestId,
        ...responseContext,
        error: data
      });
    } else if (res.statusCode >= 400) {
      logger.warn('RESPONSE', `${req.method} ${req.url} - ${res.statusCode}`, {
        requestId,
        ...responseContext,
        error: data
      });
    } else {
      logger.info('RESPONSE', `${req.method} ${req.url} - ${res.statusCode}`, {
        requestId,
        ...responseContext
      });
    }
    
    // Log slow requests
    if (duration > 1000) {
      logger.warn('SLOW_REQUEST', `${req.method} ${req.url} took ${duration}ms`, {
        requestId,
        duration,
        url: req.url,
        method: req.method
      });
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

// Sanitize request body to remove sensitive data
function sanitizeRequestBody(body: any): any {
  if (!body || typeof body !== 'object') return body;
  
  const sensitiveFields = [
    'password', 'passwordHash', 'hash',
    'access_token', 'refresh_token', 'token',
    'secret', 'key', 'privateKey', 'apiKey',
    'stripeSecretKey', 'webhookSecret',
    'creditCard', 'cvv', 'ssn'
  ];
  
  const sanitized = { ...body };
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  // Recursively sanitize nested objects
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeRequestBody(sanitized[key]);
    }
  }
  
  return sanitized;
}

// Error logging middleware
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const requestId = (req as any).requestId || 'unknown';
  
  logger.critical('REQUEST_ERROR', err.message, {
    requestId,
    url: req.url,
    method: req.method,
    userId: (req as any).userId || (req.session as any)?.userId,
    stack: err.stack,
    name: err.name
  });
  
  // Send error response
  if (!res.headersSent) {
    res.status(500).json({
      error: 'Internal server error',
      requestId,
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Product-specific logging middleware
export const productOperationLogger = (operation: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const requestId = (req as any).requestId || Math.random().toString(36).substring(7);
    const productId = req.params.id || req.body?.id;
    
    logger.productOperation(operation, productId, (req as any).userId, {
      requestId,
      url: req.url,
      method: req.method,
      body: sanitizeRequestBody(req.body)
    });
    
    next();
  };
};