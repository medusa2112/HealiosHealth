import { type Product, type InsertProduct, type Newsletter, type InsertNewsletter, type PreOrder, type InsertPreOrder, type Article, type InsertArticle, type Order, type InsertOrder, type StockAlert, type InsertStockAlert, type QuizResult, type InsertQuizResult } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProductStock(productId: string, quantity: number): Promise<Product | undefined>;
  decreaseProductStock(productId: string, quantity: number): Promise<Product | undefined>;
  
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
}

export class MemStorage implements IStorage {
  private products: Map<string, Product>;
  private newsletters: Map<string, Newsletter>;
  private preOrders: Map<string, PreOrder>;
  private articles: Map<string, Article>;
  private orders: Map<string, Order>;
  private stockAlerts: Map<string, StockAlert>;
  private quizResults: Map<string, QuizResult>;

  constructor() {
    this.products = new Map();
    this.newsletters = new Map();
    this.preOrders = new Map();
    this.articles = new Map();
    this.orders = new Map();
    this.stockAlerts = new Map();
    this.quizResults = new Map();
    this.seedData();
  }

  private seedData() {
    const sampleProducts: Product[] = [
      // Healios Products matching frontend
      {
        id: "apple-cider-vinegar",
        name: "Apple Cider Vinegar Gummies (Strawberry Flavour)",
        description: "Daily metabolic & gut support with 500mg concentrated Apple Cider Vinegar powder per gummy. Stomach-friendly format without the burn or enamel erosion.",
        price: "1000.00",
        originalPrice: null,
        imageUrl: "/assets/Apple Cider Vinegar_1753615197742.png",
        category: "Gummies",
        rating: "4.8",
        reviewCount: 23,
        inStock: false,
        stockQuantity: 0,
        featured: true,
        sizes: null,
        colors: null,
        gender: null,
        type: 'supplement',
        bottleCount: 60,
        dailyDosage: 2,
        supplyDays: 30,
      },
      {
        id: "vitamin-d3",
        name: "Vitamin D3 4000 IU Gummies (Lemon Flavour)",
        description: "Daily immune & bone support with 4000 IU vitamin D3 in delicious lemon-flavored gummies for adults and teens 12+. Our bestselling high-potency vitamin D formula.",
        price: "1000.00",
        originalPrice: null,
        imageUrl: "/assets/Vitamin D3  4000 IU_1754056731371.png",
        category: "Vitamins",
        rating: "4.9",
        reviewCount: 31,
        inStock: false,
        stockQuantity: 0,
        featured: true,
        sizes: null,
        colors: null,
        gender: null,
        type: 'supplement',
        bottleCount: 60,
        dailyDosage: 1,
        supplyDays: 60,
      },
      {
        id: "ashwagandha",
        name: "KSM-66® Ashwagandha Capsules 500mg",  
        description: "A powerful full-spectrum adaptogen using clinically validated KSM-66® extract to support stress resilience, energy, and hormonal balance. 500mg per capsule, suitable for vegetarians and vegans.",
        price: "1000.00",
        originalPrice: null,
        imageUrl: "/assets/KSM-66® Ashwagandha_1754156555866.png",
        category: "Adaptogens",
        rating: "4.7",
        reviewCount: 15,
        inStock: false,
        stockQuantity: 0,
        featured: true,
        sizes: null,
        colors: null,
        gender: null,
        type: 'supplement',
        bottleCount: 60,
        dailyDosage: 1,
        supplyDays: 60,
      },
      {
        id: "probiotics",
        name: "Probiotic Complex (10 Billion CFU)",
        description: "Premium gut health support with 10 billion CFU multi-strain probiotic complex in advanced capsule format with delayed-release technology for optimal digestive wellness and immune support.",
        price: "1000.00",
        originalPrice: null,
        imageUrl: "/assets/Probiotics10Bil-X_1753615874344.png",
        category: "Probiotics",
        rating: "4.7",
        reviewCount: 37,
        inStock: false,
        stockQuantity: 0,
        featured: true,
        sizes: null,
        colors: null,
        gender: null,
        type: 'supplement',
        bottleCount: 30,
        dailyDosage: 1,
        supplyDays: 30,
      },
      {
        id: "magnesium",
        name: "Magnesium (Citrate/Glycinate) Gummies (Berry Flavour)",
        description: "Support for muscles, mind & energy with bioavailable magnesium citrate and glycinate per gummy. Gentle chewable dose for fatigue reduction and electrolyte balance.",
        price: "1000.00",
        originalPrice: null,
        imageUrl: "/assets/Magnesium_1753615197741.png",
        category: "Minerals",
        rating: "4.7",
        reviewCount: 28,
        inStock: false,
        stockQuantity: 0,
        featured: true,
        sizes: null,
        colors: null,
        gender: null,
        type: 'supplement',
        bottleCount: 60,
        dailyDosage: 2,
        supplyDays: 30,
      },
      {
        id: "childrens-multivitamin",
        name: "Kids Multivitamin & Mineral Gummies – 150 count (Vegan Berry Gummies)",
        description: "A tasty and convenient way to support your child's daily nutrition. These vegan gummies are packed with vitamins A, C, D, B-complex, zinc, and more — supporting energy, immunity, and focus. Ages 3-8: 1 gummy daily, Ages 9+: 2 gummies daily.",
        price: "1000.00",
        originalPrice: null,
        imageUrl: "/assets/Multivitamin for Kids_1753615197742.png",
        category: "Children",
        rating: "4.8",
        reviewCount: 12,
        inStock: false,
        stockQuantity: 0,
        featured: true,
        sizes: null,
        colors: null,
        gender: null,
        type: 'supplement',
        bottleCount: 150,
        dailyDosage: 1,
        supplyDays: 150,
      },
      {
        id: "probiotic-vitamins",
        name: "Probiotic + Vitamins Gummies",
        description: "Digestive balance meets energy & immunity – all in one pineapple-flavored gummy with 3-strain probiotic blend and essential B & C vitamins.",
        price: "1000.00",
        originalPrice: null,
        imageUrl: "/assets/Porbiotic_Vitamins_1753615197742.png",
        category: "Probiotics",
        rating: "4.7",
        reviewCount: 41,
        inStock: false,
        stockQuantity: 0,
        featured: true,
        sizes: null,
        colors: null,
        gender: null,
        type: 'supplement',
        bottleCount: 60,
        dailyDosage: 2,
        supplyDays: 30,
      },
      {
        id: "collagen-complex",
        name: "Collagen + C + Zinc + Selenium Gummies (Orange Flavour)",
        description: "Daily skin, hair & nail support with 500mg hydrolysed collagen peptides plus antioxidant vitamins C, E, biotin and selenium in delicious orange-flavored gummies.",
        price: "1000.00",
        originalPrice: null,
        imageUrl: "/assets/Collagen Complex__1753615197742.png",
        category: "Beauty",
        rating: "4.6",
        reviewCount: 19,
        inStock: false,
        stockQuantity: 0,
        featured: true,
        sizes: null,
        colors: null,
        gender: null,
        type: 'supplement',
        bottleCount: 60,
        dailyDosage: 2,
        supplyDays: 30,
      },
      {
        id: "biotin-5000",
        name: "Biotin 10,000 µg Strawberry Gummies",
        description: "High-potency hair, skin & nail support with 10,000µg biotin (20,000% NRV) in delicious strawberry-flavored gummies. Just one gummy a day for optimal beauty support.",
        price: "1000.00",
        originalPrice: null,
        imageUrl: "/assets/Biton_1753616500658.png",
        category: "Beauty",
        rating: "4.5",
        reviewCount: 8,
        inStock: false,
        stockQuantity: 0,
        featured: true,
        sizes: null,
        colors: null,
        gender: null,
        type: 'supplement',
        bottleCount: 60,
        dailyDosage: 1,
        supplyDays: 60,
      },
      {
        id: "iron-vitamin-c",
        name: "Iron + Vitamin C Gummies (Cherry Flavour)",
        description: "Gentle daily support for energy, focus & iron absorption with 7mg iron and 40mg vitamin C. Bioavailable formula for reduced fatigue and healthy red blood cell formation.",
        price: "1000.00",
        originalPrice: null,
        imageUrl: "/assets/Iron + Vitamin C_1753616520150.png",
        category: "Minerals",
        rating: "4.6",
        reviewCount: 34,
        inStock: false,
        stockQuantity: 0,
        featured: true,
        sizes: null,
        colors: null,
        gender: null,
        type: 'supplement',
        bottleCount: 60,
        dailyDosage: 1,
        supplyDays: 60,
      },
      {
        id: "folic-acid-400",
        name: "Folic Acid 400µg Gummies (Berry Flavour)",
        description: "Pre-pregnancy & prenatal support with 400µg folic acid for maternal tissue growth and neural tube development. NHS-recommended dose in convenient berry-flavored gummies.",
        price: "1000.00",
        originalPrice: null,
        imageUrl: "/assets/Folic Acid 400µg_1753616520150.png",
        category: "Prenatal",
        rating: "4.8",
        reviewCount: 26,
        inStock: false,
        stockQuantity: 0,
        featured: true,
        sizes: null,
        colors: null,
        gender: null,
        type: 'supplement',
        bottleCount: 60,
        dailyDosage: 1,
        supplyDays: 60,
      },
      {
        id: "mind-memory-mushroom",
        name: "Mind & Memory Mushroom - Lion's Mane Gummies (2000mg)",
        description: "Powerful daily support for brain health, focus, and cognition with 200mg 10:1 Lion's Mane extract (equivalent to 2000mg dried). Premium nootropic benefits in delicious berry-flavored vegan gummies.",
        price: "1000.00",
        originalPrice: null,
        imageUrl: "/assets/Lion's Mane Gummies (2000mg)_1754125996287.png",
        category: "Mushrooms",
        rating: "4.9",
        reviewCount: 7,
        inStock: false,
        stockQuantity: 0,
        featured: true,
        sizes: null,
        colors: null,
        gender: null,
        type: 'supplement',
        bottleCount: 60,
        dailyDosage: 2,
        supplyDays: 30,
      },
      {
        id: "collagen-powder",
        name: "Premium Collagen Powder (Unflavoured)",
        description: "Pure hydrolysed marine collagen peptides for skin, hair, nail and joint support. Easily dissolves in hot or cold drinks with no taste or texture. Type I & III collagen for maximum bioavailability.",
        price: "1000.00",
        originalPrice: null,
        imageUrl: "/assets/HaloGlowB_1754157621693.png",
        category: "Beauty",
        rating: "4.8",
        reviewCount: 39,
        inStock: false,
        stockQuantity: 0,
        featured: true,
        sizes: null,
        colors: null,
        gender: null,
        type: 'supplement',
        bottleCount: 30,
        dailyDosage: 1,
        supplyDays: 30,
      },
      {
        id: "bio-cultures-vitamin-plus",
        name: "Gut + Mind + Energy Vitamin Plus Gummies (Pineapple Flavour)",
        description: "A high-potency vegan gummy combining 3 strains of friendly bacteria (400M CFU) with essential B-vitamins and vitamin C — supporting energy, psychological function, and the immune system. Perfect for both adults and kids aged 3+.",
        price: "1000.00",
        originalPrice: null,
        imageUrl: "/assets/Bio-Cultures Vitamin Plus Gummies_1754131929638.png",
        category: "Probiotics",
        rating: "4.9",
        reviewCount: 21,
        inStock: false,
        stockQuantity: 0,
        featured: true,
        sizes: null,
        colors: null,
        gender: null,
        type: 'supplement',
        bottleCount: 150,
        dailyDosage: 2,
        supplyDays: 75,
      },
      {
        id: "healios-oversized-tee",
        name: "Healios Oversized Tee - Bubble Print",
        description: "Premium oversized tee featuring bubble puff print technology. Customize your look with your choice of base tee color (Black or White) and puff print color. The front features our iconic Healios HealthClub -1984- logo, while you can personalize the back with your own puff design. Perfect for expressing your wellness lifestyle in comfort and style.",
        price: "750.00",
        originalPrice: null,
        imageUrl: "/assets/Healios Oversized Tee_1754228108976.png",
        category: "Apparel",
        rating: "4.7",
        reviewCount: 8,
        inStock: true,
        stockQuantity: 50,
        featured: true,
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        colors: ["Black", "White"],
        gender: "unisex",
        type: 'apparel',
        bottleCount: null,
        dailyDosage: null,
        supplyDays: null,
      },

    ];

    sampleProducts.forEach(product => {
      this.products.set(product.id, product);
    });
  }

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
      product => product.category.toLowerCase() === category.toLowerCase()
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { 
      ...insertProduct, 
      id,
      rating: insertProduct.rating || "5.0",
      reviewCount: insertProduct.reviewCount || 0,
      inStock: insertProduct.inStock ?? true,
      stockQuantity: insertProduct.stockQuantity ?? 0,
      featured: insertProduct.featured || false,
      originalPrice: insertProduct.originalPrice || null,
      sizes: insertProduct.sizes || null,
      colors: insertProduct.colors || null,
      gender: insertProduct.gender || null,
      type: insertProduct.type || 'supplement',
      bottleCount: insertProduct.bottleCount ?? null,
      dailyDosage: insertProduct.dailyDosage ?? null,
      supplyDays: insertProduct.supplyDays ?? null,
    };
    this.products.set(id, product);
    return product;
  }

  async updateProductStock(productId: string, quantity: number): Promise<Product | undefined> {
    const product = this.products.get(productId);
    if (!product) return undefined;
    
    const updatedProduct = {
      ...product,
      stockQuantity: quantity,
      inStock: quantity > 0
    };
    this.products.set(productId, updatedProduct);
    return updatedProduct;
  }

  async decreaseProductStock(productId: string, quantity: number): Promise<Product | undefined> {
    const product = this.products.get(productId);
    if (!product) return undefined;
    
    const currentStock = product.stockQuantity || 0;
    const newQuantity = Math.max(0, currentStock - quantity);
    const updatedProduct = {
      ...product,
      stockQuantity: newQuantity,
      inStock: newQuantity > 0
    };
    this.products.set(productId, updatedProduct);
    
    // Check if we need to create a stock alert
    if (newQuantity <= 3 && newQuantity > 0) {
      await this.createStockAlert({
        productId: product.id,
        productName: product.name,
        currentStock: newQuantity,
        threshold: 3,
        alertSent: false
      });
    }
    
    return updatedProduct;
  }

  async subscribeToNewsletter(insertNewsletter: InsertNewsletter): Promise<Newsletter> {
    const existing = await this.getNewsletterSubscription(insertNewsletter.email);
    if (existing) {
      return existing;
    }

    const id = randomUUID();
    const newsletter: Newsletter = {
      ...insertNewsletter,
      id,
      birthday: insertNewsletter.birthday || null,
      subscribedAt: new Date().toISOString(),
    };
    this.newsletters.set(insertNewsletter.email, newsletter);
    return newsletter;
  }

  async getNewsletterSubscription(email: string): Promise<Newsletter | undefined> {
    return this.newsletters.get(email);
  }

  async createPreOrder(preOrder: InsertPreOrder): Promise<PreOrder> {
    const id = randomUUID();
    const newPreOrder: PreOrder = {
      ...preOrder,
      id,
      quantity: preOrder.quantity ?? 1,
      notes: preOrder.notes ?? null,
      customerPhone: preOrder.customerPhone ?? null,
      status: preOrder.status ?? 'pending',
      createdAt: new Date().toISOString(),
    };
    this.preOrders.set(id, newPreOrder);
    return newPreOrder;
  }

  async getPreOrders(): Promise<PreOrder[]> {
    return Array.from(this.preOrders.values());
  }

  async getPreOrdersByProduct(productId: string): Promise<PreOrder[]> {
    return Array.from(this.preOrders.values()).filter(preOrder => preOrder.productId === productId);
  }

  // Article methods
  async getArticles(): Promise<Article[]> {
    return Array.from(this.articles.values())
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
  }

  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    return Array.from(this.articles.values()).find(article => article.slug === slug);
  }

  async getArticlesByCategory(category: string): Promise<Article[]> {
    return Array.from(this.articles.values())
      .filter(article => article.category === category)
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const id = randomUUID();
    const article: Article = {
      id,
      title: insertArticle.title,
      slug: insertArticle.slug,
      metaDescription: insertArticle.metaDescription,
      content: insertArticle.content,
      research: insertArticle.research || null,
      sources: insertArticle.sources || null,
      category: insertArticle.category || null,
      author: insertArticle.author || null,
      readTime: insertArticle.readTime || null,
      published: insertArticle.published || null,
      createdAt: new Date().toISOString(),
    };
    this.articles.set(id, article);
    return article;
  }

  async getLatestArticles(limit: number): Promise<Article[]> {
    const articles = await this.getArticles();
    return articles.slice(0, limit);
  }

  // Order methods
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = {
      id,
      customerEmail: insertOrder.customerEmail,
      customerName: insertOrder.customerName || null,
      customerPhone: insertOrder.customerPhone || null,
      shippingAddress: insertOrder.shippingAddress,
      billingAddress: insertOrder.billingAddress || null,
      orderItems: insertOrder.orderItems,
      totalAmount: insertOrder.totalAmount,
      currency: insertOrder.currency || null,
      paymentStatus: insertOrder.paymentStatus || null,
      orderStatus: insertOrder.orderStatus || null,
      stripePaymentIntentId: insertOrder.stripePaymentIntentId || null,
      trackingNumber: insertOrder.trackingNumber || null,
      notes: insertOrder.notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.orders.set(id, order);
    return order;
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByEmail(email: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.customerEmail === email);
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order | undefined> {
    const order = this.orders.get(orderId);
    if (!order) return undefined;
    
    const updatedOrder = {
      ...order,
      orderStatus: status,
      updatedAt: new Date().toISOString()
    };
    this.orders.set(orderId, updatedOrder);
    return updatedOrder;
  }

  async updatePaymentStatus(orderId: string, status: string): Promise<Order | undefined> {
    const order = this.orders.get(orderId);
    if (!order) return undefined;
    
    const updatedOrder = {
      ...order,
      paymentStatus: status,
      updatedAt: new Date().toISOString()
    };
    this.orders.set(orderId, updatedOrder);
    return updatedOrder;
  }

  // Stock Alert methods
  async createStockAlert(insertAlert: InsertStockAlert): Promise<StockAlert> {
    // Check if alert already exists for this product
    const existingAlert = Array.from(this.stockAlerts.values()).find(
      alert => alert.productId === insertAlert.productId && !alert.alertSent
    );
    
    if (existingAlert) {
      return existingAlert;
    }
    
    const id = randomUUID();
    const alert: StockAlert = {
      id,
      productId: insertAlert.productId,
      productName: insertAlert.productName,
      currentStock: insertAlert.currentStock,
      threshold: insertAlert.threshold || null,
      alertSent: insertAlert.alertSent || null,
      createdAt: new Date().toISOString(),
    };
    this.stockAlerts.set(id, alert);
    return alert;
  }

  async getStockAlerts(): Promise<StockAlert[]> {
    return Array.from(this.stockAlerts.values());
  }

  async markAlertSent(alertId: string): Promise<void> {
    const alert = this.stockAlerts.get(alertId);
    if (alert) {
      this.stockAlerts.set(alertId, { ...alert, alertSent: true });
    }
  }

  // Quiz Results
  async createQuizResult(quizResultData: InsertQuizResult): Promise<QuizResult> {
    const quizResult: QuizResult = {
      id: randomUUID(),
      email: quizResultData.email,
      firstName: quizResultData.firstName,
      lastName: quizResultData.lastName,
      consentToMarketing: quizResultData.consentToMarketing || false,
      answers: quizResultData.answers,
      recommendations: quizResultData.recommendations,
      createdAt: new Date().toISOString()
    };
    
    this.quizResults.set(quizResult.id, quizResult);
    return quizResult;
  }

  async getQuizResults(): Promise<QuizResult[]> {
    return Array.from(this.quizResults.values());
  }
}

export const storage = new MemStorage();
