// PHASE 18: Subscription routes for auto-refill functionality
import { Router } from "express";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { db } from "../db";
import { subscriptions, productVariants, insertSubscriptionSchema } from "@shared/schema";
import { eq } from "drizzle-orm";
import { protectRoute } from "../lib/auth";
import { storage } from "../storage";
// Phase 3 Security: Import enhanced payment security
import { 
  paymentFraudDetection, 
  validateIdempotencyKey, 
  securePaymentLogging 
} from "../middleware/paymentSecurity";
import { securityEventLogger } from "../middleware/securityMonitoring";

const router = Router();

// Phase 3 Security: Enhanced subscription checkout with fraud detection
router.post("/checkout", 
  protectRoute(["customer", "admin"]),
  securityEventLogger('authentication', 'medium'),
  paymentFraudDetection(),
  validateIdempotencyKey(),
  securePaymentLogging(),
  async (req, res) => {
  try {
    const createSubscriptionSchema = z.object({
      variantId: z.string(),
      quantity: z.number().min(1).default(1),
    });

    const validation = createSubscriptionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: fromZodError(validation.error).toString(),
      });
    }

    const { variantId, quantity } = validation.data;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Get product variant with subscription info
    const variant = await storage.getProductVariant(variantId);
    if (!variant) {
      return res.status(404).json({ error: "Product variant not found" });
    }

    // PayStack subscription functionality not yet implemented
    return res.status(501).json({ error: "Subscription functionality not yet available with PayStack" });

  } catch (error) {
    // // console.error("Subscription checkout error:", error);
    res.status(500).json({ error: "Failed to create subscription checkout" });
  }
});

// Get user's subscriptions
router.get("/", protectRoute(["customer", "admin"]), async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userSubscriptions = await storage.getUserSubscriptions(userId);
    res.json(userSubscriptions);

  } catch (error) {
    // // console.error("Get subscriptions error:", error);
    res.status(500).json({ error: "Failed to get subscriptions" });
  }
});

// Cancel subscription
router.post("/:id/cancel", protectRoute(["customer", "admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const subscription = await storage.getSubscription(id);
    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    if (subscription.userId !== userId && req.user?.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // PayStack subscription cancellation not yet implemented
    return res.status(501).json({ error: "Subscription cancellation not yet available with PayStack" });

    // Update local subscription record
    await storage.updateSubscription(id, {
      status: "canceled",
      cancelAt: new Date().toISOString(),
    });

    res.json({ success: true, message: "Subscription will be canceled at the end of the current period" });

  } catch (error) {
    // // console.error("Cancel subscription error:", error);
    res.status(500).json({ error: "Failed to cancel subscription" });
  }
});

// Reactivate subscription (if canceled but not yet expired)
router.post("/:id/reactivate", protectRoute(["customer", "admin"]), async (req, res) => {
  try {
    const paramsSchema = z.object({
      id: z.string().min(1)
    });
    
    const parsed = paramsSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
    }
    
    const { id } = parsed.data;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const subscription = await storage.getSubscription(id);
    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    if (subscription.userId !== userId && req.user?.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // PayStack subscription reactivation not yet implemented
    return res.status(501).json({ error: "Subscription reactivation not yet available with PayStack" });

    // Update local subscription record
    await storage.updateSubscription(id, {
      status: "active",
      cancelAt: null,
    });

    res.json({ success: true, message: "Subscription reactivated" });

  } catch (error) {
    // // console.error("Reactivate subscription error:", error);
    res.status(500).json({ error: "Failed to reactivate subscription" });
  }
});

// Admin: Get all subscriptions
router.get("/admin", protectRoute(["admin"]), async (req, res) => {
  try {
    const allSubscriptions = await storage.getAllSubscriptions();
    res.json(allSubscriptions);

  } catch (error) {
    // // console.error("Admin get subscriptions error:", error);
    res.status(500).json({ error: "Failed to get all subscriptions" });
  }
});

export { router as subscriptionRoutes };