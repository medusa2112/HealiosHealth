import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertNewsletterSchema, insertPreOrderSchema, insertArticleSchema, insertOrderSchema, insertQuizResultSchema, type Article, type QuizResult } from "@shared/schema";
import { EmailService } from "./email";
import { QuizRecommendationService } from "./quiz-service";
import { z } from "zod";
import express from "express";
import path from "path";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static assets from attached_assets directory
  app.use('/assets', express.static(path.resolve(process.cwd(), 'attached_assets')));

  // Get all products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Get featured products
  app.get("/api/products/featured", async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured products" });
    }
  });

  // Get product by ID
  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Get products by category
  app.get("/api/products/category/:category", async (req, res) => {
    try {
      const products = await storage.getProductsByCategory(req.params.category);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products by category" });
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



  // Create Stripe Checkout Session for external payment processing
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const { orderData, lineItems, successUrl, cancelUrl } = req.body;
      
      if (!lineItems || !lineItems.length) {
        return res.status(400).json({ message: "Line items are required" });
      }

      // Create order first to get order ID for success URL
      const order = await storage.createOrder(orderData);
      
      // Update stock for each item
      const orderItems = JSON.parse(orderData.orderItems);
      for (const item of orderItems) {
        await storage.decreaseProductStock(item.product.id, item.quantity);
      }

      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${successUrl}?order_id=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        customer_email: orderData.customerEmail,
        metadata: {
          orderId: order.id,
          orderData: JSON.stringify(orderData),
        },
        billing_address_collection: 'required',
        shipping_address_collection: {
          allowed_countries: ['ZA', 'US', 'GB'], // Add countries as needed
        },
      });
      
      res.json({ 
        sessionUrl: session.url,
        orderId: order.id,
        sessionId: session.id
      });
    } catch (error: any) {
      console.error("Stripe checkout session error:", error);
      res.status(500).json({ message: "Error creating checkout session: " + error.message });
    }
  });

  // Webhook endpoint for Stripe payment confirmation
  app.post("/api/stripe-webhook", express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    let event;

    try {
      // Verify webhook signature (add STRIPE_WEBHOOK_SECRET to env)
      if (process.env.STRIPE_WEBHOOK_SECRET) {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
      } else {
        event = JSON.parse(req.body.toString());
      }
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        const orderId = session.metadata?.orderId;
        
        if (orderId) {
          try {
            // Update order status to paid
            await storage.updateOrderStatus(orderId, 'completed');
            
            // Get order details for email
            const order = await storage.getOrderById(orderId);
            if (order) {
              const orderItems = JSON.parse(order.orderItems);
              
              // Send confirmation emails
              try {
                await EmailService.sendOrderConfirmation({ order, orderItems });
              } catch (emailError) {
                console.error('Failed to send order emails:', emailError);
              }
            }
          } catch (error) {
            console.error('Error processing completed checkout:', error);
          }
        }
        break;
        
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({received: true});
  });

  // Create Shopify redirect endpoint
  app.post("/api/create-shopify-checkout", async (req, res) => {
    try {
      const { orderData, returnUrl } = req.body;
      
      // Create order first
      const order = await storage.createOrder(orderData);
      
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
  app.post("/api/orders", async (req, res) => {
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

  // Get orders by email
  app.get("/api/orders/customer/:email", async (req, res) => {
    try {
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
  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
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
  app.patch("/api/products/:id/stock", async (req, res) => {
    try {
      const { quantity } = req.body;
      if (typeof quantity !== 'number' || quantity < 0) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      
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
  app.get("/api/stock-alerts", async (req, res) => {
    try {
      const alerts = await storage.getStockAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stock alerts" });
    }
  });

  // Send low stock alert manually
  app.post("/api/stock-alerts/send", async (req, res) => {
    try {
      const { productId, productName, currentStock } = req.body;
      
      const success = await EmailService.sendLowStockAlert(productName, currentStock, productId);
      
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
      const { firstName, email, product, restockDate } = req.body;
      
      if (!firstName || !email || !product || !restockDate) {
        return res.status(400).json({ message: "Missing required fields" });
      }

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
  app.post("/api/quiz/complete", async (req, res) => {
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
  app.get("/api/quiz/stats", async (req, res) => {
    try {
      const quizResults = await storage.getQuizResults();
      
      res.json({
        totalCompletions: quizResults.length,
        recentCompletions: quizResults
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
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

  // Chat endpoint for product questions
  app.post("/api/chat/product-question", async (req, res) => {
    try {
      const { question, conversationHistory = [] } = req.body;

      if (!question?.trim()) {
        return res.status(400).json({ error: 'Question is required' });
      }

      // Build conversation context
      let conversationContext = '';
      if (conversationHistory.length > 0) {
        conversationContext = '\n\nRecent conversation:\n' + 
          conversationHistory.slice(-3).map((msg: any) => 
            `${msg.isUser ? 'User' : 'Assistant'}: ${msg.content}`
          ).join('\n');
      }

      const productKnowledge = `
You are a helpful nutrition assistant for Healios, a premium supplement company specializing in science-backed gummy vitamins and supplements. Here's key information about our products:

CURRENT PRODUCTS & STOCK STATUS:
- Apple Cider Vinegar Gummies (Strawberry) - IN STOCK - R349.00
- Vitamin D3 4000 IU Gummies (Lemon) - IN STOCK - R399.00 (our bestselling high-potency formula)
- Ashwagandha 600mg Gummies (Strawberry) - PREORDER
- Iron + Vitamin C Gummies (Cherry) - PREORDER  
- Biotin 5000µg Gummies (Strawberry) - PREORDER
- Magnesium Gummies (Berry) - PREORDER
- Collagen Complex Gummies (Orange) - PREORDER
- Probiotic Complex 10 Billion CFU (Capsules) - PREORDER - NOT gummies, these are delayed-release capsules
- Folic Acid 400µg Gummies (Berry) - PREORDER
- Children's Multivitamin Gummies - PREORDER

KEY DIFFERENTIATORS:
- Science-backed formulations with EFSA health claims where applicable
- No artificial colors, flavors, or preservatives
- Vegetarian-friendly (except some specialty formulas)
- High-potency therapeutic doses
- Premium ingredients with superior bioavailability
- South African pricing in ZAR (Rand)

DOSAGE & SAFETY:
- All products designed for daily use
- Follow label instructions for dosage
- Consult healthcare provider if pregnant, nursing, or taking medications
- Our Vitamin D3 is 4000 IU high-potency, ideal for year-round support

SPECIAL FEATURES:
- Bundle discounts available on product pages
- Pre-order system for out-of-stock items with email notifications
- Free shipping on qualifying orders
- 60-day satisfaction guarantee

Always be helpful, accurate, and recommend consulting healthcare providers for specific health concerns. Focus on ingredient benefits backed by research rather than making medical claims.
`;

      const prompt = `${productKnowledge}

${conversationContext}

User Question: ${question}

Please provide a helpful, accurate response about Healios supplements. Be conversational but informative. If the question is about specific health conditions, remind them to consult their healthcare provider. Keep responses concise but comprehensive.`;

      // Call OpenAI API for intelligent responses
      if (process.env.OPENAI_API_KEY) {
        try {
          const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                {
                  role: 'system',
                  content: 'You are a knowledgeable nutrition assistant for Healios supplements. Be helpful, accurate, and friendly while staying within the bounds of nutrition education rather than medical advice.'
                },
                {
                  role: 'user',
                  content: prompt
                }
              ],
              max_tokens: 500,
              temperature: 0.7,
            }),
          });

          if (openaiResponse.ok) {
            const openaiData = await openaiResponse.json();
            const answer = openaiData.choices[0]?.message?.content || 
              'I apologize, but I\'m having trouble processing your question right now. Please try again or contact our support team.';
            return res.json({ answer });
          }
        } catch (error) {
          console.error('OpenAI API error:', error);
        }
      }
      
      // Fallback response for common questions
      const questionLower = question.toLowerCase();
      let fallbackAnswer = '';
      
      if (questionLower.includes('vitamin d') || questionLower.includes('d3')) {
        fallbackAnswer = 'Our Vitamin D3 4000 IU is our bestselling high-potency formula, perfect for year-round immune and bone support. It\'s currently in stock for R399.00. The lemon flavor makes it enjoyable to take daily, and 4000 IU provides optimal therapeutic levels for most adults.';
      } else if (questionLower.includes('apple cider vinegar') || questionLower.includes('acv')) {
        fallbackAnswer = 'Our Apple Cider Vinegar Gummies provide all the benefits of traditional ACV without the harsh taste or burn. They support metabolism and digestive health in a delicious strawberry flavor. Currently in stock for R349.00.';
      } else if (questionLower.includes('stock') || questionLower.includes('available')) {
        fallbackAnswer = 'Currently, we have Apple Cider Vinegar Gummies and Vitamin D3 4000 IU in stock. All other products are available for pre-order with email notifications when they become available.';
      } else if (questionLower.includes('price') || questionLower.includes('cost')) {
        fallbackAnswer = 'Our supplements range from R349-R399, with bundle discounts available. Apple Cider Vinegar is R349 and Vitamin D3 4000 IU is R399. Check individual product pages for current bundle offers.';
      } else {
        fallbackAnswer = 'I\'d be happy to help with information about our science-backed supplements! We offer premium gummy vitamins and supplements with authentic ingredients. What specific product or ingredient would you like to know more about?';
      }
      
      res.json({ answer: fallbackAnswer });

    } catch (error) {
      console.error('Chat API error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Test email endpoint - sends samples of all email templates
  app.post("/api/test-emails", async (req, res) => {
    try {
      console.log('🧪 Testing all email templates...');
      const results: string[] = [];
      
      // Ensure we return JSON response
      res.setHeader('Content-Type', 'application/json');
      
      // Test Newsletter Confirmation
      try {
        const testNewsletter = {
          id: 'test-newsletter-123',
          email: 'dn@thefourths.com',
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
          customerEmail: 'dn@thefourths.com',
          customerName: 'Test Customer',
          customerPhone: '+27123456789',
          totalAmount: '599.00',
          createdAt: new Date().toISOString(),
          shippingAddress: '123 Test Street\nCape Town, 8001\nSouth Africa',
          billingAddress: '123 Test Street\nCape Town, 8001\nSouth Africa',
          orderItems: JSON.stringify([{
            product: { id: 'test-1', name: 'Test Vitamin D3', price: '399.00', imageUrl: 'https://via.placeholder.com/150' },
            quantity: 1
          }]),
          currency: 'ZAR',
          paymentStatus: 'completed',
          orderStatus: 'processing'
        };
        const testOrderItems = [{
          product: { id: 'test-1', name: 'Test Vitamin D3', price: '399.00', imageUrl: 'https://via.placeholder.com/150' },
          quantity: 1
        }];
        await EmailService.sendOrderConfirmation({ order: testOrder, orderItems: testOrderItems });
        results.push('✅ Order confirmation and admin notification emails sent');
      } catch (error) {
        results.push('❌ Order emails failed: ' + (error as Error).message);
      }

      // Test Low Stock Alert
      try {
        await EmailService.sendLowStockAlert({ productName: 'Test Vitamin D3', currentStock: 2, threshold: 5 });
        results.push('✅ Low stock alert email sent');
      } catch (error) {
        results.push('❌ Low stock alert failed: ' + error.message);
      }

      // Test Pre-Order Notification
      try {
        const testPreOrder = {
          id: 'test-preorder-123',
          customerEmail: 'dn@thefourths.com',
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
        results.push('❌ Pre-order notification failed: ' + error.message);
      }

      // Test Restock Notification
      try {
        await EmailService.sendRestockNotification({
          firstName: 'Test',
          email: 'dn@thefourths.com',
          product: 'Test Collagen Complex',
          restockDate: 'February 15th'
        });
        results.push('✅ Restock notification emails sent');
      } catch (error) {
        results.push('❌ Restock notification failed: ' + error.message);
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
        error: error?.message || 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
