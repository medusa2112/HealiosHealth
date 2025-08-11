#!/usr/bin/env node

/**
 * Complete test of admin login and session persistence
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testAdminSession() {
  console.log('🔐 Testing Admin Session System\n');
  
  try {
    // Step 1: Get CSRF token
    console.log('1. Getting CSRF token...');
    const csrfResponse = await fetch(`${BASE_URL}/api/admin/csrf`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const csrfData = await csrfResponse.json();
    const csrfToken = csrfData.token || csrfData.csrfToken;
    console.log('   ✓ CSRF token obtained\n');
    
    // Step 2: Login and capture cookies
    console.log('2. Logging in as admin...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({
        email: 'dn@thefourths.com',
        password: process.env.ADM_PW || 'test-password'
      })
    });
    
    const loginResult = await loginResponse.json();
    
    if (!loginResponse.ok) {
      console.log('   ❌ Login failed:', loginResult);
      return;
    }
    
    console.log('   ✓ Login successful\n');
    
    // Extract session cookie
    const setCookieHeader = loginResponse.headers.raw()['set-cookie'];
    if (!setCookieHeader) {
      console.log('   ❌ No session cookie received');
      return;
    }
    
    const cookies = setCookieHeader.join('; ');
    console.log('3. Session cookie received:');
    const cookieType = cookies.includes('hh_admin_sess') ? 'hh_admin_sess (admin)' : 
                       cookies.includes('hh_cust_sess') ? 'hh_cust_sess (customer)' : 'unknown';
    console.log(`   Cookie type: ${cookieType}\n`);
    
    // Step 4: Test admin products endpoint
    console.log('4. Testing /api/admin/products with session...');
    const productsResponse = await fetch(`${BASE_URL}/api/admin/products`, {
      method: 'GET',
      headers: {
        'Cookie': cookies,
        'X-CSRF-Token': csrfToken
      }
    });
    
    if (productsResponse.ok) {
      const products = await productsResponse.json();
      console.log('   ✓ Admin products accessible');
      console.log(`   Total products: ${products.length}`);
      if (products.length > 0) {
        console.log(`   First product: ${products[0].name} (ID: ${products[0].id})`);
      }
    } else {
      const error = await productsResponse.json();
      console.log('   ❌ Admin products not accessible');
      console.log(`   Error: ${JSON.stringify(error)}`);
    }
    
    // Step 5: Test admin dashboard
    console.log('\n5. Testing /api/admin dashboard...');
    const dashboardResponse = await fetch(`${BASE_URL}/api/admin`, {
      method: 'GET',
      headers: {
        'Cookie': cookies,
        'X-CSRF-Token': csrfToken
      }
    });
    
    if (dashboardResponse.ok) {
      const dashboard = await dashboardResponse.json();
      console.log('   ✓ Admin dashboard accessible');
      console.log(`   Total users: ${dashboard.totalUsers || 0}`);
      console.log(`   Total orders: ${dashboard.totalOrders || 0}`);
    } else {
      const error = await dashboardResponse.json();
      console.log('   ❌ Admin dashboard not accessible');
      console.log(`   Error: ${JSON.stringify(error)}`);
    }
    
    // Step 6: Test session status
    console.log('\n6. Testing session status...');
    const sessionResponse = await fetch(`${BASE_URL}/api/auth/admin/check-session`, {
      method: 'GET',
      headers: {
        'Cookie': cookies,
        'X-CSRF-Token': csrfToken
      }
    });
    
    if (sessionResponse.ok) {
      const session = await sessionResponse.json();
      console.log('   ✓ Session is valid');
      console.log(`   Admin ID: ${session.adminId || 'unknown'}`);
      console.log(`   Email: ${session.email || 'unknown'}`);
    } else {
      const error = await sessionResponse.json();
      console.log('   ❌ Session check failed');
      console.log(`   Error: ${JSON.stringify(error)}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testAdminSession().catch(console.error);