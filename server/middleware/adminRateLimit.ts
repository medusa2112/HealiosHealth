import { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/env';

/**
 * Rate limiting for admin 2FA operations
 */

interface RateLimitStore {
  [key: string]: {
    attempts: number;
    windowStart: number;
    lastAttempt: number;
  };
}

// In-memory rate limit store (would use Redis in production)
export const rateLimitStore: RateLimitStore = {};
export const backupCodeStore: RateLimitStore = {};

// Rate limit configuration
export const TOTP_RATE_LIMIT = {
  maxAttempts: 5, // Max 5 attempts
  windowMs: 15 * 60 * 1000, // 15 minute window
  blockDurationMs: 30 * 60 * 1000, // 30 minute block after hitting limit
};

export const BACKUP_CODE_RATE_LIMIT = {
  maxAttempts: 3, // Max 3 attempts
  windowMs: 10 * 60 * 1000, // 10 minute window
  blockDurationMs: 60 * 60 * 1000, // 1 hour block after hitting limit
};

/**
 * Generate rate limit key based on admin email and IP
 */
export function getRateLimitKey(req: Request, prefix: string): string {
  const admin = (req as any).admin;
  const ip = req.ip || req.connection.remoteAddress;
  const adminEmail = admin?.email || 'unknown';
  return `${prefix}:${adminEmail}:${ip}`;
}

/**
 * Check if request should be rate limited
 */
export function isRateLimited(key: string, store: RateLimitStore, config: typeof TOTP_RATE_LIMIT): { 
  limited: boolean; 
  remaining: number; 
  resetTime: number;
  nextAttemptAllowed: number;
} {
  const now = Date.now();
  const entry = store[key];

  if (!entry) {
    // First attempt
    store[key] = {
      attempts: 0,
      windowStart: now,
      lastAttempt: now
    };
    return { 
      limited: false, 
      remaining: config.maxAttempts - 1, 
      resetTime: now + config.windowMs,
      nextAttemptAllowed: now
    };
  }

  // Check if we're still in a block period
  const timeSinceLastAttempt = now - entry.lastAttempt;
  if (entry.attempts >= config.maxAttempts) {
    const blockExpiry = entry.lastAttempt + config.blockDurationMs;
    if (now < blockExpiry) {
      return { 
        limited: true, 
        remaining: 0, 
        resetTime: blockExpiry,
        nextAttemptAllowed: blockExpiry
      };
    } else {
      // Block period expired, reset
      store[key] = {
        attempts: 0,
        windowStart: now,
        lastAttempt: now
      };
      return { 
        limited: false, 
        remaining: config.maxAttempts - 1, 
        resetTime: now + config.windowMs,
        nextAttemptAllowed: now
      };
    }
  }

  // Check if we need to reset the window
  const windowExpired = now - entry.windowStart > config.windowMs;
  if (windowExpired) {
    store[key] = {
      attempts: 0,
      windowStart: now,
      lastAttempt: now
    };
    return { 
      limited: false, 
      remaining: config.maxAttempts - 1, 
      resetTime: now + config.windowMs,
      nextAttemptAllowed: now
    };
  }

  // Within window, check if at limit
  const remaining = config.maxAttempts - entry.attempts;
  return { 
    limited: remaining <= 0, 
    remaining: Math.max(0, remaining - 1), 
    resetTime: entry.windowStart + config.windowMs,
    nextAttemptAllowed: now
  };
}

/**
 * Record a failed attempt
 */
function recordFailedAttempt(key: string, store: RateLimitStore): void {
  const now = Date.now();
  const entry = store[key];
  
  if (entry) {
    entry.attempts++;
    entry.lastAttempt = now;
  } else {
    store[key] = {
      attempts: 1,
      windowStart: now,
      lastAttempt: now
    };
  }
}

/**
 * Rate limiting middleware for TOTP verification attempts
 */
export function totpRateLimit(req: Request, res: Response, next: NextFunction): void {
  // Skip rate limiting if disabled in config
  if (ENV.DISABLE_RATE_LIMIT) {
    return next();
  }

  const key = getRateLimitKey(req, 'totp');
  const rateLimitResult = isRateLimited(key, rateLimitStore, TOTP_RATE_LIMIT);

  if (rateLimitResult.limited) {
    const retryAfter = Math.ceil((rateLimitResult.nextAttemptAllowed - Date.now()) / 1000);
    
    res.status(429).json({
      error: 'Too many TOTP verification attempts',
      code: 'TOTP_RATE_LIMITED',
      retryAfter,
      message: `Please try again in ${Math.ceil(retryAfter / 60)} minutes`
    });
    return;
  }

  // Add rate limit info to headers
  res.set({
    'X-RateLimit-Limit': TOTP_RATE_LIMIT.maxAttempts.toString(),
    'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetTime / 1000).toString()
  });

  // Store rate limit key for potential failure recording
  (req as any).totpRateLimitKey = key;
  
  next();
}

/**
 * Rate limiting middleware for backup code attempts
 */
export function backupCodeRateLimit(req: Request, res: Response, next: NextFunction): void {
  // Skip rate limiting if disabled in config
  if (ENV.DISABLE_RATE_LIMIT) {
    return next();
  }

  const key = getRateLimitKey(req, 'backup');
  const rateLimitResult = isRateLimited(key, backupCodeStore, BACKUP_CODE_RATE_LIMIT);

  if (rateLimitResult.limited) {
    const retryAfter = Math.ceil((rateLimitResult.nextAttemptAllowed - Date.now()) / 1000);
    
    res.status(429).json({
      error: 'Too many backup code attempts',
      code: 'BACKUP_CODE_RATE_LIMITED',
      retryAfter,
      message: `Please try again in ${Math.ceil(retryAfter / 60)} minutes`
    });
    return;
  }

  // Add rate limit info to headers
  res.set({
    'X-RateLimit-Limit': BACKUP_CODE_RATE_LIMIT.maxAttempts.toString(),
    'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetTime / 1000).toString()
  });

  // Store rate limit key for potential failure recording
  (req as any).backupCodeRateLimitKey = key;
  
  next();
}

/**
 * Record failed TOTP attempt for rate limiting
 */
export function recordFailedTotpAttempt(req: Request): void {
  const key = (req as any).totpRateLimitKey;
  if (key) {
    recordFailedAttempt(key, rateLimitStore);
  }
}

/**
 * Record failed backup code attempt for rate limiting
 */
export function recordFailedBackupCodeAttempt(req: Request): void {
  const key = (req as any).backupCodeRateLimitKey;
  if (key) {
    recordFailedAttempt(key, backupCodeStore);
  }
}

/**
 * Clear rate limit for admin (e.g., after successful authentication)
 */
export function clearAdminRateLimit(req: Request): void {
  const admin = (req as any).admin;
  const ip = req.ip || req.connection.remoteAddress;
  const adminEmail = admin?.email || 'unknown';
  
  const totpKey = `totp:${adminEmail}:${ip}`;
  const backupKey = `backup:${adminEmail}:${ip}`;
  
  delete rateLimitStore[totpKey];
  delete backupCodeStore[backupKey];
}

/**
 * Cleanup expired rate limit entries (call periodically)
 */
export function cleanupExpiredRateLimits(): void {
  const now = Date.now();
  
  // Clean TOTP rate limits
  Object.keys(rateLimitStore).forEach(key => {
    const entry = rateLimitStore[key];
    const entryAge = now - entry.windowStart;
    
    // Remove entries older than block duration + window
    if (entryAge > TOTP_RATE_LIMIT.blockDurationMs + TOTP_RATE_LIMIT.windowMs) {
      delete rateLimitStore[key];
    }
  });
  
  // Clean backup code rate limits
  Object.keys(backupCodeStore).forEach(key => {
    const entry = backupCodeStore[key];
    const entryAge = now - entry.windowStart;
    
    // Remove entries older than block duration + window
    if (entryAge > BACKUP_CODE_RATE_LIMIT.blockDurationMs + BACKUP_CODE_RATE_LIMIT.windowMs) {
      delete backupCodeStore[key];
    }
  });
}

// Setup periodic cleanup (every 10 minutes)
setInterval(cleanupExpiredRateLimits, 10 * 60 * 1000);