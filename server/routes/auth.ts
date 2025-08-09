import express from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { storage } from '../storage';
import { setupAuth, isAuthenticated } from '../replitAuth';
import { determineUserRole, sanitizeUser } from '../lib/auth';
import { auditLogin, auditLogout } from '../lib/auditMiddleware';
import { hashPassword, verifyPassword, validatePassword } from '../lib/password';
import { insertUserSchema } from '@shared/schema';

const router = express.Router();

// Rate limiting for login endpoints to prevent brute force attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many login attempts from this IP, please try again after 15 minutes',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Get current user info - this is what the frontend /auth/me expects
router.get('/me', async (req, res) => {
  try {
    // Check if user is authenticated through Replit Auth or session
    const userId = req.session?.userId || (req.user as any)?.claims?.sub || (req.user as any)?.userId;
    
    console.log(`[AUTH_ME] Checking auth status for userId: ${userId}`);
    console.log(`[AUTH_ME] Session:`, req.session?.userId ? 'present' : 'missing');
    console.log(`[AUTH_ME] Passport user:`, req.user ? 'present' : 'missing');
    
    if (!userId) {
      console.log('[AUTH_ME] No authentication found');
      return res.json(null);
    }

    const user = await storage.getUserById(userId);
    if (!user) {
      console.log(`[AUTH_ME] User not found for userId: ${userId}`);
      return res.json(null);
    }

    console.log(`[AUTH_ME] User found: ${user.email} (${user.role})`);
    res.json(sanitizeUser(user));
  } catch (error) {
    console.error('Auth me error:', error);
    res.json(null);
  }
});

// Legacy /user endpoint for backwards compatibility
router.get('/user', isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any)?.claims?.sub;
    if (!userId) {
      return res.json(null);
    }

    const user = await storage.getUserById(userId);
    if (!user) {
      return res.json(null);
    }

    res.json(sanitizeUser(user));
  } catch (error) {
    console.error('Auth user error:', error);
    res.json(null);
  }
});

// Password-based registration for local development/testing
router.post("/register", loginLimiter, async (req, res) => {
  try {
    const registerSchema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      firstName: z.string().min(1).optional(),
      lastName: z.string().min(1).optional()
    });

    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        message: 'Invalid input',
        errors: result.error.errors
      });
    }

    const { email, password, firstName, lastName } = result.data;

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user with hashed password
    const userData = {
      email,
      passwordHash,
      firstName: firstName || null,
      lastName: lastName || null,
      role: 'customer' as const,
      isActive: true
    };

    const user = await storage.createUser(userData);

    // Set session
    req.session = req.session || {};
    req.session.userId = user.id;

    res.status(201).json({
      success: true,
      user: sanitizeUser(user),
      message: 'Registration successful'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Password-based login
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const loginSchema = z.object({
      email: z.string().email(),
      password: z.string().min(1)
    });

    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        message: 'Invalid input',
        errors: result.error.errors
      });
    }

    const { email, password } = result.data;

    // Get user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      await auditLogin(email, false, {
        error: 'User not found',
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password if hash exists
    if (user.passwordHash) {
      const isValidPassword = await verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        await auditLogin(user.id, false, {
          error: 'Invalid password',
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent')
        });
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    } else {
      // For users without password hash (legacy/OAuth), deny password login
      await auditLogin(user.id, false, {
        error: 'Password authentication not available for this account',
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      });
      return res.status(401).json({ message: 'Please use OAuth login for this account' });
    }

    // Check if user is active
    if (!user.isActive) {
      await auditLogin(user.id, false, {
        error: 'Account inactive',
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      });
      return res.status(403).json({ message: 'Account is inactive' });
    }

    // Set session
    req.session = req.session || {};
    req.session.userId = user.id;
    
    // Log successful login
    await auditLogin(user.id, true, {
      email: user.email,
      role: user.role,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });

    // Redirect based on role
    const redirectUrl = user.role === 'admin' ? '/admin' : 
                       user.role === 'customer' ? '/portal' : '/';
    
    res.json({ 
      success: true, 
      user: sanitizeUser(user),
      redirectUrl 
    });
  } catch (error) {
    console.error('Auth error:', error);
    // Log failed login attempt
    const emailResult = z.object({ email: z.string().optional() }).safeParse(req.body);
    if (emailResult.success && emailResult.data.email) {
      await auditLogin(emailResult.data.email, false, {
        error: error instanceof Error ? error.message : 'Unknown error',
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      });
    }
    res.status(500).json({ message: 'Authentication failed' });
  }
});

// Legacy OAuth GET login endpoint
router.get('/login', (req, res) => {
  res.json({ 
    message: "Use POST /api/auth/login for password authentication",
    loginUrl: "/auth/mock-login" 
  });
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  const user = req.user as any;
  const userId = user?.id || user?.userId || (req.session as any)?.userId;
  
  if (userId) {
    // Log logout
    await auditLogout(userId);
  }
  
  if (req.session) {
    req.session.destroy((err: any) => {
      if (err) console.error('Session destroy error:', err);
    });
  }
  res.json({ message: "Logged out successfully" });
});

// Mock login endpoint for development/testing
router.post('/mock-login', loginLimiter, async (req, res) => {
  try {
    const mockLoginSchema = z.object({
      email: z.string().email(),
      firstName: z.string().optional(),
      lastName: z.string().optional()
    });
    
    const result = mockLoginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Invalid input',
        details: result.error.errors
      });
    }
    
    const { email, firstName, lastName } = result.data;

    // Check if user exists
    let user = await storage.getUserByEmail(email);
    
    if (!user) {
      // Create new user
      const role = determineUserRole(email);
      
      // SECURITY: Validate user data before database insertion
      const userData = {
        email,
        firstName: firstName || '',
        lastName: lastName || '',
        role
      };
      const validatedUserData = insertUserSchema.parse(userData);
      user = await storage.createUser(validatedUserData);
    }

    // Set session
    req.session = req.session || {};
    req.session.userId = user.id;
    
    // Log successful login
    await auditLogin(user.id, true, {
      email: user.email,
      role: user.role,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });

    // Redirect based on role
    const redirectUrl = user.role === 'admin' ? '/admin' : 
                       user.role === 'customer' ? '/portal' : '/';
    
    res.json({ 
      success: true, 
      user: sanitizeUser(user),
      redirectUrl 
    });
  } catch (error) {
    console.error('Auth error:', error);
    // Log failed login attempt
    const emailResult = z.object({ email: z.string().optional() }).safeParse(req.body);
    if (emailResult.success && emailResult.data.email) {
      await auditLogin(emailResult.data.email, false, {
        error: error instanceof Error ? error.message : 'Unknown error',
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      });
    }
    res.status(500).json({ message: 'Authentication failed' });
  }
});

// Real callback endpoint (would handle Replit OAuth callback in production)
router.get('/callback', async (req, res) => {
  try {
    // In production, this would:
    // 1. Verify the authorization code with Replit
    // 2. Get user info from Replit API
    // 3. Create or update user in database
    // 4. Set session
    // 5. Redirect based on role
    
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Callback error:', error);
    res.redirect('/auth/login');
  }
});



// Development-only demo login (admin access)
if (process.env.NODE_ENV === 'development') {
  router.post('/demo-admin-login', loginLimiter, async (req, res) => {
    try {
      console.log('[DEMO_LOGIN] Admin demo login requested');
      
      // Get the admin user from storage
      const adminUser = await storage.getUserById('admin-user-id');
      if (!adminUser) {
        return res.status(404).json({ message: 'Admin demo user not found' });
      }
      
      // Set up the session manually for demo purposes
      req.login(adminUser, async (err) => {
        if (err) {
          console.error('[DEMO_LOGIN] Login error:', err);
          await auditLogin(adminUser.id, false, {
            type: 'demo_login',
            error: err.message,
            ip: req.ip || req.connection.remoteAddress
          });
          return res.status(500).json({ message: 'Demo login failed' });
        }
        
        // Log successful demo login
        await auditLogin(adminUser.id, true, {
          type: 'demo_login',
          email: adminUser.email,
          role: adminUser.role,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent')
        });
        
        console.log(`[DEMO_LOGIN] Successfully logged in as admin: ${adminUser.email}`);
        res.json({ 
          message: 'Demo login successful', 
          user: sanitizeUser(adminUser)
        });
      });
      
    } catch (error) {
      console.error('[DEMO_LOGIN] Demo login error:', error);
      res.status(500).json({ message: 'Demo login failed' });
    }
  });
}

export default router;