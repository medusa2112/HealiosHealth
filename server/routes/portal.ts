import express from "express";
import { z } from "zod";
import { protectRoute } from "../lib/auth";
import { storage } from "../storage";
import { insertAddressSchema } from "@shared/schema";
import { stripe } from "../lib/stripe";

const router = express.Router();

// Protect all customer portal routes - only customer role allowed
router.use(protectRoute(['customer']));

// Get customer's order history
router.get("/orders", async (req, res) => {
  try {
    const userId = req.user!.id;
    const orders = await storage.getOrdersByUserId(userId);
    
    // Enrich orders with order items for complete data
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const items = await storage.getOrderItemsByOrderId(order.id);
        return {
          ...order,
          items
        };
      })
    );
    
    res.json(enrichedOrders);
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Get specific order by ID (user-scoped)
router.get("/orders/:id", async (req, res) => {
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
    
    const userId = req.user!.id;
    const orderId = result.data.id;
    
    const order = await storage.getOrderByIdAndUserId(orderId, userId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const items = await storage.getOrderItemsByOrderId(orderId);
    
    res.json({ 
      order, 
      items 
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ message: 'Failed to fetch order details' });
  }
});

// Reorder functionality - create new checkout session from existing order
router.post("/orders/:id/reorder", async (req, res) => {
  try {
    const paramsSchema = z.object({
      id: z.string().min(1)
    });
    const bodySchema = z.object({
      sessionToken: z.string().optional()
    });
    
    const paramsResult = paramsSchema.safeParse(req.params);
    const bodyResult = bodySchema.safeParse(req.body);
    
    if (!paramsResult.success) {
      return res.status(400).json({ 
        error: 'Invalid order ID',
        details: paramsResult.error.errors
      });
    }
    
    if (!bodyResult.success) {
      return res.status(400).json({ 
        error: 'Invalid request body',
        details: bodyResult.error.errors
      });
    }
    
    const userId = req.user!.id;
    const orderId = paramsResult.data.id;
    const { sessionToken } = bodyResult.data;
    
    // Verify order belongs to user
    const order = await storage.getOrderByIdAndUserId(orderId, userId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Get order items
    const items = await storage.getOrderItemsByOrderId(orderId);
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items found in original order' });
    }

    // Phase 13: Create comprehensive reorder log - INITIATED status
    const initiatedLog = await storage.createReorderLog({
      userId: userId,
      originalOrderId: orderId,
      status: 'initiated',
      reorderType: 'manual_customer_portal',
      channel: 'customer_portal_authenticated',
      itemsCount: items.length,
      originalAmount: parseFloat(order.totalAmount || '0'),
      metadata: {
        originalOrderDate: order.createdAt,
        originalPaymentStatus: order.paymentStatus,
        customerEmail: order.customerEmail,
        initiatedFrom: 'authenticated_portal',
        userAgent: req.headers['user-agent'],
        ip: req.ip
      }
    });

    console.log('📊 Phase 13: Authenticated reorder initiated with comprehensive tracking:', {
      reorderLogId: initiatedLog.id,
      originalOrderId: orderId,
      userId: userId,
      itemsCount: items.length
    });
    
    // Get current product data and verify availability
    const lineItems = [];
    let totalAmount = 0;
    
    for (const item of items) {
      const product = await storage.getProductById(item.productId);
      if (!product) {
        return res.status(400).json({ 
          message: `Product ${item.productName} is no longer available` 
        });
      }
      
      if (!product.inStock || product.stockQuantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}` 
        });
      }
      
      const itemPrice = parseFloat(product.price) * 100; // Convert to cents
      lineItems.push({
        price_data: {
          currency: 'zar',
          product_data: {
            name: product.name,
            images: product.imageUrl ? [product.imageUrl] : [],
            metadata: {
              productId: product.id,
            }
          },
          unit_amount: itemPrice,
        },
        quantity: item.quantity,
      });
      
      totalAmount += itemPrice * item.quantity;
    }
    
    // Create new order record
    const newOrderData = {
      userId,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      orderItems: JSON.stringify(items.map(item => ({
        product: { 
          id: item.productId, 
          name: item.productName, 
          price: item.price 
        },
        quantity: item.quantity
      }))),
      totalAmount: totalAmount / 100, // Convert back to dollars
      currency: "ZAR",
      paymentStatus: "pending",
      orderStatus: "processing"
    };
    
    // SECURITY: Validate order data before database insertion
    const validatedOrderData = insertOrderSchema.parse(newOrderData);
    const newOrder = await storage.createOrder(validatedOrderData);
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.headers.origin}/order-confirmation?order_id=${newOrder.id}&session_id={CHECKOUT_SESSION_ID}&reorder=true&original_order=${orderId}`,
      cancel_url: `${req.headers.origin}/portal?reorder_cancelled=true`,
      customer_email: order.customerEmail,
      metadata: {
        type: 'reorder',
        original_order_id: orderId,
        reorder_log_id: initiatedLog.id,
        user_id: userId,
        channel: 'authenticated_portal',
        orderId: newOrder.id,
        userId: userId,
        sessionToken: sessionToken || undefined,
        reorderId: orderId, // Track that this is a reorder
      },
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['ZA', 'US', 'GB'],
      },
    });

    // Phase 13: Update reorder log with checkout session created
    await storage.createReorderLog({
      userId: userId,
      originalOrderId: orderId,
      status: 'checkout_created',
      reorderType: 'manual_customer_portal',
      channel: 'customer_portal_authenticated',
      itemsCount: items.length,
      originalAmount: parseFloat(order.totalAmount || '0'),
      newAmount: totalAmount / 100,
      stripeSessionId: session.id,
      metadata: {
        ...initiatedLog.metadata,
        checkoutSessionCreated: new Date().toISOString(),
        sessionUrl: session.url,
        newOrderId: newOrder.id
      }
    });

    console.log('🔄 Phase 13: Reorder checkout session created with comprehensive tracking');
    
    res.json({ 
      url: session.url,
      orderId: newOrder.id,
      sessionId: session.id
    });
    
  } catch (error) {
    console.error('Error creating reorder:', error);
    res.status(500).json({ message: 'Failed to create reorder' });
  }
});

// Get customer's saved addresses
router.get("/addresses", async (req, res) => {
  try {
    const userId = req.user!.id;
    const addresses = await storage.getAddressesByUserId(userId);
    res.json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ message: 'Failed to fetch addresses' });
  }
});

// Create new saved address
router.post("/addresses", async (req, res) => {
  try {
    const userId = req.user!.id;
    const result = insertAddressSchema.safeParse({
      ...req.body,
      userId
    });
    
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Invalid address data',
        details: result.error.errors
      });
    }
    
    const validatedData = result.data;
    
    const address = await storage.createAddress(validatedData);
    res.status(201).json(address);
  } catch (error) {
    console.error('Error creating address:', error);
    res.status(500).json({ message: 'Failed to create address' });
  }
});

// Update existing address
router.put("/addresses/:id", async (req, res) => {
  try {
    const paramsSchema = z.object({
      id: z.string().min(1)
    });
    
    const paramsResult = paramsSchema.safeParse(req.params);
    if (!paramsResult.success) {
      return res.status(400).json({ 
        error: 'Invalid address ID',
        details: paramsResult.error.errors
      });
    }
    
    const userId = req.user!.id;
    const addressId = paramsResult.data.id;
    
    // Verify address belongs to user
    const existingAddresses = await storage.getAddressesByUserId(userId);
    const addressExists = existingAddresses.some(addr => addr.id === addressId);
    
    if (!addressExists) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    const updateSchema = insertAddressSchema.partial().omit({ userId: true });
    const bodyResult = updateSchema.safeParse(req.body);
    
    if (!bodyResult.success) {
      return res.status(400).json({ 
        error: 'Invalid address update data',
        details: bodyResult.error.errors
      });
    }
    
    const updatedAddress = await storage.updateAddress(addressId, bodyResult.data);
    if (!updatedAddress) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    res.json(updatedAddress);
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ message: 'Failed to update address' });
  }
});

// Delete saved address
router.delete("/addresses/:id", async (req, res) => {
  try {
    const paramsSchema = z.object({
      id: z.string().min(1)
    });
    
    const result = paramsSchema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Invalid address ID',
        details: result.error.errors
      });
    }
    
    const userId = req.user!.id;
    const addressId = result.data.id;
    
    // Verify address belongs to user
    const existingAddresses = await storage.getAddressesByUserId(userId);
    const addressExists = existingAddresses.some(addr => addr.id === addressId);
    
    if (!addressExists) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    await storage.deleteAddress(addressId);
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ message: 'Failed to delete address' });
  }
});

// Get customer portal dashboard data
router.get("/", async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // Get recent orders
    const orders = await storage.getOrdersByUserId(userId);
    const recentOrders = orders.slice(0, 5);
    
    // Get addresses
    const addresses = await storage.getAddressesByUserId(userId);
    
    // Calculate stats
    const totalOrders = orders.length;
    const totalSpent = orders
      .filter(order => order.paymentStatus === 'completed')
      .reduce((sum, order) => sum + parseFloat(order.totalAmount.toString()), 0);
    
    res.json({
      user: req.user,
      orders: recentOrders,
      addresses,
      stats: {
        totalOrders,
        totalSpent: totalSpent.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error fetching portal data:', error);
    res.status(500).json({ message: 'Failed to fetch portal data' });
  }
});

export default router;