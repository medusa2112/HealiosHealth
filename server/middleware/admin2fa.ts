import { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/env';
import { storage } from '../storage';
import { verifyTotpCodeWithReplay } from '../lib/totp';
import { recordFailedTotpAttempt, clearAdminRateLimit, isRateLimited, TOTP_RATE_LIMIT, rateLimitStore, getRateLimitKey } from './adminRateLimit';

/**
 * Admin 2FA Middleware - Enforces TOTP authentication on admin routes
 * Only applies when ADMIN_2FA_ENABLED is true in production
 */

interface AuthenticatedRequest extends Request {
  admin?: {
    id: number;
    email: string;
    totpEnabled: boolean;
    active: boolean;
  };
}

/**
 * Optional 2FA enforcement middleware - only enforces TOTP when 2FA is enabled
 * IMPORTANT: This should always be used AFTER requireAdminAuth
 */
export async function optionalRequire2FA(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // Skip 2FA if disabled in configuration
    if (!ENV.ADMIN_2FA_ENABLED) {
      return next();
    }

    const admin = req.admin;
    if (!admin) {
      return res.status(500).json({ 
        error: 'Admin authentication required before 2FA check',
        code: 'INTERNAL_ERROR' 
      });
    }

    // If 2FA is not enabled, allow access (truly optional 2FA)
    if (!admin.totpEnabled) {
      return next();
    }

    // Check for TOTP code in request headers
    const totpCode = req.headers['x-totp-code'] as string;
    if (!totpCode) {
      return res.status(401).json({ 
        error: '2FA code required',
        code: 'TOTP_CODE_REQUIRED' 
      });
    }

    // Validate TOTP code format before verification
    if (!/^\d{6}$/.test(totpCode)) {
      return res.status(400).json({ 
        error: 'Invalid TOTP code format - must be 6 digits',
        code: 'TOTP_FORMAT_INVALID' 
      });
    }

    // Check rate limiting before attempting TOTP verification
    const rateLimitKey = getRateLimitKey(req, 'totp');
    
    // Set rate limit key for potential failure recording
    (req as any).totpRateLimitKey = rateLimitKey;
    
    // Check if rate limited
    const rateLimitResult = isRateLimited(rateLimitKey, rateLimitStore, TOTP_RATE_LIMIT);
    
    if (rateLimitResult.limited) {
      const retryAfter = Math.ceil((rateLimitResult.nextAttemptAllowed - Date.now()) / 1000);
      return res.status(429).json({
        error: 'Too many 2FA verification attempts',
        code: 'TOTP_RATE_LIMITED',
        retryAfter,
        message: `Please try again in ${Math.ceil(retryAfter / 60)} minutes`
      });
    }
    
    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': TOTP_RATE_LIMIT.maxAttempts.toString(),
      'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
      'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetTime / 1000).toString()
    });

    // Verify TOTP code
    if (!admin.totpSecret) {
      return res.status(500).json({ 
        error: 'Admin 2FA configuration error',
        code: 'TOTP_CONFIG_ERROR' 
      });
    }

    // Verify TOTP code with replay protection
    const totpResult = verifyTotpCodeWithReplay(admin.totpSecret, totpCode, admin.lastTotpTimestep);
    if (!totpResult.valid) {
      // Record failed attempt for rate limiting
      recordFailedTotpAttempt(req);
      
      return res.status(401).json({ 
        error: 'Invalid 2FA code',
        code: 'TOTP_INVALID' 
      });
    }

    // Update timestep to prevent replay and last login timestamp
    if (totpResult.timestep) {
      await storage.updateAdminLastTotpTimestep(admin.id, totpResult.timestep);
    }
    await storage.updateAdminLastLogin(admin.id);
    
    // Clear rate limits on successful authentication
    clearAdminRateLimit(req);

    // Allow access to admin route
    next();

  } catch (error) {
    console.error('[ADMIN_2FA] Error in 2FA middleware:', error);
    return res.status(500).json({ 
      error: 'Internal authentication error',
      code: 'INTERNAL_ERROR' 
    });
  }
}

/**
 * ALWAYS enforces admin authentication - checks OAuth claims and admin allowlist
 * This middleware MUST ALWAYS run for admin routes regardless of 2FA settings
 */
export async function requireAdminAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // Validate ENV.ADMIN_EMAILS configuration
    if (!ENV.ADMIN_EMAILS || !Array.isArray(ENV.ADMIN_EMAILS) || ENV.ADMIN_EMAILS.length === 0) {
      console.error('[ADMIN_AUTH] ADMIN_EMAILS not properly configured');
      return res.status(500).json({ 
        error: 'Admin configuration error',
        code: 'CONFIG_ERROR' 
      });
    }

    // Get admin email from session or OAuth claims
    const adminEmail = getAdminEmailFromRequest(req);
    if (!adminEmail) {
      return res.status(401).json({ 
        error: 'Admin authentication required',
        code: 'ADMIN_AUTH_REQUIRED' 
      });
    }

    // Check if email is in authorized admin list
    if (!ENV.ADMIN_EMAILS.includes(adminEmail.toLowerCase())) {
      return res.status(403).json({ 
        error: 'Access denied - not an authorized admin',
        code: 'ADMIN_NOT_AUTHORIZED' 
      });
    }

    // Get admin from database
    let admin = await storage.getAdminByEmail(adminEmail);
    if (!admin) {
      // Create admin record if doesn't exist (for OAuth-only admins)
      admin = await storage.createAdmin({
        email: adminEmail,
        totpEnabled: false,
        active: true
      });
    }

    // Check if admin is active
    if (!admin.active) {
      return res.status(403).json({ 
        error: 'Admin account is disabled',
        code: 'ADMIN_DISABLED' 
      });
    }

    req.admin = admin;
    next();

  } catch (error) {
    console.error('[ADMIN_AUTH] Error in admin auth middleware:', error);
    return res.status(500).json({ 
      error: 'Internal authentication error',
      code: 'INTERNAL_ERROR' 
    });
  }
}

/**
 * Extract admin email from request (session or OAuth claims)
 */
function getAdminEmailFromRequest(req: Request): string | null {
  // Try OAuth claims first (Replit Auth)
  const oauthEmail = (req.user as any)?.claims?.email || (req.user as any)?.email;
  if (oauthEmail) {
    return oauthEmail;
  }

  // Try session-based auth
  const sessionUserId = (req.session as any)?.userId;
  if (sessionUserId) {
    // For session auth, we'd need to look up the user email
    // This is a placeholder for session-based admin auth
    return null;
  }

  return null;
}