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
      ...insertProduct, 
      id,
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

    const newQuantity = Math.max(0, product.stockQuantity - quantity);
    return this.updateProductStock(productId, newQuantity);
  }

  // Additional methods would continue from the original file...
  // [Rest of the implementation methods would be copied from the intact parts of the original file]
}