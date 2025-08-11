import cors from 'cors';
import { ENV } from '../config/env';

// No wildcard origins with credentials
const getAllowedOrigins = () => {
  const origins = ENV.isProd ? ENV.PROD_ORIGINS : ENV.DEV_ORIGINS;
  console.log('[CORS] Allowed origins:', origins);
  return origins;
};

export const corsMw = cors({
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow requests with no origin (same-origin, server-to-server)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Block disallowed origins
    console.log('[CORS] Blocked origin:', origin);
    callback(new Error(`CORS policy: Origin ${origin} not allowed`));
  },
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 hours
});