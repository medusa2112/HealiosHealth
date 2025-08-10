import express from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { storage } from '../storage';
import { setupAuth, isAuthenticated } from '../replitAuth';
import { determineUserRole, sanitizeUser } from '../lib/auth';
import { auditLogin, auditLogout } from '../lib/auditMiddleware';
import { hashPassword, verifyPassword, validatePassword } from '../lib/password';
import { insertUserSchema } from '@shared/schema';
import { 
  generateVerificationCode, 
  hashVerificationCode, 
  verifyCode, 
  isCodeExpired, 
  generateExpiryTime,
  sendVerificationEmail,
  canAttemptVerification 
} from '../lib/verification';

const router = express.Router();

// Rate limiting for login endpoints to prevent brute force attacks
// Disable for test environment to avoid issues with rapid test login attempts
const loginLimiter = process.env.NODE_ENV === 'test' || process.env.DISABLE_RATE_LIMIT === 'true'
  ? (req: any, res: any, next: any) => next() // Bypass rate limiter in test environment
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

// Get current user info - this is what the frontend /auth/me expects
router.get('/me', async (req, res) => {
  try {
    // Check if user is authenticated through Replit Auth or session
    const userId = (req.session as any)?.userId || (req.user as any)?.claims?.sub || (req.user as any)?.userId;
    
    console.log(`[AUTH_ME] Checking auth status for userId: ${userId}`);
    console.log(`[AUTH_ME] Session:`, (req.session as any)?.userId ? 'present' : 'missing');
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

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeHash = await hashVerificationCode(verificationCode);
    const verificationExpiresAt = generateExpiryTime();

    // Create user with hashed password and verification data
    const userData = {
      email,
      password: passwordHash,
      firstName: firstName || null,
      lastName: lastName || null,
      role: 'customer' as const,
      isActive: true,
      emailVerified: null, // Not verified yet
      verificationCodeHash,
      verificationExpiresAt: verificationExpiresAt.toISOString(),
      verificationAttempts: 0
    };

    const validatedUserData = insertUserSchema.parse(userData);
    const user = await storage.createUser(validatedUserData);

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationCode, firstName);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue registration even if email fails
    }

    // Don't set session yet - user needs to verify email first
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for a verification code.',
      requiresVerification: true,
      email
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Password-based login
router.post('/login', loginLimiter, async (req, res) => {
  try {
    console.log('[LOGIN] Request body:', req.body);
    console.log('[LOGIN] Headers:', req.headers);
    
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
    console.log('[LOGIN] Looking up user:', email);
    const user = await storage.getUserByEmail(email);
    console.log('[LOGIN] User found:', user ? 'yes' : 'no', user?.id);
    if (!user) {
      await auditLogin(email, false, {
        error: 'User not found',
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password if hash exists
    if (user.password) {
      const isValidPassword = await verifyPassword(password, user.password);
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

    // Check if email is verified (only for password-based auth)
    if (user.password && !user.emailVerified) {
      await auditLogin(user.id, false, {
        error: 'Email not verified',
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      });
      return res.status(403).json({ 
        message: 'Please verify your email to continue',
        error: 'email_unverified',
        email: user.email
      });
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

// Email verification endpoint
router.post('/verify', loginLimiter, async (req, res) => {
  try {
    const verifySchema = z.object({
      email: z.string().email(),
      code: z.string().length(6)
    });

    const result = verifySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        message: 'Invalid input',
        errors: result.error.errors
      });
    }

    const { email, code } = result.data;

    // Get user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Check rate limiting
    if (!canAttemptVerification(user.verificationAttempts || 0)) {
      return res.status(429).json({ 
        message: 'Too many verification attempts. Please try again in 1 hour.' 
      });
    }

    // Update attempt count
    await storage.updateUser(user.id, {
      verificationAttempts: (user.verificationAttempts || 0) + 1
    });

    // Check if code expired
    if (!user.verificationExpiresAt || isCodeExpired(user.verificationExpiresAt)) {
      return res.status(400).json({ 
        message: 'Verification code has expired. Please request a new one.' 
      });
    }

    // Verify the code
    if (!user.verificationCodeHash || !(await verifyCode(code, user.verificationCodeHash))) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Mark email as verified
    await storage.updateUser(user.id, {
      emailVerified: new Date().toISOString(),
      verificationCodeHash: null,
      verificationExpiresAt: null,
      verificationAttempts: 0
    });

    // Set session
    req.session = req.session || {};
    (req.session as any).userId = user.id;

    // Log successful verification
    await auditLogin(user.id, true, {
      email: user.email,
      role: user.role,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      verified: true
    });

    // Redirect based on role
    const redirectUrl = user.role === 'admin' ? '/admin' : '/portal';

    res.json({ 
      success: true,
      message: 'Email verified successfully',
      user: sanitizeUser(user),
      redirectUrl
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Verification failed' });
  }
});

// Resend verification code endpoint
router.post('/resend-code', loginLimiter, async (req, res) => {
  try {
    const resendSchema = z.object({
      email: z.string().email()
    });

    const result = resendSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        message: 'Invalid input',
        errors: result.error.errors
      });
    }

    const { email } = result.data;

    // Get user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeHash = await hashVerificationCode(verificationCode);
    const verificationExpiresAt = generateExpiryTime();

    // Update user with new verification data
    await storage.updateUser(user.id, {
      verificationCodeHash,
      verificationExpiresAt: verificationExpiresAt.toISOString(),
      verificationAttempts: 0 // Reset attempts for new code
    });

    // Send new verification email
    try {
      await sendVerificationEmail(email, verificationCode, user.firstName);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      return res.status(500).json({ message: 'Failed to send verification email' });
    }

    res.json({ 
      success: true,
      message: 'New verification code sent to your email'
    });
  } catch (error) {
    console.error('Resend code error:', error);
    res.status(500).json({ message: 'Failed to resend verification code' });
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
      console.log(`[FORGOT_PASSWORD] Password reset requested for non-existent email: ${email}`);
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
      console.log(`[FORGOT_PASSWORD] Password reset email sent to: ${email}`);
    } catch (emailError) {
      console.error('[FORGOT_PASSWORD] Failed to send reset email:', emailError);
      // Still return success to prevent enumeration
    }

    res.json({ 
      success: true,
      message: 'If an account exists with this email, password reset instructions have been sent.'
    });
  } catch (error) {
    console.error('[FORGOT_PASSWORD] Error:', error);
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
      password: hashedPassword,
      verificationCodeHash: null,
      verificationExpiresAt: null,
      verificationAttempts: 0
    });

    console.log(`[RESET_PASSWORD] Password successfully reset for: ${email}`);

    res.json({ 
      success: true,
      message: 'Password has been successfully reset. You can now login with your new password.'
    });
  } catch (error) {
    console.error('[RESET_PASSWORD] Error:', error);
    res.status(500).json({ 
      message: 'Failed to reset password. Please try again.' 
    });
  }
});

export default router;