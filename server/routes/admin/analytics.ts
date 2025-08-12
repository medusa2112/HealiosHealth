import { Router } from "express";
import { requireAdmin } from "../../mw/requireAdmin";
import { storage } from "../../storage";
import { z } from "zod";

const router = Router();

// Admin analytics stats endpoint
router.get("/stats", requireAdmin, async (req, res) => {
  try {
    // Get all orders for revenue and order calculations
    const orders = await storage.getAllOrders();
    const completedOrders = orders.filter(order => order.paymentStatus === 'completed');
    
    // Get all carts for abandoned cart calculation
    const carts = await storage.getAllCarts();
    const abandonedCarts = carts.filter(cart => 
      cart.items && cart.items.length > 0 && 
      new Date().getTime() - new Date(cart.updatedAt).getTime() > 24 * 60 * 60 * 1000 // 24 hours
    );
    
    // Get all users
    const users = await storage.getAllUsers();
    const customers = users.filter(user => user.role === 'customer');
    
    // Calculate metrics
    const totalOrders = completedOrders.length;
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalCustomers = customers.length;
    const abandonedCartsCount = abandonedCarts.length;
    
    // Calculate conversion rate (orders vs total sessions/carts)
    const totalSessions = carts.length + orders.length;
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
    console.error("Error fetching analytics stats:", error);
    res.status(500).json({ error: "Failed to fetch analytics stats" });
  }
});

// Summary stats for reorder analytics
router.get("/reorder-analytics/summary", requireAdmin, async (req, res) => {
  try {
    // Get all reorder logs if available
    const reorderLogs = await storage.getReorderLogs ? await storage.getReorderLogs() : [];
    
    const totalReorders = reorderLogs.length;
    const completedReorders = reorderLogs.filter(log => log.status === 'completed');
    const completionRate = totalReorders > 0 ? (completedReorders.length / totalReorders) * 100 : 0;
    
    // Calculate revenue from reorders if order data is available
    let totalRevenue = 0;
    if (completedReorders.length > 0) {
      const orders = await storage.getAllOrders();
      for (const reorder of completedReorders) {
        const order = orders.find(o => o.id === reorder.orderId);
        if (order && order.paymentStatus === 'completed') {
          totalRevenue += order.totalAmount;
        }
      }
    }
    
    res.json({
      totalReorders,
      completionRate: Math.round(completionRate * 10) / 10,
      totalRevenue,
      completedReorders: completedReorders.length
    });
  } catch (error) {
    console.error("Error fetching reorder analytics summary:", error);
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