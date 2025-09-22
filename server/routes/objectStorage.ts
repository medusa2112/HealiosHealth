import type { Express } from "express";
import { z } from "zod";
import { requireAuth } from "../lib/auth";
import {
  ObjectStorageService,
  ObjectNotFoundError,
} from "../objectStorage";
import { ObjectPermission } from "../objectAcl";

export async function registerRoutes(app: Express): Promise<void> {
  // This endpoint is used to serve public assets.
  // IMPORTANT: always provide this endpoint.
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const paramsSchema = z.object({
      filePath: z.string().min(1)
    });
    
    const result = paramsSchema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Invalid file path',
        details: result.error.errors
      });
    }
    
    const filePath = result.data.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      // // console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // This endpoint is used to serve private objects that can be accessed publicly
  // (i.e.: without authentication and ACL check).
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      // // console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // This endpoint is used to get the upload URL for an object entity.
  app.post("/api/objects/upload", requireAuth, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  });

  // An example endpoint for updating the model state after an object entity is uploaded (product image in this case).
  app.put("/api/product-images", requireAuth, async (req, res) => {
    const bodySchema = z.object({
      imageURL: z.string().url()
    });
    
    const result = bodySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Invalid input',
        details: result.error.errors
      });
    }

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = objectStorageService.normalizeObjectEntityPath(
        req.body.imageURL,
      );

      // Return the normalized path for use in products
      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      // // console.error("Error setting product image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

}
