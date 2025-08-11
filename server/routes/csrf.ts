import express from 'express';
import { Request, Response } from 'express';
import crypto from 'crypto';

interface CSRFRequest extends Request {
  csrfToken?: () => string;
  sessionID?: string;
  session?: any;
}

const router = express.Router();

/**
 * Phase 8: Dual CSRF Token System
 * Separate CSRF tokens for customer and admin surfaces
 */

// In-memory token storage (in production, use Redis or database)
const csrfTokens = new Map<string, { token: string, expires: number }>();

// Generate a CSRF token
function generateToken(sessionId: string): string {
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

// Customer CSRF token endpoint
router.get('/', (req: CSRFRequest, res: Response) => {
  // Use session ID or generate one for anonymous users
  const sessionId = req.sessionID || req.session?.id || `anon-${req.ip}-${Date.now()}`;
  
  // Generate token using the middleware function if available, otherwise generate directly
  const csrfToken = req.csrfToken ? req.csrfToken() : generateToken(sessionId);
  
  // Set cookie for customer CSRF
  res.cookie('csrf_cust', csrfToken, {
    httpOnly: false, // Allow JavaScript access for header inclusion
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
  
  res.json({ 
    csrfToken,
    surface: 'customer'
  });
});

// Legacy endpoint for backward compatibility
router.get('/token', (req: CSRFRequest, res: Response) => {
  // Use session ID or generate one for anonymous users
  const sessionId = req.sessionID || req.session?.id || `anon-${req.ip}-${Date.now()}`;
  
  // Generate token
  const csrfToken = req.csrfToken ? req.csrfToken() : generateToken(sessionId);
  
  res.json({ csrfToken });
});

export default router;

// Admin CSRF token endpoint (separate export)
export const adminCsrfRouter = express.Router();

adminCsrfRouter.get('/csrf', (req: CSRFRequest, res: Response) => {
  // Use admin session ID
  const sessionId = req.sessionID || req.session?.id || `admin-${req.ip}-${Date.now()}`;
  
  // Generate token
  const csrfToken = req.csrfToken ? req.csrfToken() : generateToken(sessionId);
  
  // Set cookie for admin CSRF
  res.cookie('csrf_admin', csrfToken, {
    httpOnly: false, // Allow JavaScript access for header inclusion
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict', // Stricter for admin
    path: '/admin'
  });
  
  res.json({ 
    csrfToken,
    surface: 'admin'
  });
});