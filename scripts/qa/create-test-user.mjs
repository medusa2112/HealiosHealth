
import { storage } from "../../server/storage.js";
import bcrypt from "bcrypt";

async function createTestUser() {
  try {
    const email = "test.customer@example.com";
    const existing = await storage.getUserByEmail(email);
    
    if (existing) {
      // Update password
      const hash = await bcrypt.hash("TestPass123!", 10);
      await storage.updateUserPassword(existing.id, hash);
      console.log("✓ Updated test customer password");
    } else {
      // Create new
      const hash = await bcrypt.hash("TestPass123!", 10);
      await storage.createUser({
        email,
        password: hash,
        firstName: "Test",
        lastName: "Customer",
        role: "customer",
        emailVerified: new Date().toISOString()
      });
      console.log("✓ Created test customer");
    }
  } catch (e) {
    console.error("Failed to create test user:", e);
  }
  process.exit(0);
}

createTestUser();
