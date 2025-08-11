#!/usr/bin/env node

/**
 * Test script to verify admin login functionality
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testAdminLogin() {
  console.log('🔐 Testing Admin Login System\n');
  
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
    const csrfToken = csrfData.token;
    console.log('   ✓ CSRF token obtained\n');
    
    // Step 2: Test login with admin credentials
    console.log('2. Testing admin login...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({
        email: 'dn@thefourths.com',
        password: process.env.ADM_PW || 'test-password'
      }),
      credentials: 'include'
    });
    
    const loginResult = await loginResponse.json();
    
    if (loginResponse.ok) {
      console.log('   ✓ Admin login successful');
      console.log(`   User: ${loginResult.user?.email}`);
      console.log(`   Role: ${loginResult.user?.role}\n`);
      
      // Extract cookies for authenticated requests
      const cookies = loginResponse.headers.raw()['set-cookie'];
      const cookieString = cookies ? cookies.join('; ') : '';
      
      // Step 3: Test authenticated access to admin dashboard
      console.log('3. Testing authenticated access to admin dashboard...');
      const dashboardResponse = await fetch(`${BASE_URL}/api/admin`, {
        method: 'GET',
        headers: {
          'Cookie': cookieString,
          'X-CSRF-Token': csrfToken
        }
      });
      
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        console.log('   ✓ Admin dashboard accessible');
        console.log(`   Total users: ${dashboardData.totalUsers || 0}`);
        console.log(`   Total orders: ${dashboardData.totalOrders || 0}\n`);
      } else {
        console.log('   ❌ Admin dashboard not accessible');
        const error = await dashboardResponse.json();
        console.log(`   Error: ${JSON.stringify(error)}\n`);
      }
      
      // Step 4: Test access to admin products
      console.log('4. Testing access to admin products...');
      const productsResponse = await fetch(`${BASE_URL}/api/admin/products`, {
        method: 'GET',
        headers: {
          'Cookie': cookieString,
          'X-CSRF-Token': csrfToken
        }
      });
      
      if (productsResponse.ok) {
        const products = await productsResponse.json();
        console.log('   ✓ Admin products accessible');
        console.log(`   Total products: ${products.length}`);
        if (products.length > 0) {
          console.log(`   First product: ${products[0].name} (${products[0].id})`);
        }
      } else {
        console.log('   ❌ Admin products not accessible');
        const error = await productsResponse.json();
        console.log(`   Error: ${JSON.stringify(error)}`);
      }
      
    } else {
      console.log('   ❌ Admin login failed');
      console.log(`   Status: ${loginResponse.status}`);
      console.log(`   Error: ${JSON.stringify(loginResult)}`);
      
      if (!process.env.ADM_PW) {
        console.log('\n   ⚠️  ADM_PW environment variable not set');
        console.log('   Please set ADM_PW to the admin password and try again');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testAdminLogin().catch(console.error);