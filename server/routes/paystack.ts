import express from "express";
import { paystack } from "../lib/paystack";
import { storage } from "../storage";
import { insertOrderSchema } from "@shared/schema";
import { 
  paymentFraudDetection, 
  validateIdempotencyKey, 
  securePaymentLogging
} from "../middleware/paymentSecurity";
import { securityEventLogger } from "../middleware/securityMonitoring";
import crypto from 'crypto';

const router = express.Router();

// PayStack webhook endpoint
router.post("/webhook", 
  express.raw({ type: "application/json" }),
  securityEventLogger('authentication', 'medium'),
  async (req, res) => {
    const signature = req.headers["x-paystack-signature"] as string;
    
    if (!signature && process.env.NODE_ENV !== 'development') {
      return res.status(400).send("No signature provided");
    }
    
    // Verify webhook signature (skip in development for testing)
    if (process.env.NODE_ENV !== 'development') {
      const isValid = paystack.verifyWebhookSignature(req.body.toString(), signature);
      
      if (!isValid) {
        return res.status(400).send("Invalid signature");
      }
    } else {
      console.log('[PAYSTACK] Development mode - skipping webhook signature verification');
    }
    
    const event = JSON.parse(req.body.toString());
    
    try {
      switch (event.event) {
        case "charge.success":
          // Payment successful
          const transaction = event.data;
          
          // Check if order already exists
          const existingOrder = await storage.getOrderByPaystackReference(transaction.reference);
          if (existingOrder) {
            break;
          }
          
          // Create new order
          const metadata = transaction.metadata || {};
          const orderData = {
            userId: metadata.userId || null,
            customerEmail: transaction.customer.email,
            customerName: metadata.customerName || transaction.customer.first_name + ' ' + transaction.customer.last_name,
            customerPhone: metadata.customerPhone || transaction.customer.phone || "",
            shippingAddress: metadata.shippingAddress || "{}",
            billingAddress: metadata.billingAddress || "{}",
            orderItems: metadata.orderItems || "[]",
            totalAmount: (transaction.amount / 100).toString(), // Convert from kobo/cents
            currency: transaction.currency?.toUpperCase() || "ZAR",
            paymentStatus: "completed",
            orderStatus: "processing",
            paymentMethod: "paystack",
            paystackReference: transaction.reference,
            notes: metadata.notes || null,
            discountCode: metadata.discountCode || null,
            discountAmount: metadata.discountAmount || null,
            shippingCost: metadata.shippingCost || null,
            taxAmount: metadata.taxAmount || null,
            metadata: JSON.stringify(metadata)
          };
          
          const result = insertOrderSchema.safeParse(orderData);
          if (!result.success) {
            console.error("Order validation failed:", result.error);
            break;
          }
          
          const order = await storage.createOrder(result.data);
          console.log(`Order created from PayStack webhook: ${order.id}`);
          
          // Mark cart as converted if cart ID exists
          if (metadata.cartId) {
            await storage.markCartAsConverted(metadata.cartId, transaction.reference);
          }
          
          // Enrich order items with full product data
          let enrichedOrderItems = [];
          try {
            const orderItems = JSON.parse(metadata.orderItems || '[]');
            
            // Fetch full product data for each item to include images and complete info
            for (const item of orderItems) {
              try {
                const productId = item.product?.id || item.productId;
                if (productId) {
                  const products = await storage.getProducts();
                  const fullProduct = products.find(p => p.id === productId);
                  if (fullProduct) {
                    enrichedOrderItems.push({
                      ...item,
                      product: fullProduct,
                      productName: fullProduct.name,
                      imageUrl: fullProduct.imageUrl,
                      price: fullProduct.price
                    });
                  } else {
                    // Fallback to item data if product not found
                    enrichedOrderItems.push({
                      ...item,
                      productName: item.product?.name || item.productName || 'Product',
                      imageUrl: item.product?.imageUrl || item.imageUrl || '/objects/placeholder-product.jpg',
                      price: item.product?.price || item.price || '0'
                    });
                  }
                } else {
                  enrichedOrderItems.push(item);
                }
              } catch (productError) {
                console.error('Error enriching product data:', productError);
                enrichedOrderItems.push(item);
              }
            }
            
            // Update the order with enriched items
            // Note: Storage doesn't have updateOrder method yet, but we'll store enriched items for display
            
            console.log(`Order ${order.id} items enriched with product data`);
          } catch (e) {
            console.error('Could not enrich order items:', e);
            enrichedOrderItems = JSON.parse(metadata.orderItems || '[]');
          }

          // Send order confirmation email
          try {
            const { sendEmail } = await import('../lib/email');
            
            const emailResult = await sendEmail(
              transaction.customer.email, 
              'order_confirm', 
              {
                id: order.id,
                amount: parseFloat(order.totalAmount),
                customerName: order.customerName || '',
                items: enrichedOrderItems
              }
            );
            
            console.log(`[EMAIL] Order confirmation email sent: ${emailResult.success ? 'SUCCESS' : 'FAILED'}`, emailResult);
          } catch (emailError) {
            console.error('Failed to send order confirmation email:', emailError);
          }
          break;
          
        case "refund.processed":
          // Refund processed
          const refund = event.data;
          const orderToRefund = await storage.getOrderByPaystackReference(refund.transaction_reference);
          
          if (orderToRefund) {
            await storage.updatePaymentStatus(orderToRefund.id, "refunded");
            await storage.updateOrderStatus(orderToRefund.id, "cancelled");
            console.log(`Order ${orderToRefund.id} refunded via PayStack`);
          }
          break;
          
        case "subscription.create":
          // Subscription created
          const subscription = event.data;
          const subscriptionData: any = {
            userId: subscription.customer.metadata?.userId || null,
            productVariantId: subscription.plan.metadata?.variantId || "",
            paystackSubscriptionId: subscription.subscription_code,
            paystackCustomerId: subscription.customer.customer_code,
            status: "active",
            intervalDays: subscription.plan.interval === 'monthly' ? 30 : 
                         subscription.plan.interval === 'weekly' ? 7 :
                         subscription.plan.interval === 'annually' ? 365 : 30,
            currentPeriodStart: subscription.next_payment_date,
            currentPeriodEnd: subscription.next_payment_date, // PayStack doesn't provide end date
            cancelAtPeriodEnd: false,
            quantity: subscription.quantity || 1,
            pricePerUnit: (subscription.plan.amount / 100).toString(),
            interval: subscription.plan.interval,
            metadata: JSON.stringify(subscription)
          };
          
          await storage.createSubscription(subscriptionData);
          console.log(`Subscription created via PayStack: ${subscription.subscription_code}`);
          break;
          
        case "subscription.disable":
          // Subscription cancelled
          const cancelledSub = event.data;
          const subToCancel = await storage.getSubscriptionByPaystackId(cancelledSub.subscription_code);
          
          if (subToCancel) {
            await storage.updateSubscriptionStatus(subToCancel.id, "cancelled");
            console.log(`Subscription ${subToCancel.id} cancelled via PayStack`);
          }
          break;
          
        case "invoice.payment_failed":
          // Subscription payment failed
          const failedInvoice = event.data;
          const subToUpdate = await storage.getSubscriptionByPaystackId(failedInvoice.subscription_code);
          
          if (subToUpdate) {
            await storage.updateSubscriptionStatus(subToUpdate.id, "past_due");
            console.log(`Subscription ${subToUpdate.id} marked as past_due`);
          }
          break;
          
        default:
          console.log(`Unhandled PayStack event: ${event.event}`);
      }
      
      res.json({ received: true });
    } catch (error) {
      console.error("Error processing PayStack webhook:", error);
      res.status(500).send("Webhook processing failed");
    }
  }
);

// Create checkout session
router.post("/create-checkout",
  securityEventLogger('authentication', 'medium'),
  paymentFraudDetection(),
  validateIdempotencyKey(),
  securePaymentLogging(),
  async (req, res) => {
    try {
      const { 
        email, 
        amount, 
        currency = "ZAR",
        metadata = {},
        callback_url,
        channels = ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"]
      } = req.body;
      
      if (!email || !amount) {
        return res.status(400).json({ error: "Email and amount are required" });
      }
      
      // Generate unique reference
      const reference = `healios_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
      
      // Initialize PayStack transaction
      const result: any = await paystack.initializeTransaction({
        email,
        amount: Math.round(amount * 100), // Convert to kobo/cents
        currency,
        reference,
        callback_url: callback_url || `${process.env.VITE_PUBLIC_URL || 'http://localhost:5000'}/order-confirmation`,
        metadata: {
          ...metadata,
          custom_fields: [
            {
              display_name: "Order Reference",
              variable_name: "order_reference",
              value: reference
            }
          ]
        },
        channels
      });
      
      if (result.status) {
        res.json({
          success: true,
          authorization_url: result.data.authorization_url,
          access_code: result.data.access_code,
          reference: result.data.reference
        });
      } else {
        throw new Error(result.message || "Failed to initialize payment");
      }
    } catch (error: any) {
      console.error("PayStack checkout error:", error);
      res.status(500).json({ 
        error: "Failed to create checkout session",
        details: error.message 
      });
    }
  }
);

// Verify transaction
router.get("/verify/:reference",
  securityEventLogger('authentication', 'low'),
  async (req, res) => {
    try {
      const { reference } = req.params;
      
      if (!reference) {
        return res.status(400).json({ error: "Reference is required" });
      }
      
      const result: any = await paystack.verifyTransaction(reference);
      
      if (result.status) {
        // Try to find the order by PayStack reference
        let order = null;
        try {
          order = await storage.getOrderByPaystackReference(reference);
        } catch (e) {
          console.log('Order not found for reference:', reference);
        }
        
        res.json({
          success: true,
          status: result.data.status,
          amount: result.data.amount / 100, // Convert from kobo/cents
          currency: result.data.currency,
          customer: result.data.customer,
          metadata: result.data.metadata,
          paid_at: result.data.paid_at,
          created_at: result.data.created_at,
          order: order // Include order data for order confirmation page
        });
      } else {
        throw new Error(result.message || "Failed to verify transaction");
      }
    } catch (error: any) {
      console.error("PayStack verification error:", error);
      res.status(500).json({ 
        error: "Failed to verify transaction",
        details: error.message 
      });
    }
  }
);

// Process refund
router.post("/refund",
  securityEventLogger('authentication', 'high'),
  async (req, res) => {
    try {
      const { reference, amount, reason } = req.body;
      
      if (!reference) {
        return res.status(400).json({ error: "Transaction reference is required" });
      }
      
      const refundData: any = {
        transaction: reference,
        merchant_note: reason || "Customer requested refund"
      };
      
      // If amount is provided, it's a partial refund
      if (amount) {
        refundData.amount = Math.round(amount * 100); // Convert to kobo/cents
      }
      
      const result: any = await paystack.processRefund(refundData);
      
      if (result.status) {
        res.json({
          success: true,
          refund: result.data
        });
      } else {
        throw new Error(result.message || "Failed to process refund");
      }
    } catch (error: any) {
      console.error("PayStack refund error:", error);
      res.status(500).json({ 
        error: "Failed to process refund",
        details: error.message 
      });
    }
  }
);

export default router;