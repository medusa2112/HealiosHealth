#!/usr/bin/env node

/**
 * Test PayStack Order Email Integration
 * Creates a test order and verifies email delivery
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';
const TEST_EMAIL = 'dominicnel@mac.com';

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

async function simulatePayStackWebhook() {
  log(colors.cyan, '\n🔗 TESTING PAYSTACK WEBHOOK EMAIL INTEGRATION');
  
  // Create a test PayStack webhook payload
  const webhookPayload = {
    event: "charge.success",
    data: {
      id: 123456789,
      domain: "test",
      status: "success",
      reference: `test_healios_${Date.now()}_abc123`,
      amount: 4490, // R44.90 in cents
      message: "Payment successful",
      gateway_response: "Successful",
      paid_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      currency: "ZAR",
      customer: {
        id: 1234,
        first_name: "Test",
        last_name: "Customer", 
        email: TEST_EMAIL,
        phone: "+27123456789"
      },
      metadata: {
        userId: null,
        customerName: "Test Customer",
        customerPhone: "+27123456789",
        orderItems: JSON.stringify([
          {
            productName: "KSM-66® Ashwagandha",
            quantity: 1,
            price: "44.90"
          }
        ]),
        shippingAddress: JSON.stringify({
          street: "123 Test Street",
          city: "Cape Town",
          province: "Western Cape",
          zipCode: "8000",
          country: "South Africa"
        }),
        billingAddress: JSON.stringify({
          street: "123 Test Street", 
          city: "Cape Town",
          province: "Western Cape",
          zipCode: "8000",
          country: "South Africa"
        }),
        shippingCost: "0",
        taxAmount: "0",
        notes: "Test order from email debug script"
      }
    }
  };
  
  try {
    log(colors.blue, '📤 Sending PayStack webhook...');
    
    const response = await fetch(`${BASE_URL}/api/paystack/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Paystack-Signature': 'test_signature' // In real PayStack, this would be computed
      },
      body: JSON.stringify(webhookPayload)
    });
    
    const result = await response.text();
    let parsed;
    try {
      parsed = JSON.parse(result);
    } catch (e) {
      parsed = { raw: result };
    }
    
    if (response.ok) {
      log(colors.green, `✅ Webhook processed successfully (${response.status})`);
      log(colors.green, 'Response:', JSON.stringify(parsed, null, 2));
      return { success: true, data: parsed };
    } else {
      log(colors.red, `❌ Webhook failed (${response.status})`);
      log(colors.red, 'Error:', JSON.stringify(parsed, null, 2));
      return { success: false, error: parsed };
    }
  } catch (error) {
    log(colors.red, `💥 ERROR:`, error.message);
    return { success: false, error: error.message };
  }
}

async function testDirectEmailSending() {
  log(colors.cyan, '\n📧 TESTING DIRECT EMAIL SENDING');
  
  try {
    const response = await fetch(`${BASE_URL}/api/email/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'order_confirm',
        email: TEST_EMAIL,
        testData: {
          amount: 44.90,
          id: `direct_test_${Date.now()}`,
          customerName: 'Test Customer',
          items: [
            { productName: 'KSM-66® Ashwagandha', quantity: 1, price: '44.90' }
          ]
        }
      })
    });
    
    const result = await response.text();
    let parsed;
    try {
      parsed = JSON.parse(result);
    } catch (e) {
      parsed = { raw: result };
    }
    
    if (response.ok) {
      log(colors.green, `✅ Direct email sent successfully (${response.status})`);
      log(colors.green, 'Response:', JSON.stringify(parsed, null, 2));
      return { success: true, data: parsed };
    } else {
      log(colors.red, `❌ Direct email failed (${response.status})`);
      log(colors.red, 'Error:', JSON.stringify(parsed, null, 2));
      return { success: false, error: parsed };
    }
  } catch (error) {
    log(colors.red, `💥 ERROR:`, error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  log(colors.bold + colors.magenta, '🧪 PAYSTACK ORDER EMAIL TEST');
  log(colors.magenta, '=' .repeat(40));
  log(colors.yellow, `📧 Test emails will be sent to: ${TEST_EMAIL}`);
  log(colors.yellow, `🌐 Testing against: ${BASE_URL}`);
  
  // Wait for server to be ready
  log(colors.blue, '\n⏳ Waiting for server...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const results = {
    webhook: null,
    directEmail: null
  };
  
  try {
    // Test PayStack webhook email integration
    results.webhook = await simulatePayStackWebhook();
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test direct email sending (requires authentication)
    results.directEmail = await testDirectEmailSending();
    
  } catch (error) {
    log(colors.red, '💥 Test suite error:', error.message);
  }
  
  // Summary
  log(colors.bold + colors.cyan, '\n📊 TEST RESULTS SUMMARY');
  log(colors.cyan, '=' .repeat(30));
  
  const testNames = {
    webhook: '🔗 PayStack Webhook Email',
    directEmail: '📧 Direct Email Test'
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
    log(colors.bold + colors.green, '🎉 ALL PAYSTACK EMAIL TESTS PASSED!');
    log(colors.green, '📬 Check your email inbox for order confirmation from Healios <dn@thefourths.com>');
  } else {
    log(colors.bold + colors.red, '⚠️ SOME PAYSTACK EMAIL TESTS FAILED');
    log(colors.yellow, '🔧 Check server logs for detailed error information');
  }
  
  log(colors.magenta, '\n' + '=' .repeat(40));
  log(colors.yellow, '💡 Next steps:');
  log(colors.yellow, '1. Check your email inbox for test order confirmation');
  log(colors.yellow, '2. Test real PayStack payment flow');
  log(colors.yellow, '3. Verify production email delivery');
}

// Run the tests
main().catch(error => {
  log(colors.red, '💥 Fatal error:', error);
  process.exit(1);
});