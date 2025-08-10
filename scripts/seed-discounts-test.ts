#!/usr/bin/env tsx
/**
 * Seed script for Discount Codes QA Testing
 * Creates comprehensive test data for discount system validation
 */

import { db } from '../server/db';
import { 
  users, 
  products, 
  discountCodes,
  carts
} from '../shared/schema';
import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';
import { eq, sql } from 'drizzle-orm';

// Configuration defaults
const config = {
  DISCOUNT_TIMEZONE: process.env.DISCOUNT_TIMEZONE || 'Africa/Johannesburg',
  DISCOUNT_CASE_INSENSITIVE: process.env.DISCOUNT_CASE_INSENSITIVE !== 'false',
  DISCOUNT_MAX_STACK: parseInt(process.env.DISCOUNT_MAX_STACK || '1'),
  DISCOUNT_MIN_SPEND_DEFAULT: parseFloat(process.env.DISCOUNT_MIN_SPEND_DEFAULT || '0'),
  FREE_SHIPPING_CODE: process.env.FREE_SHIPPING_CODE || 'FREESHIP'
};

async function seedDiscountTestData() {
  console.log('🎟️ Starting Discount Codes test data seeding...');
  console.log('Configuration:', config);
  console.log('');

  try {
    // Clear existing test data
    console.log('🧹 Clearing existing test data...');
    await db.delete(discountCodes).where(sql`code LIKE 'TEST_%' OR code LIKE 'UNIQUE_%'`);
    await db.delete(carts).where(sql`id LIKE 'qa-discount-%'`);
    await db.delete(products).where(sql`id LIKE 'qa-discount-%'`);
    await db.delete(users).where(sql`email LIKE 'qa.discount%@healios.test'`);

    // Step 1: Create test users
    console.log('\n👥 Creating test users...');
    const hashedPassword = await bcrypt.hash('Test123!', 10);
    
    const testUsers = [
      {
        id: `qa-discount-guest-${randomUUID()}`,
        email: 'qa.discount.guest@healios.test',
        password: hashedPassword,
        role: 'customer' as const,
        emailVerified: new Date().toISOString()
      },
      {
        id: `qa-discount-user-${randomUUID()}`,
        email: 'qa.discount.user@healios.test',
        password: hashedPassword,
        role: 'customer' as const,
        emailVerified: new Date().toISOString()
      },
      {
        id: `qa-discount-admin-${randomUUID()}`,
        email: 'qa.discount.admin@healios.test',
        password: hashedPassword,
        role: 'admin' as const,
        emailVerified: new Date().toISOString()
      }
    ];

    for (const user of testUsers) {
      // Check if user exists first
      const existing = await db.select().from(users).where(eq(users.email, user.email)).limit(1);
      if (existing.length === 0) {
        await db.insert(users).values(user);
        console.log(`  ✅ Created user: ${user.email}`);
      } else {
        console.log(`  ⏭️  User exists: ${user.email}`);
      }
    }

    // Step 2: Create test products
    console.log('\n📦 Creating test products...');
    
    const testProducts = [
      {
        id: `qa-discount-prod-taxable-1-${randomUUID()}`,
        name: 'Test Taxable Product 1',
        description: 'Taxable product for discount testing',
        price: '100.00',
        imageUrl: '/test-discount-1.jpg',
        category: 'supplements',
        stock: 100,
        featured: false
      },
      {
        id: `qa-discount-prod-taxable-2-${randomUUID()}`,
        name: 'Test Taxable Product 2',
        description: 'Another taxable product',
        price: '150.00',
        imageUrl: '/test-discount-2.jpg',
        category: 'supplements',
        stock: 50,
        featured: false
      },
      {
        id: `qa-discount-prod-taxable-3-${randomUUID()}`,
        name: 'Test Taxable Product 3',
        description: 'Third taxable product',
        price: '200.00',
        imageUrl: '/test-discount-3.jpg',
        category: 'vitamins',
        stock: 75,
        featured: false
      },
      {
        id: `qa-discount-prod-outstock-${randomUUID()}`,
        name: 'Test Out of Stock Product',
        description: 'Out of stock product',
        price: '80.00',
        imageUrl: '/test-discount-4.jpg',
        category: 'supplements',
        stock: 0,
        featured: false
      },
      {
        id: `qa-discount-prod-excluded-${randomUUID()}`,
        name: 'Test Excluded Product',
        description: 'Product excluded from discounts',
        price: '120.00',
        imageUrl: '/test-discount-5.jpg',
        category: 'exclusions',
        stock: 30,
        featured: false
      },
      {
        id: `qa-discount-prod-bogo-${randomUUID()}`,
        name: 'Test BOGO Product',
        description: 'Product for BOGO testing',
        price: '50.00',
        imageUrl: '/test-discount-6.jpg',
        category: 'promotions',
        stock: 200,
        featured: false
      }
    ];

    const createdProductIds = [];
    for (const product of testProducts) {
      await db.insert(products).values(product);
      createdProductIds.push(product.id);
      console.log(`  ✅ Created product: ${product.name}`);
    }

    // Step 3: Create discount codes
    console.log('\n🎫 Creating discount codes...');
    
    const testDiscounts = [
      {
        id: `qa-discount-percent10-${randomUUID()}`,
        code: 'TEST_PERCENT10',
        type: 'percent' as const,
        value: '10',
        usageLimit: null,
        usageCount: 0,
        expiresAt: null,
        isActive: true
      },
      {
        id: `qa-discount-fixed50-${randomUUID()}`,
        code: 'TEST_FIXED50',
        type: 'fixed' as const,
        value: '50',
        usageLimit: null,
        usageCount: 0,
        expiresAt: null,
        isActive: true
      },
      {
        id: `qa-discount-freeship-${randomUUID()}`,
        code: 'TEST_FREESHIP',
        type: 'fixed' as const,
        value: '0', // Free shipping handled separately
        usageLimit: null,
        usageCount: 0,
        expiresAt: null,
        isActive: true
      },
      {
        id: `qa-discount-oneperuser-${randomUUID()}`,
        code: 'TEST_ONEPERUSER20',
        type: 'percent' as const,
        value: '20',
        usageLimit: 1, // Per user limit would need additional logic
        usageCount: 0,
        expiresAt: null,
        isActive: true
      },
      {
        id: `qa-discount-global100-${randomUUID()}`,
        code: 'TEST_GLOBAL100USES',
        type: 'percent' as const,
        value: '15',
        usageLimit: 100,
        usageCount: 0,
        expiresAt: null,
        isActive: true
      },
      {
        id: `qa-discount-cat10-${randomUUID()}`,
        code: 'TEST_CAT10',
        type: 'percent' as const,
        value: '10',
        usageLimit: null,
        usageCount: 0,
        expiresAt: null,
        isActive: true
      },
      {
        id: `qa-discount-excludecat-${randomUUID()}`,
        code: 'TEST_EXCLUDECAT20',
        type: 'percent' as const,
        value: '20',
        usageLimit: null,
        usageCount: 0,
        expiresAt: null,
        isActive: true
      },
      {
        id: `qa-discount-bogo-${randomUUID()}`,
        code: 'TEST_BOGO',
        type: 'percent' as const,
        value: '100', // 100% off second item
        usageLimit: null,
        usageCount: 0,
        expiresAt: null,
        isActive: true
      },
      {
        id: `qa-discount-auto5-${randomUUID()}`,
        code: 'TEST_AUTO_APPLY_5',
        type: 'percent' as const,
        value: '5',
        usageLimit: null,
        usageCount: 0,
        expiresAt: null,
        isActive: true
      }
    ];

    // Add expired code for testing
    testDiscounts.push({
      id: `qa-discount-expired-${randomUUID()}`,
      code: 'TEST_EXPIRED',
      type: 'percent' as const,
      value: '30',
      usageLimit: null,
      usageCount: 0,
      expiresAt: new Date(Date.now() - 86400000).toISOString(), // Expired yesterday
      isActive: true
    });

    // Add inactive code
    testDiscounts.push({
      id: `qa-discount-inactive-${randomUUID()}`,
      code: 'TEST_INACTIVE',
      type: 'percent' as const,
      value: '25',
      usageLimit: null,
      usageCount: 0,
      expiresAt: null,
      isActive: false
    });

    // Add future code (not yet active)
    testDiscounts.push({
      id: `qa-discount-future-${randomUUID()}`,
      code: 'TEST_FUTURE',
      type: 'percent' as const,
      value: '35',
      usageLimit: null,
      usageCount: 0,
      expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(), // Valid for 30 days
      isActive: true
    });

    // Create unique one-time codes
    const uniqueCodes = [];
    for (let i = 1; i <= 5; i++) {
      uniqueCodes.push({
        id: `qa-discount-unique-${i}-${randomUUID()}`,
        code: `UNIQUE_${randomUUID().substring(0, 8).toUpperCase()}`,
        type: 'percent' as const,
        value: '50',
        usageLimit: 1,
        usageCount: 0,
        expiresAt: null,
        isActive: true
      });
    }

    // Insert all discount codes
    for (const discount of [...testDiscounts, ...uniqueCodes]) {
      await db.insert(discountCodes).values(discount);
      console.log(`  ✅ Created discount: ${discount.code}`);
    }

    // Step 4: Create test carts for various scenarios
    console.log('\n🛒 Creating test carts...');
    
    // Create cart items JSON for active cart
    const activeCartItems = [
      {
        productId: createdProductIds[0],
        quantity: 2,
        price: '100.00'
      },
      {
        productId: createdProductIds[1],
        quantity: 1,
        price: '150.00'
      }
    ];
    
    const testCarts = [
      {
        id: `qa-discount-cart-empty-${randomUUID()}`,
        sessionToken: `qa-discount-session-empty-${randomUUID()}`,
        userId: testUsers[1].id,
        items: '[]', // Empty cart
        totalAmount: '0.00',
        lastUpdated: new Date().toISOString(),
        convertedToOrder: false
      },
      {
        id: `qa-discount-cart-active-${randomUUID()}`,
        sessionToken: `qa-discount-session-active-${randomUUID()}`,
        userId: testUsers[1].id,
        items: JSON.stringify(activeCartItems), // Cart with items
        totalAmount: '350.00', // 2*100 + 150
        lastUpdated: new Date().toISOString(),
        convertedToOrder: false
      }
    ];

    for (const cart of testCarts) {
      await db.insert(carts).values(cart);
      console.log(`  ✅ Created cart: ${cart.id.split('-').slice(0, 4).join('-')}`);
    }
    
    console.log(`  ✅ Added ${activeCartItems.length} items to active cart`);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ Discount Codes test data seeding complete!');
    console.log('='.repeat(60));
    console.log('\n📊 Test Data Summary:');
    console.log(`  • Users: ${testUsers.length}`);
    console.log(`  • Products: ${testProducts.length}`);
    console.log(`  • Discount Codes: ${testDiscounts.length + uniqueCodes.length}`);
    console.log(`  • Carts: ${testCarts.length}`);
    console.log('\n🔑 Test Credentials:');
    console.log('  Guest: qa.discount.guest@healios.test / Test123!');
    console.log('  User: qa.discount.user@healios.test / Test123!');
    console.log('  Admin: qa.discount.admin@healios.test / Test123!');
    console.log('\n🎟️ Test Discount Codes:');
    console.log('  • TEST_PERCENT10 - 10% off site-wide');
    console.log('  • TEST_FIXED50 - R50 off site-wide');
    console.log('  • TEST_FREESHIP - Free shipping');
    console.log('  • TEST_ONEPERUSER20 - 20% off (1 use per user)');
    console.log('  • TEST_GLOBAL100USES - 15% off (max 100 uses)');
    console.log('  • TEST_CAT10 - 10% off specific category');
    console.log('  • TEST_EXCLUDECAT20 - 20% off excluding category');
    console.log('  • TEST_BOGO - Buy one get one free');
    console.log('  • TEST_AUTO_APPLY_5 - Auto-applied 5% discount');
    console.log('  • TEST_EXPIRED - Expired code (for testing)');
    console.log('  • TEST_INACTIVE - Inactive code (for testing)');
    console.log('  • 5 UNIQUE codes - One-time use 50% off');
    console.log('\n');

  } catch (error) {
    console.error('❌ Error seeding discount test data:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDiscountTestData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });