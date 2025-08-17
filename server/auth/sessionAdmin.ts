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
  cookie: {
    httpOnly: true,
    sameSite: 'strict' as const,
    path: '/', // Changed from '/admin' to '/' so cookie is sent to all admin-related endpoints
    secure: false, // Will be set dynamically based on HTTPS
    maxAge: 4 * 60 * 60 * 1000, // 4 hours for admin sessions
  },
  store: ENV.isProd ? new PgSession({
    tableName: 'session_admins',
    conString: ENV.DATABASE_URL,
    ttl: 4 * 60 * 60, // 4 hours in seconds
  }) : undefined, // Use memory store in development
});

' : 'Memory',
  ttl: '4 hours',
  path: '/', // Fixed to reflect actual configuration
});