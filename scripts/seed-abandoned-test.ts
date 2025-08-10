#!/usr/bin/env tsx
/**
 * Seed script for Abandoned Carts QA Testing
 * Creates test users, products, and various cart states
 */

import { db } from '../server/db';
import { users, products, carts } from '../shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

// Test configuration
const config = {
  ABANDONED_STALE_MINUTES: 15,
  ABANDONED_MARK_MINUTES: 60,
};

// Helper to create timestamp
function getTimestamp(minutesAgo: number): string {
  return new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();
}

async function seedAbandonedCartsTestData() {
  console.log('🌱 Starting Abandoned Carts test data seeding...\n');
  
  try {
    // Create test users
    console.log('Creating test users...');
    
    // Guest user (just email captured)
    const guestEmail = 'qa.guest@healios.test';
    console.log(`→ Guest email: ${guestEmail}`);
    
    // Registered user with marketing consent
    const hashedPassword = await bcrypt.hash('Test123!', 10);
    
    const existingWithConsent = await db.select().from(users)
      .where(eq(users.email, 'qa.withconsent@healios.test'))
      .limit(1);
    
    let userWithConsent;
    if (existingWithConsent.length > 0) {
      userWithConsent = existingWithConsent[0];
      console.log('→ User with consent already exists');
    } else {
      [userWithConsent] = await db.insert(users).values({
        id: `qa-consent-${randomUUID()}`,
        email: 'qa.withconsent@healios.test',
        password: hashedPassword,
        role: 'customer',
        firstName: 'Jane',
        lastName: 'Consent',
        marketingConsent: true
      }).returning();
      console.log('→ Created user with marketing consent');
    }
    
    // Registered user without marketing consent
    const existingWithoutConsent = await db.select().from(users)
      .where(eq(users.email, 'qa.noconsent@healios.test'))
      .limit(1);
    
    let userWithoutConsent;
    if (existingWithoutConsent.length > 0) {
      userWithoutConsent = existingWithoutConsent[0];
      console.log('→ User without consent already exists');
    } else {
      [userWithoutConsent] = await db.insert(users).values({
        id: `qa-noconsent-${randomUUID()}`,
        email: 'qa.noconsent@healios.test',
        password: hashedPassword,
        role: 'customer',
        firstName: 'John',
        lastName: 'NoConsent',
        marketingConsent: false
      }).returning();
      console.log('→ Created user without marketing consent');
    }
    
    // Create test products
    console.log('\nCreating test products...');
    
    const testProducts = [
      {
        id: `qa-cart-prod-instock-${randomUUID()}`,
        name: 'Abandoned Cart Test - In Stock',
        price: '25.00',
        stock: 50,
        category: 'test',
        description: 'Product for abandoned cart testing',
        imageUrl: '/images/test-product-1.jpg'
      },
      {
        id: `qa-cart-prod-outstock-${randomUUID()}`,
        name: 'Abandoned Cart Test - Out of Stock',
        price: '30.00',
        stock: 0,
        category: 'test',
        description: 'Out of stock product for edge case testing',
        imageUrl: '/images/test-product-2.jpg'
      }
    ];
    
    const createdProducts = [];
    for (const product of testProducts) {
      const existing = await db.select().from(products)
        .where(eq(products.name, product.name))
        .limit(1);
      
      if (existing.length > 0) {
        await db.update(products)
          .set({ 
            stock: product.stock,
            price: product.price 
          })
          .where(eq(products.id, existing[0].id));
        createdProducts.push(existing[0]);
        console.log(`→ Updated product: ${product.name}`);
      } else {
        const [created] = await db.insert(products).values(product).returning();
        createdProducts.push(created);
        console.log(`→ Created product: ${product.name}`);
      }
    }
    
    // Create test carts in various states
    console.log('\nCreating test carts...');
    
    // 1. Guest cart with email captured (active)
    const guestCartActive = await db.insert(carts).values({
      id: `qa-guest-active-${randomUUID()}`,
      sessionToken: `guest-session-active-${randomUUID()}`,
      userId: null,
      items: JSON.stringify([
        {
          productId: createdProducts[0].id,
          productName: createdProducts[0].name,
          quantity: 2,
          price: parseFloat(createdProducts[0].price)
        }
      ]),
      totalAmount: (2 * parseFloat(createdProducts[0].price)).toFixed(2),
      lastUpdated: new Date().toISOString(),
      convertedToOrder: false
    }).returning();
    console.log('→ Created active guest cart');
    
    // 2. User cart with consent (stale - 20 mins old)
    const userCartStale = await db.insert(carts).values({
      id: `qa-user-stale-${randomUUID()}`,
      sessionToken: `user-session-stale-${randomUUID()}`,
      userId: userWithConsent.id,
      items: JSON.stringify([
        {
          productId: createdProducts[0].id,
          productName: createdProducts[0].name,
          quantity: 1,
          price: parseFloat(createdProducts[0].price)
        }
      ]),
      totalAmount: createdProducts[0].price,
      lastUpdated: getTimestamp(20), // 20 minutes ago
      convertedToOrder: false
    }).returning();
    console.log('→ Created stale user cart (20 mins old)');
    
    // 3. User cart with consent (abandoned - 2 hours old)
    const userCartAbandoned = await db.insert(carts).values({
      id: `qa-user-abandoned-${randomUUID()}`,
      sessionToken: `user-session-abandoned-${randomUUID()}`,
      userId: userWithConsent.id,
      items: JSON.stringify([
        {
          productId: createdProducts[0].id,
          productName: createdProducts[0].name,
          quantity: 3,
          price: parseFloat(createdProducts[0].price)
        },
        {
          productId: createdProducts[1].id,
          productName: createdProducts[1].name,
          quantity: 1,
          price: parseFloat(createdProducts[1].price)
        }
      ]),
      totalAmount: (3 * parseFloat(createdProducts[0].price) + parseFloat(createdProducts[1].price)).toFixed(2),
      lastUpdated: getTimestamp(120), // 2 hours ago
      convertedToOrder: false
    }).returning();
    console.log('→ Created abandoned user cart (2 hours old)');
    
    // 4. User cart without consent (abandoned - should not get reminders)
    const noConsentCartAbandoned = await db.insert(carts).values({
      id: `qa-noconsent-abandoned-${randomUUID()}`,
      sessionToken: `noconsent-session-abandoned-${randomUUID()}`,
      userId: userWithoutConsent.id,
      items: JSON.stringify([
        {
          productId: createdProducts[0].id,
          productName: createdProducts[0].name,
          quantity: 1,
          price: parseFloat(createdProducts[0].price)
        }
      ]),
      totalAmount: createdProducts[0].price,
      lastUpdated: getTimestamp(90), // 1.5 hours ago
      convertedToOrder: false
    }).returning();
    console.log('→ Created abandoned cart for user without consent');
    
    // 5. Already converted cart (should be ignored)
    const convertedCart = await db.insert(carts).values({
      id: `qa-converted-${randomUUID()}`,
      sessionToken: `converted-session-${randomUUID()}`,
      userId: userWithConsent.id,
      items: JSON.stringify([
        {
          productId: createdProducts[0].id,
          productName: createdProducts[0].name,
          quantity: 2,
          price: parseFloat(createdProducts[0].price)
        }
      ]),
      totalAmount: (2 * parseFloat(createdProducts[0].price)).toFixed(2),
      lastUpdated: getTimestamp(180), // 3 hours ago
      convertedToOrder: true,
      stripeSessionId: 'cs_test_converted_12345'
    }).returning();
    console.log('→ Created already converted cart');
    
    // 6. Empty cart (edge case)
    const emptyCart = await db.insert(carts).values({
      id: `qa-empty-${randomUUID()}`,
      sessionToken: `empty-session-${randomUUID()}`,
      userId: userWithConsent.id,
      items: JSON.stringify([]),
      totalAmount: '0.00',
      lastUpdated: getTimestamp(70), // 70 minutes ago
      convertedToOrder: false
    }).returning();
    console.log('→ Created empty abandoned cart');
    
    // Summary
    console.log('\n✅ Abandoned Carts test data seeding complete!\n');
    console.log('Test credentials:');
    console.log('With consent: qa.withconsent@healios.test / Test123!');
    console.log('Without consent: qa.noconsent@healios.test / Test123!');
    console.log('Guest email: qa.guest@healios.test (no login)\n');
    
    console.log('Cart states created:');
    console.log(`- Active guest cart: ${guestCartActive[0].id}`);
    console.log(`- Stale user cart (20 mins): ${userCartStale[0].id}`);
    console.log(`- Abandoned user cart (2 hours): ${userCartAbandoned[0].id}`);
    console.log(`- Abandoned no-consent cart: ${noConsentCartAbandoned[0].id}`);
    console.log(`- Converted cart: ${convertedCart[0].id}`);
    console.log(`- Empty cart: ${emptyCart[0].id}`);
    
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    process.exit(1);
  }
}

// Run if executed directly
seedAbandonedCartsTestData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

export { seedAbandonedCartsTestData };