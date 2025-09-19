import { Request, Response, NextFunction } from 'express';

/**
 * Security Headers Middleware
 * Implements OWASP recommended security headers
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Content Security Policy - Strict by default
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com", // Allow CDN scripts
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Allow inline styles and Google Fonts
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",  // Allow images from any HTTPS source
    "media-src 'self' blob: data:",  // Allow video/audio
    "connect-src 'self' https://api.openai.com", // API connections
    "frame-ancestors 'none'",  // Prevent clickjacking
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'"
  ];

  // Relax CSP in development
  if (isDevelopment) {
    cspDirectives.push("script-src 'self' 'unsafe-inline' 'unsafe-eval' *");
    cspDirectives.push("connect-src 'self' ws: wss: *"); // Allow WebSocket for hot reload
  }

  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));
  
  // Strict Transport Security (HSTS) - Production only
  if (isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // X-Headers for additional protection
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Remove powered-by header to avoid fingerprinting
  res.removeHeader('X-Powered-By');
  
  // Permissions Policy (formerly Feature Policy)
  const permissionsPolicy = [
    'accelerometer=()',
    'camera=()',
    'geolocation=()',
    'gyroscope=()',
    'magnetometer=()',
    'microphone=()',
    'payment=()',
    'usb=()'
  ];
  res.setHeader('Permissions-Policy', permissionsPolicy.join(', '));
  
  next();
}