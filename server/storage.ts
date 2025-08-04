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
        price: "299.00",
        originalPrice: null,
        imageUrl: "/assets/Apple Cider Vinegar_1753615197742.png",
        category: "Gummies",
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
        name: "Vitamin D3 4000 IU Gummies (Lemon Flavour)",
        description: "Daily immune & bone support with 4000 IU vitamin D3 in delicious lemon-flavored gummies for adults and teens 12+. Our bestselling high-potency vitamin D formula.",
        price: "349.00",
        originalPrice: null,
        imageUrl: "/assets/Vitamin D3  4000 IU_1754056731371.png",
        category: "Vitamins",
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
        price: "399.00",
        originalPrice: null,
        imageUrl: "/assets/KSM-66® Ashwagandha_1754156555866.png",
        category: "Adaptogens",
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
        name: "Probiotic Complex (10 Billion CFU)",
        description: "Premium gut health support with 10 billion CFU multi-strain probiotic complex in advanced capsule format with delayed-release technology for optimal digestive wellness and immune support.",
        price: "349.00",
        originalPrice: null,
        imageUrl: "/assets/Probiotics10Bil-X_1753615874344.png",
        category: "Probiotics",
        rating: "4.7",
        reviewCount: 37,
        inStock: true,
        stockQuantity: 20,
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
        price: "329.00",
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
        name: "HALO Glow Collagen — 2500mg Peptides, 30-Day Powder",
        description: "A daily dose of clinically studied bioactive peptides to enhance skin elasticity, reduce wrinkle depth, and support healthy nails and hair — from the inside out.",
        price: "2995.00",
        originalPrice: null,
        imageUrl: "/assets/HaloGlowB_1754157621693.png",
        category: "Beauty",
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
        imageUrl: "/assets/Healios Oversized Tee_1754231799645.png",
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
