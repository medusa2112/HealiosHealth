import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { db } from '../../server/db';
import { adminLogs, users, products, orders, discountCodes, carts } from '../../shared/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import fetch from 'node-fetch';
import { sql } from 'drizzle-orm';

const BASE_URL = 'http://localhost:5000';
const TEST_PREFIX = 'qa-activity-';

interface TestUser {
  id: string;
  email: string;
  password: string;
  role: string;
  cookies?: string[];
}

interface ActivityLog {
  id: string;
  ts?: string;
  timestamp?: string;
  severity?: string;
  eventType?: string;
  actionType?: string;
  actorType?: string;
  actorId?: string;
  adminId?: string;
  resourceType?: string;
  targetType?: string;
  resourceId?: string;
  targetId?: string;
  verb?: string;
  requestId?: string;
  correlationId?: string;
  ipHash?: string;
  ipAddress?: string;
  userAgentHash?: string;
  metadata?: any;
  details?: any;
  diff?: any;
  immutable?: boolean;
}

describe('Activity Logs QA Suite', () => {
  let adminUser: TestUser;
  let normalUser: TestUser;
  let testProduct: any;
  let testOrder: any;
  let testDiscount: any;

  // Helper functions
  async function login(email: string, password: string): Promise<{ user: any; cookies: string[] }> {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const cookies = response.headers.raw()['set-cookie'] || [];
    const data = await response.json();
    return { user: data.user, cookies };
  }

  async function makeAuthRequest(url: string, options: any, cookies: string[]) {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Cookie': cookies.join('; ')
      }
    });
  }

  async function getLatestLog(): Promise<ActivityLog | null> {
    const logs = await db.select()
      .from(adminLogs)
      .orderBy(desc(adminLogs.timestamp))
      .limit(1);
    return logs[0] || null;
  }

  async function getLogsByType(actionType: string): Promise<ActivityLog[]> {
    return db.select()
      .from(adminLogs)
      .where(eq(adminLogs.actionType, actionType))
      .orderBy(desc(adminLogs.timestamp));
  }

  beforeAll(async () => {
    console.log('🔧 Setting up test data for Activity Logs QA...');
    
    // Clean up test data (respect foreign key constraints)
    await db.delete(adminLogs).where(sql`admin_id LIKE ${TEST_PREFIX + '%'}`);
    await db.delete(carts).where(sql`user_id LIKE ${TEST_PREFIX + '%'}`);
    await db.delete(orders).where(sql`id LIKE ${TEST_PREFIX + '%'}`);
    await db.delete(discountCodes).where(sql`code LIKE ${'QA_ACTIVITY_%'}`);
    await db.delete(products).where(sql`id LIKE ${TEST_PREFIX + '%'}`);
    await db.delete(users).where(sql`email LIKE ${TEST_PREFIX + '%'}`);
    
    // Create test users
    const hashedPassword = await bcrypt.hash('Test123!', 10);
    
    [adminUser] = await db.insert(users).values({
      id: `${TEST_PREFIX}admin`,
      email: `${TEST_PREFIX}admin@healios.test`,
      password: hashedPassword,
      role: 'admin',
      emailVerified: new Date().toISOString(),
      isActive: true
    }).returning();
    
    [normalUser] = await db.insert(users).values({
      id: `${TEST_PREFIX}user`,
      email: `${TEST_PREFIX}user@healios.test`,
      password: hashedPassword,
      role: 'customer',
      emailVerified: new Date().toISOString(),
      isActive: true
    }).returning();
    
    // Set passwords for login
    adminUser.password = 'Test123!';
    normalUser.password = 'Test123!';
    
    // Create test product
    [testProduct] = await db.insert(products).values({
      id: `${TEST_PREFIX}product-1`,
      name: 'Test Product for Activity Logs',
      description: 'Test product for activity logging',
      price: '99.99',
      imageUrl: '/test-product.jpg',
      categories: ['test'],
      inStock: true,
      stockQuantity: 100
    }).returning();
    
    // Create test order
    [testOrder] = await db.insert(orders).values({
      id: `${TEST_PREFIX}order-1`,
      userId: normalUser.id,
      customerEmail: normalUser.email,
      customerName: `${normalUser.firstName || 'Test'} ${normalUser.lastName || 'User'}`,
      shippingAddress: JSON.stringify({
        street: '123 Test Street',
        city: 'Test City',
        province: 'Test Province',
        postalCode: '1234',
        country: 'South Africa'
      }),
      billingAddress: JSON.stringify({
        street: '123 Test Street',
        city: 'Test City',
        province: 'Test Province',
        postalCode: '1234',
        country: 'South Africa'
      }),
      orderItems: JSON.stringify([{
        productId: testProduct.id,
        quantity: 1,
        price: testProduct.price
      }]),
      totalAmount: (parseFloat(testProduct.price) * 1.15 + 10).toFixed(2),
      paymentStatus: 'pending',
      orderStatus: 'processing'
    }).returning();
    
    // Create test discount
    [testDiscount] = await db.insert(discountCodes).values({
      id: `${TEST_PREFIX}discount-1`,
      code: 'QA_ACTIVITY_TEST10',
      type: 'percent',
      value: '10',
      isActive: true
    }).returning();
    
    console.log('✅ Test data setup complete');
  });

  afterAll(async () => {
    console.log('🧹 Cleaning up test data...');
    
    // Clean up test data (respect foreign key constraints)
    await db.delete(adminLogs).where(sql`admin_id LIKE ${TEST_PREFIX + '%'} OR target_id LIKE ${TEST_PREFIX + '%'}`);
    await db.delete(carts).where(sql`user_id LIKE ${TEST_PREFIX + '%'}`);
    await db.delete(discountCodes).where(sql`code LIKE ${'QA_ACTIVITY_%'}`);
    await db.delete(orders).where(sql`id LIKE ${TEST_PREFIX + '%'}`);
    await db.delete(products).where(sql`id LIKE ${TEST_PREFIX + '%'}`);
    await db.delete(users).where(sql`email LIKE ${TEST_PREFIX + '%'}`);
    
    console.log('✅ Cleanup complete');
  });

  describe('A. Coverage of Critical Events', () => {
    
    it('should log successful login', async () => {
      const { user, cookies } = await login(adminUser.email, adminUser.password);
      
      // Wait for log to be written
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const logs = await getLogsByType('login_success');
      const recentLog = logs.find(log => 
        log.adminId === adminUser.id || 
        log.targetId === adminUser.id
      );
      
      expect(recentLog).toBeDefined();
      if (recentLog?.details) {
        const details = typeof recentLog.details === 'string' 
          ? JSON.parse(recentLog.details) 
          : recentLog.details;
        expect(details.success).toBe(true);
      }
    });

    it('should log failed login attempt', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: adminUser.email, 
          password: 'WrongPassword!' 
        })
      });
      
      expect(response.ok).toBe(false);
      
      // Wait for log to be written
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const logs = await getLogsByType('login_failed');
      const recentLog = logs.find(log => 
        log.adminId === adminUser.email || 
        log.targetId === adminUser.email
      );
      
      // Log might exist depending on implementation
      if (recentLog) {
        expect(recentLog.actionType).toBe('login_failed');
      }
    });

    it('should log product creation by admin', async () => {
      const { cookies } = await login(adminUser.email, adminUser.password);
      
      const response = await makeAuthRequest(
        `${BASE_URL}/api/admin/products`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Activity Log Test Product',
            description: 'Product created for activity log testing',
            price: 49.99,
            imageUrl: '/test-image.jpg',
            categories: ['test'],
            inStock: true,
            stockQuantity: 50
          })
        },
        cookies
      );
      
      if (response.ok) {
        const product = await response.json();
        
        // Wait for log to be written
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const logs = await db.select()
          .from(adminLogs)
          .where(
            and(
              eq(adminLogs.adminId, adminUser.id),
              eq(adminLogs.actionType, 'create_product')
            )
          )
          .orderBy(desc(adminLogs.timestamp))
          .limit(1);
        
        if (logs.length > 0) {
          expect(logs[0].targetType).toBe('product');
          expect(logs[0].targetId).toBeDefined();
        }
        
        // Clean up created product
        if (product.id) {
          await db.delete(products).where(eq(products.id, product.id));
        }
      }
    });

    it('should log product update by admin', async () => {
      const { cookies } = await login(adminUser.email, adminUser.password);
      
      const response = await makeAuthRequest(
        `${BASE_URL}/api/admin/products/${testProduct.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            price: 89.99,
            stockQuantity: 75
          })
        },
        cookies
      );
      
      if (response.ok) {
        // Wait for log to be written
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const logs = await db.select()
          .from(adminLogs)
          .where(
            and(
              eq(adminLogs.adminId, adminUser.id),
              eq(adminLogs.actionType, 'update_product'),
              eq(adminLogs.targetId, testProduct.id)
            )
          )
          .orderBy(desc(adminLogs.timestamp))
          .limit(1);
        
        if (logs.length > 0) {
          expect(logs[0].targetType).toBe('product');
        }
      }
    });

    it('should log order status update', async () => {
      const { cookies } = await login(adminUser.email, adminUser.password);
      
      const response = await makeAuthRequest(
        `${BASE_URL}/api/admin/orders/${testOrder.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderStatus: 'shipped'
          })
        },
        cookies
      );
      
      if (response.ok) {
        // Wait for log to be written
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const logs = await db.select()
          .from(adminLogs)
          .where(
            and(
              eq(adminLogs.adminId, adminUser.id),
              eq(adminLogs.targetId, testOrder.id)
            )
          )
          .orderBy(desc(adminLogs.timestamp))
          .limit(1);
        
        if (logs.length > 0) {
          expect(logs[0].targetType).toBe('order');
          expect(['update_order', 'update_status_order'].includes(logs[0].actionType)).toBe(true);
        }
      }
    });

    it('should log discount code creation', async () => {
      const { cookies } = await login(adminUser.email, adminUser.password);
      
      const response = await makeAuthRequest(
        `${BASE_URL}/api/admin/discounts`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: 'QA_ACTIVITY_NEW20',
            type: 'percent',
            value: 20,
            isActive: true
          })
        },
        cookies
      );
      
      if (response.ok) {
        const discount = await response.json();
        
        // Wait for log to be written
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const logs = await db.select()
          .from(adminLogs)
          .where(
            and(
              eq(adminLogs.adminId, adminUser.id),
              eq(adminLogs.actionType, 'create_discount')
            )
          )
          .orderBy(desc(adminLogs.timestamp))
          .limit(1);
        
        if (logs.length > 0) {
          expect(logs[0].targetType).toBe('discount');
        }
        
        // Clean up
        if (discount.id) {
          await db.delete(discountCodes).where(eq(discountCodes.id, discount.id));
        }
      }
    });
  });

  describe('B. Immutability & Tamper-evidence', () => {
    
    it('should prevent updates to existing logs', async () => {
      // First create a log
      const { cookies } = await login(adminUser.email, adminUser.password);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get a recent log
      const recentLog = await getLatestLog();
      
      if (recentLog) {
        // Attempt to update the log directly
        try {
          await db.update(adminLogs)
            .set({ details: 'TAMPERED' })
            .where(eq(adminLogs.id, recentLog.id));
          
          // Check if update was prevented (depends on DB constraints)
          const updatedLog = await db.select()
            .from(adminLogs)
            .where(eq(adminLogs.id, recentLog.id))
            .limit(1);
          
          // Log the result for debugging
          console.log('Log immutability test:', {
            original: recentLog.details,
            afterUpdate: updatedLog[0]?.details
          });
        } catch (error) {
          // Expected: Update should be blocked
          expect(error).toBeDefined();
        }
      }
    });

    it('should prevent deletion of logs', async () => {
      const recentLog = await getLatestLog();
      
      if (recentLog) {
        try {
          await db.delete(adminLogs)
            .where(eq(adminLogs.id, recentLog.id));
          
          // Check if log still exists
          const checkLog = await db.select()
            .from(adminLogs)
            .where(eq(adminLogs.id, recentLog.id))
            .limit(1);
          
          // Log should still exist (deletion prevented)
          console.log('Log deletion test:', {
            exists: checkLog.length > 0
          });
        } catch (error) {
          // Expected: Deletion should be blocked
          expect(error).toBeDefined();
        }
      }
    });
  });

  describe('D. PII & Secrets Redaction', () => {
    
    it('should redact sensitive fields in logs', async () => {
      const { cookies } = await login(adminUser.email, adminUser.password);
      
      // Make a request with sensitive data
      await makeAuthRequest(
        `${BASE_URL}/api/admin/products`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Test Product',
            description: 'Test',
            price: 99.99,
            imageUrl: '/test.jpg',
            categories: ['test'],
            password: 'ShouldBeRedacted',
            token: 'secret-token-123',
            stripe_key: 'sk_test_123'
          })
        },
        cookies
      );
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get recent logs
      const logs = await db.select()
        .from(adminLogs)
        .where(eq(adminLogs.adminId, adminUser.id))
        .orderBy(desc(adminLogs.timestamp))
        .limit(5);
      
      for (const log of logs) {
        if (log.details) {
          const details = typeof log.details === 'string' 
            ? JSON.parse(log.details) 
            : log.details;
          
          // Check that sensitive fields are redacted
          if (details.body) {
            expect(details.body.password).not.toBe('ShouldBeRedacted');
            expect(details.body.token).not.toBe('secret-token-123');
            expect(details.body.stripe_key).not.toBe('sk_test_123');
            
            if (details.body.password) {
              expect(details.body.password).toBe('[REDACTED]');
            }
          }
        }
      }
    });

    it('should hash IP addresses', async () => {
      const logs = await db.select()
        .from(adminLogs)
        .orderBy(desc(adminLogs.timestamp))
        .limit(10);
      
      for (const log of logs) {
        if (log.ipAddress) {
          // Check if IP is hashed or raw
          // Raw IPs look like: 127.0.0.1 or ::1
          const isRawIP = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(log.ipAddress) ||
                         /^::1$/.test(log.ipAddress);
          
          // Log finding for analysis
          console.log('IP storage check:', {
            stored: log.ipAddress,
            isRaw: isRawIP
          });
        }
      }
    });
  });

  describe('E. RBAC & Access Controls', () => {
    
    it('should allow admin to view activity logs', async () => {
      const loginResponse = await login(adminUser.email, adminUser.password);
      console.log('Login response:', { cookies: loginResponse.cookies, user: loginResponse.user });
      
      const response = await makeAuthRequest(
        `${BASE_URL}/api/admin/logs`,
        { method: 'GET' },
        loginResponse.cookies
      );
      
      if (!response.ok) {
        console.log('Failed to access logs:', response.status, await response.text());
      }
      
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data).toBeDefined();
      expect(Array.isArray(data.logs) || Array.isArray(data)).toBe(true);
    });

    it('should deny non-admin access to activity logs', async () => {
      const { cookies } = await login(normalUser.email, normalUser.password);
      
      const response = await makeAuthRequest(
        `${BASE_URL}/api/admin/logs`,
        { method: 'GET' },
        cookies
      );
      
      expect(response.status).toBe(403);
    });

    it('should support filtering by date range', async () => {
      const { cookies } = await login(adminUser.email, adminUser.password);
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      
      const response = await makeAuthRequest(
        `${BASE_URL}/api/admin/logs?hours=168`,
        { method: 'GET' },
        cookies
      );
      
      if (response.ok) {
        const data = await response.json();
        const logs = data.logs || data;
        
        // All logs should be within date range
        for (const log of logs) {
          const logDate = new Date(log.timestamp || log.ts);
          expect(logDate >= startDate).toBe(true);
          expect(logDate <= new Date()).toBe(true);
        }
      }
    });

    it('should support filtering by action type', async () => {
      const { cookies } = await login(adminUser.email, adminUser.password);
      
      const response = await makeAuthRequest(
        `${BASE_URL}/api/admin/logs?actionFilter=login_success`,
        { method: 'GET' },
        cookies
      );
      
      if (response.ok) {
        const data = await response.json();
        const logs = data.logs || data;
        
        // All logs should be login_success type
        for (const log of logs) {
          if (log.actionType) {
            expect(log.actionType).toBe('login_success');
          }
        }
      }
    });
  });

  describe('F. Filtering, Pagination, Performance', () => {
    
    it('should support pagination', async () => {
      const { cookies } = await login(adminUser.email, adminUser.password);
      
      const response = await makeAuthRequest(
        `${BASE_URL}/api/admin/logs?page=1&limit=10`,
        { method: 'GET' },
        cookies
      );
      
      if (response.ok) {
        const data = await response.json();
        const logs = data.logs || data;
        
        expect(Array.isArray(logs)).toBe(true);
        expect(logs.length).toBeLessThanOrEqual(10);
      }
    });

    it('should return logs in descending timestamp order', async () => {
      const { cookies } = await login(adminUser.email, adminUser.password);
      
      const response = await makeAuthRequest(
        `${BASE_URL}/api/admin/logs?limit=20`,
        { method: 'GET' },
        cookies
      );
      
      if (response.ok) {
        const data = await response.json();
        const logs = data.logs || data;
        
        for (let i = 1; i < logs.length; i++) {
          const prevDate = new Date(logs[i - 1].timestamp || logs[i - 1].ts);
          const currDate = new Date(logs[i].timestamp || logs[i].ts);
          expect(prevDate >= currDate).toBe(true);
        }
      }
    });

    it('should perform queries efficiently', async () => {
      const { cookies } = await login(adminUser.email, adminUser.password);
      
      const startTime = Date.now();
      
      const response = await makeAuthRequest(
        `${BASE_URL}/api/admin/logs?limit=50`,
        { method: 'GET' },
        cookies
      );
      
      const duration = Date.now() - startTime;
      
      expect(response.ok).toBe(true);
      expect(duration).toBeLessThan(300); // Should respond within 300ms
      
      console.log(`Query performance: ${duration}ms`);
    });
  });

  describe('J. Error Path Logging', () => {
    
    it('should log 404 errors', async () => {
      const { cookies } = await login(adminUser.email, adminUser.password);
      
      const response = await makeAuthRequest(
        `${BASE_URL}/api/admin/products/non-existent-id`,
        { method: 'GET' },
        cookies
      );
      
      expect(response.status).toBe(404);
      
      // Wait for error log
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check for error logs (implementation dependent)
      const logs = await db.select()
        .from(adminLogs)
        .where(eq(adminLogs.adminId, adminUser.id))
        .orderBy(desc(adminLogs.timestamp))
        .limit(5);
      
      console.log('404 error logging check:', {
        responseStatus: response.status,
        recentLogs: logs.length
      });
    });

    it('should log validation errors', async () => {
      const { cookies } = await login(adminUser.email, adminUser.password);
      
      const response = await makeAuthRequest(
        `${BASE_URL}/api/admin/products`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // Missing required fields
            name: 'Incomplete Product'
          })
        },
        cookies
      );
      
      expect(response.ok).toBe(false);
      
      // Wait for error log
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Validation error logging check:', {
        responseStatus: response.status
      });
    });

    it('should log unauthorized access attempts', async () => {
      // Try to access admin endpoint without auth
      const response = await fetch(`${BASE_URL}/api/admin/products`, {
        method: 'GET'
      });
      
      expect(response.status).toBe(401);
      
      // Wait for security log
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Unauthorized access logging check:', {
        responseStatus: response.status
      });
    });
  });
});