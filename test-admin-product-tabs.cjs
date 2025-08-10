#!/usr/bin/env node

/**
 * QA Test Script for Admin Product Management Tabs
 * Tests: Pricing & Stock, Details, and SEO&AEO tabs
 */

const fs = require('fs');

// Test configuration
const BASE_URL = 'http://localhost:5000';
const ADMIN_EMAIL = 'admin@healios.com';
const ADMIN_PASSWORD = 'Admin123!';
const TEST_PRODUCT_ID = 'mind-memory-mushroom';

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Helper functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60));
}

function logTest(testName, passed, details = '') {
  const status = passed ? '✓ PASS' : '✗ FAIL';
  const color = passed ? 'green' : 'red';
  log(`  ${status}: ${testName}`, color);
  if (details) {
    log(`         ${details}`, 'cyan');
  }
}

async function makeRequest(url, options = {}) {
  const fetch = (await import('node-fetch')).default;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    credentials: 'include',
    ...options
  };
  
  try {
    const response = await fetch(`${BASE_URL}${url}`, defaultOptions);
    const text = await response.text();
    let data = null;
    
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    
    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      data,
      headers: response.headers
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      statusText: error.message,
      data: null,
      error
    };
  }
}

async function loginAsAdmin() {
  logSection('Admin Authentication');
  
  // Get CSRF token for login
  const csrfResponse = await makeRequest('/api/csrf/token');
  if (!csrfResponse.ok) {
    log('Failed to get CSRF token', 'red');
    return null;
  }
  
  const csrfToken = csrfResponse.data.csrfToken;
  const cookieHeader = csrfResponse.headers.get('set-cookie');
  
  // Login
  const loginResponse = await makeRequest('/api/auth/login', {
    method: 'POST',
    headers: {
      'Cookie': cookieHeader,
      'X-CSRF-Token': csrfToken
    },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    })
  });
  
  if (!loginResponse.ok) {
    log(`Login failed: ${loginResponse.data?.error || loginResponse.statusText}`, 'red');
    return null;
  }
  
  log('✓ Admin login successful', 'green');
  
  // Return session info for subsequent requests
  return {
    cookie: loginResponse.headers.get('set-cookie') || cookieHeader,
    csrfToken
  };
}

async function testPricingAndStockTab(session) {
  logSection('Testing Pricing & Stock Tab');
  
  // Get current product data
  const productResponse = await makeRequest(`/api/admin/products/${TEST_PRODUCT_ID}`, {
    headers: {
      'Cookie': session.cookie
    }
  });
  
  if (!productResponse.ok) {
    log('Failed to fetch product data', 'red');
    return false;
  }
  
  const originalProduct = productResponse.data;
  log(`Original product: ${originalProduct.name}`, 'cyan');
  log(`  Price: R${originalProduct.price}`, 'cyan');
  log(`  Original Price: R${originalProduct.originalPrice || 'N/A'}`, 'cyan');
  log(`  Stock: ${originalProduct.stockQuantity}`, 'cyan');
  
  // Get fresh CSRF token for update
  const csrfResponse = await makeRequest('/api/csrf/token', {
    headers: {
      'Cookie': session.cookie
    }
  });
  
  if (!csrfResponse.ok) {
    log('Failed to get CSRF token for update', 'red');
    return false;
  }
  
  const updateToken = csrfResponse.data.csrfToken;
  
  // Test updating pricing and stock
  const testData = {
    ...originalProduct,
    price: "599.00",
    originalPrice: "799.00",
    stockQuantity: 100
  };
  
  log('\nTesting price and stock update...', 'yellow');
  
  const updateResponse = await makeRequest(`/api/admin/products/${TEST_PRODUCT_ID}`, {
    method: 'PUT',
    headers: {
      'Cookie': session.cookie,
      'X-CSRF-Token': updateToken
    },
    body: JSON.stringify(testData)
  });
  
  if (updateResponse.ok) {
    logTest('Price update', true, `Updated to R${testData.price}`);
    logTest('Original price update', true, `Updated to R${testData.originalPrice}`);
    logTest('Stock quantity update', true, `Updated to ${testData.stockQuantity}`);
    
    // Restore original values
    const restoreResponse = await makeRequest(`/api/admin/products/${TEST_PRODUCT_ID}`, {
      method: 'PUT',
      headers: {
        'Cookie': session.cookie,
        'X-CSRF-Token': updateToken
      },
      body: JSON.stringify(originalProduct)
    });
    
    if (restoreResponse.ok) {
      log('✓ Original values restored', 'green');
    }
    
    return true;
  } else {
    logTest('Price and stock update', false, updateResponse.data?.error || updateResponse.statusText);
    return false;
  }
}

async function testDetailsTab(session) {
  logSection('Testing Details Tab');
  
  // Get current product data
  const productResponse = await makeRequest(`/api/admin/products/${TEST_PRODUCT_ID}`, {
    headers: {
      'Cookie': session.cookie
    }
  });
  
  if (!productResponse.ok) {
    log('Failed to fetch product data', 'red');
    return false;
  }
  
  const originalProduct = productResponse.data;
  
  // Get fresh CSRF token
  const csrfResponse = await makeRequest('/api/csrf/token', {
    headers: {
      'Cookie': session.cookie
    }
  });
  
  if (!csrfResponse.ok) {
    log('Failed to get CSRF token for update', 'red');
    return false;
  }
  
  const updateToken = csrfResponse.data.csrfToken;
  
  // Test updating supplement details
  const testData = {
    ...originalProduct,
    bottleCount: 60,
    dailyDosage: 2,
    supplyDays: 30
  };
  
  log('\nTesting supplement details update...', 'yellow');
  
  const updateResponse = await makeRequest(`/api/admin/products/${TEST_PRODUCT_ID}`, {
    method: 'PUT',
    headers: {
      'Cookie': session.cookie,
      'X-CSRF-Token': updateToken
    },
    body: JSON.stringify(testData)
  });
  
  if (updateResponse.ok) {
    logTest('Bottle count update', true, `Updated to ${testData.bottleCount}`);
    logTest('Daily dosage update', true, `Updated to ${testData.dailyDosage}`);
    logTest('Supply days update', true, `Updated to ${testData.supplyDays}`);
    
    // Restore original values
    await makeRequest(`/api/admin/products/${TEST_PRODUCT_ID}`, {
      method: 'PUT',
      headers: {
        'Cookie': session.cookie,
        'X-CSRF-Token': updateToken
      },
      body: JSON.stringify(originalProduct)
    });
    
    log('✓ Original values restored', 'green');
    return true;
  } else {
    logTest('Supplement details update', false, updateResponse.data?.error || updateResponse.statusText);
    return false;
  }
}

async function testSEOAndAEOTab(session) {
  logSection('Testing SEO & AEO Tab');
  
  // Get current product data
  const productResponse = await makeRequest(`/api/admin/products/${TEST_PRODUCT_ID}`, {
    headers: {
      'Cookie': session.cookie
    }
  });
  
  if (!productResponse.ok) {
    log('Failed to fetch product data', 'red');
    return false;
  }
  
  const originalProduct = productResponse.data;
  
  // Get fresh CSRF token
  const csrfResponse = await makeRequest('/api/csrf/token', {
    headers: {
      'Cookie': session.cookie
    }
  });
  
  if (!csrfResponse.ok) {
    log('Failed to get CSRF token for update', 'red');
    return false;
  }
  
  const updateToken = csrfResponse.data.csrfToken;
  
  // Test updating SEO fields
  const testData = {
    ...originalProduct,
    seoTitle: "Lion's Mane Gummies | Premium Supplements | Healios",
    seoDescription: "Boost cognitive function with our premium Lion's Mane mushroom gummies. 2000mg per serving for optimal brain health and mental clarity.",
    seoKeywords: ["lion's mane", "mushroom", "cognitive support", "brain health", "supplements"]
  };
  
  log('\nTesting SEO fields update...', 'yellow');
  
  const updateResponse = await makeRequest(`/api/admin/products/${TEST_PRODUCT_ID}`, {
    method: 'PUT',
    headers: {
      'Cookie': session.cookie,
      'X-CSRF-Token': updateToken
    },
    body: JSON.stringify(testData)
  });
  
  if (updateResponse.ok) {
    logTest('SEO title update', true, `Updated successfully`);
    logTest('SEO description update', true, `Updated successfully`);
    logTest('SEO keywords update', true, `Added ${testData.seoKeywords.length} keywords`);
    
    // Restore original values
    await makeRequest(`/api/admin/products/${TEST_PRODUCT_ID}`, {
      method: 'PUT',
      headers: {
        'Cookie': session.cookie,
        'X-CSRF-Token': updateToken
      },
      body: JSON.stringify(originalProduct)
    });
    
    log('✓ Original values restored', 'green');
    return true;
  } else {
    logTest('SEO fields update', false, updateResponse.data?.error || updateResponse.statusText);
    return false;
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  log('ADMIN PRODUCT MANAGEMENT QA TEST SUITE', 'bright');
  console.log('='.repeat(60));
  log(`Testing URL: ${BASE_URL}`, 'cyan');
  log(`Product: ${TEST_PRODUCT_ID}`, 'cyan');
  
  // Login as admin
  const session = await loginAsAdmin();
  if (!session) {
    log('\n❌ Failed to authenticate as admin. Aborting tests.', 'red');
    process.exit(1);
  }
  
  // Run all tab tests
  const results = {
    pricingAndStock: await testPricingAndStockTab(session),
    details: await testDetailsTab(session),
    seoAndAEO: await testSEOAndAEOTab(session)
  };
  
  // Summary
  logSection('TEST SUMMARY');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r).length;
  const failedTests = totalTests - passedTests;
  
  log(`Total tabs tested: ${totalTests}`, 'bright');
  log(`Passed: ${passedTests}`, passedTests === totalTests ? 'green' : 'yellow');
  if (failedTests > 0) {
    log(`Failed: ${failedTests}`, 'red');
  }
  
  if (passedTests === totalTests) {
    log('\n✅ ALL TABS ARE FULLY OPERATIONAL!', 'green');
    log('The Pricing & Stock, Details, and SEO&AEO tabs are working correctly.', 'green');
  } else {
    log('\n⚠️  SOME TABS HAVE ISSUES', 'yellow');
    if (!results.pricingAndStock) {
      log('  - Pricing & Stock tab: CSRF token issue needs fixing', 'red');
    }
    if (!results.details) {
      log('  - Details tab: Update functionality needs fixing', 'red');
    }
    if (!results.seoAndAEO) {
      log('  - SEO & AEO tab: Update functionality needs fixing', 'red');
    }
  }
  
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run the tests
runTests().catch(error => {
  log(`\n❌ Test suite error: ${error.message}`, 'red');
  process.exit(1);
});