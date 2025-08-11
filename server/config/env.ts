import * as z from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url(),
  SESSION_SECRET: z.string().min(32), // Fallback for both customer and admin sessions
  SESSION_SECRET_CUSTOMER: z.string().min(32).optional(), // Preferred for customer sessions
  SESSION_SECRET_ADMIN: z.string().min(32).optional(), // Preferred for admin sessions
  PROD_ORIGINS: z.string().optional(), // csv
  DEV_ORIGINS: z.string().optional(),  // csv
  ADMIN_IP_ALLOWLIST: z.string().optional(), // csv
  ADMIN_2FA_ENABLED: z.enum(['true', 'false']).default('false'),
  PORT: z.string().default('5000'),
  ADM_PW: z.string().optional(), // Existing admin password
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('[ENV] Validation failed:', parsed.error.flatten());
  // In development, use defaults; in production, fail
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

// Get Replit domains
const replitDomains = process.env.REPLIT_DOMAINS ? 
  process.env.REPLIT_DOMAINS.split(',').map(d => `https://${d}`) : [];

// Helper to get session secret with fallback
const getSessionSecret = (specific: string | undefined, fallback: string) => {
  return specific || fallback;
};

export const ENV = {
  NODE_ENV: parsed.data?.NODE_ENV || 'development',
  DATABASE_URL: parsed.data?.DATABASE_URL || process.env.DATABASE_URL!,
  SESSION_SECRET: parsed.data?.SESSION_SECRET || process.env.SESSION_SECRET!,
  SESSION_SECRET_CUSTOMER: getSessionSecret(
    parsed.data?.SESSION_SECRET_CUSTOMER || process.env.SESSION_SECRET_CUSTOMER,
    parsed.data?.SESSION_SECRET || process.env.SESSION_SECRET!
  ),
  SESSION_SECRET_ADMIN: getSessionSecret(
    parsed.data?.SESSION_SECRET_ADMIN || process.env.SESSION_SECRET_ADMIN,
    parsed.data?.SESSION_SECRET || process.env.SESSION_SECRET!
  ),
  PROD_ORIGINS: (parsed.data?.PROD_ORIGINS ?? 'https://thehealios.com,https://www.thehealios.com').split(',').filter(Boolean),
  DEV_ORIGINS: [
    ...((parsed.data?.DEV_ORIGINS ?? 'http://localhost:5000,http://127.0.0.1:5000').split(',').filter(Boolean)),
    ...replitDomains // Include Replit domains in development
  ],
  ADMIN_IP_ALLOWLIST: (parsed.data?.ADMIN_IP_ALLOWLIST ?? '').split(',').filter(Boolean),
  ADMIN_2FA_ENABLED: parsed.data?.ADMIN_2FA_ENABLED === 'true',
  PORT: parsed.data?.PORT || '5000',
  ADM_PW: parsed.data?.ADM_PW || process.env.ADM_PW,
  isProd: (parsed.data?.NODE_ENV || process.env.NODE_ENV) === 'production',
  isDev: (parsed.data?.NODE_ENV || process.env.NODE_ENV) === 'development',
};

console.log('[ENV] Configuration loaded:', {
  NODE_ENV: ENV.NODE_ENV,
  isProd: ENV.isProd,
  isDev: ENV.isDev,
  ADMIN_2FA_ENABLED: ENV.ADMIN_2FA_ENABLED,
  ADMIN_IP_ALLOWLIST: ENV.ADMIN_IP_ALLOWLIST.length > 0 ? `${ENV.ADMIN_IP_ALLOWLIST.length} IPs` : 'none',
  PROD_ORIGINS: ENV.PROD_ORIGINS.length,
  DEV_ORIGINS: ENV.DEV_ORIGINS.length,
  SESSION_SECRETS: {
    customer: process.env.SESSION_SECRET_CUSTOMER ? 'explicit' : 'fallback',
    admin: process.env.SESSION_SECRET_ADMIN ? 'explicit' : 'fallback',
    customerLength: ENV.SESSION_SECRET_CUSTOMER?.length || 0,
    adminLength: ENV.SESSION_SECRET_ADMIN?.length || 0,
    different: ENV.SESSION_SECRET_CUSTOMER !== ENV.SESSION_SECRET_ADMIN
  }
});