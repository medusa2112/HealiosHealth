import { Request, Response, NextFunction } from 'express';
import { ADMIN_CONFIG } from '../config/adminConfig';
import rateLimit from 'express-rate-limit';
import { logger } from '../lib/logger';

/**
 * Blocks all admin routes in production
 */
export function blockAdminInProduction(req: Request, res: Response, next: NextFunction) {
  // If admin is disabled, return 404 for all admin routes
  if (!ADMIN_CONFIG.enabled) {
    logger.warn('ADMIN_ACCESS', 'Admin access attempted but admin is disabled', {
      path: req.path,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return res.status(404).json({ error: 'Not found' });
  }
  
  next();
}

/**
 * IP allowlist middleware for admin routes
 */
export function enforceIPAllowlist(req: Request, res: Response, next: NextFunction) {
  // Skip in development unless explicitly configured
  if (process.env.NODE_ENV === 'development' && ADMIN_CONFIG.ipAllowlist.length === 0) {
    return next();
  }
  
  // Get client IP (handle proxies)
  const clientIP = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 
                   req.headers['x-real-ip'] as string ||
                   req.socket.remoteAddress || 
                   req.ip;
  
  // Check if IP is in allowlist
  if (ADMIN_CONFIG.ipAllowlist.length > 0 && !ADMIN_CONFIG.ipAllowlist.includes(clientIP)) {
    logger.warn('ADMIN_ACCESS', 'Admin access blocked - IP not in allowlist', {
      ip: clientIP,
      path: req.path,
      userAgent: req.headers['user-agent'],
    });
    
    return res.status(403).json({ 
      error: 'Access denied',
      code: 'IP_NOT_ALLOWED' 
    });
  }
  
  next();
}

/**
 * Rate limiting for admin routes
 */
export const adminRateLimit = rateLimit({
  windowMs: ADMIN_CONFIG.rateLimit.windowMs,
  max: ADMIN_CONFIG.rateLimit.max,
  message: 'Too many admin requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('ADMIN_ACCESS', 'Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
    });
    res.status(429).json({ 
      error: 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED' 
    });
  },
});

/**
 * Audit logging middleware for admin actions
 */
export function auditLog(action: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!ADMIN_CONFIG.auditLog) {
      return next();
    }
    
    const startTime = Date.now();
    const originalSend = res.send;
    let responseBody: any;
    
    // Capture response body
    res.send = function(body: any) {
      responseBody = body;
      return originalSend.call(this, body);
    };
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const adminId = (req.session as any)?.adminId;
      const email = (req.session as any)?.email;
      
      logger.info('ADMIN_AUDIT', action, {
        adminId,
        email,
        action,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        requestBody: req.body,
        responseStatus: res.statusCode,
        responseBody: res.statusCode < 400 ? responseBody : undefined,
        duration,
        timestamp: new Date().toISOString(),
      });
    });
    
    next();
  };
}

/**
 * Combined middleware stack for admin protection
 */
export const protectAdmin = [
  blockAdminInProduction,
  enforceIPAllowlist,
  adminRateLimit,
];