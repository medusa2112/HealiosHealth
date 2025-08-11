// Production configuration defaults
// These MUST be enforced in production to prevent security vulnerabilities

export function enforceProductionDefaults() {
  const isProd = process.env.NODE_ENV === 'production';
  
  if (isProd) {
    // Enforce critical production settings
    const requiredEnvVars = {
      'SESSION_SECRET_CUSTOMER': process.env.SESSION_SECRET_CUSTOMER,
      'SESSION_SECRET_ADMIN': process.env.SESSION_SECRET_ADMIN,
    };
    
    // Check for required secrets
    for (const [key, value] of Object.entries(requiredEnvVars)) {
      if (!value || value.length < 32) {
        throw new Error(`Production requires ${key} to be at least 32 characters`);
      }
    }
    
    // Disable legacy auth
    if (process.env.ENABLE_LEGACY_LOGIN === 'true') {
      throw new Error('ENABLE_LEGACY_LOGIN must be false in production');
    }
    
    // Ensure CSRF dev bypass is never enabled in production
    if (process.env.CSRF_DEV_BYPASS === 'true') {
      throw new Error('CSRF_DEV_BYPASS must never be true in production');
    }
    
    // Log production configuration (without sensitive values)
    console.log('[PRODUCTION] Configuration validated:');
    console.log('  - NODE_ENV: production');
    console.log('  - Legacy login: disabled');
    console.log('  - CSRF dev bypass: disabled');
    console.log('  - Session secrets: configured');
    console.log('  - Admin 2FA:', process.env.ADMIN_2FA_ENABLED === 'true' ? 'enabled' : 'disabled');
    
    // Set production defaults if not explicitly set
    if (!process.env.PROD_ORIGINS) {
      process.env.PROD_ORIGINS = 'https://thehealios.com,https://www.thehealios.com';
    }
  }
}

// Cookie configuration for production
export function getCookieConfig(type: 'customer' | 'admin') {
  const isProd = process.env.NODE_ENV === 'production';
  
  if (type === 'customer') {
    return {
      name: 'hh_cust_sess',
      httpOnly: true,
      secure: isProd, // Always secure in production
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };
  } else {
    return {
      name: 'hh_admin_sess',
      httpOnly: true,
      secure: isProd, // Always secure in production
      sameSite: 'strict' as const,
      path: '/admin',
      maxAge: 4 * 60 * 60 * 1000, // 4 hours
    };
  }
}

// Log cookie attributes on startup for observability
export function logCookieAttributes() {
  const customerCookie = getCookieConfig('customer');
  const adminCookie = getCookieConfig('admin');
  
  console.log('[COOKIES] Configuration:');
  console.log(`  Customer: ${customerCookie.name}`);
  console.log(`    - Path: ${customerCookie.path}`);
  console.log(`    - SameSite: ${customerCookie.sameSite}`);
  console.log(`    - Secure: ${customerCookie.secure}`);
  console.log(`    - HttpOnly: ${customerCookie.httpOnly}`);
  console.log(`  Admin: ${adminCookie.name}`);
  console.log(`    - Path: ${adminCookie.path}`);
  console.log(`    - SameSite: ${adminCookie.sameSite}`);
  console.log(`    - Secure: ${adminCookie.secure}`);
  console.log(`    - HttpOnly: ${adminCookie.httpOnly}`);
}