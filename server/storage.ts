import { type Product, type InsertProduct, type Newsletter, type InsertNewsletter, type PreOrder, type InsertPreOrder, type Article, type InsertArticle, type Order, type InsertOrder, type StockAlert, type InsertStockAlert, type QuizResult, type InsertQuizResult, type ConsultationBooking, type InsertConsultationBooking } from "@shared/schema";
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
  
  // Consultation Bookings
  createConsultationBooking(booking: InsertConsultationBooking): Promise<ConsultationBooking>;
  getConsultationBookings(): Promise<ConsultationBooking[]>;
}

export class MemStorage implements IStorage {
  private products: Map<string, Product>;
  private newsletters: Map<string, Newsletter>;
  private preOrders: Map<string, PreOrder>;
  private consultationBookings: Map<string, ConsultationBooking>;
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
    this.consultationBookings = new Map();
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
        name: "Healios HealthClub Oversized Tee",
        description: "Premium oversized black tee featuring the iconic 'HEALIOS HEALTHCLUB -1984-' design on the back in pink bubble lettering. Made from high-quality cotton blend for ultimate comfort and durability. Perfect for expressing your wellness lifestyle with retro-inspired style.",
        price: "750.00",
        originalPrice: null,
        imageUrl: "/assets/Healios (2)_1754229830905.png",
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

    // Seed sample articles
    const sampleArticles: Article[] = [
      {
        id: "understanding-magnesium-benefits",
        title: "Understanding Magnesium: The Essential Mineral for Sleep and Muscle Function",
        slug: "understanding-magnesium-benefits",
        metaDescription: "Discover how magnesium supports better sleep, muscle function, and overall wellness. Learn about the different forms and optimal dosing strategies.",
        content: "<p>Magnesium is one of the most important minerals for human health, yet deficiency is surprisingly common. This essential nutrient plays a role in over 300 enzymatic reactions in the body, making it crucial for energy production, muscle function, and nervous system health.</p><h2>Why Magnesium Matters for Sleep</h2><p>Research consistently shows that magnesium plays a crucial role in sleep regulation. It activates the parasympathetic nervous system, which is responsible for helping you feel calm and relaxed. Magnesium also regulates melatonin production and maintains healthy levels of GABA, a neurotransmitter that promotes sleep.</p><p>Clinical studies have demonstrated that magnesium supplementation can significantly improve sleep quality, reduce sleep onset time, and increase sleep efficiency - particularly beneficial for older adults who often experience age-related sleep disturbances.</p><h2>Muscle Function and Recovery</h2><p>For athletes and active individuals, magnesium is essential for proper muscle contraction and relaxation. It helps prevent muscle cramps and supports post-exercise recovery by reducing inflammation and oxidative stress.</p><h2>Choosing the Right Form</h2><p>Not all magnesium supplements are created equal. The form of magnesium affects absorption and bioavailability:</p><ul><li><strong>Magnesium Glycinate:</strong> Highly bioavailable and gentle on the stomach, ideal for sleep support</li><li><strong>Magnesium Citrate:</strong> Good absorption, may have mild laxative effects</li><li><strong>Magnesium Oxide:</strong> Lower bioavailability, primarily used for constipation relief</li></ul><p>Our magnesium gummies combine both citrate and glycinate forms to optimize absorption while maintaining digestive comfort.</p>",
        research: "Multiple clinical trials have shown magnesium supplementation improves sleep quality scores by 15-25% and reduces sleep onset time by an average of 17 minutes. A 2012 study in the Journal of Research in Medical Sciences found that magnesium supplementation significantly improved insomnia severity, sleep time, and early morning awakening.",
        sources: [
          "https://pubmed.ncbi.nlm.nih.gov/23853635/",
          "https://pubmed.ncbi.nlm.nih.gov/32162142/",
          "https://pubmed.ncbi.nlm.nih.gov/24264568/"
        ],
        category: "Minerals",
        author: "Healios Research Team",
        readTime: "5",
        published: true,
        createdAt: "2024-01-15T10:00:00Z"
      },
      {
        id: "vitamin-d3-immune-support",
        title: "Vitamin D3: Your Immune System's Best Friend During Winter Months",
        slug: "vitamin-d3-immune-support",
        metaDescription: "Learn how vitamin D3 supports immune function, especially during winter months when sun exposure is limited. Discover optimal dosing and safety guidelines.",
        content: "<p>Vitamin D3, often called the 'sunshine vitamin,' is crucial for immune system function. During winter months in the UK, when sun exposure is limited, maintaining adequate vitamin D levels becomes particularly important for overall health and disease prevention.</p><h2>The Immune Connection</h2><p>Vitamin D3 receptors are found throughout the immune system, including in T cells, B cells, and antigen-presenting cells. This widespread presence indicates vitamin D's fundamental role in immune regulation.</p><p>Research shows that vitamin D3 helps modulate both innate and adaptive immune responses, supporting the body's ability to fight off infections while preventing excessive inflammatory responses.</p><h2>Winter Deficiency Risk</h2><p>In the UK, vitamin D deficiency is particularly common during winter months due to limited sun exposure. Studies suggest that up to 40% of the UK population may have insufficient vitamin D levels during winter.</p><h2>Optimal Dosing</h2><p>The UK government recommends 10mcg (400 IU) daily, but many experts suggest higher doses for optimal immune function. Our 4000 IU gummies provide therapeutic levels while maintaining safety margins for daily use.</p>",
        research: "A comprehensive meta-analysis published in BMJ found that vitamin D supplementation reduced the risk of acute respiratory tract infections by 12% overall, with greater protective effects in individuals with vitamin D deficiency. Daily supplementation was more effective than bolus doses.",
        sources: [
          "https://pubmed.ncbi.nlm.nih.gov/28202713/",
          "https://pubmed.ncbi.nlm.nih.gov/31614810/",
          "https://pubmed.ncbi.nlm.nih.gov/33595634/"
        ],
        category: "Vitamins",
        author: "Healios Research Team",
        readTime: "4",
        published: true,
        createdAt: "2024-01-10T14:30:00Z"
      },
      {
        id: "ashwagandha-stress-management",
        title: "KSM-66® Ashwagandha: Science-Backed Stress Relief and Cortisol Support",
        slug: "ashwagandha-stress-management",
        metaDescription: "Explore the clinical research behind KSM-66® Ashwagandha for stress management, cortisol reduction, and improved energy levels.",
        content: "<p>In our fast-paced modern world, chronic stress has become a significant health concern. KSM-66® Ashwagandha, a clinically studied form of this ancient adaptogenic herb, offers science-backed support for stress management and overall wellbeing.</p><h2>What Makes KSM-66® Different</h2><p>KSM-66® is the most clinically studied ashwagandha extract, with over 20 human clinical trials supporting its efficacy. This full-spectrum extract is produced using a unique extraction process that preserves the natural balance of active compounds found in the ashwagandha root.</p><h2>Cortisol Reduction</h2><p>One of the most significant benefits of KSM-66® is its ability to reduce cortisol levels. Elevated cortisol, often called the 'stress hormone,' can negatively impact sleep, mood, immune function, and metabolism.</p><p>Clinical studies show that KSM-66® can reduce cortisol levels by up to 27.9%, helping to restore the body's natural stress response and promote better overall health.</p><h2>Beyond Stress Relief</h2><p>While stress management is KSM-66®'s primary benefit, research also shows improvements in:</p><ul><li>Energy levels and physical performance</li><li>Sleep quality and duration</li><li>Cognitive function and memory</li><li>Mood and emotional wellbeing</li></ul>",
        research: "A randomized, double-blind, placebo-controlled study found that 600mg of KSM-66® daily for 60 days significantly reduced perceived stress scores by 27.9% and morning cortisol levels by 23% compared to placebo. Participants also reported improved sleep quality and general wellbeing.",
        sources: [
          "https://pubmed.ncbi.nlm.nih.gov/31517876/",
          "https://pubmed.ncbi.nlm.nih.gov/23439798/",
          "https://pubmed.ncbi.nlm.nih.gov/34254920/"
        ],
        category: "Adaptogens",
        author: "Healios Research Team",
        readTime: "6",
        published: true,
        createdAt: "2024-01-05T09:15:00Z"
      }
    ];

    sampleArticles.forEach(article => {
      this.articles.set(article.id, article);
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

  // Consultation Bookings
  async createConsultationBooking(bookingData: InsertConsultationBooking): Promise<ConsultationBooking> {
    const booking: ConsultationBooking = {
      id: randomUUID(),
      type: bookingData.type,
      name: bookingData.name,
      email: bookingData.email,
      goals: bookingData.goals || null,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    this.consultationBookings.set(booking.id, booking);
    return booking;
  }

  async getConsultationBookings(): Promise<ConsultationBooking[]> {
    return Array.from(this.consultationBookings.values());
  }
}

export const storage = new MemStorage();
