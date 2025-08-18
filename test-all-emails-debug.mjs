#!/usr/bin/env node

/**
 * Comprehensive Email System Debug Test
 * Tests all email functionality and forms to ensure dn@thefourths.com sender address is working
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';
const TEST_EMAIL = 'dominicnel@mac.com'; // Using your email to receive test emails
const ADMIN_EMAIL = 'dn@thefourths.com';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

async function testEndpoint(endpoint, method = 'POST', body = null, description = '') {
  try {
    log(colors.blue, `\n🔍 Testing: ${description || endpoint}`);
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const result = await response.text();
    
    let parsed;
    try {
      parsed = JSON.parse(result);
    } catch (e) {
      parsed = { raw: result };
    }
    
    if (response.ok) {
      log(colors.green, `✅ SUCCESS (${response.status}):`, JSON.stringify(parsed, null, 2));
      return { success: true, data: parsed };
    } else {
      log(colors.red, `❌ FAILED (${response.status}):`, JSON.stringify(parsed, null, 2));
      return { success: false, error: parsed };
    }
  } catch (error) {
    log(colors.red, `💥 ERROR:`, error.message);
    return { success: false, error: error.message };
  }
}

async function testNewsletterSubscription() {
  log(colors.cyan, '\n📧 TESTING NEWSLETTER SUBSCRIPTION');
  
  return await testEndpoint('/api/newsletter/subscribe', 'POST', {
    firstName: 'Test',
    lastName: 'User',
    email: TEST_EMAIL,
    birthday: '1990-01-01'
  }, 'Newsletter subscription form');
}

async function testRestockNotifications() {
  log(colors.cyan, '\n🔔 TESTING RESTOCK NOTIFICATIONS');
  
  return await testEndpoint('/api/restock-notifications', 'POST', {
    firstName: 'Test',
    lastName: 'User',
    email: TEST_EMAIL,
    agreeToContact: true,
    productId: 'apple-cider-vinegar',
    productName: 'Apple Cider Vinegar',
    requestedAt: new Date().toISOString()
  }, 'Restock notification form');
}

async function testOrderConfirmationEmail() {
  log(colors.cyan, '\n📦 TESTING ORDER CONFIRMATION EMAIL');
  
  return await testEndpoint('/api/email/test', 'POST', {
    type: 'order_confirm',
    email: TEST_EMAIL,
    testData: {
      amount: 89.97,
      id: `test_${Date.now()}`,
      customerName: 'Test Customer',
      items: [
        { productName: 'KSM-66® Ashwagandha', quantity: 1, price: '39.99' },
        { productName: 'Magnesium Complex', quantity: 2, price: '24.99' }
      ]
    }
  }, 'Order confirmation email test');
}

async function testPinAuthEmail() {
  log(colors.cyan, '\n🔑 TESTING PIN AUTHENTICATION EMAIL');
  
  return await testEndpoint('/api/auth/admin/send-pin', 'POST', {
    email: ADMIN_EMAIL
  }, 'PIN authentication email (admin)');
}

async function testCustomerPinAuth() {
  log(colors.cyan, '\n👤 TESTING CUSTOMER PIN AUTH EMAIL');
  
  return await testEndpoint('/api/auth/customer/send-pin', 'POST', {
    email: TEST_EMAIL
  }, 'PIN authentication email (customer)');
}

async function testRefundEmail() {
  log(colors.cyan, '\n💰 TESTING REFUND EMAIL');
  
  return await testEndpoint('/api/email/test', 'POST', {
    type: 'refund',
    email: TEST_EMAIL,
    testData: {
      amount: 39.99,
      id: `refund_${Date.now()}`,
      customerName: 'Test Customer'
    }
  }, 'Refund email test');
}

async function testAdminAlert() {
  log(colors.cyan, '\n⚠️ TESTING ADMIN ALERT EMAIL');
  
  return await testEndpoint('/api/email/test', 'POST', {
    type: 'admin_alert',
    email: ADMIN_EMAIL,
    testData: {
      source: 'debug_test',
      details: 'This is a test admin alert to verify email delivery'
    }
  }, 'Admin alert email test');
}

async function checkServerHealth() {
  log(colors.yellow, '\n🏥 CHECKING SERVER HEALTH');
  
  const health = await testEndpoint('/api/health', 'GET', null, 'Server health check');
  const products = await testEndpoint('/api/products', 'GET', null, 'Products API');
  
  return health.success && products.success;
}

async function main() {
  log(colors.bold + colors.magenta, '🧪 COMPREHENSIVE EMAIL SYSTEM DEBUG TEST');
  log(colors.magenta, '=' .repeat(60));
  log(colors.yellow, `📧 Test emails will be sent to: ${TEST_EMAIL}`);
  log(colors.yellow, `👨‍💼 Admin emails will be sent to: ${ADMIN_EMAIL}`);
  log(colors.yellow, `🌐 Testing against: ${BASE_URL}`);
  
  // Wait for server to be ready
  log(colors.blue, '\n⏳ Waiting for server...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Check server health first
  const serverReady = await checkServerHealth();
  if (!serverReady) {
    log(colors.red, '💥 Server not ready - aborting tests');
    process.exit(1);
  }
  
  const results = {
    newsletter: null,
    restock: null,
    orderConfirmation: null,
    pinAuth: null,
    customerPin: null,
    refund: null,
    adminAlert: null
  };
  
  try {
    // Test all email functionality
    results.newsletter = await testNewsletterSubscription();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit
    
    results.restock = await testRestockNotifications();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    results.orderConfirmation = await testOrderConfirmationEmail();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    results.pinAuth = await testPinAuthEmail();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    results.customerPin = await testCustomerPinAuth();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    results.refund = await testRefundEmail();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    results.adminAlert = await testAdminAlert();
    
  } catch (error) {
    log(colors.red, '💥 Test suite error:', error.message);
  }
  
  // Summary
  log(colors.bold + colors.cyan, '\n📊 TEST RESULTS SUMMARY');
  log(colors.cyan, '=' .repeat(40));
  
  const testNames = {
    newsletter: '📧 Newsletter Subscription',
    restock: '🔔 Restock Notifications', 
    orderConfirmation: '📦 Order Confirmation',
    pinAuth: '🔑 Admin PIN Auth',
    customerPin: '👤 Customer PIN Auth',
    refund: '💰 Refund Email',
    adminAlert: '⚠️ Admin Alert'
  };
  
  let passCount = 0;
  let totalTests = Object.keys(results).length;
  
  Object.entries(results).forEach(([key, result]) => {
    const emoji = result?.success ? '✅' : '❌';
    const status = result?.success ? 'PASS' : 'FAIL';
    const color = result?.success ? colors.green : colors.red;
    
    log(color, `${emoji} ${testNames[key]}: ${status}`);
    if (result?.success) passCount++;
  });
  
  log(colors.bold + colors.yellow, `\n📈 OVERALL RESULT: ${passCount}/${totalTests} tests passed`);
  
  if (passCount === totalTests) {
    log(colors.bold + colors.green, '🎉 ALL EMAIL TESTS PASSED!');
    log(colors.green, '📬 Check your email inbox for test messages from dn@thefourths.com');
  } else {
    log(colors.bold + colors.red, '⚠️ SOME EMAIL TESTS FAILED');
    log(colors.yellow, '🔧 Check server logs for detailed error information');
  }
  
  log(colors.magenta, '\n' + '=' .repeat(60));
  log(colors.yellow, '💡 Next steps:');
  log(colors.yellow, '1. Check your email inbox for messages from Healios <dn@thefourths.com>');
  log(colors.yellow, '2. Verify PayStack order emails by making a test purchase');
  log(colors.yellow, '3. Test production email delivery with live orders');
}

// Run the tests
main().catch(error => {
  log(colors.red, '💥 Fatal error:', error);
  process.exit(1);
});