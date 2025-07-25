import { type Product, type InsertProduct, type Newsletter, type InsertNewsletter } from "@shared/schema";
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
}

export class MemStorage implements IStorage {
  private products: Map<string, Product>;
  private newsletters: Map<string, Newsletter>;

  constructor() {
    this.products = new Map();
    this.newsletters = new Map();
    this.seedData();
  }

  private seedData() {
    const sampleProducts: Product[] = [
      {
        id: "1",
        name: "Premium Multivitamin",
        description: "Complete daily nutrition with 25 essential vitamins and minerals sourced from organic whole foods",
        price: "45.00",
        originalPrice: "60.00",
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        category: "Vitamins",
        rating: "4.8",
        reviewCount: 247,
        inStock: true,
        featured: true,
      },
      {
        id: "2",
        name: "Omega-3 Complex",
        description: "Pure fish oil with EPA & DHA for heart and brain health. Sustainably sourced from wild-caught fish",
        price: "38.00",
        originalPrice: null,
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        category: "Supplements",
        rating: "4.9",
        reviewCount: 189,
        inStock: true,
        featured: true,
      },
      {
        id: "3",
        name: "Greens Superfood",
        description: "Organic blend of 20+ superfoods including spirulina, chlorella, and wheatgrass for daily vitality",
        price: "52.00",
        originalPrice: "65.00",
        imageUrl: "https://images.unsplash.com/photo-1609501676725-7186f734cd16?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        category: "Superfoods",
        rating: "4.6",
        reviewCount: 156,
        inStock: true,
        featured: true,
      },
      {
        id: "4",
        name: "Probiotic Complex",
        description: "50 billion CFU multi-strain probiotic for digestive health and immune support",
        price: "42.00",
        originalPrice: null,
        imageUrl: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        category: "Probiotics",
        rating: "4.7",
        reviewCount: 203,
        inStock: true,
        featured: false,
      },
      {
        id: "5",
        name: "Plant Protein Powder",
        description: "Complete amino acid profile from pea, rice, and hemp proteins. Vanilla flavored, naturally sweetened",
        price: "48.00",
        originalPrice: "55.00",
        imageUrl: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        category: "Protein",
        rating: "4.5",
        reviewCount: 134,
        inStock: true,
        featured: false,
      },
      {
        id: "6",
        name: "Magnesium Glycinate",
        description: "Highly bioavailable form of magnesium for muscle relaxation, sleep support, and stress relief",
        price: "32.00",
        originalPrice: null,
        imageUrl: "https://images.unsplash.com/photo-1628771065518-0d82f1938462?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        category: "Minerals",
        rating: "4.8",
        reviewCount: 298,
        inStock: true,
        featured: false,
      }
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
}

export const storage = new MemStorage();
