/**
 * Comprehensive Orders System QA Test Suite
 * Tests all order flows, payment processing, stock management, and concurrency
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq, and, sql } from 'drizzle-orm';
import * as schema from '../../shared/schema';
import { runConcurrentRequests, printConcurrencyReport } from '../helpers/runConcurrency';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
const API_URL = process.env.TEST_API_URL || 'http://localhost:5000';

if (!TEST_DATABASE_URL) {
  throw new Error('❌ No database URL found. Set TEST_DATABASE_URL or DATABASE_URL');
}

const sqlClient = neon(TEST_DATABASE_URL);
const db = drizzle(sqlClient, { schema });

// Test user credentials
const TEST_CUSTOMER = {
  email: 'qa.customer@healios.test',
  password: 'Test123!',
  id: 'qa-customer-001'
};

const TEST_ADMIN = {
  email: 'qa.admin@healios.test',
  password: 'Test123!',
  id: 'qa-admin-001'
};

// Test product IDs
const PRODUCTS = {
  inStock1: 'qa-product-instock-1',
  inStock2: 'qa-product-instock-2',
  inStock3: 'qa-product-instock-3',
  outOfStock: 'qa-product-outofstock',
  preorderOpen: 'qa-product-preorder-open',
  preorderClosed: 'qa-product-preorder-closed'
};

let customerCookie: string;
let adminCookie: string;
let csrfToken: string;

// Helper function to login and get session cookie
async function login(email: string, password: string): Promise<string> {
  const response = await request(API_URL)
    .post('/api/auth/login')
    .send({ email, password });
  
  expect(response.status).toBe(200);
  const cookies = response.headers['set-cookie'];
  return cookies ? cookies[0] : '';
}

// Helper to get CSRF token
async function getCsrfToken(cookie: string): Promise<string> {
  const response = await request(API_URL)
    .get('/api/csrf-token')
    .set('Cookie', cookie);
  
  expect(response.status).toBe(200);
  return response.body.csrfToken;
}

// Helper to create an order
async function createOrder(
  cookie: string,
  items: Array<{ productId: string; quantity: number }>,
  shippingAddress: any
): Promise<string> {
  const response = await request(API_URL)
    .post('/api/orders')
    .set('Cookie', cookie)
    .set('X-CSRF-Token', csrfToken)
    .send({
      items,
      shippingAddress,
      billingAddress: shippingAddress
    });
  
  if (response.status !== 201) {
    throw new Error(`Order creation failed: ${response.body.message || response.status}`);
  }
  
  return response.body.order.id;
}

// Helper to simulate payment webhook
async function simulatePaymentWebhook(
  orderId: string,
  status: 'succeeded' | 'failed' | 'canceled',
  paymentReference?: string
): Promise<void> {
  const webhookPayload = {
    event: `payment.${status}`,
    data: {
      reference: paymentReference || `paystack_test_${crypto.randomBytes(8).toString('hex')}`,
      metadata: { orderId }
    }
  };

  const response = await request(API_URL)
    .post('/api/paystack/webhook')
    .set('x-paystack-signature', 'test_signature')
    .send(webhookPayload);
  
  expect([200, 201]).toContain(response.status);
}

describe('Orders System QA Suite', () => {
  
  beforeAll(async () => {
    console.log('🚀 Starting Orders QA Test Suite...');
    
    // Run seed script to ensure test data exists
    console.log('Seeding test data...');
    const { execSync } = require('child_process');
    execSync('tsx scripts/seed-test.ts', { stdio: 'inherit' });
    
    // Login as customer and admin
    customerCookie = await login(TEST_CUSTOMER.email, TEST_CUSTOMER.password);
    adminCookie = await login(TEST_ADMIN.email, TEST_ADMIN.password);
    csrfToken = await getCsrfToken(customerCookie);
  });

  afterAll(async () => {
    console.log('✅ Orders QA Test Suite Complete');
  });

  describe('A. Cart & Order Creation', () => {
    
    it('should add in-stock products to cart', async () => {
      const response = await request(API_URL)
        .post('/api/cart')
        .set('Cookie', customerCookie)
        .set('X-CSRF-Token', csrfToken)
        .send({
          productId: PRODUCTS.inStock1,
          quantity: 2
        });
      
      expect(response.status).toBe(200);
      expect(response.body.message).toContain('added to cart');
    });

    it('should calculate correct order totals with tax and shipping', async () => {
      const items = [
        { productId: PRODUCTS.inStock1, quantity: 2 }, // 99.99 * 2 = 199.98
        { productId: PRODUCTS.inStock3, quantity: 1 }  // 599.99
      ];
      
      const orderId = await createOrder(customerCookie, items, {
        line1: '123 Test Street',
        city: 'Cape Town',
        zip: '8001',
        country: 'South Africa'
      });
      
      // Verify order in database
      const order = await db.select().from(schema.orders)
        .where(eq(schema.orders.id, orderId))
        .limit(1);
      
      expect(order[0]).toBeDefined();
      const subtotal = 199.98 + 599.99; // 799.97
      const tax = subtotal * 0.15; // 119.995
      const shipping = 50; // Assuming flat rate
      const expectedTotal = subtotal + tax + shipping; // 969.965 -> 969.97
      
      expect(parseFloat(order[0].totalAmount)).toBeCloseTo(expectedTotal, 2);
      expect(order[0].orderStatus).toBe('processing');
      expect(order[0].paymentStatus).toBe('pending');
    });

    it('should reject cart addition for out-of-stock products', async () => {
      const response = await request(API_URL)
        .post('/api/cart')
        .set('Cookie', customerCookie)
        .set('X-CSRF-Token', csrfToken)
        .send({
          productId: PRODUCTS.outOfStock,
          quantity: 1
        });
      
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('out of stock');
    });
  });

  describe('B. Payment Lifecycle & Idempotency', () => {
    let testOrderId: string;
    let paymentReference: string;

    beforeEach(async () => {
      // Create a test order
      testOrderId = await createOrder(customerCookie, 
        [{ productId: PRODUCTS.inStock2, quantity: 1 }],
        {
          line1: '456 Payment Test',
          city: 'Johannesburg',
          zip: '2000',
          country: 'South Africa'
        }
      );
      paymentReference = `paystack_test_${crypto.randomBytes(8).toString('hex')}`;
    });

    it('should transition order to paid on payment success', async () => {
      // Simulate successful payment
      await simulatePaymentWebhook(testOrderId, 'succeeded', paymentReference);
      
      // Verify order status
      const order = await db.select().from(schema.orders)
        .where(eq(schema.orders.id, testOrderId))
        .limit(1);
      
      expect(order[0].paymentStatus).toBe('completed');
      expect(order[0].paidAt).toBeTruthy();
      expect(order[0].paystackReference).toBe(paymentReference);
    });

    it('should handle idempotent payment webhooks', async () => {
      // First webhook
      await simulatePaymentWebhook(testOrderId, 'succeeded', paymentReference);
      
      // Get initial state
      const orderBefore = await db.select().from(schema.orders)
        .where(eq(schema.orders.id, testOrderId))
        .limit(1);
      
      // Second identical webhook (idempotency test)
      await simulatePaymentWebhook(testOrderId, 'succeeded', paymentReference);
      
      // Verify no duplicate processing
      const orderAfter = await db.select().from(schema.orders)
        .where(eq(schema.orders.id, testOrderId))
        .limit(1);
      
      expect(orderAfter[0].paidAt).toBe(orderBefore[0].paidAt);
      expect(orderAfter[0].updatedAt).toBe(orderBefore[0].updatedAt);
    });

    it('should handle payment failure correctly', async () => {
      const failedOrderId = await createOrder(customerCookie,
        [{ productId: PRODUCTS.inStock1, quantity: 1 }],
        {
          line1: '789 Fail Test',
          city: 'Durban',
          zip: '4000',
          country: 'South Africa'
        }
      );
      
      await simulatePaymentWebhook(failedOrderId, 'failed');
      
      const order = await db.select().from(schema.orders)
        .where(eq(schema.orders.id, failedOrderId))
        .limit(1);
      
      expect(order[0].paymentStatus).toBe('failed');
      expect(order[0].paidAt).toBeNull();
    });
  });

  describe('C. Stock & Pre-order Rules', () => {
    
    it('should decrement stock on successful payment', async () => {
      // Get initial stock
      const productBefore = await db.select().from(schema.products)
        .where(eq(schema.products.id, PRODUCTS.inStock1))
        .limit(1);
      const initialStock = productBefore[0].stockQuantity;
      
      // Create and pay for order
      const orderId = await createOrder(customerCookie,
        [{ productId: PRODUCTS.inStock1, quantity: 3 }],
        {
          line1: 'Stock Test',
          city: 'Cape Town',
          zip: '8000',
          country: 'South Africa'
        }
      );
      
      await simulatePaymentWebhook(orderId, 'succeeded');
      
      // Verify stock decremented
      const productAfter = await db.select().from(schema.products)
        .where(eq(schema.products.id, PRODUCTS.inStock1))
        .limit(1);
      
      expect(productAfter[0].stockQuantity).toBe(initialStock - 3);
    });

    it('should allow pre-order when enabled and under cap', async () => {
      const orderId = await createOrder(customerCookie,
        [{ productId: PRODUCTS.preorderOpen, quantity: 1 }],
        {
          line1: 'Pre-order Test',
          city: 'Cape Town',
          zip: '8000',
          country: 'South Africa'
        }
      );
      
      await simulatePaymentWebhook(orderId, 'succeeded');
      
      // Verify pre-order count incremented
      const product = await db.select().from(schema.products)
        .where(eq(schema.products.id, PRODUCTS.preorderOpen))
        .limit(1);
      
      expect(product[0].preorderCount).toBe(1);
    });

    it('should reject orders for closed pre-orders', async () => {
      try {
        await createOrder(customerCookie,
          [{ productId: PRODUCTS.preorderClosed, quantity: 1 }],
          {
            line1: 'Closed Pre-order Test',
            city: 'Cape Town',
            zip: '8000',
            country: 'South Africa'
          }
        );
        expect.fail('Should have rejected closed pre-order');
      } catch (error: any) {
        expect(error.message).toContain('pre-order');
      }
    });
  });

  describe('D. Concurrency Tests', () => {
    
    it('should handle concurrent pre-order attempts correctly', async () => {
      // Reset pre-order count for testing
      await db.update(schema.products)
        .set({ preorderCount: 0 })
        .where(eq(schema.products.id, PRODUCTS.preorderOpen));
      
      const result = await runConcurrentRequests(async () => {
        const start = Date.now();
        try {
          const orderId = await createOrder(customerCookie,
            [{ productId: PRODUCTS.preorderOpen, quantity: 1 }],
            {
              line1: `Concurrent Test ${Date.now()}`,
              city: 'Cape Town',
              zip: '8000',
              country: 'South Africa'
            }
          );
          
          await simulatePaymentWebhook(orderId, 'succeeded');
          
          return {
            success: true,
            latency: Date.now() - start
          };
        } catch (error: any) {
          return {
            success: false,
            status: error.status || 409,
            message: error.message,
            latency: Date.now() - start
          };
        }
      }, 20); // 20 concurrent attempts for cap of 3
      
      printConcurrencyReport('Pre-order Concurrency', result);
      
      // Verify exactly 3 succeeded (the cap)
      expect(result.successCount).toBe(3);
      expect(result.failureCount).toBe(17);
      
      // Verify database state
      const product = await db.select().from(schema.products)
        .where(eq(schema.products.id, PRODUCTS.preorderOpen))
        .limit(1);
      
      expect(product[0].preorderCount).toBe(3);
      expect(product[0].preorderCount).toBeLessThanOrEqual(product[0].preorderCap!);
    });

    it('should handle concurrent stock orders correctly', async () => {
      // Set specific stock level for testing
      await db.update(schema.products)
        .set({ stockQuantity: 5 })
        .where(eq(schema.products.id, PRODUCTS.inStock2));
      
      const result = await runConcurrentRequests(async () => {
        const start = Date.now();
        try {
          const orderId = await createOrder(customerCookie,
            [{ productId: PRODUCTS.inStock2, quantity: 1 }],
            {
              line1: `Stock Concurrent ${Date.now()}`,
              city: 'Cape Town',
              zip: '8000',
              country: 'South Africa'
            }
          );
          
          await simulatePaymentWebhook(orderId, 'succeeded');
          
          return {
            success: true,
            latency: Date.now() - start
          };
        } catch (error: any) {
          return {
            success: false,
            status: error.status || 409,
            message: error.message,
            latency: Date.now() - start
          };
        }
      }, 20); // 20 concurrent attempts for stock of 5
      
      printConcurrencyReport('Stock Concurrency', result);
      
      // Verify maximum 5 succeeded (the stock level)
      expect(result.successCount).toBeLessThanOrEqual(5);
      
      // Verify no negative stock
      const product = await db.select().from(schema.products)
        .where(eq(schema.products.id, PRODUCTS.inStock2))
        .limit(1);
      
      expect(product[0].stockQuantity).toBeGreaterThanOrEqual(0);
    });
  });

  describe('E. Totals & Taxes', () => {
    
    it('should calculate correct totals with multiple line items', async () => {
      const items = [
        { productId: PRODUCTS.inStock1, quantity: 2 },  // 99.99 * 2
        { productId: PRODUCTS.inStock2, quantity: 1 },  // 149.99
        { productId: PRODUCTS.inStock3, quantity: 1 }   // 599.99
      ];
      
      const orderId = await createOrder(customerCookie, items, {
        line1: 'Totals Test',
        city: 'Cape Town',
        zip: '8000',
        country: 'South Africa'
      });
      
      // Get order and items
      const order = await db.select().from(schema.orders)
        .where(eq(schema.orders.id, orderId))
        .limit(1);
      
      const orderItems = await db.select().from(schema.orderItems)
        .where(eq(schema.orderItems.orderId, orderId));
      
      // Calculate expected totals
      const subtotal = orderItems.reduce((sum, item) => 
        sum + (parseFloat(item.price) * item.quantity), 0);
      
      expect(orderItems).toHaveLength(3);
      expect(subtotal).toBeCloseTo(949.95, 2);
      
      // Verify tax calculation (15% VAT)
      const expectedTax = subtotal * 0.15;
      expect(parseFloat(order[0].taxAmount || '0')).toBeCloseTo(expectedTax, 2);
    });

    it('should store immutable price snapshots in order items', async () => {
      const orderId = await createOrder(customerCookie,
        [{ productId: PRODUCTS.inStock3, quantity: 1 }],
        {
          line1: 'Snapshot Test',
          city: 'Cape Town',
          zip: '8000',
          country: 'South Africa'
        }
      );
      
      // Get order item
      const orderItem = await db.select().from(schema.orderItems)
        .where(eq(schema.orderItems.orderId, orderId))
        .limit(1);
      
      // Change product price
      await db.update(schema.products)
        .set({ price: '999.99' })
        .where(eq(schema.products.id, PRODUCTS.inStock3));
      
      // Verify order item price unchanged
      const orderItemAfter = await db.select().from(schema.orderItems)
        .where(eq(schema.orderItems.orderId, orderId))
        .limit(1);
      
      expect(orderItemAfter[0].price).toBe(orderItem[0].price);
      expect(parseFloat(orderItemAfter[0].price)).toBe(599.99);
    });
  });

  describe('F. Security & RBAC', () => {
    
    it('should reject unauthenticated access to admin endpoints', async () => {
      const response = await request(API_URL)
        .get('/api/admin/orders');
      
      expect(response.status).toBe(401);
    });

    it('should reject non-admin access to admin endpoints', async () => {
      const response = await request(API_URL)
        .get('/api/admin/orders')
        .set('Cookie', customerCookie);
      
      expect(response.status).toBe(403);
    });

    it('should allow admin access to order management', async () => {
      const response = await request(API_URL)
        .get('/api/admin/orders')
        .set('Cookie', adminCookie);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('orders');
    });

    it('should enforce CSRF protection on state-changing endpoints', async () => {
      const response = await request(API_URL)
        .post('/api/orders')
        .set('Cookie', customerCookie)
        // Deliberately omit CSRF token
        .send({
          items: [{ productId: PRODUCTS.inStock1, quantity: 1 }],
          shippingAddress: { line1: 'Test', city: 'Test', zip: '1234', country: 'Test' }
        });
      
      expect([403, 400]).toContain(response.status);
    });
  });

  describe('G. Refunds/Voids', () => {
    
    it('should process refunds correctly', async () => {
      // Create and pay for an order
      const orderId = await createOrder(customerCookie,
        [{ productId: PRODUCTS.inStock1, quantity: 1 }],
        {
          line1: 'Refund Test',
          city: 'Cape Town',
          zip: '8000',
          country: 'South Africa'
        }
      );
      
      await simulatePaymentWebhook(orderId, 'succeeded');
      
      // Admin processes refund
      const adminCsrf = await getCsrfToken(adminCookie);
      const response = await request(API_URL)
        .post(`/api/admin/orders/${orderId}/refund`)
        .set('Cookie', adminCookie)
        .set('X-CSRF-Token', adminCsrf)
        .send({ amount: 'full' });
      
      expect([200, 201]).toContain(response.status);
      
      // Verify order status
      const order = await db.select().from(schema.orders)
        .where(eq(schema.orders.id, orderId))
        .limit(1);
      
      expect(order[0].refundStatus).toBe('refunded');
    });

    it('should handle idempotent refund requests', async () => {
      const orderId = await createOrder(customerCookie,
        [{ productId: PRODUCTS.inStock2, quantity: 1 }],
        {
          line1: 'Double Refund Test',
          city: 'Cape Town',
          zip: '8000',
          country: 'South Africa'
        }
      );
      
      await simulatePaymentWebhook(orderId, 'succeeded');
      
      const adminCsrf = await getCsrfToken(adminCookie);
      
      // First refund
      await request(API_URL)
        .post(`/api/admin/orders/${orderId}/refund`)
        .set('Cookie', adminCookie)
        .set('X-CSRF-Token', adminCsrf)
        .send({ amount: 'full' });
      
      // Second refund attempt
      const response = await request(API_URL)
        .post(`/api/admin/orders/${orderId}/refund`)
        .set('Cookie', adminCookie)
        .set('X-CSRF-Token', adminCsrf)
        .send({ amount: 'full' });
      
      // Should be idempotent - either success or specific error
      expect([200, 400]).toContain(response.status);
      if (response.status === 400) {
        expect(response.body.message).toContain('already refunded');
      }
    });
  });

  describe('H. Observability', () => {
    
    it('should return machine-readable error codes', async () => {
      // Try to order closed pre-order
      const response = await request(API_URL)
        .post('/api/orders')
        .set('Cookie', customerCookie)
        .set('X-CSRF-Token', csrfToken)
        .send({
          items: [{ productId: PRODUCTS.preorderClosed, quantity: 1 }],
          shippingAddress: { line1: 'Test', city: 'Test', zip: '1234', country: 'Test' }
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('code');
      expect(['PREORDER_CAP_REACHED', 'OUT_OF_STOCK']).toContain(response.body.code);
    });

    it('should include order IDs in responses', async () => {
      const orderId = await createOrder(customerCookie,
        [{ productId: PRODUCTS.inStock1, quantity: 1 }],
        {
          line1: 'Observability Test',
          city: 'Cape Town',
          zip: '8000',
          country: 'South Africa'
        }
      );
      
      expect(orderId).toBeTruthy();
      expect(orderId).toMatch(/^[a-zA-Z0-9-]+$/);
    });
  });
});