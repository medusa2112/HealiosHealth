// Create test users for Phase 10 security testing
import { storage } from './storage';
import { determineUserRole } from './lib/auth';

// SECURITY NOTE: These are development test users only!
// In production, passwords should be properly hashed and never logged.

export async function createTestUsers() {
  try {
    // Create admin user
    const adminUser = await storage.createUser({
      email: 'admin@healios.com',
      password: null, // OAuth-based auth - no password needed
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });
    console.log('✅ Created admin user:', adminUser.email);

    // Create customer user
    const customerUser = await storage.createUser({
      email: 'customer@healios.com', 
      password: null, // OAuth-based auth - no password needed
      firstName: 'Customer',
      lastName: 'User',
      role: 'customer'
    });
    console.log('✅ Created customer user:', customerUser.email);
    
    console.log('\n🔐 Phase 10 Test Users Ready (OAuth-based):');
    console.log('Admin: admin@healios.com (use Replit OAuth)');
    console.log('Customer: customer@healios.com (use Replit OAuth)');
    
  } catch (error) {
    console.error('❌ Error creating test users:', error);
  }
}

// Run if called directly
if (require.main === module) {
  createTestUsers();
}