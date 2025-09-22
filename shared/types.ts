// Shared type definitions to avoid duplication across components
// These are client-side interfaces that complement the database schema types

export interface Article {
  id: string;
  title: string;
  slug: string;
  metaDescription: string;
  content: string;
  research: string;
  sources: string[];
  createdAt: string;
}

export interface Order {
  id: string;
  customerEmail: string;
  customerName?: string;
  totalAmount: string;
  currency: 'ZAR';
  paymentStatus: string;
  orderStatus: string;
  refundStatus?: string;
  disputeStatus?: string;
  stripePaymentIntentId?: string;
  stripeSessionId?: string;
  createdAt: string;
  updatedAt?: string;
  trackingNumber?: string | null;
  orderItems: string | Array<{
    id: string;
    name: string;
    price: string;
    quantity: number;
  }>;
  items?: Array<{
    id: string;
    name: string;
    price: string;
    quantity: number;
  }>;
}

export interface CustomerPortalData {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  orders: Array<{
    id: string;
    totalAmount: string;
    currency: 'ZAR';
    orderStatus: string;
    paymentStatus: string;
    createdAt: string;
    trackingNumber: string | null;
    items: any[];
  }>;
  addresses?: Array<{
    id: string;
    type: string;
    line1: string;
    line2: string | null;
    city: string | null;
    zip: string | null;
    country: string | null;
  }>;
  quizResults: Array<{
    id: string;
    completedAt: string;
    recommendationsCount?: number;
    answers?: any;
    recommendations?: any;
  }>;
  stats: {
    totalOrders: number;
    totalSpent: number | string;
  };
}

export interface Address {
  id: string;
  userId?: string;
  type: string;
  line1: string;
  line2: string | null;
  city: string | null;
  state?: string | null;
  zipCode: string | null;  // Changed from zip to zipCode to match database schema
  country: string | null;
  isDefault?: boolean | null;
  createdAt?: string;
}

export interface QuizResult {
  id: string;
  completedAt: string;
  answers: any;
  recommendations: any;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: any;
}

export interface CartItem {
  id?: string;
  productId: string;
  productName?: string;
  name?: string; // Alternative property name used in some contexts
  quantity: number;
  price: number;
  variant?: string;
  productImage?: string;
}

export interface AbandonedCart {
  id: string;
  userId?: string | null;
  sessionToken: string;
  userEmail?: string;
  items: string | CartItem[];
  totalAmount: number | string | null;
  currency?: 'ZAR' | null;
  lastActivityAt?: string;
  lastUpdated?: string;
  createdAt: string;
  convertedToOrder: boolean;
  stripeSessionId?: string | null;
}

// User type that matches the auth context
export interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: string;
}

// Extended Product type that includes computed fields from API
export interface ProductWithAvailability {
  id: string;
  name: string;
  description: string;
  price: string;
  originalPrice: string | null;
  imageUrl: string;
  categories: string[];
  rating: string | null;
  reviewCount: number | null;
  inStock: boolean | null;
  stockQuantity: number | null;
  featured: boolean | null;
  sizes: string[] | null;
  colors: string[] | null;
  gender: string | null;
  type: string | null;
  bottleCount: number | null;
  dailyDosage: number | null;
  supplyDays: number | null;
  tags: string[] | null;
  allowPreorder: boolean | null;
  preorderCap: number | null;
  preorderCount: number | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string[] | null;
  version: number;
  createdAt: string | null;
  updatedAt: string | null;
  // Computed fields added by API
  availability: 'in_stock' | 'preorder_open' | 'out_of_stock';
  isOrderable: boolean;
}