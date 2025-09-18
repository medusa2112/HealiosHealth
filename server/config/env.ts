import * as z from 'zod';
import { fromZodError } from 'zod-validation-error';

// Comprehensive environment variable schema
const schema = z.object({
  // Core application configuration
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url(),
  PORT: z.string().default('5000'),
  
  // Session management (with backward compatibility)
  SESSION_SECRET: z.string().min(32), // Fallback for both customer and admin sessions
  SESSION_SECRET_CUSTOMER: z.string().min(32).optional(), // Preferred for customer sessions
  SESSION_SECRET_ADMIN: z.string().min(32).optional(), // Preferred for admin sessions
  
  // Required configuration (new)
  PAYSTACK_SECRET: z.string().min(10, 'PAYSTACK_SECRET must be at least 10 characters'),
  ADMIN_EMAILS: z.string().min(1, 'ADMIN_EMAILS is required').transform((val) => 
    val.split(',').map(email => email.trim()).filter(Boolean)
  ),
  PUBLIC_BASE_URL: z.string().url('PUBLIC_BASE_URL must be a valid URL'),
  
  // Payment providers (maintain backward compatibility)
  PAYSTACK_SECRET_KEY: z.string().optional(), // Legacy support
  
  // Email services (optional)
  RESEND_API_KEY: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),
  
  // Google Maps API (optional - multiple key names for compatibility)
  GOOGLE_MAPS_BROWSER_KEY: z.string().optional(),
  ENV_GOOGLE_MAPS_API_KEY: z.string().optional(),
  
  // AI Services (optional)
  OPENAI_API_KEY: z.string().optional(),
  PERPLEXITY_API_KEY: z.string().optional(),
  
  // CORS and security
  PROD_ORIGINS: z.string().optional(), // csv
  DEV_ORIGINS: z.string().optional(),  // csv
  ADMIN_IP_ALLOWLIST: z.string().optional(), // csv
  ADMIN_2FA_ENABLED: z.enum(['true', 'false']).default('false'),
  
  // Replit specific
  REPLIT_DOMAINS: z.string().optional(),
  REPLIT_SIDECAR_ENDPOINT: z.string().optional(),
  ISSUER_URL: z.string().optional(),
  REPL_ID: z.string().optional(),
  
  // Development and security flags (optional but validated)
  CSRF_DEV_BYPASS: z.enum(['true', 'false']).optional(),
  ENABLE_LEGACY_LOGIN: z.enum(['true', 'false']).optional(),
  DISABLE_AUTH: z.enum(['true', 'false']).optional(),
  DEBUG_MODE: z.enum(['true', 'false']).optional(),
  DISABLE_RATE_LIMIT: z.enum(['true', 'false']).optional(),
}).refine((data) => {
  // Ensure PAYSTACK_SECRET is provided (with backward compatibility)
  if (!data.PAYSTACK_SECRET && !data.PAYSTACK_SECRET_KEY) {
    return false;
  }
  return true;
}, {
  message: 'Either PAYSTACK_SECRET or PAYSTACK_SECRET_KEY must be provided',
  path: ['PAYSTACK_SECRET']
}).refine((data) => {
  // Ensure different session secrets if both are explicitly provided
  if (data.SESSION_SECRET_CUSTOMER && data.SESSION_SECRET_ADMIN && 
      data.SESSION_SECRET_CUSTOMER === data.SESSION_SECRET_ADMIN) {
    return false;
  }
  return true;
}, {
  message: 'SESSION_SECRET_CUSTOMER and SESSION_SECRET_ADMIN must be different if both are provided',
  path: ['SESSION_SECRET_CUSTOMER', 'SESSION_SECRET_ADMIN']
});

// Enhanced validation with fail-fast for ALL environments and pretty error messages
const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const validationError = fromZodError(parsed.error);
  console.error('\n' + '='.repeat(80));
  console.error('❌ CONFIGURATION VALIDATION FAILED');
  console.error('='.repeat(80));
  console.error('\nThe following environment configuration issues were found:');
  console.error('\n' + validationError.message);
  console.error('\n' + '='.repeat(80));
  console.error('🛠️  Please check your environment variables and try again.');
  console.error('='.repeat(80) + '\n');
  
  // Fail fast for ALL environments (not just production)
  process.exit(1);
}

// Get validated configuration data
const config = parsed.data!; // Safe to use ! since we've already validated

// Get Replit domains
const replitDomains = config.REPLIT_DOMAINS ? 
  config.REPLIT_DOMAINS.split(',').map(d => `https://${d}`) : [];

// Helper to get session secret with fallback
const getSessionSecret = (specific: string | undefined, fallback: string) => {
  return specific || fallback;
};

// Enhanced ENV configuration with all validated variables
export const ENV = {
  // Core application
  NODE_ENV: config.NODE_ENV,
  DATABASE_URL: config.DATABASE_URL,
  PORT: config.PORT,
  
  // Session management
  SESSION_SECRET: config.SESSION_SECRET,
  SESSION_SECRET_CUSTOMER: getSessionSecret(config.SESSION_SECRET_CUSTOMER, config.SESSION_SECRET),
  SESSION_SECRET_ADMIN: getSessionSecret(config.SESSION_SECRET_ADMIN, config.SESSION_SECRET),
  
  // Required configuration (new)
  PAYSTACK_SECRET: config.PAYSTACK_SECRET || config.PAYSTACK_SECRET_KEY!, // Backward compatibility
  ADMIN_EMAILS: config.ADMIN_EMAILS, // Already transformed to array by Zod
  PUBLIC_BASE_URL: config.PUBLIC_BASE_URL,
  
  // Payment providers
  PAYSTACK_SECRET_KEY: config.PAYSTACK_SECRET_KEY, // Legacy support
  
  // Email services
  RESEND_API_KEY: config.RESEND_API_KEY,
  SENDGRID_API_KEY: config.SENDGRID_API_KEY,
  
  // Google Maps API (prefer GOOGLE_MAPS_BROWSER_KEY, fallback to ENV_GOOGLE_MAPS_API_KEY)
  GOOGLE_MAPS_BROWSER_KEY: config.GOOGLE_MAPS_BROWSER_KEY || config.ENV_GOOGLE_MAPS_API_KEY,
  ENV_GOOGLE_MAPS_API_KEY: config.ENV_GOOGLE_MAPS_API_KEY, // Keep for backward compatibility
  
  // AI Services
  OPENAI_API_KEY: config.OPENAI_API_KEY,
  PERPLEXITY_API_KEY: config.PERPLEXITY_API_KEY,
  
  // CORS and security
  PROD_ORIGINS: (config.PROD_ORIGINS ?? 'https://healios-health-dominic96.replit.app').split(',').filter(Boolean),
  DEV_ORIGINS: [
    ...((config.DEV_ORIGINS ?? 'http://localhost:5000,http://127.0.0.1:5000').split(',').filter(Boolean)),
    ...replitDomains // Include Replit domains in development
  ],
  ADMIN_IP_ALLOWLIST: (config.ADMIN_IP_ALLOWLIST ?? '').split(',').filter(Boolean),
  ADMIN_2FA_ENABLED: config.ADMIN_2FA_ENABLED === 'true',
  
  // Replit specific
  REPLIT_DOMAINS: config.REPLIT_DOMAINS,
  REPLIT_SIDECAR_ENDPOINT: config.REPLIT_SIDECAR_ENDPOINT,
  ISSUER_URL: config.ISSUER_URL,
  REPL_ID: config.REPL_ID,
  
  // Development and security flags
  CSRF_DEV_BYPASS: config.CSRF_DEV_BYPASS === 'true',
  ENABLE_LEGACY_LOGIN: config.ENABLE_LEGACY_LOGIN === 'true',
  DISABLE_AUTH: config.DISABLE_AUTH === 'true',
  DEBUG_MODE: config.DEBUG_MODE === 'true',
  DISABLE_RATE_LIMIT: config.DISABLE_RATE_LIMIT === 'true',
  
  // Environment helpers
  isProd: config.NODE_ENV === 'production',
  isDev: config.NODE_ENV === 'development',
  isTest: config.NODE_ENV === 'test',
};

// Log successful configuration load (without sensitive values)
console.log('✅ Configuration validation successful');
console.log(`📋 Environment: ${ENV.NODE_ENV}`);
console.log(`🔌 Port: ${ENV.PORT}`);
console.log(`📧 Admin emails: ${ENV.ADMIN_EMAILS.length} configured`);
console.log(`🌐 Base URL: ${ENV.PUBLIC_BASE_URL}`);
console.log(`💰 Payment provider: ${ENV.PAYSTACK_SECRET ? 'Configured' : 'Not configured'}`);
console.log(`📬 Email service: ${ENV.RESEND_API_KEY ? 'Resend' : ENV.SENDGRID_API_KEY ? 'SendGrid' : 'None'}`);
console.log(`🗺️  Google Maps: ${ENV.GOOGLE_MAPS_BROWSER_KEY ? 'Configured' : 'Not configured'}`);

// Export type for the configuration
export type ConfigType = typeof ENV;