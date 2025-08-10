import { db } from '../server/db';
import { adminLogs, users, products, orders, discountCodes, carts } from '../shared/schema';
import bcrypt from 'bcrypt';
import { sql } from 'drizzle-orm';

const TEST_PREFIX = 'qa-activity-';

async function seedActivityTestData() {
  console.log('🎬 Starting Activity Logs test data seeding...');
  
  try {
    // Clean existing test data
    console.log('🧹 Clearing existing test data...');
    await db.delete(adminLogs).where(sql`admin_id LIKE ${TEST_PREFIX + '%'} OR target_id LIKE ${TEST_PREFIX + '%'}`);
    await db.delete(discountCodes).where(sql`code LIKE ${'QA_ACTIVITY_%'}`);
    await db.delete(orders).where(sql`id LIKE ${TEST_PREFIX + '%'}`);
    await db.delete(products).where(sql`id LIKE ${TEST_PREFIX + '%'}`);
    await db.delete(carts).where(sql`id LIKE ${TEST_PREFIX + '%'}`);
    await db.delete(users).where(sql`email LIKE ${TEST_PREFIX + '%'}`);
    
    // Create test users
    console.log('👥 Creating test users...');
    const hashedPassword = await bcrypt.hash('Test123!', 10);
    
    const [adminUser] = await db.insert(users).values({
      id: `${TEST_PREFIX}admin`,
      email: `${TEST_PREFIX}admin@healios.test`,
      password: hashedPassword,
      role: 'admin',
      firstName: 'Activity',
      lastName: 'Admin',
      emailVerified: new Date().toISOString(),
      isActive: true
    }).returning();
    console.log(`  ✅ Created admin: ${adminUser.email}`);
    
    const [normalUser] = await db.insert(users).values({
      id: `${TEST_PREFIX}user`,
      email: `${TEST_PREFIX}user@healios.test`,
      password: hashedPassword,
      role: 'customer',
      firstName: 'Activity',
      lastName: 'User',
      emailVerified: new Date().toISOString(),
      isActive: true
    }).returning();
    console.log(`  ✅ Created user: ${normalUser.email}`);
    
    const [guestUser] = await db.insert(users).values({
      id: `${TEST_PREFIX}guest`,
      email: `${TEST_PREFIX}guest@healios.test`,
      role: 'guest',
      firstName: 'Activity',
      lastName: 'Guest',
      isActive: true
    }).returning();
    console.log(`  ✅ Created guest: ${guestUser.email}`);
    
    // Create test products
    console.log('📦 Creating test products...');
    const products_data = [];
    for (let i = 1; i <= 3; i++) {
      const [product] = await db.insert(products).values({
        id: `${TEST_PREFIX}product-${i}`,
        name: `Activity Test Product ${i}`,
        description: `Test product ${i} for activity logging`,
        price: (i * 29.99).toFixed(2),
        imageUrl: `/test-activity-${i}.jpg`,
        categories: ['test', 'activity'],
        inStock: true,
        stockQuantity: 100 - (i * 10)
      }).returning();
      products_data.push(product);
      console.log(`  ✅ Created product: ${product.name}`);
    }
    
    // Create test orders
    console.log('📋 Creating test orders...');
    const orderStatuses = ['pending', 'processing', 'shipped', 'delivered'];
    const orders_data = [];
    for (let i = 1; i <= 4; i++) {
      const user = i % 2 === 0 ? adminUser : normalUser;
      const [order] = await db.insert(orders).values({
        id: `${TEST_PREFIX}order-${i}`,
        userId: user.id,
        customerEmail: user.email,
        customerName: `${user.firstName} ${user.lastName}`,
        shippingAddress: JSON.stringify({
          street: `${i} Test Street`,
          city: 'Test City',
          province: 'Test Province',
          postalCode: '1234',
          country: 'South Africa'
        }),
        billingAddress: JSON.stringify({
          street: `${i} Test Street`,
          city: 'Test City',
          province: 'Test Province',
          postalCode: '1234',
          country: 'South Africa'
        }),
        orderItems: JSON.stringify([{
          productId: products_data[0].id,
          quantity: i,
          price: products_data[0].price
        }]),
        totalAmount: (i * parseFloat(products_data[0].price) * 1.15 + 10).toFixed(2),
        paymentStatus: i === 1 ? 'pending' : 'completed',
        orderStatus: orderStatuses[i - 1]
      }).returning();
      orders_data.push(order);
      console.log(`  ✅ Created order: ${order.id}`);
    }
    
    // Create test discount codes
    console.log('🎫 Creating discount codes...');
    const discounts_data = [];
    const discountTypes = [
      { code: 'QA_ACTIVITY_PERCENT10', type: 'percent', value: '10' },
      { code: 'QA_ACTIVITY_FIXED20', type: 'fixed', value: '20' },
      { code: 'QA_ACTIVITY_EXPIRED', type: 'percent', value: '15', expiresAt: new Date(Date.now() - 86400000).toISOString() },
      { code: 'QA_ACTIVITY_INACTIVE', type: 'fixed', value: '25', isActive: false }
    ];
    
    for (const discount of discountTypes) {
      const [created] = await db.insert(discountCodes).values({
        id: `${TEST_PREFIX}discount-${discount.code.split('_').pop()?.toLowerCase()}`,
        ...discount
      }).returning();
      discounts_data.push(created);
      console.log(`  ✅ Created discount: ${created.code}`);
    }
    
    // Create test carts
    console.log('🛒 Creating test carts...');
    const [abandonedCart] = await db.insert(carts).values({
      id: `${TEST_PREFIX}cart-abandoned`,
      userId: normalUser.id,
      sessionToken: `${TEST_PREFIX}session-1`,
      items: JSON.stringify([
        { productId: products_data[0].id, quantity: 2, price: products_data[0].price }
      ]),
      totalAmount: (parseFloat(products_data[0].price) * 2).toFixed(2),
      convertedToOrder: false
    }).returning();
    console.log(`  ✅ Created abandoned cart: ${abandonedCart.id}`);
    
    const [convertedCart] = await db.insert(carts).values({
      id: `${TEST_PREFIX}cart-converted`,
      userId: adminUser.id,
      sessionToken: `${TEST_PREFIX}session-2`,
      items: JSON.stringify([
        { productId: products_data[1].id, quantity: 1, price: products_data[1].price }
      ]),
      totalAmount: products_data[1].price,
      convertedToOrder: true,
      stripeSessionId: 'cs_test_activity_123'
    }).returning();
    console.log(`  ✅ Created converted cart: ${convertedCart.id}`);
    
    // Skip sample logs creation - database doesn't have ip_address column yet
    console.log('⏭️  Skipping sample activity logs (database schema mismatch)');
    
    console.log('\n============================================================');
    console.log('✅ Activity Logs test data seeding complete!');
    console.log('============================================================\n');
    
    console.log('📊 Test Data Summary:');
    console.log(`  • Users: 3 (admin, customer, guest)`);
    console.log(`  • Products: ${products_data.length}`);
    console.log(`  • Orders: ${orders_data.length}`);
    console.log(`  • Discount Codes: ${discounts_data.length}`);
    console.log(`  • Carts: 2 (1 abandoned, 1 converted)`);
    console.log(`  • Sample Logs: 0 (skipped due to schema mismatch)`);
    
    console.log('\n🔑 Test Credentials:');
    console.log(`  Admin: ${adminUser.email} / Test123!`);
    console.log(`  User: ${normalUser.email} / Test123!`);
    console.log(`  Guest: ${guestUser.email} (no password)`);
    
    console.log('\n🎫 Test Discount Codes:');
    discounts_data.forEach(d => {
      console.log(`  • ${d.code} - ${d.type === 'percent' ? d.value + '%' : 'R' + d.value} off`);
    });
    
    return {
      users: { adminUser, normalUser, guestUser },
      products: products_data,
      orders: orders_data,
      discounts: discounts_data,
      carts: { abandonedCart, convertedCart },
      logs: []
    };
    
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    throw error;
  }
}

// Run if called directly
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if this script is being run directly
if (process.argv[1] === __filename) {
  seedActivityTestData()
    .then(() => {
      console.log('\n✅ Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Seeding failed:', error);
      process.exit(1);
    });
}

export { seedActivityTestData };