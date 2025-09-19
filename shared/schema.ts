import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, boolean, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Import ALFR3D security issues schema
export * from './alfr3d-schema';

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"), // Hashed password for secure authentication
  role: text("role").notNull().default("guest"), // 'admin', 'customer', 'guest'
  firstName: text("first_name"),
  lastName: text("last_name"),
  paystackCustomerCode: text("paystack_customer_code"), // PayStack customer code
  paystackCustomerId: text("paystack_customer_id"), // PayStack customer ID
  emailVerified: text("email_verified"), // Timestamp when email was verified
  verificationCodeHash: text("verification_code_hash"), // Hashed verification code
  verificationExpiresAt: text("verification_expires_at"), // When code expires
  verificationAttempts: integer("verification_attempts").default(0), // Rate limiting
  isActive: boolean("is_active").default(true), // Account active status
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
  // Pre-order fields
  allowPreorder: boolean("allowPreorder").default(false),
  preorderCap: integer("preorderCap"),
  preorderCount: integer("preorderCount").default(0),
  // SEO and AEO fields
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords").array(),
  // Optimistic locking
  version: integer('version').default(0).notNull(),
  // Timestamps for tracking changes
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
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
  variantId: varchar("variant_id"), // Alternative field for variant reference
  paystackSubscriptionId: varchar("paystack_subscription_id", { length: 128 }).unique(), // PayStack subscription code
  paystackCustomerId: varchar("paystack_customer_id", { length: 128 }), // PayStack customer code
  paystackPlanId: varchar("paystack_plan_id", { length: 128 }), // PayStack plan code
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 128 }), // DEPRECATED - kept for migration
  stripeCustomerId: varchar("stripe_customer_id", { length: 128 }), // DEPRECATED - kept for migration
  status: varchar("status", { length: 32 }).default("active"), // active, canceled, paused, past_due
  quantity: integer("quantity").default(1),
  interval: varchar("interval", { length: 32 }), // daily, weekly, monthly, annually
  intervalDays: integer("interval_days").notNull(), // e.g. 30 for monthly
  pricePerUnit: decimal("price_per_unit", { precision: 10, scale: 2 }),
  currentPeriodStart: text("current_period_start"),
  currentPeriodEnd: text("current_period_end"),
  cancelAt: text("cancel_at"), // When it will be canceled
  canceledAt: text("canceled_at"), // When it was actually canceled
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  startDate: text("start_date").default(sql`CURRENT_TIMESTAMP`),
  metadata: text("metadata"), // JSON for additional tracking data
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
  paymentMethod: text("payment_method").default("paystack"), // paystack only
  paystackReference: text("paystack_reference"), // PayStack transaction reference
  paystackAccessCode: text("paystack_access_code"), // PayStack access code
  // DEPRECATED: stripePaymentIntentId removed for PayStack migration
  stripeSessionId: text("stripe_session_id"), // DEPRECATED - kept for migration
  trackingNumber: text("tracking_number"),
  discountCode: text("discount_code"), // Phase 15: Discount code tracking
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }),
  metadata: text("metadata"), // JSON metadata
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
  city: text("city"),
  state: varchar("state", { length: 100 }),
  zipCode: varchar("zip_code", { length: 20 }),
  country: varchar("country", { length: 100 }),
  isDefault: boolean("is_default").default(false),
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
  paystackReference: text("paystack_reference"), // PayStack reference for checkout
  stripeSessionId: text("stripe_session_id"), // DEPRECATED - kept for migration
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});


// Phase 14: Product variant schema
export const insertProductVariantSchema = createInsertSchema(productVariants).omit({
  id: true,
  createdAt: true,
});

// Enhanced address validation schema
export const insertAddressSchema = createInsertSchema(addresses).omit({
  id: true,
  createdAt: true,
}).extend({
  // Enhanced validation rules for address fields
  line1: z.string().min(5, "Street address must be at least 5 characters").max(200, "Street address too long"),
  city: z.string().min(2, "City is required").max(100, "City name too long").optional(),
  state: z.string().min(2, "State/Province is required").max(100, "State name too long").optional(),
  zipCode: z.string().min(3, "Postal/ZIP code is required").max(20, "Postal code too long").optional(),
  country: z.string().min(2, "Country is required").max(100, "Country name too long").optional(),
});

// Checkout address validation schema (more flexible for external checkouts)
export const checkoutAddressSchema = z.object({
  email: z.string().email("Please enter a valid email address").transform(v => v.trim().toLowerCase()),
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long").optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(20, "Phone number too long").optional(),
  line1: z.string().min(5, "Street address must be at least 5 characters").max(200, "Street address too long"),
  line2: z.string().max(200, "Address line 2 too long").optional(),
  city: z.string().min(2, "City is required").max(100, "City name too long"),
  state: z.string().min(2, "State/Province is required").max(100, "State name too long").optional(),
  zipCode: z.string().min(3, "Postal/ZIP code is required").max(20, "Postal code too long"),
  country: z.string().min(2, "Country is required").max(100, "Country name too long").default("South Africa"),
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


// Type exports
export type Address = typeof addresses.$inferSelect;
export type InsertAddress = z.infer<typeof insertAddressSchema>;
export type CheckoutAddress = z.infer<typeof checkoutAddressSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type Cart = typeof carts.$inferSelect;
export type InsertCart = z.infer<typeof insertCartSchema>;


export const insertNewsletterSchema = createInsertSchema(newsletterSubscriptions).omit({
  id: true,
  subscribedAt: true,
}).extend({
  // Honeypot field for bot protection
  website: z.string().optional().default(""), // This should be empty for humans
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
  description: text("description"), // User-friendly description of the discount
  minimumPurchase: decimal("minimum_purchase", { precision: 10, scale: 2 }), // Minimum purchase amount required
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

// Customer authentication schemas
export const customerRegisterSchema = z.object({
  email: z.string().email("Please enter a valid email address").transform(v => v.trim().toLowerCase()),
  firstName: z.string().min(1, "First name is required").max(100, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(100, "Last name too long"),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/(?=.*[a-z])/, "Password must contain at least one lowercase letter")
    .regex(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
    .regex(/(?=.*\d)/, "Password must contain at least one number"),
  // SECURITY: Role is excluded to prevent privilege escalation - server sets role='customer'
});

export const customerLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address").transform(v => v.trim().toLowerCase()),
  password: z.string().min(1, "Password is required"),
});

// PIN Verification schemas for 2-step authentication
export const verifyPinSchema = z.object({
  email: z.string().email("Please enter a valid email address").transform(v => v.trim().toLowerCase()),
  code: z.string().length(6, "Verification code must be 6 digits").regex(/^\d{6}$/, "Verification code must contain only numbers"),
});

export const customerProfileUpdateSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(100, "Last name too long"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertProductVariant = z.infer<typeof insertProductVariantSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Customer authentication types
export type CustomerRegister = z.infer<typeof customerRegisterSchema>;
export type CustomerLogin = z.infer<typeof customerLoginSchema>;
export type CustomerProfileUpdate = z.infer<typeof customerProfileUpdateSchema>;

// UpsertUser type for authentication - allows creating or updating with optional fields
export type UpsertUser = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  role?: string; // Allow role to be provided during upsert
};
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

// Phase 18: Subscription types and schemas
export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  startDate: true,
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;


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

// Phase 21: AI Customer Service Assistant - Support Tickets
export const supportTickets = pgTable("support_tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  email: text("email").notNull(), // For guest users
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: varchar("status", { length: 32 }).default("open"), // "open", "in_progress", "resolved", "closed"
  priority: varchar("priority", { length: 32 }).default("medium"), // "low", "medium", "high", "urgent"
  category: varchar("category", { length: 64 }).default("general"), // "order", "return", "product", "technical", "general"
  orderId: varchar("order_id").references(() => orders.id), // Optional: link to specific order
  assignedTo: varchar("assigned_to").references(() => users.id), // Admin user assigned
  transcript: text("transcript"), // JSON: chat history if escalated from AI
  aiHandled: boolean("ai_handled").default(false), // Track AI involvement
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Phase 21: AI Chat Sessions for tracking conversations
export const chatSessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  sessionToken: varchar("session_token", { length: 128 }), // For anonymous users
  messages: text("messages").notNull(), // JSON: array of message objects
  lastActivity: text("last_activity").default(sql`CURRENT_TIMESTAMP`),
  resolved: boolean("resolved").default(false),
  escalated: boolean("escalated").default(false), // Escalated to human support
  supportTicketId: varchar("support_ticket_id").references(() => supportTickets.id),
  metadata: text("metadata"), // JSON: additional context (user agent, referrer, etc.)
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true,
  lastActivity: true,
});

export type SupportTicket = typeof supportTickets.$inferSelect;
export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;

// Webhook events table for idempotency tracking
export const webhookEvents = pgTable("webhook_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id", { length: 128 }).notNull().unique(), // PayStack event ID
  eventType: varchar("event_type", { length: 64 }).notNull(), // e.g., "charge.success"
  processedAt: text("processed_at").default(sql`CURRENT_TIMESTAMP`),
  payload: text("payload").notNull(), // JSON payload for debugging
  processingStatus: varchar("processing_status", { length: 32 }).default("processed"), // "processed", "failed", "skipped"
  errorMessage: text("error_message"), // If processing failed
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertWebhookEventSchema = createInsertSchema(webhookEvents).omit({
  id: true,
  processedAt: true,
  createdAt: true,
});

export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type InsertWebhookEvent = z.infer<typeof insertWebhookEventSchema>;

// PayStack webhook payload schemas
export const paystackCustomerSchema = z.object({
  id: z.number(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  email: z.string().email(),
  customer_code: z.string(),
  phone: z.string().nullable(),
  metadata: z.record(z.any()).optional(),
  risk_action: z.string().optional(),
  international_format_phone: z.string().nullable().optional(),
});

export const paystackTransactionSchema = z.object({
  id: z.number(),
  domain: z.string(),
  status: z.string(),
  reference: z.string(),
  amount: z.number(),
  message: z.string().nullable(),
  gateway_response: z.string(),
  paid_at: z.string(),
  created_at: z.string(),
  channel: z.string(),
  currency: z.string(),
  ip_address: z.string().nullable(),
  metadata: z.record(z.any()).optional(),
  fees_breakdown: z.any().optional(),
  log: z.any().optional(),
  fees: z.number().optional(),
  fees_split: z.any().optional(),
  authorization: z.any().optional(),
  customer: paystackCustomerSchema,
  plan: z.any().optional(),
  split: z.any().optional(),
  order_id: z.any().optional(),
  paidAt: z.string().optional(),
  createdAt: z.string().optional(),
  requested_amount: z.number().optional(),
  pos_transaction_data: z.any().optional(),
  source: z.any().optional(),
  fees_breakdown_v2: z.any().optional(),
});

export const paystackSubscriptionSchema = z.object({
  id: z.number(),
  domain: z.string(),
  status: z.string(),
  subscription_code: z.string(),
  email_token: z.string(),
  amount: z.number(),
  cron_expression: z.string(),
  next_payment_date: z.string(),
  open_invoice: z.string().nullable(),
  integration: z.number(),
  plan: z.object({
    id: z.number(),
    name: z.string(),
    plan_code: z.string(),
    description: z.string().nullable(),
    amount: z.number(),
    interval: z.string(),
    send_invoices: z.boolean(),
    send_sms: z.boolean(),
    currency: z.string(),
    metadata: z.record(z.any()).optional(),
  }),
  authorization: z.any(),
  customer: paystackCustomerSchema,
  created_at: z.string(),
  quantity: z.number().optional(),
  metadata: z.record(z.any()).optional(),
});

export const paystackRefundSchema = z.object({
  transaction: z.number(),
  dispute: z.number().optional(),
  settlement: z.number().optional(),
  domain: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.string(),
  refunded_by: z.string().optional(),
  refunded_at: z.string(),
  customer_note: z.string().nullable(),
  merchant_note: z.string().nullable(),
  created_at: z.string(),
  integration: z.number(),
  transaction_reference: z.string(),
  fully_deducted: z.boolean().optional(),
});

// Webhook event schemas for different PayStack events
export const chargeSuccessWebhookSchema = z.object({
  event: z.literal("charge.success"),
  data: paystackTransactionSchema,
});

export const refundProcessedWebhookSchema = z.object({
  event: z.literal("refund.processed"),
  data: paystackRefundSchema,
});

export const subscriptionCreateWebhookSchema = z.object({
  event: z.literal("subscription.create"),
  data: paystackSubscriptionSchema,
});

export const subscriptionDisableWebhookSchema = z.object({
  event: z.literal("subscription.disable"),
  data: paystackSubscriptionSchema,
});

export const invoicePaymentFailedWebhookSchema = z.object({
  event: z.literal("invoice.payment_failed"),
  data: z.object({
    domain: z.string(),
    invoice_code: z.string(),
    amount: z.number(),
    period_start: z.string(),
    period_end: z.string(),
    status: z.string(),
    paid: z.boolean(),
    paid_at: z.string().nullable(),
    description: z.string().nullable(),
    authorization: z.any(),
    subscription: paystackSubscriptionSchema,
    customer: paystackCustomerSchema,
    transaction: paystackTransactionSchema.optional(),
    created_at: z.string(),
    subscription_code: z.string(),
  }),
});

// Union schema for all supported webhook events
export const paystackWebhookSchema = z.union([
  chargeSuccessWebhookSchema,
  refundProcessedWebhookSchema,
  subscriptionCreateWebhookSchema,
  subscriptionDisableWebhookSchema,
  invoicePaymentFailedWebhookSchema,
]);

// Generic webhook event schema for unknown events
export const genericWebhookSchema = z.object({
  event: z.string(),
  data: z.record(z.any()),
});
