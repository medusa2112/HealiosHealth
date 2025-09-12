import express from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { storage } from '../storage';
import { setupAuth, isAuthenticated } from '../replitAuth';
import { determineUserRole, sanitizeUser } from '../lib/auth';
import { auditLogin, auditLogout } from '../lib/auditMiddleware';
import { hashPassword, verifyPassword, validatePassword } from '../lib/password';
import { insertUserSchema, customerRegisterSchema, customerLoginSchema, type CustomerRegister, type CustomerLogin } from '@shared/schema';
import { 
  generateVerificationCode, 
  hashVerificationCode, 
  verifyCode, 
  isCodeExpired, 
  generateExpiryTime,
  sendVerificationEmail,
  canAttemptVerification 
} from '../lib/verification';
// Phase 2 Security: Import enhanced rate limiting
import { 
  authRateLimiter, 
  passwordResetRateLimiter,
  progressiveDelay,
  trackFailedLogin,
  clearFailedLoginAttempts 
} from '../middleware/rateLimiting';

const router = express.Router();

// Phase 2 Security: Use enhanced rate limiting with progressive delays
// Disable for test environment to avoid issues with rapid test login attempts
const loginLimiter = process.env.NODE_ENV === 'test' || process.env.DISABLE_RATE_LIMIT === 'true'
  ? (req: any, res: any, next: any) => next() // Bypass rate limiter in test environment
  : authRateLimiter;

// Legacy rate limiter kept for backwards compatibility
const legacyLoginLimiter = process.env.NODE_ENV === 'test' || process.env.DISABLE_RATE_LIMIT === 'true'
  ? (req: any, res: any, next: any) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // Limit each IP to 5 requests per windowMs
      message: {
        error: 'Too many login attempts from this IP, please try again after 15 minutes',
        retryAfter: '15 minutes'
      },
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    });

// REMOVED: General /me route - using customer-specific route instead
// This router is mounted at /api/auth/customer so the customer-specific route handles /me

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
    // // console.error('Auth user error:', error);
    res.json(null);
  }
});

// SECURITY: Legacy non-namespaced routes DISABLED to prevent admin password auth bypass
// All password authentication must use /customer/* namespaced routes only
// This prevents admin accounts from bypassing OAuth requirements

// DISABLED: router.post("/register", ...) - Use /customer/register instead

// DISABLED: router.post('/login', ...) - Use /customer/login instead

// DISABLED: router.post('/verify', ...) - Legacy verification endpoint disabled

// DISABLED: router.post('/resend-code', ...) - Legacy resend endpoint disabled

// Customer-specific authentication routes under /customer namespace
// POST /api/auth/customer/register - Customer registration with password
router.post('/register', loginLimiter, async (req, res) => {
  try {
    const result = customerRegisterSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        message: 'Invalid input',
        errors: result.error.errors
      });
    }

    const { email, password, firstName, lastName } = result.data;

    // SECURITY: Check if email would be assigned admin role
    const potentialRole = determineUserRole(email);
    if (potentialRole === 'admin') {
      return res.status(403).json({ 
        message: 'Admin accounts cannot register via password. Please use OAuth authentication.' 
      });
    }

    // Create user with new storage method - role is FORCED to customer
    try {
      const user = await storage.createUserWithPassword({
        email,
        firstName,
        lastName,
        password
      });

      // SECURITY: Regenerate session ID to prevent session fixation
      await new Promise<void>((resolve, reject) => {
        req.session.regenerate((err: any) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Set session for immediate login
      req.session = req.session || {};
      (req.session as any).userId = user.id;

      // Log successful registration
      await auditLogin(user.id, true, {
        email: user.email,
        role: user.role,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        action: 'customer_registration'
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful.',
        user: sanitizeUser(user),
        redirectUrl: '/portal'
      });
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        return res.status(409).json({ message: 'User with this email already exists' });
      }
      throw error;
    }
  } catch (error) {
    // // console.error('Customer registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// POST /api/auth/customer/login - Customer login returning user data
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const result = customerLoginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        message: 'Invalid input',
        errors: result.error.errors
      });
    }

    const { email, password } = result.data;

    // Use new storage method for verification
    const user = await storage.verifyUserPassword(email, password);
    
    if (!user) {
      await auditLogin(email, false, {
        error: 'Invalid credentials',
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // SECURITY: Reject admin accounts from password login
    if (user.role === 'admin') {
      await auditLogin(user.id, false, {
        error: 'Admin password login blocked',
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      });
      return res.status(403).json({ 
        message: 'Admin accounts must use OAuth authentication. Password login is not permitted.' 
      });
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

    // SECURITY: Regenerate session ID to prevent session fixation
    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Set session
    req.session = req.session || {};
    (req.session as any).userId = user.id;
    
    // Log successful login
    await auditLogin(user.id, true, {
      email: user.email,
      role: user.role,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      action: 'customer_login'
    });

    res.json({ 
      success: true, 
      user: sanitizeUser(user),
      redirectUrl: '/portal'
    });
  } catch (error) {
    // // console.error('Customer login error:', error);
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

// POST /api/auth/customer/logout - Customer logout (clear session)
router.post('/logout', async (req, res) => {
  try {
    const userId = (req.session as any)?.userId;
    
    if (userId) {
      // Log logout action
      await auditLogout(userId, {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        action: 'customer_logout'
      });
    }

    // Clear session
    req.session = null;

    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    // // console.error('Customer logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
});

// GET /api/auth/customer/me - Get current customer data
router.get('/me', async (req, res) => {
  try {
    const userId = (req.session as any)?.userId;

    if (!userId) {
      return res.json(null);
    }

    const user = await storage.getUserById(userId);
    if (!user) {
      return res.json(null);
    }

    // Ensure user is a customer
    if (user.role !== 'customer') {
      return res.json(null);
    }

    res.json(sanitizeUser(user));
  } catch (error) {
    // // console.error('Customer me error:', error);
    res.json(null);
  }
});

// Customer profile update endpoint
router.patch('/profile', async (req, res) => {
  try {
    const userId = (req.session as any)?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const updateSchema = z.object({
      firstName: z.string().min(1, 'First name is required').trim(),
      lastName: z.string().min(1, 'Last name is required').trim()
    });

    const result = updateSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error.errors[0].message
      });
    }

    const { firstName, lastName } = result.data;

    // Update user profile
    const updatedUser = await storage.updateUser(userId, {
      firstName,
      lastName
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: sanitizeUser(updatedUser)
    });
  } catch (error) {
    // // console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile. Please try again.'
    });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  const user = req.user as any;
  const userId = user?.id || user?.userId || (req.session as any)?.userId;

  if (userId) {
    // Log logout
    await auditLogout(userId);
  }

  req.logout(() => {
    if (req.session) {
      req.session.destroy((err: any) => {
        // Session destroy error handling
      });
    }
    res.clearCookie('healios.sid', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    res.json({ message: "Logged out successfully" });
  });
});

if (process.env.NODE_ENV !== 'production') {
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
    (req.session as any).userId = user.id;
    
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
    // // console.error('Auth error:', error);
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
}

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
    // // console.error('Callback error:', error);
    res.redirect('/auth/login');
  }
});

if (process.env.NODE_ENV !== 'production') {
// Development-only demo login (admin access)
if (process.env.NODE_ENV === 'development') {
  router.post('/demo-admin-login', loginLimiter, async (req, res) => {
    try {
      
      const adminUser = await storage.getUserById('admin-user-id');
      if (!adminUser) {
        return res.status(404).json({ message: 'Admin demo user not found' });
      }
      
      // Set up the session manually for demo purposes
      req.login(adminUser, async (err) => {
        if (err) {
          // // console.error('[DEMO_LOGIN] Login error:', err);
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

        res.json({ 
          message: 'Demo login successful', 
          user: sanitizeUser(adminUser)
        });
      });
      
    } catch (error) {
      // // console.error('[DEMO_LOGIN] Demo login error:', error);
      res.status(500).json({ message: 'Demo login failed' });
    }
  });
}

// Forgot password endpoint
router.post('/forgot-password', loginLimiter, async (req, res) => {
  try {
    const forgotPasswordSchema = z.object({
      email: z.string().email()
    });

    const result = forgotPasswordSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        message: 'Invalid email address',
        errors: result.error.errors
      });
    }

    const { email } = result.data;

    // Check if user exists
    const user = await storage.getUserByEmail(email);
    
    // Always return success to prevent email enumeration attacks
    if (!user) {
      
      return res.json({ 
        success: true,
        message: 'If an account exists with this email, password reset instructions have been sent.'
      });
    }

    // Generate password reset code (similar to verification code)
    const resetCode = generateVerificationCode();
    const resetCodeHash = await hashVerificationCode(resetCode);
    const resetExpiresAt = generateExpiryTime(); // 1 hour expiry

    // Update user with reset code
    await storage.updateUser(user.id, {
      verificationCodeHash: resetCodeHash,
      verificationExpiresAt: resetExpiresAt.toISOString(),
      verificationAttempts: 0
    });

    // Send password reset email
    try {
      await sendVerificationEmail(email, resetCode, user.firstName, 'reset');
      
    } catch (emailError) {
      // // console.error('[FORGOT_PASSWORD] Failed to send reset email:', emailError);
      // Still return success to prevent enumeration
    }

    res.json({ 
      success: true,
      message: 'If an account exists with this email, password reset instructions have been sent.'
    });
  } catch (error) {
    // // console.error('[FORGOT_PASSWORD] Error:', error);
    res.status(500).json({ 
      message: 'Failed to process password reset request. Please try again.' 
    });
  }
});

// Reset password endpoint
router.post('/reset-password', loginLimiter, async (req, res) => {
  try {
    const resetPasswordSchema = z.object({
      email: z.string().email(),
      code: z.string().length(6),
      newPassword: z.string().min(8)
    });

    const result = resetPasswordSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        message: 'Invalid input',
        errors: result.error.errors
      });
    }

    const { email, code, newPassword } = result.data;

    // Validate new password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    // Get user
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or code' });
    }

    // Check if user can attempt verification
    if (!canAttemptVerification(user.verificationAttempts || 0)) {
      return res.status(429).json({ 
        message: 'Too many failed attempts. Please request a new code.',
        attemptsLeft: 0
      });
    }

    // Check if code is expired
    if (!user.verificationExpiresAt || isCodeExpired(user.verificationExpiresAt)) {
      return res.status(400).json({ 
        message: 'Reset code has expired. Please request a new one.' 
      });
    }

    // Verify the code
    const isValid = await verifyCode(code, user.verificationCodeHash || '');
    
    if (!isValid) {
      // Increment attempts
      await storage.updateUser(user.id, {
        verificationAttempts: (user.verificationAttempts || 0) + 1
      });
      
      const attemptsLeft = 5 - ((user.verificationAttempts || 0) + 1);
      return res.status(400).json({ 
        message: 'Invalid reset code',
        attemptsLeft
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password and clear reset code
    await storage.updateUser(user.id, {
      passwordHash: hashedPassword,
      verificationCodeHash: null,
      verificationExpiresAt: null,
      verificationAttempts: 0
    });

    res.json({ 
      success: true,
      message: 'Password has been successfully reset. You can now login with your new password.'
    });
  } catch (error) {
    // // console.error('[RESET_PASSWORD] Error:', error);
    res.status(500).json({ 
      message: 'Failed to reset password. Please try again.' 
    });
  }
});
}

export default router;