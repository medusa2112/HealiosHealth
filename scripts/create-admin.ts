import bcrypt from 'bcrypt';
import { db } from '../server/db';
import { users } from '../shared/schema';

async function createAdminUser() {
  try {
    // Create a secure password hash
    const password = 'Admin123!';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create admin user
    const [adminUser] = await db.insert(users).values({
      email: 'admin@healios.com',
      password: hashedPassword,
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      emailVerified: new Date().toISOString(),
      isActive: true
    }).onConflictDoUpdate({
      target: users.email,
      set: {
        password: hashedPassword,
        role: 'admin',
        emailVerified: new Date().toISOString(),
        isActive: true
      }
    }).returning();
    
    console.log('✅ Admin user created/updated successfully');
    console.log('📧 Email: admin@healios.com');
    console.log('🔑 Password: Admin123!');
    console.log('👤 User ID:', adminUser.id);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();