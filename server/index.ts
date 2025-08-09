import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { requestLogger, errorLogger } from "./middleware/requestLogger";
import { csrfProtection } from "./middleware/csrf";
import { contentSecurityPolicy } from "./middleware/csp";
import { logger } from "./lib/logger";

const app = express();

// Remove security-revealing headers
app.disable('x-powered-by');

// Apply Content Security Policy and security headers
app.use(contentSecurityPolicy);

// Add comprehensive request logging BEFORE body parsing
app.use(requestLogger);

// CORS configuration for production security
app.use((req, res, next) => {
  const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? ['https://thehealios.com', 'https://www.thehealios.com']
    : ['http://localhost:5000', 'http://127.0.0.1:5000'];
  
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session management is handled in replitAuth.ts

// Demo login endpoint before CSRF protection for easy testing
app.post('/api/auth/demo-admin-login', async (req, res) => {
  try {
    const { storage } = await import('./storage');
    const { sanitizeUser } = await import('./lib/auth');
    
    console.log('[DEMO_LOGIN] Attempting demo admin login');
    
    // Find the demo admin user by email, create if doesn't exist
    let demoAdmin = await storage.getUserByEmail('admin@healios.com');
    
    if (!demoAdmin) {
      console.log('[DEMO_LOGIN] Demo admin user not found, creating...');
      demoAdmin = await storage.createUser({
        email: 'admin@healios.com',
        firstName: 'Demo',
        lastName: 'Admin',
        role: 'admin',
        isActive: true
      });
      console.log('[DEMO_LOGIN] Created demo admin user:', demoAdmin.id);
    }
    
    console.log('[DEMO_LOGIN] Found demo admin:', demoAdmin.email, demoAdmin.role);
    
    // Set session
    req.session = req.session || {};
    req.session.userId = demoAdmin.id;
    
    console.log('[DEMO_LOGIN] Session set for user:', demoAdmin.id);
    
    res.json({ 
      success: true, 
      user: sanitizeUser(demoAdmin),
      redirectUrl: '/admin'
    });
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({ message: 'Demo login failed' });
  }
});

// CSRF protection for state-changing operations (applied after demo login)
app.use('/api', csrfProtection);

// Log application startup
logger.info('SERVER', 'Starting application', {
  env: process.env.NODE_ENV,
  port: process.env.PORT || '5000'
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Use error logger middleware
  app.use(errorLogger);
  
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    logger.info('SERVER', 'Application started successfully', {
      port,
      env: app.get('env'),
      host: '0.0.0.0'
    });
  });
})();
