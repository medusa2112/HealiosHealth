import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { storage } from '../storage';
import { SecurityLogger } from './security-logger';
import type { User } from '@shared/schema';

// Extend Express Request to include user and session
declare global {
  namespace Express {
    interface Request {
      user?: User & {
        claims?: any;
        userId?: string;
        access_token?: string;
        refresh_token?: string;
        expires_at?: number;
      };
    }
    interface Session {
      userId?: string;
      [key: string]: any;
    }
    interface User {
      id: string;
      email: string;
      role: string;
      firstName?: string | null;
      lastName?: string | null;
      claims?: any;
      userId?: string;
      access_token?: string;
      refresh_token?: string;
      expires_at?: number;
    }
  }
}

/**
 * UNIFIED AUTHENTICATION MIDDLEWARE
 * Consolidates all auth functionality into one clean file
 */

/**
 * Sanitize user object by removing sensitive fields before sending to client
 * @param user User object that may contain sensitive data
 * @returns Safe user object without sensitive fields
 */
export function sanitizeUser(user: any): any {
  if (!user) return null;
  
  // Create clean user object with only safe fields
  const safeUser: any = {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName
  };
  
  // Remove sensitive fields if they exist
  const sensitiveFields = [
    'password', 'passwordHash', 'hash',
    'access_token', 'refresh_token', 'token',
    'secret', 'key', 'privateKey',
    'claims', 'expires_at', 'sessionId',
    'internalId', 'stripeCustomerId'
  ];
  
  // Explicitly exclude sensitive fields
  sensitiveFields.forEach(field => {
    delete safeUser[field];
  });
  
  return safeUser;
}

/**
 * Sanitize any object by removing sensitive fields
 * @param obj Object that may contain sensitive data
 * @returns Safe object without sensitive fields
 */
export function sanitizeObject(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sensitiveFields = [
    'password', 'passwordHash', 'hash',
    'access_token', 'refresh_token', 'token',
    'secret', 'key', 'privateKey',
    'sessionSecret', 'apiKey',
    'stripeSecretKey', 'webhookSecret'
  ];
  
  const sanitized = { ...obj };
  
  sensitiveFields.forEach(field => {
    if (sanitized.hasOwnProperty(field)) {
      delete sanitized[field];
    }
  });
  
  return sanitized;
}

export const protectRoute = (roles: ('admin' | 'customer' | 'guest')[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get user from session or passport user (OAuth)
      const userId = (req.session as any)?.userId || (req.user as any)?.claims?.sub || (req.user as any)?.userId || (req.user as any)?.id;
      
      console.log(`[PROTECT_ROUTE] Checking access for roles [${roles.join(', ')}], userId: ${userId}`);
      console.log(`[PROTECT_ROUTE] Session userId: ${(req.session as any)?.userId}, Passport user: ${(req.user as any)?.claims?.sub || (req.user as any)?.userId}`);
      console.log(`[PROTECT_ROUTE] Request user object:`, req.user ? { id: (req.user as any).id, email: req.user.email, role: req.user.role } : 'null');
      
      if (!userId) {
        console.log('[PROTECT_ROUTE] No userId in session or passport user');
        return res.status(401).json({ message: 'Authentication required' });
      }

      const user = await storage.getUserById(userId);
      
      if (!user) {
        console.log(`[PROTECT_ROUTE] User not found for userId: ${userId}`);
        return res.status(401).json({ message: 'User not found' });
      }
      
      console.log(`[PROTECT_ROUTE] Found user: ${user.email}, role: ${user.role}`);
      
      if (!roles.includes(user.role as 'admin' | 'customer' | 'guest')) {
        console.log(`[PROTECT_ROUTE] Access denied - User role '${user.role}' not in allowed roles [${roles.join(', ')}]`);
        return res.status(403).json({ message: 'Access denied' });
      }
      
      console.log(`[PROTECT_ROUTE] Access granted for ${user.email} (${user.role})`);
      req.user = { ...user, claims: (req.user as any)?.claims };
      next();
    } catch (err) {
      console.error('Auth error:', err);
      return res.status(401).json({ message: 'Authentication failed' });
    }
  };
};

// Simple auth check - just verifies user exists
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.session as any)?.userId || (req.user as any)?.claims?.sub || (req.user as any)?.userId || (req.user as any)?.id;
    
    console.log(`[REQUIRE_AUTH] Checking auth for userId: ${userId}`);
    console.log(`[REQUIRE_AUTH] Session:`, (req.session as any)?.userId ? 'present' : 'missing');
    console.log(`[REQUIRE_AUTH] Passport user:`, req.user ? 'present' : 'missing');
    
    if (!userId) {
      console.log('[REQUIRE_AUTH] No userId found');
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await storage.getUserById(userId);
    
    if (!user) {
      console.log(`[REQUIRE_AUTH] User not found for userId: ${userId}`);
      return res.status(401).json({ message: 'Invalid session' });
    }
    
    console.log(`[REQUIRE_AUTH] Auth successful for ${user.email}`);
    req.user = { ...user, claims: (req.user as any)?.claims };
    next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

// Enhanced auth for guest checkout support
export const requireSessionOrAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for authenticated user first
    const userId = (req.session as any)?.userId || (req.user as any)?.claims?.sub || (req.user as any)?.userId || (req.user as any)?.id;
    if (userId) {
      const user = await storage.getUserById(userId);
      if (user) {
        req.user = user;
        return next();
      }
    }

    // Check for session token for guest checkout
    const sessionToken = req.body.sessionToken || req.headers['x-session-token'];
    if (sessionToken && typeof sessionToken === 'string' && sessionToken.length > 10) {
      (req as any).sessionToken = sessionToken;
      return next();
    }

    return res.status(401).json({ message: 'Authentication or valid session token required' });
  } catch (error) {
    console.error('Session auth error:', error);
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

// Validation middleware for customer email
export const validateCustomerEmail = [
  body('customerEmail')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail()
    .trim()
    .escape(),
];

// Order access validation
export const validateOrderAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for validation errors first
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }
    
    // Use validated data directly instead of destructuring
    const customerEmail = req.body.customerEmail;
    
    // If user is authenticated, must match their email
    if (req.user && req.user.email !== customerEmail) {
      return res.status(403).json({ message: 'Email mismatch with authenticated user' });
    }
    
    next();
  } catch (error) {
    console.error('Order access validation error:', error);
    return res.status(500).json({ message: 'Validation failed' });
  }
};

// Rate limiting store
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

// Security headers
export const secureHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
};

export const checkRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

// Helper function to get admin emails from env
export const getAdminEmails = (): string[] => {
  const adminEmailsEnv = process.env.ALLOWED_ADMIN_EMAILS || '';
  return adminEmailsEnv.split(',').map(email => email.trim()).filter(email => email.length > 0);
};

// Helper function to determine role based on email
export const determineUserRole = (email: string): 'admin' | 'customer' => {
  // Only dn@thefourths.com is admin
  const isAdminEmail = email === 'dn@thefourths.com';
  
  return isAdminEmail ? 'admin' : 'customer';
};