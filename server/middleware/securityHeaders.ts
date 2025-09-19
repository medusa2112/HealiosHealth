import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Phase 2 Security: Enhanced security headers middleware
 * Implements comprehensive security headers to protect against common attacks
 */

// Generate nonce for inline scripts (CSP)
export function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64');
}

// Comprehensive security headers middleware
export function enhancedSecurityHeaders(req: Request, res: Response, next: NextFunction) {
  // Generate a nonce for this request
  const nonce = generateNonce();
  res.locals.nonce = nonce;

  // Strict Transport Security (HSTS)
  // Force HTTPS for 1 year, including subdomains
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Content Security Policy (CSP)
  // Strict policy to prevent XSS attacks
  const cspDirectives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // unsafe-inline needed for Tailwind
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://maps.googleapis.com",
    "frame-src 'self'"
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "block-all-mixed-content",
    "upgrade-insecure-requests"
  ];
  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));

  // X-Frame-Options - Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // X-Content-Type-Options - Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Referrer-Policy - Control referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions-Policy (formerly Feature-Policy)
  // Restrict browser features
  const permissionsPolicy = [
    'camera=()',
    'microphone=()',
    'geolocation=(self)',
    'payment=(self)',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()'
  ];
  res.setHeader('Permissions-Policy', permissionsPolicy.join(', '));

  // X-XSS-Protection - Legacy XSS protection for older browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // X-DNS-Prefetch-Control - Control DNS prefetching
  res.setHeader('X-DNS-Prefetch-Control', 'on');

  // X-Download-Options - Prevent IE from executing downloads
  res.setHeader('X-Download-Options', 'noopen');

  // X-Permitted-Cross-Domain-Policies - Control Adobe products' cross-domain behavior
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

  // Clear-Site-Data - Clear browsing data (for logout)
  if (req.path === '/api/auth/logout' || req.path === '/api/auth/admin/logout') {
    res.setHeader('Clear-Site-Data', '"cache", "cookies", "storage"');
  }

  // Report-To - Configure reporting endpoint for CSP violations
  const reportTo = {
    group: 'csp-endpoint',
    max_age: 86400,
    endpoints: [{ url: '/api/security/csp-report' }]
  };
  res.setHeader('Report-To', JSON.stringify(reportTo));

  // NEL (Network Error Logging)
  const nel = {
    report_to: 'csp-endpoint',
    max_age: 86400
  };
  res.setHeader('NEL', JSON.stringify(nel));

  // Cross-Origin Headers for enhanced security
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

  next();
}

// CSP violation report handler
export function cspReportHandler(req: Request, res: Response) {
  // Log CSP violations for monitoring
  if (req.body) {
    console.error('[CSP Violation]', {
      documentUri: req.body['document-uri'],
      violatedDirective: req.body['violated-directive'],
      blockedUri: req.body['blocked-uri'],
      sourceFile: req.body['source-file'],
      lineNumber: req.body['line-number'],
      timestamp: new Date().toISOString()
    });
  }
  
  res.status(204).end();
}

// Security headers for API responses
export function apiSecurityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent caching of sensitive data
  if (req.path.includes('/api/admin') || 
      req.path.includes('/api/auth') ||
      req.path.includes('/api/orders') ||
      req.path.includes('/api/users')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  // Add security headers for JSON responses
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  next();
}

// Export all security header functions
export default {
  enhancedSecurityHeaders,
  cspReportHandler,
  apiSecurityHeaders,
  generateNonce
};