import express from "express";
import { stripe } from "../lib/stripe";
import { storage } from "../storage";

const router = express.Router();

// Stripe webhook handler - must use raw body parser for signature verification
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error("STRIPE_WEBHOOK_SECRET is not configured");
      return res.status(500).send("Webhook secret not configured");
    }

    event = stripe.webhooks.constructEvent(
      req.body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const data = event.data.object;
  console.log(`Processing Stripe webhook: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = data as Stripe.Checkout.Session;
        console.log("Checkout session completed:", session.id);
        
        // Check if order already exists to prevent duplicates
        const existingOrder = await storage.getOrderByStripeSessionId(session.id);
        if (existingOrder) {
          console.log("Order already exists for session:", session.id);
          break;
        }

        // Create new order from session data
        const orderData = {
          userId: session.metadata?.userId || null,
          customerEmail: session.customer_details?.email || session.metadata?.customerEmail || "",
          customerName: session.customer_details?.name || session.metadata?.customerName || "",
          customerPhone: session.customer_details?.phone || session.metadata?.customerPhone || "",
          shippingAddress: JSON.stringify(session.shipping_details || session.customer_details?.address || {}),
          billingAddress: JSON.stringify(session.customer_details?.address || {}),
          orderItems: session.metadata?.orderItems || "[]",
          totalAmount: (session.amount_total! / 100).toString(), // Convert from cents
          currency: session.currency?.toUpperCase() || "ZAR",
          paymentStatus: "completed",
          orderStatus: "processing",
          refundStatus: "none",
          disputeStatus: "none",
          stripePaymentIntentId: session.payment_intent as string || null,
          stripeSessionId: session.id,
          notes: session.metadata?.notes || null,
        };

        const newOrder = await storage.createOrder(orderData);
        console.log("Created order:", newOrder.id);

        // Send confirmation email if available
        if (orderData.customerEmail) {
          try {
            // TODO: Integrate with email service
            console.log("Order confirmation email should be sent to:", orderData.customerEmail);
          } catch (emailError) {
            console.error("Failed to send confirmation email:", emailError);
          }
        }
        break;

      case "charge.refunded":
        const refundedCharge = data as Stripe.Charge;
        console.log("Charge refunded:", refundedCharge.id);
        
        const refundOrder = await storage.getOrderByStripePaymentIntent(refundedCharge.payment_intent as string);
        if (refundOrder) {
          await storage.updateOrderRefundStatus(refundOrder.id, "refunded");
          console.log("Updated refund status for order:", refundOrder.id);
        }
        break;

      case "charge.dispute.created":
        const disputedCharge = data as Stripe.Charge;
        console.log("Charge disputed:", disputedCharge.id);
        
        const disputeOrder = await storage.getOrderByStripePaymentIntent(disputedCharge.payment_intent as string);
        if (disputeOrder) {
          await storage.updateOrderDisputeStatus(disputeOrder.id, "disputed");
          console.log("Updated dispute status for order:", disputeOrder.id);
        }
        break;

      case "payment_intent.payment_failed":
        const failedPayment = data as Stripe.PaymentIntent;
        console.warn("Payment failed:", failedPayment.id, failedPayment.last_payment_error?.message);
        
        // Update order status if exists
        const failedOrder = await storage.getOrderByStripePaymentIntent(failedPayment.id);
        if (failedOrder) {
          await storage.updateOrderPaymentStatus(failedOrder.id, "failed");
          console.log("Updated payment status to failed for order:", failedOrder.id);
        }
        break;

      default:
        console.log(`Unhandled Stripe webhook event: ${event.type}`);
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    return res.status(500).send("Webhook processing failed");
  }

  // Acknowledge receipt of the event
  res.status(200).json({ received: true });
});

export default router;