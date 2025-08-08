import express from "express";
import { requireAuth } from "../../lib/auth";
import { storage } from "../../storage";

const router = express.Router();

// Admin cart routes - authentication required

// Get abandoned carts (not converted after specified time)
router.get("/", requireAuth, async (req, res) => {
  try {
    const hoursAgo = parseInt(req.query.hours as string) || 1;
    const thresholdTime = new Date(Date.now() - 1000 * 60 * 60 * hoursAgo);
    
    const abandonedCarts = await storage.getAbandonedCarts(hoursAgo);
    
    // Calculate analytics
    const analytics = {
      totalAbandoned: abandonedCarts.length,
      totalValue: abandonedCarts.reduce((sum, cart) => {
        const items = typeof cart.items === 'string' ? JSON.parse(cart.items) : cart.items;
        const cartValue = items.reduce((itemSum: number, item: any) => 
          itemSum + (item.price * item.quantity), 0);
        return sum + cartValue;
      }, 0),
      avgValue: 0,
      guestCarts: abandonedCarts.filter(cart => !cart.userId).length,
      registeredCarts: abandonedCarts.filter(cart => cart.userId).length
    };
    
    analytics.avgValue = analytics.totalAbandoned > 0 ? 
      analytics.totalValue / analytics.totalAbandoned : 0;
    
    res.json({
      carts: abandonedCarts,
      analytics,
      filters: {
        hoursAgo,
        thresholdTime: thresholdTime.toISOString()
      }
    });
  } catch (error) {
    console.error("Failed to fetch abandoned carts:", error);
    res.status(500).json({ message: "Failed to fetch abandoned carts" });
  }
});

// Get abandoned cart analytics summary
router.get("/analytics", requireAuth, async (req, res) => {
  try {
    const timeRanges = [1, 6, 24, 72]; // 1h, 6h, 24h, 72h
    const analytics: Record<string, {count: number, value: number, avgValue: number}> = {};
    
    for (const hours of timeRanges) {
      const carts = await storage.getAbandonedCarts(hours);
      
      const totalValue = carts.reduce((sum, cart) => {
        const items = typeof cart.items === 'string' ? JSON.parse(cart.items) : cart.items;
        return sum + items.reduce((itemSum: number, item: any) => 
          itemSum + (item.price * item.quantity), 0);
      }, 0);
      
      analytics[`${hours}h`] = {
        count: carts.length,
        value: totalValue,
        avgValue: carts.length > 0 ? totalValue / carts.length : 0
      };
    }
    
    res.json(analytics);
  } catch (error) {
    console.error("Failed to fetch cart analytics:", error);
    res.status(500).json({ message: "Failed to fetch cart analytics" });
  }
});

// Convert abandoned cart to order (recovery action)
router.post("/:cartId/recover", requireAuth, async (req, res) => {
  try {
    const { cartId } = req.params;
    const cart = await storage.getCartById(cartId);
    
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    
    if (cart.convertedToOrder) {
      return res.status(400).json({ message: "Cart already converted" });
    }
    
    // Mark as recovered (manual conversion)
    await storage.markCartAsConverted(cartId, 'manual_recovery');
    
    res.json({ 
      message: "Cart marked as recovered",
      cartId,
      recoveryMethod: 'manual_recovery'
    });
  } catch (error) {
    console.error("Failed to recover cart:", error);
    res.status(500).json({ message: "Failed to recover cart" });
  }
});

export default router;