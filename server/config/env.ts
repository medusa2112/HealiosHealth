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
  // Environment validation failed - check configuration
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
  PROD_ORIGINS: (parsed.data?.PROD_ORIGINS ?? 'https://healios-health-dominic96.replit.app').split(',').filter(Boolean),
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

// Configuration loaded successfully - sensitive details not logged for security