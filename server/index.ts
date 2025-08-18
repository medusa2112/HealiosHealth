import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { requestLogger, errorLogger } from "./middleware/requestLogger";
import { csrfProtection } from "./middleware/csrf";
import { contentSecurityPolicy } from "./middleware/csp";
import { logger } from "./lib/logger";
import { ENV } from "./config/env";
import { corsMw } from "./security/cors";
import { healthRouter } from "./health";
// DISABLED: Custom session middlewares - using Replit Auth only
// import { customerSession } from "./auth/sessionCustomer";
// import { adminSession } from "./auth/sessionAdmin";
import { enforceProductionDefaults, logCookieAttributes } from "./config/production";
import healthRoutes from "./routes/health";
import { securityHeaders } from "./middleware/security-headers";
import { enforceProductionConfig } from "./config/production-enforcer";
import { auditAuthEvents } from "./middleware/audit-logger";
import { 
  authLimiter, 
  adminAuthLimiter, 
  passwordResetLimiter, 
  registrationLimiter 
} from "./middleware/rate-limiter";
import { protectAdmin } from "./middleware/adminAccess";
import { ADMIN_CONFIG } from "./config/adminConfig";
// Phase 3 Security: Import enhanced security middlewares
import { globalErrorHandler, setupUncaughtExceptionHandlers, notFoundHandler } from "./middleware/errorHandler";
import { createApiSecurityMiddleware } from "./middleware/apiSecurity";
import { monitorDatabaseQueries } from "./middleware/databaseSecurity";

const app = express();

// Enforce production configuration (fail-hard in production)
try {
  enforceProductionConfig(); // New comprehensive config enforcer
  enforceProductionDefaults();
  logCookieAttributes();
} catch (error) {
  logger.error('CONFIG', 'Production configuration error', { error });
  if (process.env.NODE_ENV === 'production') {
    process.exit(1); // Exit if production config is invalid
  }
}

// Remove security-revealing headers
app.disable('x-powered-by');

// Trust proxy for proper HTTPS detection and rate limiting
// Phase 2 Security: Enable trust proxy for all environments to fix rate limiting
app.set('trust proxy', 1);

// Apply comprehensive security headers (CSP, HSTS, X-Headers)
app.use(securityHeaders);

// Apply Content Security Policy and security headers
app.use(contentSecurityPolicy);

// Add comprehensive request logging BEFORE body parsing
app.use(requestLogger);

// Add audit logging for authentication events
app.use(auditAuthEvents);

// Use the new hardened CORS middleware
app.use(corsMw);

// Mount health endpoints early (before auth)
app.use(healthRouter());
app.use(healthRoutes); // Add the new health routes with auth status

// Phase 3 Security: Setup uncaught exception handlers
setupUncaughtExceptionHandlers();

// Phase 3 Security: Enhanced API security middleware
app.use('/api', createApiSecurityMiddleware({
  maxRequestSize: 10 * 1024 * 1024, // 10MB limit
  maxComplexity: 100,
  enableSignatureValidation: false, // Disabled by default, can be enabled for critical operations
  trustedIPs: [],
  rateLimitByEndpoint: true
}));

// Phase 3 Security: Database query monitoring
app.use(monitorDatabaseQueries());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); // Parse cookies for session management

// REPLIT AUTH ONLY: Disabled dual session middleware - using single Replit OAuth system
// Session handling is now managed by Replit Auth in server/replitAuth.ts

// Admin protection for admin routes (if enabled)
app.use('/api/admin', protectAdmin);
app.use('/api/auth/admin', protectAdmin);

// CSRF protection for state-changing operations
app.use('/api', csrfProtection);

// Log application startup
logger.info('SERVER', 'Starting application', {
  env: ENV.NODE_ENV,
  port: ENV.PORT
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

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    // Production: Only serve static files for non-API routes
    // This prevents the catch-all in serveStatic from intercepting API routes
    const path = await import("path");
    const fs = await import("fs");
    const distPath = path.resolve(process.cwd(), "dist", "public");
    
    if (fs.existsSync(distPath)) {
      // Serve static files
      app.use(express.static(distPath));
      
      // Only catch non-API routes for client-side routing
      app.get("*", (req, res) => {
        // Skip API routes - they should 404 properly
        if (req.path.startsWith('/api/') || req.path.startsWith('/stripe/') || req.path.startsWith('/portal/')) {
          return res.status(404).json({ error: "Not Found" });
        }
        // Serve the React app for all other routes
        res.sendFile(path.resolve(distPath, "index.html"));
      });
    } else {
      // If dist folder doesn't exist, use the original serveStatic
      serveStatic(app);
    }
  }

  // Use error logger middleware
  app.use(errorLogger);
  
  // Phase 3 Security: Handle 404 errors for API routes only
  app.use('/api/*', notFoundHandler);
  
  // Phase 3 Security: Enhanced global error handler
  app.use(globalErrorHandler);

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
