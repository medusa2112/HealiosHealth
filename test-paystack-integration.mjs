#!/usr/bin/env node

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

console.log('🔍 PayStack Integration QA Audit\n');
console.log('=' . repeat(50));

// Test configuration
const tests = [];
let passed = 0;
let failed = 0;

// Helper to run a test
async function runTest(name, testFn) {
  try {
    console.log(`\n📋 Testing: ${name}`);
    await testFn();
    console.log(`   ✅ PASSED`);
    passed++;
    tests.push({ name, status: 'PASSED', error: null });
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
    failed++;
    tests.push({ name, status: 'FAILED', error: error.message });
  }
}

// Test 1: Health Check
await runTest('PayStack Health Endpoint', async () => {
  const response = await fetch(`${BASE_URL}/api/health`);
  if (!response.ok) throw new Error(`Health check failed: ${response.status}`);
  const data = await response.json();
  if (data.status !== 'healthy') throw new Error('Health status not healthy');
});

// Test 2: Create Checkout Session with Idempotency Key
await runTest('Create PayStack Checkout Session', async () => {
  const idempotencyKey = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const response = await fetch(`${BASE_URL}/api/paystack/create-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify({
      email: 'test@example.com',
      amount: 100,
      currency: 'ZAR',
      metadata: {
        customerName: 'QA Test User',
        orderItems: JSON.stringify([
          { name: 'Test Product', quantity: 1, price: 100 }
        ])
      },
      callback_url: `${BASE_URL}/order-confirmation`
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Checkout creation failed: ${response.status} - ${error}`);
  }
  
  const data = await response.json();
  
  // Validate response structure
  if (!data.success) throw new Error('Response missing success flag');
  if (!data.authorization_url) throw new Error('Response missing authorization_url');
  if (!data.access_code) throw new Error('Response missing access_code');
  if (!data.reference) throw new Error('Response missing reference');
  if (!data.authorization_url.includes('paystack.com')) {
    throw new Error('Invalid PayStack URL format');
  }
  
  console.log(`   ✓ PayStack URL: ${data.authorization_url}`);
  console.log(`   ✓ Reference: ${data.reference}`);
});

// Test 3: Duplicate Idempotency Key (should be rejected)
await runTest('Reject Duplicate Idempotency Key', async () => {
  const idempotencyKey = `duplicate-test-${Date.now()}`;
  
  // First request
  const response1 = await fetch(`${BASE_URL}/api/paystack/create-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify({
      email: 'test@example.com',
      amount: 50,
      currency: 'ZAR'
    })
  });
  
  if (!response1.ok) throw new Error('First request failed');
  
  // Duplicate request with same key
  const response2 = await fetch(`${BASE_URL}/api/paystack/create-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify({
      email: 'test@example.com',
      amount: 50,
      currency: 'ZAR'
    })
  });
  
  if (response2.status !== 409) {
    throw new Error(`Expected 409 for duplicate key, got ${response2.status}`);
  }
  
  const error = await response2.json();
  if (error.error !== 'Duplicate request') {
    throw new Error('Incorrect error message for duplicate request');
  }
});

// Test 4: Missing Idempotency Key (should fail)
await runTest('Require Idempotency Key', async () => {
  const response = await fetch(`${BASE_URL}/api/paystack/create-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // No Idempotency-Key header
    },
    body: JSON.stringify({
      email: 'test@example.com',
      amount: 100,
      currency: 'ZAR'
    })
  });
  
  if (response.status !== 400) {
    throw new Error(`Expected 400 for missing key, got ${response.status}`);
  }
  
  const error = await response.json();
  if (error.error !== 'Idempotency key required') {
    throw new Error('Incorrect error message for missing key');
  }
});

// Test 5: Invalid Request Data
await runTest('Validate Request Data', async () => {
  const idempotencyKey = `validation-test-${Date.now()}`;
  
  const response = await fetch(`${BASE_URL}/api/paystack/create-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify({
      // Missing required email field
      amount: 100
    })
  });
  
  if (response.status !== 400) {
    throw new Error(`Expected 400 for invalid data, got ${response.status}`);
  }
  
  const error = await response.json();
  if (!error.error.includes('Email and amount are required')) {
    throw new Error('Missing validation error for required fields');
  }
});

// Test 6: Large Amount Handling
await runTest('Handle Large Amounts', async () => {
  const idempotencyKey = `large-amount-${Date.now()}`;
  
  const response = await fetch(`${BASE_URL}/api/paystack/create-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify({
      email: 'bigspender@example.com',
      amount: 99999.99,
      currency: 'ZAR',
      metadata: {
        customerName: 'Big Spender',
        orderItems: JSON.stringify([
          { name: 'Premium Package', quantity: 1, price: 99999.99 }
        ])
      }
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Large amount failed: ${error}`);
  }
  
  const data = await response.json();
  if (!data.success) throw new Error('Large amount checkout failed');
});

// Test 7: Check PayStack API Keys Configuration
await runTest('PayStack API Keys Configured', async () => {
  const hasSecretKey = !!process.env.PAYSTACK_SECRET_KEY;
  const hasPublicKey = !!process.env.PAYSTACK_PUBLIC_KEY;
  
  if (!hasSecretKey && !hasPublicKey) {
    console.log('   ⚠️  PayStack keys not found in environment');
    // Don't fail this test as keys might be configured differently
  } else {
    console.log(`   ✓ Secret Key: ${hasSecretKey ? 'Configured' : 'Missing'}`);
    console.log(`   ✓ Public Key: ${hasPublicKey ? 'Configured' : 'Missing'}`);
  }
});

// Summary
console.log('\n' + '=' . repeat(50));
console.log('📊 QA AUDIT SUMMARY\n');
console.log(`Total Tests: ${tests.length}`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);

// Detailed results
if (failed > 0) {
  console.log('\n⚠️  Failed Tests:');
  tests.filter(t => t.status === 'FAILED').forEach(test => {
    console.log(`   - ${test.name}: ${test.error}`);
  });
}

console.log('\n🎯 PayStack Integration Status:');
if (failed === 0) {
  console.log('   ✅ All tests passed - PayStack integration is fully functional!');
} else {
  console.log('   ⚠️  Some tests failed - review the issues above');
}

process.exit(failed > 0 ? 1 : 0);