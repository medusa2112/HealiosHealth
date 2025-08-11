import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // In development, use memory store so sessions don't persist across server restarts
  // In production, use PostgreSQL store for persistence
  let sessionStore;
  if (process.env.NODE_ENV === 'development') {
    // Memory store - sessions lost on server restart (good for development)
    sessionStore = undefined; // Use default memory store
    console.log('[SESSION] Using memory store - sessions will not persist across server restarts');
  } else {
    // PostgreSQL store for production persistence
    const pgStore = connectPg(session);
    sessionStore = new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
      ttl: sessionTtl,
      tableName: "sessions",
    });
    console.log('[SESSION] Using PostgreSQL store - sessions will persist');
  }
  
  return session({
    secret: process.env.SESSION_SECRET!,
    name: 'healios.sid', // Custom session name to avoid default 'connect.sid'
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true, // Reset expiration on activity
    cookie: {
      httpOnly: true, // Prevent XSS access to cookies
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict', // CSRF protection via SameSite
      maxAge: process.env.NODE_ENV === 'production' ? sessionTtl : 2 * 60 * 60 * 1000, // 2 hours in dev, 1 week in prod
    },
  });
}

// SECURITY: Store tokens in session, not on user object to prevent exposure
function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  // SECURITY FIX: Store tokens in internal properties to prevent JSON serialization exposure
  user._internal_access_token = tokens.access_token;
  user._internal_refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
  
  // DO NOT expose tokens as public properties:
  // user.access_token = tokens.access_token; // REMOVED for security
  // user.refresh_token = tokens.refresh_token; // REMOVED for security
}

async function upsertUser(
  claims: any,
) {
  const { determineUserRole } = await import('./lib/auth');
  const role = determineUserRole(claims["email"]);
  
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
    role, // Assign role during user creation
  });
  
  console.log(`[REPLIT_AUTH] User upserted: ${claims["email"]} with role: ${role}`);
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    try {
      const claims = tokens.claims();
      if (!claims) {
        console.error('[OAUTH_VERIFY] No claims found in tokens');
        return verified(new Error('No claims found'));
      }
      console.log(`[OAUTH_VERIFY] Processing user: ${claims["email"]} with ID: ${claims["sub"]}`);
      
      // First ensure user is properly stored
      if (!claims) {
        console.error('[OAUTH_VERIFY] Claims is undefined, cannot upsert user');
        return verified(new Error('Claims undefined'));
      }
      await upsertUser(claims);
      
      // Small delay to ensure storage completes
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify the user was stored
      if (!claims?.sub) {
        console.error('[OAUTH_VERIFY] Claims.sub is undefined');
        return verified(new Error('Claims.sub undefined'));
      }
      const dbUser = await storage.getUserById(claims["sub"]);
      
      if (!dbUser) {
        console.error(`[OAUTH_VERIFY] Failed to store/retrieve user with ID: ${claims["sub"]}`);
        return verified(new Error('Failed to store user'));
      }
      
      console.log(`[OAUTH_VERIFY] User successfully stored/retrieved: ${dbUser.email} with role: ${dbUser.role}`);
      
      const user = {};
      updateUserSession(user, tokens);
      
      const enrichedUser = {
        ...user,
        ...dbUser,
        claims: claims,
        userId: dbUser.id
      };
      verified(null, enrichedUser);
    } catch (error) {
      console.error(`[OAUTH_VERIFY] Error during verification:`, error);
      verified(error as Error);
    }
  };

  for (const domain of process.env
    .REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => {
    // Store the user data including database fields
    const serializedUser = {
      id: (user as any).id,
      email: (user as any).email,
      role: (user as any).role,
      firstName: (user as any).firstName,
      lastName: (user as any).lastName,
      claims: (user as any).claims,
      userId: (user as any).id,
      // SECURITY: Use internal token storage
      _internal_access_token: (user as any)._internal_access_token,
      _internal_refresh_token: (user as any)._internal_refresh_token,
      expires_at: (user as any).expires_at
    };
    console.log(`[REPLIT_AUTH] Serializing user: ${serializedUser.email} (${serializedUser.role})`);
    cb(null, serializedUser);
  });
  
  passport.deserializeUser(async (serializedUser: any, cb) => {
    try {
      // Handle case where no user data exists (public endpoints)
      if (!serializedUser) {
        return cb(null, false);
      }
      
      // Refresh user data from database to ensure current role/info
      if (serializedUser.id && storage.getUserById) {
        try {
          const currentUser = await storage.getUserById(serializedUser.id);
          if (currentUser) {
            const user = {
              ...currentUser,
              claims: serializedUser.claims,
              userId: currentUser.id,
              // SECURITY: Use internal token storage
              _internal_access_token: serializedUser._internal_access_token,
              _internal_refresh_token: serializedUser._internal_refresh_token,
              expires_at: serializedUser.expires_at
            };
            console.log(`[REPLIT_AUTH] Deserialized user: ${user.email} (${user.role})`);
            return cb(null, user);
          }
        } catch (storageError) {
          console.error('[REPLIT_AUTH] Storage error during deserialization:', storageError);
          // Continue with serialized user if storage fails
        }
      }
      cb(null, serializedUser);
    } catch (error) {
      console.error('[REPLIT_AUTH] Deserialization error:', error);
      // Return false instead of failing to prevent 500 errors on public endpoints
      cb(null, false);
    }
  });

  app.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      failureRedirect: "/api/login",
    })(req, res, (err: any) => {
      if (err) {
        console.error('[OAUTH_CALLBACK] Authentication error:', err);
        return res.redirect('/api/login');
      }

      // Check if user is authenticated
      if (!req.user) {
        console.log('[OAUTH_CALLBACK] No user in session after authentication');
        return res.redirect('/api/login');
      }

      // Check if this is an admin login attempt
      const isAdminLogin = (req.session as any)?.adminLoginAttempt || (req.session as any)?.adminLoginRedirect;
      const userEmail = (req.user as any).email;
      const userRole = (req.user as any).role;
      
      console.log(`[OAUTH_CALLBACK] Authenticated user: ${userEmail}, role: ${userRole}, adminLogin: ${isAdminLogin}`);
      
      // Check if user is an admin (either by role or by email)
      const adminEmails = (process.env.ALLOWED_ADMIN_EMAILS || '').split(',').map(e => e.trim());
      const isAdmin = userRole === 'admin' || adminEmails.includes(userEmail);
      
      if (isAdminLogin && isAdmin) {
        console.log('[OAUTH_CALLBACK] Admin login successful - redirecting to admin dashboard');
        // Clear admin login flags
        delete (req.session as any).adminLoginAttempt;
        delete (req.session as any).adminLoginRedirect;
        return res.redirect('/admin');
      } else if (isAdminLogin && !isAdmin) {
        console.log('[OAUTH_CALLBACK] Admin login failed - user is not an admin');
        // Clear session and redirect to admin login with error
        req.logout(() => {
          req.session.destroy(() => {
            res.redirect('/admin/login?error=not_authorized');
          });
        });
      } else if (userRole === 'admin') {
        console.log('[OAUTH_CALLBACK] Admin user logged in - redirecting to admin dashboard');
        return res.redirect('/admin');
      } else {
        console.log('[OAUTH_CALLBACK] Customer user logged in - redirecting to homepage');
        return res.redirect('/');
      }
    });
  });

  app.get("/api/logout", async (req, res) => {
    const user = req.user as any;
    const userId = user?.id || user?.userId || (req.session as any)?.userId;

    req.logout(async () => {
      if (userId) {
        try {
          const { auditLogout } = await import("./lib/auditMiddleware");
          await auditLogout(userId);
        } catch (error) {
          console.error("[REPLIT_AUTH] Logout audit failed:", error);
        }
      }

      if (req.session) {
        req.session.destroy(err => {
          if (err) console.error("[REPLIT_AUTH] Session destroy error:", err);
        });
      }

      res.clearCookie('healios.sid', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  // SECURITY: Get refresh token from internal storage
  const refreshToken = (user as any)._internal_refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};