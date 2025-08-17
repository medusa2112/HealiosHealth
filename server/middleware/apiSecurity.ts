import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { z } from 'zod';

/**
 * Phase 3 Security: Advanced API Security Middleware
 * Provides comprehensive API protection including request validation,
 * size limits, and advanced security features
 */

interface SecurityConfig {
  maxRequestSize: number;
  maxComplexity: number;
  enableSignatureValidation: boolean;
  trustedIPs: string[];
  rateLimitByEndpoint: boolean;
}

const defaultSecurityConfig: SecurityConfig = {
  maxRequestSize: 10 * 1024 * 1024, // 10MB
  maxComplexity: 100,
  enableSignatureValidation: false,
  trustedIPs: [],
  rateLimitByEndpoint: true
};

/**
 * Request size validation middleware
 */
export function requestSizeLimit(maxSize: number = 10 * 1024 * 1024) {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = req.get('content-length');
    
    if (contentLength && parseInt(contentLength) > maxSize) {
      return res.status(413).json({
        error: 'Request entity too large',
        message: `Request size exceeds maximum allowed size of ${Math.round(maxSize / 1024 / 1024)}MB`,
        maxSize: maxSize
      });
    }

    // Monitor request size for security analysis
    if (contentLength && parseInt(contentLength) > 1024 * 1024) { // 1MB
      console.log('[API Security] Large request detected:', {
        path: req.path,
        size: contentLength,
        ip: req.ip,
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
}

/**
 * Request complexity analysis
 */
function calculateRequestComplexity(req: Request): number {
  let complexity = 0;
  
  // Add complexity for nested objects
  const analyzeObject = (obj: any, depth = 0): void => {
    if (depth > 10) return; // Prevent infinite recursion
    
    if (typeof obj === 'object' && obj !== null) {
      if (Array.isArray(obj)) {
        complexity += obj.length;
        obj.forEach(item => analyzeObject(item, depth + 1));
      } else {
        complexity += Object.keys(obj).length;
        Object.values(obj).forEach(value => analyzeObject(value, depth + 1));
      }
    }
  };

  // Analyze query parameters
  analyzeObject(req.query);
  
  // Analyze request body
  if (req.body) {
    analyzeObject(req.body);
  }

  // Add complexity for headers (some headers indicate complex requests)
  complexity += Object.keys(req.headers).length * 0.1;

  return complexity;
}

/**
 * Request complexity validation
 */
export function requestComplexityLimit(maxComplexity: number = 100) {
  return (req: Request, res: Response, next: NextFunction) => {
    const complexity = calculateRequestComplexity(req);
    
    if (complexity > maxComplexity) {
      console.warn('[API Security] High complexity request blocked:', {
        path: req.path,
        complexity,
        maxComplexity,
        ip: req.ip,
        timestamp: new Date().toISOString()
      });
      
      return res.status(400).json({
        error: 'Request too complex',
        message: 'Request exceeds maximum allowed complexity',
        complexity: Math.round(complexity),
        maxComplexity
      });
    }

    // Log high complexity requests for monitoring
    if (complexity > maxComplexity * 0.7) {
      console.log('[API Security] High complexity request:', {
        path: req.path,
        complexity: Math.round(complexity),
        ip: req.ip
      });
    }

    next();
  };
}

/**
 * Content type validation
 */
export function validateContentType(allowedTypes: string[] = ['application/json', 'multipart/form-data']) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip validation for GET, HEAD, DELETE requests
    if (['GET', 'HEAD', 'DELETE'].includes(req.method)) {
      return next();
    }

    const contentType = req.get('content-type');
    
    if (!contentType) {
      return res.status(400).json({
        error: 'Content-Type header required',
        allowedTypes
      });
    }

    const isAllowed = allowedTypes.some(type => 
      contentType.toLowerCase().includes(type.toLowerCase())
    );

    if (!isAllowed) {
      return res.status(415).json({
        error: 'Unsupported Media Type',
        contentType,
        allowedTypes
      });
    }

    next();
  };
}

/**
 * API versioning middleware
 */
export function apiVersioning(supportedVersions: string[] = ['v1']) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Extract version from URL path or header
    let version = 'v1'; // default
    
    const pathVersion = req.path.match(/^\/api\/(v\d+)\//);
    if (pathVersion) {
      version = pathVersion[1];
    } else {
      const headerVersion = req.get('API-Version');
      if (headerVersion) {
        version = headerVersion;
      }
    }

    // Validate version
    if (!supportedVersions.includes(version)) {
      return res.status(400).json({
        error: 'Unsupported API version',
        version,
        supportedVersions
      });
    }

    // Add version to request for use in handlers
    (req as any).apiVersion = version;
    
    // Add version header to response
    res.setHeader('API-Version', version);

    next();
  };
}

/**
 * Request signature validation for critical operations
 */
export function validateRequestSignature(secretKey: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const signature = req.get('X-Request-Signature');
    const timestamp = req.get('X-Request-Timestamp');
    
    if (!signature || !timestamp) {
      return res.status(400).json({
        error: 'Request signature required',
        message: 'X-Request-Signature and X-Request-Timestamp headers are required for this endpoint'
      });
    }

    // Check timestamp freshness (within 5 minutes)
    const requestTime = parseInt(timestamp);
    const currentTime = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    if (Math.abs(currentTime - requestTime) > fiveMinutes) {
      return res.status(400).json({
        error: 'Request timestamp expired',
        message: 'Request must be made within 5 minutes'
      });
    }

    // Calculate expected signature
    const payload = `${req.method}${req.path}${timestamp}${JSON.stringify(req.body || {})}`;
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(payload)
      .digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      console.error('[API Security] Invalid request signature:', {
        path: req.path,
        ip: req.ip,
        timestamp: new Date().toISOString()
      });
      
      return res.status(401).json({
        error: 'Invalid request signature',
        message: 'Request signature validation failed'
      });
    }

    next();
  };
}

/**
 * Suspicious request pattern detection
 */
export function detectSuspiciousPatterns() {
  const suspiciousPatterns = [
    /\b(union|select|insert|delete|drop|alter|exec|script)\b/i,
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/i,
    /on\w+\s*=/i,
    /\beval\s*\(/i,
    /\bfunction\s*\(/i,
    /__proto__|constructor\.prototype/i
  ];

  return (req: Request, res: Response, next: NextFunction) => {
    const requestData = JSON.stringify({
      query: req.query,
      body: req.body,
      params: req.params
    });

    const suspiciousActivity = suspiciousPatterns.some(pattern => 
      pattern.test(requestData)
    );

    if (suspiciousActivity) {
      console.error('[API Security] Suspicious request pattern detected:', {
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
        data: requestData.substring(0, 500) // Log first 500 chars
      });

      return res.status(400).json({
        error: 'Suspicious request detected',
        message: 'Request contains potentially malicious patterns'
      });
    }

    next();
  };
}

/**
 * Request ID generation for tracing
 */
export function generateRequestId() {
  return (req: Request, res: Response, next: NextFunction) => {
    const requestId = crypto.randomBytes(16).toString('hex');
    
    // Add to request
    (req as any).requestId = requestId;
    
    // Add to response headers
    res.setHeader('X-Request-ID', requestId);
    
    next();
  };
}

/**
 * Security headers for API responses
 */
export function apiSecurityHeaders() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Prevent caching of sensitive API responses
    if (req.path.includes('/admin') || 
        req.path.includes('/auth') ||
        req.path.includes('/payment')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }

    // Content type options
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Frame options for API responses
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Cross-origin policies
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    
    next();
  };
}

/**
 * Comprehensive API security middleware factory
 */
export function createApiSecurityMiddleware(config: Partial<SecurityConfig> = {}) {
  const mergedConfig = { ...defaultSecurityConfig, ...config };
  
  return [
    generateRequestId(),
    requestSizeLimit(mergedConfig.maxRequestSize),
    requestComplexityLimit(mergedConfig.maxComplexity),
    validateContentType(),
    apiVersioning(),
    detectSuspiciousPatterns(),
    apiSecurityHeaders()
  ];
}

// Export individual middlewares and factory
export default {
  requestSizeLimit,
  requestComplexityLimit,
  validateContentType,
  apiVersioning,
  validateRequestSignature,
  detectSuspiciousPatterns,
  generateRequestId,
  apiSecurityHeaders,
  createApiSecurityMiddleware
};