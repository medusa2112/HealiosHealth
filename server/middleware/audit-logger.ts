import { Request, Response, NextFunction } from 'express';
import fs from 'fs/promises';
import path from 'path';

/**
 * Security Audit Logger
 * Append-only logging for critical authentication and security events
 */

interface AuditEvent {
  timestamp: string;
  eventType: string;
  userId?: string;
  email?: string;
  ip: string;
  userAgent?: string;
  method: string;
  path: string;
  statusCode?: number;
  error?: string;
  metadata?: Record<string, any>;
}

class AuditLogger {
  private logPath: string;
  private buffer: AuditEvent[] = [];
  private flushInterval: NodeJS.Timeout;
  
  constructor() {
    // Use logs directory, create if doesn't exist
    this.logPath = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
    
    // Flush buffer every 5 seconds
    this.flushInterval = setInterval(() => this.flush(), 5000);
  }
  
  private async ensureLogDirectory() {
    try {
      await fs.mkdir(this.logPath, { recursive: true });
    } catch (error) {
      console.error('[AUDIT] Failed to create log directory:', error);
    }
  }
  
  private getLogFileName(): string {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logPath, `audit-${date}.log`);
  }
  
  async log(event: AuditEvent) {
    this.buffer.push(event);
    
    // Flush immediately for critical events
    if (['LOGIN_FAILED', 'CSRF_FAILURE', 'RATE_LIMIT_EXCEEDED', 'UNAUTHORIZED_ACCESS'].includes(event.eventType)) {
      await this.flush();
    }
  }
  
  async flush() {
    if (this.buffer.length === 0) return;
    
    const events = [...this.buffer];
    this.buffer = [];
    
    try {
      const logFile = this.getLogFileName();
      const lines = events.map(event => JSON.stringify(event)).join('\n') + '\n';
      await fs.appendFile(logFile, lines);
    } catch (error) {
      console.error('[AUDIT] Failed to write audit log:', error);
      // Re-add events to buffer to retry
      this.buffer.unshift(...events);
    }
  }
  
  destroy() {
    clearInterval(this.flushInterval);
    this.flush();
  }
}

// Singleton instance
const auditLogger = new AuditLogger();

/**
 * Audit logging middleware for authentication events
 */
export function auditAuthEvents(req: Request, res: Response, next: NextFunction) {
  const originalSend = res.send;
  const startTime = Date.now();
  
  // Capture response
  res.send = function(data: any) {
    res.locals.responseBody = data;
    return originalSend.call(this, data);
  };
  
  // Log on response finish
  res.on('finish', async () => {
    const duration = Date.now() - startTime;
    const path = req.originalUrl || req.url;
    
    // Determine if this is an auth-related endpoint
    const isAuthEndpoint = path.includes('/auth/') || 
                           path.includes('/login') || 
                           path.includes('/logout') ||
                           path.includes('/register') ||
                           path.includes('/password');
    
    if (!isAuthEndpoint) return;
    
    // Determine event type
    let eventType = 'AUTH_REQUEST';
    
    if (path.includes('/login')) {
      eventType = res.statusCode === 200 ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED';
    } else if (path.includes('/logout')) {
      eventType = 'LOGOUT';
    } else if (path.includes('/register')) {
      eventType = res.statusCode === 200 ? 'REGISTRATION_SUCCESS' : 'REGISTRATION_FAILED';
    } else if (path.includes('/password')) {
      eventType = 'PASSWORD_CHANGE';
    }
    
    // Extract user info
    const session = (req as any).session;
    const userId = session?.userId || session?.adminId;
    const email = req.body?.email || session?.email;
    
    // Parse response for errors
    let error: string | undefined;
    try {
      const responseBody = res.locals.responseBody;
      if (responseBody && typeof responseBody === 'string') {
        const parsed = JSON.parse(responseBody);
        error = parsed.error || parsed.message;
      }
    } catch (e) {
      // Ignore parse errors
    }
    
    // Log the event
    await auditLogger.log({
      timestamp: new Date().toISOString(),
      eventType,
      userId,
      email: email?.toLowerCase(),
      ip: req.ip || 'unknown',
      userAgent: req.get('user-agent'),
      method: req.method,
      path,
      statusCode: res.statusCode,
      error: res.statusCode >= 400 ? error : undefined,
      metadata: {
        duration,
        referer: req.get('referer'),
        origin: req.get('origin')
      }
    });
  });
  
  next();
}

/**
 * Log CSRF failures
 */
export async function logCSRFFailure(req: Request, error: string) {
  await auditLogger.log({
    timestamp: new Date().toISOString(),
    eventType: 'CSRF_FAILURE',
    userId: (req as any).session?.userId || (req as any).session?.adminId,
    ip: req.ip || 'unknown',
    userAgent: req.get('user-agent'),
    method: req.method,
    path: req.originalUrl || req.url,
    error,
    metadata: {
      origin: req.get('origin'),
      referer: req.get('referer')
    }
  });
}

/**
 * Log rate limit exceeded events
 */
export async function logRateLimitExceeded(req: Request) {
  await auditLogger.log({
    timestamp: new Date().toISOString(),
    eventType: 'RATE_LIMIT_EXCEEDED',
    email: req.body?.email,
    ip: req.ip || 'unknown',
    userAgent: req.get('user-agent'),
    method: req.method,
    path: req.originalUrl || req.url,
    metadata: {
      origin: req.get('origin')
    }
  });
}

/**
 * Log unauthorized access attempts
 */
export async function logUnauthorizedAccess(req: Request, reason: string) {
  await auditLogger.log({
    timestamp: new Date().toISOString(),
    eventType: 'UNAUTHORIZED_ACCESS',
    userId: (req as any).session?.userId || (req as any).session?.adminId,
    ip: req.ip || 'unknown',
    userAgent: req.get('user-agent'),
    method: req.method,
    path: req.originalUrl || req.url,
    error: reason,
    metadata: {
      origin: req.get('origin'),
      referer: req.get('referer')
    }
  });
}

// Ensure logs are flushed on exit
process.on('SIGINT', () => {
  auditLogger.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  auditLogger.destroy();
  process.exit(0);
});

export { auditLogger };