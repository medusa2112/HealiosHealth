#!/usr/bin/env node

import bcrypt from 'bcrypt';
import { db } from './server/db.js';
import { users } from './shared/schema.js';
import { eq } from 'drizzle-orm';

console.log('🔐 Admin Password Verification Tool\n');

async function verifyAdminPassword() {
  const adminEmail = 'dn@thefourths.com';
  const testPassword = process.env.ADM_PW;
  
  if (!testPassword) {
    console.error('❌ ADM_PW secret not found!');
    console.log('Please ensure ADM_PW is set in your Replit secrets.');
    process.exit(1);
  }
  
  try {
    // Get admin user from database
    const [admin] = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);
    
    if (!admin) {
      console.error(`❌ Admin user ${adminEmail} not found in database!`);
      console.log('Run: npx tsx scripts/setup-production-admin.ts');
      process.exit(1);
    }
    
    console.log(`✅ Admin user found: ${admin.email}`);
    console.log(`   ID: ${admin.id}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Active: ${admin.isActive ? 'Yes' : 'No'}`);
    console.log(`   Email Verified: ${admin.emailVerified ? 'Yes' : 'No'}`);
    
    if (!admin.password) {
      console.error('❌ Admin has no password set!');
      console.log('Run: npx tsx scripts/setup-production-admin.ts');
      process.exit(1);
    }
    
    // Test password
    console.log('\n🔑 Testing password from ADM_PW secret...');
    const isValid = await bcrypt.compare(testPassword, admin.password);
    
    if (isValid) {
      console.log('✅ Password verification PASSED!');
      console.log('\nYou should be able to login with:');
      console.log(`   Email: ${adminEmail}`);
      console.log('   Password: [value from ADM_PW secret]');
      
      // Also test backup admin
      const [backupAdmin] = await db.select().from(users).where(eq(users.email, 'admin@healios.com')).limit(1);
      if (backupAdmin && backupAdmin.password) {
        const backupValid = await bcrypt.compare(testPassword, backupAdmin.password);
        if (backupValid) {
          console.log('\n✅ Backup admin (admin@healios.com) also verified!');
        }
      }
    } else {
      console.error('❌ Password verification FAILED!');
      console.log('\nThe password in ADM_PW does not match the database.');
      console.log('Run: npx tsx scripts/setup-production-admin.ts');
      console.log('This will reset the admin password to match ADM_PW.');
    }
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

verifyAdminPassword();