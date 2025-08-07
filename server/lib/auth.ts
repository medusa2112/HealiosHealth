import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { SecurityLogger } from './security-logger';
import type { User } from '@shared/schema';

// Extend Express Request to include user and session
declare global {
  namespace Express {
    interface Request {
      user?: User;
      session?: {
        userId?: string;
        [key: string]: any;
      };
    }
  }
}

export const protectRoute = (roles: ('admin' | 'customer' | 'guest')[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get user from session (assuming session-based auth)
      const userId = req.session?.userId;
      
      console.log(`[PROTECT_ROUTE] Checking access for roles [${roles.join(', ')}], userId: ${userId}`);
      
      if (!userId) {
        console.log('[PROTECT_ROUTE] No userId in session');
        return res.status(401).json({ message: 'Authentication required' });
      }

      const user = await storage.getUserById(userId);
      
      if (!user) {
        console.log(`[PROTECT_ROUTE] User not found for userId: ${userId}`);
        return res.status(401).json({ message: 'User not found' });
      }
      
      console.log(`[PROTECT_ROUTE] Found user: ${user.email}, role: ${user.role}`);
      
      if (!roles.includes(user.role as 'admin' | 'customer' | 'guest')) {
        console.log(`[PROTECT_ROUTE] Access denied - User role '${user.role}' not in allowed roles [${roles.join(', ')}]`);
        return res.status(403).json({ message: 'Access denied' });
      }
      
      console.log(`[PROTECT_ROUTE] Access granted for ${user.email} (${user.role})`);
      req.user = user;
      next();
    } catch (err) {
      console.error('Auth error:', err);
      return res.status(401).json({ message: 'Authentication failed' });
    }
  };
};

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await storage.getUserById(userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid session' });
    }
    
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

export const checkRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

// Helper function to get admin emails from env
export const getAdminEmails = (): string[] => {
  const adminEmailsEnv = process.env.ALLOWED_ADMIN_EMAILS || '';
  return adminEmailsEnv.split(',').map(email => email.trim()).filter(email => email.length > 0);
};

// Helper function to determine role based on email
export const determineUserRole = (email: string): 'admin' | 'customer' => {
  // Only dn@thefourths.com is admin
  const isAdminEmail = email === 'dn@thefourths.com';
  
  return isAdminEmail ? 'admin' : 'customer';
};