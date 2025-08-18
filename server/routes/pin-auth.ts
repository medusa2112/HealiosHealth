import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import crypto from 'crypto';
import { sendPinEmail } from '../lib/email';

const router = Router();

// Check if user exists endpoint - optimized
router.post('/check-user', async (req, res) => {
  try {
    const { email } = z.object({
      email: z.string().email('Please enter a valid email address')
    }).parse(req.body);

    // Quick check with timeout
    const existingUser = await storage.getUserByEmail(email);
    
    res.json({
      exists: !!existingUser,
      email: email
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message
      });
    }

    console.error('[CHECK_USER] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check user status. Please try again.'
    });
  }
});

// Register new user endpoint - creates account immediately
router.post('/register', async (req, res) => {
  try {
    const { email, firstName, lastName } = z.object({
      email: z.string().email('Please enter a valid email address'),
      firstName: z.string().min(1, 'First name is required').max(50),
      lastName: z.string().min(1, 'Last name is required').max(50)
    }).parse(req.body);

    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please sign in instead.'
      });
    }

    // Create new user account
    const newUser = await storage.createUser({
      email,
      firstName,
      lastName,
      role: 'customer'
    });

    console.log(`[REGISTER] New user account created: ${newUser.email} (${newUser.firstName} ${newUser.lastName})`);

    res.json({
      success: true,
      message: 'Account created successfully! Please sign in to access your account.',
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message
      });
    }

    console.error('[REGISTER] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create account. Please try again.'
    });
  }
});

// In-memory PIN storage (in production, use Redis or similar)
const pinStore = new Map<string, {
  pin: string;
  email: string;
  createdAt: number;
  attempts: number;
}>();

// PIN expiration time (5 minutes)
const PIN_EXPIRATION = 5 * 60 * 1000;
const MAX_ATTEMPTS = 3;

// Generate a 6-digit PIN
const generatePin = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

// Send PIN endpoint
router.post('/send-pin', async (req, res) => {
  try {
    const { email } = z.object({
      email: z.string().email('Please enter a valid email address')
    }).parse(req.body);

    // Generate PIN and store
    const pin = generatePin();
    const pinId = crypto.randomUUID();
    
    const pinData = {
      pin,
      email,
      createdAt: Date.now(),
      attempts: 0
    };
    
    pinStore.set(pinId, pinData);
    
    // Store PIN ID in session for verification
    (req.session as any).pinId = pinId;
    
    // DEVELOPMENT: Also store by email for cross-session access
    if (process.env.NODE_ENV === 'development') {
      pinStore.set(`email:${email}`, pinData);
      
    }

    // Send PIN via email using Resend

    try {
      const emailResult = await sendPinEmail(email, pin);
      if (!emailResult.success) {
        // // console.error('[PIN_AUTH] Failed to send PIN email:', emailResult);
        
        // Handle Resend testing mode limitation
        if ((emailResult as any).error === 'testing_mode') {

        } else {
          return res.status(500).json({
            success: false,
            message: 'Failed to send PIN email. Please try again.'
          });
        }
      } else {
        
      }
    } catch (error) {
      // // console.error('[PIN_AUTH] Error sending PIN email:', error);
      // In development, show PIN in logs as fallback
      
    }

    res.json({ 
      success: true, 
      message: 'PIN sent to your email address' 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message
      });
    }

    // // console.error('[PIN_AUTH] Send PIN error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send PIN. Please try again.'
    });
  }
});

// Verify PIN endpoint
router.post('/verify-pin', async (req, res) => {
  try {
    const { email, pin } = z.object({
      email: z.string().email(),
      pin: z.string().length(6, 'PIN must be 6 digits')
    }).parse(req.body);

    let pinData: any = null;
    const pinId = (req.session as any).pinId;

    if (pinId) {
      pinData = pinStore.get(pinId);
      
    }
    
    // DEVELOPMENT: Fallback to email-based lookup if session fails
    if (!pinData && process.env.NODE_ENV === 'development') {
      const emailKey = `email:${email}`;
      pinData = pinStore.get(emailKey);

    }
    
    if (!pinData) {
      
      return res.status(400).json({
        success: false,
        message: 'PIN has expired. Please request a new PIN.'
      });
    }

    // Check if PIN has expired
    if (Date.now() - pinData.createdAt > PIN_EXPIRATION) {
      pinStore.delete(pinId);
      delete (req.session as any).pinId;
      return res.status(400).json({
        success: false,
        message: 'PIN has expired. Please request a new PIN.'
      });
    }

    // Check email match
    if (pinData.email !== email) {
      return res.status(400).json({
        success: false,
        message: 'Email does not match PIN request.'
      });
    }

    // Check attempts
    if (pinData.attempts >= MAX_ATTEMPTS) {
      pinStore.delete(pinId);
      delete (req.session as any).pinId;
      return res.status(400).json({
        success: false,
        message: 'Too many attempts. Please request a new PIN.'
      });
    }

    // Verify PIN
    if (pinData.pin !== pin) {
      pinData.attempts++;
      return res.status(400).json({
        success: false,
        message: `Invalid PIN. ${MAX_ATTEMPTS - pinData.attempts} attempts remaining.`
      });
    }

    // PIN is valid - create/find user and log them in
    let user = await storage.getUserByEmail(email);
    let isNewUser = false;
    
    if (!user) {
      // Create new user
      user = await storage.createUser({
        email,
        firstName: '',
        lastName: '',
        role: 'customer'
      });
      isNewUser = true;
    }

    // Check if profile is incomplete
    const needsProfileCompletion = !user.firstName || !user.lastName || user.firstName.trim() === '' || user.lastName.trim() === '';

    // Set up session
    (req.session as any).userId = user.id;
    (req.session as any).userEmail = user.email;
    (req.session as any).userRole = user.role;

    // Clean up PIN data
    pinStore.delete(pinId);
    delete (req.session as any).pinId;

    res.json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      isNewUser,
      needsProfileCompletion,
      redirectTo: needsProfileCompletion ? '/profile' : '/'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message
      });
    }

    // // console.error('[PIN_AUTH] Verify PIN error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify PIN. Please try again.'
    });
  }
});

// Check authentication status
router.get('/me', async (req, res) => {
  try {
    const userId = (req.session as any).userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const user = await storage.getUserById(userId);
    if (!user) {
      // Clear invalid session
      delete (req.session as any).userId;
      delete (req.session as any).userEmail;
      delete (req.session as any).userRole;
      
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    // // console.error('[PIN_AUTH] Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user information'
    });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  try {
    // Clear session data
    delete (req.session as any).userId;
    delete (req.session as any).userEmail;
    delete (req.session as any).userRole;
    delete (req.session as any).pinId;

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    // // console.error('[PIN_AUTH] Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to logout'
    });
  }
});

// Clean up expired PINs periodically
setInterval(() => {
  const now = Date.now();
  const entriesToDelete: string[] = [];
  
  pinStore.forEach((data, id) => {
    if (now - data.createdAt > PIN_EXPIRATION) {
      entriesToDelete.push(id);
    }
  });
  
  entriesToDelete.forEach(id => pinStore.delete(id));
}, 60000); // Clean up every minute

export default router;