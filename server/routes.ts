import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertNewsletterSchema, insertPreOrderSchema, insertArticleSchema, insertOrderSchema, type Article } from "@shared/schema";
import { ArticleBot } from "./article-bot";
import { EmailService } from "./email";
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
      res.json({ message: "Successfully subscribed to newsletter", subscription });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      res.status(500).json({ message: "Failed to subscribe to newsletter" });
    }
  });



  // Stripe payment route for one-time payments
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, currency = "zar", orderData } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata: {
          orderData: JSON.stringify(orderData || {}),
        },
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Stripe payment intent error:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
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

      // Send confirmation emails
      try {
        await EmailService.sendOrderConfirmation({ order, orderItems });
        await EmailService.sendAdminOrderNotification({ order, orderItems });
      } catch (emailError) {
        console.error('Failed to send order emails:', emailError);
        // Don't fail the order if email fails
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

  // Article generation routes
  let articleBot: ArticleBot | null = null;

  // Initialize article bot with API keys
  const initializeArticleBot = () => {
    const perplexityKey = process.env.PERPLEXITY_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (!perplexityKey || !openaiKey) {
      return null;
    }
    
    return new ArticleBot(perplexityKey, openaiKey);
  };

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

  // Bot endpoint - Create single article
  app.post("/api/bot/create-article", async (req, res) => {
    try {
      const { topic, apiKey } = req.body;
      
      // Simple API key protection
      if (apiKey !== process.env.ARTICLE_BOT_API_KEY && process.env.ARTICLE_BOT_API_KEY) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      if (!topic) {
        return res.status(400).json({ message: "Topic is required" });
      }
      
      articleBot = articleBot || initializeArticleBot();
      if (!articleBot) {
        return res.status(500).json({ 
          message: "Article bot not configured. Missing PERPLEXITY_API_KEY or OPENAI_API_KEY" 
        });
      }
      
      console.log(`Creating article for topic: ${topic}`);
      const articleData = await articleBot.createArticle(topic);
      
      // Save to database
      const article = await storage.createArticle({
        title: articleData.title,
        slug: articleData.slug,
        metaDescription: articleData.meta_description,
        content: articleData.content,
        research: articleData.research,
        sources: articleData.sources,
        category: "Health",
        author: "Healios Team",
        readTime: "5 min read",
        published: true
      });
      
      res.json({
        success: true,
        article: {
          id: article.id,
          title: article.title,
          slug: article.slug,
          created: article.createdAt
        }
      });
      
    } catch (error: any) {
      console.error("Article creation failed:", error);
      res.status(500).json({ 
        message: "Failed to create article", 
        error: error.message 
      });
    }
  });

  // Bot endpoint - Create multiple articles
  app.post("/api/bot/create-articles/:count", async (req, res) => {
    try {
      const { apiKey } = req.body;
      const count = parseInt(req.params.count);
      
      // Simple API key protection
      if (apiKey !== process.env.ARTICLE_BOT_API_KEY && process.env.ARTICLE_BOT_API_KEY) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      if (isNaN(count) || count < 1 || count > 5) {
        return res.status(400).json({ message: "Count must be between 1 and 5" });
      }
      
      articleBot = articleBot || initializeArticleBot();
      if (!articleBot) {
        return res.status(500).json({ 
          message: "Article bot not configured. Missing PERPLEXITY_API_KEY or OPENAI_API_KEY" 
        });
      }
      
      console.log(`Creating ${count} articles...`);
      const articlesData = await articleBot.createMultipleArticles(count);
      
      // Save all articles to database
      const savedArticles = [];
      for (const articleData of articlesData) {
        const article = await storage.createArticle({
          title: articleData.title,
          slug: articleData.slug,
          metaDescription: articleData.meta_description,
          content: articleData.content,
          research: articleData.research,
          sources: articleData.sources,
          category: "Health",
          author: "Healios Team",
          readTime: "5 min read",
          published: true
        });
        
        savedArticles.push({
          id: article.id,
          title: article.title,
          slug: article.slug,
          created: article.createdAt
        });
      }
      
      res.json({
        success: true,
        created: savedArticles.length,
        articles: savedArticles
      });
      
    } catch (error: any) {
      console.error("Bulk article creation failed:", error);
      res.status(500).json({ 
        message: "Failed to create articles", 
        error: error.message 
      });
    }
  });

  // Bot status endpoint
  app.get("/api/bot/status", async (req, res) => {
    try {
      const latestArticles = await storage.getLatestArticles(10);
      
      res.json({
        configured: !!(process.env.PERPLEXITY_API_KEY && process.env.OPENAI_API_KEY),
        totalArticles: latestArticles.length,
        availableTopics: ArticleBot.getAvailableTopics(),
        latestArticles: latestArticles.map(article => ({
          id: article.id,
          title: article.title,
          slug: article.slug,
          length: article.content.length,
          created: article.createdAt
        }))
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get bot status" });
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

  const httpServer = createServer(app);
  return httpServer;
}
