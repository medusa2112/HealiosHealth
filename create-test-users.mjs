#!/usr/bin/env node
// Script to create test users for QA wire assertions
import bcrypt from "bcrypt";
import { db } from "./server/db.js";
import { users } from "./shared/schema.js";
import { eq } from "drizzle-orm";

async function createTestUsers() {
  try {
    // Test customer account
    const customerEmail = "test.customer@example.com";
    const customerPassword = await bcrypt.hash("TestPass123!", 10);
    
    // Check if exists
    const [existingCustomer] = await db
      .select()
      .from(users)
      .where(eq(users.email, customerEmail))
      .limit(1);
    
    if (existingCustomer) {
      // Update password
      await db
        .update(users)
        .set({ password: customerPassword })
        .where(eq(users.email, customerEmail));
      console.log("✓ Updated test customer password");
    } else {
      // Create new
      await db.insert(users).values({
        email: customerEmail,
        password: customerPassword,
        firstName: "Test",
        lastName: "Customer",
        role: "customer",
        emailVerified: new Date().toISOString()
      });
      console.log("✓ Created test customer");
    }
    
    // Test admin account (if ADM_PW not set)
    if (!process.env.ADM_PW) {
      const adminEmail = "test.admin@example.com";
      const adminPassword = await bcrypt.hash("AdminPass123!", 10);
      
      const [existingAdmin] = await db
        .select()
        .from(users)
        .where(eq(users.email, adminEmail))
        .limit(1);
      
      if (existingAdmin) {
        await db
          .update(users)
          .set({ password: adminPassword, role: "admin" })
          .where(eq(users.email, adminEmail));
        console.log("✓ Updated test admin password");
      } else {
        await db.insert(users).values({
          email: adminEmail,
          password: adminPassword,
          firstName: "Test",
          lastName: "Admin",
          role: "admin",
          emailVerified: new Date().toISOString()
        });
        console.log("✓ Created test admin");
      }
    }
    
    console.log("\n📋 Test Credentials:");
    console.log("  Customer: test.customer@example.com / TestPass123!");
    if (!process.env.ADM_PW) {
      console.log("  Admin: test.admin@example.com / AdminPass123!");
    }
    
  } catch (e) {
    console.error("Failed to create test users:", e);
    process.exit(1);
  }
  process.exit(0);
}

createTestUsers();