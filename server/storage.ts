import { type Product, type InsertProduct, type ProductVariant, type InsertProductVariant, type Newsletter, type InsertNewsletter, type PreOrder, type InsertPreOrder, type Article, type InsertArticle, type Order, type InsertOrder, type StockAlert, type InsertStockAlert, type QuizResult, type InsertQuizResult, type ConsultationBooking, type InsertConsultationBooking, type RestockNotification, type InsertRestockNotification, type User, type InsertUser, type UpsertUser, type Address, type InsertAddress, type OrderItem, type InsertOrderItem, type Cart, type InsertCart, type AdminLog, type InsertAdminLog, type ReorderLog, type DiscountCode, type InsertDiscountCode, type ProductBundle, type InsertProductBundle, type BundleItem, type InsertBundleItem, type Subscription, type InsertSubscription, type SecurityIssue, type InsertSecurityIssue } from "@shared/schema";
import { randomUUID } from "crypto";
import { mockSecurityIssues } from "./security-seed";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProductStock(productId: string, quantity: number): Promise<Product | undefined>;
  decreaseProductStock(productId: string, quantity: number): Promise<Product | undefined>;
  
  // Phase 14: Product Variants
  getProductVariants(productId: string): Promise<ProductVariant[]>;
  getProductVariant(id: string): Promise<ProductVariant | undefined>;
  createProductVariant(variant: InsertProductVariant): Promise<ProductVariant>;
  updateProductVariant(id: string, variant: Partial<ProductVariant>): Promise<ProductVariant | undefined>;
  deleteProductVariant(id: string): Promise<boolean>;
  getProductWithVariants(id: string): Promise<(Product & { variants: ProductVariant[] }) | undefined>;
  
  // Newsletter
  subscribeToNewsletter(email: InsertNewsletter): Promise<Newsletter>;
  getNewsletterSubscription(email: string): Promise<Newsletter | undefined>;
  
  // Pre-orders
  createPreOrder(preOrder: InsertPreOrder): Promise<PreOrder>;
  getPreOrders(): Promise<PreOrder[]>;
  getPreOrdersByProduct(productId: string): Promise<PreOrder[]>;
  
  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  getOrderById(id: string): Promise<Order | undefined>;
  getOrdersByEmail(email: string): Promise<Order[]>;
  updateOrderStatus(orderId: string, status: string): Promise<Order | undefined>;
  updatePaymentStatus(orderId: string, status: string): Promise<Order | undefined>;
  
  // Stock Alerts
  createStockAlert(alert: InsertStockAlert): Promise<StockAlert>;
  getStockAlerts(): Promise<StockAlert[]>;
  markAlertSent(alertId: string): Promise<void>;
  
  // Articles
  getArticles(): Promise<Article[]>;
  getArticleBySlug(slug: string): Promise<Article | undefined>;
  getArticlesByCategory(category: string): Promise<Article[]>;
  createArticle(article: InsertArticle): Promise<Article>;
  getLatestArticles(limit: number): Promise<Article[]>;
  
  // Quiz Results
  createQuizResult(quizResult: InsertQuizResult): Promise<QuizResult>;
  getQuizResults(): Promise<QuizResult[]>;
  
  // Consultation Bookings
  createConsultationBooking(booking: InsertConsultationBooking): Promise<ConsultationBooking>;
  getConsultationBookings(): Promise<ConsultationBooking[]>;
  
  // Restock Notifications
  createRestockNotification(notification: InsertRestockNotification): Promise<RestockNotification>;
  getRestockNotifications(): Promise<RestockNotification[]>;
  getRestockNotificationsByProduct(productId: string): Promise<RestockNotification[]>;
  
  // Users (Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>;
  
  // Addresses (Customer Portal)
  getAddressesByUserId(userId: string): Promise<Address[]>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(addressId: string, address: Partial<InsertAddress>): Promise<Address | undefined>;
  deleteAddress(addressId: string): Promise<void>;
  
  // Order Items (Customer Portal)
  getOrderItemsByOrderId(orderId: string): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Enhanced Order methods (Customer Portal)
  getOrdersByUserId(userId: string): Promise<Order[]>;
  getOrderByIdAndUserId(orderId: string, userId: string): Promise<Order | undefined>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  
  // Admin Order methods
  getAllOrders(): Promise<Order[]>;
  getOrderByStripePaymentIntent(paymentIntentId: string): Promise<Order | undefined>;
  updateOrderRefundStatus(orderId: string, status: string): Promise<Order | undefined>;
  
  // Cart methods (Phase 7: Abandoned Cart Tracking)
  upsertCart(cart: Partial<InsertCart> & { sessionToken: string }): Promise<Cart>;
  getCartById(id: string): Promise<Cart | undefined>;
  getCartBySessionToken(sessionToken: string): Promise<Cart | undefined>;
  markCartAsConverted(cartId: string, stripeSessionId?: string): Promise<Cart | undefined>;
  getAbandonedCarts(hoursThreshold: number): Promise<Cart[]>;
  
  // Phase 8: Guest to User conversion
  linkGuestOrdersToUser(email: string, userId: string): Promise<void>;
  
  // Admin Activity Logging (Phase 12)
  createAdminLog(log: InsertAdminLog): Promise<AdminLog>;
  getAdminLogs(limit?: number): Promise<AdminLog[]>;
  getAdminLogsByAdmin(adminId: string): Promise<AdminLog[]>;
  getAdminLogsByTarget(targetType: string, targetId: string): Promise<AdminLog[]>;
  getAdminLogsWithPagination(filters: {
    limit: number;
    offset: number;
    search?: string | null;
    actionFilter?: string | null;
    targetFilter?: string | null;
    hours?: number | null;
    adminId?: string | null;
    targetType?: string | null;
    targetId?: string | null;
  }): Promise<{ logs: AdminLog[], total: number }>;
  
  // Reorder logs (Phase 13)
  createReorderLog(log: any): Promise<ReorderLog>;
  getReorderLogs(options?: { limit?: number; userId?: string; status?: string }): Promise<ReorderLog[]>;
  getReorderLogsByOrderId(originalOrderId: string): Promise<ReorderLog[]>;
  
  // Phase 15: Discount codes
  getDiscountCodes(): Promise<DiscountCode[]>;
  getDiscountCodeByCode(code: string): Promise<DiscountCode | undefined>;
  createDiscountCode(discountCode: InsertDiscountCode): Promise<DiscountCode>;
  updateDiscountCode(id: string, updates: Partial<DiscountCode>): Promise<DiscountCode | undefined>;
  deleteDiscountCode(id: string): Promise<boolean>;
  validateDiscountCode(code: string): Promise<{ valid: boolean; discount?: DiscountCode; error?: string }>;
  incrementDiscountCodeUsage(id: string): Promise<void>;
  
  // Phase 16: Product Bundles with Children's Product Exclusion
  getProductBundles(): Promise<ProductBundle[]>;
  getProductBundleById(id: string): Promise<ProductBundle | undefined>;
  createProductBundle(bundle: InsertProductBundle): Promise<ProductBundle>;
  updateProductBundle(id: string, updates: Partial<ProductBundle>): Promise<ProductBundle | undefined>;
  deleteProductBundle(id: string): Promise<boolean>;
  getBundleItems(bundleId: string): Promise<BundleItem[]>;
  createBundleItem(item: InsertBundleItem): Promise<BundleItem>;
  deleteBundleItem(id: string): Promise<boolean>;
  getBundleWithItems(id: string): Promise<(ProductBundle & { items: (BundleItem & { variant: ProductVariant })[] }) | undefined>;
  getVariantsExcludingTags(excludeTags: string[]): Promise<ProductVariant[]>;

  // Phase 18: Subscriptions
  getUserSubscriptions(userId: string): Promise<Subscription[]>;
  getSubscription(id: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription | undefined>;
  getAllSubscriptions(): Promise<Subscription[]>;
  
  // ALFR3D Security Dashboard
  getSecurityIssues(): Promise<SecurityIssue[]>;
  createSecurityIssue(issue: InsertSecurityIssue): Promise<SecurityIssue>;
  updateSecurityIssueReviewStatus(id: string, reviewed: boolean, reviewedBy?: string): Promise<SecurityIssue | undefined>;
  clearSecurityIssues(): Promise<void>;
  updateAllSecurityIssues(issues: SecurityIssue[]): Promise<void>;
  getLastScanTimestamp(): Promise<string | null>;
  updateLastScanTimestamp(): Promise<void>;
  
  // ALFR3D Expert Features
  updateSecurityIssueWithFixPrompt(id: string, fixPrompt: any): Promise<SecurityIssue | undefined>;
  archiveSecurityIssue(id: string, archivedBy: string): Promise<SecurityIssue | undefined>;
  unarchiveSecurityIssue(id: string): Promise<SecurityIssue | undefined>;
  getArchivedSecurityIssues(): Promise<SecurityIssue[]>;
  recordFixAttempt(issueId: string, attempt: any): Promise<any>;
  getFixAttempts(issueId: string): Promise<any[]>;
  getSecurityIssueById(id: string): Promise<SecurityIssue | undefined>;
  
  // Phase 19: Email Events Tracking (Abandoned Cart + Reorder Reminders)
  createEmailEvent(event: { userId?: string; emailType: string; relatedId: string; emailAddress: string; }): Promise<void>;
  getEmailEventsByType(emailType: string): Promise<any[]>;
  hasEmailBeenSent(emailType: string, relatedId: string): Promise<boolean>;
  getAbandonedCarts(hoursCutoff?: number): Promise<any[]>;
  getReorderCandidates(daysBack?: number): Promise<any[]>;
  
  // Admin role management
  updateUserRole(userId: string, role: 'admin' | 'customer'): Promise<void>;
  
  // Phase 20: Referral System
  createReferral(referral: { referrerId: string; code: string; rewardType: string; rewardValue: number; isActive: boolean; usedCount: number; maxUses: number; }): Promise<any>;
  getReferralByCode(code: string): Promise<any | undefined>;
  getReferralByReferrerId(referrerId: string): Promise<any | undefined>;
  updateReferralUsageCount(id: string, count: number): Promise<any | undefined>;
  createReferralClaim(claim: { referralId: string; refereeId: string; orderId: string; orderAmount: number; refereeDiscount: number; referrerRewardAmount: number; processed: boolean; claimedAt: string; }): Promise<any>;
  getReferralClaimsByReferralId(referralId: string): Promise<any[]>;
  
  // Phase 21: AI Customer Service Assistant
  createSupportTicket(ticket: { userId?: string; email: string; subject: string; message: string; status?: string; priority?: string; category?: string; orderId?: string; transcript?: string; aiHandled?: boolean; }): Promise<any>;
  getSupportTicket(id: string): Promise<any | undefined>;
  getSupportTicketsByUserId(userId: string): Promise<any[]>;
  getSupportTicketsByEmail(email: string): Promise<any[]>;
  updateSupportTicket(id: string, updates: Partial<any>): Promise<any | undefined>;
  getAllSupportTickets(): Promise<any[]>;
  createChatSession(session: { userId?: string; sessionToken?: string; messages: string; metadata?: string; }): Promise<any>;
  getChatSession(id: string): Promise<any | undefined>;
  getChatSessionByToken(token: string): Promise<any | undefined>;
  getChatSessionsByUserId(userId: string): Promise<any[]>;
  updateChatSession(id: string, updates: Partial<any>): Promise<any | undefined>;
}

export class MemStorage implements IStorage {
  private products: Map<string, Product>;
  private productVariants: Map<string, ProductVariant>; // Phase 14
  private newsletters: Map<string, Newsletter>;
  private preOrders: Map<string, PreOrder>;
  private consultationBookings: Map<string, ConsultationBooking>;
  private articles: Map<string, Article>;
  private orders: Map<string, Order>;
  private stockAlerts: Map<string, StockAlert>;
  private quizResults: Map<string, QuizResult>;
  private restockNotifications: Map<string, RestockNotification>;
  private users: Map<string, User>;
  private addresses: Map<string, Address>;
  private orderItems: Map<string, OrderItem>;
  private carts: Map<string, Cart>;
  private adminLogs: Map<string, AdminLog>;
  private reorderLogs: Map<string, ReorderLog>;
  private discountCodes: Map<string, DiscountCode>; // Phase 15
  private productBundles: Map<string, ProductBundle>; // Phase 16
  private bundleItems: Map<string, BundleItem>; // Phase 16
  private subscriptions: Map<string, Subscription>; // Phase 18
  private emailEvents: Map<string, any>; // Phase 19
  private referrals: Map<string, any>; // Phase 20
  private referralClaims: Map<string, any>; // Phase 20
  private supportTickets: Map<string, any>; // Phase 21
  private chatSessions: Map<string, any>; // Phase 21
  private securityIssues: Map<string, SecurityIssue>; // ALFR3D
  private fixAttempts: Map<string, any>; // ALFR3D Fix Attempts
  private lastScanTimestamp: string | null = null; // ALFR3D

  constructor() {
    this.products = new Map();
    this.productVariants = new Map(); // Phase 14
    this.newsletters = new Map();
    this.preOrders = new Map();
    this.articles = new Map();
    this.orders = new Map();
    this.consultationBookings = new Map();
    this.stockAlerts = new Map();
    this.quizResults = new Map();
    this.restockNotifications = new Map();
    this.users = new Map();
    this.addresses = new Map();
    this.orderItems = new Map();
    this.carts = new Map();
    this.adminLogs = new Map();
    this.reorderLogs = new Map();
    this.discountCodes = new Map(); // Phase 15
    this.productBundles = new Map(); // Phase 16
    this.bundleItems = new Map(); // Phase 16
    this.subscriptions = new Map(); // Phase 18
    this.emailEvents = new Map(); // Phase 19
    this.referrals = new Map(); // Phase 20
    this.referralClaims = new Map(); // Phase 20
    this.supportTickets = new Map(); // Phase 21
    this.chatSessions = new Map(); // Phase 21
    this.securityIssues = new Map(); // ALFR3D
    this.fixAttempts = new Map(); // ALFR3D Fix Attempts
    this.seedData();
    this.seedUsers(); // Add test users
    this.seedProductVariants(); // Phase 14
    this.seedAbandonedCarts();
    this.seedAdminLogs();
    this.seedReorderLogs();
    this.seedDiscountCodes(); // Phase 15
    this.seedBundles(); // Phase 16
    this.seedArticles();
    this.seedSecurityIssues(); // ALFR3D mock data
  }

  private seedData() {
    const sampleProducts: Product[] = [];

    sampleProducts.forEach(product => {
      this.products.set(product.id, product);
    });
  }

  private seedProductVariants() {
    const variants: ProductVariant[] = [];

    variants.forEach(variant => {
      this.productVariants.set(variant.id, variant);
    });
  }

  private seedAbandonedCarts() {
    const sampleCarts: Cart[] = [];

    sampleCarts.forEach(cart => {
      this.carts.set(cart.id, cart);
    });
  }

  private seedAdminLogs() {
    const sampleLogs: AdminLog[] = [];

    sampleLogs.forEach(log => {
      this.adminLogs.set(log.id, log);
    });
  }

  private seedReorderLogs() {
    const sampleReorders: ReorderLog[] = [];

    sampleReorders.forEach(reorder => {
      this.reorderLogs.set(reorder.id, reorder);
    });
  }

  private seedDiscountCodes() {
    const sampleCodes: DiscountCode[] = [];

    sampleCodes.forEach(code => {
      this.discountCodes.set(code.id, code);
    });
  }

  private seedBundles() {
    const sampleBundles: ProductBundle[] = [];

    sampleBundles.forEach(bundle => {
      this.productBundles.set(bundle.id, bundle);
    });
    
    const sampleBundleItems: BundleItem[] = [];
    
    sampleBundleItems.forEach(item => {
      this.bundleItems.set(item.id, item);
    });
  }

  private seedUsers() {
    const testUsers: User[] = [];

    // Add demo admin user for development
    if (process.env.NODE_ENV === 'development') {
      const demoAdmin: User = {
        id: 'admin-user-id',
        email: 'admin@healios.dev',
        password: null,
        role: 'admin',
        firstName: 'Admin',
        lastName: 'Demo',
        stripeCustomerId: null,
        emailVerified: null,
        verificationCodeHash: null,
        verificationExpiresAt: null,
        verificationAttempts: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      testUsers.push(demoAdmin);
    }

    testUsers.forEach(user => {
      this.users.set(user.id, user);
    });
  }

  private seedArticles() {
    const sampleArticles: Article[] = [];

    sampleArticles.forEach(article => {
      this.articles.set(article.id, article);
    });
  }

  private seedSecurityIssues() {
    mockSecurityIssues.forEach(issue => {
      this.securityIssues.set(issue.id, issue);
    });
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.featured);
  }

  async getProductById(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      product => product.categories?.some(cat => cat.toLowerCase() === category.toLowerCase())
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { 
      id,
      name: insertProduct.name,
      description: insertProduct.description,
      price: insertProduct.price,
      originalPrice: insertProduct.originalPrice ?? null,
      imageUrl: insertProduct.imageUrl,
      categories: insertProduct.categories,
      rating: insertProduct.rating ?? null,
      reviewCount: insertProduct.reviewCount ?? null,
      inStock: insertProduct.inStock ?? null,
      stockQuantity: insertProduct.stockQuantity ?? null,
      featured: insertProduct.featured ?? null,
      sizes: insertProduct.sizes ?? null,
      colors: insertProduct.colors ?? null,
      gender: insertProduct.gender ?? null,
      type: insertProduct.type ?? null,
      bottleCount: insertProduct.bottleCount ?? null,
      dailyDosage: insertProduct.dailyDosage ?? null,
      supplyDays: insertProduct.supplyDays ?? null,
      tags: insertProduct.tags ?? null,
      allowPreorder: insertProduct.allowPreorder ?? null,
      preorderCap: insertProduct.preorderCap ?? null,
      preorderCount: insertProduct.preorderCount ?? null,
      seoTitle: insertProduct.seoTitle ?? null,
      seoDescription: insertProduct.seoDescription ?? null,
      seoKeywords: insertProduct.seoKeywords ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.products.set(id, product);
    return product;
  }

  async updateProductStock(productId: string, quantity: number): Promise<Product | undefined> {
    const product = this.products.get(productId);
    if (!product) return undefined;

    const updatedProduct: Product = {
      ...product,
      stockQuantity: quantity,
      inStock: quantity > 0,
      updatedAt: new Date().toISOString(),
    };
    
    this.products.set(productId, updatedProduct);
    return updatedProduct;
  }

  async decreaseProductStock(productId: string, quantity: number): Promise<Product | undefined> {
    const product = this.products.get(productId);
    if (!product) return undefined;

    const currentStock = product.stockQuantity ?? 0;
    const newQuantity = Math.max(0, currentStock - quantity);
    return this.updateProductStock(productId, newQuantity);
  }

  // Stub implementations for remaining interface methods to satisfy TypeScript
  async getProductVariants(productId: string): Promise<ProductVariant[]> { return Array.from(this.productVariants.values()).filter(variant => variant.productId === productId); }
  async getProductVariant(id: string): Promise<ProductVariant | undefined> { return this.productVariants.get(id); }
  async createProductVariant(insertVariant: InsertProductVariant): Promise<ProductVariant> { 
    const id = randomUUID(); 
    const variant: ProductVariant = { 
      id,
      productId: insertVariant.productId,
      name: insertVariant.name,
      price: insertVariant.price,
      sku: insertVariant.sku,
      imageUrl: insertVariant.imageUrl ?? null,
      stockQuantity: insertVariant.stockQuantity ?? null,
      inStock: insertVariant.inStock ?? null,
      isDefault: insertVariant.isDefault ?? null,
      subscriptionPriceId: insertVariant.subscriptionPriceId ?? null,
      subscriptionIntervalDays: insertVariant.subscriptionIntervalDays ?? null,
      subscriptionEnabled: insertVariant.subscriptionEnabled ?? null,
      createdAt: new Date().toISOString()
    }; 
    this.productVariants.set(id, variant); 
    return variant; 
  }
  async updateProductVariant(id: string, updates: Partial<ProductVariant>): Promise<ProductVariant | undefined> { const variant = this.productVariants.get(id); if (!variant) return undefined; const updatedVariant = { ...variant, ...updates }; this.productVariants.set(id, updatedVariant); return updatedVariant; }
  async deleteProductVariant(id: string): Promise<boolean> { return this.productVariants.delete(id); }
  async getProductWithVariants(id: string): Promise<(Product & { variants: ProductVariant[] }) | undefined> { const product = this.products.get(id); if (!product) return undefined; const variants = await this.getProductVariants(id); return { ...product, variants }; }
  async subscribeToNewsletter(email: InsertNewsletter): Promise<Newsletter> { 
    const id = randomUUID(); 
    const newsletter: Newsletter = { 
      id,
      email: email.email,
      firstName: email.firstName,
      lastName: email.lastName,
      birthday: email.birthday ?? null,
      subscribedAt: new Date().toISOString()
    }; 
    this.newsletters.set(id, newsletter); 
    return newsletter; 
  }
  async getNewsletterSubscription(email: string): Promise<Newsletter | undefined> { return Array.from(this.newsletters.values()).find(n => n.email === email); }
  async createPreOrder(preOrder: InsertPreOrder): Promise<PreOrder> { 
    const id = randomUUID(); 
    const order: PreOrder = { 
      id,
      customerEmail: preOrder.customerEmail,
      customerName: preOrder.customerName,
      customerPhone: preOrder.customerPhone ?? null,
      productId: preOrder.productId,
      productName: preOrder.productName,
      quantity: preOrder.quantity ?? null,
      notes: preOrder.notes ?? null,
      productPrice: preOrder.productPrice,
      status: preOrder.status ?? null,
      createdAt: new Date().toISOString()
    }; 
    this.preOrders.set(id, order); 
    return order; 
  }
  async getPreOrders(): Promise<PreOrder[]> { return Array.from(this.preOrders.values()); }
  async getPreOrdersByProduct(productId: string): Promise<PreOrder[]> { return Array.from(this.preOrders.values()).filter(order => order.productId === productId); }
  async createOrder(order: InsertOrder): Promise<Order> { 
    const id = randomUUID(); 
    const newOrder: Order = { 
      id,
      userId: order.userId ?? null,
      customerEmail: order.customerEmail,
      customerName: order.customerName ?? null,
      customerPhone: order.customerPhone ?? null,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress ?? null,
      orderItems: order.orderItems,
      totalAmount: order.totalAmount,
      currency: order.currency ?? null,
      paymentStatus: order.paymentStatus ?? null,
      orderStatus: order.orderStatus ?? null,
      refundStatus: order.refundStatus ?? null,
      disputeStatus: order.disputeStatus ?? null,
      stripePaymentIntentId: order.stripePaymentIntentId ?? null,
      stripeSessionId: order.stripeSessionId ?? null,
      trackingNumber: order.trackingNumber ?? null,
      discountCode: order.discountCode ?? null,
      notes: order.notes ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }; 
    this.orders.set(id, newOrder); 
    return newOrder; 
  }
  async getOrderById(id: string): Promise<Order | undefined> { return this.orders.get(id); }
  async getOrdersByEmail(email: string): Promise<Order[]> { return Array.from(this.orders.values()).filter(order => order.customerEmail === email); }
  async updateOrderStatus(orderId: string, status: string): Promise<Order | undefined> { const order = this.orders.get(orderId); if (!order) return undefined; const updated: Order = { ...order, orderStatus: status, updatedAt: new Date().toISOString() }; this.orders.set(orderId, updated); return updated; }
  async updatePaymentStatus(orderId: string, status: string): Promise<Order | undefined> { const order = this.orders.get(orderId); if (!order) return undefined; const updated: Order = { ...order, paymentStatus: status, updatedAt: new Date().toISOString() }; this.orders.set(orderId, updated); return updated; }
  async createStockAlert(alert: InsertStockAlert): Promise<StockAlert> { 
    const id = randomUUID(); 
    const stockAlert: StockAlert = { 
      id,
      productId: alert.productId,
      productName: alert.productName,
      currentStock: alert.currentStock,
      threshold: alert.threshold ?? null,
      alertSent: alert.alertSent ?? null,
      createdAt: new Date().toISOString()
    }; 
    this.stockAlerts.set(id, stockAlert); 
    return stockAlert; 
  }
  async getStockAlerts(): Promise<StockAlert[]> { return Array.from(this.stockAlerts.values()); }
  async markAlertSent(alertId: string): Promise<void> { const alert = this.stockAlerts.get(alertId); if (alert) { this.stockAlerts.set(alertId, { ...alert, alertSent: true }); } }
  async getArticles(): Promise<Article[]> { return Array.from(this.articles.values()); }
  async getArticleBySlug(slug: string): Promise<Article | undefined> { return Array.from(this.articles.values()).find(a => a.slug === slug); }
  async getArticlesByCategory(category: string): Promise<Article[]> { return Array.from(this.articles.values()).filter(a => a.category === category); }
  async createArticle(article: InsertArticle): Promise<Article> { 
    const id = randomUUID(); 
    const newArticle: Article = { 
      id,
      title: article.title,
      slug: article.slug,
      metaDescription: article.metaDescription,
      content: article.content,
      research: article.research ?? null,
      sources: article.sources ?? null,
      category: article.category ?? null,
      author: article.author ?? null,
      readTime: article.readTime ?? null,
      published: article.published ?? null,
      createdAt: new Date().toISOString()
    }; 
    this.articles.set(id, newArticle); 
    return newArticle; 
  }
  async getLatestArticles(limit: number): Promise<Article[]> { return Array.from(this.articles.values()).slice(0, limit); }
  async createQuizResult(quizResult: InsertQuizResult): Promise<QuizResult> { 
    const id = randomUUID(); 
    const result: QuizResult = { 
      id,
      email: quizResult.email,
      firstName: quizResult.firstName,
      lastName: quizResult.lastName,
      consentToMarketing: quizResult.consentToMarketing ?? null,
      answers: quizResult.answers,
      recommendations: quizResult.recommendations,
      createdAt: new Date().toISOString()
    }; 
    this.quizResults.set(id, result); 
    return result; 
  }
  async getQuizResults(): Promise<QuizResult[]> { return Array.from(this.quizResults.values()); }
  async createConsultationBooking(booking: InsertConsultationBooking): Promise<ConsultationBooking> { 
    const id = randomUUID(); 
    const newBooking: ConsultationBooking = { 
      id,
      type: booking.type,
      name: booking.name,
      email: booking.email,
      goals: booking.goals ?? null,
      status: 'pending',
      createdAt: new Date().toISOString()
    }; 
    this.consultationBookings.set(id, newBooking); 
    return newBooking; 
  }
  async getConsultationBookings(): Promise<ConsultationBooking[]> { return Array.from(this.consultationBookings.values()); }
  async createRestockNotification(notification: InsertRestockNotification): Promise<RestockNotification> { 
    const id = randomUUID(); 
    const newNotification: RestockNotification = { 
      id,
      email: notification.email,
      firstName: notification.firstName ?? null,
      lastName: notification.lastName ?? null,
      productId: notification.productId,
      productName: notification.productName,
      agreeToContact: notification.agreeToContact ?? null,
      notified: notification.notified ?? null,
      requestedAt: new Date().toISOString()
    }; 
    this.restockNotifications.set(id, newNotification); 
    return newNotification; 
  }
  async getRestockNotifications(): Promise<RestockNotification[]> { return Array.from(this.restockNotifications.values()); }
  async getRestockNotificationsByProduct(productId: string): Promise<RestockNotification[]> { return Array.from(this.restockNotifications.values()).filter(n => n.productId === productId); }
  async getUser(id: string): Promise<User | undefined> { return this.users.get(id); }
  async upsertUser(user: UpsertUser): Promise<User> { 
    const existing = this.users.get(user.id); 
    if (existing) { 
      const updated = { ...existing, ...user }; 
      this.users.set(user.id, updated); 
      return updated; 
    } 
    const newUser: User = { 
      id: user.id,
      email: user.email,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      password: null,
      role: user.role || 'customer',
      stripeCustomerId: null,
      emailVerified: null,
      verificationCodeHash: null,
      verificationExpiresAt: null,
      verificationAttempts: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }; 
    this.users.set(user.id, newUser); 
    return newUser; 
  }
  async getUserById(id: string): Promise<User | undefined> { return this.users.get(id); }
  async getUserByEmail(email: string): Promise<User | undefined> { return Array.from(this.users.values()).find(u => u.email === email); }
  async createUser(user: InsertUser): Promise<User> { 
    const id = randomUUID(); 
    const newUser: User = { 
      id,
      email: user.email,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      password: user.password ?? null,
      role: user.role ?? 'customer',
      stripeCustomerId: user.stripeCustomerId ?? null,
      emailVerified: user.emailVerified ?? null,
      verificationCodeHash: user.verificationCodeHash ?? null,
      verificationExpiresAt: user.verificationExpiresAt ?? null,
      verificationAttempts: user.verificationAttempts ?? 0,
      isActive: user.isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }; 
    this.users.set(id, newUser); 
    return newUser; 
  }
  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> { const user = this.users.get(id); if (!user) return undefined; const updated = { ...user, ...updates, updatedAt: new Date().toISOString() }; this.users.set(id, updated); return updated; }
  async updateUserRole(userId: string, role: 'admin' | 'customer'): Promise<void> { 
    const user = this.users.get(userId); 
    if (user) { 
      this.users.set(userId, { ...user, role, updatedAt: new Date().toISOString() }); 
    } 
  }
  async getAddressesByUserId(userId: string): Promise<Address[]> { return Array.from(this.addresses.values()).filter(a => a.userId === userId); }
  async createAddress(address: InsertAddress): Promise<Address> { 
    const id = randomUUID(); 
    const newAddress: Address = { 
      id,
      userId: address.userId,
      type: address.type,
      line1: address.line1,
      line2: address.line2 ?? null,
      city: address.city ?? null,
      zip: address.zip ?? null,
      country: address.country ?? null,
      createdAt: new Date().toISOString()
    }; 
    this.addresses.set(id, newAddress); 
    return newAddress; 
  }
  async updateAddress(addressId: string, address: Partial<InsertAddress>): Promise<Address | undefined> { const existing = this.addresses.get(addressId); if (!existing) return undefined; const updated = { ...existing, ...address }; this.addresses.set(addressId, updated); return updated; }
  async deleteAddress(addressId: string): Promise<void> { this.addresses.delete(addressId); }
  async getOrderItemsByOrderId(orderId: string): Promise<OrderItem[]> { return Array.from(this.orderItems.values()).filter(item => item.orderId === orderId); }
  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> { 
    const id = randomUUID(); 
    const newItem: OrderItem = { 
      id,
      orderId: orderItem.orderId,
      productId: orderItem.productId,
      productName: orderItem.productName,
      price: orderItem.price,
      quantity: orderItem.quantity,
      productVariantId: orderItem.productVariantId ?? null,
      variantName: orderItem.variantName ?? null,
      variantSku: orderItem.variantSku ?? null,
      createdAt: new Date().toISOString()
    }; 
    this.orderItems.set(id, newItem); 
    return newItem; 
  }
  async getOrdersByUserId(userId: string): Promise<Order[]> { return Array.from(this.orders.values()).filter(order => order.userId === userId); }
  async getOrderByIdAndUserId(orderId: string, userId: string): Promise<Order | undefined> { const order = this.orders.get(orderId); return (order && order.userId === userId) ? order : undefined; }
  async getAllOrders(): Promise<Order[]> { return Array.from(this.orders.values()); }
  async getOrderByStripePaymentIntent(paymentIntentId: string): Promise<Order | undefined> { return Array.from(this.orders.values()).find(order => order.stripePaymentIntentId === paymentIntentId); }
  async updateOrderRefundStatus(orderId: string, status: string): Promise<Order | undefined> { const order = this.orders.get(orderId); if (!order) return undefined; const updated = { ...order, refundStatus: status, updatedAt: new Date().toISOString() }; this.orders.set(orderId, updated); return updated; }
  async upsertCart(cart: Partial<InsertCart> & { sessionToken: string }): Promise<Cart> { const existing = Array.from(this.carts.values()).find(c => c.sessionToken === cart.sessionToken); if (existing) { const updated = { ...existing, ...cart, lastUpdated: new Date().toISOString() }; this.carts.set(existing.id, updated); return updated; } const id = randomUUID(); const newCart: Cart = { ...cart, id, createdAt: new Date().toISOString(), lastUpdated: new Date().toISOString() } as Cart; this.carts.set(id, newCart); return newCart; }
  async getCartById(id: string): Promise<Cart | undefined> { return this.carts.get(id); }
  async getCartBySessionToken(sessionToken: string): Promise<Cart | undefined> { return Array.from(this.carts.values()).find(cart => cart.sessionToken === sessionToken); }
  async markCartAsConverted(cartId: string, stripeSessionId?: string): Promise<Cart | undefined> { const cart = this.carts.get(cartId); if (!cart) return undefined; const updated = { ...cart, convertedToOrder: true, stripeSessionId: stripeSessionId ?? null, lastUpdated: new Date().toISOString() }; this.carts.set(cartId, updated); return updated; }
  async getAbandonedCarts(hoursThreshold: number): Promise<Cart[]> { const threshold = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000); return Array.from(this.carts.values()).filter(cart => !cart.convertedToOrder && cart.lastUpdated && new Date(cart.lastUpdated) < threshold); }
  async linkGuestOrdersToUser(email: string, userId: string): Promise<void> { Array.from(this.orders.values()).forEach(order => { if (order.customerEmail === email && !order.userId) { this.orders.set(order.id, { ...order, userId }); } }); }
  async createAdminLog(log: InsertAdminLog): Promise<AdminLog> { 
    const id = randomUUID(); 
    const newLog: AdminLog = { 
      id,
      adminId: log.adminId,
      actionType: log.actionType,
      targetType: log.targetType,
      targetId: log.targetId,
      details: log.details ?? null,
      ipAddress: log.ipAddress ?? null,
      timestamp: new Date().toISOString()
    }; 
    this.adminLogs.set(id, newLog); 
    return newLog; 
  }
  async getAdminLogs(limit?: number): Promise<AdminLog[]> { const logs = Array.from(this.adminLogs.values()); return limit ? logs.slice(0, limit) : logs; }
  async getAdminLogsByAdmin(adminId: string): Promise<AdminLog[]> { return Array.from(this.adminLogs.values()).filter(log => log.adminId === adminId); }
  async getAdminLogsByTarget(targetType: string, targetId: string): Promise<AdminLog[]> { return Array.from(this.adminLogs.values()).filter(log => log.targetType === targetType && log.targetId === targetId); }
  async getAdminLogsWithPagination(filters: any): Promise<{ logs: AdminLog[], total: number }> { const logs = Array.from(this.adminLogs.values()); return { logs: logs.slice(filters.offset, filters.offset + filters.limit), total: logs.length }; }
  async createReorderLog(log: any): Promise<ReorderLog> { const id = randomUUID(); const newLog: ReorderLog = { ...log, id, timestamp: new Date().toISOString() }; this.reorderLogs.set(id, newLog); return newLog; }
  async getReorderLogs(options?: any): Promise<ReorderLog[]> { return Array.from(this.reorderLogs.values()); }
  async getReorderLogsByOrderId(originalOrderId: string): Promise<ReorderLog[]> { return Array.from(this.reorderLogs.values()).filter(log => log.originalOrderId === originalOrderId); }
  async getDiscountCodes(): Promise<DiscountCode[]> { return Array.from(this.discountCodes.values()); }
  async getDiscountCodeByCode(code: string): Promise<DiscountCode | undefined> { return Array.from(this.discountCodes.values()).find(dc => dc.code === code); }
  async createDiscountCode(discountCode: InsertDiscountCode): Promise<DiscountCode> { 
    const id = randomUUID(); 
    const newCode: DiscountCode = { 
      id,
      type: discountCode.type,
      value: discountCode.value,
      code: discountCode.code,
      isActive: discountCode.isActive ?? null,
      usageLimit: discountCode.usageLimit ?? null,
      usageCount: 0,
      expiresAt: discountCode.expiresAt ?? null,
      createdAt: new Date().toISOString()
    }; 
    this.discountCodes.set(id, newCode); 
    return newCode; 
  }
  async updateDiscountCode(id: string, updates: Partial<DiscountCode>): Promise<DiscountCode | undefined> { const code = this.discountCodes.get(id); if (!code) return undefined; const updated = { ...code, ...updates }; this.discountCodes.set(id, updated); return updated; }
  async deleteDiscountCode(id: string): Promise<boolean> { return this.discountCodes.delete(id); }
  async validateDiscountCode(code: string): Promise<{ valid: boolean; discount?: DiscountCode; error?: string }> { const discount = await this.getDiscountCodeByCode(code); if (!discount) return { valid: false, error: 'Code not found' }; if (!discount.isActive) return { valid: false, error: 'Code inactive' }; if (discount.usageLimit && discount.usageCount >= discount.usageLimit) return { valid: false, error: 'Usage limit exceeded' }; if (discount.expiresAt && new Date() > new Date(discount.expiresAt)) return { valid: false, error: 'Code expired' }; return { valid: true, discount }; }
  async incrementDiscountCodeUsage(id: string): Promise<void> { const code = this.discountCodes.get(id); if (code) { this.discountCodes.set(id, { ...code, usageCount: (code.usageCount ?? 0) + 1 }); } }
  async getProductBundles(): Promise<ProductBundle[]> { return Array.from(this.productBundles.values()); }
  async getProductBundleById(id: string): Promise<ProductBundle | undefined> { return this.productBundles.get(id); }
  async createProductBundle(bundle: InsertProductBundle): Promise<ProductBundle> { 
    const id = randomUUID(); 
    const newBundle: ProductBundle = { 
      id,
      name: bundle.name,
      description: bundle.description ?? null,
      price: bundle.price,
      originalPrice: bundle.originalPrice ?? null,
      imageUrl: bundle.imageUrl ?? null,
      isActive: bundle.isActive ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }; 
    this.productBundles.set(id, newBundle); 
    return newBundle; 
  }
  async updateProductBundle(id: string, updates: Partial<ProductBundle>): Promise<ProductBundle | undefined> { const bundle = this.productBundles.get(id); if (!bundle) return undefined; const updated = { ...bundle, ...updates, updatedAt: new Date().toISOString() }; this.productBundles.set(id, updated); return updated; }
  async deleteProductBundle(id: string): Promise<boolean> { return this.productBundles.delete(id); }
  async getBundleItems(bundleId: string): Promise<BundleItem[]> { return Array.from(this.bundleItems.values()).filter(item => item.bundleId === bundleId); }
  async createBundleItem(item: InsertBundleItem): Promise<BundleItem> { 
    const id = randomUUID(); 
    const newItem: BundleItem = { 
      id,
      bundleId: item.bundleId,
      variantId: item.variantId,
      quantity: item.quantity || 1,
      createdAt: new Date().toISOString()
    }; 
    this.bundleItems.set(id, newItem); 
    return newItem; 
  }
  async deleteBundleItem(id: string): Promise<boolean> { return this.bundleItems.delete(id); }
  async getBundleWithItems(id: string): Promise<(ProductBundle & { items: (BundleItem & { variant: ProductVariant })[] }) | undefined> { const bundle = this.productBundles.get(id); if (!bundle) return undefined; const items = await this.getBundleItems(id); const itemsWithVariants = await Promise.all(items.map(async item => { const variant = await this.getProductVariant(item.variantId); return { ...item, variant: variant! }; })); return { ...bundle, items: itemsWithVariants }; }
  async getVariantsExcludingTags(excludeTags: string[]): Promise<ProductVariant[]> { return Array.from(this.productVariants.values()); }
  async getUserSubscriptions(userId: string): Promise<Subscription[]> { return Array.from(this.subscriptions.values()).filter(sub => sub.userId === userId); }
  async getSubscription(id: string): Promise<Subscription | undefined> { return this.subscriptions.get(id); }
  async createSubscription(subscription: InsertSubscription): Promise<Subscription> { 
    const id = randomUUID(); 
    const newSub: Subscription = { 
      id,
      userId: subscription.userId,
      productVariantId: subscription.productVariantId,
      stripeCustomerId: subscription.stripeCustomerId,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      intervalDays: subscription.intervalDays,
      status: subscription.status ?? null,
      metadata: subscription.metadata ?? null,
      currentPeriodStart: subscription.currentPeriodStart ?? null,
      currentPeriodEnd: subscription.currentPeriodEnd ?? null,
      cancelAt: subscription.cancelAt ?? null,
      canceledAt: subscription.canceledAt ?? null,
      startDate: new Date().toISOString()
    }; 
    this.subscriptions.set(id, newSub); 
    return newSub; 
  }
  async updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription | undefined> { const sub = this.subscriptions.get(id); if (!sub) return undefined; const updated = { ...sub, ...updates }; this.subscriptions.set(id, updated); return updated; }
  async getAllSubscriptions(): Promise<Subscription[]> { return Array.from(this.subscriptions.values()); }
  async getSecurityIssues(): Promise<SecurityIssue[]> { return Array.from(this.securityIssues.values()); }
  async createSecurityIssue(issue: InsertSecurityIssue): Promise<SecurityIssue> { 
    const id = randomUUID(); 
    const newIssue: SecurityIssue = { 
      id,
      type: issue.type,
      filePath: issue.filePath,
      line: issue.line,
      snippet: issue.snippet,
      fixed: issue.fixed ?? null,
      createdAt: new Date().toISOString()
    }; 
    this.securityIssues.set(id, newIssue); 
    return newIssue; 
  }
  async updateSecurityIssueReviewStatus(id: string, reviewed: boolean, reviewedBy?: string): Promise<SecurityIssue | undefined> { const issue = this.securityIssues.get(id); if (!issue) return undefined; const updated = { ...issue, reviewed, reviewedBy }; this.securityIssues.set(id, updated); return updated; }
  async clearSecurityIssues(): Promise<void> { this.securityIssues.clear(); }
  async updateAllSecurityIssues(issues: SecurityIssue[]): Promise<void> { this.securityIssues.clear(); issues.forEach(issue => this.securityIssues.set(issue.id, issue)); }
  async getLastScanTimestamp(): Promise<string | null> { return this.lastScanTimestamp; }
  async updateLastScanTimestamp(): Promise<void> { this.lastScanTimestamp = new Date().toISOString(); }
  async updateSecurityIssueWithFixPrompt(id: string, fixPrompt: any): Promise<SecurityIssue | undefined> { const issue = this.securityIssues.get(id); if (!issue) return undefined; const updated = { ...issue, fixPrompt }; this.securityIssues.set(id, updated); return updated; }
  async archiveSecurityIssue(id: string, archivedBy: string): Promise<SecurityIssue | undefined> { const issue = this.securityIssues.get(id); if (!issue) return undefined; const updated = { ...issue, archived: true, archivedBy, archivedAt: new Date().toISOString() }; this.securityIssues.set(id, updated); return updated; }
  async unarchiveSecurityIssue(id: string): Promise<SecurityIssue | undefined> { const issue = this.securityIssues.get(id); if (!issue) return undefined; const updated = { ...issue, archived: false, archivedBy: null, archivedAt: null }; this.securityIssues.set(id, updated); return updated; }
  async getArchivedSecurityIssues(): Promise<SecurityIssue[]> { return Array.from(this.securityIssues.values()).filter(issue => issue.archived); }
  async recordFixAttempt(issueId: string, attempt: any): Promise<any> { const id = randomUUID(); const fixAttempt = { ...attempt, id, issueId, createdAt: new Date().toISOString() }; this.fixAttempts.set(id, fixAttempt); return fixAttempt; }
  async getFixAttempts(issueId: string): Promise<any[]> { return Array.from(this.fixAttempts.values()).filter(attempt => attempt.issueId === issueId); }
  async getSecurityIssueById(id: string): Promise<SecurityIssue | undefined> { return this.securityIssues.get(id); }
  async createEmailEvent(event: any): Promise<void> { const id = randomUUID(); this.emailEvents.set(id, { ...event, id, sentAt: new Date().toISOString() }); }
  async getEmailEventsByType(emailType: string): Promise<any[]> { return Array.from(this.emailEvents.values()).filter(event => event.emailType === emailType); }
  async hasEmailBeenSent(emailType: string, relatedId: string): Promise<boolean> { return Array.from(this.emailEvents.values()).some(event => event.emailType === emailType && event.relatedId === relatedId); }
  async getReorderCandidates(daysBack?: number): Promise<any[]> { return []; }
  async createReferral(referral: any): Promise<any> { const id = randomUUID(); const newReferral = { ...referral, id, createdAt: new Date().toISOString() }; this.referrals.set(id, newReferral); return newReferral; }
  async getReferralByCode(code: string): Promise<any | undefined> { return Array.from(this.referrals.values()).find(ref => ref.code === code); }
  async getReferralByReferrerId(referrerId: string): Promise<any | undefined> { return Array.from(this.referrals.values()).find(ref => ref.referrerId === referrerId); }
  async updateReferralUsageCount(id: string, count: number): Promise<any | undefined> { const referral = this.referrals.get(id); if (!referral) return undefined; const updated = { ...referral, usedCount: count }; this.referrals.set(id, updated); return updated; }
  async createReferralClaim(claim: any): Promise<any> { const id = randomUUID(); const newClaim = { ...claim, id, claimedAt: new Date().toISOString() }; this.referralClaims.set(id, newClaim); return newClaim; }
  async getReferralClaimsByReferralId(referralId: string): Promise<any[]> { return Array.from(this.referralClaims.values()).filter(claim => claim.referralId === referralId); }
  async createSupportTicket(ticket: any): Promise<any> { const id = randomUUID(); const newTicket = { ...ticket, id, status: ticket.status || 'open', priority: ticket.priority || 'medium', category: ticket.category || 'general', createdAt: new Date().toISOString() }; this.supportTickets.set(id, newTicket); return newTicket; }
  async getSupportTicket(id: string): Promise<any | undefined> { return this.supportTickets.get(id); }
  async getSupportTicketsByUserId(userId: string): Promise<any[]> { return Array.from(this.supportTickets.values()).filter(ticket => ticket.userId === userId); }
  async getSupportTicketsByEmail(email: string): Promise<any[]> { return Array.from(this.supportTickets.values()).filter(ticket => ticket.email === email); }
  async updateSupportTicket(id: string, updates: any): Promise<any | undefined> { const ticket = this.supportTickets.get(id); if (!ticket) return undefined; const updated = { ...ticket, ...updates, updatedAt: new Date().toISOString() }; this.supportTickets.set(id, updated); return updated; }
  async getAllSupportTickets(): Promise<any[]> { return Array.from(this.supportTickets.values()); }
  async createChatSession(session: any): Promise<any> { const id = randomUUID(); const newSession = { ...session, id, createdAt: new Date().toISOString() }; this.chatSessions.set(id, newSession); return newSession; }
  async getChatSession(id: string): Promise<any | undefined> { return this.chatSessions.get(id); }
  async getChatSessionByToken(token: string): Promise<any | undefined> { return Array.from(this.chatSessions.values()).find(session => session.sessionToken === token); }
  async getChatSessionsByUserId(userId: string): Promise<any[]> { return Array.from(this.chatSessions.values()).filter(session => session.userId === userId); }
  async updateChatSession(id: string, updates: any): Promise<any | undefined> { const session = this.chatSessions.get(id); if (!session) return undefined; const updated = { ...session, ...updates, updatedAt: new Date().toISOString() }; this.chatSessions.set(id, updated); return updated; }
}

// Import DrizzleStorage for database persistence
import { storage as drizzleStorage } from "./drizzleStorage";

// Export the storage instance - using DrizzleStorage for database persistence
export const storage = drizzleStorage;