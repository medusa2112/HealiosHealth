import express from 'express';
import { storage } from '../storage';
import { setupAuth, isAuthenticated } from '../replitAuth';

const router = express.Router();

// Get current user info via Replit Auth
router.get('/user', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.json(null);
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.json(null);
    }

    res.json({ 
      id: user.id, 
      email: user.email, 
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    });
  } catch (error) {
    console.error('Auth me error:', error);
    res.json(null);
  }
});

// Registration handled by Replit Auth
router.post("/register", (req, res) => {
  res.status(501).json({ message: "Registration handled by Replit Auth" });
});

// Mock Replit Auth login - in production this would redirect to Replit OAuth
router.get('/login', (req, res) => {
  // In a real implementation, this would redirect to Replit OAuth
  // For now, we'll provide a simple form for testing
  res.json({ 
    message: "In production, this would redirect to Replit OAuth",
    loginUrl: "/auth/mock-login" 
  });
});

// Redirect to Replit Auth for login
router.get('/login', (req, res) => {
  res.redirect('/api/login');
});

// Logout endpoint
router.post('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy((err: any) => {
      if (err) console.error('Session destroy error:', err);
    });
  }
  res.json({ message: "Logged out successfully" });
});

// Mock login endpoint for development/testing
router.post('/mock-login', async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists
    let user = await storage.getUserByEmail(email);
    
    if (!user) {
      // Create new user
      const role = determineUserRole(email);
      user = await storage.createUser({
        email,
        firstName: firstName || '',
        lastName: lastName || '',
        role
      });
    }

    // Set session
    req.session = req.session || {};
    req.session.userId = user.id;

    // Redirect based on role
    const redirectUrl = user.role === 'admin' ? '/admin' : 
                       user.role === 'customer' ? '/portal' : '/';
    
    res.json({ 
      success: true, 
      user: { id: user.id, email: user.email, role: user.role },
      redirectUrl 
    });
  } catch (error) {
    console.error('Auth error:', error);
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

router.post('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.clearCookie('connect.sid'); // Default session cookie name
      res.json({ success: true, message: 'Logged out successfully' });
    });
  } else {
    res.json({ success: true, message: 'No active session' });
  }
});


export default router;