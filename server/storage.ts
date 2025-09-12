import { type Product, type InsertProduct, type ProductVariant, type InsertProductVariant, type Newsletter, type InsertNewsletter, type PreOrder, type InsertPreOrder, type Article, type InsertArticle, type Order, type InsertOrder, type StockAlert, type InsertStockAlert, type QuizResult, type InsertQuizResult, type ConsultationBooking, type InsertConsultationBooking, type RestockNotification, type InsertRestockNotification, type User, type InsertUser, type UpsertUser, type Address, type InsertAddress, type OrderItem, type InsertOrderItem, type Cart, type InsertCart, type DiscountCode, type InsertDiscountCode, type Subscription, type InsertSubscription, type SecurityIssue, type InsertSecurityIssue } from "@shared/schema";
import { randomUUID } from "crypto";
import { mockSecurityIssues } from "./security-seed";
import { hashPassword, verifyPassword } from "./lib/password";

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
  
  // Admin Order methods
  getAllOrders(): Promise<Order[]>;
  // DEPRECATED - Stripe methods removed for PayStack migration
  getOrderByPaystackReference(reference: string): Promise<Order | undefined>;
  updateOrderRefundStatus(orderId: string, status: string): Promise<Order | undefined>;
  
  // Admin User methods
  getAllUsers(): Promise<User[]>;
  
  // Cart methods (Phase 7: Abandoned Cart Tracking)
  upsertCart(cart: Partial<InsertCart> & { sessionToken: string }): Promise<Cart>;
  getCartById(id: string): Promise<Cart | undefined>;
  getCartBySessionToken(sessionToken: string): Promise<Cart | undefined>;
  markCartAsConverted(cartId: string, paystackReference?: string): Promise<Cart | undefined>;
  getAllCarts(): Promise<Cart[]>;
  
  // Phase 8: Guest to User conversion
  linkGuestOrdersToUser(email: string, userId: string): Promise<void>;
  
  
  // Phase 15: Discount codes
  getDiscountCodes(): Promise<DiscountCode[]>;
  getDiscountCodeByCode(code: string): Promise<DiscountCode | undefined>;
  createDiscountCode(discountCode: InsertDiscountCode): Promise<DiscountCode>;
  updateDiscountCode(id: string, updates: Partial<DiscountCode>): Promise<DiscountCode | undefined>;
  deleteDiscountCode(id: string): Promise<boolean>;
  validateDiscountCode(code: string): Promise<{ valid: boolean; discount?: DiscountCode; error?: string }>;
  incrementDiscountCodeUsage(id: string): Promise<void>;
  

  // Phase 18: Subscriptions
  getUserSubscriptions(userId: string): Promise<Subscription[]>;
  getSubscription(id: string): Promise<Subscription | undefined>;
  getSubscriptions(): Promise<Subscription[]>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription | undefined>;
  updateSubscriptionStatus(id: string, status: string): Promise<Subscription | undefined>;
  getAllSubscriptions(): Promise<Subscription[]>;
  getSubscriptionByPaystackId(paystackSubscriptionId: string): Promise<Subscription | undefined>;
  
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
  
  // Note: Email automation methods removed per business requirements
  
  // Admin role management
  updateUserRole(userId: string, role: 'admin' | 'customer'): Promise<void>;
  
  // Password Authentication Methods
  // Security: All email comparisons are case-insensitive (normalized to lowercase)
  // createUserWithPassword: Throws error if email already exists
  // setPassword: Expects pre-hashed password value for security
  // verifyUserPassword: Returns null for any invalid credentials to prevent enumeration
  createUserWithPassword(data: { email: string; firstName: string; lastName: string; password: string }): Promise<User>;
  setPassword(userId: string, hash: string): Promise<User | undefined>;
  verifyUserPassword(email: string, password: string): Promise<User | null>;
  
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
  private discountCodes: Map<string, DiscountCode>; // Phase 15
  private subscriptions: Map<string, Subscription>; // Phase 18
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
    this.discountCodes = new Map(); // Phase 15
    this.subscriptions = new Map(); // Phase 18
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
    this.seedDiscountCodes(); // Phase 15
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



  private seedDiscountCodes() {
    const sampleCodes: DiscountCode[] = [];

    sampleCodes.forEach(code => {
      this.discountCodes.set(code.id, code);
    });
  }


  private seedUsers() {
    const testUsers: User[] = [];

    // Add demo admin user for development
    if (process.env.NODE_ENV === 'development') {
      const demoAdmin: User = {
        id: 'admin-user-id',
        email: 'admin@healios.dev',
        passwordHash: null,
        role: 'admin',
        firstName: 'Admin',
        lastName: 'Demo',
        paystackCustomerCode: null,
        paystackCustomerId: null,
        // DEPRECATED: stripeCustomerId removed for PayStack migration
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
      version: 0,
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
      // DEPRECATED: Stripe fields removed for PayStack migration
      stripeSessionId: null,
      paymentMethod: order.paymentMethod ?? null,
      paystackReference: order.paystackReference ?? null,
      paystackAccessCode: order.paystackAccessCode ?? null,
      discountAmount: order.discountAmount ?? null,
      taxAmount: order.taxAmount ?? null,
      shippingCost: order.shippingCost ?? null,
      metadata: order.metadata ?? null,
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
  async getOrdersByEmail(email: string): Promise<Order[]> { 
    const normalizedEmail = email.toLowerCase(); // Security: Case-insensitive email lookup
    return Array.from(this.orders.values()).filter(order => order.customerEmail === normalizedEmail); 
  }
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
      passwordHash: null,
      role: user.role || 'customer',
      paystackCustomerCode: null,
      paystackCustomerId: null,
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
  async getUserByEmail(email: string): Promise<User | undefined> { 
    const normalizedEmail = email.toLowerCase(); // Security: Case-insensitive email lookup
    return Array.from(this.users.values()).find(u => u.email === normalizedEmail); 
  }
  async createUser(user: InsertUser): Promise<User> { 
    const id = randomUUID(); 
    const newUser: User = { 
      id,
      email: user.email,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      passwordHash: user.passwordHash ?? null,
      role: user.role ?? 'customer',
      paystackCustomerCode: user.paystackCustomerCode ?? null,
      paystackCustomerId: user.paystackCustomerId ?? null,
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
      zipCode: address.zipCode ?? null,
      state: address.state ?? null,
      isDefault: address.isDefault ?? null,
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
  async getAllUsers(): Promise<User[]> { return Array.from(this.users.values()); }
  async getAllCarts(): Promise<Cart[]> { return Array.from(this.carts.values()); }
  async getOrderByPaystackReference(reference: string): Promise<Order | undefined> { return Array.from(this.orders.values()).find(order => order.paystackReference === reference); }
  async updateOrderRefundStatus(orderId: string, status: string): Promise<Order | undefined> { const order = this.orders.get(orderId); if (!order) return undefined; const updated = { ...order, refundStatus: status, updatedAt: new Date().toISOString() }; this.orders.set(orderId, updated); return updated; }
  async upsertCart(cart: Partial<InsertCart> & { sessionToken: string }): Promise<Cart> { 
    const existing = Array.from(this.carts.values()).find(c => c.sessionToken === cart.sessionToken); 
    if (existing) { 
      const updated = { ...existing, ...cart, lastUpdated: new Date().toISOString() }; 
      this.carts.set(existing.id, updated); 
      return updated; 
    } 
    const id = randomUUID(); 
    const newCart: Cart = { 
      ...cart, 
      id, 
      userId: cart.userId || null,
      items: cart.items || '[]',
      totalAmount: cart.totalAmount || null,
      currency: cart.currency || 'ZAR',
      paystackReference: cart.paystackReference ?? null,
      convertedToOrder: false,
      stripeSessionId: null,
      createdAt: new Date().toISOString(), 
      lastUpdated: new Date().toISOString() 
    }; 
    this.carts.set(id, newCart); 
    return newCart; 
  }
  async getCartById(id: string): Promise<Cart | undefined> { return this.carts.get(id); }
  async getCartBySessionToken(sessionToken: string): Promise<Cart | undefined> { return Array.from(this.carts.values()).find(cart => cart.sessionToken === sessionToken); }
  async markCartAsConverted(cartId: string, paystackReference?: string): Promise<Cart | undefined> { const cart = this.carts.get(cartId); if (!cart) return undefined; const updated = { ...cart, convertedToOrder: true, paystackReference: paystackReference ?? cart.paystackReference, lastUpdated: new Date().toISOString() }; this.carts.set(cartId, updated); return updated; }
  async linkGuestOrdersToUser(email: string, userId: string): Promise<void> { Array.from(this.orders.values()).forEach(order => { if (order.customerEmail === email && !order.userId) { this.orders.set(order.id, { ...order, userId }); } }); }
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
  async validateDiscountCode(code: string): Promise<{ valid: boolean; discount?: DiscountCode; error?: string }> { const discount = await this.getDiscountCodeByCode(code); if (!discount) return { valid: false, error: 'Code not found' }; if (!discount.isActive) return { valid: false, error: 'Code inactive' }; if (discount.usageLimit && (discount.usageCount || 0) >= discount.usageLimit) return { valid: false, error: 'Usage limit exceeded' }; if (discount.expiresAt && new Date() > new Date(discount.expiresAt)) return { valid: false, error: 'Code expired' }; return { valid: true, discount }; }
  async incrementDiscountCodeUsage(id: string): Promise<void> { const code = this.discountCodes.get(id); if (code) { this.discountCodes.set(id, { ...code, usageCount: (code.usageCount ?? 0) + 1 }); } }
  async getUserSubscriptions(userId: string): Promise<Subscription[]> { return Array.from(this.subscriptions.values()).filter(sub => sub.userId === userId); }
  async getSubscription(id: string): Promise<Subscription | undefined> { return this.subscriptions.get(id); }
  async createSubscription(subscription: InsertSubscription): Promise<Subscription> { 
    const id = randomUUID(); 
    const newSub: Subscription = { 
      id,
      userId: subscription.userId,
      productVariantId: subscription.productVariantId,
      variantId: subscription.variantId ?? null,
      paystackSubscriptionId: subscription.paystackSubscriptionId ?? null,
      paystackCustomerId: subscription.paystackCustomerId ?? null,
      paystackPlanId: subscription.paystackPlanId ?? null,
      stripeSubscriptionId: subscription.stripeSubscriptionId ?? null,
      stripeCustomerId: subscription.stripeCustomerId ?? null,
      status: subscription.status ?? null,
      quantity: subscription.quantity ?? null,
      interval: subscription.interval ?? null,
      intervalDays: subscription.intervalDays,
      pricePerUnit: subscription.pricePerUnit ?? null,
      currentPeriodStart: subscription.currentPeriodStart ?? null,
      currentPeriodEnd: subscription.currentPeriodEnd ?? null,
      cancelAt: subscription.cancelAt ?? null,
      canceledAt: subscription.canceledAt ?? null,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd ?? null,
      startDate: new Date().toISOString(),
      metadata: subscription.metadata ?? null
    }; 
    this.subscriptions.set(id, newSub); 
    return newSub; 
  }
  async updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription | undefined> { const sub = this.subscriptions.get(id); if (!sub) return undefined; const updated = { ...sub, ...updates }; this.subscriptions.set(id, updated); return updated; }
  async getAllSubscriptions(): Promise<Subscription[]> { return Array.from(this.subscriptions.values()); }
  async getSubscriptions(): Promise<Subscription[]> { return Array.from(this.subscriptions.values()); }
  async updateSubscriptionStatus(id: string, status: string): Promise<Subscription | undefined> { 
    const sub = this.subscriptions.get(id); 
    if (!sub) return undefined; 
    const updated = { ...sub, status }; 
    this.subscriptions.set(id, updated); 
    return updated; 
  }
  async getSubscriptionByPaystackId(paystackSubscriptionId: string): Promise<Subscription | undefined> { 
    return Array.from(this.subscriptions.values()).find(sub => sub.paystackSubscriptionId === paystackSubscriptionId); 
  }
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
  async archiveSecurityIssue(id: string, archivedBy: string): Promise<SecurityIssue | undefined> { const issue = this.securityIssues.get(id); if (!issue) return undefined; const updated = { ...issue, fixed: true }; this.securityIssues.set(id, updated); return updated; }
  async unarchiveSecurityIssue(id: string): Promise<SecurityIssue | undefined> { const issue = this.securityIssues.get(id); if (!issue) return undefined; const updated = { ...issue, fixed: false }; this.securityIssues.set(id, updated); return updated; }
  async getArchivedSecurityIssues(): Promise<SecurityIssue[]> { return Array.from(this.securityIssues.values()).filter(issue => issue.fixed); }
  async recordFixAttempt(issueId: string, attempt: any): Promise<any> { const id = randomUUID(); const fixAttempt = { ...attempt, id, issueId, createdAt: new Date().toISOString() }; this.fixAttempts.set(id, fixAttempt); return fixAttempt; }
  async getFixAttempts(issueId: string): Promise<any[]> { return Array.from(this.fixAttempts.values()).filter(attempt => attempt.issueId === issueId); }
  async getSecurityIssueById(id: string): Promise<SecurityIssue | undefined> { return this.securityIssues.get(id); }
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

  // Password Authentication Methods Implementation
  async createUserWithPassword(data: { email: string; firstName: string; lastName: string; password: string }): Promise<User> {
    const normalizedEmail = data.email.toLowerCase(); // Security: Normalize email
    
    // Security: Check for existing user with same email (case-insensitive)
    const existingUser = await this.getUserByEmail(normalizedEmail);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    const passwordHash = await hashPassword(data.password);
    const id = randomUUID();
    const user: User = {
      id,
      email: normalizedEmail,
      firstName: data.firstName,
      lastName: data.lastName,
      passwordHash,
      role: 'customer', // Security: Default to customer role
      paystackCustomerCode: null,
      paystackCustomerId: null,
      emailVerified: null,
      verificationCodeHash: null,
      verificationExpiresAt: null,
      verificationAttempts: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.set(id, user);
    return user;
  }

  // Security: Expects pre-hashed password value for secure storage
  async setPassword(userId: string, hash: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      passwordHash: hash,
      updatedAt: new Date().toISOString(),
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Security: Returns null for any invalid credentials to prevent user enumeration
  // All timing should be consistent regardless of whether user exists or password is wrong
  async verifyUserPassword(email: string, password: string): Promise<User | null> {
    const normalizedEmail = email.toLowerCase(); // Security: Case-insensitive lookup
    const user = Array.from(this.users.values()).find(u => u.email === normalizedEmail);
    
    // Security: Always perform password verification even if user doesn't exist
    // This prevents timing attacks that could reveal user existence
    if (!user || !user.passwordHash) {
      // Still hash the password to maintain consistent timing
      await hashPassword(password).catch(() => {});
      return null; // Security: Always return null for invalid credentials
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    return isValid ? user : null; // Security: Return null for invalid credentials
  }
}

// Use in-memory storage (drizzleStorage was removed during legacy cleanup)
export const storage = new MemStorage();