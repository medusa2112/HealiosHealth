import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertNewsletterSchema, insertPreOrderSchema } from "@shared/schema";
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
      const { amount, currency = "gbp" } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to pence
        currency,
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Stripe payment intent error:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Pre-order submission
  app.post("/api/pre-orders", async (req, res) => {
    try {
      const validatedData = insertPreOrderSchema.parse(req.body);
      const preOrder = await storage.createPreOrder(validatedData);
      
      // Send email notification to dn@thefourths.com (when SendGrid is configured)
      if (process.env.SENDGRID_API_KEY) {
        try {
          const sgMail = require('@sendgrid/mail');
          sgMail.setApiKey(process.env.SENDGRID_API_KEY);
          
          const msg = {
            to: 'dn@thefourths.com',
            from: 'noreply@healios.com',
            subject: `New Pre-Order: ${validatedData.productName}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">New Pre-Order Received</h2>
                <p><strong>Product:</strong> ${validatedData.productName}</p>
                <p><strong>Customer Email:</strong> ${validatedData.email}</p>
                <p><strong>Product ID:</strong> ${validatedData.productId}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                <p style="margin-top: 20px; padding: 10px; background: #f5f5f5; border-radius: 4px;">
                  Customer will receive 10% discount when product becomes available.
                </p>
              </div>
            `,
          };
          
          await sgMail.send(msg);
        } catch (emailError) {
          console.error('Failed to send email notification:', emailError);
          // Don't fail the pre-order if email fails
        }
      }
      
      res.json(preOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create pre-order" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
