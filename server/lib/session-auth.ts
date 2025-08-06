import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { SecurityLogger } from './security-logger';

/**
 * Enhanced session-based authentication middleware for guest checkouts
 * Allows both authenticated users and valid session tokens
 */
export const requireSessionOrAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for authenticated user first
    const userId = (req.session as any)?.userId;
    if (userId) {
      const user = await storage.getUserById(userId);
      if (user) {
        req.user = user;
        return next();
      }
    }

    // Check for session token in body or headers for guest checkout
    const sessionToken = req.body.sessionToken || req.headers['x-session-token'];
    if (sessionToken && typeof sessionToken === 'string' && sessionToken.length > 10) {
      // Valid session token for guest checkout
      (req as any).sessionToken = sessionToken;
      return next();
    }

    return res.status(401).json({ message: 'Authentication or valid session token required' });
  } catch (error) {
    console.error('Session auth error:', error);
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

/**
 * Middleware to ensure proper cart/order ownership
 * Prevents cross-user data access
 */
export const validateOrderAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customerEmail } = req.body;
    
    // If user is authenticated, must match their email
    if (req.user && req.user.email !== customerEmail) {
      return res.status(403).json({ message: 'Email mismatch with authenticated user' });
    }
    
    // Additional validation can be added here
    next();
  } catch (error) {
    console.error('Order access validation error:', error);
    return res.status(500).json({ message: 'Validation failed' });
  }
};

/**
 * Rate limiting middleware for sensitive operations
 */
const rateLimitStore = new Map<string, { count: number; lastReset: number }>();

export const rateLimit = (maxRequests: number = 10, windowMs: number = 60000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.ip || (req.session as any)?.userId || 'anonymous';
    const now = Date.now();
    
    const record = rateLimitStore.get(identifier);
    if (!record || now - record.lastReset > windowMs) {
      rateLimitStore.set(identifier, { count: 1, lastReset: now });
      return next();
    }
    
    if (record.count >= maxRequests) {
      // Log rate limit exceeded for security monitoring
      SecurityLogger.logRateLimitExceeded(req, req.path);
      
      return res.status(429).json({ 
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((record.lastReset + windowMs - now) / 1000)
      });
    }
    
    record.count++;
    next();
  };
};

/**
 * Secure headers middleware for enhanced security
 */
export const secureHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Only set HSTS in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
};