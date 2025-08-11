import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { db } from '../db';
import { admins } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../lib/logger';
import { ENV } from '../config/env';

const router = Router();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  totp: z.string().optional(), // For 2FA if enabled
});

// Admin Login - POST /api/auth/admin/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, totp } = loginSchema.parse(req.body);
    
    logger.info('ADMIN_AUTH', 'Login attempt', { email });
    
    // Get admin from database
    const [admin] = await db
      .select()
      .from(admins)
      .where(eq(admins.email, email))
      .limit(1);
    
    if (!admin) {
      logger.warn('ADMIN_AUTH', 'Login failed - admin not found', { email });
      return res.status(401).json({ 
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    // Check if admin is active
    if (!admin.active) {
      logger.warn('ADMIN_AUTH', 'Login failed - admin inactive', { email });
      return res.status(403).json({ 
        error: 'Account disabled',
        code: 'ACCOUNT_DISABLED'
      });
    }
    
    // Verify password
    const validPassword = await bcrypt.compare(password, admin.passwordHash);
    
    if (!validPassword) {
      logger.warn('ADMIN_AUTH', 'Login failed - invalid password', { email });
      return res.status(401).json({ 
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    // Check 2FA if enabled
    if (ENV.ADMIN_2FA_ENABLED && admin.totpSecret) {
      if (!totp) {
        return res.status(401).json({ 
          error: '2FA code required',
          code: 'TOTP_REQUIRED'
        });
      }
      
      // TODO: Verify TOTP code
      // For now, just log it
      logger.info('ADMIN_AUTH', '2FA verification would happen here', { email, totp });
    }
    
    // Update last login timestamp
    await db
      .update(admins)
      .set({ lastLoginAt: new Date() })
      .where(eq(admins.id, admin.id));
    
    // Create admin session
    req.session.adminId = admin.id;
    req.session.email = admin.email;
    req.session.role = 'admin';
    
    logger.info('ADMIN_AUTH', 'Login successful', { 
      adminId: admin.id, 
      email: admin.email 
    });
    
    // Return admin data (without sensitive fields)
    const { passwordHash: _, totpSecret: __, ...adminData } = admin;
    res.json({ 
      message: 'Admin login successful',
      admin: adminData 
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid request data',
        details: error.errors 
      });
    }
    
    logger.error('ADMIN_AUTH', 'Login error', { error });
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'LOGIN_ERROR'
    });
  }
});

// Admin Logout - POST /api/auth/admin/logout
router.post('/logout', async (req, res) => {
  const adminId = req.session?.adminId;
  const email = req.session?.email;
  
  if (adminId) {
    logger.info('ADMIN_AUTH', 'Logout', { adminId, email });
  }
  
  // Destroy session
  req.session.destroy((err) => {
    if (err) {
      logger.error('ADMIN_AUTH', 'Session destroy error', { error: err });
    }
    
    // Clear admin session cookie
    res.clearCookie('hh_admin_sess', {
      httpOnly: true,
      sameSite: 'strict',
      path: '/admin',
    });
    
    res.json({ message: 'Admin logged out successfully' });
  });
});

// Admin Session Check - GET /api/auth/admin/me
router.get('/me', async (req, res) => {
  const adminId = req.session?.adminId;
  
  if (!adminId) {
    return res.status(401).json({ 
      error: 'Not authenticated',
      code: 'NO_SESSION'
    });
  }
  
  try {
    const [admin] = await db
      .select()
      .from(admins)
      .where(eq(admins.id, adminId))
      .limit(1);
    
    if (!admin || !admin.active) {
      // Session exists but admin not found or inactive - clear invalid session
      req.session.destroy(() => {});
      return res.status(401).json({ 
        error: 'Session invalid',
        code: 'INVALID_SESSION'
      });
    }
    
    // Return admin data (without sensitive fields)
    const { passwordHash: _, totpSecret: __, ...adminData } = admin;
    res.json({ admin: adminData });
    
  } catch (error) {
    logger.error('ADMIN_AUTH', 'Session check error', { error });
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'SESSION_CHECK_ERROR'
    });
  }
});

// Admin Password Change - POST /api/auth/admin/change-password
router.post('/change-password', async (req, res) => {
  const adminId = req.session?.adminId;
  
  if (!adminId) {
    return res.status(401).json({ 
      error: 'Not authenticated',
      code: 'NO_SESSION'
    });
  }
  
  const changePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(100),
  });
  
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    
    // Get admin from database
    const [admin] = await db
      .select()
      .from(admins)
      .where(eq(admins.id, adminId))
      .limit(1);
    
    if (!admin) {
      return res.status(401).json({ 
        error: 'Session invalid',
        code: 'INVALID_SESSION'
      });
    }
    
    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, admin.passwordHash);
    
    if (!validPassword) {
      logger.warn('ADMIN_AUTH', 'Password change failed - invalid current password', { 
        adminId,
        email: admin.email 
      });
      return res.status(401).json({ 
        error: 'Current password is incorrect',
        code: 'INVALID_PASSWORD'
      });
    }
    
    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await db
      .update(admins)
      .set({ passwordHash: newPasswordHash })
      .where(eq(admins.id, adminId));
    
    logger.info('ADMIN_AUTH', 'Password changed successfully', { 
      adminId,
      email: admin.email 
    });
    
    res.json({ message: 'Password changed successfully' });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid request data',
        details: error.errors 
      });
    }
    
    logger.error('ADMIN_AUTH', 'Password change error', { error });
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'PASSWORD_CHANGE_ERROR'
    });
  }
});

export const adminAuthRouter = router;