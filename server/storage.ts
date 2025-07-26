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
      // Healios Products matching frontend
      {
        id: "apple-cider-vinegar",
        name: "Apple Cider Vinegar & Ginger (60 Gummies)",
        description: "Digestive support with metabolic wellness and anti-inflammatory properties",
        price: "16.99",
        originalPrice: "29.99",
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        category: "Gummies",
        rating: "4.8",
        reviewCount: 247,
        inStock: true,
        featured: true,
      },
      {
        id: "vitamin-d3",
        name: "Vitamin D3 (60 Gummies)",
        description: "Immunity support, bone health, and mood support",
        price: "15.99",
        originalPrice: "26.99",
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        category: "Vitamins",
        rating: "4.9",
        reviewCount: 189,
        inStock: true,
        featured: true,
      },
      {
        id: "ashwagandha",
        name: "KSM-66 Ashwagandha Capsules",
        description: "Stress relief, cognitive support, and energy enhancement",
        price: "24.99",
        originalPrice: "34.99",
        imageUrl: "https://images.unsplash.com/photo-1609501676725-7186f734cd16?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        category: "Adaptogens",
        rating: "4.6",
        reviewCount: 156,
        inStock: true,
        featured: true,
      },
      {
        id: "probiotics",
        name: "10 Billion CFU Probiotic Complex",
        description: "Digestive health support with gut microbiome balance",
        price: "21.99",
        originalPrice: "29.99",
        imageUrl: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        category: "Probiotics",
        rating: "4.7",
        reviewCount: 203,
        inStock: true,
        featured: true,
      },
      {
        id: "magnesium",
        name: "Magnesium Complex Capsules",
        description: "Sleep support, muscle recovery, and stress relief",
        price: "18.99",
        originalPrice: "28.99",
        imageUrl: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        category: "Minerals",
        rating: "4.5",
        reviewCount: 134,
        inStock: true,
        featured: true,
      },
      // Additional products
      {
        id: "omega-3",
        name: "Omega-3 Complex",
        description: "Pure fish oil with EPA & DHA for heart and brain health",
        price: "32.00",
        originalPrice: "38.00",
        imageUrl: "https://images.unsplash.com/photo-1628771065518-0d82f1938462?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        category: "Supplements",
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
}

export const storage = new MemStorage();
