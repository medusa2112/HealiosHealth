// Create test users for Phase 10 security testing
import { storage } from './storage';
import { determineUserRole } from './lib/auth';

export async function createTestUsers() {
  try {
    // Create admin user
    const adminUser = await storage.createUser({
      email: 'admin@healios.com',
      password: 'admin123', // In production, this would be hashed
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });
    console.log('✅ Created admin user:', adminUser.email);

    // Create customer user
    const customerUser = await storage.createUser({
      email: 'customer@healios.com', 
      password: 'customer123',
      firstName: 'Customer',
      lastName: 'User',
      role: 'customer'
    });
    console.log('✅ Created customer user:', customerUser.email);
    
    console.log('\n🔐 Phase 10 Test Users Ready:');
    console.log('Admin: admin@healios.com / admin123');
    console.log('Customer: customer@healios.com / customer123');
    
  } catch (error) {
    console.error('❌ Error creating test users:', error);
  }
}

// Run if called directly
if (require.main === module) {
  createTestUsers();
}