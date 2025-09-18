import express from "express";
import { paystack } from "../lib/paystack";
import { storage } from "../storage";
import { insertOrderSchema, paystackWebhookSchema, genericWebhookSchema } from "@shared/schema";
import { 
  paymentFraudDetection, 
  validateIdempotencyKey, 
  securePaymentLogging
} from "../middleware/paymentSecurity";
import { securityEventLogger } from "../middleware/securityMonitoring";
import { 
  generateEventId, 
  isEventAlreadyProcessed, 
  processWebhookSafely, 
  verifyWebhookSignature, 
  getPaystackSecret, 
  safeParseJSON 
} from "../lib/webhookUtils";
import { createWebhookLogger } from "../lib/webhookLogger";
import crypto from 'crypto';

const router = express.Router();

// PayStack webhook endpoint - Hardened with proper error handling and idempotency
router.post("/webhook", 
  express.raw({ type: "application/json" }),
  securityEventLogger('authentication', 'medium'),
  async (req, res) => {
    const signature = req.headers["x-paystack-signature"] as string;
    let logger: any;
    
    try {
      // STEP 1: Parse payload first to get event ID for logging
      const bodyString = Buffer.isBuffer(req.body) ? req.body.toString() : JSON.stringify(req.body);
      const parseResult = safeParseJSON(bodyString);
      
      if (!parseResult.success) {
        console.error('[WEBHOOK] Failed to parse JSON payload:', parseResult.error);
        return res.status(400).json({ error: "Invalid JSON payload" });
      }
      
      const rawEvent = parseResult.data;
      const eventId = generateEventId(rawEvent);
      const eventType = rawEvent.event || 'unknown';
      
      // Initialize structured logger
      logger = createWebhookLogger(eventId, eventType, signature);
      logger.accepted(rawEvent);
      
      // STEP 2: Signature verification FIRST (before processing)
      if (process.env.NODE_ENV === 'production') {
        if (!signature) {
          logger.signatureVerification(false);
          return res.status(400).json({ error: "No signature provided" });
        }
        
        const secret = getPaystackSecret();
        const isValidSignature = verifyWebhookSignature(bodyString, signature, secret);
        
        if (!isValidSignature) {
          logger.signatureVerification(false);
          return res.status(400).json({ error: "Invalid signature" });
        }
        
        logger.signatureVerification(true);
      } else {
        logger.signatureVerification(true, true); // Development mode skip
      }
      
      // STEP 3: Idempotency check
      const alreadyProcessed = await isEventAlreadyProcessed(eventId);
      logger.idempotencyCheck(alreadyProcessed);
      
      if (alreadyProcessed) {
        logger.completed();
        return res.status(202).json({ 
          received: true, 
          message: "Event already processed" 
        });
      }
      
      // STEP 4: Payload validation with Zod
      let validatedEvent;
      const webhookValidation = paystackWebhookSchema.safeParse(rawEvent);
      
      if (webhookValidation.success) {
        validatedEvent = webhookValidation.data;
        logger.payloadValidation(true);
      } else {
        // Try generic webhook schema for unknown events
        const genericValidation = genericWebhookSchema.safeParse(rawEvent);
        if (genericValidation.success) {
          validatedEvent = genericValidation.data;
          logger.payloadValidation(true);
        } else {
          logger.payloadValidation(false, webhookValidation.error.errors);
          // Still accept webhook but record validation failure
          validatedEvent = rawEvent;
        }
      }
      
      // STEP 5: Process webhook event with individual error handling
      await processWebhookEvent(eventId, eventType, validatedEvent, logger);
      
      // STEP 6: Always return 202 Accepted (fail-safe pattern)
      logger.completed();
      return res.status(202).json({ 
        received: true, 
        eventId: eventId.substring(0, 12) + '...', // Partial ID for tracking
        message: "Webhook accepted and processed"
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (logger) {
        logger.failed(error as Error);
      } else {
        console.error('[WEBHOOK] Critical error before logger initialization:', error);
      }
      
      // Always return 202 even on critical errors (fail-safe)
      return res.status(202).json({ 
        received: true, 
        error: "Processing error occurred",
        message: "Webhook accepted but processing failed"
      });
    }
  }
);

/**
 * Process webhook event with individual case error handling
 */
async function processWebhookEvent(eventId: string, eventType: string, event: any, logger: any) {
  const caseLogger = logger.createCaseLogger(eventType);
  
  switch (event.event) {
    case "charge.success":
      await processWebhookSafely(eventId, eventType, event, async () => {
        caseLogger.start();
        
        const transaction = event.data;
        
        // Check if order already exists (additional idempotency check)
        const existingOrder = await storage.getOrderByPaystackReference(transaction.reference);
        if (existingOrder) {
          caseLogger.info('Order already exists for transaction reference', { reference: transaction.reference });
          return { skipped: true, reason: 'Order already exists' };
        }
        
        // Create new order
        const metadata = transaction.metadata || {};
        const orderData = {
          userId: metadata.userId || null,
          customerEmail: transaction.customer.email,
          customerName: metadata.customerName || `${transaction.customer.first_name || ''} ${transaction.customer.last_name || ''}`.trim(),
          customerPhone: metadata.customerPhone || transaction.customer.phone || "",
          shippingAddress: metadata.shippingAddress || "{}",
          billingAddress: metadata.billingAddress || "{}",
          orderItems: metadata.orderItems || "[]",
          totalAmount: (transaction.amount / 100).toString(),
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
          throw new Error(`Order validation failed: ${JSON.stringify(result.error.errors)}`);
        }
        
        const order = await storage.createOrder(result.data);
        caseLogger.info('Order created successfully', { orderId: order.id, reference: transaction.reference });
        
        // Mark cart as converted if cart ID exists
        if (metadata.cartId) {
          try {
            await storage.markCartAsConverted(metadata.cartId, transaction.reference);
            caseLogger.debug('Cart marked as converted', { cartId: metadata.cartId });
          } catch (cartError) {
            caseLogger.warn('Failed to mark cart as converted', { error: cartError });
          }
        }
        
        // Send order confirmation email (non-blocking)
        processOrderConfirmationEmail(order, transaction, metadata.orderItems, caseLogger);
        
        caseLogger.success({ orderId: order.id, amount: order.totalAmount });
        return { orderId: order.id, reference: transaction.reference };
      });
      break;
      
    case "refund.processed":
      await processWebhookSafely(eventId, eventType, event, async () => {
        caseLogger.start();
        
        const refund = event.data;
        const orderToRefund = await storage.getOrderByPaystackReference(refund.transaction_reference);
        
        if (!orderToRefund) {
          caseLogger.warn('Order not found for refund', { reference: refund.transaction_reference });
          return { skipped: true, reason: 'Order not found' };
        }
        
        await storage.updatePaymentStatus(orderToRefund.id, "refunded");
        await storage.updateOrderStatus(orderToRefund.id, "cancelled");
        
        caseLogger.success({ orderId: orderToRefund.id, refundAmount: refund.amount });
        return { orderId: orderToRefund.id, status: 'refunded' };
      });
      break;
      
    case "subscription.create":
      await processWebhookSafely(eventId, eventType, event, async () => {
        caseLogger.start();
        
        const subscription = event.data;
        const subscriptionData = {
          userId: subscription.customer.metadata?.userId || null,
          productVariantId: subscription.plan.metadata?.variantId || "",
          paystackSubscriptionId: subscription.subscription_code,
          paystackCustomerId: subscription.customer.customer_code,
          status: "active",
          intervalDays: subscription.plan.interval === 'monthly' ? 30 : 
                       subscription.plan.interval === 'weekly' ? 7 :
                       subscription.plan.interval === 'annually' ? 365 : 30,
          currentPeriodStart: subscription.next_payment_date,
          currentPeriodEnd: subscription.next_payment_date,
          cancelAtPeriodEnd: false,
          quantity: subscription.quantity || 1,
          pricePerUnit: (subscription.plan.amount / 100).toString(),
          interval: subscription.plan.interval,
          metadata: JSON.stringify(subscription)
        };
        
        const createdSubscription = await storage.createSubscription(subscriptionData);
        
        caseLogger.success({ subscriptionId: createdSubscription.id, code: subscription.subscription_code });
        return { subscriptionId: createdSubscription.id, code: subscription.subscription_code };
      });
      break;
      
    case "subscription.disable":
      await processWebhookSafely(eventId, eventType, event, async () => {
        caseLogger.start();
        
        const cancelledSub = event.data;
        const subToCancel = await storage.getSubscriptionByPaystackId(cancelledSub.subscription_code);
        
        if (!subToCancel) {
          caseLogger.warn('Subscription not found for cancellation', { code: cancelledSub.subscription_code });
          return { skipped: true, reason: 'Subscription not found' };
        }
        
        await storage.updateSubscriptionStatus(subToCancel.id, "cancelled");
        
        caseLogger.success({ subscriptionId: subToCancel.id, status: 'cancelled' });
        return { subscriptionId: subToCancel.id, status: 'cancelled' };
      });
      break;
      
    case "invoice.payment_failed":
      await processWebhookSafely(eventId, eventType, event, async () => {
        caseLogger.start();
        
        const failedInvoice = event.data;
        const subToUpdate = await storage.getSubscriptionByPaystackId(failedInvoice.subscription_code);
        
        if (!subToUpdate) {
          caseLogger.warn('Subscription not found for payment failure', { code: failedInvoice.subscription_code });
          return { skipped: true, reason: 'Subscription not found' };
        }
        
        await storage.updateSubscriptionStatus(subToUpdate.id, "past_due");
        
        caseLogger.success({ subscriptionId: subToUpdate.id, status: 'past_due' });
        return { subscriptionId: subToUpdate.id, status: 'past_due' };
      });
      break;
      
    default:
      // Unknown event types are accepted but not processed
      caseLogger.warn(`Unhandled PayStack event: ${event.event}`);
      await processWebhookSafely(eventId, eventType, event, async () => {
        return { skipped: true, reason: 'Unknown event type' };
      });
      break;
  }
}

/**
 * Process order confirmation email asynchronously (non-blocking)
 */
async function processOrderConfirmationEmail(order: any, transaction: any, orderItemsJson: string, caseLogger: any) {
  try {
    // Enrich order items with full product data
    let enrichedOrderItems = [];
    try {
      const orderItems = JSON.parse(orderItemsJson || '[]');
      
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
          caseLogger.warn('Error enriching individual product data', { error: productError });
          enrichedOrderItems.push(item);
        }
      }
    } catch (e) {
      caseLogger.warn('Could not enrich order items', { error: e });
      enrichedOrderItems = JSON.parse(orderItemsJson || '[]');
    }

    // Send order confirmation email
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
    
    if (emailResult.success) {
      caseLogger.info('Order confirmation email sent successfully');
    } else {
      caseLogger.warn('Failed to send order confirmation email', { error: emailResult });
    }
  } catch (emailError) {
    caseLogger.error(emailError as Error);
  }
}

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