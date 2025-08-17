import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Phase 3 Security: Real-time Security Monitoring System
 * Provides comprehensive security event monitoring and alerting
 */

interface SecurityEvent {
  id: string;
  type: 'authentication' | 'authorization' | 'suspicious_activity' | 'rate_limit' | 'error' | 'fraud';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  ip: string;
  userAgent?: string;
  userId?: string;
  path: string;
  method: string;
  details: any;
  resolved: boolean;
}

interface ThreatIndicator {
  ip: string;
  suspiciousActivities: number;
  firstSeen: number;
  lastSeen: number;
  blocked: boolean;
  reasons: string[];
}

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  blockedRequests: number;
  uniqueThreats: number;
  averageResponseTime: number;
  uptime: number;
}

// In-memory storage for security events (in production, use a database)
const securityEvents: SecurityEvent[] = [];
const threatIndicators = new Map<string, ThreatIndicator>();
const blockedIPs = new Set<string>();
const startTime = Date.now();

// Configuration
const SECURITY_CONFIG = {
  maxEventsInMemory: 10000,
  suspiciousActivityThreshold: 10,
  autoBlockThreshold: 20,
  eventRetentionHours: 24,
  alertThresholds: {
    criticalEventsPerHour: 5,
    failedAuthAttemptsPerHour: 50,
    suspiciousActivitiesPerHour: 100
  }
};

/**
 * Creates a new security event
 */
function createSecurityEvent(
  type: SecurityEvent['type'],
  severity: SecurityEvent['severity'],
  req: Request,
  details: any
): SecurityEvent {
  const event: SecurityEvent = {
    id: crypto.randomBytes(16).toString('hex'),
    type,
    severity,
    timestamp: Date.now(),
    ip: req.ip || 'unknown',
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id || (req as any).session?.userId,
    path: req.path,
    method: req.method,
    details,
    resolved: false
  };

  // Add to events list
  securityEvents.push(event);

  // Maintain event limit
  if (securityEvents.length > SECURITY_CONFIG.maxEventsInMemory) {
    securityEvents.splice(0, securityEvents.length - SECURITY_CONFIG.maxEventsInMemory);
  }

  // Update threat indicators
  updateThreatIndicator(event);

  // Check for automatic blocking
  checkForAutoBlock(event);

  // Log critical events immediately
  if (severity === 'critical') {
    console.error('[Security Alert] Critical security event:', {
      id: event.id,
      type: event.type,
      ip: event.ip,
      path: event.path,
      details: event.details
    });
  }

  return event;
}

/**
 * Updates threat indicators for an IP
 */
function updateThreatIndicator(event: SecurityEvent) {
  const ip = event.ip;
  let indicator = threatIndicators.get(ip);

  if (!indicator) {
    indicator = {
      ip,
      suspiciousActivities: 0,
      firstSeen: event.timestamp,
      lastSeen: event.timestamp,
      blocked: false,
      reasons: []
    };
    threatIndicators.set(ip, indicator);
  }

  indicator.lastSeen = event.timestamp;

  // Count suspicious activities
  if (['suspicious_activity', 'fraud', 'rate_limit'].includes(event.type) || 
      event.severity === 'high' || event.severity === 'critical') {
    indicator.suspiciousActivities++;
    
    if (!indicator.reasons.includes(event.type)) {
      indicator.reasons.push(event.type);
    }
  }
}

/**
 * Checks if an IP should be automatically blocked
 */
function checkForAutoBlock(event: SecurityEvent) {
  const indicator = threatIndicators.get(event.ip);
  
  if (indicator && 
      indicator.suspiciousActivities >= SECURITY_CONFIG.autoBlockThreshold &&
      !indicator.blocked) {
    
    indicator.blocked = true;
    blockedIPs.add(event.ip);
    
    console.error('[Security Alert] IP automatically blocked:', {
      ip: event.ip,
      suspiciousActivities: indicator.suspiciousActivities,
      reasons: indicator.reasons,
      autoBlocked: true
    });

    // Create a critical event for the auto-block
    createSecurityEvent('suspicious_activity', 'critical', {
      ip: event.ip,
      path: '/system/auto-block',
      method: 'BLOCK',
      get: () => undefined
    } as any, {
      autoBlocked: true,
      totalSuspiciousActivities: indicator.suspiciousActivities,
      reasons: indicator.reasons
    });
  }
}

/**
 * Middleware to log security events
 */
export function securityEventLogger(
  type: SecurityEvent['type'],
  severity: SecurityEvent['severity'] = 'low'
) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if IP is blocked
    if (blockedIPs.has(req.ip || '')) {
      return res.status(403).json({
        error: 'IP blocked',
        message: 'Your IP has been blocked due to suspicious activity',
        code: 'IP_BLOCKED'
      });
    }

    // Create security event
    const event = createSecurityEvent(type, severity, req, {
      statusCode: res.statusCode,
      contentLength: res.get('content-length'),
      responseTime: Date.now()
    });

    // Add event ID to response headers for tracking
    res.setHeader('X-Security-Event-ID', event.id);

    next();
  };
}

/**
 * Middleware to detect and log authentication failures
 */
export function monitorAuthenticationFailures() {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;
    
    res.json = function(body) {
      // Check for authentication failures
      if (res.statusCode === 401 || res.statusCode === 403 || 
          (body && (body.error === 'Invalid credentials' || 
                   body.error === 'Authentication failed' ||
                   body.message?.includes('Invalid PIN')))) {
        
        createSecurityEvent('authentication', 'medium', req, {
          statusCode: res.statusCode,
          error: body?.error || body?.message,
          timestamp: Date.now()
        });
      }

      return originalJson.call(this, body);
    };

    next();
  };
}

/**
 * Middleware to detect suspicious request patterns
 */
export function detectAnomalies() {
  const requestPatterns = new Map<string, { count: number; firstSeen: number }>();
  
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || 'unknown';
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    // Track request patterns by IP
    const pattern = requestPatterns.get(ip);
    if (!pattern) {
      requestPatterns.set(ip, { count: 1, firstSeen: now });
    } else {
      // Reset count if it's been more than an hour
      if (now - pattern.firstSeen > oneHour) {
        pattern.count = 1;
        pattern.firstSeen = now;
      } else {
        pattern.count++;
      }
      
      // Detect anomalies
      if (pattern.count > 1000) { // More than 1000 requests per hour
        createSecurityEvent('suspicious_activity', 'high', req, {
          requestCount: pattern.count,
          timeWindow: 'hour',
          anomalyType: 'high_request_volume'
        });
      }
    }

    // Clean up old patterns
    if (Math.random() < 0.01) { // 1% chance to clean up
      for (const [key, value] of requestPatterns.entries()) {
        if (now - value.firstSeen > oneHour) {
          requestPatterns.delete(key);
        }
      }
    }

    next();
  };
}

/**
 * Get security metrics and statistics
 */
export function getSecurityMetrics(): SecurityMetrics {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const recentEvents = securityEvents.filter(e => now - e.timestamp < oneHour);
  
  return {
    totalEvents: securityEvents.length,
    criticalEvents: securityEvents.filter(e => e.severity === 'critical').length,
    blockedRequests: blockedIPs.size,
    uniqueThreats: threatIndicators.size,
    averageResponseTime: 0, // Would calculate from actual response times
    uptime: now - startTime
  };
}

/**
 * Get recent security events
 */
export function getRecentSecurityEvents(limit: number = 50): SecurityEvent[] {
  return securityEvents
    .slice(-limit)
    .sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Get threat indicators
 */
export function getThreatIndicators(): ThreatIndicator[] {
  return Array.from(threatIndicators.values())
    .sort((a, b) => b.suspiciousActivities - a.suspiciousActivities);
}

/**
 * Manually block an IP address
 */
export function blockIP(ip: string, reason: string) {
  blockedIPs.add(ip);
  
  const indicator = threatIndicators.get(ip);
  if (indicator) {
    indicator.blocked = true;
    if (!indicator.reasons.includes(reason)) {
      indicator.reasons.push(reason);
    }
  } else {
    threatIndicators.set(ip, {
      ip,
      suspiciousActivities: 1,
      firstSeen: Date.now(),
      lastSeen: Date.now(),
      blocked: true,
      reasons: [reason]
    });
  }

  console.log('[Security] IP manually blocked:', { ip, reason });
}

/**
 * Unblock an IP address
 */
export function unblockIP(ip: string) {
  blockedIPs.delete(ip);
  
  const indicator = threatIndicators.get(ip);
  if (indicator) {
    indicator.blocked = false;
  }

  console.log('[Security] IP unblocked:', { ip });
}

/**
 * Generate security dashboard data
 */
export function getSecurityDashboard() {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const oneDay = 24 * oneHour;

  const recentEvents = securityEvents.filter(e => now - e.timestamp < oneHour);
  const dailyEvents = securityEvents.filter(e => now - e.timestamp < oneDay);

  const eventsByType = dailyEvents.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const eventsBySeverity = dailyEvents.reduce((acc, event) => {
    acc[event.severity] = (acc[event.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    overview: getSecurityMetrics(),
    recentActivity: {
      lastHour: recentEvents.length,
      last24Hours: dailyEvents.length,
      blockedIPs: blockedIPs.size,
      activeThreat: getThreatIndicators().filter(t => !t.blocked).length
    },
    breakdown: {
      byType: eventsByType,
      bySeverity: eventsBySeverity
    },
    topThreats: getThreatIndicators().slice(0, 10),
    recentEvents: getRecentSecurityEvents(20)
  };
}

// Export all security monitoring functions
export default {
  securityEventLogger,
  monitorAuthenticationFailures,
  detectAnomalies,
  getSecurityMetrics,
  getRecentSecurityEvents,
  getThreatIndicators,
  blockIP,
  unblockIP,
  getSecurityDashboard,
  createSecurityEvent
};