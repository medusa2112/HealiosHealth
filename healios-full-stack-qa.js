#!/usr/bin/env node

/**
 * Healios Full Stack QA Audit Script
 * 
 * Comprehensive security and functionality audit for the Healios e-commerce system
 * Based on the Final QA Prompt for Phases 1-21
 * 
 * Run with: node healios-full-stack-qa.js
 */

const fs = require('fs');
const path = require('path');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(type, message) {
  const timestamp = new Date().toISOString();
  let color = colors.reset;
  let prefix = '';

  switch (type) {
    case 'pass':
      color = colors.green;
      prefix = '✅ PASS';
      break;
    case 'fail':
      color = colors.red;
      prefix = '❌ FAIL';
      break;
    case 'warning':
      color = colors.yellow;
      prefix = '⚠️  WARN';
      break;
    case 'info':
      color = colors.blue;
      prefix = 'ℹ️  INFO';
      break;
    case 'section':
      color = colors.cyan + colors.bright;
      prefix = '🔍';
      break;
  }

  console.log(`${color}${prefix} ${message}${colors.reset}`);
}

function readFileContent(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
    return null;
  } catch (error) {
    return null;
  }
}

function scanDirectory(dirPath) {
  try {
    if (fs.existsSync(dirPath)) {
      return fs.readdirSync(dirPath, { recursive: true });
    }
    return [];
  } catch (error) {
    return [];
  }
}

// =============================
// 🔒 AUTH & SECURITY CHECKS
// =============================

function auditAuthSecurity() {
  log('section', 'PHASE 1: AUTH & SECURITY AUDIT');

  // Check 1: Admin routes protection
  const adminRoutes = readFileContent('server/routes/admin.ts');
  if (adminRoutes && adminRoutes.includes('protectRoute([\'admin\'])')) {
    log('pass', 'Admin routes are protected with role-based access control');
  } else {
    log('fail', 'Admin routes may not be properly protected');
  }

  // Check 2: User routes validation
  const portalRoutes = readFileContent('server/routes/portal.ts');
  if (portalRoutes && (portalRoutes.includes('requireAuth') || portalRoutes.includes('protectRoute'))) {
    log('pass', 'User portal routes have authentication middleware');
  } else {
    log('fail', 'User routes may lack proper authentication');
  }

  // Check 3: Stripe webhook validation
  const stripeRoutes = readFileContent('server/routes/stripe.ts');
  if (stripeRoutes && stripeRoutes.includes('STRIPE_WEBHOOK_SECRET') && stripeRoutes.includes('constructEvent')) {
    log('pass', 'Stripe webhooks validate signatures with secret');
  } else {
    log('fail', 'Stripe webhook signature validation may be missing');
  }

  // Check 4: Email job protection
  const emailJobRoutes = readFileContent('server/routes/email-jobs.ts');
  const mainRoutes = readFileContent('server/routes.ts');
  if (mainRoutes && mainRoutes.includes('requireAuth') && mainRoutes.includes('protectRoute([\'admin\'])') && mainRoutes.includes('email-jobs')) {
    log('pass', 'Email job endpoints are admin-protected');
  } else {
    log('fail', 'Email job endpoints may be publicly accessible');
  }

  // Check 5: Referral abuse protection
  const referralService = readFileContent('server/lib/referralService.ts');
  if (referralService && referralService.includes('self-referral') && referralService.includes('validation')) {
    log('pass', 'Referral system has anti-abuse measures');
  } else {
    log('warning', 'Referral abuse protection may need verification');
  }

  // Check 6: AI assistant data isolation
  const aiAssistantService = readFileContent('server/lib/aiAssistantService.ts');
  if (aiAssistantService && aiAssistantService.includes('sessionId') && aiAssistantService.includes('userId')) {
    log('pass', 'AI assistant uses session-based data isolation');
  } else {
    log('warning', 'AI assistant data isolation needs verification');
  }

  // Check 7: No hardcoded secrets
  const secretsAudit = auditHardcodedSecrets();
  if (secretsAudit.violations.length === 0) {
    log('pass', 'No hardcoded secrets found in codebase');
  } else {
    log('fail', `Found ${secretsAudit.violations.length} potential hardcoded secrets`);
    secretsAudit.violations.forEach(v => log('fail', `  ${v}`));
  }
}

function auditHardcodedSecrets() {
  const violations = [];
  const suspiciousPatterns = [
    /sk_live_[a-zA-Z0-9]+/g,     // Stripe live keys
    /sk_test_[a-zA-Z0-9]+/g,     // Stripe test keys
    /pk_live_[a-zA-Z0-9]+/g,     // Stripe public live keys
    /whsec_[a-zA-Z0-9]+/g,       // Stripe webhook secrets
    /[a-zA-Z0-9]{32,}/g,         // Generic long strings that might be keys
  ];

  const filesToCheck = [
    ...scanDirectory('client/src').filter(f => f.endsWith('.ts') || f.endsWith('.tsx')),
    ...scanDirectory('server').filter(f => f.endsWith('.ts') && !f.includes('node_modules'))
  ];

  filesToCheck.forEach(file => {
    const content = readFileContent(file);
    if (content) {
      suspiciousPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          matches.forEach(match => {
            if (!match.includes('your_') && !match.includes('sk_test_') && match.length > 20) {
              violations.push(`${file}: ${match.substring(0, 20)}...`);
            }
          });
        }
      });
    }
  });

  return { violations };
}

// =============================
// 🧩 FRONTEND ROUTES & SCREENS
// =============================

function auditFrontendRoutes() {
  log('section', 'PHASE 2: FRONTEND ROUTES & SCREENS AUDIT');

  const appRoutes = readFileContent('client/src/App.tsx');
  
  // Check portal tabs
  const customerPortal = readFileContent('client/src/pages/customer-portal.tsx');
  const requiredPortalTabs = ['Orders', 'Addresses', 'Subscriptions', 'Support'];
  let portalTabsFound = 0;
  
  requiredPortalTabs.forEach(tab => {
    if (customerPortal && customerPortal.includes(tab)) {
      portalTabsFound++;
    }
  });

  if (portalTabsFound === requiredPortalTabs.length) {
    log('pass', 'Customer portal has all required tabs');
  } else {
    log('fail', `Customer portal missing tabs: ${requiredPortalTabs.length - portalTabsFound}/${requiredPortalTabs.length}`);
  }

  // Check admin dashboard
  const adminDashboard = readFileContent('client/src/pages/admin.tsx');
  const requiredAdminSections = ['Product', 'Orders', 'Subscriptions', 'Discounts'];
  let adminSectionsFound = 0;

  requiredAdminSections.forEach(section => {
    if (adminDashboard && adminDashboard.includes(section)) {
      adminSectionsFound++;
    }
  });

  if (adminSectionsFound >= 3) {
    log('pass', 'Admin dashboard has core management sections');
  } else {
    log('fail', `Admin dashboard missing sections: ${requiredAdminSections.length - adminSectionsFound}/${requiredAdminSections.length}`);
  }

  // Check checkout functionality
  const checkout = readFileContent('client/src/pages/checkout.tsx');
  if (checkout && checkout.includes('discount') && checkout.includes('referral')) {
    log('pass', 'Checkout supports discount and referral codes');
  } else {
    log('warning', 'Checkout discount/referral support needs verification');
  }

  // Check AI assistant integration
  if (appRoutes && appRoutes.includes('AIAssistant') && appRoutes.includes('ChatBubble')) {
    log('pass', 'AI assistant is integrated in main app');
  } else {
    log('fail', 'AI assistant integration missing from main app');
  }
}

// =============================
// 🧱 BACKEND API ROUTES & LOGIC
// =============================

function auditBackendAPI() {
  log('section', 'PHASE 3: BACKEND API ROUTES & LOGIC AUDIT');

  // Check Stripe checkout handling
  const stripeRoutes = readFileContent('server/routes/stripe.ts');
  if (stripeRoutes && stripeRoutes.includes('checkout.session.completed') && stripeRoutes.includes('subscription')) {
    log('pass', 'Stripe webhooks handle both orders and subscriptions');
  } else {
    log('fail', 'Stripe webhook handling may be incomplete');
  }

  // Check product variant sync
  const adminRoutes = readFileContent('server/routes/admin.ts');
  if (adminRoutes && adminRoutes.includes('product_variants')) {
    log('pass', 'Admin product management syncs with variants');
  } else {
    log('warning', 'Product variant sync needs verification');
  }

  // Check bundle restrictions
  const bundleRoutes = readFileContent('server/routes/bundles.ts');
  if (bundleRoutes && bundleRoutes.includes('children') && bundleRoutes.includes('eligible')) {
    log('pass', 'Bundle creation has children product exclusion');
  } else {
    log('warning', 'Bundle children exclusion logic needs verification');
  }

  // Check email deduplication
  const emailJobs = readFileContent('server/jobs/emailAbandonedCarts.ts');
  if (emailJobs && emailJobs.includes('email_events') && emailJobs.includes('dedup')) {
    log('pass', 'Email jobs have deduplication mechanisms');
  } else {
    log('warning', 'Email deduplication needs verification');
  }
}

// =============================
// 📩 EMAIL + AI INTEGRATION
// =============================

function auditEmailAI() {
  log('section', 'PHASE 4: EMAIL + AI INTEGRATION AUDIT');

  // Check email service usage
  const emailService = readFileContent('server/lib/email.ts');
  if (emailService && emailService.includes('sendEmail') && emailService.includes('template')) {
    log('pass', 'Centralized email service with templating');
  } else {
    log('fail', 'Email service may be incomplete');
  }

  // Check AI assistant routing
  const aiService = readFileContent('server/lib/aiAssistantService.ts');
  if (aiService && aiService.includes('orderTracking') && aiService.includes('returns') && aiService.includes('FAQ')) {
    log('pass', 'AI assistant has proper request routing');
  } else {
    log('fail', 'AI assistant routing may be incomplete');
  }

  // Check medical claims prevention
  if (aiService && aiService.includes('medical') && aiService.includes('cannot')) {
    log('pass', 'AI assistant blocks medical claims');
  } else {
    log('warning', 'Medical claims prevention needs verification');
  }
}

// =============================
// 🧪 TEST DATA VERIFICATION
// =============================

function auditTestData() {
  log('section', 'PHASE 5: TEST DATA VERIFICATION');

  const storage = readFileContent('server/storage.ts');
  const schema = readFileContent('shared/schema.ts');

  // Check for test data seeding
  const indexFile = readFileContent('server/index.ts');
  if (indexFile && indexFile.includes('Seeded') && indexFile.includes('testing')) {
    log('pass', 'System has test data seeding for development');
  } else {
    log('warning', 'Test data seeding may be missing');
  }

  // Verify schema completeness
  const requiredTables = [
    'users', 'products', 'productVariants', 'orders', 'subscriptions', 
    'discountCodes', 'bundles', 'referralCodes', 'supportTickets', 'chatSessions'
  ];

  let tablesFound = 0;
  requiredTables.forEach(table => {
    if (schema && schema.includes(table)) {
      tablesFound++;
    }
  });

  if (tablesFound >= 8) {
    log('pass', `Database schema is comprehensive (${tablesFound}/${requiredTables.length} tables)`);
  } else {
    log('warning', `Database schema may be incomplete (${tablesFound}/${requiredTables.length} tables)`);
  }
}

// =============================
// 📦 FINAL VERIFICATION
// =============================

function auditFinalVerification() {
  log('section', 'PHASE 6: FINAL VERIFICATION AUDIT');

  // Check console.log cleanup
  const serverFiles = scanDirectory('server').filter(f => f.endsWith('.ts'));
  let consoleLogsFound = 0;
  
  serverFiles.forEach(file => {
    const content = readFileContent(file);
    if (content) {
      const matches = content.match(/console\.log\(/g);
      if (matches) {
        const protectedLogs = content.match(/NODE_ENV.*development.*console\.log/g);
        if (!protectedLogs || matches.length > protectedLogs.length) {
          consoleLogsFound += matches.length;
        }
      }
    }
  });

  if (consoleLogsFound < 10) {
    log('pass', 'Console logs are minimal or protected by environment checks');
  } else {
    log('warning', `Found ${consoleLogsFound} console.log statements that may need review`);
  }

  // Check environment variable usage
  const requiredEnvVars = [
    'DATABASE_URL',
    'STRIPE_SECRET_KEY', 
    'STRIPE_WEBHOOK_SECRET',
    'OPENAI_API_KEY',
    'RESEND_API_KEY'
  ];

  requiredEnvVars.forEach(envVar => {
    const found = serverFiles.some(file => {
      const content = readFileContent(file);
      return content && content.includes(`process.env.${envVar}`);
    });

    if (found) {
      log('pass', `Environment variable ${envVar} is properly referenced`);
    } else {
      log('warning', `Environment variable ${envVar} may not be used`);
    }
  });

  // Check for proper error handling
  const routeFiles = scanDirectory('server/routes').filter(f => f.endsWith('.ts'));
  let errorHandlingFound = 0;

  routeFiles.forEach(file => {
    const content = readFileContent(file);
    if (content && content.includes('try') && content.includes('catch') && content.includes('status(500)')) {
      errorHandlingFound++;
    }
  });

  if (errorHandlingFound >= routeFiles.length * 0.8) {
    log('pass', 'Routes have comprehensive error handling');
  } else {
    log('warning', `Only ${errorHandlingFound}/${routeFiles.length} route files have proper error handling`);
  }
}

// =============================
// 🎯 PHASE 21 SPECIFIC CHECKS
// =============================

function auditPhase21Specific() {
  log('section', 'PHASE 7: PHASE 21 AI ASSISTANT SPECIFIC AUDIT');

  // Check AI assistant service implementation
  const aiService = readFileContent('server/lib/aiAssistantService.ts');
  const requiredFeatures = [
    'order tracking',
    'return processing', 
    'FAQ responses',
    'discount validation',
    'session management',
    'escalation'
  ];

  let featuresFound = 0;
  requiredFeatures.forEach(feature => {
    const searchTerms = feature.split(' ');
    const found = searchTerms.every(term => 
      aiService && aiService.toLowerCase().includes(term.toLowerCase())
    );
    if (found) featuresFound++;
  });

  if (featuresFound >= 5) {
    log('pass', `AI assistant has ${featuresFound}/${requiredFeatures.length} required features`);
  } else {
    log('fail', `AI assistant missing features: ${requiredFeatures.length - featuresFound}/${requiredFeatures.length}`);
  }

  // Check frontend component integration
  const aiComponent = readFileContent('client/src/components/AIAssistant.tsx');
  if (aiComponent && aiComponent.includes('useState') && aiComponent.includes('fetch') && aiComponent.includes('session')) {
    log('pass', 'AI assistant frontend component is properly implemented');
  } else {
    log('fail', 'AI assistant frontend component may be incomplete');
  }

  // Check API routes
  const aiRoutes = readFileContent('server/routes/aiAssistant.ts');
  if (aiRoutes && aiRoutes.includes('/chat') && aiRoutes.includes('/escalate') && aiRoutes.includes('/feedback')) {
    log('pass', 'AI assistant API routes are complete');
  } else {
    log('fail', 'AI assistant API routes may be missing');
  }

  // Check storage layer
  const storageFile = readFileContent('server/storage.ts');
  if (storageFile && storageFile.includes('ChatSession') && storageFile.includes('SupportTicket')) {
    log('pass', 'AI assistant storage layer is implemented');
  } else {
    log('fail', 'AI assistant storage layer may be incomplete');
  }
}

// =============================
// 🏃‍♂️ MAIN EXECUTION
// =============================

function main() {
  console.log(`${colors.cyan}${colors.bright}`);
  console.log('🔒🧱📩🧪📦 HEALIOS FULL STACK QA AUDIT 🔒🧱📩🧪📦');
  console.log('=========================================================');
  console.log('Comprehensive security and functionality audit');
  console.log('Covering Phases 1-21 of the Healios e-commerce system');
  console.log('=========================================================');
  console.log(`${colors.reset}\n`);

  const startTime = Date.now();

  // Run all audit phases
  auditAuthSecurity();
  console.log('');
  auditFrontendRoutes();
  console.log('');
  auditBackendAPI();
  console.log('');
  auditEmailAI();
  console.log('');
  auditTestData();
  console.log('');
  auditFinalVerification();
  console.log('');
  auditPhase21Specific();

  const duration = Date.now() - startTime;
  
  console.log('\n' + '='.repeat(60));
  log('info', `QA Audit completed in ${duration}ms`);
  log('info', 'Review all FAIL and WARN items before deployment');
  console.log('='.repeat(60));
}

// Run the audit
if (require.main === module) {
  main();
}

module.exports = {
  auditAuthSecurity,
  auditFrontendRoutes,
  auditBackendAPI,
  auditEmailAI,
  auditTestData,
  auditFinalVerification,
  auditPhase21Specific
};