#!/usr/bin/env node
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const baseUrl = 'http://localhost:5000';

async function testLogin(email, password) {
  console.log(`\nTesting login for: ${email}`);
  
  try {
    // Test login
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });

    const loginData = await loginResponse.json();
    
    if (loginResponse.ok) {
      console.log('✓ Login successful!');
      console.log('  User data:', JSON.stringify(loginData, null, 2));
      
      // Extract cookies
      const cookies = loginResponse.headers.raw()['set-cookie'];
      if (cookies) {
        console.log('  Session cookies received');
      }
      
      // Test authenticated access
      const meResponse = await fetch(`${baseUrl}/api/auth/me`, {
        headers: {
          'Cookie': cookies ? cookies.join('; ') : ''
        }
      });
      
      if (meResponse.ok) {
        const meData = await meResponse.json();
        console.log('✓ Authenticated access verified');
        console.log('  User role:', meData.role);
      } else {
        console.log('✗ Failed to verify authenticated access');
      }
      
      return true;
    } else {
      console.log('✗ Login failed:', loginData.error || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error('✗ Error during login test:', error.message);
    return false;
  }
}

async function testCustomerLogin() {
  // Test customer login with test account
  console.log('\n=== Testing Customer Login ===');
  await testLogin('test@example.com', 'password123');
}

async function testAdminLogin() {
  // Get admin password from environment
  const adminPassword = process.env.ADM_PW;
  
  if (!adminPassword) {
    console.log('\n⚠️ ADM_PW environment variable not set. Skipping admin login test.');
    return;
  }
  
  console.log('\n=== Testing Admin Login ===');
  
  // Test primary admin
  await testLogin('dn@thefourths.com', adminPassword);
  
  // Test backup admin
  await testLogin('admin@healios.com', adminPassword);
}

async function main() {
  console.log('Starting login tests...\n');
  console.log(`Testing against: ${baseUrl}`);
  
  // Test customer login
  await testCustomerLogin();
  
  // Test admin login
  await testAdminLogin();
  
  console.log('\n✓ Login tests completed');
}

main().catch(console.error);