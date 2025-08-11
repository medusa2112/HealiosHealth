import { RequestHandler } from 'express';
import { ENV } from '../config/env';

// IP allowlist for admin access
const allowedIps = new Set(ENV.ADMIN_IP_ALLOWLIST);

export const requireAdmin: RequestHandler = async (req, res, next) => {
  const adminSid = req.cookies?.['hh_admin_sess'];
  
  // Check for admin session cookie and adminId in session
  if (!adminSid || !req.session?.adminId) {
    return res.status(401).json({ 
      error: 'Admin authentication required',
      code: 'ADMIN_AUTH_REQUIRED'
    });
  }
  
  // Check IP allowlist if configured
  if (allowedIps.size > 0) {
    const clientIp = req.ip || req.socket.remoteAddress || '';
    if (!allowedIps.has(clientIp)) {
      console.log(`[ADMIN AUTH] IP ${clientIp} not in allowlist`);
      return res.status(403).json({ 
        error: 'Access denied from this IP address',
        code: 'IP_NOT_ALLOWED'
      });
    }
  }
  
  // Note: We don't block based on customer cookie presence since the same browser
  // might have both customer and admin sessions. The admin session takes precedence
  // when accessing admin routes as long as it's valid.
  
  // TODO: Add 2FA check here if ENV.ADMIN_2FA_ENABLED
  if (ENV.ADMIN_2FA_ENABLED) {
    // Implementation for 2FA would go here
    // For now, just log it
    console.log('[ADMIN AUTH] 2FA check would happen here');
  }
  
  next();
};