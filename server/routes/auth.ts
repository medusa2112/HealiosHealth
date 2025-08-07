import express from 'express';
import { storage } from '../storage';
import { determineUserRole } from '../lib/auth';

const router = express.Router();

// Get current user endpoint for frontend auth
router.get("/me", async (req, res) => {
  try {
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await storage.getUserById(userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid session' });
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Failed to get user info" });
  }
});

// Guest registration with order linking (Phase 8)
router.post("/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName, fromCheckout } = req.body;
    
    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Create new user
    const role = determineUserRole(email);
    const newUser = await storage.createUser({
      email,
      password, // In production, this should be hashed
      firstName,
      lastName,
      role
    });

    // If registering from checkout, link existing orders
    if (fromCheckout) {
      try {
        await storage.linkGuestOrdersToUser(email, newUser.id);
      } catch (linkError) {
        console.error('Failed to link guest orders:', linkError);
        // Don't fail registration if linking fails
      }
    }

    // Set session
    req.session = req.session || {};
    req.session.userId = newUser.id;

    res.json({ 
      message: "Registration successful",
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
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

// Standard login endpoint  
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log(`[DEBUG LOGIN] Attempt - Email: "${username}", Password: "${password}"`);
    
    if (!username || !password) {
      console.log(`[DEBUG LOGIN] Missing credentials`);
      return res.status(400).json({ message: "Username and password are required" });
    }

    // Find user by email (username field)
    const user = await storage.getUserByEmail(username);
    
    console.log(`[DEBUG LOGIN] User lookup result:`, user ? `Found user: ${user.email}, password: "${user.password}", role: ${user.role}` : 'User not found');
    
    if (!user) {
      console.log(`[DEBUG LOGIN] User not found for email: "${username}"`);
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // In production, verify hashed password here
    console.log(`[DEBUG LOGIN] Password comparison - Stored: "${user.password}", Provided: "${password}", Match: ${user.password === password}`);
    if (user.password !== password) {
      console.log(`[DEBUG LOGIN] Password mismatch`);
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    console.log(`[DEBUG LOGIN] Login successful for ${user.email}`);

    // Set session
    req.session = req.session || {};
    req.session.userId = user.id;
    
    console.log(`[DEBUG LOGIN] Session set - userId: ${req.session.userId}`);

    res.json({ 
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
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

// Get current user info
router.get('/user', async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.json(null); // Return null for unauthenticated users
    }

    const user = await storage.getUserById(req.session.userId);
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

export default router;