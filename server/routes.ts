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

  // Pre-order submission
  app.post("/api/pre-orders", async (req, res) => {
    try {
      const preOrderData = insertPreOrderSchema.parse(req.body);
      const preOrder = await storage.createPreOrder(preOrderData);
      
      // Send notification emails using Resend
      await EmailService.sendPreOrderNotification(preOrder);
      
      res.json(preOrder);
    } catch (error) {
      console.error('Pre-order submission error:', error);
      res.status(400).json({ message: "Failed to submit pre-order" });
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
      try {
        await EmailService.sendPreOrderNotification(
          validatedData.productName,
          validatedData.email,
          validatedData.productId
        );
      } catch (emailError) {
        console.error('Failed to send pre-order email notification:', emailError);
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

  const httpServer = createServer(app);
  return httpServer;
}
