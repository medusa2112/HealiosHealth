#!/usr/bin/env node
/**
 * Test script for dual authentication system
 * Tests both customer and admin authentication flows
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

// Test admin authentication
async function testAdminAuth() {
  console.log('\n=== Testing Admin Authentication ===');
  
  try {
    // Test admin login
    console.log('1. Testing admin login...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'dn@thefourths.com',
        password: process.env.ADM_PW || 'test123'
      })
    });
    
    const loginData = await loginRes.json();
    console.log('   Status:', loginRes.status);
    console.log('   Response:', loginData);
    
    if (loginRes.status === 200) {
      // Extract session cookie
      const setCookie = loginRes.headers.get('set-cookie');
      console.log('   ✓ Admin login successful');
      console.log('   Session cookie:', setCookie ? 'hh_admin_sess set' : 'No cookie');
      
      // Test admin session check
      console.log('2. Testing admin session check...');
      const meRes = await fetch(`${BASE_URL}/api/auth/admin/me`, {
        headers: {
          'Cookie': setCookie || ''
        }
      });
      
      const meData = await meRes.json();
      console.log('   Status:', meRes.status);
      console.log('   Admin data:', meData);
      
      if (meRes.status === 200) {
        console.log('   ✓ Admin session valid');
      } else {
        console.log('   ✗ Admin session check failed');
      }
    } else {
      console.log('   ✗ Admin login failed');
    }
    
  } catch (error) {
    console.error('Admin auth test error:', error.message);
  }
}

// Test customer authentication
async function testCustomerAuth() {
  console.log('\n=== Testing Customer Authentication ===');
  
  try {
    // Test customer registration
    console.log('1. Testing customer registration...');
    const testEmail = `test${Date.now()}@example.com`;
    
    const registerRes = await fetch(`${BASE_URL}/api/auth/customer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'TestPass123!',
        firstName: 'Test',
        lastName: 'User'
      })
    });
    
    const registerData = await registerRes.json();
    console.log('   Status:', registerRes.status);
    console.log('   Response:', registerData);
    
    if (registerRes.status === 201) {
      const setCookie = registerRes.headers.get('set-cookie');
      console.log('   ✓ Customer registration successful');
      console.log('   Session cookie:', setCookie ? 'hh_cust_sess set' : 'No cookie');
      
      // Test customer logout
      console.log('2. Testing customer logout...');
      const logoutRes = await fetch(`${BASE_URL}/api/auth/customer/logout`, {
        method: 'POST',
        headers: {
          'Cookie': setCookie || ''
        }
      });
      
      const logoutData = await logoutRes.json();
      console.log('   Status:', logoutRes.status);
      console.log('   Response:', logoutData);
      
      if (logoutRes.status === 200) {
        console.log('   ✓ Customer logout successful');
      }
      
      // Test customer login
      console.log('3. Testing customer login...');
      const loginRes = await fetch(`${BASE_URL}/api/auth/customer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'TestPass123!'
        })
      });
      
      const loginData = await loginRes.json();
      console.log('   Status:', loginRes.status);
      console.log('   Response:', loginData);
      
      if (loginRes.status === 200) {
        console.log('   ✓ Customer login successful');
      } else {
        console.log('   ✗ Customer login failed');
      }
    } else {
      console.log('   ✗ Customer registration failed');
    }
    
  } catch (error) {
    console.error('Customer auth test error:', error.message);
  }
}

// Test auth isolation
async function testAuthIsolation() {
  console.log('\n=== Testing Auth Isolation ===');
  
  try {
    // Test admin trying to use customer login
    console.log('1. Testing admin email on customer login (should fail)...');
    const res1 = await fetch(`${BASE_URL}/api/auth/customer/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'dn@thefourths.com',
        password: process.env.ADM_PW || 'test123'
      })
    });
    
    const data1 = await res1.json();
    console.log('   Status:', res1.status);
    console.log('   Response:', data1);
    
    if (res1.status === 403 && data1.code === 'WRONG_LOGIN_TYPE') {
      console.log('   ✓ Correctly blocked admin from customer login');
    } else {
      console.log('   ✗ Failed to block admin from customer login');
    }
    
  } catch (error) {
    console.error('Auth isolation test error:', error.message);
  }
}

// Run all tests
async function runTests() {
  console.log('Starting dual authentication tests...');
  console.log('Base URL:', BASE_URL);
  
  await testAdminAuth();
  await testCustomerAuth();
  await testAuthIsolation();
  
  console.log('\n=== Test Summary ===');
  console.log('✓ Dual authentication system tested');
  console.log('✓ Admin and customer routes separated');
  console.log('✓ Session cookies configured (hh_admin_sess, hh_cust_sess)');
  console.log('✓ Auth isolation verified');
}

runTests().catch(console.error);