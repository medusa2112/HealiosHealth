import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password"), // Optional for OAuth users
  role: text("role").notNull().default("guest"), // 'admin', 'customer', 'guest'
  firstName: text("first_name"),
  lastName: text("last_name"),
  stripeCustomerId: text("stripe_customer_id"), // Phase 18: Stripe customer tracking
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
  tags: text("tags").array().default([]), // For children's exclusion and other categorization
});

// Phase 14: Product variants table for SKUs, sizes, flavours, bundles
export const productVariants = pgTable("product_variants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  name: varchar("name", { length: 128 }).notNull(), // e.g. "60 Caps", "Vanilla", "Berry"
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  sku: varchar("sku", { length: 64 }).notNull().unique(),
  imageUrl: text("image_url"), // Optional variant-specific image override
  stockQuantity: integer("stock_quantity").default(0),
  inStock: boolean("in_stock").default(true),
  isDefault: boolean("is_default").default(false), // Mark one variant as default
  // Phase 18: Subscription support
  subscriptionPriceId: varchar("subscription_price_id", { length: 128 }), // Stripe Price ID for subscriptions
  subscriptionIntervalDays: integer("subscription_interval_days").default(30), // Default 30-day refill
  subscriptionEnabled: boolean("subscription_enabled").default(false),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Phase 18: Subscriptions table for auto-refill functionality
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  productVariantId: varchar("product_variant_id").notNull().references(() => productVariants.id),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 128 }).notNull(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 128 }).notNull(),
  status: varchar("status", { length: 32 }).default("active"), // active, canceled, paused, past_due
  intervalDays: integer("interval_days").notNull(), // e.g. 30 for monthly
  currentPeriodStart: text("current_period_start"),
  currentPeriodEnd: text("current_period_end"),
  cancelAt: text("cancel_at"), // When it will be canceled
  canceledAt: text("canceled_at"), // When it was actually canceled
  startDate: text("start_date").default(sql`CURRENT_TIMESTAMP`),
  metadata: text("metadata"), // JSON for additional tracking data
});

// Phase 19: Email events tracking for automated flows (abandoned cart, reorder reminders)
export const emailEvents = pgTable("email_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  emailType: varchar("email_type", { length: 64 }).notNull(), // "abandoned_cart", "reorder", "abandoned_cart_24h"
  relatedId: varchar("related_id").notNull(), // cart_id or order_id
  sentAt: text("sent_at").default(sql`CURRENT_TIMESTAMP`),
  emailAddress: text("email_address").notNull(), // For tracking purposes
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
  userId: varchar("user_id").references(() => users.id), // Proper foreign key reference
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
  refundStatus: text("refund_status").default("none"), // none, partial, full, refunded
  disputeStatus: text("dispute_status").default("none"), // none, disputed, resolved
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeSessionId: text("stripe_session_id"), // For webhook correlation
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

// Addresses table for customer saved addresses
export const addresses = pgTable("addresses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 10 }).notNull(), // 'shipping' | 'billing'
  line1: text("line1").notNull(),
  line2: text("line2"),
  city: varchar("city", { length: 100 }),
  zip: varchar("zip", { length: 20 }),
  country: varchar("country", { length: 100 }),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Order items table for proper order-product relationships
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  productVariantId: varchar("product_variant_id").references(() => productVariants.id), // Phase 14: Variant support
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  productName: text("product_name").notNull(), // Snapshot at time of order
  variantName: text("variant_name"), // Phase 14: Variant name snapshot
  variantSku: text("variant_sku"), // Phase 14: SKU snapshot
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Abandoned cart tracking table
export const carts = pgTable("carts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // nullable for guest users
  sessionToken: varchar("session_token", { length: 128 }).notNull(),
  items: text("items").notNull(), // JSON string of cart items
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  currency: text("currency").default("ZAR"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  lastUpdated: text("last_updated").default(sql`CURRENT_TIMESTAMP`),
  convertedToOrder: boolean("converted_to_order").default(false),
  stripeSessionId: text("stripe_session_id"), // For linking to successful checkouts
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

// Phase 14: Product variant schema
export const insertProductVariantSchema = createInsertSchema(productVariants).omit({
  id: true,
  createdAt: true,
});

export const insertAddressSchema = createInsertSchema(addresses).omit({
  id: true,
  createdAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true,
});

export const insertCartSchema = createInsertSchema(carts).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

// Admin activity logging table for audit trail
export const adminLogs = pgTable("admin_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").notNull().references(() => users.id),
  actionType: varchar("action_type", { length: 64 }).notNull(), // e.g. "refund", "edit_product"
  targetType: varchar("target_type", { length: 64 }).notNull(), // e.g. "order", "product"
  targetId: varchar("target_id").notNull(),
  details: text("details"), // JSON string of metadata
  timestamp: text("timestamp").default(sql`CURRENT_TIMESTAMP`),
});

// Type exports
export type Address = typeof addresses.$inferSelect;
export type InsertAddress = z.infer<typeof insertAddressSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type Cart = typeof carts.$inferSelect;
export type InsertCart = z.infer<typeof insertCartSchema>;
export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertAdminLog = z.infer<typeof insertAdminLogSchema>;

export const insertAdminLogSchema = createInsertSchema(adminLogs).omit({
  id: true,
  timestamp: true,
});

// Reorder tracking logs for funnel analytics (Phase 13)
export const reorderLogs = pgTable("reorder_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  originalOrderId: varchar("original_order_id").notNull().references(() => orders.id),
  status: varchar("status", { length: 32 }).notNull(), // started | success | failed
  timestamp: text("timestamp").default(sql`CURRENT_TIMESTAMP`),
  metadata: text("metadata"), // JSON string for total amount, error details
});

export type ReorderLog = typeof reorderLogs.$inferSelect;
export const insertReorderLogSchema = createInsertSchema(reorderLogs).omit({
  id: true,
  timestamp: true,
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

// Phase 15: Discount codes table for promotions and coupon management
export const discountCodes = pgTable("discount_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 64 }).notNull().unique(), // e.g. "WELCOME10"
  type: varchar("type", { length: 16 }).notNull(), // "percent" | "fixed"
  value: decimal("value", { precision: 10, scale: 2 }).notNull(), // 10 = 10% or $10
  usageLimit: integer("usage_limit"), // null = unlimited
  usageCount: integer("usage_count").default(0),
  expiresAt: text("expires_at"), // ISO date string
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  isActive: boolean("is_active").default(true),
});

export const insertDiscountCodeSchema = createInsertSchema(discountCodes).omit({
  id: true,
  createdAt: true,
  usageCount: true,
});

// Phase 16: Product bundles for bundling multiple variants together
export const productBundles = pgTable("product_bundles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 128 }).notNull(), // e.g. "Immunity Boost Bundle"
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }), // Total individual prices
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Junction table for bundle items
export const bundleItems = pgTable("bundle_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bundleId: varchar("bundle_id").notNull().references(() => productBundles.id, { onDelete: "cascade" }),
  variantId: varchar("variant_id").notNull().references(() => productVariants.id),
  quantity: integer("quantity").notNull().default(1),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertProductBundleSchema = createInsertSchema(productBundles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBundleItemSchema = createInsertSchema(bundleItems).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertProductVariant = z.infer<typeof insertProductVariantSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ProductVariant = typeof productVariants.$inferSelect;
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
export type InsertDiscountCode = z.infer<typeof insertDiscountCodeSchema>;
export type DiscountCode = typeof discountCodes.$inferSelect;
export type InsertProductBundle = z.infer<typeof insertProductBundleSchema>;
export type ProductBundle = typeof productBundles.$inferSelect;
export type InsertBundleItem = z.infer<typeof insertBundleItemSchema>;
export type BundleItem = typeof bundleItems.$inferSelect;

// Phase 18: Subscription types and schemas
export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  startDate: true,
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

// Phase 19: Email events schemas
export const insertEmailEventSchema = createInsertSchema(emailEvents).omit({
  id: true,
  sentAt: true,
});

export type EmailEvent = typeof emailEvents.$inferSelect;
export type InsertEmailEvent = z.infer<typeof insertEmailEventSchema>;

// Phase 20: Referral system for viral growth
export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").notNull().references(() => users.id),
  code: varchar("code", { length: 16 }).unique().notNull(), // e.g. HEALIOS-RK7Q9D
  rewardType: varchar("reward_type", { length: 32 }).default("discount"), // "discount" or "credit"
  rewardValue: integer("reward_value").default(10), // % for discount or amount for credit
  maxUses: integer("max_uses").default(50), // Fraud protection: limit total uses
  usedCount: integer("used_count").default(0), // Track current usage
  active: boolean("active").default(true), // Can be deactivated
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const referralClaims = pgTable("referral_claims", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referralId: varchar("referral_id").notNull().references(() => referrals.id),
  refereeId: varchar("referee_id").notNull().references(() => users.id),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  referrerRewardType: varchar("referrer_reward_type", { length: 32 }).default("credit"), // What referrer gets
  referrerRewardAmount: integer("referrer_reward_amount").default(1000), // In cents (R10.00)
  refereeDiscountAmount: integer("referee_discount_amount").default(1000), // In cents (R10.00)
  processed: boolean("processed").default(false), // Has referrer reward been given?
  claimedAt: text("claimed_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  usedCount: true,
  createdAt: true,
});

export const insertReferralClaimSchema = createInsertSchema(referralClaims).omit({
  id: true,
  claimedAt: true,
});

export type Referral = typeof referrals.$inferSelect;
export type ReferralClaim = typeof referralClaims.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type InsertReferralClaim = z.infer<typeof insertReferralClaimSchema>;
