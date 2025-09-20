import { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/env';

/**
 * Content Security Policy middleware for production security
 */
export function contentSecurityPolicy(req: Request, res: Response, next: NextFunction) {
  // Development CSP - more permissive for hot reload
  if (ENV.isDev) {
    res.setHeader('Content-Security-Policy', [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://replit.com https://maps.googleapis.com ws: wss:",
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
    // Production CSP - balanced security policy
    // Get current protocol and host for dynamic CSP
    const protocol = req.protocol || 'https';
    const currentOrigin = `${protocol}://${req.get('host')}`;
    
    res.setHeader('Content-Security-Policy', [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://replit.com https://maps.googleapis.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "media-src 'self' data: https: blob:",
      `connect-src 'self' ${currentOrigin} https://ipapi.co https://maps.googleapis.com`,
      "frame-src 'self'",
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