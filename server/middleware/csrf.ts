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
 * Generate a CSRF token for a session
 */
function generateCSRFToken(sessionId: string): string {
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
  const sessionId = req.sessionID || req.session?.id || 'anonymous';
  
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
  const sessionId = req.sessionID || req.session?.id || 'anonymous';
  const token = generateCSRFToken(sessionId);
  
  res.json({ 
    csrfToken: token,
    header: 'X-CSRF-Token'
  });
}