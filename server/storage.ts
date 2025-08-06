import { type Product, type InsertProduct, type Newsletter, type InsertNewsletter, type PreOrder, type InsertPreOrder, type Article, type InsertArticle, type Order, type InsertOrder, type StockAlert, type InsertStockAlert, type QuizResult, type InsertQuizResult, type ConsultationBooking, type InsertConsultationBooking, type RestockNotification, type InsertRestockNotification, type User, type InsertUser, type Address, type InsertAddress, type OrderItem, type InsertOrderItem, type Cart, type InsertCart } from "@shared/schema";
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
  
  // Restock Notifications
  createRestockNotification(notification: InsertRestockNotification): Promise<RestockNotification>;
  getRestockNotifications(): Promise<RestockNotification[]>;
  getRestockNotificationsByProduct(productId: string): Promise<RestockNotification[]>;
  
  // Users (Auth)
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
  private restockNotifications: Map<string, RestockNotification>;
  private users: Map<string, User>;
  private addresses: Map<string, Address>;
  private orderItems: Map<string, OrderItem>;
  private carts: Map<string, Cart>;

  constructor() {
    this.products = new Map();
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
    this.seedData();
  }

  private seedData() {
    const sampleProducts: Product[] = [
      // Healios Products matching frontend
      {
        id: "apple-cider-vinegar",
        name: "Apple Cider Vinegar + Ginger Gummies (Natural Apple Flavour) — 500mg ACV with the Mother",
        description: "Support your gut daily with these delicious apple-flavoured gummies. Each serving delivers 500mg of raw Apple Cider Vinegar with the Mother plus 10mg of soothing ginger extract to support digestion, metabolism, and natural detox — without the harsh vinegar taste.\n\nMade for daily balance, these vegan-friendly gummies offer a gentler, more convenient way to experience the benefits of ACV — no enamel damage, no burning aftertaste.\n\nWhy it works:\n• ACV with the Mother — promotes healthy gut flora & digestion\n• Ginger extract — traditionally used to ease bloating and support motility\n• Natural flavour — crisp apple taste with no artificial nasties\n\n✓ Vegan ✓ Gluten-Free ✓ Gelatin-Free ✓ No Artificial Colours or Preservatives\n\nNutritional Information (Per 2 Gummies / Daily Serving):\n• Apple Cider Vinegar (with the Mother): 500mg\n• Ginger Extract: 10mg\n\nIngredients: Glucose Syrup, Sugar, Water, Pre-mix (Ginger Extract, Mother Apple Cider Vinegar), Pectin, Citric Acid, Sodium Citrate, Anthocyanadins, Sodium Copper Chlorophyll, Coconut Oil, Carnauba Wax, Natural Apple Flavour.\n\nHow to Take: Take two (2) gummies daily. Can be taken with or without food.",
        price: "299.00",
        originalPrice: null,
        imageUrl: "/assets/Apple Cider Vinegar_1754395222286.png",
        categories: ["Gummies", "Digestive"],
        rating: "4.8",
        reviewCount: 23,
        inStock: true,
        stockQuantity: 15,
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
        name: "Vitamin D3 4000 IU Gummies (Orange Flavour)",
        description: "Get your daily dose of sunshine in one delicious gummy. Healios Vitamin D3 Gummies deliver a high-strength 4000 IU (100μg) dose of vitamin D3 in a tangy natural orange flavour — designed to support immune system function, bone and muscle strength, calcium absorption, and mood and energy levels. Made with vegan-friendly cholecalciferol and no artificial nasties, these gummies are a tasty, easy way to stay topped up — especially during the darker winter months or when sun exposure is limited.",
        price: "449.00",
        originalPrice: null,
        imageUrl: "/assets/Vitamin D3  4000 IU_1754395199505.png",
        categories: ["Vitamins", "Gummies"],
        rating: "4.9",
        reviewCount: 31,
        inStock: true,
        stockQuantity: 12,
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
        description: "A powerful full-spectrum adaptogen using clinically validated <a href=\"https://www.ixoreal.com/ksm66-ashwagandha\" target=\"_blank\" rel=\"noopener noreferrer\">KSM-66®</a> extract to support stress resilience, energy, and hormonal balance. 500mg per capsule, suitable for vegetarians and vegans.",
        price: "429.00",
        originalPrice: null,
        imageUrl: "/assets/KSM-66® Ashwagandha_1754417194798.png",
        categories: ["Adaptogens"],
        rating: "4.7",
        reviewCount: 15,
        inStock: true,
        stockQuantity: 8,
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
        name: "Probiotic Complex — 10 Billion CFU with FOS (6 Strains, Vegan, 60 Capsules)",
        description: "Support your gut health with Healios Probiotic Complex — a multi-strain formula delivering 10 billion CFU per capsule from 6 clinically recognised bacterial strains. Fortified with FOS (fructooligosaccharides) as a prebiotic to nourish your good gut bacteria.\n\nFormulated for:\n• Digestive balance and regularity\n• Gut flora diversity and microbiome support\n• Immune system modulation\n\nEach capsule is vegan, acid-resistant, and designed to survive the journey through your stomach to deliver live cultures where they're needed most. No refrigeration required.\n\nBacterial Strains Included:\n• Bifidobacterium lactis\n• Bifidobacterium bifidum\n• Bifidobacterium longum\n• Lactobacillus acidophilus\n• Lactobacillus casei rhamnosus\n• Streptococcus thermophilus\n\n✓ Vegan ✓ Gluten-Free ✓ No Artificial Fillers ✓ Acid-Resistant Capsules",
        price: "449.00",
        originalPrice: null,
        imageUrl: "/assets/Probiotic Complex 10 Billion CFU__1754396771851.png",
        categories: ["Probiotics"],
        rating: "4.7",
        reviewCount: 37,
        inStock: true,
        stockQuantity: 20,
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
        id: "magnesium",
        name: "Magnesium (Citrate/Glycinate) Gummies (Berry Flavour)",
        description: "Support for muscles, mind & energy with bioavailable magnesium citrate and glycinate per gummy. Gentle chewable dose for fatigue reduction and electrolyte balance.",
        price: "329.00",
        originalPrice: null,
        imageUrl: "/assets/Magnesium_1754395222285.png",
        categories: ["Minerals", "Gummies"],
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
        price: "749.00",
        originalPrice: null,
        imageUrl: "/assets/Multivitamin for Kids_1754395222288.png",
        categories: ["Children", "Vitamins", "Gummies"],
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
        price: "379.00",
        originalPrice: null,
        imageUrl: "/assets/Porbiotic_Vitamins_1754395222287.png",
        categories: ["Probiotics", "Vitamins", "Gummies"],
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
        price: "399.00",
        originalPrice: null,
        imageUrl: "/assets/Collagen Complex__1754395222287.png",
        categories: ["Beauty", "Gummies"],
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
        price: "449.00",
        originalPrice: null,
        imageUrl: "/assets/Biton_1754395222286.png",
        categories: ["Beauty", "Gummies"],
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
        price: "429.00",
        originalPrice: null,
        imageUrl: "/assets/Iron + Vitamin C_1754395222286.png",
        categories: ["Minerals", "Vitamins", "Gummies"],
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
        price: "399.00",
        originalPrice: null,
        imageUrl: "/assets/Folic Acid 400µg_1754395222286.png",
        categories: ["Prenatal", "Vitamins", "Gummies"],
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
        price: "499.00",
        originalPrice: null,
        imageUrl: "/assets/Lion's Mane Gummies (2000mg)_1754395199504.png",
        categories: ["Mushrooms", "Gummies"],
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
        name: "HALO Glow Collagen — 2500mg Peptides, 30-Day Powder",
        description: "A daily dose of clinically studied bioactive peptides to enhance skin elasticity, reduce wrinkle depth, and support healthy nails and hair — from the inside out.",
        price: "429.00",
        originalPrice: null,
        imageUrl: "/assets/HaloGlowB_1754395199504.png",
        categories: ["Beauty"],
        rating: "4.8",
        reviewCount: 192,
        inStock: true,
        stockQuantity: 50,
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
        price: "549.00",
        originalPrice: null,
        imageUrl: "/assets/Bio-Cultures Vitamin Plus Gummies_1754395199504.png",
        categories: ["Probiotics", "Vitamins", "Gummies"],
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
        id: "magnesium-bisglycinate-b6",
        name: "Magnesium Complex Capsules — 375mg Magnesium + B6 (120 Vegan Capsules)",
        description: "Support energy, mood, and muscle recovery with the Healios Magnesium Complex — a superior blend of Magnesium Bisglycinate, Magnesium Malate, and Magnesium Taurate, enhanced with Vitamin B6 for optimal absorption and nervous system support.\n\nThis advanced formula contributes to:\n• Reduction of tiredness and fatigue\n• Nervous system and psychological function\n• Normal muscle function and bone health\n• Efficient energy-yielding metabolism\n\nBuffered, highly bioavailable forms of magnesium ensure gentle digestion and maximum cellular uptake — with zero artificial fillers or binders.\n\n**Three Premium Magnesium Forms:**\n• **Bisglycinate** (180mg) — Gentle on stomach, highly absorbable\n• **Malate** (165mg) — Energy production support\n• **Taurate** (30mg) — Cardiovascular and nervous system support\n\n✔ 100% Vegan ✔ Gluten-Free ✔ Dairy-Free ✔ No Artificial Preservatives",
        price: "449.00",
        originalPrice: null,
        imageUrl: "/assets/Magnesium Bisglycinate with B6_1754417123870.png",
        categories: ["Magnesium", "Energy", "Sleep"],
        rating: "4.8",
        reviewCount: 24,
        inStock: true,
        stockQuantity: 50,
        featured: true,
        sizes: null,
        colors: null,
        gender: null,
        type: 'supplement',
        bottleCount: 120,
        dailyDosage: 3,
        supplyDays: 40,
      },
      {
        id: "healios-oversized-tee",
        name: "Healios HealthClub Oversized Tee",
        description: "Premium oversized black tee featuring the iconic 'HEALIOS HEALTHCLUB -1984-' design on the back in pink bubble lettering. Made from high-quality cotton blend for ultimate comfort and durability. Perfect for expressing your wellness lifestyle with retro-inspired style.",
        price: "750.00",
        originalPrice: null,
        imageUrl: "/assets/Healios Oversized Tee (1)_1754417556142.png",
        categories: ["Apparel"],
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
        content: "<p>In our fast-paced modern world, chronic stress has become a significant health concern. <a href=\"https://www.ixoreal.com/ksm66-ashwagandha\" target=\"_blank\" rel=\"noopener noreferrer\">KSM-66®</a> Ashwagandha, a clinically studied form of this ancient adaptogenic herb, offers science-backed support for stress management and overall wellbeing.</p><h2>What Makes KSM-66® Different</h2><p><a href=\"https://www.ixoreal.com/ksm66-ashwagandha\" target=\"_blank\" rel=\"noopener noreferrer\">KSM-66®</a> is the most clinically studied ashwagandha extract, with over 20 human clinical trials supporting its efficacy. This full-spectrum extract is produced using a unique extraction process that preserves the natural balance of active compounds found in the ashwagandha root.</p><h2>Cortisol Reduction</h2><p>One of the most significant benefits of <a href=\"https://www.ixoreal.com/ksm66-ashwagandha\" target=\"_blank\" rel=\"noopener noreferrer\">KSM-66®</a> is its ability to reduce cortisol levels. Elevated cortisol, often called the 'stress hormone,' can negatively impact sleep, mood, immune function, and metabolism.</p><p>Clinical studies show that <a href=\"https://www.ixoreal.com/ksm66-ashwagandha\" target=\"_blank\" rel=\"noopener noreferrer\">KSM-66®</a> can reduce cortisol levels by up to 27.9%, helping to restore the body's natural stress response and promote better overall health.</p><h2>Beyond Stress Relief</h2><p>While stress management is <a href=\"https://www.ixoreal.com/ksm66-ashwagandha\" target=\"_blank\" rel=\"noopener noreferrer\">KSM-66®</a>'s primary benefit, research also shows improvements in:</p><ul><li>Energy levels and physical performance</li><li>Sleep quality and duration</li><li>Cognitive function and memory</li><li>Mood and emotional wellbeing</li></ul>",
        research: "A randomized, double-blind, placebo-controlled study found that 600mg of <a href=\"https://www.ixoreal.com/ksm66-ashwagandha\" target=\"_blank\" rel=\"noopener noreferrer\">KSM-66®</a> daily for 60 days significantly reduced perceived stress scores by 27.9% and morning cortisol levels by 23% compared to placebo. Participants also reported improved sleep quality and general wellbeing.",
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
      },
      {
        id: "magnesium-for-sleep-clinical-evidence-and-benefits-20250803",
        title: "Magnesium for Sleep: Clinical Evidence and Benefits",
        slug: "magnesium-for-sleep-clinical-evidence-and-benefits-20250803",
        metaDescription: "Discover the clinical evidence behind magnesium supplementation for improved sleep quality, reduced insomnia, and better rest.",
        content: "<p>Sleep disorders affect millions of people worldwide, with insomnia being one of the most common complaints. Recent clinical research has highlighted magnesium as a promising natural intervention for improving sleep quality and duration.</p><h2>The Science Behind Magnesium and Sleep</h2><p>Magnesium plays a crucial role in sleep regulation through multiple mechanisms. It activates the parasympathetic nervous system, which is responsible for helping your body relax and prepare for sleep. Additionally, magnesium regulates melatonin production and maintains healthy levels of GABA, a neurotransmitter that promotes relaxation.</p><h2>Clinical Evidence</h2><p>A randomized controlled trial published in the Journal of Research in Medical Sciences found that elderly participants who took 500mg of magnesium daily for 8 weeks experienced:</p><ul><li>Significantly improved sleep quality scores</li><li>Reduced sleep onset time (falling asleep faster)</li><li>Increased sleep duration</li><li>Improved early morning awakening issues</li></ul><p>Another study involving 46 adults showed that magnesium supplementation increased sleep time by an average of 17 minutes and improved sleep efficiency by 8%.</p><h2>Optimal Forms and Dosing</h2><p>Research suggests that magnesium glycinate and magnesium citrate are the most effective forms for sleep support, with doses ranging from 200-400mg taken 30-60 minutes before bedtime showing the best results.</p>",
        research: "Clinical trials demonstrate that magnesium supplementation can improve sleep quality scores by 15-25% and reduce sleep onset time. The mineral's role in GABA regulation and melatonin production makes it particularly effective for age-related sleep disturbances.",
        sources: [
          "https://pubmed.ncbi.nlm.nih.gov/23853635/",
          "https://pubmed.ncbi.nlm.nih.gov/32162142/",
          "https://pubmed.ncbi.nlm.nih.gov/24264568/"
        ],
        category: "Sleep",
        author: "Healios Research Team",
        readTime: "5",
        published: true,
        createdAt: "2025-08-03T10:00:00Z"
      },
      {
        id: "ashwagandha-ancient-medicine-meets-modern-science-20250803",
        title: "Ashwagandha: Ancient Medicine Meets Modern Science",
        slug: "ashwagandha-ancient-medicine-meets-modern-science-20250803",
        metaDescription: "Explore how ancient Ayurvedic medicine meets modern clinical research in the study of Ashwagandha for stress, anxiety, and overall wellness.",
        content: "<p>Ashwagandha (Withania somnifera) has been used in Ayurvedic medicine for over 3,000 years. Today, modern scientific research is validating many of the traditional uses of this remarkable adaptogenic herb.</p><h2>From Ancient Wisdom to Clinical Trials</h2><p>Traditional Ayurvedic texts describe ashwagandha as a 'rasayana' - a tonic for general vitality and longevity. Modern research has focused on its ability to help the body manage stress and support overall resilience.</p><h2>The KSM-66® Advantage</h2><p><a href=\"https://www.ixoreal.com/ksm66-ashwagandha\" target=\"_blank\" rel=\"noopener noreferrer\">KSM-66®</a> is a full-spectrum ashwagandha extract that has been the subject of over 20 clinical studies. Unlike other extracts that focus on isolated compounds, <a href=\"https://www.ixoreal.com/ksm66-ashwagandha\" target=\"_blank\" rel=\"noopener noreferrer\">KSM-66®</a> maintains the natural balance of active constituents found in the whole ashwagandha root.</p><h2>Evidence-Based Benefits</h2><p>Clinical studies on <a href=\"https://www.ixoreal.com/ksm66-ashwagandha\" target=\"_blank\" rel=\"noopener noreferrer\">KSM-66®</a> ashwagandha have demonstrated:</p><ul><li>27.9% reduction in cortisol levels</li><li>Significant improvements in stress and anxiety scores</li><li>Enhanced sleep quality and duration</li><li>Improved physical performance and strength</li><li>Better cognitive function and memory</li></ul><h2>Bridging Traditional and Modern Medicine</h2><p>The convergence of ancient wisdom and modern science in ashwagandha research represents the best of both worlds - traditional knowledge validated by rigorous clinical methodology.</p>",
        research: "Over 20 clinical trials support <a href=\"https://www.ixoreal.com/ksm66-ashwagandha\" target=\"_blank\" rel=\"noopener noreferrer\">KSM-66®</a> ashwagandha's efficacy for stress management, with significant reductions in cortisol levels and perceived stress scores. Studies consistently show improvements in sleep quality and overall wellbeing.",
        sources: [
          "https://pubmed.ncbi.nlm.nih.gov/31517876/",
          "https://pubmed.ncbi.nlm.nih.gov/23439798/",
          "https://pubmed.ncbi.nlm.nih.gov/34254920/"
        ],
        category: "Adaptogens",
        author: "Healios Research Team",
        readTime: "6",
        published: true,
        createdAt: "2025-08-03T11:00:00Z"
      },
      {
        id: "collagen-benefits-backed-by-research-20250803",
        title: "Collagen Benefits Backed by Research",
        slug: "collagen-benefits-backed-by-research-20250803",
        metaDescription: "Discover the research-backed benefits of collagen supplementation for skin health, joint support, and overall wellness.",
        content: "<p>Collagen is the most abundant protein in the human body, making up about 30% of total protein content. As we age, collagen production naturally declines, leading to visible signs of aging and potential joint issues.</p><h2>What the Research Shows</h2><p>Clinical studies on collagen supplementation have revealed significant benefits for multiple aspects of health:</p><h3>Skin Health</h3><p>A 2019 systematic review found that collagen supplementation significantly improved skin elasticity, hydration, and density. Participants taking hydrolyzed collagen peptides showed measurable improvements in skin aging markers within 4-12 weeks.</p><h3>Joint Support</h3><p>Research indicates that collagen supplementation may help maintain joint health and mobility. Studies show improvements in joint pain and stiffness, particularly in athletes and individuals with joint concerns.</p><h2>Bioavailability and Absorption</h2><p>Hydrolyzed collagen peptides are broken down into smaller, more easily absorbed amino acids. This process ensures better bioavailability compared to whole collagen proteins.</p><h2>Synergistic Nutrients</h2><p>Vitamin C plays a crucial role in collagen synthesis, which is why our collagen complex includes vitamin C alongside zinc and selenium for optimal collagen production and antioxidant protection.</p>",
        research: "Clinical trials demonstrate that collagen peptide supplementation significantly improves skin elasticity by 7-20% and reduces wrinkle depth. Studies also show improvements in joint comfort and mobility within 8-12 weeks of supplementation.",
        sources: [
          "https://pubmed.ncbi.nlm.nih.gov/30681787/",
          "https://pubmed.ncbi.nlm.nih.gov/31614810/",
          "https://pubmed.ncbi.nlm.nih.gov/25278298/"
        ],
        category: "Beauty",
        author: "Healios Research Team",
        readTime: "5",
        published: true,
        createdAt: "2025-08-03T12:00:00Z"
      },
      {
        id: "vitamin-d-and-mood-what-research-shows-20250803",
        title: "Vitamin D and Mood: What Research Shows",
        slug: "vitamin-d-and-mood-what-research-shows-20250803",
        metaDescription: "Learn about the connection between vitamin D deficiency and mood disorders, plus the research on vitamin D supplementation for mental wellness.",
        content: "<p>The relationship between vitamin D and mood has become an increasingly important area of research, particularly given the high prevalence of vitamin D deficiency in northern climates like the UK.</p><h2>The Vitamin D-Mood Connection</h2><p>Vitamin D receptors are found throughout the brain, including areas involved in mood regulation. This widespread presence suggests that vitamin D plays a significant role in brain function and emotional wellbeing.</p><h2>Research Findings</h2><p>Multiple studies have identified links between vitamin D deficiency and mood disorders:</p><ul><li>A meta-analysis of 31,424 participants found a significant association between vitamin D deficiency and depression</li><li>Seasonal Affective Disorder (SAD) rates correlate with latitude and vitamin D levels</li><li>Supplementation studies show improvements in mood scores, particularly in individuals with deficiency</li></ul><h2>Mechanisms of Action</h2><p>Vitamin D influences mood through several pathways:</p><ul><li>Regulation of serotonin synthesis</li><li>Modulation of inflammatory responses</li><li>Support of neuroplasticity</li><li>Influence on circadian rhythm regulation</li></ul><h2>Optimal Levels for Mood Support</h2><p>Research suggests that maintaining vitamin D levels above 30 ng/mL (75 nmol/L) may be important for mood regulation, with some studies showing greater benefits at levels of 40-60 ng/mL.</p>",
        research: "Meta-analyses show significant associations between vitamin D deficiency and increased risk of depression. Supplementation studies demonstrate mood improvements, particularly in individuals with baseline deficiency, with effects becoming apparent after 8-12 weeks of consistent supplementation.",
        sources: [
          "https://pubmed.ncbi.nlm.nih.gov/28202713/",
          "https://pubmed.ncbi.nlm.nih.gov/31614810/",
          "https://pubmed.ncbi.nlm.nih.gov/33595634/"
        ],
        category: "Mental Health",
        author: "Healios Research Team",
        readTime: "6",
        published: true,
        createdAt: "2025-08-03T13:00:00Z"
      },
      {
        id: "probiotic-benefits-evidence-based-health-support-20250803",
        title: "Probiotic Benefits: Evidence-Based Health Support",
        slug: "probiotic-benefits-evidence-based-health-support-20250803",
        metaDescription: "Discover the evidence-based benefits of probiotic supplementation for digestive health, immune function, and overall wellness.",
        content: "<p>The human gut microbiome contains trillions of bacteria that play crucial roles in digestion, immune function, and overall health. Probiotic supplementation offers a way to support this complex ecosystem.</p><h2>What Are Probiotics?</h2><p>Probiotics are live beneficial bacteria that, when consumed in adequate amounts, provide health benefits to the host. Different strains offer different benefits, which is why multi-strain formulations are often most effective.</p><h2>Evidence-Based Benefits</h2><h3>Digestive Health</h3><p>Clinical studies consistently show that probiotics can:</p><ul><li>Improve symptoms of irritable bowel syndrome (IBS)</li><li>Reduce antibiotic-associated diarrhea</li><li>Support overall digestive comfort</li><li>Enhance nutrient absorption</li></ul><h3>Immune Function</h3><p>Approximately 70% of the immune system is located in the gut. Research shows that probiotics can:</p><ul><li>Reduce the duration and severity of respiratory tract infections</li><li>Support immune system balance</li><li>Reduce inflammatory markers</li></ul><h2>Strain Specificity</h2><p>Different probiotic strains offer specific benefits. Our 10 billion CFU complex includes clinically studied strains selected for their complementary effects on digestive and immune health.</p><h2>CFU Count and Viability</h2><p>Research indicates that probiotic benefits are dose-dependent, with most clinical studies using 1-10 billion CFU daily. Stable, viable cultures are essential for effectiveness.</p>",
        research: "Systematic reviews demonstrate that multi-strain probiotic supplementation significantly improves digestive symptoms and immune function. Clinical trials show benefits for IBS symptoms, antibiotic-associated diarrhea, and upper respiratory tract infections.",
        sources: [
          "https://pubmed.ncbi.nlm.nih.gov/24264568/",
          "https://pubmed.ncbi.nlm.nih.gov/25928379/",
          "https://pubmed.ncbi.nlm.nih.gov/27413138/"
        ],
        category: "Digestive Health",
        author: "Healios Research Team",
        readTime: "7",
        published: true,
        createdAt: "2025-08-03T14:00:00Z"
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
      product => product.categories?.some(cat => cat.toLowerCase() === category.toLowerCase())
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

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;

    const updatedProduct = { ...product, ...updates };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;

    const updatedProduct = { ...product, ...updates };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
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
  async createOrder(orderData: any): Promise<any> {
    const id = randomUUID();
    const order = {
      id,
      userId: orderData.userId || null,
      customerEmail: orderData.customerEmail,
      customerName: orderData.customerName || null,
      customerPhone: orderData.customerPhone || null,
      shippingAddress: orderData.shippingAddress,
      billingAddress: orderData.billingAddress || null,
      orderItems: orderData.orderItems,
      totalAmount: orderData.totalAmount,
      currency: orderData.currency || 'ZAR',
      paymentStatus: orderData.paymentStatus || 'pending',
      orderStatus: orderData.orderStatus || 'processing',
      refundStatus: orderData.refundStatus || 'none',
      disputeStatus: orderData.disputeStatus || 'none',
      stripePaymentIntentId: orderData.stripePaymentIntentId || null,
      stripeSessionId: orderData.stripeSessionId || null,
      trackingNumber: orderData.trackingNumber || null,
      notes: orderData.notes || null,
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

  async getOrderByStripeSessionId(sessionId: string): Promise<any | undefined> {
    return Array.from(this.orders.values()).find(order => order.stripeSessionId === sessionId);
  }

  async getOrderByStripePaymentIntent(paymentIntentId: string): Promise<any | undefined> {
    return Array.from(this.orders.values()).find(order => order.stripePaymentIntentId === paymentIntentId);
  }

  async updateOrderRefundStatus(orderId: string, status: string): Promise<any | undefined> {
    const order = this.orders.get(orderId);
    if (!order) return undefined;

    const updatedOrder = { 
      ...order, 
      refundStatus: status,
      updatedAt: new Date().toISOString()
    };
    this.orders.set(orderId, updatedOrder);
    return updatedOrder;
  }

  async updateOrderDisputeStatus(orderId: string, status: string): Promise<any | undefined> {
    const order = this.orders.get(orderId);
    if (!order) return undefined;

    const updatedOrder = { 
      ...order, 
      disputeStatus: status,
      updatedAt: new Date().toISOString()
    };
    this.orders.set(orderId, updatedOrder);
    return updatedOrder;
  }

  async updateOrderPaymentStatus(orderId: string, status: string): Promise<any | undefined> {
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

  // Restock Notifications Implementation
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
      requestedAt: new Date().toISOString(),
      notified: false,
    };
    this.restockNotifications.set(id, newNotification);
    return newNotification;
  }

  async getRestockNotifications(): Promise<RestockNotification[]> {
    return Array.from(this.restockNotifications.values());
  }

  async getRestockNotificationsByProduct(productId: string): Promise<RestockNotification[]> {
    return Array.from(this.restockNotifications.values()).filter(
      notification => notification.productId === productId && !notification.notified
    );
  }

  // Users (Auth) Implementation
  async getUserById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      email: userData.email,
      role: userData.role || "guest",
      firstName: userData.firstName ?? null,
      lastName: userData.lastName ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Customer Portal - Address Management
  async getAddressesByUserId(userId: string): Promise<Address[]> {
    return Array.from(this.addresses.values()).filter(address => address.userId === userId);
  }

  async createAddress(insertAddress: InsertAddress): Promise<Address> {
    const id = randomUUID();
    const address: Address = {
      id,
      userId: insertAddress.userId,
      type: insertAddress.type,
      line1: insertAddress.line1,
      line2: insertAddress.line2 || null,
      city: insertAddress.city || null,
      zip: insertAddress.zip || null,
      country: insertAddress.country || null,
      createdAt: new Date().toISOString(),
    };
    this.addresses.set(id, address);
    return address;
  }

  async updateAddress(addressId: string, updates: Partial<InsertAddress>): Promise<Address | undefined> {
    const address = this.addresses.get(addressId);
    if (!address) return undefined;

    const updatedAddress = { ...address, ...updates };
    this.addresses.set(addressId, updatedAddress);
    return updatedAddress;
  }

  async deleteAddress(addressId: string): Promise<void> {
    this.addresses.delete(addressId);
  }

  // Customer Portal - Order Items Management
  async getOrderItemsByOrderId(orderId: string): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = randomUUID();
    const orderItem: OrderItem = {
      id,
      orderId: insertOrderItem.orderId,
      productId: insertOrderItem.productId,
      quantity: insertOrderItem.quantity,
      price: insertOrderItem.price,
      productName: insertOrderItem.productName,
      createdAt: new Date().toISOString(),
    };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }

  // Customer Portal - Enhanced Order Methods
  async getOrdersByUserId(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
  }

  async getOrderByIdAndUserId(orderId: string, userId: string): Promise<Order | undefined> {
    const order = this.orders.get(orderId);
    if (!order || order.userId !== userId) return undefined;
    return order;
  }

  // Admin Order methods
  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrderByStripePaymentIntent(paymentIntentId: string): Promise<Order | undefined> {
    return Array.from(this.orders.values()).find(order => 
      order.stripePaymentIntentId === paymentIntentId
    );
  }

  async updateOrderRefundStatus(orderId: string, status: string): Promise<Order | undefined> {
    const order = this.orders.get(orderId);
    if (!order) return undefined;

    const updatedOrder = { ...order, refundStatus: status };
    this.orders.set(orderId, updatedOrder);
    return updatedOrder;
  }

  // Cart methods (Phase 7: Abandoned Cart Tracking)
  async upsertCart(cartData: Partial<InsertCart> & { sessionToken: string }): Promise<Cart> {
    // Look for existing cart by session token
    const existingCart = Array.from(this.carts.values()).find(
      cart => cart.sessionToken === cartData.sessionToken
    );

    if (existingCart) {
      // Update existing cart
      const updatedCart: Cart = {
        ...existingCart,
        items: cartData.items || existingCart.items,
        totalAmount: cartData.totalAmount || existingCart.totalAmount || null,
        currency: cartData.currency || existingCart.currency || null,
        userId: cartData.userId || existingCart.userId || null,
        lastUpdated: new Date().toISOString(),
      };
      this.carts.set(existingCart.id, updatedCart);
      return updatedCart;
    }

    // Create new cart
    const id = randomUUID();
    const cart: Cart = {
      id,
      userId: cartData.userId || null,
      sessionToken: cartData.sessionToken,
      items: cartData.items || "[]",
      totalAmount: cartData.totalAmount || null,
      currency: cartData.currency || null,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      convertedToOrder: cartData.convertedToOrder || null,
      stripeSessionId: cartData.stripeSessionId || null,
    };
    this.carts.set(id, cart);
    return cart;
  }

  async getCartById(id: string): Promise<Cart | undefined> {
    return this.carts.get(id);
  }

  async getCartBySessionToken(sessionToken: string): Promise<Cart | undefined> {
    return Array.from(this.carts.values()).find(
      cart => cart.sessionToken === sessionToken
    );
  }

  async markCartAsConverted(cartId: string, stripeSessionId?: string): Promise<Cart | undefined> {
    const cart = this.carts.get(cartId);
    if (!cart) return undefined;

    const updatedCart: Cart = {
      ...cart,
      convertedToOrder: true,
      stripeSessionId: stripeSessionId || cart.stripeSessionId,
      lastUpdated: new Date().toISOString(),
    };
    this.carts.set(cartId, updatedCart);
    return updatedCart;
  }

  async getAbandonedCarts(hoursThreshold: number = 24): Promise<Cart[]> {
    const cutoffTime = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000);
    
    return Array.from(this.carts.values()).filter(cart => {
      if (cart.convertedToOrder) return false;
      
      const lastUpdated = new Date(cart.lastUpdated || cart.createdAt);
      return lastUpdated < cutoffTime;
    });
  }
}

export const storage = new MemStorage();
