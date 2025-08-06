#!/usr/bin/env node
/**
 * HEALIOS SECURITY AUDIT SCRIPT
 * Phase 17: Final QA + Security Hardening + Failover Simulation
 * Comprehensive system security and integrity checker
 */

import fs from 'fs';
import path from 'path';

const results = {
  pass: [],
  fail: [],
  warnings: []
};

function log(type, message) {
  results[type].push(message);
  console.log(`${type.toUpperCase()}: ${message}`);
}

// PHASE 1: FUNCTIONAL QA - FEATURE COMPLETENESS
console.log('🔍 PHASE 1: FUNCTIONAL QA - FEATURE COMPLETENESS');

// Check critical files exist
const criticalFiles = [
  'server/lib/auth.ts',
  'server/routes/stripe.ts', 
  'server/lib/stripe.ts',
  'shared/schema.ts',
  'server/storage.ts',
  'server/routes/adminBundles.ts',
  'server/routes/adminDiscounts.ts'
];

criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    log('pass', `Critical file exists: ${file}`);
  } else {
    log('fail', `Missing critical file: ${file}`);
  }
});

// PHASE 2: SECURITY AUDIT - ATTACK SURFACE
console.log('\n🔒 PHASE 2: SECURITY AUDIT - ATTACK SURFACE');

// Check auth middleware usage
const authFile = 'server/lib/auth.ts';
if (fs.existsSync(authFile)) {
  const authContent = fs.readFileSync(authFile, 'utf8');
  
  if (authContent.includes('protectRoute')) {
    log('pass', 'protectRoute middleware defined');
  } else {
    log('fail', 'protectRoute middleware missing');
  }
  
  if (authContent.includes('roles.includes(user.role')) {
    log('pass', 'Role-based access control implemented');
  } else {
    log('fail', 'Role-based access control missing');
  }
  
  if (authContent.includes('ALLOWED_ADMIN_EMAILS')) {
    log('pass', 'Admin email whitelist implemented');
  } else {
    log('fail', 'Admin email whitelist missing');
  }
}

// Check Stripe webhook security
const stripeRoutesFile = 'server/routes/stripe.ts';
if (fs.existsSync(stripeRoutesFile)) {
  const stripeContent = fs.readFileSync(stripeRoutesFile, 'utf8');
  
  if (stripeContent.includes('stripe.webhooks.constructEvent')) {
    log('pass', 'Stripe webhook signature verification implemented');
  } else {
    log('fail', 'Stripe webhook signature verification missing');
  }
  
  if (stripeContent.includes('STRIPE_WEBHOOK_SECRET')) {
    log('pass', 'Stripe webhook secret validation implemented');
  } else {
    log('fail', 'Stripe webhook secret validation missing');
  }
}

// Check for security vulnerabilities in all JS/TS files
function scanForSecurityIssues(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !['node_modules', '.git', 'dist'].includes(file)) {
      scanForSecurityIssues(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.js')) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for dangerous patterns
      if (content.includes('user.email.includes(') && content.includes('admin')) {
        log('fail', `Inline admin role check found in ${filePath}`);
      }
      
      if (content.includes('console.log') && !filePath.includes('security-audit')) {
        log('warnings', `Console.log found in ${filePath}`);
      }
      
      if (content.includes('debugger')) {
        log('fail', `Debugger statement found in ${filePath}`);
      }
      
      if (content.includes('TODO') || content.includes('FIXME')) {
        log('warnings', `TODO/FIXME comment found in ${filePath}`);
      }
      
      // Check for hardcoded secrets
      const secretPatterns = [
        /sk_test_[a-zA-Z0-9]{99}/,
        /sk_live_[a-zA-Z0-9]{99}/,
        /password\s*=\s*["'][^"']+["']/i,
        /secret\s*=\s*["'][^"']+["']/i
      ];
      
      secretPatterns.forEach(pattern => {
        if (pattern.test(content)) {
          log('fail', `Potential hardcoded secret in ${filePath}`);
        }
      });
    }
  });
}

// Scan server and client directories
console.log('\n🕵️ Scanning for security vulnerabilities...');
scanForSecurityIssues('server');
scanForSecurityIssues('client');

// Check bundle exclusion logic
const bundleRoutesFile = 'server/routes/adminBundles.ts';
if (fs.existsSync(bundleRoutesFile)) {
  const bundleContent = fs.readFileSync(bundleRoutesFile, 'utf8');
  
  if (bundleContent.includes('tags') && bundleContent.includes('children')) {
    log('pass', 'Bundle children exclusion logic implemented');
  } else {
    log('warnings', 'Bundle children exclusion logic may be missing');
  }
}

// PHASE 3: Environment Variables Check
console.log('\n🔑 PHASE 3: ENVIRONMENT VARIABLES CHECK');

const requiredEnvVars = [
  'DATABASE_URL',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET'
];

requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    log('pass', `Environment variable ${envVar} is set`);
  } else {
    log('fail', `Environment variable ${envVar} is missing`);
  }
});

// Check if we're in test mode
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.includes('sk_test_')) {
  log('pass', 'Stripe is in test mode (safe for development)');
} else if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.includes('sk_live_')) {
  log('warnings', 'Stripe is in LIVE mode - ensure this is intentional');
} else {
  log('warnings', 'Cannot determine Stripe mode from secret key');
}

// PHASE 4: Route Protection Audit
console.log('\n🛡️ PHASE 4: ROUTE PROTECTION AUDIT');

// Check main routes file
const routesFile = 'server/routes.ts';
if (fs.existsSync(routesFile)) {
  const routesContent = fs.readFileSync(routesFile, 'utf8');
  
  if (routesContent.includes('protectRoute') || routesContent.includes('/admin')) {
    log('pass', 'Admin route protection appears to be implemented');
  } else {
    log('warnings', 'Admin route protection may be missing from main routes');
  }
}

// SUMMARY
console.log('\n📊 SECURITY AUDIT SUMMARY');
console.log(`✅ PASSED: ${results.pass.length} checks`);
console.log(`⚠️  WARNINGS: ${results.warnings.length} issues`);
console.log(`❌ FAILED: ${results.fail.length} critical issues`);

if (results.fail.length > 0) {
  console.log('\n❌ CRITICAL FAILURES - DEPLOYMENT BLOCKED:');
  results.fail.forEach(failure => console.log(`  - ${failure}`));
}

if (results.warnings.length > 0) {
  console.log('\n⚠️  WARNINGS - REVIEW REQUIRED:');
  results.warnings.forEach(warning => console.log(`  - ${warning}`));
}

console.log('\n🏆 DEPLOYMENT STATUS:');
if (results.fail.length === 0) {
  console.log('✅ SYSTEM READY FOR DEPLOYMENT');
  console.log('All critical security checks passed.');
} else {
  console.log('❌ DEPLOYMENT BLOCKED');
  console.log(`${results.fail.length} critical security issues must be resolved first.`);
}

// Exit with appropriate code
process.exit(results.fail.length > 0 ? 1 : 0);