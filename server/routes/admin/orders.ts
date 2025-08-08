import express from "express";
import { requireAuth } from "../../lib/auth";
import { storage } from "../../storage";
import { stripe } from "../../lib/stripe";
import { sendEmail } from "../../lib/email";

const router = express.Router();

// Get all orders for admin dashboard
router.get("/", requireAuth, async (req, res) => {
  try {
    const orders = await storage.getAllOrders();
    
    // Sort by most recent first
    const sortedOrders = orders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    res.json(sortedOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// Get specific order details
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const orderId = req.params.id;
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

// Process refund for an order
router.post("/:id/refund", requireAuth, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { amount, reason } = req.body;

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

// Update order status
router.put("/:id/status", requireAuth, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    if (!status || !["processing", "shipped", "delivered", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await storage.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await storage.updateOrderStatus(orderId, status);

    res.json({ 
      success: true, 
      message: `Order status updated to ${status}` 
    });

  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Failed to update order status" });
  }
});

// Get order statistics for dashboard
router.get("/stats/summary", requireAuth, async (req, res) => {
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