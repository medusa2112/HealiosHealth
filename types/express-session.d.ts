import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId?: number;
    adminId?: number;
    email?: string;
    role?: string;
    lastActivity?: Date;
  }
}