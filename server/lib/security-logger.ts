import { storage } from '../storage';
import { Request } from 'express';

export enum SecurityEventType {
  UNAUTHORIZED_ACCESS_ATTEMPT = 'unauthorized_access_attempt',
  ROLE_ESCALATION_ATTEMPT = 'role_escalation_attempt',
  INVALID_SESSION_ACCESS = 'invalid_session_access',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SUSPICIOUS_ORDER_ACTIVITY = 'suspicious_order_activity',
  ADMIN_LOGIN = 'admin_login',
  ADMIN_ACTION = 'admin_action',
  FAILED_AUTH_ATTEMPT = 'failed_auth_attempt',
  PASSWORD_CHANGE = 'password_change',
  ACCOUNT_LOCKOUT = 'account_lockout',
  SECURITY_FIX_APPLIED = 'security_fix_applied'
}

export interface SecurityEvent {
  type: SecurityEventType;
  userId?: number;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
  requestPath?: string;
  requestMethod?: string;
  details?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityFixLog {
  route: string;
  file: string;
  type: 'unauthRoute' | 'unvalidatedInput' | 'duplicateRoute' | 'rateLimitBypass' | 'authBypass' | 'other';
  fixedBy: string;
  timestamp: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  details?: Record<string, any>;
}

export class SecurityLogger {
  static async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      // Format for admin log system
      const logEntry = {
        adminId: event.userId?.toString() || 'system',
        actionType: 'security_event',
        targetType: 'system_security',
        targetId: event.type,
        details: JSON.stringify({
          securityEventType: event.type,
          userRole: event.userRole,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          requestPath: event.requestPath,
          requestMethod: event.requestMethod,
          severity: event.severity,
          timestamp: new Date().toISOString(),
          ...event.details
        })
      };

      await storage.createAdminLog(logEntry);

      // Log to console for immediate visibility
      const severity = event.severity.toUpperCase();
      const prefix = `🔒 SECURITY [${severity}]`;
      const message = `${event.type} - User: ${event.userId || 'anonymous'} (${event.userRole || 'unknown'}) - IP: ${event.ipAddress}`;
      
      if (event.severity === 'critical' || event.severity === 'high') {
        console.error(`${prefix} ${message}`, event.details);
      } else {
        console.warn(`${prefix} ${message}`, event.details);
      }

    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  static async logUnauthorizedAccess(req: Request, attemptedRole: string): Promise<void> {
    await this.logSecurityEvent({
      type: SecurityEventType.UNAUTHORIZED_ACCESS_ATTEMPT,
      userId: (req as any).user?.id,
      userRole: (req as any).user?.role,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      requestPath: req.path,
      requestMethod: req.method,
      severity: 'high',
      details: {
        attemptedRole,
        sessionExists: !!(req.session as any)?.userId,
        timestamp: new Date().toISOString()
      }
    });
  }

  static async logRoleEscalationAttempt(req: Request, currentRole: string, attemptedRole: string): Promise<void> {
    await this.logSecurityEvent({
      type: SecurityEventType.ROLE_ESCALATION_ATTEMPT,
      userId: (req as any).user?.id,
      userRole: currentRole,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      requestPath: req.path,
      requestMethod: req.method,
      severity: 'critical',
      details: {
        currentRole,
        attemptedRole,
        timestamp: new Date().toISOString()
      }
    });
  }

  static async logRateLimitExceeded(req: Request, endpoint: string): Promise<void> {
    await this.logSecurityEvent({
      type: SecurityEventType.RATE_LIMIT_EXCEEDED,
      userId: (req as any).user?.id,
      userRole: (req as any).user?.role,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      requestPath: req.path,
      requestMethod: req.method,
      severity: 'medium',
      details: {
        endpoint,
        timestamp: new Date().toISOString()
      }
    });
  }

  static async logSuspiciousOrderActivity(req: Request, orderDetails: any): Promise<void> {
    await this.logSecurityEvent({
      type: SecurityEventType.SUSPICIOUS_ORDER_ACTIVITY,
      userId: (req as any).user?.id,
      userRole: (req as any).user?.role,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      requestPath: req.path,
      requestMethod: req.method,
      severity: 'high',
      details: {
        orderDetails,
        timestamp: new Date().toISOString()
      }
    });
  }

  static async logAdminLogin(req: Request, userId: number): Promise<void> {
    await this.logSecurityEvent({
      type: SecurityEventType.ADMIN_LOGIN,
      userId,
      userRole: 'admin',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      requestPath: req.path,
      requestMethod: req.method,
      severity: 'medium',
      details: {
        timestamp: new Date().toISOString(),
        loginSuccess: true
      }
    });
  }

  static async logFailedAuthAttempt(req: Request, username?: string): Promise<void> {
    await this.logSecurityEvent({
      type: SecurityEventType.FAILED_AUTH_ATTEMPT,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      requestPath: req.path,
      requestMethod: req.method,
      severity: 'medium',
      details: {
        username,
        timestamp: new Date().toISOString()
      }
    });
  }

  static async logSecurityFix(fixLog: SecurityFixLog): Promise<void> {
    try {
      // Format for admin log system
      const logEntry = {
        adminId: fixLog.fixedBy,
        actionType: 'security_fix_applied',
        targetType: 'security_vulnerability',
        targetId: `${fixLog.type}_${fixLog.route.replace(/[^a-zA-Z0-9]/g, '_')}`,
        details: JSON.stringify({
          route: fixLog.route,
          file: fixLog.file,
          fixType: fixLog.type,
          fixedBy: fixLog.fixedBy,
          timestamp: fixLog.timestamp,
          severity: fixLog.severity || 'medium',
          ...fixLog.details
        })
      };

      await storage.createAdminLog(logEntry);

      // Also log as security event
      await this.logSecurityEvent({
        type: SecurityEventType.SECURITY_FIX_APPLIED,
        severity: fixLog.severity || 'medium',
        details: {
          route: fixLog.route,
          file: fixLog.file,
          fixType: fixLog.type,
          fixedBy: fixLog.fixedBy,
          timestamp: fixLog.timestamp,
          ...fixLog.details
        }
      });

      // Console log with appropriate formatting
      const fixTypeEmoji = {
        unauthRoute: '🔒',
        unvalidatedInput: '🛡️',
        duplicateRoute: '🔄',
        rateLimitBypass: '⏱️',
        authBypass: '🚫',
        other: '🔧'
      };

      const emoji = fixTypeEmoji[fixLog.type] || '🔧';
      const severity = (fixLog.severity || 'medium').toUpperCase();
      console.log(`${emoji} SECURITY FIX [${severity}]: ${fixLog.type} fixed in ${fixLog.route} by ${fixLog.fixedBy}`);
      
    } catch (error) {
      console.error('Failed to log security fix:', error);
    }
  }
}