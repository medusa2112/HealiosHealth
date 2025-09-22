import express, { type NextFunction, type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import { serveStatic, log } from "./vite";
import { requestLogger, errorLogger } from "./middleware/requestLogger";
import { csrfProtection } from "./middleware/csrf";
import { contentSecurityPolicy } from "./middleware/csp";
import { logger } from "./lib/logger";
import { ENV } from "./config/env";
import { corsMw } from "./security/cors";
import { domainRedirectMiddleware } from "./middleware/domainRedirect";
import { healthRouter } from "./health";
import healthRoutes from "./routes/health";
import { securityHeaders } from "./middleware/security-headers";
import { enforceProductionConfig } from "./config/production-enforcer";
import { enforceProductionDefaults, logCookieAttributes } from "./config/production";
import { auditAuthEvents } from "./middleware/audit-logger";
import { globalErrorHandler, setupUncaughtExceptionHandlers, notFoundHandler } from "./middleware/errorHandler";
import { createApiSecurityMiddleware } from "./middleware/apiSecurity";
import { monitorDatabaseQueries } from "./middleware/databaseSecurity";

interface CreateAppOptions {
  enableStaticAssets?: boolean;
}

let hasSetupGlobalHandlers = false;

export async function createApp(options: CreateAppOptions = {}) {
  const app = express();

  try {
    enforceProductionConfig();
    enforceProductionDefaults();
    logCookieAttributes();
  } catch (error) {
    logger.error("CONFIG", "Production configuration error", { error });
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(securityHeaders);
  app.use(contentSecurityPolicy);
  app.use(requestLogger);
  app.use(auditAuthEvents);
  app.use(corsMw);
  app.use(domainRedirectMiddleware);

  app.use("/api", healthRouter());
  app.use("/api", healthRoutes);

  if (!hasSetupGlobalHandlers) {
    setupUncaughtExceptionHandlers();
    hasSetupGlobalHandlers = true;
  }

  app.use(
    "/api",
    createApiSecurityMiddleware({
      maxRequestSize: 10 * 1024 * 1024,
      maxComplexity: 100,
      enableSignatureValidation: false,
      trustedIPs: [],
      rateLimitByEndpoint: true,
    }),
  );

  app.use(monitorDatabaseQueries());

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());

  app.use("/api", csrfProtection);

  logger.info("SERVER", "Starting application", {
    env: ENV.NODE_ENV,
    port: ENV.PORT,
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, unknown> | undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson: any, ...args: any[]) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    } as typeof res.json;

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;

        if (process.env.NODE_ENV !== "production" && capturedJsonResponse) {
          const sensitiveEndpoints = ["/api/csrf", "/api/auth/", "/api/admin/"];
          const isSensitive = sensitiveEndpoints.some((endpoint) => path.includes(endpoint));

          if (!isSensitive) {
            logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
          }
        }

        if (logLine.length > 80) {
          logLine = `${logLine.slice(0, 79)}…`;
        }

        log(logLine);
      }
    });

    next();
  });

  await registerRoutes(app);

  const enableStaticAssets = options.enableStaticAssets ?? ENV.NODE_ENV !== "development";

  if (enableStaticAssets) {
    const path = await import("path");
    const fs = await import("fs");
    const distPath = path.resolve(process.cwd(), "dist", "public");

    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));

      app.get("*", (req, res) => {
        if (req.path.startsWith("/api/") || req.path.startsWith("/portal/")) {
          return res.status(404).json({ error: "Not Found" });
        }

        res.sendFile(path.resolve(distPath, "index.html"));
      });
    } else {
      serveStatic(app);
    }
  }

  app.use(errorLogger);
  app.use("/api/*", notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}
