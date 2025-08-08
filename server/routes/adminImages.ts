import express from "express";
import { body, validationResult } from "express-validator";
import { requireAuth } from "../lib/auth";
import { ObjectStorageService } from "../objectStorage";
import { protectRoute } from "../lib/auth";

const router = express.Router();

// Admin image upload routes - protected with authentication

// Get upload URL for product images
router.post("/upload-url", requireAuth, async (req, res) => {
  try {
    console.log("Admin image upload URL requested");
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    console.log("Upload URL generated successfully");
    res.json({ uploadURL });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

// Confirm image upload and get public URL
router.post("/confirm", [
  body('uploadURL').isURL().withMessage('uploadURL must be a valid URL'),
  requireAuth
], async (req, res) => {
  try {
    // Check for validation errors first
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }
    
    const uploadURL = req.body.uploadURL;

    const objectStorageService = new ObjectStorageService();
    const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);

    // Return the public accessible path
    res.json({ 
      imageUrl: objectPath,
      publicUrl: `${process.env.FRONTEND_URL || 'https://your-domain.replit.app'}${objectPath}`
    });
  } catch (error) {
    console.error("Error confirming image upload:", error);
    res.status(500).json({ error: "Failed to confirm image upload" });
  }
});

export default router;