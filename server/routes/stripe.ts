import express from "express";
import { stripe } from "../lib/stripe";
import { storage } from "../storage";
import { insertOrderSchema } from "@shared/schema";

const router = express.Router();

// Stripe webhook handler - must use raw body parser for signature verification
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      // STRIPE_WEBHOOK_SECRET is not configured
      return res.status(500).send("Webhook secret not configured");
    }

    event = stripe.webhooks.constructEvent(
      req.body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    // Webhook signature verification failed
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const data = event.data.object;

  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = data as Stripe.Checkout.Session;
        
        // Check if order already exists to prevent duplicates
        const existingOrder = await storage.getOrderByStripeSessionId(session.id);
        if (existingOrder) {
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

        // Phase 7: Mark cart as converted when checkout session is completed
        if (session.metadata?.sessionToken) {
          try {
            await storage.markCartAsConverted(session.metadata.sessionToken, session.id);
          } catch (error) {
            // Failed to mark cart as converted
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

            // Send specialized reorder confirmation email
            try {
              const { sendEmail } = await import("../lib/email");
              await sendEmail(orderData.customerEmail, "reorder", {
                amount: session.amount_total! / 100,
                id: newOrder.id,
                customerName: orderData.customerName,
                originalOrderId: originalOrderId
              });
            } catch (emailError) {
              // Failed to send reorder email via webhook
            }

          } catch (reorderError) {
            // Failed to process reorder completion
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
              // Could not parse order items for email
            }

            await sendEmail(orderData.customerEmail, "order_confirm", {
              amount: session.amount_total! / 100,
              id: session.id,
              customerName: orderData.customerName,
              items: orderItems
            });
          } catch (emailError) {
            // Failed to send confirmation email
          }
        }
        break;

      case "charge.refunded":
        const refundedCharge = data as Stripe.Charge;

        const refundOrder = await storage.getOrderByStripePaymentIntent(refundedCharge.payment_intent as string);
        if (refundOrder) {
          await storage.updateOrderRefundStatus(refundOrder.id, "refunded");
          
          if (refundOrder.customerEmail) {
            try {
              const { sendEmail } = await import("../lib/email");
              await sendEmail(refundOrder.customerEmail, "refund", {
                amount: refundedCharge.amount_refunded / 100,
                id: refundedCharge.payment_intent as string,
                customerName: refundOrder.customerName
              });
              
            } catch (emailError) {
              // // console.error("Failed to send refund email:", emailError);
            }
          }
        }
        break;

      case "charge.dispute.created":
        const disputedCharge = data as Stripe.Charge;

        const disputeOrder = await storage.getOrderByStripePaymentIntent(disputedCharge.payment_intent as string);
        if (disputeOrder) {
          await storage.updateOrderDisputeStatus(disputeOrder.id, "disputed");
          
          try {
            const { sendAdminAlert } = await import("../lib/email");
            await sendAdminAlert("🚨 STRIPE DISPUTE DETECTED", {
              chargeId: disputedCharge.id,
              amount: disputedCharge.amount / 100,
              orderId: disputeOrder.id,
              customerEmail: disputeOrder.customerEmail,
              disputeReason: disputedCharge.dispute?.reason || "unknown"
            });
            
          } catch (emailError) {
            // // console.error("Failed to send dispute alert:", emailError);
          }
        }
        break;

      case "payment_intent.payment_failed":
        const failedPayment = data as Stripe.PaymentIntent;
        
        const failedOrder = await storage.getOrderByStripePaymentIntent(failedPayment.id);
        if (failedOrder) {
          await storage.updateOrderPaymentStatus(failedOrder.id, "failed");
          
          try {
            const { sendAdminAlert } = await import("../lib/email");
            await sendAdminAlert("⚠️ PAYMENT FAILED", {
              paymentIntentId: failedPayment.id,
              amount: failedPayment.amount / 100,
              orderId: failedOrder?.id || "unknown",
              customerEmail: failedOrder?.customerEmail || "unknown",
              errorMessage: failedPayment.last_payment_error?.message || "unknown error"
            });
            
          } catch (emailError) {
            // // console.error("Failed to send payment failure alert:", emailError);
          }
        }
        break;

      // Subscription webhook events (Phase 18)
      case "customer.subscription.created":
        const subscriptionCreated = data as Stripe.Subscription;
        
        await handleSubscriptionWebhook(subscriptionCreated, 'created');
        break;

      case "customer.subscription.updated":
        const subscriptionUpdated = data as Stripe.Subscription;
        
        await handleSubscriptionWebhook(subscriptionUpdated, 'updated');
        break;

      case "customer.subscription.deleted":
        const subscriptionDeleted = data as Stripe.Subscription;
        
        await handleSubscriptionWebhook(subscriptionDeleted, 'deleted');
        break;

      case "invoice.payment_succeeded":
        const invoiceSucceeded = data as Stripe.Invoice;

        if (invoiceSucceeded.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoiceSucceeded.subscription as string);
          const dbSubscription = await storage.getSubscriptionByStripeId(subscription.id);
          
          if (dbSubscription) {
            // Update next billing date
            const nextBillingDate = new Date(subscription.current_period_end * 1000);
            await storage.updateSubscriptionNextBilling(dbSubscription.id, nextBillingDate);
            
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

                // SECURITY: Validate order data before database insertion
                const validatedOrderData = insertOrderSchema.parse(orderData);
                await storage.createOrder(validatedOrderData);
                
              } catch (orderError) {
                // // console.error("Failed to create order for subscription renewal:", orderError);
              }
            }
          }
        }
        break;

      case "invoice.payment_failed":
        const invoiceFailed = data as Stripe.Invoice;

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
              
            } catch (emailError) {
              // // console.error("Failed to send payment failed email:", emailError);
            }
          }
        }
        break;

      default:
        
    }
  } catch (error) {
    // // console.error("Error processing webhook:", error);
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
      
      return;
    }

    switch (eventType) {
      case 'created':
        await storage.updateSubscriptionStatus(dbSubscription.id, 'active');
        
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
        
        break;
      
      case 'deleted':
        await storage.updateSubscriptionStatus(dbSubscription.id, 'cancelled');
        
        try {
          const { sendSubscriptionCancelled } = await import("../lib/email");
          await sendSubscriptionCancelled({
            customerEmail: dbSubscription.user?.email || '',
            customerName: dbSubscription.user?.username || '',
            productName: dbSubscription.variant.product?.name || 'Product',
            subscriptionId: dbSubscription.id,
            cancellationDate: new Date()
          });
          
        } catch (emailError) {
          // // console.error("Failed to send cancellation email:", emailError);
        }
        break;
    }
  } catch (error) {
    // // console.error(`Error handling subscription ${eventType} webhook:`, error);
  }
}

export default router;