import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { ENV } from '../config/env';

const PgSession = connectPgSimple(session);

export const customerSession = session({
  name: 'hh_cust_sess',
  secret: ENV.SESSION_SECRET_CUSTOMER,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  proxy: ENV.isProd, // Trust the proxy in production (for proper secure cookie handling)
  cookie: {
    httpOnly: true, // Prevent XSS attacks
    sameSite: 'lax' as const, // Lax for customer sessions (allows navigation from external sites)
    path: '/',
    secure: ENV.isProd, // HTTPS only in production
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days for customer convenience
    domain: undefined, // Let browser handle domain
  },
  store: ENV.isProd ? new PgSession({
    tableName: 'session_customers',
    conString: ENV.DATABASE_URL,
    ttl: 7 * 24 * 60 * 60, // 7 days in seconds
    createTableIfMissing: true, // Ensure table exists
  }) : undefined, // Use memory store in development
});

' : 'Memory',
  ttl: '7 days',
});