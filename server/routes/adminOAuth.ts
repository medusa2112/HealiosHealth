// ADMIN OAUTH ROUTES - DEDICATED ADMIN-ONLY OAUTH FLOW
import { Router } from 'express';
import passport from 'passport';
import { storage } from '../storage';

const router = Router();

// Admin OAuth login endpoint - redirect to main Replit OAuth with admin flag
router.get('/login', (req, res) => {
  console.log('[ADMIN_OAUTH] Initiating admin OAuth login');
  
  // Set a flag in session to indicate this is an admin login attempt
  (req.session as any).adminLoginAttempt = true;
  (req.session as any).adminLoginRedirect = true;
  
  // Save session before redirect
  req.session.save((err) => {
    if (err) {
      console.error('[ADMIN_OAUTH] Session save error:', err);
    }
    // Redirect to the main Replit OAuth endpoint
    res.redirect('/api/login');
  });
});

// The callback is handled by the main OAuth flow in replitAuth.ts
// No separate callback needed here

// Admin logout
router.post('/logout', (req, res) => {
  const adminEmail = (req.session as any)?.adminEmail;
  
  console.log(`[ADMIN_OAUTH] Admin logout: ${adminEmail}`);
  
  req.logout(() => {
    req.session.destroy((err) => {
      if (err) {
        console.error('[ADMIN_OAUTH] Session destroy error:', err);
      }
      
      // Clear all cookies
      res.clearCookie('healios.sid');
      res.clearCookie('hh_admin_sess');
      res.clearCookie('hh_cust_sess');
      
      res.json({ message: 'Admin logged out successfully' });
    });
  });
});

// Check admin status
router.get('/status', (req, res) => {
  const isAdmin = (req.session as any)?.isAdmin;
  const adminEmail = (req.session as any)?.adminEmail;
  
  if (isAdmin && adminEmail) {
    res.json({ 
      authenticated: true, 
      email: adminEmail,
      role: 'admin'
    });
  } else {
    res.json({ 
      authenticated: false 
    });
  }
});

export default router;