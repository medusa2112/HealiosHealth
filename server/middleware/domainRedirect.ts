import { Request, Response, NextFunction } from 'express';

/**
 * Domain redirect middleware to enforce canonical www domain
 * Redirects apex domain (thehealios.com) to www subdomain (www.thehealios.com)
 * Only applies in production
 */
export function domainRedirectMiddleware(req: Request, res: Response, next: NextFunction) {
  // Only apply in production
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  const host = req.get('host');
  const protocol = req.get('x-forwarded-proto') || req.protocol;

  // Redirect apex domain to www subdomain
  if (host === 'thehealios.com') {
    const redirectUrl = `https://www.thehealios.com${req.originalUrl}`;
    
    // Use 301 (permanent redirect) for SEO benefits
    return res.redirect(301, redirectUrl);
  }

  // Allow through if already on canonical domain or other allowed domains
  next();
}