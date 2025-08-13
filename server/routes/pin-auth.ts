import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import crypto from 'crypto';
import { sendPinEmail } from '../lib/email';

const router = Router();

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
    
    pinStore.set(pinId, {
      pin,
      email,
      createdAt: Date.now(),
      attempts: 0
    });

    // Store PIN ID in session for verification
    (req.session as any).pinId = pinId;

    // Send PIN via email using Resend
    console.log(`[PIN_AUTH] Generated PIN for ${email}: ${pin}`);
    
    try {
      const emailResult = await sendPinEmail(email, pin);
      if (!emailResult.success) {
        console.error('[PIN_AUTH] Failed to send PIN email:', emailResult);
        
        // Handle Resend testing mode limitation
        if (emailResult.error === 'testing_mode') {
          console.log(`[PIN_AUTH] Resend in testing mode - showing PIN in logs for development`);
          console.log(`[PIN_AUTH] Development PIN for ${email}: ${pin}`);
          // In development/testing mode, continue as if email was sent
        } else {
          return res.status(500).json({
            success: false,
            message: 'Failed to send PIN email. Please try again.'
          });
        }
      } else {
        console.log(`[PIN_AUTH] PIN email sent successfully to ${email} - ID: ${emailResult.id}`);
      }
    } catch (error) {
      console.error('[PIN_AUTH] Error sending PIN email:', error);
      // In development, show PIN in logs as fallback
      console.log(`[PIN_AUTH] Email failed - Development PIN for ${email}: ${pin}`);
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

    console.error('[PIN_AUTH] Send PIN error:', error);
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

    const pinId = (req.session as any).pinId;
    console.log(`[PIN_VERIFY] Session ID: ${req.sessionID}`);
    console.log(`[PIN_VERIFY] PIN ID from session: ${pinId}`);
    console.log(`[PIN_VERIFY] Email from request: ${email}`);
    
    if (!pinId) {
      console.log(`[PIN_VERIFY] No PIN ID found in session`);
      return res.status(400).json({
        success: false,
        message: 'No PIN request found. Please request a new PIN.'
      });
    }

    const pinData = pinStore.get(pinId);
    console.log(`[PIN_VERIFY] Looking for PIN with ID: ${pinId}`);
    console.log(`[PIN_VERIFY] Available PINs in store:`, Array.from(pinStore.keys()));
    console.log(`[PIN_VERIFY] PIN data found:`, !!pinData);
    
    if (!pinData) {
      console.log(`[PIN_VERIFY] PIN not found in store - may have expired or been cleaned up`);
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
    
    if (!user) {
      // Create new user
      user = await storage.createUser({
        email,
        firstName: '',
        lastName: '',
        role: 'customer'
      });
    }

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
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message
      });
    }

    console.error('[PIN_AUTH] Verify PIN error:', error);
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
    console.error('[PIN_AUTH] Get user error:', error);
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
    console.error('[PIN_AUTH] Logout error:', error);
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