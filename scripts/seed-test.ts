#!/usr/bin/env tsx
/**
 * QA Test Data Seeder for Orders System
 * Creates idempotent test data for comprehensive QA testing
 */

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import * as schema from '../shared/schema';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config();

// Use test database if available, otherwise use development
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

if (!TEST_DATABASE_URL) {
  console.error('❌ No database URL found. Set TEST_DATABASE_URL or DATABASE_URL');
  process.exit(1);
}

const sql = neon(TEST_DATABASE_URL);
const db = drizzle(sql, { schema });

console.log('🌱 Starting QA test data seeding...');

async function seedTestData() {
  try {
    // 1. Create test users
    console.log('Creating test users...');
    
    const hashedPassword = await bcrypt.hash('Test123!', 10);
    
    // Test customer user
    const testCustomerEmail = 'qa.customer@healios.test';
    const existingCustomer = await db.select().from(schema.users)
      .where(eq(schema.users.email, testCustomerEmail))
      .limit(1);
    
    if (!existingCustomer.length) {
      await db.insert(schema.users).values({
        id: 'qa-customer-001',
        email: testCustomerEmail,
        password: hashedPassword,
        firstName: 'QA',
        lastName: 'Customer',
        role: 'customer',
        emailVerified: new Date().toISOString(),
        isActive: true
      });
      console.log('✓ Created test customer user');
    } else {
      console.log('→ Test customer user already exists');
    }

    // Test admin user
    const testAdminEmail = 'qa.admin@healios.test';
    const existingAdmin = await db.select().from(schema.users)
      .where(eq(schema.users.email, testAdminEmail))
      .limit(1);
    
    if (!existingAdmin.length) {
      await db.insert(schema.users).values({
        id: 'qa-admin-001',
        email: testAdminEmail,
        password: hashedPassword,
        firstName: 'QA',
        lastName: 'Admin',
        role: 'admin',
        emailVerified: new Date().toISOString(),
        isActive: true
      });
      console.log('✓ Created test admin user');
    } else {
      console.log('→ Test admin user already exists');
    }

    // 2. Create test products
    console.log('\nCreating test products...');
    
    const testProducts = [
      {
        id: 'qa-product-instock-1',
        name: 'QA Test Product - In Stock',
        description: 'Test product with normal stock',
        price: '99.99',
        originalPrice: '129.99',
        imageUrl: '/test-image-1.jpg',
        categories: ['test', 'qa'],
        inStock: true,
        stockQuantity: 50,
        featured: false,
        allowPreorder: false,
        preorderCap: null,
        preorderCount: 0,
        type: 'supplement'
      },
      {
        id: 'qa-product-instock-2',
        name: 'QA Test Product - Low Stock',
        description: 'Test product with low stock',
        price: '149.99',
        originalPrice: '199.99',
        imageUrl: '/test-image-2.jpg',
        categories: ['test', 'qa'],
        inStock: true,
        stockQuantity: 5,
        featured: false,
        allowPreorder: false,
        preorderCap: null,
        preorderCount: 0,
        type: 'supplement'
      },
      {
        id: 'qa-product-instock-3',
        name: 'QA Test Product - High Price',
        description: 'Test product with high price for tax calculations',
        price: '599.99',
        originalPrice: '799.99',
        imageUrl: '/test-image-3.jpg',
        categories: ['test', 'qa', 'premium'],
        inStock: true,
        stockQuantity: 20,
        featured: true,
        allowPreorder: false,
        preorderCap: null,
        preorderCount: 0,
        type: 'supplement'
      },
      {
        id: 'qa-product-outofstock',
        name: 'QA Test Product - Out of Stock',
        description: 'Test product with no stock and preorder disabled',
        price: '79.99',
        originalPrice: '99.99',
        imageUrl: '/test-image-4.jpg',
        categories: ['test', 'qa'],
        inStock: false,
        stockQuantity: 0,
        featured: false,
        allowPreorder: false,
        preorderCap: null,
        preorderCount: 0,
        type: 'supplement'
      },
      {
        id: 'qa-product-preorder-open',
        name: 'QA Test Product - Pre-order Open',
        description: 'Test product with open pre-order',
        price: '199.99',
        originalPrice: '249.99',
        imageUrl: '/test-image-5.jpg',
        categories: ['test', 'qa', 'preorder'],
        inStock: false,
        stockQuantity: 0,
        featured: true,
        allowPreorder: true,
        preorderCap: 3,
        preorderCount: 0,
        type: 'supplement'
      },
      {
        id: 'qa-product-preorder-closed',
        name: 'QA Test Product - Pre-order Closed',
        description: 'Test product with closed pre-order (at capacity)',
        price: '299.99',
        originalPrice: '399.99',
        imageUrl: '/test-image-6.jpg',
        categories: ['test', 'qa', 'preorder'],
        inStock: false,
        stockQuantity: 0,
        featured: false,
        allowPreorder: true,
        preorderCap: 2,
        preorderCount: 2,
        type: 'supplement'
      }
    ];

    for (const product of testProducts) {
      const existing = await db.select().from(schema.products)
        .where(eq(schema.products.id, product.id))
        .limit(1);
      
      if (!existing.length) {
        await db.insert(schema.products).values(product);
        console.log(`✓ Created test product: ${product.name}`);
      } else {
        // Update existing product to ensure correct state
        await db.update(schema.products)
          .set({
            stockQuantity: product.stockQuantity,
            inStock: product.inStock,
            allowPreorder: product.allowPreorder,
            preorderCap: product.preorderCap,
            preorderCount: product.preorderCount
          })
          .where(eq(schema.products.id, product.id));
        console.log(`→ Updated test product: ${product.name}`);
      }
    }

    // 3. Clean up any existing test orders (for clean state)
    console.log('\nCleaning up existing test orders...');
    
    // Delete test order items first (foreign key constraint)
    const testOrderIds = await db.select({ id: schema.orders.id })
      .from(schema.orders)
      .where(eq(schema.orders.userId, 'qa-customer-001'));
    
    if (testOrderIds.length > 0) {
      for (const order of testOrderIds) {
        await db.delete(schema.orderItems)
          .where(eq(schema.orderItems.orderId, order.id));
      }
      
      // Then delete test orders
      await db.delete(schema.orders)
        .where(eq(schema.orders.userId, 'qa-customer-001'));
      
      console.log(`✓ Cleaned up ${testOrderIds.length} test orders`);
    } else {
      console.log('→ No test orders to clean up');
    }

    // 4. Reset test carts
    console.log('\nCleaning up test carts...');
    await db.delete(schema.carts)
      .where(eq(schema.carts.userId, 'qa-customer-001'));
    console.log('✓ Cleaned up test carts');

    console.log('\n✅ QA test data seeding complete!');
    console.log('\nTest credentials:');
    console.log('Customer: qa.customer@healios.test / Test123!');
    console.log('Admin: qa.admin@healios.test / Test123!');
    
    // Summary of test products
    console.log('\nTest products summary:');
    console.log('- 3 in-stock products (varied prices & stock levels)');
    console.log('- 1 out-of-stock product (no pre-order)');
    console.log('- 1 pre-order open product (cap: 3, current: 0)');
    console.log('- 1 pre-order closed product (cap: 2, current: 2)');
    
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    process.exit(1);
  }
}

// Run the seeder
seedTestData().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});