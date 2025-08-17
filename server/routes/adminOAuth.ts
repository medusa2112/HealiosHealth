// ADMIN OAUTH ROUTES - DEDICATED ADMIN-ONLY OAUTH FLOW
import { Router, Request, Response } from 'express';
import passport from 'passport';
import { storage } from '../storage';

const router = Router();

// Admin OAuth login endpoint - redirect to main Replit OAuth with admin flag
router.get('/login', (req, res) => {
  
  (req.session as any).adminLoginAttempt = true;
  (req.session as any).adminLoginRedirect = true;
  
  // Save session before redirect
  req.session.save((err) => {
    if (err) {
      
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

// Check admin status - uses session-based auth (PIN system)
router.get('/status', async (req: Request, res: Response) => {
  // Check session for admin authentication
  const session = req.session as any;
  const adminEmail = session?.adminEmail;
  const isAdminAuthenticated = session?.adminAuthenticated;

  if (isAdminAuthenticated && adminEmail) {
    
    return res.json({ 
      authenticated: true, 
      email: adminEmail,
      role: 'admin'
    });
  }
  
  // Not authenticated as admin
  res.json({ 
    authenticated: false 
  });
});

export default router;