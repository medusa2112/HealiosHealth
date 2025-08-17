import { Router } from "express";
import { requireAdmin } from "../../mw/requireAdmin";
import { storage } from "../../storage";
import { z } from "zod";

const router = Router();

// Admin analytics stats endpoint
router.get("/stats", requireAdmin, async (req, res) => {
  try {
    // Get all orders for revenue and order calculations
    let orders = [];
    let totalOrders = 0;
    let totalRevenue = 0;
    let completedOrders = [];
    
    try {
      if (storage.getAllOrders) {
        orders = await storage.getAllOrders();
        completedOrders = orders.filter(order => order.paymentStatus === 'completed');
        totalOrders = completedOrders.length;
        totalRevenue = completedOrders.reduce((sum, order) => sum + (parseFloat(order.totalAmount) || 0), 0);
      }
    } catch (error) {
      
    }
    
    // Get abandoned carts if available
    let abandonedCartsCount = 0;
    let totalSessions = orders.length;
    
    try {
      // Try to get carts using the correct storage method
      if (storage.getAllCarts) {
        const carts = await storage.getAllCarts();
        const abandonedCarts = carts.filter(cart => 
          cart.items && cart.items.length > 0 && 
          cart.lastUpdated && new Date().getTime() - new Date(cart.lastUpdated).getTime() > 24 * 60 * 60 * 1000 // 24 hours
        );
        abandonedCartsCount = abandonedCarts.length;
        totalSessions += carts.length;
      } else if (storage.getAbandonedCarts) {
        const abandonedCarts = await storage.getAbandonedCarts(24);
        abandonedCartsCount = abandonedCarts.length;
      }
    } catch (error) {
      
    }
    
    // Get all users if available
    let totalCustomers = 0;
    try {
      if (storage.getAllUsers) {
        const users = await storage.getAllUsers();
        const customers = users.filter(user => user.role === 'customer');
        totalCustomers = customers.length;
      }
    } catch (error) {
      
    }
    
    // Calculate conversion rate (orders vs total sessions/carts)
    const conversionRate = totalSessions > 0 ? (totalOrders / totalSessions) * 100 : 0;
    
    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const stats = {
      totalOrders,
      totalRevenue,
      totalCustomers,
      abandonedCarts: abandonedCartsCount,
      conversionRate: Math.round(conversionRate * 10) / 10, // Round to 1 decimal
      averageOrderValue: Math.round(averageOrderValue)
    };
    
    res.json(stats);
  } catch (error) {
    // // console.error("Error fetching analytics stats:", error);
    res.status(500).json({ error: "Failed to fetch analytics stats" });
  }
});

// Summary stats for reorder analytics
router.get("/reorder-analytics/summary", requireAdmin, async (req, res) => {
  try {
    // Try to get reorder logs if available, but handle gracefully if not
    let reorderLogs: any[] = [];
    try {
      if (storage.getReorderLogs) {
        reorderLogs = await storage.getReorderLogs();
      }
    } catch (error) {
      // Reorder logs not available
    }
    
    const totalReorders = reorderLogs.length;
    const completedReorders = reorderLogs.filter(log => log.status === 'completed');
    const completionRate = totalReorders > 0 ? (completedReorders.length / totalReorders) * 100 : 0;
    
    // Calculate revenue from reorders if order data is available
    let totalRevenue = 0;
    if (completedReorders.length > 0) {
      try {
        if (storage.getAllOrders) {
          const orders = await storage.getAllOrders();
          for (const reorder of completedReorders) {
            const order = orders.find(o => o.id === reorder.orderId);
            if (order && order.paymentStatus === 'completed') {
              totalRevenue += parseFloat(order.totalAmount) || 0;
            }
          }
        }
      } catch (error) {
        
      }
    }
    
    res.json({
      totalReorders,
      completionRate: Math.round(completionRate * 10) / 10,
      totalRevenue,
      completedReorders: completedReorders.length
    });
  } catch (error) {
    // // console.error("Error fetching reorder analytics summary:", error);
    // Return default values if reorder functionality is not implemented
    res.json({
      totalReorders: 0,
      completionRate: 0,
      totalRevenue: 0,
      completedReorders: 0
    });
  }
});

export default router;