import express from "express";
import { ObjectStorageService } from "../objectStorage";
import { protectRoute } from "../lib/auth";

const router = express.Router();

// Protect all image upload routes - admin only
router.use(protectRoute(['admin']));

// Get upload URL for product images
router.post("/upload-url", async (req, res) => {
  try {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

// Confirm image upload and get public URL
router.post("/confirm", async (req, res) => {
  try {
    const { uploadURL } = req.body;
    
    if (!uploadURL) {
      return res.status(400).json({ error: "uploadURL is required" });
    }

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