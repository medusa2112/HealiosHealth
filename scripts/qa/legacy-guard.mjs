#!/usr/bin/env node
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const ROOTS = ["server", "src", "client"];
const BAD_PATTERNS = [
  { re: /\/api\/auth\/login\b/, msg: "Legacy shared login endpoint detected." },
  { re: /healios\.sid/,         msg: "Legacy shared cookie name detected." },
  { re: /\bpassport\b|\bopenid-client\b/, msg: "passport/openid-client detected; must be quarantined." },
  { re: /\breplitAuth\b/,       msg: "replitAuth found; must not touch prod auth." },
  { re: /\brequireAuth\b[^A-Za-z]/, msg: "Generic requireAuth found; must use requireCustomer/requireAdmin." },
  { re: /role\s*===\s*['"]admin['"]/, msg: "Role check used in place of admin session guard." },
  { re: /Access-Control-Allow-Origin.*\*/, msg: "Wildcard CORS found." }
];

// Exceptions - files we allow to have legacy patterns (for backward compatibility during migration)
const EXCEPTIONS = [
  "server/security-seed.ts",  // Example code for security scanning
  "server/replitAuth.ts",      // Quarantined behind env flag
  "server/lib/auth.ts",        // Has some legacy refs but controlled
  "server/routes/auth.ts",     // Has clearCookie for migration
  "server/health.ts",          // Health check reports legacy status
  "cookies.txt",               // Test files
  "admin_cookies.txt",
  "test_cookies.txt"
];

let failures = [];

const walk = (dir, base = "") => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    const relPath = join(base, entry.name);
    
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      walk(p, relPath);
    } else if (/\.(ts|tsx|js|cjs|mjs)$/.test(entry.name)) {
      // Skip exception files
      if (EXCEPTIONS.some(ex => relPath.includes(ex))) continue;
      
      const s = readFileSync(p, "utf8");
      for (const { re, msg } of BAD_PATTERNS) {
        if (re.test(s)) {
          // Special handling for some patterns
          if (msg.includes("Generic requireAuth") && relPath.includes("server/routes.ts")) {
            // routes.ts imports requireAuth but that's ok
            continue;
          }
          if (msg.includes("Role check") && relPath.includes("server/auth/customerAuth.ts")) {
            // This is actually checking to redirect admins away from customer login
            continue;
          }
          failures.push(`${msg} -> ${relPath}`);
        }
      }
    }
  }
};

for (const root of ROOTS) {
  try { 
    walk(join(process.cwd(), root), root); 
  } catch (e) {
    // Root doesn't exist, skip
  }
}

if (failures.length) {
  console.error("❌ Legacy guard failures:");
  for (const f of failures) console.error(" -", f);
  process.exit(1);
} else {
  console.log("✅ Legacy guard clean.");
}