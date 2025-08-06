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

        // Phase 7: Mark cart as converted when checkout session is completed
        if (session.metadata?.sessionToken) {
          try {
            await storage.markCartAsConverted(session.metadata.sessionToken, session.id);
            console.log("Cart marked as converted for session:", session.metadata.sessionToken);
          } catch (error) {
            console.error('Failed to mark cart as converted:', error);
          }
        }

        // Phase 13: Enhanced Reorder Completion Tracking and Email Automation
        if (session.metadata?.type === 'reorder') {
          try {
            const originalOrderId = session.metadata.original_order_id;
            const reorderLogId = session.metadata.reorder_log_id;
            const userId = session.metadata.user_id;
            const channel = session.metadata.channel || 'customer_portal';

            // Create comprehensive reorder completion log
            await storage.createReorderLog({
              userId: userId || 'guest',
              originalOrderId: originalOrderId,
              newOrderId: newOrder.id,
              status: 'completed',
              reorderType: 'manual_customer_portal',
              channel: channel,
              itemsCount: session.metadata.itemsCount ? parseInt(session.metadata.itemsCount) : 0,
              originalAmount: session.metadata.originalAmount ? parseFloat(session.metadata.originalAmount) : 0,
              newAmount: session.amount_total! / 100,
              stripeSessionId: session.id,
              stripePaymentIntentId: session.payment_intent as string || '',
              metadata: {
                completedAt: new Date().toISOString(),
                paymentMethod: session.payment_method_types?.[0],
                conversionTime: reorderLogId ? 'tracked_from_initiation' : 'direct_completion',
                customerEmail: orderData.customerEmail,
                reorderSuccess: true,
                webhookProcessed: true
              }
            });

            console.log('🎉 Phase 13: Reorder completed successfully with comprehensive webhook tracking:', {
              newOrderId: newOrder.id,
              originalOrderId: originalOrderId,
              amount: session.amount_total! / 100,
              channel: channel
            });

            // Send specialized reorder confirmation email
            try {
              const { sendEmail } = await import("../lib/email");
              await sendEmail(orderData.customerEmail, "reorder", {
                amount: session.amount_total! / 100,
                id: newOrder.id,
                customerName: orderData.customerName,
                originalOrderId: originalOrderId
              });
              console.log('✅ Phase 13: Reorder confirmation email sent via webhook processing');
            } catch (emailError) {
              console.error('❌ Phase 13: Failed to send reorder email via webhook:', emailError);
            }

          } catch (reorderError) {
            console.error('Phase 13: Failed to process reorder completion:', reorderError);
          }
        }
        // Standard order confirmation email for non-reorder orders
        else if (orderData.customerEmail) {
          try {
            const { sendEmail } = await import("../lib/email");
            
            // Parse order items for email
            let orderItems = [];
            try {
              orderItems = JSON.parse(orderData.orderItems);
            } catch (e) {
              console.warn("Could not parse order items for email");
            }

            await sendEmail(orderData.customerEmail, "order_confirm", {
              amount: session.amount_total! / 100,
              id: session.id,
              customerName: orderData.customerName,
              items: orderItems
            });
            console.log("Order confirmation email sent to:", orderData.customerEmail);
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

          // Send refund confirmation email
          if (refundOrder.customerEmail) {
            try {
              const { sendEmail } = await import("../lib/email");
              await sendEmail(refundOrder.customerEmail, "refund", {
                amount: refundedCharge.amount_refunded / 100,
                id: refundedCharge.payment_intent as string,
                customerName: refundOrder.customerName
              });
              console.log("Refund email sent to:", refundOrder.customerEmail);
            } catch (emailError) {
              console.error("Failed to send refund email:", emailError);
            }
          }
        }
        break;

      case "charge.dispute.created":
        const disputedCharge = data as Stripe.Charge;
        console.log("Charge disputed:", disputedCharge.id);
        
        const disputeOrder = await storage.getOrderByStripePaymentIntent(disputedCharge.payment_intent as string);
        if (disputeOrder) {
          await storage.updateOrderDisputeStatus(disputeOrder.id, "disputed");
          console.log("Updated dispute status for order:", disputeOrder.id);

          // Send admin alert for dispute
          try {
            const { sendAdminAlert } = await import("../lib/email");
            await sendAdminAlert("🚨 STRIPE DISPUTE DETECTED", {
              chargeId: disputedCharge.id,
              amount: disputedCharge.amount / 100,
              orderId: disputeOrder.id,
              customerEmail: disputeOrder.customerEmail,
              disputeReason: disputedCharge.dispute?.reason || "unknown"
            });
            console.log("Admin dispute alert sent");
          } catch (emailError) {
            console.error("Failed to send dispute alert:", emailError);
          }
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

          // Send admin alert for failed payment
          try {
            const { sendAdminAlert } = await import("../lib/email");
            await sendAdminAlert("⚠️ PAYMENT FAILED", {
              paymentIntentId: failedPayment.id,
              amount: failedPayment.amount / 100,
              orderId: failedOrder?.id || "unknown",
              customerEmail: failedOrder?.customerEmail || "unknown",
              errorMessage: failedPayment.last_payment_error?.message || "unknown error"
            });
            console.log("Admin payment failure alert sent");
          } catch (emailError) {
            console.error("Failed to send payment failure alert:", emailError);
          }
        }
        break;

      // Subscription webhook events (Phase 18)
      case "customer.subscription.created":
        const subscriptionCreated = data as Stripe.Subscription;
        console.log("Subscription created:", subscriptionCreated.id);
        await handleSubscriptionWebhook(subscriptionCreated, 'created');
        break;

      case "customer.subscription.updated":
        const subscriptionUpdated = data as Stripe.Subscription;
        console.log("Subscription updated:", subscriptionUpdated.id);
        await handleSubscriptionWebhook(subscriptionUpdated, 'updated');
        break;

      case "customer.subscription.deleted":
        const subscriptionDeleted = data as Stripe.Subscription;
        console.log("Subscription cancelled:", subscriptionDeleted.id);
        await handleSubscriptionWebhook(subscriptionDeleted, 'deleted');
        break;

      case "invoice.payment_succeeded":
        const invoiceSucceeded = data as Stripe.Invoice;
        console.log("Subscription payment succeeded:", invoiceSucceeded.id);
        
        if (invoiceSucceeded.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoiceSucceeded.subscription as string);
          const dbSubscription = await storage.getSubscriptionByStripeId(subscription.id);
          
          if (dbSubscription) {
            // Update next billing date
            const nextBillingDate = new Date(subscription.current_period_end * 1000);
            await storage.updateSubscriptionNextBilling(dbSubscription.id, nextBillingDate);
            console.log("Updated next billing date for subscription:", dbSubscription.id);

            // Create order for recurring payment
            if (invoiceSucceeded.billing_reason === 'subscription_cycle') {
              try {
                const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
                const orderData = {
                  userId: dbSubscription.userId,
                  customerEmail: customer.email || '',
                  customerName: customer.name || '',
                  customerPhone: customer.phone || '',
                  shippingAddress: JSON.stringify(customer.address || {}),
                  billingAddress: JSON.stringify(customer.address || {}),
                  orderItems: JSON.stringify([{
                    productId: dbSubscription.variant.productId,
                    variantId: dbSubscription.variantId,
                    quantity: dbSubscription.quantity,
                    price: (invoiceSucceeded.amount_paid / 100).toString()
                  }]),
                  totalAmount: (invoiceSucceeded.amount_paid / 100).toString(),
                  currency: invoiceSucceeded.currency?.toUpperCase() || "ZAR",
                  paymentStatus: "completed",
                  orderStatus: "processing",
                  refundStatus: "none",
                  disputeStatus: "none",
                  stripePaymentIntentId: invoiceSucceeded.payment_intent as string || null,
                  stripeSessionId: invoiceSucceeded.id,
                  notes: `Subscription renewal - ${dbSubscription.id}`,
                };

                await storage.createOrder(orderData);
                console.log("Created order for subscription renewal:", dbSubscription.id);
              } catch (orderError) {
                console.error("Failed to create order for subscription renewal:", orderError);
              }
            }
          }
        }
        break;

      case "invoice.payment_failed":
        const invoiceFailed = data as Stripe.Invoice;
        console.log("Subscription payment failed:", invoiceFailed.id);
        
        if (invoiceFailed.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoiceFailed.subscription as string);
          const dbSubscription = await storage.getSubscriptionByStripeId(subscription.id);
          
          if (dbSubscription) {
            // Send payment failed notification
            try {
              const { sendSubscriptionPaymentFailed } = await import("../lib/email");
              await sendSubscriptionPaymentFailed({
                customerEmail: dbSubscription.user?.email || '',
                customerName: dbSubscription.user?.username || '',
                subscriptionId: dbSubscription.id,
                productName: dbSubscription.variant.product?.name || 'Product',
                amount: (invoiceFailed.amount_due / 100).toString(),
                nextRetryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
              });
              console.log("Payment failed email sent");
            } catch (emailError) {
              console.error("Failed to send payment failed email:", emailError);
            }
          }
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

// Helper function to handle subscription webhook events
async function handleSubscriptionWebhook(subscription: Stripe.Subscription, eventType: 'created' | 'updated' | 'deleted') {
  try {
    const dbSubscription = await storage.getSubscriptionByStripeId(subscription.id);
    
    if (!dbSubscription) {
      console.warn(`No database subscription found for Stripe subscription: ${subscription.id}`);
      return;
    }

    switch (eventType) {
      case 'created':
        await storage.updateSubscriptionStatus(dbSubscription.id, 'active');
        console.log(`Activated subscription: ${dbSubscription.id}`);
        break;
      
      case 'updated':
        // Update subscription details
        const nextBillingDate = new Date(subscription.current_period_end * 1000);
        await storage.updateSubscriptionNextBilling(dbSubscription.id, nextBillingDate);
        
        // Update status based on Stripe status
        let status: 'active' | 'paused' | 'cancelled' = 'active';
        if (subscription.status === 'canceled') {
          status = 'cancelled';
        } else if (subscription.status === 'paused') {
          status = 'paused';
        }
        
        await storage.updateSubscriptionStatus(dbSubscription.id, status);
        console.log(`Updated subscription ${dbSubscription.id} status to: ${status}`);
        break;
      
      case 'deleted':
        await storage.updateSubscriptionStatus(dbSubscription.id, 'cancelled');
        console.log(`Cancelled subscription: ${dbSubscription.id}`);
        
        // Send cancellation confirmation email
        try {
          const { sendSubscriptionCancelled } = await import("../lib/email");
          await sendSubscriptionCancelled({
            customerEmail: dbSubscription.user?.email || '',
            customerName: dbSubscription.user?.username || '',
            productName: dbSubscription.variant.product?.name || 'Product',
            subscriptionId: dbSubscription.id,
            cancellationDate: new Date()
          });
          console.log("Cancellation email sent");
        } catch (emailError) {
          console.error("Failed to send cancellation email:", emailError);
        }
        break;
    }
  } catch (error) {
    console.error(`Error handling subscription ${eventType} webhook:`, error);
  }
}

export default router;