// PHASE 18: Subscription routes for auto-refill functionality
import { Router } from "express";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import Stripe from "stripe";
import { db } from "../db";
import { subscriptions, productVariants, insertSubscriptionSchema } from "@shared/schema";
import { eq } from "drizzle-orm";
import { protectRoute } from "../lib/auth";
import { storage } from "../storage";

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-06-30.basil' });

// Create subscription checkout session
router.post("/checkout", protectRoute(["customer", "admin"]), async (req, res) => {
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

    if (!variant.subscriptionEnabled || !variant.subscriptionPriceId) {
      return res.status(400).json({ error: "Subscription not available for this product" });
    }

    // Create or get Stripe customer
    const user = await storage.getUser(userId);
    let stripeCustomerId = user?.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user?.email,
        metadata: { userId },
      });
      stripeCustomerId = customer.id;

      // Update user with Stripe customer ID
      await storage.updateUser(userId, { stripeCustomerId });
    }

    // Create subscription checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [{
        price: variant.subscriptionPriceId,
        quantity,
      }],
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/portal/subscriptions?success=true`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/products/${variant.productId}`,
      metadata: {
        userId,
        variantId,
        quantity: quantity.toString(),
      },
    });

    res.json({ url: session.url });

  } catch (error) {
    console.error("Subscription checkout error:", error);
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
    console.error("Get subscriptions error:", error);
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

    // Cancel at period end in Stripe
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Update local subscription record
    await storage.updateSubscription(id, {
      status: "canceled",
      cancelAt: new Date().toISOString(),
    });

    res.json({ success: true, message: "Subscription will be canceled at the end of the current period" });

  } catch (error) {
    console.error("Cancel subscription error:", error);
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

    // Reactivate in Stripe
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    // Update local subscription record
    await storage.updateSubscription(id, {
      status: "active",
      cancelAt: null,
    });

    res.json({ success: true, message: "Subscription reactivated" });

  } catch (error) {
    console.error("Reactivate subscription error:", error);
    res.status(500).json({ error: "Failed to reactivate subscription" });
  }
});

// Admin: Get all subscriptions
router.get("/admin", protectRoute(["admin"]), async (req, res) => {
  try {
    const allSubscriptions = await storage.getAllSubscriptions();
    res.json(allSubscriptions);

  } catch (error) {
    console.error("Admin get subscriptions error:", error);
    res.status(500).json({ error: "Failed to get all subscriptions" });
  }
});

export { router as subscriptionRoutes };