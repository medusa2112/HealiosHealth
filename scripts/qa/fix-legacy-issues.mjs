#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

// Files that need requireAuth -> requireAdmin replacement
const ADMIN_ROUTES = [
  "server/routes/admin.ts",
  "server/routes/adminBundles.ts", 
  "server/routes/adminDiscounts.ts",
  "server/routes/adminImages.ts",
  "server/routes/admin/abandoned-carts.ts",
  "server/routes/admin/carts.ts",
  "server/routes/admin/logs.ts",
  "server/routes/admin/orders.ts",
  "server/routes/email-jobs.ts",
  "server/routes/security-audit.ts"
];

// Files that have mixed auth and need careful handling
const MIXED_ROUTES = [
  "server/routes/cart.ts",
  "server/routes/bundles.ts",
  "server/routes/referrals.ts",
  "server/routes/aiAssistant.ts"
];

let fixes = 0;

// Fix admin routes - replace requireAuth with requireAdmin
for (const file of ADMIN_ROUTES) {
  const path = join(process.cwd(), file);
  try {
    let content = readFileSync(path, "utf8");
    const original = content;
    
    // Replace import
    content = content.replace(
      /import\s*{\s*requireAuth\s*}\s*from\s*['"]\.\.\/lib\/auth['"]/g,
      "import { requireAdmin } from '../mw/requireAdmin'"
    );
    content = content.replace(
      /import\s*{\s*requireAuth\s*}\s*from\s*['"]\.\.\/\.\.\/lib\/auth['"]/g,
      "import { requireAdmin } from '../../mw/requireAdmin'"
    );
    
    // Replace usage
    content = content.replace(/\brequireAuth\b/g, "requireAdmin");
    
    if (content !== original) {
      writeFileSync(path, content);
      console.log(`✓ Fixed ${file}`);
      fixes++;
    }
  } catch (e) {
    console.log(`⚠️  Could not fix ${file}: ${e.message}`);
  }
}

// Fix routes.ts - remove replitAuth import
const routesPath = join(process.cwd(), "server/routes.ts");
try {
  let content = readFileSync(routesPath, "utf8");
  const original = content;
  
  // Comment out replitAuth import
  content = content.replace(
    /import\s*{\s*setupAuth\s*}\s*from\s*["']\.\/replitAuth["'];?/g,
    "// import { setupAuth } from \"./replitAuth\"; // Quarantined"
  );
  
  // Comment out setupAuth call
  content = content.replace(
    /await\s+setupAuth\(app\);/g,
    "// await setupAuth(app); // Quarantined - using dual auth instead"
  );
  
  if (content !== original) {
    writeFileSync(routesPath, content);
    console.log(`✓ Fixed server/routes.ts - quarantined replitAuth`);
    fixes++;
  }
} catch (e) {
  console.log(`⚠️  Could not fix routes.ts: ${e.message}`);
}

// Create a test user for wire assertions
console.log("\n📝 Creating test user for wire assertions...");
const createTestUser = `
import { storage } from "./server/storage.js";
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
`;

writeFileSync(join(process.cwd(), "scripts/qa/create-test-user.mjs"), createTestUser);

console.log(`\n✅ Fixed ${fixes} files`);
console.log("\n📋 Summary:");
console.log("  - Admin routes now use requireAdmin");
console.log("  - replitAuth quarantined in routes.ts");
console.log("  - Test user script created");
console.log("\n⚠️  Still need manual fixes:");
console.log("  - Mixed auth routes (cart, bundles, etc) need context-aware auth");
console.log("  - Frontend components checking role === 'admin'");
console.log("\nRun: node scripts/qa/create-test-user.mjs to set up test credentials");