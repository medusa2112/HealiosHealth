import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertNewsletterSchema, insertPreOrderSchema, insertArticleSchema, insertOrderSchema, insertQuizResultSchema, insertConsultationBookingSchema, insertRestockNotificationSchema, type Article, type QuizResult, type ConsultationBooking, type RestockNotification, products } from "@shared/schema";
import { db } from "./db";
import { eq, sql, arrayContains } from "drizzle-orm";
import { EmailService } from "./email";
import { QuizRecommendationService } from "./quiz-service";
import { z } from "zod";
import express from "express";
import path from "path";
import { protectRoute, requireAuth, rateLimit, secureHeaders, validateOrderAccess, validateCustomerEmail } from "./lib/auth";
import { setupAuth } from "./replitAuth";
import authRoutes from "./routes/auth";
// All auth middleware now consolidated in ./lib/auth
import adminRoutes from "./routes/admin";
import portalRoutes from "./routes/portal";
import stripeRoutes from "./routes/stripe";
import cartRoutes from "./routes/cart";
import emailTestRoutes from "./routes/email-test";

// Stripe imports moved to dedicated service
import { stripe } from "./lib/stripe";

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply secure headers to all routes
  app.use(secureHeaders);
  
  // Serve static assets from attached_assets directory
  app.use('/assets', express.static(path.resolve(process.cwd(), 'attached_assets')));
  
  // Setup Replit Auth BEFORE other routes
  await setupAuth(app);
  
  // Demo login endpoint (after session setup, before CSRF protection)
  app.post('/api/auth/demo-admin-login', async (req, res) => {
    try {
      const { storage } = await import('./storage');
      const { sanitizeUser } = await import('./lib/auth');
      
      console.log('[DEMO_LOGIN] Attempting demo admin login');
      
      // Find the demo admin user by email, create if doesn't exist
      let demoAdmin = await storage.getUserByEmail('admin@healios.com');
      
      if (!demoAdmin) {
        console.log('[DEMO_LOGIN] Demo admin user not found, creating...');
        demoAdmin = await storage.createUser({
          email: 'admin@healios.com',
          firstName: 'Demo',
          lastName: 'Admin',
          role: 'admin',
          isActive: true
        });
        console.log('[DEMO_LOGIN] Created demo admin user:', demoAdmin.id);
      }
      
      console.log('[DEMO_LOGIN] Found demo admin:', demoAdmin.email, demoAdmin.role);
      
      // Set session
      req.session = req.session || {};
      req.session.userId = demoAdmin.id;
      
      console.log('[DEMO_LOGIN] Session set for user:', demoAdmin.id);
      console.log('[DEMO_LOGIN] Session object:', req.session);
      
      // Save session explicitly
      req.session.save((err) => {
        if (err) {
          console.error('[DEMO_LOGIN] Session save error:', err);
          return res.status(500).json({ message: 'Session save failed' });
        }
        
        console.log('[DEMO_LOGIN] Session saved successfully');
        res.json({ 
          success: true, 
          user: sanitizeUser(demoAdmin),
          redirectUrl: '/admin'
        });
      });
    } catch (error) {
      console.error('Demo login error:', error);
      res.status(500).json({ message: 'Demo login failed' });
    }
  });
  
  // Register Stripe webhook routes BEFORE body parsing middleware
  // This is critical for webhook signature verification
  app.use('/stripe', stripeRoutes);

  // Register CSRF token endpoint
  app.use('/api/csrf', (await import('./routes/csrf')).default);
  
  // Register auth routes
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/portal', portalRoutes);
  app.use('/api/cart', cartRoutes);
  
  // Register bundle routes (Phase 16)
  const bundleRoutes = await import('./routes/bundles');
  app.use('/api/bundles', bundleRoutes.default);
  
  const adminBundleRoutes = await import('./routes/adminBundles');
  app.use('/api/admin/bundles', requireAuth, protectRoute(['admin']), adminBundleRoutes.default);
  
  // Register subscription routes (Phase 18)
  const subscriptionRoutes = await import('./routes/subscriptions');
  app.use('/api/subscriptions', subscriptionRoutes.subscriptionRoutes);
  
  // Register email job routes (Phase 19) - Admin only
  const emailJobsRoutes = await import('./routes/email-jobs');
  app.use('/api/admin/email-jobs', emailJobsRoutes.default);
  
  // Register referral routes (Phase 20)
  const referralRoutes = await import('./routes/referrals');
  app.use('/api/referrals', referralRoutes.default);
  
  // Register AI assistant routes (Phase 21)
  const aiAssistantRoutes = await import('./routes/aiAssistant');
  app.use('/api/ai-assistant', aiAssistantRoutes.aiAssistantRoutes);
  
  // Register admin cart analytics routes
  const adminCartsRoutes = await import('./routes/admin/carts');
  app.use('/api/admin/carts', adminCartsRoutes.default);
  
  // Register admin logging routes
  const adminLogsRoutes = await import('./routes/admin/logs');
  app.use('/api/admin/logs', adminLogsRoutes.default);
  
  // Register security audit routes (admin only)
  const securityAuditRoutes = await import('./routes/security-audit');
  app.use('/api/admin/security', securityAuditRoutes.default);
  
  // Email system (development only)
  if (process.env.NODE_ENV === 'development') {
    app.use('/api/email', emailTestRoutes);
  }

  // Register object storage routes  
  const objectStorageRoutes = await import('./routes/objectStorage');
  await objectStorageRoutes.registerRoutes(app);

  // Register admin image upload routes - PROTECTED
  const adminImagesRoutes = await import('./routes/adminImages');
  app.use('/api/admin/images', requireAuth, protectRoute(['admin']), adminImagesRoutes.default);
  
  // Register ALFR3D security dashboard routes - ADMIN ONLY (development)
  if (process.env.NODE_ENV === 'development') {
    const alfr3dRoutes = await import('./routes/alfr3d');
    app.use('/api/alfr3d', alfr3dRoutes.default);
  }
  

  // Get all products - FROM DATABASE
  app.get("/api/products", async (req, res) => {
    try {
      const dbProducts = await db.select().from(products);
      res.json(dbProducts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Get featured products - FROM DATABASE
  app.get("/api/products/featured", async (req, res) => {
    try {
      const dbProducts = await db.select().from(products).where(eq(products.featured, true));
      res.json(dbProducts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured products" });
    }
  });

  // Get product by ID - FROM DATABASE
  app.get("/api/products/:id", async (req, res) => {
    try {
      const [product] = await db.select().from(products).where(eq(products.id, req.params.id));
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Get products by category - FROM DATABASE
  app.get("/api/products/category/:category", async (req, res) => {
    try {
      // Input validation to prevent SQL injection
      const categorySchema = z.object({
        category: z.string()
          .min(1, "Category cannot be empty")
          .max(50, "Category name too long")
          .regex(/^[a-zA-Z0-9\s\-_]+$/, "Invalid category format")
          .trim()
      });
      
      const validationResult = categorySchema.safeParse({ category: req.params.category });
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid category parameter",
          errors: validationResult.error.errors 
        });
      }
      
      const { category } = validationResult.data;
      
      // Use safe Drizzle array contains query instead of raw SQL
      const dbProducts = await db
        .select()
        .from(products)
        .where(arrayContains(products.categories, [category]));
        
      res.json(dbProducts);
    } catch (error) {
      console.error('Product category search error:', error);
      res.status(500).json({ message: "Failed to fetch products by category" });
    }
  });

  // Book consultation (trainer or nutritionist)
  app.post("/api/consultations/book", rateLimit(5, 300000), async (req, res) => {
    try {
      const validatedData = insertConsultationBookingSchema.parse(req.body);
      const booking = await storage.createConsultationBooking(validatedData);
      
      // Send confirmation email
      await EmailService.sendConsultationBookingConfirmation({
        email: booking.email,
        name: booking.name,
        type: booking.type as 'trainer' | 'nutritionist',
        bookingId: booking.id
      });
      
      res.json({ 
        success: true, 
        message: "Consultation booked successfully!",
        bookingId: booking.id
      });
    } catch (error) {
      console.error('Consultation booking error:', error);
      res.status(400).json({ 
        success: false, 
        message: "Failed to book consultation" 
      });
    }
  });

  // Get most recent article
  app.get("/api/articles/latest", async (req, res) => {
    try {
      const articles = await storage.getArticles();
      if (articles.length === 0) {
        return res.status(404).json({ message: "No articles found" });
      }
      
      // Sort by createdAt descending and get the first one
      const latestArticle = articles.sort((a, b) => 
        new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      )[0];
      
      res.json(latestArticle);
    } catch (error) {
      console.error('Error fetching latest article:', error);
      res.status(500).json({ message: "Failed to fetch latest article" });
    }
  });

  // Phase 14: Product Variants endpoints
  app.get("/api/products/:id/variants", async (req, res) => {
    try {
      const { id } = req.params;
      const variants = await storage.getProductVariants(id);
      res.json(variants);
    } catch (error) {
      console.error('Error fetching product variants:', error);
      res.status(500).json({ message: "Failed to fetch product variants" });
    }
  });

  app.get("/api/product-variants/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const variant = await storage.getProductVariant(id);
      if (!variant) {
        return res.status(404).json({ message: "Product variant not found" });
      }
      res.json(variant);
    } catch (error) {
      console.error('Error fetching product variant:', error);
      res.status(500).json({ message: "Failed to fetch product variant" });
    }
  });

  app.get("/api/products/:id/with-variants", async (req, res) => {
    try {
      const { id } = req.params;
      const productWithVariants = await storage.getProductWithVariants(id);
      if (!productWithVariants) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(productWithVariants);
    } catch (error) {
      console.error('Error fetching product with variants:', error);
      res.status(500).json({ message: "Failed to fetch product with variants" });
    }
  });

  // Newsletter subscription
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const validatedData = insertNewsletterSchema.parse(req.body);
      const subscription = await storage.subscribeToNewsletter(validatedData);
      
      // Send confirmation emails
      try {
        await EmailService.sendNewsletterConfirmation(subscription);
      } catch (emailError) {
        console.error('Failed to send newsletter confirmation emails:', emailError);
        // Don't fail the subscription if email fails
      }
      
      res.json({ message: "Successfully subscribed to newsletter", subscription });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to subscribe to newsletter" });
    }
  });

  // Restock notifications
  app.post("/api/restock-notifications", async (req, res) => {
    try {
      const validatedData = insertRestockNotificationSchema.parse(req.body);
      const notification = await storage.createRestockNotification(validatedData);
      
      // Send confirmation email
      try {
        await EmailService.sendRestockNotificationConfirmation(
          validatedData.email,
          validatedData.firstName || 'there',
          validatedData.productName
        );
      } catch (emailError) {
        console.error('Failed to send restock confirmation email:', emailError);
        // Don't fail the notification if email fails
      }
      
      res.json({ message: "Restock notification set successfully", notification });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to set restock notification" });
    }
  });


  // Create Stripe Checkout Session for external payment processing
  app.post("/api/create-checkout-session", validateCustomerEmail, validateOrderAccess, rateLimit(5, 60000), async (req: express.Request, res: express.Response) => {
    try {
      const bodySchema = z.object({
        orderData: z.object({}).passthrough(),
        lineItems: z.array(z.object({}).passthrough()).min(1),
        successUrl: z.string().url(),
        cancelUrl: z.string().url(),
        sessionToken: z.string().optional(),
        discountCode: z.string().optional()
      });
      
      const parsed = bodySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
      }
      
      const { orderData, lineItems, successUrl, cancelUrl, sessionToken, discountCode } = parsed.data;
      
      if (!lineItems || !lineItems.length) {
        return res.status(400).json({ message: "Line items are required" });
      }

      let discountAmount = 0;
      let appliedDiscountCode = null;
      let originalTotal = 0;

      // Calculate original total
      originalTotal = lineItems.reduce((sum: number, item: any) => {
        return sum + (item.price_data.unit_amount * item.quantity);
      }, 0);

      // Phase 15: Validate and apply discount code if provided
      if (discountCode && discountCode.trim()) {
        const validation = await storage.validateDiscountCode(discountCode.trim());
        
        if (!validation.valid) {
          return res.status(400).json({ 
            message: validation.error || "Invalid discount code" 
          });
        }

        const discount = validation.discount!;
        appliedDiscountCode = discount;

        // Calculate discount amount in cents (Stripe uses cents)
        if (discount.type === "percent") {
          discountAmount = Math.round(originalTotal * (parseFloat(discount.value) / 100));
        } else if (discount.type === "fixed") {
          // Convert fixed amount to cents (assuming ZAR)
          discountAmount = Math.round(parseFloat(discount.value) * 100);
        }

        // Ensure discount doesn't exceed total
        discountAmount = Math.min(discountAmount, originalTotal);

        // Increment usage count immediately (before checkout)
        await storage.incrementDiscountCodeUsage(discount.id);

        console.log('🎟️ Applied discount code:', {
          code: discount.code,
          type: discount.type,
          value: discount.value,
          originalTotal: originalTotal / 100,
          discountAmount: discountAmount / 100,
          finalTotal: (originalTotal - discountAmount) / 100
        });
      }

      // Create order first to get order ID for success URL
      const finalOrderData = {
        ...orderData,
        // Update total amount with discount applied
        totalAmount: discountAmount > 0 
          ? ((originalTotal - discountAmount) / 100).toString()
          : orderData.totalAmount
      };

      // SECURITY: Validate order data before database insertion
      const validatedOrderData = insertOrderSchema.parse(finalOrderData);
      const order = await storage.createOrder(validatedOrderData);
      
      // Update stock for each item
      const orderItems = JSON.parse(orderData.orderItems);
      for (const item of orderItems) {
        await storage.decreaseProductStock(item.product.id, item.quantity);
      }

      // Prepare Stripe session configuration
      const sessionConfig: any = {
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${successUrl}?order_id=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        customer_email: orderData.customerEmail,
        metadata: {
          orderId: order.id,
          userId: orderData.userId || null,
          customerEmail: orderData.customerEmail,
          customerName: orderData.customerName || null,
          customerPhone: orderData.customerPhone || null,
          orderItems: orderData.orderItems,
          notes: orderData.notes || null,
          sessionToken: sessionToken || null,
          discountCode: appliedDiscountCode?.code || null,
          discountAmount: discountAmount > 0 ? (discountAmount / 100).toString() : null,
        },
        billing_address_collection: 'required',
        shipping_address_collection: {
          allowed_countries: ['ZA', 'US', 'GB'], // Add countries as needed
        },
      };

      // Apply discount through Stripe if applicable
      if (discountAmount > 0) {
        // Create a one-time coupon for this discount
        const coupon = await stripe.coupons.create({
          amount_off: discountAmount,
          currency: 'zar',
          duration: 'once',
          name: `Discount Code: ${appliedDiscountCode!.code}`,
        });

        sessionConfig.discounts = [{
          coupon: coupon.id,
        }];
      }

      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create(sessionConfig);
      
      res.json({ 
        sessionUrl: session.url,
        orderId: order.id,
        sessionId: session.id,
        discountApplied: discountAmount > 0,
        discountAmount: discountAmount > 0 ? discountAmount / 100 : 0,
        discountCode: appliedDiscountCode?.code || null,
      });
    } catch (error: any) {
      console.error("Stripe checkout session error:", error);
      res.status(500).json({ message: "Error creating checkout session: " + error.message });
    }
  });

  // Legacy webhook endpoint - DEPRECATED
  // Use /stripe/webhook for secure webhook handling

  // Create Shopify redirect endpoint
  app.post("/api/create-shopify-checkout", async (req, res) => {
    try {
      const { orderData, returnUrl } = req.body;
      
      // SECURITY: Validate order data before database insertion
      const validatedOrderData = insertOrderSchema.parse(orderData);
      
      // Create order first
      const order = await storage.createOrder(validatedOrderData);
      
      // Update stock
      const orderItems = JSON.parse(orderData.orderItems);
      for (const item of orderItems) {
        await storage.decreaseProductStock(item.product.id, item.quantity);
      }
      
      // For Shopify, you would typically redirect to your Shopify store's checkout
      // with cart items. This is a placeholder implementation.
      const shopifyStoreUrl = process.env.SHOPIFY_STORE_URL || 'https://your-store.myshopify.com';
      
      // Build Shopify cart URL with items
      const cartItems = orderItems.map((item: any) => 
        `${item.product.id}:${item.quantity}`
      ).join(',');
      
      const shopifyCheckoutUrl = `${shopifyStoreUrl}/cart/${cartItems}?return_to=${encodeURIComponent(returnUrl + '?order_id=' + order.id)}`;
      
      res.json({ 
        checkoutUrl: shopifyCheckoutUrl,  
        orderId: order.id
      });
    } catch (error: any) {
      console.error("Shopify checkout error:", error);
      res.status(500).json({ message: "Error creating Shopify checkout: " + error.message });
    }
  });

  // Create order endpoint
  // Consolidated discount code validation endpoint (Phase 15)
  app.post("/api/validate-discount", rateLimit(30, 60000), async (req, res) => {
    try {
      const bodySchema = z.object({
        code: z.string().min(1),
        subtotal: z.number().optional(),
        cartTotal: z.number().optional()
      });
      
      const parsed = bodySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
      }
      
      const { code, subtotal, cartTotal } = parsed.data;
      // Support both parameter names for backward compatibility
      const total = subtotal || cartTotal;
      
      if (!code || typeof code !== "string") {
        return res.status(400).json({ error: "Code is required" });
      }
      
      if (total !== undefined && typeof total !== 'number') {
        return res.status(400).json({ error: "Total must be a number" });
      }

      // Use the comprehensive validation method
      const validation = await storage.validateDiscountCode(code.trim());
      
      if (!validation.valid) {
        return res.json({
          valid: false,
          error: validation.error
        });
      }

      const discount = validation.discount!;
      let discountAmount = 0;

      // Calculate discount amount if total provided
      if (total && total > 0) {
        if (discount.type === "percent") {
          discountAmount = (total * parseFloat(discount.value)) / 100;
        } else if (discount.type === "fixed") {
          discountAmount = parseFloat(discount.value);
        }
        
        // Ensure discount doesn't exceed total
        discountAmount = Math.min(discountAmount, total);
      }

      res.json({
        valid: true,
        code: discount.code,
        type: discount.type,
        value: discount.value,
        discountAmount,
        finalTotal: total ? Math.max(0, total - discountAmount) : undefined
      });
    } catch (error) {
      console.error("Error validating discount code:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/orders", validateCustomerEmail, validateOrderAccess, rateLimit(10, 300000), async (req: express.Request, res: express.Response) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      
      // Parse order items to update stock
      let orderItems: any[] = [];
      try {
        orderItems = JSON.parse(validatedData.orderItems);
      } catch (parseError) {
        return res.status(400).json({ message: "Invalid order items format" });
      }

      // Create the order
      const order = await storage.createOrder(validatedData);

      // If a discount code was used, increment its usage count
      if (validatedData.discountCode) {
        try {
          await storage.incrementDiscountCodeUsage(validatedData.discountCode);
        } catch (discountError) {
          console.error('Failed to increment discount code usage:', discountError);
          // Don't fail the order creation for this
        }
      }

      // Update stock for each item
      for (const item of orderItems) {
        const updatedProduct = await storage.decreaseProductStock(item.product.id, item.quantity);
        
        // Check if product is now out of stock
        if (updatedProduct && (updatedProduct.stockQuantity || 0) <= 0) {
          console.log(`Product ${updatedProduct.name} is now out of stock`);
        }
      }

      // For direct order creation (fallback), send emails immediately
      try {
        await EmailService.sendOrderConfirmation({ order, orderItems });
      } catch (emailError) {
        console.error('Failed to send order emails:', emailError);
      }

      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      console.error('Order creation error:', error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Get order by ID
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Get orders by email (protected - customers can only access their own orders)
  app.get("/api/orders/customer/:email", requireAuth, async (req, res) => {
    try {
      // Security check: customers can only access their own orders, admins can access any
      if (req.user?.role !== 'admin' && req.user?.email !== req.params.email) {
        return res.status(403).json({ message: "Access denied: can only view your own orders" });
      }
      
      const orders = await storage.getOrdersByEmail(req.params.email);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer orders" });
    }
  });

  // Cart route to handle automatic cart population from quiz recommendations
  app.get("/cart", async (req, res) => {
    try {
      const { items } = req.query;
      
      if (!items || typeof items !== 'string') {
        // Redirect to normal cart page if no items specified
        return res.redirect('/');
      }

      // Parse items format: "productId1:quantity1,productId2:quantity2"
      const cartItems = items.split(',').map(item => {
        const [productId, quantity] = item.split(':');
        return { productId, quantity: parseInt(quantity || '1') };
      });

      // Fetch product data for all items
      const productsData = [];
      for (const item of cartItems) {
        try {
          const product = await storage.getProductById(item.productId);
          if (product) {
            productsData.push({
              product,
              quantity: item.quantity
            });
          }
        } catch (error) {
          console.error(`Failed to fetch product ${item.productId}:`, error);
        }
      }

      // Generate cart data as JSON for the frontend
      const cartData = {
        items: productsData,
        autoAdded: true,
        source: 'quiz_recommendations'
      };

      // Return a simple HTML page that will populate the cart via JavaScript
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Loading Your Cart - Healios</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; background: #fff; text-align: center; }
            .loader { display: inline-block; width: 20px; height: 20px; border: 3px solid #f3f3f3; border-top: 3px solid #000; border-radius: 50%; animation: spin 1s linear infinite; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <h1>Adding Your Recommendations to Cart...</h1>
          <div class="loader"></div>
          <p>Please wait while we prepare your personalized supplements.</p>
          
          <script>
            const cartData = ${JSON.stringify(cartData)};
            
            // Store cart data in localStorage for the main app to use
            localStorage.setItem('healios_auto_cart', JSON.stringify(cartData));
            localStorage.setItem('healios_cart_timestamp', Date.now().toString());
            
            // Redirect to main app
            setTimeout(() => {
              window.location.href = '/';
            }, 1500);
          </script>
        </body>
        </html>
      `;

      res.send(html);
    } catch (error) {
      console.error('Cart route error:', error);
      res.redirect('/');
    }
  });

  // Update order status (admin endpoint)
  app.patch("/api/orders/:id/status", protectRoute(['admin']), async (req, res) => {
    try {
      const bodySchema = z.object({
        status: z.string().min(1)
      });
      
      const parsed = bodySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
      }
      
      const { status } = parsed.data;
      const order = await storage.updateOrderStatus(req.params.id, status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Stock management endpoints
  app.patch("/api/products/:id/stock", protectRoute(['admin']), async (req, res) => {
    try {
      const bodySchema = z.object({
        quantity: z.number().int().nonnegative()
      });
      
      const parsed = bodySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
      }
      
      const { quantity } = parsed.data;
      
      const product = await storage.updateProductStock(req.params.id, quantity);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to update product stock" });
    }
  });

  // Get stock alerts
  app.get("/api/stock-alerts", protectRoute(['admin']), async (req, res) => {
    try {
      const alerts = await storage.getStockAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stock alerts" });
    }
  });

  // Send low stock alert manually
  app.post("/api/stock-alerts/send", protectRoute(['admin']), async (req, res) => {
    try {
      const bodySchema = z.object({
        productId: z.string().min(1),
        productName: z.string().min(1),
        currentStock: z.number().int().nonnegative()
      });
      
      const parsed = bodySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
      }
      
      const { productId, productName, currentStock } = parsed.data;
      
      const success = await EmailService.sendLowStockAlert({ productName, currentStock, threshold: 5 });
      
      if (success) {
        // Mark alert as sent
        const alerts = await storage.getStockAlerts();
        const alert = alerts.find(a => a.productId === productId && !a.alertSent);
        if (alert) {
          await storage.markAlertSent(alert.id);
        }
      }
      
      res.json({ success, message: success ? 'Alert sent successfully' : 'Failed to send alert' });
    } catch (error) {
      res.status(500).json({ message: "Failed to send stock alert" });
    }
  });

  // Pre-order submission
  app.post("/api/pre-orders", async (req, res) => {
    try {
      const validatedData = insertPreOrderSchema.parse(req.body);
      const preOrder = await storage.createPreOrder(validatedData);
      
      // Send email notification using Resend
      console.log('🚀 Attempting to send pre-order email notification...');
      try {
        const emailResult = await EmailService.sendPreOrderNotification(preOrder);
        console.log('📧 Email sending result:', emailResult);
      } catch (emailError) {
        console.error('❌ Failed to send pre-order email notification:', emailError);
        // Don't fail the pre-order if email fails
      }
      
      res.json(preOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create pre-order" });
    }
  });

  // Restock notification submission
  app.post("/api/notify-restock", async (req, res) => {
    try {
      const bodySchema = z.object({
        firstName: z.string().min(1),
        email: z.string().email(),
        product: z.string().min(1),
        restockDate: z.string().min(1)
      });
      
      const parsed = bodySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
      }
      
      const { firstName, email, product, restockDate } = parsed.data;

      console.log('🚀 Sending restock notification emails...');
      const success = await EmailService.sendRestockNotification({
        firstName,
        email,
        product,
        restockDate
      });

      if (success) {
        res.json({ message: "Notification request submitted successfully" });
      } else {
        res.status(500).json({ message: "Failed to send notification emails" });
      }
    } catch (error) {
      console.error('Error handling restock notification:', error);
      res.status(500).json({ message: "Failed to process notification request" });
    }
  });

  // Article generation functionality has been disabled for security purposes

  // Get all articles
  app.get("/api/articles", async (req, res) => {
    try {
      const articles = await storage.getArticles();
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  // Get article by slug
  app.get("/api/articles/:slug", async (req, res) => {
    try {
      const article = await storage.getArticleBySlug(req.params.slug);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  // Get articles by category
  app.get("/api/articles/category/:category", async (req, res) => {
    try {
      const articles = await storage.getArticlesByCategory(req.params.category);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch articles by category" });
    }
  });

  // Article generation endpoints have been removed for security purposes

  // Quiz completion endpoint
  app.post("/api/quiz/complete", requireAuth, async (req, res) => {
    try {
      const {
        email,
        firstName,
        lastName,
        consentToMarketing,
        answers
      } = req.body;
      
      // Validate required fields
      if (!email || !firstName || !lastName || !answers) {
        return res.status(400).json({ 
          message: "Email, first name, last name, and answers are required" 
        });
      }
      
      // Generate personalized recommendations based on quiz answers
      const recommendations = QuizRecommendationService.analyzeAnswersAndRecommend(answers);
      
      // Save quiz result to database
      const quizResult = await storage.createQuizResult({
        email,
        firstName,
        lastName,
        consentToMarketing: consentToMarketing || false,
        answers: JSON.stringify(answers),
        recommendations: JSON.stringify(recommendations)
      });
      
      // Send emails (user recommendations + admin notification)
      const emailSuccess = await EmailService.sendQuizRecommendations(quizResult, recommendations);
      
      if (!emailSuccess) {
        console.error('Failed to send quiz completion emails');
        // Still return success as the quiz was saved, just log the email failure
      }
      
      res.json({
        success: true,
        message: "Quiz completed successfully! Check your email for personalized recommendations.",
        quizId: quizResult.id,
        recommendationCount: recommendations.primaryRecommendations.length + recommendations.secondaryRecommendations.length
      });
      
    } catch (error) {
      console.error("Quiz completion failed:", error);
      res.status(500).json({ 
        message: "Failed to process quiz completion", 
        error: (error as Error).message 
      });
    }
  });

  // Get quiz statistics (admin only)
  app.get("/api/quiz/stats", protectRoute(['admin']), async (req, res) => {
    try {
      const quizResults = await storage.getQuizResults();
      
      res.json({
        totalCompletions: quizResults.length,
        recentCompletions: quizResults
          .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
          .slice(0, 10)
          .map(result => ({
            id: result.id,
            name: `${result.firstName} ${result.lastName}`,
            email: result.email,
            completedAt: result.createdAt,
            consentToMarketing: result.consentToMarketing
          }))
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get quiz statistics" });
    }
  });

  // Chat functionality removed as requested

  // Test email endpoint - sends samples of all email templates
  app.post("/api/test-emails", requireAuth, async (req, res) => {
    try {
      console.log('🧪 Testing all email templates...');
      const results: string[] = [];
      
      // Ensure we return JSON response
      res.setHeader('Content-Type', 'application/json');
      
      // Test Newsletter Confirmation
      try {
        const testNewsletter = {
          id: 'test-newsletter-123',
          email: 'domincinel@mac.com',
          firstName: 'Test',
          lastName: 'User',
          birthday: '1990-01-15',
          subscribedAt: new Date().toISOString()
        };
        await EmailService.sendNewsletterConfirmation(testNewsletter);
        results.push('✅ Newsletter confirmation email sent');
      } catch (error) {
        results.push('❌ Newsletter confirmation failed: ' + (error as Error).message);
      }

      // Test Order Confirmation
      try {
        const testOrder = {
          id: 'test-order-123',
          customerEmail: 'domincinel@mac.com',
          customerName: 'Test Customer',
          customerPhone: '+27123456789',
          totalAmount: '599.00',
          createdAt: new Date().toISOString(),
          shippingAddress: '123 Test Street\nCape Town, 8001\nSouth Africa',
          billingAddress: '123 Test Street\nCape Town, 8001\nSouth Africa',
          orderItems: JSON.stringify([{
            // Removed test data - should fetch from actual database
            quantity: 1
          }]),
          currency: 'ZAR',
          paymentStatus: 'completed',
          orderStatus: 'processing'
        };
        const testOrderItems = [{
          // Removed test data - should fetch from actual database
          quantity: 1
        }];
        await EmailService.sendOrderConfirmation({ order: testOrder as any, orderItems: testOrderItems });
        results.push('✅ Order confirmation and admin notification emails sent');
      } catch (error) {
        results.push('❌ Order emails failed: ' + (error as Error).message);
      }

      // Test Low Stock Alert
      try {
        await EmailService.sendLowStockAlert({ productName: 'Test Vitamin D3', currentStock: 2, threshold: 5 });
        results.push('✅ Low stock alert email sent');
      } catch (error) {
        results.push('❌ Low stock alert failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }

      // Test Pre-Order Notification
      try {
        const testPreOrder = {
          id: 'test-preorder-123',
          customerEmail: 'domincinel@mac.com',
          customerName: 'Test Customer',
          customerPhone: '+27123456789',
          productId: 'test-product-456',
          productName: 'Test Magnesium Gummies',
          productPrice: '449.00',
          quantity: 2,
          notes: 'Please notify me as soon as available',
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        await EmailService.sendPreOrderNotification(testPreOrder);
        results.push('✅ Pre-order confirmation email sent');
      } catch (error) {
        results.push('❌ Pre-order notification failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }

      // Test Restock Notification
      try {
        await EmailService.sendRestockNotification({
          firstName: 'Test',
          email: 'domincinel@mac.com',
          product: 'Test Collagen Complex',
          restockDate: 'February 15th'
        });
        results.push('✅ Restock notification emails sent');
      } catch (error) {
        results.push('❌ Restock notification failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }

      console.log('🧪 Email test results:', results);
      return res.json({ 
        success: true, 
        message: 'Email tests completed', 
        results 
      });
    } catch (error) {
      console.error('❌ Email test endpoint error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Email test failed', 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Health check endpoint for deployment
  app.get("/health", (req, res) => {
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });

  const httpServer = createServer(app);

  // Phase 19: Start email scheduler in development mode
  if (process.env.NODE_ENV === 'development') {
    const { emailScheduler } = await import('./jobs/scheduler');
    console.log("[SERVER] Starting email job scheduler in development mode...");
    emailScheduler.start();
  }

  return httpServer;
}

