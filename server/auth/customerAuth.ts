import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { storage } from '../storage';
import { logger } from '../lib/logger';
import { ENV } from '../config/env';
import { authLimiter, registrationLimiter } from '../middleware/rate-limiter';

const router = Router();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
});

// Customer Login - POST /api/auth/customer/login (with rate limiting)
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    logger.info('CUSTOMER_AUTH', 'Login attempt', { email });
    
    // Get user from database
    const user = await storage.getUserByEmail(email);
    
    if (!user) {
      logger.warn('CUSTOMER_AUTH', 'Login failed - user not found', { email });
      return res.status(401).json({ 
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    // Check if user is customer (not admin)
    if (user.role === 'admin') {
      logger.warn('CUSTOMER_AUTH', 'Admin tried to use customer login', { email });
      return res.status(403).json({ 
        error: 'Please use admin login',
        code: 'WRONG_LOGIN_TYPE'
      });
    }
    
    // Verify password
    const validPassword = await bcrypt.compare(password, user.password || '');
    
    if (!validPassword) {
      logger.warn('CUSTOMER_AUTH', 'Login failed - invalid password', { email });
      return res.status(401).json({ 
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    // Create customer session
    req.session.userId = user.id;
    req.session.email = user.email;
    req.session.role = user.role;
    
    logger.info('CUSTOMER_AUTH', 'Login successful', { 
      userId: user.id, 
      email: user.email,
      role: user.role 
    });
    
    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    res.json({ 
      message: 'Login successful',
      user: userWithoutPassword 
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid request data',
        details: error.errors 
      });
    }
    
    logger.error('CUSTOMER_AUTH', 'Login error', { error });
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'LOGIN_ERROR'
    });
  }
});

// Customer Register - POST /api/auth/customer/register (with rate limiting)
router.post('/register', registrationLimiter, async (req, res) => {
  try {
    const { email, password, firstName, lastName } = registerSchema.parse(req.body);
    
    logger.info('CUSTOMER_AUTH', 'Registration attempt', { email });
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    
    if (existingUser) {
      logger.warn('CUSTOMER_AUTH', 'Registration failed - email exists', { email });
      return res.status(409).json({ 
        error: 'Email already registered',
        code: 'EMAIL_EXISTS'
      });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user with customer role
    const newUser = await storage.createUser({
      email,
      password: passwordHash,
      firstName,
      lastName,
      role: 'customer', // Always create as customer through this route
      emailVerified: new Date().toISOString(), // Mark as verified for now (can add email verification later)
    });
    
    // Create customer session
    req.session.userId = newUser.id;
    req.session.email = newUser.email;
    req.session.role = newUser.role;
    
    logger.info('CUSTOMER_AUTH', 'Registration successful', { 
      userId: newUser.id,
      email: newUser.email 
    });
    
    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ 
      message: 'Registration successful',
      user: userWithoutPassword 
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid request data',
        details: error.errors 
      });
    }
    
    logger.error('CUSTOMER_AUTH', 'Registration error', { error });
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'REGISTRATION_ERROR'
    });
  }
});

// Customer Logout - POST /api/auth/customer/logout
router.post('/logout', async (req, res) => {
  const userId = req.session?.userId;
  const email = req.session?.email;
  
  if (userId) {
    logger.info('CUSTOMER_AUTH', 'Logout', { userId, email });
  }
  
  // Destroy session
  req.session.destroy((err) => {
    if (err) {
      logger.error('CUSTOMER_AUTH', 'Session destroy error', { error: err });
    }
    
    // Clear customer session cookie
    res.clearCookie('hh_cust_sess', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });
    
    res.json({ message: 'Logged out successfully' });
  });
});

// Customer Session Check - GET /api/auth/customer/me
router.get('/me', async (req, res) => {
  const userId = req.session?.userId;
  
  if (!userId) {
    return res.status(401).json({ 
      error: 'Not authenticated',
      code: 'NO_SESSION'
    });
  }
  
  try {
    const user = await storage.getUserById(userId);
    
    if (!user) {
      // Session exists but user not found - clear invalid session
      req.session.destroy(() => {});
      return res.status(401).json({ 
        error: 'Session invalid',
        code: 'INVALID_SESSION'
      });
    }
    
    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
    
  } catch (error) {
    logger.error('CUSTOMER_AUTH', 'Session check error', { error });
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'SESSION_CHECK_ERROR'
    });
  }
});

export const customerAuthRouter = router;