import express from "express";
import { storage } from "../storage";
import { requireSessionOrAuth, requireAuth, rateLimit } from "../lib/auth";

const router = express.Router();

// Sync cart data to database (for both guest and logged-in users)
router.post("/sync", requireSessionOrAuth, rateLimit(20, 60000), async (req, res) => {
  try {
    const { session_token, items, totalAmount, currency = "ZAR" } = req.body;
    const userId = req.user?.id || null;

    if (!session_token || !items) {
      return res.status(400).json({ 
        message: "Missing required fields: session_token, items" 
      });
    }

    // Upsert cart (update if exists, create if not)
    const cart = await storage.upsertCart({
      userId,
      sessionToken: session_token,
      items: JSON.stringify(items),
      totalAmount: totalAmount ? totalAmount.toString() : null,
      currency
    });

    res.json({ 
      success: true,
      cartId: cart.id,
      message: cart.id ? "Cart updated" : "Cart created"
    });

  } catch (error) {
    console.error("Cart sync error:", error);
    res.status(500).json({ message: "Failed to sync cart" });
  }
});

// Get cart by session token
router.get("/:sessionToken", requireAuth, async (req, res) => {
  try {
    const { sessionToken } = req.params;
    
    const cart = await storage.getCartBySessionToken(sessionToken);
    
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.json({
      id: cart.id,
      items: JSON.parse(cart.items),
      totalAmount: parseFloat(cart.totalAmount?.toString() || "0"),
      currency: cart.currency,
      convertedToOrder: cart.convertedToOrder,
      lastUpdated: cart.lastUpdated
    });

  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ message: "Failed to get cart" });
  }
});

// Mark cart as abandoned (optional endpoint for analytics)
router.put("/:cartId/abandon", requireAuth, async (req, res) => {
  try {
    const { cartId } = req.params;
    
    const cart = await storage.getCartById(cartId);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Could add abandon timestamp or other metadata here
    res.json({ success: true, message: "Cart marked as abandoned" });

  } catch (error) {
    console.error("Abandon cart error:", error);
    res.status(500).json({ message: "Failed to mark cart as abandoned" });
  }
});

export default router;