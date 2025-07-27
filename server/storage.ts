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
        imageUrl: "/assets/Apple Cider Vinegar_1753615197742.png",
        category: "Gummies",
        rating: "4.8",
        reviewCount: 247,
        inStock: false,
        featured: true,
        sizes: null,
        colors: null,
        gender: null,
        type: 'supplement',
      },
      {
        id: "vitamin-d3",
        name: "Vitamin D3 1000 IU Gummies (Lemon Flavour)",
        description: "Daily immune & bone support with 1000 IU vitamin D3 in delicious lemon-flavored gummies for adults and teens 12+.",
        price: "15.99",
        originalPrice: "26.99",
        imageUrl: "/assets/Vitamin D3  1000 IU_1753615197740.png",
        category: "Vitamins",
        rating: "4.9",
        reviewCount: 189,
        inStock: false,
        featured: true,
        sizes: null,
        colors: null,
        gender: null,
        type: 'supplement',
      },
      {
        id: "ashwagandha",
        name: "Ashwagandha Gummies (Strawberry Flavour)",
        description: "Adaptogenic stress relief & mood support with 300mg Ashwagandha root extract per gummy. Natural wellbeing support in convenient strawberry-flavored chewables.",
        price: "24.99",
        originalPrice: "34.99",
        imageUrl: "/assets/Ashwagandha 600mg_1753615197741.png",
        category: "Adaptogens",
        rating: "4.7",
        reviewCount: 432,
        inStock: false,
        featured: true,
        sizes: null,
        colors: null,
        gender: null,
        type: 'supplement',
      },
      {
        id: "probiotics",
        name: "10 Billion CFU Probiotic Complex",
        description: "10 billion CFU probiotic supplement complex",
        price: "21.99",
        originalPrice: "29.99",
        imageUrl: "/assets/Probiotics10Bil-X_1753615874344.png",
        category: "Probiotics",
        rating: "4.7",
        reviewCount: 203,
        inStock: false,
        featured: true,
        sizes: null,
        colors: null,
        gender: null,
        type: 'supplement',
      },
      {
        id: "magnesium",
        name: "Magnesium Gummies (Berry Flavour)",
        description: "Support for muscles, mind & energy with 90mg bioavailable magnesium citrate per gummy. Gentle chewable dose for fatigue reduction and electrolyte balance.",
        price: "21.99",
        originalPrice: "29.99",
        imageUrl: "/assets/Magnesium_1753615197741.png",
        category: "Minerals",
        rating: "4.7",
        reviewCount: 234,
        inStock: false,
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
        price: "19.99",
        originalPrice: "29.99",
        imageUrl: "/assets/Multivitamin for Kids_1753615197742.png",
        category: "Children",
        rating: "4.8",
        reviewCount: 312,
        inStock: false,
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
        price: "22.99",
        originalPrice: "32.99",
        imageUrl: "/assets/Porbiotic_Vitamins_1753615197742.png",
        category: "Probiotics",
        rating: "4.7",
        reviewCount: 198,
        inStock: false,
        featured: true,
        sizes: null,
        colors: null,
        gender: null,
        type: 'supplement',
      },
      {
        id: "collagen-complex",
        name: "Collagen Complex Gummies (Orange Flavour)",
        description: "Daily skin, hair & nail support with 500mg hydrolysed collagen peptides plus antioxidant vitamins C, E, biotin and selenium in delicious orange-flavored gummies.",
        price: "26.99",
        originalPrice: "36.99",
        imageUrl: "/assets/Collagen Complex__1753615197742.png",
        category: "Beauty",
        rating: "4.6",
        reviewCount: 267,
        inStock: false,
        featured: true,
        sizes: null,
        colors: null,
        gender: null,
        type: 'supplement',
      },
      {
        id: "biotin-5000",
        name: "Biotin 5000 µg Strawberry Gummies",
        description: "High-potency hair, skin & nail support with 5000µg biotin (10,000% NRV) in delicious strawberry-flavored gummies. Just one gummy a day for optimal beauty support.",
        price: "18.99",
        originalPrice: "26.99",
        imageUrl: "/assets/Biotin  5000µg_1753615890295.png",
        category: "Beauty",
        rating: "4.5",
        reviewCount: 342,
        inStock: false,
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
        price: "19.99",
        originalPrice: "28.99",
        imageUrl: "/assets/Iron + Vitamin C_1753615899091.png",
        category: "Minerals",
        rating: "4.6",
        reviewCount: 189,
        inStock: false,
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
        price: "16.99",
        originalPrice: "24.99",
        imageUrl: "/assets/Folic Acid 400µg_1753615927607.png",
        category: "Prenatal",
        rating: "4.8",
        reviewCount: 156,
        inStock: false,
        featured: true,
        sizes: null,
        colors: null,
        gender: null,
        type: 'supplement',
      },

      // Apparel Products
      {
        id: "healios-jumper-men",
        name: "Healios Performance Jumper - Men's",
        description: "Premium heavyweight cotton-blend jumper with bold Healios branding. Comfortable, durable construction for everyday wear and active lifestyles.",
        price: "45.00",
        originalPrice: "65.00",
        imageUrl: "/images/healios-jumper-men.svg",
        category: "Apparel",
        rating: "4.7",
        reviewCount: 89,
        inStock: true,
        featured: false,
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        colors: ["Black", "Heather Grey", "Navy"],
        gender: "men",
        type: 'apparel',
      },
      {
        id: "healios-jumper-women",
        name: "Healios Performance Jumper - Women's",
        description: "Premium heavyweight cotton-blend jumper with bold Healios branding. Comfortable, durable construction designed for the female form.",
        price: "45.00",
        originalPrice: "65.00", 
        imageUrl: "/images/healios-jumper-women.svg",
        category: "Apparel",
        rating: "4.8",
        reviewCount: 134,
        inStock: true,
        featured: false,
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Black", "Heather Grey", "Soft Pink"],
        gender: "women",
        type: 'apparel',
      },
      {
        id: "healios-tshirt-men",
        name: "Healios Essential T-Shirt - Men's",
        description: "Soft cotton-blend t-shirt featuring clean Healios logo. Perfect for workouts, casual wear, or layering. Comfortable fit that moves with you.",
        price: "25.00",
        originalPrice: "35.00",
        imageUrl: "/images/healios-tshirt-men.svg", 
        category: "Apparel",
        rating: "4.6",
        reviewCount: 203,
        inStock: true,
        featured: false,
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        colors: ["Black", "White", "Charcoal"],
        gender: "men",
        type: 'apparel',
      },
      {
        id: "healios-tshirt-women",
        name: "Healios Essential T-Shirt - Women's",
        description: "Soft cotton-blend t-shirt featuring clean Healios logo. Flattering feminine cut perfect for workouts, casual wear, or layering.",
        price: "25.00",
        originalPrice: "35.00",
        imageUrl: "/images/healios-tshirt-women.svg",
        category: "Apparel", 
        rating: "4.7",
        reviewCount: 156,
        inStock: true,
        featured: false,
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Black", "White", "Soft Pink"],
        gender: "women",
        type: 'apparel',
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
