import { Router } from "express";
import { requireAuth } from "../lib/auth";
import { storage } from "../storage";
import { insertDiscountCodeSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// Get all discount codes (admin only)
router.get("/", requireAuth, async (req, res) => {
  try {
    const discountCodes = await storage.getDiscountCodes();
    res.json(discountCodes);
  } catch (error) {
    console.error("Error fetching discount codes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new discount code (admin only)
router.post("/", requireAuth, async (req, res) => {
  try {
    const validationResult = insertDiscountCodeSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: "Invalid input", 
        details: validationResult.error.issues 
      });
    }

    const { code, type, value, usageLimit, expiresAt, isActive } = validationResult.data;

    // Check if code already exists
    const existingCode = await storage.getDiscountCodeByCode(code);
    if (existingCode) {
      return res.status(400).json({ error: "Discount code already exists" });
    }

    // Validate discount type and value
    if (!["percent", "fixed"].includes(type)) {
      return res.status(400).json({ error: "Invalid discount type. Must be 'percent' or 'fixed'" });
    }

    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue <= 0) {
      return res.status(400).json({ error: "Discount value must be a positive number" });
    }

    if (type === "percent" && numericValue > 100) {
      return res.status(400).json({ error: "Percentage discount cannot exceed 100%" });
    }

    const newDiscountCode = await storage.createDiscountCode({
      code: code.toUpperCase(),
      type,
      value: numericValue.toString(),
      usageLimit,
      expiresAt,
      isActive: isActive ?? true,
    });

    // Log admin action
    if (req.user && req.user.id) {
      await storage.createAdminLog({
        adminId: req.user.id,
        actionType: "create_discount_code",
        targetType: "discount_code",
        targetId: newDiscountCode.id,
        details: JSON.stringify({
          code: newDiscountCode.code,
          type: newDiscountCode.type,
          value: newDiscountCode.value,
          usageLimit: newDiscountCode.usageLimit,
          expiresAt: newDiscountCode.expiresAt,
        }),
      });
    }

    res.status(201).json(newDiscountCode);
  } catch (error) {
    console.error("Error creating discount code:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a discount code (admin only)
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const paramsSchema = z.object({
      id: z.string().min(1)
    });
    
    const paramsResult = paramsSchema.safeParse(req.params);
    if (!paramsResult.success) {
      return res.status(400).json({ 
        error: 'Invalid discount code ID',
        details: paramsResult.error.errors
      });
    }
    
    const { id } = paramsResult.data;
    
    const updateSchema = insertDiscountCodeSchema.partial();
    const validationResult = updateSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: "Invalid input", 
        details: validationResult.error.issues 
      });
    }

    const updates = validationResult.data;
    
    // Validate discount type and value if provided
    if (updates.type && !["percent", "fixed"].includes(updates.type)) {
      return res.status(400).json({ error: "Invalid discount type. Must be 'percent' or 'fixed'" });
    }

    if (updates.value) {
      const numericValue = parseFloat(updates.value);
      if (isNaN(numericValue) || numericValue <= 0) {
        return res.status(400).json({ error: "Discount value must be a positive number" });
      }

      if (updates.type === "percent" && numericValue > 100) {
        return res.status(400).json({ error: "Percentage discount cannot exceed 100%" });
      }
      
      updates.value = numericValue.toString();
    }

    // Check if trying to update code to existing code
    if (updates.code) {
      const existingCode = await storage.getDiscountCodeByCode(updates.code);
      if (existingCode && existingCode.id !== id) {
        return res.status(400).json({ error: "Discount code already exists" });
      }
      updates.code = updates.code.toUpperCase();
    }

    const updatedDiscountCode = await storage.updateDiscountCode(id, updates);
    if (!updatedDiscountCode) {
      return res.status(404).json({ error: "Discount code not found" });
    }

    // Log admin action
    if (req.user && req.user.id) {
      await storage.createAdminLog({
        adminId: req.user.id,
        actionType: "update_discount_code",
        targetType: "discount_code",
        targetId: id,
        details: JSON.stringify({
          updates,
          updated_code: updatedDiscountCode.code,
        }),
      });
    }

    res.json(updatedDiscountCode);
  } catch (error) {
    console.error("Error updating discount code:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a discount code (admin only)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const paramsSchema = z.object({
      id: z.string().min(1)
    });
    
    const result = paramsSchema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Invalid discount code ID',
        details: result.error.errors
      });
    }
    
    const { id } = result.data;
    
    // Get the discount code before deletion for logging
    const discountCodes = await storage.getDiscountCodes();
    const discountToDelete = discountCodes.find(code => code.id === id);
    
    if (!discountToDelete) {
      return res.status(404).json({ error: "Discount code not found" });
    }

    const success = await storage.deleteDiscountCode(id);
    if (!success) {
      return res.status(404).json({ error: "Discount code not found" });
    }

    // Log admin action
    if (req.user && req.user.id) {
      await storage.createAdminLog({
        adminId: req.user.id,
        actionType: "delete_discount_code",
        targetType: "discount_code",
        targetId: id,
        details: JSON.stringify({
          deleted_code: discountToDelete.code,
          deleted_type: discountToDelete.type,
          deleted_value: discountToDelete.value,
        }),
      });
    }

    res.json({ message: "Discount code deleted successfully" });
  } catch (error) {
    console.error("Error deleting discount code:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Validate a discount code (for frontend preview)
router.post("/validate", requireAuth, async (req, res) => {
  try {
    const validateSchema = z.object({
      code: z.string().min(1)
    });
    
    const result = validateSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Invalid input',
        details: result.error.errors
      });
    }
    
    const { code } = result.data;

    const validation = await storage.validateDiscountCode(code);
    res.json(validation);
  } catch (error) {
    console.error("Error validating discount code:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;