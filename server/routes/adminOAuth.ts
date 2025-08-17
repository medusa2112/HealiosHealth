// ADMIN AUTH ROUTES - SIMPLE EMAIL PIN AUTHENTICATION
import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { ENV } from '../config/env';
import { sendPinEmail } from '../lib/email';
import { randomInt } from 'crypto';

const router = Router();

// Store admin PINs temporarily (in production, use Redis or database)
const adminPins = new Map<string, { pin: string; expires: number; attempts: number }>();

// Allowed admin emails (hardcoded for now, can be moved to ENV later)
const ADMIN_EMAILS = ['dn@thefourths.com', 'jv@thefourths.com'].map(e => e.toLowerCase());

// Send PIN to admin email
const sendPinSchema = z.object({
  email: z.string().email()
});

router.post('/send-pin', async (req: Request, res: Response) => {
  try {
    const { email } = sendPinSchema.parse(req.body);
    const normalizedEmail = email.toLowerCase();
    
    // Check if email is in admin list
    if (!ADMIN_EMAILS.includes(normalizedEmail)) {
      return res.status(403).json({ error: 'Unauthorized email address' });
    }
    
    // Generate 6-digit PIN
    const pin = String(randomInt(100000, 999999));
    
    // Store PIN with 5-minute expiry
    adminPins.set(normalizedEmail, {
      pin,
      expires: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0
    });
    
    // Send PIN email using existing email service
    const emailResult = await sendPinEmail(normalizedEmail, pin);
    
    if (!emailResult.success) {
      console.error('Failed to send admin PIN email');
      return res.status(500).json({ error: 'Failed to send PIN email' });
    }
    
    res.json({ message: 'PIN sent to your email' });
  } catch (error) {
    console.error('Admin send PIN error:', error);
    res.status(400).json({ error: 'Failed to send PIN' });
  }
});

// Verify PIN and create admin session
const verifyPinSchema = z.object({
  email: z.string().email(),
  pin: z.string().length(6)
});

router.post('/verify-pin', async (req: Request, res: Response) => {
  try {
    const { email, pin } = verifyPinSchema.parse(req.body);
    const normalizedEmail = email.toLowerCase();
    
    // Get stored PIN
    const storedPinData = adminPins.get(normalizedEmail);
    
    if (!storedPinData) {
      return res.status(400).json({ error: 'No PIN found. Please request a new one.' });
    }
    
    // Check expiry
    if (Date.now() > storedPinData.expires) {
      adminPins.delete(normalizedEmail);
      return res.status(400).json({ error: 'PIN expired. Please request a new one.' });
    }
    
    // Check attempts
    if (storedPinData.attempts >= 3) {
      adminPins.delete(normalizedEmail);
      return res.status(400).json({ error: 'Too many attempts. Please request a new PIN.' });
    }
    
    // Verify PIN
    if (storedPinData.pin !== pin) {
      storedPinData.attempts++;
      return res.status(400).json({ error: 'Invalid PIN' });
    }
    
    // Clear PIN after successful verification
    adminPins.delete(normalizedEmail);
    
    // Create admin session
    (req.session as any).adminId = normalizedEmail;
    (req.session as any).adminEmail = normalizedEmail;
    (req.session as any).adminAuthenticated = true;
    
    // Set admin session cookie
    res.cookie('hh_admin_sess', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 2 * 60 * 60 * 1000 // 2 hours for admin sessions
    });
    
    res.json({ 
      success: true,
      email: normalizedEmail,
      role: 'admin'
    });
  } catch (error) {
    console.error('Admin verify PIN error:', error);
    res.status(400).json({ error: 'Verification failed' });
  }
});

// Admin logout
router.post('/logout', (req, res) => {
  const adminEmail = (req.session as any)?.adminEmail;

  req.session.destroy((err) => {
    if (err) {
      
    }
    
    // Clear all cookies
    res.clearCookie('healios.sid');
    res.clearCookie('hh_admin_sess');
    res.clearCookie('hh_cust_sess');
    
    res.json({ message: 'Admin logged out successfully' });
  });
});

// Check admin status
router.get('/status', async (req: Request, res: Response) => {
  const session = req.session as any;
  const adminId = session?.adminId;
  const adminEmail = session?.adminEmail;
  const adminAuthenticated = session?.adminAuthenticated;
  const adminSessCookie = req.cookies?.['hh_admin_sess'];
  
  // Check if admin is authenticated
  if (adminId && adminAuthenticated && adminSessCookie) {
    return res.json({ 
      authenticated: true, 
      id: adminId,
      email: adminEmail || adminId,
      role: 'admin'
    });
  }
  
  res.json({ 
    authenticated: false 
  });
});

export default router;