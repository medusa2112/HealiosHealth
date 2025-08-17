import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { ENV } from '../config/env';

const PgSession = connectPgSimple(session);

export const adminSession = session({
  name: 'hh_admin_sess',
  secret: ENV.SESSION_SECRET_ADMIN,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  proxy: ENV.isProd, // Trust the proxy in production (for proper secure cookie handling)
  cookie: {
    httpOnly: true, // Prevent XSS attacks
    sameSite: 'strict' as const, // Strict CSRF protection for admin
    path: '/', // Available to all endpoints
    secure: ENV.isProd, // HTTPS only in production
    maxAge: 2 * 60 * 60 * 1000, // Reduced to 2 hours for admin sessions (more secure)
    domain: undefined, // Let browser handle domain
  },
  store: ENV.isProd ? new PgSession({
    tableName: 'session_admins',
    conString: ENV.DATABASE_URL,
    ttl: 2 * 60 * 60, // 2 hours in seconds (matching cookie maxAge)
    createTableIfMissing: true, // Ensure table exists
  }) : undefined, // Use memory store in development
});

' : 'Memory',
  ttl: '4 hours',
  path: '/', // Fixed to reflect actual configuration
});