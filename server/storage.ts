import { type Product, type InsertProduct, type Newsletter, type InsertNewsletter, type PreOrder, type InsertPreOrder, type Article, type InsertArticle } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Newsletter
  subscribeToNewsletter(email: InsertNewsletter): Promise<Newsletter>;
  getNewsletterSubscription(email: string): Promise<Newsletter | undefined>;
  
  // Pre-orders
  createPreOrder(preOrder: InsertPreOrder): Promise<PreOrder>;
  getPreOrders(): Promise<PreOrder[]>;
  
  // Articles
  getArticles(): Promise<Article[]>;
  getArticleBySlug(slug: string): Promise<Article | undefined>;
  getArticlesByCategory(category: string): Promise<Article[]>;
  createArticle(article: InsertArticle): Promise<Article>;
  getLatestArticles(limit: number): Promise<Article[]>;
}

export class MemStorage implements IStorage {
  private products: Map<string, Product>;
  private newsletters: Map<string, Newsletter>;
  private preOrders: Map<string, PreOrder>;
  private articles: Map<string, Article>;

  constructor() {
    this.products = new Map();
    this.newsletters = new Map();
    this.preOrders = new Map();
    this.articles = new Map();
    this.seedData();
  }

  private seedData() {
    const sampleProducts: Product[] = [
      // Healios Products matching frontend
      {
        id: "apple-cider-vinegar",
        name: "Apple Cider Vinegar Gummies (Strawberry Flavour)",
        description: "Daily metabolic & gut support with 500mg concentrated Apple Cider Vinegar powder per gummy. Stomach-friendly format without the burn or enamel erosion.",
        price: "399.00",
        originalPrice: null,
        imageUrl: "/assets/Apple Cider Vinegar_1753615197742.png",
        category: "Gummies",
        rating: "4.8",
        reviewCount: 247,
        inStock: true,
        stockQuantity: 3,
        featured: true,
        sizes: null,
        colors: null,
        gender: null,
        type: 'supplement',
      },
      {
        id: "vitamin-d3",
        name: "Vitamin D3 4000 IU Gummies (Lemon Flavour)",
        description: "Daily immune & bone support with 4000 IU vitamin D3 in delicious lemon-flavored gummies for adults and teens 12+.",
        price: "349.00",
        originalPrice: null,
        imageUrl: "/assets/Vitamin D3  1000 IU_1753615197740.png",
        category: "Vitamins",
        rating: "4.9",
        reviewCount: 189,
        inStock: true,
        stockQuantity: 10,
        featured: true,
        sizes: null,
        colors: null,
        gender: null,
        type: 'supplement',
      },
      {
        id: "ashwagandha",
        name: "Ashwagandha 300mg Gummies (Strawberry Flavour)",  
        description: "Adaptogenic stress relief & mood support with 300mg Ashwagandha root extract per gummy. Natural wellbeing support in convenient strawberry-flavored chewables.",
        price: "379.00",
        originalPrice: null,
        imageUrl: "/assets/Ashwagandha 600mg_1753615197741.png",
        category: "Adaptogens",
        rating: "4.7",
        reviewCount: 432,
        inStock: false,
        stockQuantity: 0,
        featured: true,
        sizes: null,
        colors: null,
        gender: null,
        type: 'supplement',
      },
      {
        id: "probiotics",
        name: "Probiotic Gummies (5bn CFU)",
        description: "Premium gut health support with 5 billion CFU probiotic complex in convenient gummy format",
        price: "419.00",
        originalPrice: null,
        imageUrl: "/assets/Probiotics10Bil-X_1753615874344.png",
        category: "Probiotics",
        rating: "4.7",
        reviewCount: 203,
        inStock: true,
        stockQuantity: 10,
        featured: true,
        sizes: null,
        colors: null,
        gender: null,
        type: 'supplement',
      },
      {
        id: "magnesium",
        name: "Magnesium (Citrate/Glycinate) Gummies (Berry Flavour)",
        description: "Support for muscles, mind & energy with bioavailable magnesium citrate and glycinate per gummy. Gentle chewable dose for fatigue reduction and electrolyte balance.",
        price: "359.00",
        originalPrice: null,
        imageUrl: "/assets/Magnesium_1753615197741.png",
        category: "Minerals",
        rating: "4.7",
        reviewCount: 234,
        inStock: true,
        stockQuantity: 10,
        featured: true,
        sizes: null,
        colors: null,
        gender: null,
        type: 'supplement',
      },
      {
        id: "childrens-multivitamin",
        name: "Children's Multivitamin & Mineral Gummies",
        description: "Complete daily nutrient support for growing bodies (Ages 3+) with 13 essential vitamins and minerals in delicious berry-flavored gummies.",
        price: "379.00",
        originalPrice: null,
        imageUrl: "/assets/Multivitamin for Kids_1753615197742.png",
        category: "Children",
        rating: "4.8",
        reviewCount: 312,
        inStock: true,
        stockQuantity: 10,
        featured: true,
        sizes: null,
        colors: null,
        gender: null,
        type: 'supplement',
      },
      {
        id: "probiotic-vitamins",
        name: "Probiotic + Vitamins Gummies",
        description: "Digestive balance meets energy & immunity – all in one pineapple-flavored gummy with 3-strain probiotic blend and essential B & C vitamins.",
        price: "419.00",
        originalPrice: null,
        imageUrl: "/assets/Porbiotic_Vitamins_1753615197742.png",
        category: "Probiotics",
        rating: "4.7",
        reviewCount: 198,
        inStock: true,
        stockQuantity: 10,
        featured: true,
        sizes: null,
        colors: null,
        gender: null,
        type: 'supplement',
      },
      {
        id: "collagen-complex",
        name: "Collagen + C + Zinc + Selenium Gummies (Orange Flavour)",
        description: "Daily skin, hair & nail support with 500mg hydrolysed collagen peptides plus antioxidant vitamins C, E, biotin and selenium in delicious orange-flavored gummies.",
        price: "389.00",
        originalPrice: null,
        imageUrl: "/assets/Collagen Complex__1753615197742.png",
        category: "Beauty",
        rating: "4.6",
        reviewCount: 267,
        inStock: true,
        stockQuantity: 10,
        featured: true,
        sizes: null,
        colors: null,
        gender: null,
        type: 'supplement',
      },
      {
        id: "biotin-5000",
        name: "Biotin 10,000 µg Strawberry Gummies",
        description: "High-potency hair, skin & nail support with 10,000µg biotin (20,000% NRV) in delicious strawberry-flavored gummies. Just one gummy a day for optimal beauty support.",
        price: "359.00",
        originalPrice: null,
        imageUrl: "/assets/Biton_1753616500658.png",
        category: "Beauty",
        rating: "4.5",
        reviewCount: 342,
        inStock: true,
        stockQuantity: 10,
        featured: true,
        sizes: null,
        colors: null,
        gender: null,
        type: 'supplement',
      },
      {
        id: "iron-vitamin-c",
        name: "Iron + Vitamin C Gummies (Cherry Flavour)",
        description: "Gentle daily support for energy, focus & iron absorption with 7mg iron and 40mg vitamin C. Bioavailable formula for reduced fatigue and healthy red blood cell formation.",
        price: "349.00",
        originalPrice: null,
        imageUrl: "/assets/Iron + Vitamin C_1753616520150.png",
        category: "Minerals",
        rating: "4.6",
        reviewCount: 189,
        inStock: true,
        stockQuantity: 10,
        featured: true,
        sizes: null,
        colors: null,
        gender: null,
        type: 'supplement',
      },
      {
        id: "folic-acid-400",
        name: "Folic Acid 400µg Gummies (Berry Flavour)",
        description: "Pre-pregnancy & prenatal support with 400µg folic acid for maternal tissue growth and neural tube development. NHS-recommended dose in convenient berry-flavored gummies.",
        price: "329.00",
        originalPrice: null,
        imageUrl: "/assets/Folic Acid 400µg_1753616520150.png",
        category: "Prenatal",
        rating: "4.8",
        reviewCount: 156,
        inStock: true,
        stockQuantity: 10,
        featured: true,
        sizes: null,
        colors: null,
        gender: null,
        type: 'supplement',
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
    };
    this.products.set(id, product);
    return product;
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
      createdAt: new Date().toISOString(),
    };
    this.preOrders.set(id, newPreOrder);
    return newPreOrder;
  }

  async getPreOrders(): Promise<PreOrder[]> {
    return Array.from(this.preOrders.values());
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
}

export const storage = new MemStorage();
