import express from 'express';
import { storage } from '../storage';
import { setupAuth, isAuthenticated } from '../replitAuth';
import { determineUserRole } from '../lib/auth';

const router = express.Router();

// Get current user info - this is what the frontend /auth/me expects
router.get('/me', async (req, res) => {
  try {
    // Check if user is authenticated through Replit Auth or session
    const userId = req.session?.userId || (req.user as any)?.claims?.sub || (req.user as any)?.userId;
    
    console.log(`[AUTH_ME] Checking auth status for userId: ${userId}`);
    console.log(`[AUTH_ME] Session:`, req.session?.userId ? 'present' : 'missing');
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

    res.json({ 
      id: user.id, 
      email: user.email, 
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    });
  } catch (error) {
    console.error('Auth user error:', error);
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



// Development-only demo login (admin access)
if (process.env.NODE_ENV === 'development') {
  router.post('/demo-admin-login', async (req, res) => {
    try {
      console.log('[DEMO_LOGIN] Admin demo login requested');
      
      // Get the admin user from storage
      const adminUser = await storage.getUserById('admin-user-id');
      if (!adminUser) {
        return res.status(404).json({ message: 'Admin demo user not found' });
      }
      
      // Set up the session manually for demo purposes
      req.login(adminUser, (err) => {
        if (err) {
          console.error('[DEMO_LOGIN] Login error:', err);
          return res.status(500).json({ message: 'Demo login failed' });
        }
        
        console.log(`[DEMO_LOGIN] Successfully logged in as admin: ${adminUser.email}`);
        res.json({ 
          message: 'Demo login successful', 
          user: {
            id: adminUser.id,
            email: adminUser.email,
            role: adminUser.role,
            firstName: adminUser.firstName,
            lastName: adminUser.lastName
          }
        });
      });
      
    } catch (error) {
      console.error('[DEMO_LOGIN] Demo login error:', error);
      res.status(500).json({ message: 'Demo login failed' });
    }
  });
}

export default router;