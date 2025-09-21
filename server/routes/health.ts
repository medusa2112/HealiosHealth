import { Router } from 'express';

const router = Router();

// Comprehensive auth status check (richer than cookie-only check)
router.get('/health/auth', (req, res) => {
  // Set no-cache headers for health checks
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  const authStatus = {
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    auth: {
      legacyLoginDisabled: process.env.ENABLE_LEGACY_LOGIN !== 'true',
      csrfDevBypass: process.env.CSRF_DEV_BYPASS === 'true',
      admin2FAEnabled: process.env.ADMIN_2FA_ENABLED === 'true',
      sessionsConfigured: {
        customer: !!process.env.SESSION_SECRET_CUSTOMER,
        admin: !!process.env.SESSION_SECRET_ADMIN,
      },
      cookieConfig: {
        secure: process.env.NODE_ENV === 'production',
        customerPath: '/',
        adminPath: '/admin',
      },
      originsConfigured: process.env.NODE_ENV === 'production' 
        ? !!process.env.PROD_ORIGINS 
        : true,
      // Include cookie presence for comprehensive status
      cookieStatus: {
        custCookie: req.cookies?.['hh_cust_sess'] ? 'present' : 'absent',
        adminCookie: req.cookies?.['hh_admin_sess'] ? 'present' : 'absent',
        legacyCookie: req.cookies?.['healios.sid'] ? 'present' : 'absent'
      }
    }
  };
  
  // In production, ensure all security settings are correct
  if (process.env.NODE_ENV === 'production') {
    const issues = [];
    
    if (process.env.ENABLE_LEGACY_LOGIN === 'true') {
      issues.push('Legacy login must be disabled in production');
    }
    
    if (process.env.CSRF_DEV_BYPASS === 'true') {
      issues.push('CSRF dev bypass must be disabled in production');
    }
    
    if (!process.env.SESSION_SECRET_CUSTOMER || !process.env.SESSION_SECRET_ADMIN) {
      issues.push('Session secrets must be configured');
    }
    
    if (issues.length > 0) {
      return res.status(500).json({
        ...authStatus,
        status: 'unhealthy',
        issues
      });
    }
  }
  
  res.json({
    ...authStatus,
    status: 'healthy'
  });
});

// Basic health check with no-cache headers
router.get('/health', (req, res) => {
  // Set no-cache headers for health checks
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

export default router;