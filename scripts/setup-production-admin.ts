import bcrypt from 'bcrypt';
import { db } from '../server/db';
import { users } from '../shared/schema';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function setupProductionAdmin() {
  try {
    // Get password from ADM_PW secret
    const password = process.env.ADM_PW;
    
    if (!password) {
      console.error('❌ ADM_PW secret not found in environment variables');
      console.error('Please ensure ADM_PW is set in your secrets');
      process.exit(1);
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create or update the production admin user
    const [adminUser] = await db.insert(users).values({
      email: 'dn@thefourths.com',
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
        isActive: true,
        updatedAt: new Date().toISOString()
      }
    }).returning();
    
    console.log('✅ Production admin user created/updated successfully');
    console.log('📧 Email: dn@thefourths.com');
    console.log('🔑 Password: [Using ADM_PW secret]');
    console.log('👤 User ID:', adminUser.id);
    console.log('🏢 Role: admin');
    console.log('✓ Email verified: Yes');
    console.log('✓ Account active: Yes');
    
    // Also ensure admin@healios.com exists as a backup admin
    const [backupAdmin] = await db.insert(users).values({
      email: 'admin@healios.com',
      password: hashedPassword, // Use same password for consistency
      role: 'admin',
      firstName: 'Backup',
      lastName: 'Admin',
      emailVerified: new Date().toISOString(),
      isActive: true
    }).onConflictDoUpdate({
      target: users.email,
      set: {
        password: hashedPassword,
        role: 'admin',
        emailVerified: new Date().toISOString(),
        isActive: true,
        updatedAt: new Date().toISOString()
      }
    }).returning();
    
    console.log('\n📌 Backup admin also configured:');
    console.log('📧 Email: admin@healios.com');
    console.log('🔑 Password: [Using ADM_PW secret]');
    console.log('👤 User ID:', backupAdmin.id);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up production admin:', error);
    process.exit(1);
  }
}

// Run the setup
setupProductionAdmin();