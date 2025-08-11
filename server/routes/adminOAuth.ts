// ADMIN OAUTH ROUTES - DEDICATED ADMIN-ONLY OAUTH FLOW
import { Router, Request, Response } from 'express';
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

// Check admin status - requires passport session
router.get('/status', async (req: Request, res: Response) => {
  // First check passport session
  const user = req.user as any;
  
  console.log('[ADMIN_OAUTH_STATUS] Checking admin status:', {
    hasUser: !!user,
    userEmail: user?.email,
    userRole: user?.role,
    isAuthenticated: req.isAuthenticated(),
    sessionID: req.sessionID,
    hasSession: !!req.session
  });
  
  // If user is authenticated via passport
  if (req.isAuthenticated() && user) {
    // Check if user has admin role
    if (user.role === 'admin') {
      console.log('[ADMIN_OAUTH_STATUS] Admin authenticated:', user.email);
      return res.json({ 
        authenticated: true, 
        email: user.email,
        role: 'admin'
      });
    } else {
      console.log('[ADMIN_OAUTH_STATUS] User authenticated but not admin:', user.email, user.role);
    }
  }
  
  // Not authenticated as admin
  res.json({ 
    authenticated: false 
  });
});

export default router;