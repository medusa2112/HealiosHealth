import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Rate limiting configurations for different endpoint types
 */

// General API rate limit
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limit for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Count all requests (including failed attempts) toward the limit
});

// Very strict rate limit for password reset
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: 'Too many password reset requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin login rate limit (stricter)
export const adminAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Only 3 attempts per 15 minutes
  message: 'Too many admin login attempts. Access temporarily blocked.',
  standardHeaders: true,
  legacyHeaders: false,
  // Count all requests (including failed attempts) toward the limit
  handler: (req: Request, res: Response) => {
    // Log suspicious activity
    console.warn('[SECURITY] Admin login rate limit exceeded:', {
      ip: req.ip,
      email: req.body?.email,
      userAgent: req.get('user-agent'),
      timestamp: new Date().toISOString()
    });
    
    res.status(429).json({
      error: 'Too many admin login attempts',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: res.getHeader('Retry-After')
    });
  }
});

// Create account rate limit
export const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 registration attempts per hour
  message: 'Too many accounts created from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Checkout/payment rate limit
export const checkoutLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // Limit each IP to 10 checkout attempts per 10 minutes
  message: 'Too many checkout attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});