import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("guest"), // 'admin', 'customer', 'guest'
  firstName: text("first_name"),
  lastName: text("last_name"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(), 
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  imageUrl: text("image_url").notNull(),
  categories: text("categories").array().notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("5.0"),
  reviewCount: integer("review_count").default(0),
  inStock: boolean("in_stock").default(true),
  stockQuantity: integer("stock_quantity").default(0),
  featured: boolean("featured").default(false),
  sizes: text("sizes").array(),
  colors: text("colors").array(),
  gender: text("gender"), // 'men', 'women', 'unisex'
  type: text("type").default('supplement'), // 'supplement', 'apparel'
  bottleCount: integer("bottle_count"),
  dailyDosage: integer("daily_dosage"),
  supplyDays: integer("supply_days"),
});

export const quizResults = pgTable("quiz_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  consentToMarketing: boolean("consent_to_marketing").default(false),
  answers: text("answers").notNull(), // JSON stringified answers
  recommendations: text("recommendations").notNull(), // JSON stringified product recommendations
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const newsletterSubscriptions = pgTable("newsletter_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  birthday: text("birthday"), // Format: YYYY-MM-DD
  subscribedAt: text("subscribed_at").default(sql`CURRENT_TIMESTAMP`),
});

export const consultationBookings = pgTable("consultation_bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'trainer' or 'nutritionist'
  name: text("name").notNull(),
  email: text("email").notNull(),
  goals: text("goals"),
  status: text("status").default('pending'), // 'pending', 'confirmed', 'completed'
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const preOrders = pgTable("pre_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),
  productId: text("product_id").notNull(),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").default(1),
  notes: text("notes"),
  productPrice: text("product_price").notNull(),
  status: text("status").default("pending"), // pending, contacted, fulfilled, cancelled
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const articles = pgTable("articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  metaDescription: text("meta_description").notNull(),
  content: text("content").notNull(),
  research: text("research"),
  sources: text("sources").array().default([]),
  category: text("category").default("Health"),
  author: text("author").default("Healios Team"),
  readTime: text("read_time").default("5 min read"),
  published: boolean("published").default(true),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  shippingAddress: text("shipping_address").notNull(),
  billingAddress: text("billing_address"),
  orderItems: text("order_items").notNull(), // JSON string of cart items
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("ZAR"),
  paymentStatus: text("payment_status").default("pending"), // pending, completed, failed, refunded
  orderStatus: text("order_status").default("processing"), // processing, shipped, delivered, cancelled
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  trackingNumber: text("tracking_number"),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const stockAlerts = pgTable("stock_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: text("product_id").notNull(),
  productName: text("product_name").notNull(),
  currentStock: integer("current_stock").notNull(),
  threshold: integer("threshold").default(5),
  alertSent: boolean("alert_sent").default(false),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const restockNotifications = pgTable("restock_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  productId: text("product_id").notNull(),
  productName: text("product_name").notNull(),
  agreeToContact: boolean("agree_to_contact").default(false),
  notified: boolean("notified").default(false),
  requestedAt: text("requested_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export const insertNewsletterSchema = createInsertSchema(newsletterSubscriptions).omit({
  id: true,
  subscribedAt: true,
});

export const insertPreOrderSchema = createInsertSchema(preOrders).omit({
  id: true,
  createdAt: true,
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStockAlertSchema = createInsertSchema(stockAlerts).omit({
  id: true,
  createdAt: true,
});

export const insertRestockNotificationSchema = createInsertSchema(restockNotifications).omit({
  id: true,
  requestedAt: true,
});

export const insertQuizResultSchema = createInsertSchema(quizResults).omit({
  id: true,
  createdAt: true,
});

export const insertConsultationBookingSchema = createInsertSchema(consultationBookings).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type InsertNewsletter = z.infer<typeof insertNewsletterSchema>;
export type Newsletter = typeof newsletterSubscriptions.$inferSelect;
export type InsertPreOrder = z.infer<typeof insertPreOrderSchema>;
export type PreOrder = typeof preOrders.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertStockAlert = z.infer<typeof insertStockAlertSchema>;
export type StockAlert = typeof stockAlerts.$inferSelect;
export type InsertQuizResult = z.infer<typeof insertQuizResultSchema>;
export type QuizResult = typeof quizResults.$inferSelect;
export type InsertConsultationBooking = z.infer<typeof insertConsultationBookingSchema>;
export type ConsultationBooking = typeof consultationBookings.$inferSelect;
export type InsertRestockNotification = z.infer<typeof insertRestockNotificationSchema>;
export type RestockNotification = typeof restockNotifications.$inferSelect;
