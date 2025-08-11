/**
 * Production Configuration Enforcer
 * Fail-hard on missing required configuration in production
 */

interface RequiredConfig {
  name: string;
  value: string | undefined;
  fallback?: string;
  prodRequired: boolean;
}

export function enforceProductionConfig() {
  const isProduction = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';
  
  // Define required configuration
  const requiredConfigs: RequiredConfig[] = [
    {
      name: 'NODE_ENV',
      value: process.env.NODE_ENV,
      prodRequired: true
    },
    {
      name: 'SESSION_SECRET',
      value: process.env.SESSION_SECRET,
      prodRequired: true
    },
    {
      name: 'DATABASE_URL',
      value: process.env.DATABASE_URL,
      prodRequired: true
    }
  ];
  
  // Check for dangerous configurations in production
  const dangerousInProduction = [
    { name: 'CSRF_DEV_BYPASS', value: process.env.CSRF_DEV_BYPASS },
    { name: 'ENABLE_LEGACY_LOGIN', value: process.env.ENABLE_LEGACY_LOGIN },
    { name: 'DISABLE_AUTH', value: process.env.DISABLE_AUTH },
    { name: 'DEBUG_MODE', value: process.env.DEBUG_MODE }
  ];
  
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check required configs
  for (const config of requiredConfigs) {
    const effectiveValue = config.value || config.fallback;
    if (isProduction && config.prodRequired && !effectiveValue) {
      errors.push(`Missing required production config: ${config.name}`);
    }
  }
  
  // Check dangerous configs
  if (isProduction) {
    for (const config of dangerousInProduction) {
      if (config.value === 'true') {
        errors.push(`Dangerous configuration in production: ${config.name}=true`);
      }
    }
  }
  
  // Session secret strength check
  if (isProduction) {
    const customerSecret = process.env.SESSION_SECRET_CUSTOMER || process.env.SESSION_SECRET;
    const adminSecret = process.env.SESSION_SECRET_ADMIN || process.env.SESSION_SECRET;
    const fallbackSecret = process.env.SESSION_SECRET;
    
    if (customerSecret && customerSecret.length < 32) {
      errors.push('SESSION_SECRET_CUSTOMER must be at least 32 characters in production');
    }
    
    if (adminSecret && adminSecret.length < 32) {
      errors.push('SESSION_SECRET_ADMIN must be at least 32 characters in production');
    }
    
    // Only enforce different secrets if both are explicitly set
    if (process.env.SESSION_SECRET_CUSTOMER && 
        process.env.SESSION_SECRET_ADMIN && 
        customerSecret === adminSecret) {
      errors.push('SESSION_SECRET_CUSTOMER and SESSION_SECRET_ADMIN must be different');
    }
    
    // Warn if using fallback SECRET for both (security concern but not failure)
    if (!process.env.SESSION_SECRET_CUSTOMER && !process.env.SESSION_SECRET_ADMIN && fallbackSecret) {
      warnings.push('Using SESSION_SECRET for both customer and admin sessions. Consider setting separate SESSION_SECRET_CUSTOMER and SESSION_SECRET_ADMIN for better security.');
    }
  }
  
  // Check CORS origins
  if (isProduction && !process.env.PROD_ORIGINS) {
    warnings.push('PROD_ORIGINS not set - using default production origins');
  }
  
  // Log configuration status
  console.log('='.repeat(60));
  console.log('Configuration Status:');
  console.log(`Environment: ${process.env.NODE_ENV || 'not set'}`);
  console.log(`Legacy Login: ${process.env.ENABLE_LEGACY_LOGIN === 'true' ? 'ENABLED' : 'disabled'}`);
  console.log(`CSRF Dev Bypass: ${process.env.CSRF_DEV_BYPASS === 'true' ? 'ENABLED' : 'disabled'}`);
  const customerSecretStatus = process.env.SESSION_SECRET_CUSTOMER ? 'explicit' : (process.env.SESSION_SECRET ? 'fallback' : 'missing');
  const adminSecretStatus = process.env.SESSION_SECRET_ADMIN ? 'explicit' : (process.env.SESSION_SECRET ? 'fallback' : 'missing');
  console.log(`Session Secrets: ${customerSecretStatus} (customer), ${adminSecretStatus} (admin)`);
  console.log('='.repeat(60));
  
  // Handle errors
  if (errors.length > 0) {
    console.error('\n⚠️  CONFIGURATION ERRORS:');
    errors.forEach(error => console.error(`  ✗ ${error}`));
    
    if (isProduction && !isTest) {
      console.error('\nFailing hard in production due to configuration errors.');
      console.error('Please fix the above errors before deploying to production.\n');
      process.exit(1);
    } else {
      console.warn('\nConfiguration errors detected - would fail in production.\n');
    }
  }
  
  // Show warnings
  if (warnings.length > 0) {
    console.warn('\n⚠️  Configuration Warnings:');
    warnings.forEach(warning => console.warn(`  • ${warning}`));
  }
  
  return {
    errors,
    warnings,
    isValid: errors.length === 0
  };
}

/**
 * Get safe configuration with fallbacks
 */
export function getSafeConfig() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    isProduction,
    sessionSecrets: {
      customer: process.env.SESSION_SECRET_CUSTOMER || process.env.SESSION_SECRET,
      admin: process.env.SESSION_SECRET_ADMIN || process.env.SESSION_SECRET
    },
    cors: {
      origins: process.env.PROD_ORIGINS ? 
               process.env.PROD_ORIGINS.split(',') : 
               isProduction ? 
                 ['https://thehealios.com', 'https://www.thehealios.com'] : 
                 ['http://localhost:5000', 'http://127.0.0.1:5000']
    },
    security: {
      enableLegacyLogin: process.env.ENABLE_LEGACY_LOGIN === 'true',
      csrfDevBypass: !isProduction && process.env.CSRF_DEV_BYPASS === 'true',
      trustProxy: isProduction
    }
  };
}