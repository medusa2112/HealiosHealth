import { Request, Response, NextFunction } from 'express';

/**
 * Content Security Policy middleware for production security
 */
export function contentSecurityPolicy(req: Request, res: Response, next: NextFunction) {
  // Development CSP - more permissive for hot reload
  if (process.env.NODE_ENV === 'development') {
    res.setHeader('Content-Security-Policy', [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://replit.com ws: wss:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "media-src 'self' data: https: blob:",
      "connect-src 'self' ws: wss: https:",
      "frame-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; '));
  } else {
    // Production CSP - strict security policy
    res.setHeader('Content-Security-Policy', [
      "default-src 'self'",
      "script-src 'self' https://js.stripe.com https://cdn.jsdelivr.net https://replit.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https://healios-health-dominic96.replit.app https://cdn.stripe.com",
      "media-src 'self' https://healios-health-dominic96.replit.app",
      "connect-src 'self' https://api.stripe.com https://healios-health-dominic96.replit.app",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ].join('; '));
  }

  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  next();
}