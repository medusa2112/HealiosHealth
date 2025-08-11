#!/usr/bin/env tsx
/**
 * Seed script to create initial admin user
 * Run with: tsx scripts/seed-admin.ts
 */

import bcrypt from 'bcrypt';
import { db } from '../server/db';
import { admins } from '../shared/schema';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function seedAdmin() {
  console.log('[SEED] Starting admin seed...');
  
  // Get admin credentials from environment
  const adminEmail = process.env.ADMIN_EMAIL || 'dn@thefourths.com';
  const adminPassword = process.env.ADM_PW;
  
  if (!adminPassword) {
    console.error('[SEED] ERROR: ADM_PW environment variable not set');
    process.exit(1);
  }
  
  try {
    // Check if admin already exists
    const [existingAdmin] = await db
      .select()
      .from(admins)
      .where(eq(admins.email, adminEmail))
      .limit(1);
    
    if (existingAdmin) {
      console.log(`[SEED] Admin already exists: ${adminEmail}`);
      console.log('[SEED] Updating password...');
      
      // Update password for existing admin
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      
      await db
        .update(admins)
        .set({ 
          passwordHash,
          active: true 
        })
        .where(eq(admins.email, adminEmail));
      
      console.log('[SEED] ✓ Admin password updated successfully');
    } else {
      // Create new admin
      console.log(`[SEED] Creating new admin: ${adminEmail}`);
      
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      
      const [newAdmin] = await db
        .insert(admins)
        .values({
          email: adminEmail,
          passwordHash,
          active: true,
        })
        .returning();
      
      console.log('[SEED] ✓ Admin created successfully:', {
        id: newAdmin.id,
        email: newAdmin.email,
      });
    }
    
    // Also create backup admin
    const backupEmail = 'admin@healios.com';
    const [backupAdmin] = await db
      .select()
      .from(admins)
      .where(eq(admins.email, backupEmail))
      .limit(1);
    
    if (!backupAdmin) {
      console.log(`[SEED] Creating backup admin: ${backupEmail}`);
      
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      
      const [newBackup] = await db
        .insert(admins)
        .values({
          email: backupEmail,
          passwordHash,
          active: true,
        })
        .returning();
      
      console.log('[SEED] ✓ Backup admin created:', {
        id: newBackup.id,
        email: newBackup.email,
      });
    } else {
      console.log(`[SEED] Backup admin already exists: ${backupEmail}`);
    }
    
    console.log('[SEED] ✓ Admin seed completed successfully');
    console.log('[SEED] Admin login credentials:');
    console.log(`  Primary: ${adminEmail}`);
    console.log(`  Backup:  ${backupEmail}`);
    console.log('  Password: [From ADM_PW environment variable]');
    
  } catch (error) {
    console.error('[SEED] ERROR:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the seed
seedAdmin().catch(console.error);