/**
 * Admin Configuration
 * Controls admin panel availability based on environment
 */

export const ADMIN_CONFIG = {
  // Admin is only enabled in development and staging, never in production
  enabled: process.env.ADMIN_ENABLED === 'true' || 
           (process.env.NODE_ENV === 'development' && process.env.ADMIN_ENABLED !== 'false'),
  
  // IP allowlist for admin access (comma-separated list)
  ipAllowlist: process.env.ADMIN_IP_ALLOWLIST?.split(',').map(ip => ip.trim()) || [],
  
  // Rate limiting for admin routes
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 5 : 100, // 5 requests in production, 100 in dev
  },
  
  // Audit logging
  auditLog: process.env.ADMIN_AUDIT_LOG === 'true' || process.env.NODE_ENV !== 'development',
  
  // Session configuration
  session: {
    secret: process.env.ADMIN_SESSION_SECRET || process.env.SESSION_SECRET_ADMIN,
    maxAge: 4 * 60 * 60 * 1000, // 4 hours
  }
};

// Fail fast in production if admin is accidentally enabled
if (process.env.NODE_ENV === 'production' && ADMIN_CONFIG.enabled) {
  
  process.exit(1);
}

// Log configuration for transparency
