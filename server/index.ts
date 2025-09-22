import { createServer } from "http";
import type { Server } from "http";
import { createApp } from "./app";
import { setupVite, log } from "./vite";
import { logger } from "./lib/logger";
import { ENV } from "./config/env";

export async function startServer(): Promise<Server> {
  const app = await createApp();
  const httpServer = createServer(app);

  if (ENV.NODE_ENV === "development") {
    await setupVite(app, httpServer);
  }

  const port = parseInt(process.env.PORT || "5000", 10);

  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
      logger.info("SERVER", "Application started successfully", {
        port,
        env: app.get("env"),
        host: "0.0.0.0",
      });
    },
  );

  return httpServer;
}

if (process.env.VERCEL !== "1") {
  startServer().catch((error) => {
    logger.error("SERVER", "Failed to start application", { error });
    process.exit(1);
  });
}

export default startServer;
