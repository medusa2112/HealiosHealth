import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Phase 2 Security: Enhanced rate limiting for critical endpoints
 * Prevents brute force attacks and abuse
 */

// Store for tracking failed login attempts per IP
const failedLoginAttempts = new Map<string, { count: number; resetTime: number }>();

// Use standard key generator to avoid IPv6 bypass issues
// The default key generator properly handles both IPv4 and IPv6 addresses

// Strict rate limiter for authentication endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  // Use default key generator to properly handle IPv6
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many authentication attempts',
      retryAfter: req.rateLimit?.resetTime,
      message: 'Your account has been temporarily locked due to multiple failed login attempts. Please try again later.'
    });
  }
});

// Moderate rate limiter for API endpoints
export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per minute
  message: 'Too many requests, please slow down',
  standardHeaders: true,
  legacyHeaders: false
  // Use default key generator
});

// Strict rate limiter for password reset
export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: 'Too many password reset attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  // Use default key generator
  skipSuccessfulRequests: true // Only count failed attempts
});

// Strict rate limiter for admin login
export const adminLoginRateLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 3, // Limit each IP to 3 admin login attempts per 30 minutes
  message: 'Too many admin login attempts, access temporarily blocked',
  standardHeaders: true,
  legacyHeaders: false,
  // Use default key generator
  handler: (req: Request, res: Response) => {
    // Log suspicious activity
    const ip = req.ip || 'unknown';
    console.error(`[SECURITY] Multiple failed admin login attempts from ${ip}`);
    
    res.status(429).json({
      error: 'Account locked',
      message: 'Too many failed admin login attempts. Your access has been temporarily blocked for security reasons.',
      retryAfter: req.rateLimit?.resetTime
    });
  }
});

// Rate limiter for file uploads
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 uploads per hour
  message: 'Too many file uploads, please try again later',
  standardHeaders: true,
  legacyHeaders: false
  // Use default key generator
});

// Rate limiter for payment endpoints
export const paymentRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // Limit each IP to 10 payment attempts per 10 minutes
  message: 'Too many payment attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  // Use default key generator
  skipSuccessfulRequests: true // Only count failed attempts
});

// Progressive delay for failed login attempts
export function progressiveDelay(req: Request, res: Response, next: Function) {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  
  const attempts = failedLoginAttempts.get(ip);
  if (attempts && attempts.resetTime > now) {
    // Calculate delay based on number of attempts
    const delay = Math.min(attempts.count * 2000, 30000); // Max 30 seconds
    
    if (attempts.count > 5) {
      // Block after 5 failed attempts
      return res.status(429).json({
        error: 'Account locked',
        message: `Too many failed login attempts. Please wait ${Math.ceil((attempts.resetTime - now) / 1000)} seconds before trying again.`,
        retryAfter: attempts.resetTime
      });
    }
    
    // Apply progressive delay
    setTimeout(() => next(), delay);
  } else {
    next();
  }
}

// Track failed login attempts
export function trackFailedLogin(req: Request) {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  
  const attempts = failedLoginAttempts.get(ip) || { count: 0, resetTime: now + (30 * 60 * 1000) };
  attempts.count++;
  attempts.resetTime = now + (30 * 60 * 1000); // Reset after 30 minutes
  
  failedLoginAttempts.set(ip, attempts);
}

// Clear failed login attempts on successful login
export function clearFailedLoginAttempts(req: Request) {
  const ip = req.ip || 'unknown';
  failedLoginAttempts.delete(ip);
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, attempts] of failedLoginAttempts.entries()) {
    if (attempts.resetTime < now) {
      failedLoginAttempts.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean every 5 minutes

// Export all rate limiters
export default {
  auth: authRateLimiter,
  api: apiRateLimiter,
  passwordReset: passwordResetRateLimiter,
  adminLogin: adminLoginRateLimiter,
  upload: uploadRateLimiter,
  payment: paymentRateLimiter,
  progressiveDelay,
  trackFailedLogin,
  clearFailedLoginAttempts
};