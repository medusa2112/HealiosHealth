import { Router, Request } from "express";
import { ImageOptimizer } from "../utils/imageOptimizer";
import { requireAuth, protectRoute } from "../lib/auth";
import multer from "multer";
import path from "path";
import fs from "fs/promises";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const router = Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'temp/uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Optimize single image upload
router.post("/optimize", requireAuth, protectRoute(['admin']), upload.single('image'), async (req: MulterRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const inputPath = req.file.path;
    const outputDir = "attached_assets/optimized";
    const outputPath = path.join(outputDir, `optimized_${Date.now()}.webp`);

    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    const options = {
      quality: parseInt(req.body.quality) || 80,
      width: req.body.width ? parseInt(req.body.width) : undefined,
      height: req.body.height ? parseInt(req.body.height) : undefined,
      format: (req.body.format || 'webp') as 'webp' | 'jpeg' | 'png'
    };

    const result = await ImageOptimizer.optimizeImage(inputPath, outputPath, options);

    // Clean up temp file
    await fs.unlink(inputPath);

    res.json({
      success: true,
      originalSize: result.originalSize,
      optimizedSize: result.optimizedSize,
      savings: result.savings,
      outputPath: outputPath.replace('attached_assets/', '/assets/')
    });

  } catch (error) {
    console.error("Image optimization error:", error);
    res.status(500).json({ error: "Failed to optimize image" });
  }
});

// Generate responsive image variants
router.post("/responsive", requireAuth, protectRoute(['admin']), upload.single('image'), async (req: MulterRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const inputPath = req.file.path;
    const outputDir = "attached_assets/responsive";
    const basename = path.parse(req.file.originalname).name;

    const variants = await ImageOptimizer.generateResponsiveImages(inputPath, outputDir, basename);

    // Clean up temp file
    await fs.unlink(inputPath);

    // Convert paths for client access
    const clientVariants = Object.entries(variants).reduce((acc, [key, path]) => {
      acc[key] = path.replace('attached_assets/', '/assets/');
      return acc;
    }, {} as { [key: string]: string });

    res.json({
      success: true,
      variants: clientVariants
    });

  } catch (error) {
    console.error("Responsive image generation error:", error);
    res.status(500).json({ error: "Failed to generate responsive images" });
  }
});

// Optimize existing assets directory
router.post("/optimize-assets", requireAuth, protectRoute(['admin']), async (req, res) => {
  try {
    const inputDir = "attached_assets";
    const outputDir = "attached_assets/optimized";

    const result = await ImageOptimizer.optimizeDirectory(inputDir, outputDir, {
      quality: 80,
      format: 'webp'
    });

    res.json({
      success: true,
      processed: result.processed,
      totalSavings: result.totalSavings
    });

  } catch (error) {
    console.error("Asset optimization error:", error);
    res.status(500).json({ error: "Failed to optimize assets" });
  }
});

// Get image information
router.get("/info/:filename", requireAuth, protectRoute(['admin']), async (req, res) => {
  try {
    const filename = req.params.filename;
    const imagePath = path.join("attached_assets", filename);

    const info = await ImageOptimizer.getImageInfo(imagePath);
    
    res.json({
      success: true,
      info
    });

  } catch (error) {
    console.error("Image info error:", error);
    res.status(500).json({ error: "Failed to get image info" });
  }
});

export default router;