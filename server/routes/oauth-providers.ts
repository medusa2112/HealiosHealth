import { Router } from 'express';
import passport from 'passport';

const router = Router();

// Individual OAuth provider endpoints
// These work with Replit Auth by setting provider context and redirecting to /api/login

router.get('/google', (req, res, next) => {
  
  (req.session as any).customerAuth = true;
  (req.session as any).oauthProvider = 'google';
  (req.session as any).requestedProvider = 'google';
  
  // Save session before redirect
  req.session.save((err) => {
    if (err) {
      
      return res.redirect('/register?error=session_error');
    }
    
    // Redirect to main OAuth endpoint with explicit Google provider hint
    // This should trigger Replit Auth to route to Google's OAuth
    res.redirect('/api/login?provider=google&prompt=select_account');
  });
});

router.get('/github', (req, res, next) => {

  (req.session as any).customerAuth = true;
  (req.session as any).oauthProvider = 'github';
  (req.session as any).requestedProvider = 'github';
  
  req.session.save((err) => {
    if (err) {
      
      return res.redirect('/register?error=session_error');
    }
    
    res.redirect('/api/login?provider=github&prompt=select_account');
  });
});

router.get('/apple', (req, res, next) => {

  (req.session as any).customerAuth = true;
  (req.session as any).oauthProvider = 'apple';
  (req.session as any).requestedProvider = 'apple';
  
  req.session.save((err) => {
    if (err) {
      
      return res.redirect('/register?error=session_error');
    }
    
    res.redirect('/api/login?provider=apple&prompt=select_account');
  });
});

router.get('/twitter', (req, res, next) => {

  (req.session as any).customerAuth = true;
  (req.session as any).oauthProvider = 'twitter';
  (req.session as any).requestedProvider = 'twitter';
  
  req.session.save((err) => {
    if (err) {
      
      return res.redirect('/register?error=session_error');
    }
    
    res.redirect('/api/login?provider=twitter&prompt=select_account');
  });
});

// Email authentication (fallback to main OAuth)
router.get('/email', (req, res, next) => {

  (req.session as any).customerAuth = true;
  (req.session as any).oauthProvider = 'email';
  
  req.session.save((err) => {
    if (err) {
      
    }
    
    res.redirect('/api/login');
  });
});

export default router;