import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import type { InsertAdminLog } from '@shared/schema';

// Audit middleware to log admin actions
export function auditAction(actionType: string, targetType: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Track if we've already logged this action
    let hasLogged = false;
    const originalJson = res.json;
    const originalSend = res.send;
    const originalEnd = res.end;
    
    // Get user info
    const user = req.user as any;
    const adminId = user?.id || user?.userId || (req.session as any)?.userId;
    
    if (!adminId) {
      return next();
    }
    
    // Extract target ID from request
    const targetId = req.params.id || req.params.orderId || req.params.productId || req.body.id || 'unknown';
    
    // Helper function to log once
    const logOnce = async () => {
      if (!hasLogged && res.statusCode >= 200 && res.statusCode < 300) {
        hasLogged = true;
        await logAdminAction({
          adminId,
          actionType,
          targetType,
          targetId,
          ipAddress: req.ip || req.connection.remoteAddress,
          details: JSON.stringify({
            method: req.method,
            path: req.path,
            query: req.query,
            body: sanitizeBody(req.body),
            userAgent: req.get('User-Agent')
          })
        }).catch(console.error);
      }
    };
    
    // Override response methods to capture response data
    res.json = function(this: Response, body: any) {
      logOnce();
      return originalJson.call(this, body);
    };
    
    res.send = function(this: Response, body: any) {
      logOnce();
      return originalSend.call(this, body);
    };
    
    res.end = function(this: Response, chunk?: any, encoding?: any) {
      logOnce();
      return originalEnd.call(this, chunk, encoding);
    };
    
    next();
  };
}

// Helper function to log admin actions
async function logAdminAction(logData: InsertAdminLog) {
  try {
    await storage.createAdminLog(logData);
    
  } catch (error) {
    // // console.error('[AUDIT] Failed to log admin action:', error);
  }
}

// Sanitize request body to remove sensitive information
function sanitizeBody(body: any): any {
  if (!body || typeof body !== 'object') return body;
  
  const sanitized = { ...body };
  
  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth', 'stripe'];
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

// Audit login attempts
export async function auditLogin(adminId: string, success: boolean, details?: any) {
  try {
    await storage.createAdminLog({
      adminId,
      actionType: success ? 'login_success' : 'login_failed',
      targetType: 'auth',
      targetId: adminId,
      ipAddress: details?.ip || null,
      details: JSON.stringify({
        timestamp: new Date().toISOString(),
        success,
        ...details
      })
    });
  } catch (error) {
    // // console.error('[AUDIT] Failed to log login attempt:', error);
  }
}

// Audit logout
export async function auditLogout(adminId: string) {
  try {
    await storage.createAdminLog({
      adminId,
      actionType: 'logout',
      targetType: 'auth', 
      targetId: adminId,
      ipAddress: null, // IP not available during logout
      details: JSON.stringify({
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    // // console.error('[AUDIT] Failed to log logout:', error);
  }
}