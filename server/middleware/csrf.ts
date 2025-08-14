import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

interface CSRFRequest extends Request {
  csrfToken?: () => string;
}

// Store tokens in memory (in production, use Redis or database)
const csrfTokens = new Map<string, { token: string, expires: number }>();

// Clean up expired tokens periodically
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, data] of csrfTokens.entries()) {
    if (data.expires < now) {
      csrfTokens.delete(sessionId);
    }
  }
}, 5 * 60 * 1000); // Clean every 5 minutes

/**
 * Generate or retrieve a CSRF token for a session
 */
function generateCSRFToken(sessionId: string): string {
  // Check if a valid token already exists
  const existing = csrfTokens.get(sessionId);
  if (existing && existing.expires > Date.now()) {
    return existing.token;
  }
  
  // Generate new token
  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  
  csrfTokens.set(sessionId, { token, expires });
  return token;
}

/**
 * Verify a CSRF token for a session
 */
function verifyCSRFToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId);
  if (!stored || stored.expires < Date.now()) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(stored.token), Buffer.from(token));
}

/**
 * CSRF protection middleware
 */
export function csrfProtection(req: CSRFRequest, res: Response, next: NextFunction) {
  // Use session ID if available, otherwise use a combination of IP and user agent for anonymous users
  const sessionId = req.sessionID || req.session?.id || `${req.ip}-${req.get('user-agent')}`;
  
  // Add token generator to request
  req.csrfToken = () => generateCSRFToken(sessionId);

  // Skip CSRF check for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // HARDENED: Dev bypass ONLY with explicit env var AND special header
  // This cannot accidentally activate in production
  const allowDevBypass = process.env.NODE_ENV !== 'production' && 
                         process.env.CSRF_DEV_BYPASS === 'true';
  
  if (allowDevBypass && req.headers['x-csrf-dev-bypass'] === 'ok') {
    console.log('[CSRF] Dev bypass activated for:', req.originalUrl);
    return next();
  }

  // Skip CSRF for address validation in development
  if (process.env.NODE_ENV === 'development' && req.originalUrl.includes('/validate-address/')) {
    console.log('[CSRF] Development bypass for address validation:', req.originalUrl);
    return next();
  }

  // Skip CSRF for auth endpoints during initial login/register/password reset/verification
  const fullPath = req.originalUrl || req.url || req.path;
  if (fullPath.includes('/auth/login') || 
      fullPath.includes('/auth/register') ||
      fullPath.includes('/auth/customer/login') ||  // Phase 8: Customer login
      fullPath.includes('/auth/customer/register') || // Phase 8: Customer register
      fullPath.includes('/auth/admin/login') ||  // Phase 8: Admin login
      fullPath.includes('/auth/forgot-password') ||
      fullPath.includes('/auth/reset-password') ||
      fullPath.includes('/auth/verify') ||
      fullPath.includes('/auth/resend-code') ||
      fullPath.includes('/auth/send-pin') ||  // PIN authentication endpoints
      fullPath.includes('/auth/verify-pin') ||  // PIN verification
      fullPath.includes('/auth/check-user') ||  // PIN authentication check user endpoint
      fullPath === '/auth/demo-admin-login' ||
      fullPath.includes('/validate-discount')) {  // Public discount validation endpoint
    return next();
  }

  // Skip CSRF for cart routes in development (temporary fix for session consistency)
  if (process.env.NODE_ENV === 'development' && fullPath.includes('/api/cart/')) {
    console.log('[CSRF] Development mode - bypassing CSRF for cart route:', fullPath);
    return next();
  }

  // Skip CSRF for checkout session creation in development
  if (process.env.NODE_ENV === 'development' && fullPath.includes('/api/create-checkout-session')) {
    console.log('[CSRF] Development mode - bypassing CSRF for checkout session:', fullPath);
    return next();
  }

  // Skip CSRF for admin routes in development environment
  if (process.env.NODE_ENV === 'development' && fullPath.includes('/api/admin/')) {
    console.log('[CSRF] Development mode - bypassing CSRF for admin route:', fullPath);
    return next();
  }

  // Skip CSRF for customer profile routes in development (temporary fix for profile update)
  if (process.env.NODE_ENV === 'development' && fullPath.includes('/api/auth/customer/profile')) {
    console.log('[CSRF] Development mode - bypassing CSRF for customer profile route:', fullPath);
    return next();
  }

  // For authenticated admin routes, use a more lenient approach in development
  if (req.path.includes('/admin/') && (req.session as any)?.adminId) {
    const token = req.get('X-CSRF-Token') || 
                  req.get('X-XSRF-Token') || 
                  req.body?._csrf ||
                  req.query?._csrf;
    
    // Log for debugging
    console.log('[CSRF] Admin route check:', {
      path: req.path,
      sessionId,
      tokenProvided: !!token,
      nodeEnv: process.env.NODE_ENV,
      adminId: (req.session as any)?.adminId,
      providedToken: token ? token.substring(0, 10) + '...' : 'none'
    });
    
    // In development, be more lenient for authenticated admin users
    if (process.env.NODE_ENV === 'development') {
      console.log('[CSRF] Development mode - allowing authenticated admin request');
      return next();
    }
    
    // Production - strict CSRF validation
    if (!token) {
      return res.status(403).json({ 
        error: 'CSRF token required',
        code: 'CSRF_TOKEN_MISSING'
      });
    }
    
    // Try to verify with multiple session identifiers
    const possibleSessionIds = [
      sessionId,
      req.sessionID,
      req.session?.id,
      (req.session as any)?.userId,
      `${req.ip}-${req.get('user-agent')}`
    ].filter(Boolean);
    
    let tokenValid = false;
    for (const sid of possibleSessionIds) {
      if (sid && verifyCSRFToken(sid as string, token as string)) {
        console.log('[CSRF] Token valid for sessionId:', sid);
        tokenValid = true;
        break;
      }
    }
    
    if (!tokenValid) {
      console.log('[CSRF] Token invalid for all session IDs:', possibleSessionIds);
      return res.status(403).json({ 
        error: 'Invalid CSRF token',
        code: 'CSRF_TOKEN_MISMATCH'
      });
    }
    
    return next();
  }

  // Get token from header or body
  const token = req.get('X-CSRF-Token') || 
                req.get('X-XSRF-Token') || 
                req.body?._csrf ||
                req.query?._csrf;

  if (!token || !verifyCSRFToken(sessionId, token as string)) {
    return res.status(403).json({ 
      error: 'Invalid CSRF token',
      code: 'CSRF_TOKEN_MISMATCH'
    });
  }

  next();
}

/**
 * Endpoint to get CSRF token
 */
export function csrfTokenEndpoint(req: CSRFRequest, res: Response) {
  // Use the same session ID logic as the middleware
  const sessionId = req.sessionID || req.session?.id || `${req.ip}-${req.get('user-agent')}`;
  const token = generateCSRFToken(sessionId);
  
  console.log('[CSRF] Token endpoint called:', {
    sessionId,
    tokenGenerated: token.substring(0, 10) + '...',
    userId: (req.session as any)?.userId
  });
  
  res.json({ 
    csrfToken: token,
    header: 'X-CSRF-Token'
  });
}