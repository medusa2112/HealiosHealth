import { Router } from "express";
import { storage } from "../storage";

const router = Router();

// Get all active bundles (public endpoint)
router.get("/", async (req, res) => {
  try {
    const bundles = await storage.getProductBundles();
    res.json(bundles);
  } catch (error) {
    console.error("Error fetching bundles:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get a specific bundle with items and product details (public endpoint)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const bundleWithItems = await storage.getBundleWithItems(id);
    
    if (!bundleWithItems || !bundleWithItems.isActive) {
      return res.status(404).json({ error: "Bundle not found" });
    }
    
    // Get full product details for each item
    const enrichedItems = [];
    
    for (const item of bundleWithItems.items) {
      const product = await storage.getProductById(item.variant.productId);
      if (product) {
        enrichedItems.push({
          ...item,
          variant: {
            ...item.variant,
            product: {
              id: product.id,
              name: product.name,
              description: product.description,
              imageUrl: product.imageUrl,
              categories: product.categories,
              tags: product.tags
            }
          }
        });
      }
    }
    
    const response = {
      ...bundleWithItems,
      items: enrichedItems,
      // Calculate savings
      totalIndividualPrice: enrichedItems.reduce((total, item) => {
        return total + (parseFloat(item.variant.price) * item.quantity);
      }, 0),
      savings: bundleWithItems.originalPrice ? 
        parseFloat(bundleWithItems.originalPrice) - parseFloat(bundleWithItems.price) : 0
    };
    
    res.json(response);
  } catch (error) {
    console.error("Error fetching bundle:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Validate bundle cart items (used during checkout)
router.post("/validate", async (req, res) => {
  try {
    const { bundleId, items } = req.body;
    
    if (!bundleId || !Array.isArray(items)) {
      return res.status(400).json({ error: "Bundle ID and items array required" });
    }
    
    const bundle = await storage.getProductBundleById(bundleId);
    if (!bundle || !bundle.isActive) {
      return res.status(404).json({ error: "Bundle not found or inactive" });
    }
    
    // Verify all items are valid and in stock
    const validationResults = [];
    let totalPrice = 0;
    
    for (const item of items) {
      const variant = await storage.getProductVariant(item.variantId);
      if (!variant) {
        validationResults.push({
          variantId: item.variantId,
          valid: false,
          error: "Variant not found"
        });
        continue;
      }
      
      if (!variant.inStock || (variant.stockQuantity || 0) < item.quantity) {
        validationResults.push({
          variantId: item.variantId,
          valid: false,
          error: "Insufficient stock"
        });
        continue;
      }
      
      const product = await storage.getProductById(variant.productId);
      if (product && product.tags?.includes("children")) {
        validationResults.push({
          variantId: item.variantId,
          valid: false,
          error: "Children's products cannot be in bundles"
        });
        continue;
      }
      
      validationResults.push({
        variantId: item.variantId,
        valid: true,
        price: parseFloat(variant.price) * item.quantity
      });
      
      totalPrice += parseFloat(variant.price) * item.quantity;
    }
    
    const isValid = validationResults.every(result => result.valid);
    
    res.json({
      valid: isValid,
      bundlePrice: parseFloat(bundle.price),
      individualTotal: totalPrice,
      savings: totalPrice - parseFloat(bundle.price),
      items: validationResults
    });
  } catch (error) {
    console.error("Error validating bundle:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;