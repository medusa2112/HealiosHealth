import { Router } from "express";
import { requireAuth } from "../lib/auth";
import { storage } from "../storage";
import { insertProductBundleSchema, insertBundleItemSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// Get all bundles (admin only)
router.get("/", requireAuth, async (req, res) => {
  try {
    const bundles = await storage.getProductBundles();
    res.json(bundles);
  } catch (error) {
    console.error("Error fetching bundles:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get a specific bundle with items (admin only)
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const paramsSchema = z.object({
      id: z.string().min(1)
    });
    
    const result = paramsSchema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Invalid bundle ID',
        details: result.error.errors
      });
    }
    
    const { id } = result.data;
    const bundleWithItems = await storage.getBundleWithItems(id);
    
    if (!bundleWithItems) {
      return res.status(404).json({ error: "Bundle not found" });
    }
    
    res.json(bundleWithItems);
  } catch (error) {
    console.error("Error fetching bundle:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get variants excluding children's products (admin only - for bundle creation UI)
router.get("/variants/eligible", requireAuth, async (req, res) => {
  try {
    const querySchema = z.object({
      excludeTags: z.string().optional()
    });
    
    const result = querySchema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Invalid query parameters',
        details: result.error.errors
      });
    }
    
    const excludeTags = result.data.excludeTags ? 
      result.data.excludeTags.split(",").map(tag => tag.trim()) : 
      ["children"];
    
    const eligibleVariants = await storage.getVariantsExcludingTags(excludeTags);
    
    // Get product info for each variant
    const variantsWithProducts = [];
    
    for (const variant of eligibleVariants) {
      const product = await storage.getProductById(variant.productId);
      if (product) {
        variantsWithProducts.push({
          ...variant,
          product: {
            id: product.id,
            name: product.name,
            imageUrl: product.imageUrl,
            tags: product.tags
          }
        });
      }
    }
    
    res.json(variantsWithProducts);
  } catch (error) {
    console.error("Error fetching eligible variants:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new bundle (admin only)
router.post("/", requireAuth, async (req, res) => {
  try {
    const validationResult = insertProductBundleSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: "Invalid input", 
        details: validationResult.error.issues 
      });
    }

    const { name, description, price, originalPrice, imageUrl, isActive } = validationResult.data;

    const newBundle = await storage.createProductBundle({
      name,
      description,
      price,
      originalPrice,
      imageUrl,
      isActive: isActive ?? true,
    });

    // Log admin action
    if (req.user && req.user.id) {
      await storage.createAdminLog({
        adminId: req.user.id,
        actionType: "create_bundle",
        targetType: "bundle",
        targetId: newBundle.id,
        details: JSON.stringify({
          name: newBundle.name,
          price: newBundle.price,
          originalPrice: newBundle.originalPrice,
        }),
      });
    }

    res.status(201).json(newBundle);
  } catch (error) {
    console.error("Error creating bundle:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add items to bundle with children's product exclusion validation
router.post("/:id/items", requireAuth, async (req, res) => {
  try {
    const { id: bundleId } = req.params;
    const { items } = req.body; // Array of { variantId, quantity }
    
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Items array is required and cannot be empty" });
    }

    // Validate bundle exists
    const bundle = await storage.getProductBundleById(bundleId);
    if (!bundle) {
      return res.status(404).json({ error: "Bundle not found" });
    }

    // Validate each item and check for children's products
    const variantIds = items.map(item => item.variantId);
    const childrenVariants = [];

    for (const variantId of variantIds) {
      const variant = await storage.getProductVariant(variantId);
      if (!variant) {
        return res.status(400).json({ error: `Variant ${variantId} not found` });
      }
      
      const product = await storage.getProductById(variant.productId);
      if (product && product.tags?.includes("children")) {
        childrenVariants.push({
          variantId,
          productName: product.name,
          variantName: variant.name
        });
      }
    }

    // Enforce children's product exclusion
    if (childrenVariants.length > 0) {
      return res.status(400).json({ 
        error: "Children's products cannot be added to bundles", 
        details: {
          message: "The following variants are for children and cannot be bundled:",
          childrenVariants: childrenVariants
        }
      });
    }

    // Create bundle items
    const createdItems = [];
    for (const itemData of items) {
      const validationResult = insertBundleItemSchema.safeParse({
        bundleId,
        variantId: itemData.variantId,
        quantity: itemData.quantity || 1
      });

      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid bundle item data", 
          details: validationResult.error.issues 
        });
      }

      const bundleItem = await storage.createBundleItem(validationResult.data);
      createdItems.push(bundleItem);
    }

    // Log admin action
    if (req.user && req.user.id) {
      await storage.createAdminLog({
        adminId: req.user.id,
        actionType: "add_bundle_items",
        targetType: "bundle",
        targetId: bundleId,
        details: JSON.stringify({
          itemsAdded: items.length,
          variantIds: variantIds
        }),
      });
    }

    res.status(201).json({ 
      message: `Added ${createdItems.length} items to bundle`,
      items: createdItems 
    });
  } catch (error) {
    console.error("Error adding bundle items:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a bundle (admin only)
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const updateSchema = insertProductBundleSchema.partial();
    const validationResult = updateSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: "Invalid input", 
        details: validationResult.error.issues 
      });
    }

    const updates = validationResult.data;
    const updatedBundle = await storage.updateProductBundle(id, updates);
    
    if (!updatedBundle) {
      return res.status(404).json({ error: "Bundle not found" });
    }

    // Log admin action
    if (req.user && req.user.id) {
      await storage.createAdminLog({
        adminId: req.user.id,
        actionType: "update_bundle",
        targetType: "bundle",
        targetId: id,
        details: JSON.stringify(updates),
      });
    }

    res.json(updatedBundle);
  } catch (error) {
    console.error("Error updating bundle:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Remove item from bundle (admin only)
router.delete("/:bundleId/items/:itemId", requireAuth, async (req, res) => {
  try {
    const { bundleId, itemId } = req.params;
    
    const success = await storage.deleteBundleItem(itemId);
    
    if (!success) {
      return res.status(404).json({ error: "Bundle item not found" });
    }

    // Log admin action
    if (req.user && req.user.id) {
      await storage.createAdminLog({
        adminId: req.user.id,
        actionType: "remove_bundle_item",
        targetType: "bundle",
        targetId: bundleId,
        details: JSON.stringify({ removedItemId: itemId }),
      });
    }

    res.json({ message: "Bundle item removed successfully" });
  } catch (error) {
    console.error("Error removing bundle item:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a bundle (admin only)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get bundle for logging before deletion
    const bundle = await storage.getProductBundleById(id);
    if (!bundle) {
      return res.status(404).json({ error: "Bundle not found" });
    }
    
    const success = await storage.deleteProductBundle(id);
    
    if (!success) {
      return res.status(404).json({ error: "Bundle not found" });
    }

    // Log admin action
    if (req.user && req.user.id) {
      await storage.createAdminLog({
        adminId: req.user.id,
        actionType: "delete_bundle",
        targetType: "bundle",
        targetId: id,
        details: JSON.stringify({
          name: bundle.name,
          price: bundle.price,
        }),
      });
    }

    res.json({ message: "Bundle deleted successfully" });
  } catch (error) {
    console.error("Error deleting bundle:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;