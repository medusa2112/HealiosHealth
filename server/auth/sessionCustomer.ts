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
  cookie: {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    secure: false, // Will be set dynamically based on HTTPS
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  store: ENV.isProd ? new PgSession({
    tableName: 'session_customers',
    conString: ENV.DATABASE_URL,
    ttl: 7 * 24 * 60 * 60, // 7 days in seconds
  }) : undefined, // Use memory store in development
});

console.log('[CUSTOMER SESSION] Configured with:', {
  cookie: 'hh_cust_sess',
  store: ENV.isProd ? 'PostgreSQL (session_customers)' : 'Memory',
  ttl: '7 days',
});