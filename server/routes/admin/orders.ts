import express from "express";
import { z } from "zod";
import { requireAdmin } from '../../mw/requireAdmin';
import { storage } from "../../storage";
import { stripe } from "../../lib/stripe";
import { sendEmail } from "../../lib/email";
import { auditAction } from "../../lib/auditMiddleware";

const router = express.Router();

// Get all orders for admin dashboard with filtering support
router.get("/", requireAdmin, async (req, res) => {
  try {
    const querySchema = z.object({
      status: z.string().optional(),
      paymentStatus: z.string().optional(), 
      userId: z.string().optional(),
      customerEmail: z.string().optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
      limit: z.string().transform(val => parseInt(val) || 100).optional()
    });
    
    const queryResult = querySchema.safeParse(req.query);
    if (!queryResult.success) {
      return res.status(400).json({ 
        error: 'Invalid query parameters',
        details: queryResult.error.errors
      });
    }
    
    const filters = queryResult.data;
    let orders = await storage.getAllOrders();
    
    // Apply filters
    if (filters.status) {
      orders = orders.filter(o => o.orderStatus === filters.status);
    }
    if (filters.paymentStatus) {
      orders = orders.filter(o => o.paymentStatus === filters.paymentStatus);
    }
    if (filters.userId) {
      orders = orders.filter(o => o.userId === filters.userId);
    }
    if (filters.customerEmail) {
      orders = orders.filter(o => o.customerEmail.toLowerCase().includes(filters.customerEmail!.toLowerCase()));
    }
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      orders = orders.filter(o => new Date(o.createdAt) >= fromDate);
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      orders = orders.filter(o => new Date(o.createdAt) <= toDate);
    }
    
    // Sort by most recent first (descending date order)
    const sortedOrders = orders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Apply limit
    const limitedOrders = sortedOrders.slice(0, filters.limit || 100);
    
    res.json({
      orders: limitedOrders,
      total: orders.length,
      filtered: limitedOrders.length,
      filters: filters
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// Get specific order details
router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const paramsSchema = z.object({
      id: z.string().min(1)
    });
    
    const result = paramsSchema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Invalid order ID',
        details: result.error.errors
      });
    }
    
    const orderId = result.data.id;
    const order = await storage.getOrderById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Get order items for this order
    const orderItems = await storage.getOrderItemsByOrderId(orderId);
    
    res.json({
      ...order,
      items: orderItems
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ message: "Failed to fetch order details" });
  }
});

// Process refund for an order with audit logging
router.post("/:id/refund", requireAdmin, auditAction('process_refund', 'order'), async (req, res) => {
  try {
    const paramsSchema = z.object({
      id: z.string().min(1)
    });
    
    const paramsResult = paramsSchema.safeParse(req.params);
    if (!paramsResult.success) {
      return res.status(400).json({ 
        error: 'Invalid order ID',
        details: paramsResult.error.errors
      });
    }
    
    const bodySchema = z.object({
      amount: z.number().positive().optional(),
      reason: z.string().optional()
    });
    
    const bodyResult = bodySchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({ 
        error: 'Invalid refund data',
        details: bodyResult.error.errors
      });
    }
    
    const orderId = paramsResult.data.id;
    const { amount, reason } = bodyResult.data;

    const order = await storage.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if order is already refunded
    if (order.refundStatus === "refunded") {
      return res.status(400).json({ message: "Order already refunded" });
    }

    // Check if order has a valid Stripe payment intent
    if (!order.stripePaymentIntentId) {
      return res.status(400).json({ message: "No Stripe payment intent found for this order" });
    }

    // Create refund with Stripe
    const refundData: any = {
      payment_intent: order.stripePaymentIntentId,
    };

    // Add amount if partial refund requested
    if (amount && amount < parseFloat(order.totalAmount.toString())) {
      refundData.amount = Math.round(amount * 100); // Convert to cents
    }

    // Add reason if provided
    if (reason) {
      refundData.metadata = { reason };
    }

    const refund = await stripe.refunds.create(refundData);

    // Update order status in database
    await storage.updateOrderRefundStatus(orderId, "refunded");

    // Send refund confirmation email to customer
    if (order.customerEmail) {
      try {
        await sendEmail(order.customerEmail, "refund", {
          amount: refund.amount / 100,
          id: refund.payment_intent as string,
          customerName: order.customerName
        });
        console.log("Refund confirmation email sent to:", order.customerEmail);
      } catch (emailError) {
        console.error("Failed to send refund email:", emailError);
      }
    }

    res.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
        created: refund.created
      },
      message: "Refund processed successfully"
    });

  } catch (error: any) {
    console.error("Refund failed:", error);
    
    // Handle Stripe-specific errors
    if (error.type === 'StripeCardError' || error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({ 
        error: "Refund failed", 
        details: error.message 
      });
    }
    
    res.status(500).json({ 
      error: "Refund failed", 
      details: "Internal server error" 
    });
  }
});

// Update order status with audit logging and validation
router.put("/:id/status", requireAdmin, auditAction('update_order_status', 'order'), async (req, res) => {
  try {
    const paramsSchema = z.object({
      id: z.string().min(1)
    });
    
    const paramsResult = paramsSchema.safeParse(req.params);
    if (!paramsResult.success) {
      return res.status(400).json({ 
        error: 'Invalid order ID',
        details: paramsResult.error.errors
      });
    }
    
    const bodySchema = z.object({
      status: z.enum(["processing", "shipped", "delivered", "cancelled"]),
      reason: z.string().optional()
    });
    
    const bodyResult = bodySchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({ 
        error: 'Invalid status',
        details: bodyResult.error.errors
      });
    }
    
    const orderId = paramsResult.data.id;
    const { status, reason } = bodyResult.data;

    const order = await storage.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Validate status transitions (prevent invalid status changes)
    const currentStatus = order.orderStatus;
    const validTransitions: Record<string, string[]> = {
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered', 'cancelled'], 
      'delivered': [], // No transitions from delivered
      'cancelled': [] // No transitions from cancelled
    };
    
    if (currentStatus && !validTransitions[currentStatus]?.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status transition',
        message: `Cannot change status from '${currentStatus}' to '${status}'`,
        validTransitions: validTransitions[currentStatus] || []
      });
    }

    const updatedOrder = await storage.updateOrderStatus(orderId, status);
    
    if (!updatedOrder) {
      return res.status(500).json({ message: "Failed to update order status" });
    }

    // Log the status change (audit logging handled by middleware)
    console.log(`[ORDER_STATUS] Order ${orderId} status changed from '${currentStatus}' to '${status}' by admin`);

    res.json({ 
      success: true, 
      message: `Order status updated to ${status}`,
      order: {
        id: updatedOrder.id,
        orderStatus: updatedOrder.orderStatus,
        previousStatus: currentStatus
      }
    });

  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Failed to update order status" });
  }
});

// Get order statistics for dashboard
router.get("/stats/summary", requireAdmin, async (req, res) => {
  try {
    const orders = await storage.getAllOrders();
    
    const stats = {
      totalOrders: orders.length,
      completedOrders: orders.filter(o => o.paymentStatus === 'completed').length,
      refundedOrders: orders.filter(o => o.refundStatus === 'refunded').length,
      disputedOrders: orders.filter(o => o.disputeStatus === 'disputed').length,
      totalRevenue: orders
        .filter(o => o.paymentStatus === 'completed' && o.refundStatus !== 'refunded')
        .reduce((sum, o) => sum + parseFloat(o.totalAmount.toString()), 0),
      pendingOrders: orders.filter(o => o.paymentStatus === 'pending').length,
      processingOrders: orders.filter(o => o.orderStatus === 'processing').length,
      shippedOrders: orders.filter(o => o.orderStatus === 'shipped').length,
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching order stats:", error);
    res.status(500).json({ message: "Failed to fetch order statistics" });
  }
});

export default router;