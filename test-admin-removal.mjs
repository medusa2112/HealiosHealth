#!/usr/bin/env node

/**
 * Test script to verify admin removal functionality
 * This script tests that admin routes are properly blocked when ADMIN_ENABLED=false
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

// Test configurations
const tests = [
  {
    name: 'Admin Login Page',
    url: '/admin/login',
    expectedStatus: 404,
    description: 'Should return 404 when admin is disabled'
  },
  {
    name: 'Admin API - Dashboard',
    url: '/api/admin',
    expectedStatus: 404,
    description: 'Should return 404 when admin is disabled'
  },
  {
    name: 'Admin API - Products',
    url: '/api/admin/products',
    expectedStatus: 404,
    description: 'Should return 404 when admin is disabled'
  },
  {
    name: 'Admin Auth - Login',
    url: '/api/auth/admin/login',
    expectedStatus: 404,
    description: 'Should return 404 when admin is disabled'
  },
  {
    name: 'Admin Auth - Me',
    url: '/api/auth/admin/me',
    expectedStatus: 404,
    description: 'Should return 404 when admin is disabled'
  },
  {
    name: 'Admin Publish',
    url: '/api/admin/publish',
    expectedStatus: 404,
    description: 'Should return 404 when admin is disabled'
  },
  {
    name: 'Customer Routes - Should Work',
    url: '/api/products',
    expectedStatus: 200,
    description: 'Customer routes should still work'
  }
];

async function runTests() {
  console.log('🧪 Testing Admin Removal Functionality');
  console.log('=====================================\n');
  
  // Check current environment
  const adminEnabled = process.env.ADMIN_ENABLED;
  console.log(`Current ADMIN_ENABLED: ${adminEnabled || 'not set (defaults to true in dev)'}\n`);
  
  if (adminEnabled !== 'false') {
    console.log('⚠️  WARNING: ADMIN_ENABLED is not set to false.');
    console.log('   To properly test admin removal, set ADMIN_ENABLED=false\n');
  }
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const response = await fetch(`${BASE_URL}${test.url}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const actualStatus = response.status;
      const success = actualStatus === test.expectedStatus;
      
      if (success) {
        console.log(`✅ ${test.name}`);
        console.log(`   ${test.description}`);
        console.log(`   Expected: ${test.expectedStatus}, Got: ${actualStatus}\n`);
        passed++;
      } else {
        console.log(`❌ ${test.name}`);
        console.log(`   ${test.description}`);
        console.log(`   Expected: ${test.expectedStatus}, Got: ${actualStatus}`);
        
        // If we got content, show a preview
        if (actualStatus === 200) {
          const text = await response.text();
          const preview = text.substring(0, 100);
          console.log(`   Response preview: ${preview}...\n`);
        } else {
          const json = await response.json().catch(() => null);
          if (json) {
            console.log(`   Response: ${JSON.stringify(json)}\n`);
          }
        }
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}`);
      console.log(`   Error: ${error.message}\n`);
      failed++;
    }
  }
  
  // Summary
  console.log('\n=====================================');
  console.log('📊 Test Summary');
  console.log(`   Passed: ${passed}/${tests.length}`);
  console.log(`   Failed: ${failed}/${tests.length}`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed!');
    if (adminEnabled === 'false') {
      console.log('   Admin routes are properly blocked in production mode.');
    }
  } else {
    console.log('\n⚠️  Some tests failed.');
    if (adminEnabled !== 'false') {
      console.log('   This is expected if ADMIN_ENABLED is not set to false.');
      console.log('   To test production behavior, run: ADMIN_ENABLED=false npm run dev');
    }
  }
  
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(console.error);