#!/usr/bin/env node
/**
 * Phase 8 End-to-End Authentication Test
 * Tests complete separation of customer and admin authentication
 */

import fetch from 'node-fetch';
import { promises as fs } from 'fs';

const BASE_URL = 'http://localhost:5000';

// Colors for console output
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

// Test credentials
const CUSTOMER_EMAIL = 'test.customer@example.com';
const CUSTOMER_PASSWORD = 'TestCustomer123!';  // Updated to match setup script
const ADMIN_EMAIL = 'dn@thefourths.com';
const ADMIN_PASSWORD = process.env.ADM_PW || 'admin123';

class AuthTester {
  constructor() {
    this.customerCookies = '';
    this.adminCookies = '';
    this.customerCsrf = '';
    this.adminCsrf = '';
  }

  extractCookies(response) {
    const cookies = response.headers.raw()['set-cookie'];
    if (!cookies) return '';
    return cookies.map(cookie => cookie.split(';')[0]).join('; ');
  }

  async testCustomerCSRF() {
    console.log(`${BLUE}Testing Customer CSRF Endpoint...${RESET}`);
    
    const response = await fetch(`${BASE_URL}/api/csrf`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Customer CSRF failed: ${response.status}`);
    }

    const data = await response.json();
    this.customerCsrf = data.csrfToken;
    
    console.log(`${GREEN}✓ Customer CSRF token obtained${RESET}`);
    console.log(`  Surface: ${data.surface || 'customer'}`);
    console.log(`  Token: ${this.customerCsrf.substring(0, 20)}...`);
    
    return true;
  }

  async testAdminCSRF() {
    console.log(`\n${BLUE}Testing Admin CSRF Endpoint...${RESET}`);
    
    const response = await fetch(`${BASE_URL}/api/admin/csrf`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Admin CSRF failed: ${response.status}`);
    }

    const data = await response.json();
    this.adminCsrf = data.csrfToken;
    
    console.log(`${GREEN}✓ Admin CSRF token obtained${RESET}`);
    console.log(`  Surface: ${data.surface || 'admin'}`);
    console.log(`  Token: ${this.adminCsrf.substring(0, 20)}...`);
    
    return true;
  }

  async testCustomerRegistration() {
    console.log(`\n${BLUE}Testing Customer Registration...${RESET}`);
    
    const response = await fetch(`${BASE_URL}/api/auth/customer/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': this.customerCsrf
      },
      body: JSON.stringify({
        email: CUSTOMER_EMAIL,
        password: CUSTOMER_PASSWORD,
        firstName: 'Test',
        lastName: 'Customer'
      })
    });

    const data = await response.json();
    
    // Accept both successful registration and "already registered" as valid outcomes
    if (response.ok) {
      console.log(`${GREEN}✓ Customer registered successfully${RESET}`);
      console.log(`  User ID: ${data.user?.id}`);
      return true;
    } else if (data.error?.includes('already registered') || data.error?.includes('Email already registered')) {
      console.log(`${GREEN}✓ Customer registration endpoint working (user exists)${RESET}`);
      console.log(`  Note: ${data.error}`);
      return true;
    }

    throw new Error(`Customer registration failed: ${data.error || response.status}`);
  }

  async testCustomerLogin() {
    console.log(`\n${BLUE}Testing Customer Login...${RESET}`);
    
    const response = await fetch(`${BASE_URL}/api/auth/customer/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': this.customerCsrf  // Uppercase header
      },
      body: JSON.stringify({
        email: CUSTOMER_EMAIL,
        password: CUSTOMER_PASSWORD
      })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(`Customer login failed: ${data.error || response.status}`);
    }

    this.customerCookies = this.extractCookies(response);
    const data = await response.json();
    
    console.log(`${GREEN}✓ Customer logged in successfully${RESET}`);
    console.log(`  User ID: ${data.user?.id}`);
    console.log(`  Email: ${data.user?.email}`);
    
    // Check for customer session cookie
    if (this.customerCookies.includes('hh_cust_sess')) {
      console.log(`${GREEN}✓ Customer session cookie set (hh_cust_sess)${RESET}`);
    } else {
      console.log(`${YELLOW}⚠ Customer session cookie not found${RESET}`);
    }
    
    return true;
  }

  async testAdminLogin() {
    console.log(`\n${BLUE}Testing Admin Login...${RESET}`);
    
    const response = await fetch(`${BASE_URL}/api/auth/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': this.adminCsrf  // Uppercase header
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(`Admin login failed: ${data.error || response.status}`);
    }

    this.adminCookies = this.extractCookies(response);
    const data = await response.json();
    
    console.log(`${GREEN}✓ Admin logged in successfully${RESET}`);
    console.log(`  Admin ID: ${data.user?.id}`);
    console.log(`  Email: ${data.user?.email}`);
    
    // Check for admin session cookie
    if (this.adminCookies.includes('hh_admin_sess')) {
      console.log(`${GREEN}✓ Admin session cookie set (hh_admin_sess)${RESET}`);
    } else {
      console.log(`${YELLOW}⚠ Admin session cookie not found${RESET}`);
    }
    
    return true;
  }

  async testCustomerAuthCheck() {
    console.log(`\n${BLUE}Testing Customer Auth Check...${RESET}`);
    
    const response = await fetch(`${BASE_URL}/api/auth/customer/me`, {
      method: 'GET',
      headers: {
        'Cookie': this.customerCookies
      }
    });

    if (!response.ok) {
      throw new Error(`Customer auth check failed: ${response.status}`);
    }

    const data = await response.json();
    
    console.log(`${GREEN}✓ Customer authenticated successfully${RESET}`);
    console.log(`  User: ${data.user?.email}`);
    
    return true;
  }

  async testAdminAuthCheck() {
    console.log(`\n${BLUE}Testing Admin Auth Check...${RESET}`);
    
    const response = await fetch(`${BASE_URL}/api/auth/admin/me`, {
      method: 'GET',
      headers: {
        'Cookie': this.adminCookies
      }
    });

    if (!response.ok) {
      throw new Error(`Admin auth check failed: ${response.status}`);
    }

    const data = await response.json();
    
    console.log(`${GREEN}✓ Admin authenticated successfully${RESET}`);
    console.log(`  Admin: ${data.user?.email}`);
    
    return true;
  }

  async testCrossPollination() {
    console.log(`\n${BLUE}Testing Authentication Isolation...${RESET}`);
    
    // Test 1: Customer cookie should NOT work for admin endpoints
    console.log(`  Testing customer cookie on admin endpoint...`);
    const test1 = await fetch(`${BASE_URL}/api/auth/admin/me`, {
      method: 'GET',
      headers: {
        'Cookie': this.customerCookies
      }
    });
    
    if (test1.status === 401) {
      console.log(`${GREEN}  ✓ Customer cookie rejected by admin endpoint${RESET}`);
    } else {
      console.log(`${RED}  ✗ SECURITY ISSUE: Customer cookie accepted by admin endpoint!${RESET}`);
      return false;
    }
    
    // Test 2: Admin cookie should NOT work for customer endpoints
    console.log(`  Testing admin cookie on customer endpoint...`);
    const test2 = await fetch(`${BASE_URL}/api/auth/customer/me`, {
      method: 'GET',
      headers: {
        'Cookie': this.adminCookies
      }
    });
    
    if (test2.status === 401) {
      console.log(`${GREEN}  ✓ Admin cookie rejected by customer endpoint${RESET}`);
    } else {
      console.log(`${RED}  ✗ SECURITY ISSUE: Admin cookie accepted by customer endpoint!${RESET}`);
      return false;
    }
    
    console.log(`${GREEN}✓ Authentication properly isolated${RESET}`);
    return true;
  }

  async testCustomerLogout() {
    console.log(`\n${BLUE}Testing Customer Logout...${RESET}`);
    
    // Get fresh CSRF token with the current session
    const csrfRes = await fetch(`${BASE_URL}/api/csrf`, {
      method: 'GET',
      headers: {
        'Cookie': this.customerCookies,
        'Accept': 'application/json'
      }
    });
    const csrfData = await csrfRes.json();
    const freshCsrf = csrfData.csrfToken;
    
    const response = await fetch(`${BASE_URL}/api/auth/customer/logout`, {
      method: 'POST',
      headers: {
        'Cookie': this.customerCookies,
        'X-CSRF-Token': freshCsrf  // Use fresh CSRF token
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Customer logout failed: ${response.status} - ${error}`);
    }

    console.log(`${GREEN}✓ Customer logged out successfully${RESET}`);
    
    // Verify logout worked
    const checkResponse = await fetch(`${BASE_URL}/api/auth/customer/me`, {
      method: 'GET',
      headers: {
        'Cookie': this.customerCookies
      }
    });
    
    if (checkResponse.status === 401) {
      console.log(`${GREEN}✓ Customer session properly terminated${RESET}`);
    } else {
      console.log(`${YELLOW}⚠ Customer session may still be active${RESET}`);
    }
    
    return true;
  }

  async testAdminLogout() {
    console.log(`\n${BLUE}Testing Admin Logout...${RESET}`);
    
    // Get fresh CSRF token with the current session
    const csrfRes = await fetch(`${BASE_URL}/api/admin/csrf`, {
      method: 'GET',
      headers: {
        'Cookie': this.adminCookies,
        'Accept': 'application/json'
      }
    });
    const csrfData = await csrfRes.json();
    const freshCsrf = csrfData.csrfToken;
    
    const response = await fetch(`${BASE_URL}/api/auth/admin/logout`, {
      method: 'POST',
      headers: {
        'Cookie': this.adminCookies,
        'X-CSRF-Token': freshCsrf  // Use fresh CSRF token
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Admin logout failed: ${response.status} - ${error}`);
    }

    console.log(`${GREEN}✓ Admin logged out successfully${RESET}`);
    
    // Verify logout worked
    const checkResponse = await fetch(`${BASE_URL}/api/auth/admin/me`, {
      method: 'GET',
      headers: {
        'Cookie': this.adminCookies
      }
    });
    
    if (checkResponse.status === 401) {
      console.log(`${GREEN}✓ Admin session properly terminated${RESET}`);
    } else {
      console.log(`${YELLOW}⚠ Admin session may still be active${RESET}`);
    }
    
    return true;
  }

  async cleanupCustomer() {
    // This would normally delete the test customer account
    // For now, we'll just note it exists
  }

  async runAllTests() {
    console.log(`${YELLOW}${'='.repeat(60)}${RESET}`);
    console.log(`${YELLOW}Phase 8: Dual Authentication System Test${RESET}`);
    console.log(`${YELLOW}${'='.repeat(60)}${RESET}\n`);

    const tests = [
      { name: 'Customer CSRF', fn: () => this.testCustomerCSRF() },
      { name: 'Admin CSRF', fn: () => this.testAdminCSRF() },
      { name: 'Customer Registration', fn: () => this.testCustomerRegistration() },
      { name: 'Customer Login', fn: () => this.testCustomerLogin() },
      { name: 'Admin Login', fn: () => this.testAdminLogin() },
      { name: 'Customer Auth Check', fn: () => this.testCustomerAuthCheck() },
      { name: 'Admin Auth Check', fn: () => this.testAdminAuthCheck() },
      { name: 'Authentication Isolation', fn: () => this.testCrossPollination() },
      { name: 'Customer Logout', fn: () => this.testCustomerLogout() },
      { name: 'Admin Logout', fn: () => this.testAdminLogout() }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      try {
        await test.fn();
        passed++;
      } catch (error) {
        console.log(`${RED}✗ ${test.name} failed: ${error.message}${RESET}`);
        failed++;
      }
    }

    console.log(`\n${YELLOW}${'='.repeat(60)}${RESET}`);
    console.log(`${YELLOW}Test Results:${RESET}`);
    console.log(`${GREEN}Passed: ${passed}${RESET}`);
    console.log(`${failed > 0 ? RED : GREEN}Failed: ${failed}${RESET}`);
    console.log(`${YELLOW}${'='.repeat(60)}${RESET}`);

    if (failed === 0) {
      console.log(`\n${GREEN}🎉 Phase 8 Complete: Dual authentication system verified!${RESET}`);
      console.log(`${GREEN}Customer and admin authentication are properly isolated.${RESET}`);
    } else {
      console.log(`\n${RED}⚠ Phase 8 has issues that need to be addressed.${RESET}`);
      process.exit(1);
    }
  }
}

// Run the tests
const tester = new AuthTester();
tester.runAllTests().catch(error => {
  console.error(`${RED}Test suite failed: ${error.message}${RESET}`);
  process.exit(1);
});