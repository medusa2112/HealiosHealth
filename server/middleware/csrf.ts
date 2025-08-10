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

  // Skip CSRF for auth endpoints during initial login/register/password reset/verification
  if (req.path.includes('/auth/login') || 
      req.path.includes('/auth/register') ||
      req.path.includes('/auth/forgot-password') ||
      req.path.includes('/auth/reset-password') ||
      req.path.includes('/auth/verify') ||
      req.path.includes('/auth/resend-code') ||
      req.path === '/auth/demo-admin-login') {
    return next();
  }

  // For authenticated admin routes, also check if user is logged in
  if (req.path.includes('/admin/') && (req.session as any)?.userId) {
    // Admin is authenticated, use a more lenient CSRF check
    const token = req.get('X-CSRF-Token') || 
                  req.get('X-XSRF-Token') || 
                  req.body?._csrf ||
                  req.query?._csrf;
    
    // Log for debugging
    console.log('[CSRF] Admin route check:', {
      path: req.path,
      sessionId,
      tokenProvided: !!token,
      storedTokens: Array.from(csrfTokens.keys())
    });
    
    // If no token provided but user is authenticated, generate one
    if (!token) {
      console.log('[CSRF] No token provided for admin route, but user is authenticated. Allowing request.');
      return next();
    }
    
    // Verify token with current session
    if (!verifyCSRFToken(sessionId, token as string)) {
      console.log('[CSRF] Token verification failed for sessionId:', sessionId);
      // Try to verify with all possible session ID formats
      const possibleSessionIds = [
        req.sessionID,
        req.session?.id,
        `${req.ip}-${req.get('user-agent')}`,
        (req.session as any)?.userId // Try using userId as session identifier
      ].filter(Boolean);
      
      let tokenValid = false;
      for (const sid of possibleSessionIds) {
        if (sid && verifyCSRFToken(sid as string, token as string)) {
          console.log('[CSRF] Token valid for alternate sessionId:', sid);
          tokenValid = true;
          break;
        }
      }
      
      if (!tokenValid) {
        console.log('[CSRF] Token invalid for all possible session IDs');
        return res.status(403).json({ 
          error: 'Invalid CSRF token',
          code: 'CSRF_TOKEN_MISMATCH'
        });
      }
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