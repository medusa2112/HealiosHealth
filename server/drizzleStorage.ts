import { db } from "./db";
import { 
  users, products, productVariants, newsletterSubscriptions, preOrders, orders, orderItems,
  stockAlerts, articles, quizResults, consultationBookings, restockNotifications,
  addresses, carts, adminLogs, reorderLogs, discountCodes, productBundles,
  bundleItems, subscriptions, securityIssues
} from "@shared/schema";
import { eq, desc, and, or, gte, lte, sql, like, inArray, isNull } from "drizzle-orm";
import type { IStorage } from "./storage";
import type {
  User, InsertUser, UpsertUser, Product, InsertProduct, ProductVariant,
  InsertProductVariant, Newsletter, InsertNewsletter, PreOrder, InsertPreOrder,
  Order, InsertOrder, StockAlert, InsertStockAlert, Article, InsertArticle,
  QuizResult, InsertQuizResult, ConsultationBooking, InsertConsultationBooking,
  RestockNotification, InsertRestockNotification, Address, InsertAddress,
  OrderItem, InsertOrderItem, Cart, InsertCart, AdminLog, InsertAdminLog,
  ReorderLog, DiscountCode, InsertDiscountCode, ProductBundle, InsertProductBundle,
  BundleItem, InsertBundleItem, Subscription, InsertSubscription, SecurityIssue,
  InsertSecurityIssue
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

export class DrizzleStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserById(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = `user-${randomUUID()}`;
    const hashedPassword = user.password ? await bcrypt.hash(user.password, 10) : null;
    
    const [created] = await db.insert(users).values({
      email: user.email,
      role: user.role || 'customer',
      firstName: user.firstName,
      lastName: user.lastName,
      password: hashedPassword,
      stripeCustomerId: user.stripeCustomerId,
      emailVerified: user.emailVerified || null,
      verificationCodeHash: user.verificationCodeHash,
      verificationExpiresAt: user.verificationExpiresAt,
      verificationAttempts: user.verificationAttempts || 0,
      isActive: user.isActive ?? true
    }).returning();
    
    return created;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    
    const [updated] = await db.update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    
    return updated;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    const existing = await this.getUserById(user.id);
    if (existing) {
      return (await this.updateUser(user.id, user))!;
    }
    return this.createUser(user);
  }

  async updateUserRole(userId: string, role: 'admin' | 'customer'): Promise<void> {
    await db.update(users)
      .set({ role, updatedAt: new Date().toISOString() })
      .where(eq(users.id, userId));
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.featured), products.name);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.featured, true));
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return await db.select().from(products).where(sql`${category} = ANY(${products.categories})`);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }

  async updateProductStock(productId: string, quantity: number): Promise<Product | undefined> {
    const [updated] = await db.update(products)
      .set({ stockQuantity: quantity })
      .where(eq(products.id, productId))
      .returning();
    return updated;
  }

  async decreaseProductStock(productId: string, quantity: number): Promise<Product | undefined> {
    const product = await this.getProductById(productId);
    if (!product) return undefined;
    
    const newStock = Math.max(0, (product.stockQuantity || 0) - quantity);
    return this.updateProductStock(productId, newStock);
  }

  // Product Variants
  async getProductVariants(productId: string): Promise<ProductVariant[]> {
    return await db.select().from(productVariants).where(eq(productVariants.productId, productId));
  }

  async getProductVariant(id: string): Promise<ProductVariant | undefined> {
    const result = await db.select().from(productVariants).where(eq(productVariants.id, id)).limit(1);
    return result[0];
  }

  async createProductVariant(variant: InsertProductVariant): Promise<ProductVariant> {
    const [created] = await db.insert(productVariants).values(variant).returning();
    return created;
  }

  async updateProductVariant(id: string, variant: Partial<ProductVariant>): Promise<ProductVariant | undefined> {
    const [updated] = await db.update(productVariants)
      .set(variant)
      .where(eq(productVariants.id, id))
      .returning();
    return updated;
  }

  async deleteProductVariant(id: string): Promise<boolean> {
    const result = await db.delete(productVariants).where(eq(productVariants.id, id));
    return true;
  }

  async getProductWithVariants(id: string): Promise<(Product & { variants: ProductVariant[] }) | undefined> {
    const product = await this.getProductById(id);
    if (!product) return undefined;
    
    const variants = await this.getProductVariants(id);
    return { ...product, variants };
  }

  // Newsletter
  async subscribeToNewsletter(email: InsertNewsletter): Promise<Newsletter> {
    const [created] = await db.insert(newsletterSubscriptions).values(email).returning();
    return created;
  }

  async getNewsletterSubscription(email: string): Promise<Newsletter | undefined> {
    const result = await db.select().from(newsletterSubscriptions).where(eq(newsletterSubscriptions.email, email)).limit(1);
    return result[0];
  }

  // Pre-orders
  async createPreOrder(preOrder: InsertPreOrder): Promise<PreOrder> {
    const [created] = await db.insert(preOrders).values(preOrder).returning();
    return created;
  }

  async getPreOrders(): Promise<PreOrder[]> {
    return await db.select().from(preOrders);
  }

  async getPreOrdersByProduct(productId: string): Promise<PreOrder[]> {
    return await db.select().from(preOrders).where(eq(preOrders.productId, productId));
  }

  // Orders
  async createOrder(order: InsertOrder): Promise<Order> {
    const [created] = await db.insert(orders).values(order).returning();
    return created;
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return result[0];
  }

  async getOrdersByEmail(email: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.customerEmail, email));
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId));
  }

  async getOrderByIdAndUserId(orderId: string, userId: string): Promise<Order | undefined> {
    const result = await db.select().from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
      .limit(1);
    return result[0];
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order | undefined> {
    const [updated] = await db.update(orders)
      .set({ orderStatus: status })
      .where(eq(orders.id, orderId))
      .returning();
    return updated;
  }

  async updatePaymentStatus(orderId: string, status: string): Promise<Order | undefined> {
    const [updated] = await db.update(orders)
      .set({ paymentStatus: status })
      .where(eq(orders.id, orderId))
      .returning();
    return updated;
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrderByStripePaymentIntent(paymentIntentId: string): Promise<Order | undefined> {
    const result = await db.select().from(orders)
      .where(eq(orders.stripePaymentIntentId, paymentIntentId))
      .limit(1);
    return result[0];
  }

  async updateOrderRefundStatus(orderId: string, status: string): Promise<Order | undefined> {
    const [updated] = await db.update(orders)
      .set({ refundStatus: status })
      .where(eq(orders.id, orderId))
      .returning();
    return updated;
  }

  // Stock Alerts
  async createStockAlert(alert: InsertStockAlert): Promise<StockAlert> {
    const [created] = await db.insert(stockAlerts).values(alert).returning();
    return created;
  }

  async getStockAlerts(): Promise<StockAlert[]> {
    return await db.select().from(stockAlerts);
  }

  async markAlertSent(alertId: string): Promise<void> {
    await db.update(stockAlerts)
      .set({ alertSent: true })
      .where(eq(stockAlerts.id, alertId));
  }

  // Articles
  async getArticles(): Promise<Article[]> {
    return await db.select().from(articles).orderBy(desc(articles.createdAt));
  }

  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    const result = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
    return result[0];
  }

  async getArticlesByCategory(category: string): Promise<Article[]> {
    return await db.select().from(articles).where(eq(articles.category, category));
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const [created] = await db.insert(articles).values(article).returning();
    return created;
  }

  async getLatestArticles(limit: number): Promise<Article[]> {
    return await db.select().from(articles)
      .orderBy(desc(articles.createdAt))
      .limit(limit);
  }

  // Quiz Results
  async createQuizResult(quizResult: InsertQuizResult): Promise<QuizResult> {
    const [created] = await db.insert(quizResults).values(quizResult).returning();
    return created;
  }

  async getQuizResults(): Promise<QuizResult[]> {
    return await db.select().from(quizResults);
  }

  // Consultation Bookings
  async createConsultationBooking(booking: InsertConsultationBooking): Promise<ConsultationBooking> {
    const [created] = await db.insert(consultationBookings).values(booking).returning();
    return created;
  }

  async getConsultationBookings(): Promise<ConsultationBooking[]> {
    return await db.select().from(consultationBookings);
  }

  // Restock Notifications
  async createRestockNotification(notification: InsertRestockNotification): Promise<RestockNotification> {
    const [created] = await db.insert(restockNotifications).values(notification).returning();
    return created;
  }

  async getRestockNotifications(): Promise<RestockNotification[]> {
    return await db.select().from(restockNotifications);
  }

  async getRestockNotificationsByProduct(productId: string): Promise<RestockNotification[]> {
    return await db.select().from(restockNotifications)
      .where(eq(restockNotifications.productId, productId));
  }

  // Addresses
  async getAddressesByUserId(userId: string): Promise<Address[]> {
    return await db.select().from(addresses).where(eq(addresses.userId, userId));
  }

  async createAddress(address: InsertAddress): Promise<Address> {
    const [created] = await db.insert(addresses).values(address).returning();
    return created;
  }

  async updateAddress(addressId: string, address: Partial<InsertAddress>): Promise<Address | undefined> {
    const [updated] = await db.update(addresses)
      .set(address)
      .where(eq(addresses.id, addressId))
      .returning();
    return updated;
  }

  async deleteAddress(addressId: string): Promise<void> {
    await db.delete(addresses).where(eq(addresses.id, addressId));
  }

  // Order Items
  async getOrderItemsByOrderId(orderId: string): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [created] = await db.insert(orderItems).values(orderItem).returning();
    return created;
  }

  // Cart methods
  async upsertCart(cart: Partial<InsertCart> & { sessionToken: string }): Promise<Cart> {
    const existing = await this.getCartBySessionToken(cart.sessionToken);
    
    if (existing) {
      const [updated] = await db.update(carts)
        .set({ ...cart, lastUpdated: new Date().toISOString() })
        .where(eq(carts.id, existing.id))
        .returning();
      return updated;
    }
    
    const [created] = await db.insert(carts).values({
      sessionToken: cart.sessionToken,
      items: cart.items || '[]',
      userId: cart.userId,
      totalAmount: cart.totalAmount,
      currency: cart.currency,
      stripeSessionId: cart.stripeSessionId,
      convertedToOrder: cart.convertedToOrder ?? false,
      lastUpdated: new Date().toISOString()
    }).returning();
    
    return created;
  }

  async getCartById(id: string): Promise<Cart | undefined> {
    const result = await db.select().from(carts).where(eq(carts.id, id)).limit(1);
    return result[0];
  }

  async getCartBySessionToken(sessionToken: string): Promise<Cart | undefined> {
    const result = await db.select().from(carts)
      .where(eq(carts.sessionToken, sessionToken))
      .limit(1);
    return result[0];
  }

  async markCartAsConverted(cartId: string, stripeSessionId?: string): Promise<Cart | undefined> {
    const [updated] = await db.update(carts)
      .set({ 
        convertedToOrder: true,
        stripeSessionId
      })
      .where(eq(carts.id, cartId))
      .returning();
    return updated;
  }

  async getAbandonedCarts(hoursThreshold: number): Promise<Cart[]> {
    const threshold = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000).toISOString();
    
    return await db.select().from(carts)
      .where(and(
        eq(carts.convertedToOrder, false),
        lte(carts.lastUpdated, threshold)
      ));
  }

  async getAllCarts(): Promise<Cart[]> {
    return await db.select().from(carts);
  }

  async linkGuestOrdersToUser(email: string, userId: string): Promise<void> {
    await db.update(orders)
      .set({ userId })
      .where(and(eq(orders.customerEmail, email), isNull(orders.userId)));
  }

  // Admin Activity Logging
  async createAdminLog(log: InsertAdminLog): Promise<AdminLog> {
    const [created] = await db.insert(adminLogs).values({
      ...log,
      id: `log-${randomUUID()}`,
      timestamp: new Date().toISOString()
    }).returning();
    return created;
  }

  async getAdminLogs(limit?: number): Promise<AdminLog[]> {
    const query = db.select().from(adminLogs).orderBy(desc(adminLogs.timestamp));
    if (limit) {
      return await query.limit(limit);
    }
    return await query;
  }

  async getAdminLogsByAdmin(adminId: string): Promise<AdminLog[]> {
    return await db.select().from(adminLogs)
      .where(eq(adminLogs.adminId, adminId))
      .orderBy(desc(adminLogs.timestamp));
  }

  async getAdminLogsByTarget(targetType: string, targetId: string): Promise<AdminLog[]> {
    return await db.select().from(adminLogs)
      .where(and(
        eq(adminLogs.targetType, targetType),
        eq(adminLogs.targetId, targetId)
      ))
      .orderBy(desc(adminLogs.timestamp));
  }

  async getAdminLogsWithPagination(filters: {
    limit: number;
    offset: number;
    search?: string | null;
    actionFilter?: string | null;
    targetFilter?: string | null;
    hours?: number | null;
    adminId?: string | null;
    targetType?: string | null;
    targetId?: string | null;
  }): Promise<{ logs: AdminLog[], total: number }> {
    let conditions = [];
    
    if (filters.search) {
      conditions.push(or(
        like(adminLogs.actionType, `%${filters.search}%`),
        like(adminLogs.targetId, `%${filters.search}%`),
        like(adminLogs.details, `%${filters.search}%`)
      ));
    }
    
    if (filters.actionFilter) {
      conditions.push(eq(adminLogs.actionType, filters.actionFilter));
    }
    
    if (filters.targetFilter) {
      conditions.push(eq(adminLogs.targetType, filters.targetFilter));
    }
    
    if (filters.hours) {
      const cutoff = new Date(Date.now() - filters.hours * 60 * 60 * 1000).toISOString();
      conditions.push(gte(adminLogs.timestamp, cutoff));
    }
    
    if (filters.adminId) {
      conditions.push(eq(adminLogs.adminId, filters.adminId));
    }
    
    if (filters.targetType) {
      conditions.push(eq(adminLogs.targetType, filters.targetType));
    }
    
    if (filters.targetId) {
      conditions.push(eq(adminLogs.targetId, filters.targetId));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const [logs, totalResult] = await Promise.all([
      db.select().from(adminLogs)
        .where(whereClause)
        .orderBy(desc(adminLogs.timestamp))
        .limit(filters.limit)
        .offset(filters.offset),
      db.select({ count: sql<number>`count(*)` }).from(adminLogs).where(whereClause)
    ]);
    
    return {
      logs,
      total: Number(totalResult[0]?.count ?? 0)
    };
  }

  // Reorder logs
  async createReorderLog(log: any): Promise<ReorderLog> {
    const [created] = await db.insert(reorderLogs).values({
      ...log,
      timestamp: new Date().toISOString()
    }).returning();
    return created;
  }

  async getReorderLogs(options?: { limit?: number; userId?: string; status?: string }): Promise<ReorderLog[]> {
    const conditions = [];
    
    if (options?.userId) {
      conditions.push(eq(reorderLogs.userId, options.userId));
    }
    
    if (options?.status) {
      conditions.push(eq(reorderLogs.status, options.status));
    }
    
    let query = conditions.length > 0 
      ? db.select().from(reorderLogs).where(and(...conditions))
      : db.select().from(reorderLogs);
    
    query = query.orderBy(desc(reorderLogs.timestamp));
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    return await query;
  }

  async getReorderLogsByOrderId(originalOrderId: string): Promise<ReorderLog[]> {
    return await db.select().from(reorderLogs)
      .where(eq(reorderLogs.originalOrderId, originalOrderId))
      .orderBy(desc(reorderLogs.timestamp));
  }

  // Discount codes
  async getDiscountCodes(): Promise<DiscountCode[]> {
    return await db.select().from(discountCodes);
  }

  async getDiscountCodeByCode(code: string): Promise<DiscountCode | undefined> {
    const result = await db.select().from(discountCodes)
      .where(eq(discountCodes.code, code))
      .limit(1);
    return result[0];
  }

  async createDiscountCode(discount: InsertDiscountCode): Promise<DiscountCode> {
    const [created] = await db.insert(discountCodes).values({
      ...discount,
      id: `discount-${randomUUID()}`,
      createdAt: new Date().toISOString()
    }).returning();
    return created;
  }

  async updateDiscountCode(id: string, updates: Partial<InsertDiscountCode>): Promise<DiscountCode | undefined> {
    const [updated] = await db.update(discountCodes)
      .set(updates)
      .where(eq(discountCodes.id, id))
      .returning();
    return updated;
  }

  async deleteDiscountCode(id: string): Promise<boolean> {
    const result = await db.delete(discountCodes).where(eq(discountCodes.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async validateDiscountCode(code: string): Promise<{ valid: boolean; discount?: DiscountCode; error?: string }> {
    try {
      const discount = await this.getDiscountCodeByCode(code);
      
      if (!discount) {
        return { valid: false, error: "Discount code not found" };
      }
      
      if (!discount.isActive) {
        return { valid: false, error: "Discount code is inactive" };
      }
      
      // Check if expired
      if (discount.expiresAt && new Date(discount.expiresAt) < new Date()) {
        return { valid: false, error: "Discount code has expired" };
      }
      
      // Check usage limit
      if (discount.usageLimit && (discount.usageCount || 0) >= discount.usageLimit) {
        return { valid: false, error: "Discount code usage limit reached" };
      }
      
      return { valid: true, discount };
    } catch (error) {
      return { valid: false, error: "Error validating discount code" };
    }
  }

  async incrementDiscountCodeUsage(id: string): Promise<void> {
    const code = await db.select().from(discountCodes).where(eq(discountCodes.id, id)).limit(1);
    if (!code[0]) return;
    
    await db.update(discountCodes)
      .set({ usageCount: (code[0].usageCount || 0) + 1 })
      .where(eq(discountCodes.id, id));
  }

  // Product bundles
  async getProductBundles(): Promise<ProductBundle[]> {
    return await db.select().from(productBundles);
  }

  async getProductBundleById(id: string): Promise<ProductBundle | undefined> {
    const result = await db.select().from(productBundles)
      .where(eq(productBundles.id, id))
      .limit(1);
    return result[0];
  }

  async createProductBundle(bundle: InsertProductBundle): Promise<ProductBundle> {
    const [created] = await db.insert(productBundles).values({
      ...bundle,
      id: `bundle-${randomUUID()}`,
      createdAt: new Date().toISOString()
    }).returning();
    return created;
  }

  async updateProductBundle(id: string, updates: Partial<InsertProductBundle>): Promise<ProductBundle | undefined> {
    const [updated] = await db.update(productBundles)
      .set(updates)
      .where(eq(productBundles.id, id))
      .returning();
    return updated;
  }

  async deleteProductBundle(id: string): Promise<boolean> {
    await db.delete(bundleItems).where(eq(bundleItems.bundleId, id));
    const result = await db.delete(productBundles).where(eq(productBundles.id, id));
    return true;
  }

  // Bundle items
  async getBundleItems(bundleId: string): Promise<BundleItem[]> {
    return await db.select().from(bundleItems).where(eq(bundleItems.bundleId, bundleId));
  }

  async createBundleItem(item: InsertBundleItem): Promise<BundleItem> {
    const [created] = await db.insert(bundleItems).values({
      ...item,
      id: `bundle-item-${randomUUID()}`
    }).returning();
    return created;
  }

  async updateBundleItem(id: string, updates: Partial<InsertBundleItem>): Promise<BundleItem | undefined> {
    const [updated] = await db.update(bundleItems)
      .set(updates)
      .where(eq(bundleItems.id, id))
      .returning();
    return updated;
  }

  async deleteBundleItem(id: string): Promise<boolean> {
    const result = await db.delete(bundleItems).where(eq(bundleItems.id, id));
    return true;
  }

  // Subscriptions
  async getSubscriptions(): Promise<Subscription[]> {
    return await db.select().from(subscriptions).orderBy(desc(subscriptions.startDate));
  }

  async getSubscriptionById(id: string): Promise<Subscription | undefined> {
    const result = await db.select().from(subscriptions)
      .where(eq(subscriptions.id, id))
      .limit(1);
    return result[0];
  }

  async getSubscriptionsByUserId(userId: string): Promise<Subscription[]> {
    return await db.select().from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.startDate));
  }

  async getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | undefined> {
    const result = await db.select().from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
      .limit(1);
    return result[0];
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [created] = await db.insert(subscriptions).values({
      ...subscription,
      startDate: new Date().toISOString()
    }).returning();
    return created;
  }

  async updateSubscription(id: string, updates: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    const [updated] = await db.update(subscriptions)
      .set(updates)
      .where(eq(subscriptions.id, id))
      .returning();
    return updated;
  }

  async updateSubscriptionByStripeId(stripeSubscriptionId: string, updates: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    const [updated] = await db.update(subscriptions)
      .set(updates)
      .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
      .returning();
    return updated;
  }

  async updateSubscriptionStatus(id: string, status: string): Promise<Subscription | undefined> {
    const [updated] = await db.update(subscriptions)
      .set({ status })
      .where(eq(subscriptions.id, id))
      .returning();
    return updated;
  }

  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    return await db.select().from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.startDate));
  }

  async getSubscription(id: string): Promise<Subscription | undefined> {
    return this.getSubscriptionById(id);
  }

  async getAllSubscriptions(): Promise<Subscription[]> {
    return this.getSubscriptions();
  }

  // Security Issues
  async getSecurityIssues(): Promise<SecurityIssue[]> {
    return await db.select().from(securityIssues)
      .orderBy(desc(securityIssues.createdAt));
  }

  async getSecurityIssueById(id: string): Promise<SecurityIssue | undefined> {
    const result = await db.select().from(securityIssues)
      .where(eq(securityIssues.id, id))
      .limit(1);
    return result[0];
  }

  async createSecurityIssue(issue: InsertSecurityIssue): Promise<SecurityIssue> {
    const [created] = await db.insert(securityIssues).values({
      ...issue,
      id: issue.id || `security-${randomUUID()}`
    }).returning();
    return created;
  }

  async updateSecurityIssue(id: string, updates: Partial<SecurityIssue>): Promise<SecurityIssue | undefined> {
    const [updated] = await db.update(securityIssues)
      .set(updates)
      .where(eq(securityIssues.id, id))
      .returning();
    return updated;
  }

  async updateSecurityIssueStatus(id: string, status: string, resolvedBy?: string): Promise<SecurityIssue | undefined> {
    const updates: any = { status };
    if (status === 'resolved' && resolvedBy) {
      updates.resolvedBy = resolvedBy;
      updates.resolvedAt = new Date().toISOString();
    }
    
    const [updated] = await db.update(securityIssues)
      .set(updates)
      .where(eq(securityIssues.id, id))
      .returning();
    return updated;
  }

  async updateSecurityIssueWithFixPrompt(id: string, fixPrompt: any): Promise<SecurityIssue | undefined> {
    // Fix prompt is not in the schema, just return the existing issue
    return this.getSecurityIssueById(id);
  }

  async archiveSecurityIssue(id: string, archivedBy: string): Promise<SecurityIssue | undefined> {
    // Archive functionality not in schema, mark as fixed instead
    const [updated] = await db.update(securityIssues)
      .set({ 
        fixed: true
      })
      .where(eq(securityIssues.id, id))
      .returning();
    return updated;
  }

  async unarchiveSecurityIssue(id: string): Promise<SecurityIssue | undefined> {
    // Archive functionality not in schema, mark as not fixed instead
    const [updated] = await db.update(securityIssues)
      .set({ 
        fixed: false
      })
      .where(eq(securityIssues.id, id))
      .returning();
    return updated;
  }

  async getArchivedSecurityIssues(): Promise<SecurityIssue[]> {
    // Return fixed issues instead of archived
    return await db.select().from(securityIssues)
      .where(eq(securityIssues.fixed, true))
      .orderBy(desc(securityIssues.createdAt));
  }

  async recordFixAttempt(issueId: string, attempt: any): Promise<any> {
    // This would require a fix_attempts table - for now return a mock
    return { ...attempt, id: randomUUID(), issueId, createdAt: new Date().toISOString() };
  }

  async getFixAttempts(issueId: string): Promise<any[]> {
    // This would require a fix_attempts table - for now return empty array
    return [];
  }
  
  async updateSecurityIssueReviewStatus(id: string, reviewed: boolean, reviewedBy?: string): Promise<SecurityIssue | undefined> {
    // Review status not in schema, mark as fixed instead
    const [updated] = await db.update(securityIssues)
      .set({ fixed: reviewed })
      .where(eq(securityIssues.id, id))
      .returning();
    return updated;
  }
  
  async clearSecurityIssues(): Promise<void> {
    await db.delete(securityIssues);
  }
  
  async updateAllSecurityIssues(issues: SecurityIssue[]): Promise<void> {
    // Delete all and reinsert
    await db.delete(securityIssues);
    if (issues.length > 0) {
      await db.insert(securityIssues).values(issues);
    }
  }
  
  async getLastScanTimestamp(): Promise<string | null> {
    // Would require separate metadata table
    return null;
  }
  
  async updateLastScanTimestamp(): Promise<void> {
    // Would require separate metadata table
  }
  
  async getBundleWithItems(id: string): Promise<(ProductBundle & { items: (BundleItem & { variant: ProductVariant })[] }) | undefined> {
    const bundle = await this.getProductBundleById(id);
    if (!bundle) return undefined;
    
    const items = await this.getBundleItems(id);
    const itemsWithVariants = await Promise.all(items.map(async item => {
      const variant = await this.getProductVariant(item.variantId);
      return { ...item, variant: variant! };
    }));
    
    return { ...bundle, items: itemsWithVariants };
  }
  
  async getVariantsExcludingTags(excludeTags: string[]): Promise<ProductVariant[]> {
    // Get all variants and filter by tags
    const allVariants = await db.select().from(productVariants);
    
    if (excludeTags.length === 0) {
      return allVariants;
    }
    
    // Filter variants that don't have any of the excluded tags
    return allVariants.filter(variant => {
      const tags = variant.tags || [];
      return !excludeTags.some(excludeTag => tags.includes(excludeTag));
    });
  }

  // Email events - not implemented yet, would require email_events table
  async createEmailEvent(event: any): Promise<void> {
    // Would require email_events table
  }

  async getEmailEventsByType(emailType: string): Promise<any[]> {
    return [];
  }

  async hasEmailBeenSent(emailType: string, relatedId: string): Promise<boolean> {
    return false;
  }

  async getReorderCandidates(daysBack?: number): Promise<any[]> {
    return [];
  }

  // Referrals - not implemented yet, would require referrals table
  async createReferral(referral: any): Promise<any> {
    return { ...referral, id: randomUUID(), createdAt: new Date().toISOString() };
  }

  async getReferralByCode(code: string): Promise<any | undefined> {
    return undefined;
  }

  async getReferralByReferrerId(referrerId: string): Promise<any | undefined> {
    return undefined;
  }

  async updateReferralUsageCount(id: string, count: number): Promise<any | undefined> {
    return undefined;
  }

  async createReferralClaim(claim: any): Promise<any> {
    return { ...claim, id: randomUUID(), claimedAt: new Date().toISOString() };
  }

  async getReferralClaimsByReferralId(referralId: string): Promise<any[]> {
    return [];
  }

  // Support tickets - not implemented yet, would require support_tickets table
  async createSupportTicket(ticket: any): Promise<any> {
    return { 
      ...ticket, 
      id: randomUUID(), 
      status: ticket.status || 'open',
      priority: ticket.priority || 'medium',
      category: ticket.category || 'general',
      createdAt: new Date().toISOString() 
    };
  }

  async getSupportTicket(id: string): Promise<any | undefined> {
    return undefined;
  }

  async getSupportTicketsByUserId(userId: string): Promise<any[]> {
    return [];
  }

  async getSupportTicketsByEmail(email: string): Promise<any[]> {
    return [];
  }

  async updateSupportTicket(id: string, updates: any): Promise<any | undefined> {
    return undefined;
  }

  async getAllSupportTickets(): Promise<any[]> {
    return [];
  }

  // Chat sessions - not implemented yet, would require chat_sessions table
  async createChatSession(session: any): Promise<any> {
    return { ...session, id: randomUUID(), createdAt: new Date().toISOString() };
  }

  async getChatSession(id: string): Promise<any | undefined> {
    return undefined;
  }

  async getChatSessionByToken(token: string): Promise<any | undefined> {
    return undefined;
  }

  async getChatSessionsByUserId(userId: string): Promise<any[]> {
    return [];
  }

  async updateChatSession(id: string, updates: any): Promise<any | undefined> {
    return undefined;
  }
}

// Export the storage instance
export const storage = new DrizzleStorage();