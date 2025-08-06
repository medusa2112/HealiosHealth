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
      
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const user = await storage.getUserById(userId);
      
      if (!user || !roles.includes(user.role as 'admin' | 'customer' | 'guest')) {
        // Log unauthorized access attempt
        if (user) {
          await SecurityLogger.logRoleEscalationAttempt(req, user.role, roles.join('|'));
        } else {
          await SecurityLogger.logUnauthorizedAccess(req, roles.join('|'));
        }
        return res.status(403).json({ message: 'Access denied' });
      }
      
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
  const adminEmails = getAdminEmails();
  // Check for admin email patterns - exact match or pattern based
  const isAdminEmail = email === 'admin@healios.com' ||
                      email === 'admin@test.com' ||
                      email.includes('admin@') ||
                      adminEmails.includes(email);
  
  return isAdminEmail ? 'admin' : 'customer';
};