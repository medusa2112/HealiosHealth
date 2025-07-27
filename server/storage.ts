import { type Product, type InsertProduct, type Newsletter, type InsertNewsletter, type PreOrder, type InsertPreOrder } from "@shared/schema";
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
}

export class MemStorage implements IStorage {
  private products: Map<string, Product>;
  private newsletters: Map<string, Newsletter>;
  private preOrders: Map<string, PreOrder>;

  constructor() {
    this.products = new Map();
    this.newsletters = new Map();
    this.preOrders = new Map();
    this.seedData();
  }

  private seedData() {
    const sampleProducts: Product[] = [
      // Healios Products matching frontend
      {
        id: "apple-cider-vinegar",
        name: "Apple Cider Vinegar Gummies (Strawberry Flavour)",
        description: "Daily metabolic & gut support with 500mg concentrated Apple Cider Vinegar powder per gummy. Stomach-friendly format without the burn or enamel erosion.",
        price: "21.99",
        originalPrice: "29.99",
        imageUrl: "/images/apple-cider-vinegar-gummies.svg",
        category: "Gummies",
        rating: "4.8",
        reviewCount: 247,
        inStock: false,
        featured: true,
      },
      {
        id: "vitamin-d3",
        name: "Vitamin D3 1000 IU Gummies (Lemon Flavour)",
        description: "Daily immune & bone support with 1000 IU vitamin D3 in delicious lemon-flavored gummies for adults and teens 12+.",
        price: "15.99",
        originalPrice: "26.99",
        imageUrl: "/images/vitamin-d3-gummies.svg",
        category: "Vitamins",
        rating: "4.9",
        reviewCount: 189,
        inStock: false,
        featured: true,
      },
      {
        id: "ashwagandha",
        name: "Ashwagandha Gummies (Strawberry Flavour)",
        description: "Adaptogenic stress relief & mood support with 300mg Ashwagandha root extract per gummy. Natural wellbeing support in convenient strawberry-flavored chewables.",
        price: "24.99",
        originalPrice: "34.99",
        imageUrl: "/images/ashwagandha-gummies.svg",
        category: "Adaptogens",
        rating: "4.7",
        reviewCount: 432,
        inStock: false,
        featured: true,
      },
      {
        id: "probiotics",
        name: "10 Billion CFU Probiotic Complex",
        description: "10 billion CFU probiotic supplement complex",
        price: "21.99",
        originalPrice: "29.99",
        imageUrl: "/images/probiotics-gummies.svg",
        category: "Probiotics",
        rating: "4.7",
        reviewCount: 203,
        inStock: false,
        featured: true,
      },
      {
        id: "magnesium",
        name: "Magnesium Gummies (Berry Flavour)",
        description: "Support for muscles, mind & energy with 90mg bioavailable magnesium citrate per gummy. Gentle chewable dose for fatigue reduction and electrolyte balance.",
        price: "21.99",
        originalPrice: "29.99",
        imageUrl: "/images/magnesium-gummies.svg",
        category: "Minerals",
        rating: "4.7",
        reviewCount: 234,
        inStock: false,
        featured: true,
      },
      {
        id: "childrens-multivitamin",
        name: "Children's Multivitamin & Mineral Gummies",
        description: "Complete daily nutrient support for growing bodies (Ages 3+) with 13 essential vitamins and minerals in delicious berry-flavored gummies.",
        price: "19.99",
        originalPrice: "29.99",
        imageUrl: "/assets/Multivitamin & Mineral for Children_1753612563199.png",
        category: "Children",
        rating: "4.8",
        reviewCount: 312,
        inStock: false,
        featured: true,
      },
      {
        id: "probiotic-vitamins",
        name: "Probiotic + Vitamins Gummies",
        description: "Digestive balance meets energy & immunity – all in one pineapple-flavored gummy with 3-strain probiotic blend and essential B & C vitamins.",
        price: "22.99",
        originalPrice: "32.99",
        imageUrl: "/images/probiotic-vitamins-gummies.svg",
        category: "Probiotics",
        rating: "4.7",
        reviewCount: 198,
        inStock: false,
        featured: true,
      },
      {
        id: "collagen-complex",
        name: "Collagen Complex Gummies (Orange Flavour)",
        description: "Daily skin, hair & nail support with 500mg hydrolysed collagen peptides plus antioxidant vitamins C, E, biotin and selenium in delicious orange-flavored gummies.",
        price: "26.99",
        originalPrice: "36.99",
        imageUrl: "/images/collagen-complex-gummies.svg",
        category: "Beauty",
        rating: "4.6",
        reviewCount: 267,
        inStock: false,
        featured: true,
      },
      {
        id: "biotin-5000",
        name: "Biotin 5000 µg Strawberry Gummies",
        description: "High-potency hair, skin & nail support with 5000µg biotin (10,000% NRV) in delicious strawberry-flavored gummies. Just one gummy a day for optimal beauty support.",
        price: "18.99",
        originalPrice: "26.99",
        imageUrl: "/images/biotin-gummies.svg",
        category: "Beauty",
        rating: "4.5",
        reviewCount: 342,
        inStock: false,
        featured: true,
      },
      {
        id: "iron-vitamin-c",
        name: "Iron + Vitamin C Gummies (Cherry Flavour)",
        description: "Gentle daily support for energy, focus & iron absorption with 7mg iron and 40mg vitamin C. Bioavailable formula for reduced fatigue and healthy red blood cell formation.",
        price: "19.99",
        originalPrice: "28.99",
        imageUrl: "/images/iron-vitamin-c-gummies.svg",
        category: "Minerals",
        rating: "4.6",
        reviewCount: 189,
        inStock: false,
        featured: true,
      },
      {
        id: "folic-acid-400",
        name: "Folic Acid 400µg Gummies (Berry Flavour)",
        description: "Pre-pregnancy & prenatal support with 400µg folic acid for maternal tissue growth and neural tube development. NHS-recommended dose in convenient berry-flavored gummies.",
        price: "16.99",
        originalPrice: "24.99",
        imageUrl: "/images/folic-acid-gummies.svg",
        category: "Prenatal",
        rating: "4.8",
        reviewCount: 156,
        inStock: false,
        featured: true,
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
      featured: insertProduct.featured || false,
      originalPrice: insertProduct.originalPrice || null,
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
}

export const storage = new MemStorage();
