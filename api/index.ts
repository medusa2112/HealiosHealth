import type { IncomingMessage, ServerResponse } from "http";
import type { Express } from "express";
import { createApp } from "../server/app";

let appPromise: Promise<Express> | null = null;

async function getApp() {
  if (!appPromise) {
    appPromise = createApp({ enableStaticAssets: true });
  }

  return appPromise;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const app = await getApp();

  return new Promise<void>((resolve, reject) => {
    app(req as any, res as any, (err: unknown) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

