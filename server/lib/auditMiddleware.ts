import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import type { InsertAdminLog } from '@shared/schema';

// Audit middleware to log admin actions
export function auditAction(actionType: string, targetType: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    const originalJson = res.json;
    
    // Get user info
    const user = req.user as any;
    const adminId = user?.id || user?.userId || (req.session as any)?.userId;
    
    if (!adminId) {
      return next();
    }
    
    // Extract target ID from request
    const targetId = req.params.id || req.params.orderId || req.params.productId || req.body.id || 'unknown';
    
    // Override response methods to capture response data
    res.send = function(this: Response, body: any) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Log successful admin action
        logAdminAction({
          adminId,
          actionType,
          targetType,
          targetId,
          details: JSON.stringify({
            method: req.method,
            path: req.path,
            query: req.query,
            body: sanitizeBody(req.body),
            userAgent: req.get('User-Agent'),
            ip: req.ip || req.connection.remoteAddress
          })
        }).catch(console.error);
      }
      return originalSend.call(this, body);
    };
    
    res.json = function(this: Response, body: any) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Log successful admin action
        logAdminAction({
          adminId,
          actionType,
          targetType, 
          targetId,
          details: JSON.stringify({
            method: req.method,
            path: req.path,
            query: req.query,
            body: sanitizeBody(req.body),
            userAgent: req.get('User-Agent'),
            ip: req.ip || req.connection.remoteAddress
          })
        }).catch(console.error);
      }
      return originalJson.call(this, body);
    };
    
    next();
  };
}

// Helper function to log admin actions
async function logAdminAction(logData: InsertAdminLog) {
  try {
    await storage.createAdminLog(logData);
    console.log(`[AUDIT] ${logData.actionType} by ${logData.adminId} on ${logData.targetType}:${logData.targetId}`);
  } catch (error) {
    console.error('[AUDIT] Failed to log admin action:', error);
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
      details: JSON.stringify({
        timestamp: new Date().toISOString(),
        success,
        ...details
      })
    });
  } catch (error) {
    console.error('[AUDIT] Failed to log login attempt:', error);
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
      details: JSON.stringify({
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('[AUDIT] Failed to log logout:', error);
  }
}