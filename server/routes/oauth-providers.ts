import { Router } from 'express';
import passport from 'passport';

const router = Router();

// Individual OAuth provider endpoints
// These redirect users directly to the specific OAuth provider login pages

router.get('/google', (req, res, next) => {
  console.log('[OAUTH] Initiating Google OAuth authentication');
  
  // Set customer authentication context
  (req.session as any).customerAuth = true;
  (req.session as any).oauthProvider = 'google';
  
  // Save session before redirect
  req.session.save((err) => {
    if (err) {
      console.error('[OAUTH] Session save error:', err);
    }
    
    // For now, redirect to main OAuth endpoint with Google hint
    // In a full implementation, this would be configured with Google OAuth credentials
    res.redirect('/api/login?provider=google');
  });
});

router.get('/github', (req, res, next) => {
  console.log('[OAUTH] Initiating GitHub OAuth authentication');
  
  (req.session as any).customerAuth = true;
  (req.session as any).oauthProvider = 'github';
  
  req.session.save((err) => {
    if (err) {
      console.error('[OAUTH] Session save error:', err);
    }
    
    res.redirect('/api/login?provider=github');
  });
});

router.get('/apple', (req, res, next) => {
  console.log('[OAUTH] Initiating Apple OAuth authentication');
  
  (req.session as any).customerAuth = true;
  (req.session as any).oauthProvider = 'apple';
  
  req.session.save((err) => {
    if (err) {
      console.error('[OAUTH] Session save error:', err);
    }
    
    res.redirect('/api/login?provider=apple');
  });
});

router.get('/twitter', (req, res, next) => {
  console.log('[OAUTH] Initiating X/Twitter OAuth authentication');
  
  (req.session as any).customerAuth = true;
  (req.session as any).oauthProvider = 'twitter';
  
  req.session.save((err) => {
    if (err) {
      console.error('[OAUTH] Session save error:', err);
    }
    
    res.redirect('/api/login?provider=twitter');
  });
});

// Email authentication (fallback to main OAuth)
router.get('/email', (req, res, next) => {
  console.log('[OAUTH] Initiating email OAuth authentication');
  
  (req.session as any).customerAuth = true;
  (req.session as any).oauthProvider = 'email';
  
  req.session.save((err) => {
    if (err) {
      console.error('[OAUTH] Session save error:', err);
    }
    
    res.redirect('/api/login?provider=email');
  });
});

export default router;