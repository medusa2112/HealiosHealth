#!/usr/bin/env node
/**
 * Phase 8 Security Hardening Verification
 * Complete audit of dual authentication system
 */

import fetch from 'node-fetch';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const PROD_URL = process.env.PROD_URL || 'https://thehealios.com';

// Colors for console output
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

class SecurityAuditor {
  constructor() {
    this.results = [];
    this.passed = 0;
    this.failed = 0;
  }

  logResult(test, passed, details = '') {
    this.results.push({ test, passed, details });
    if (passed) {
      this.passed++;
      console.log(`${GREEN}✓ ${test}${RESET}`);
    } else {
      this.failed++;
      console.log(`${RED}✗ ${test}${RESET}`);
    }
    if (details) console.log(`  ${details}`);
  }

  async checkHealthEndpoint() {
    console.log(`\n${BLUE}1. Health Endpoint Verification${RESET}`);
    
    try {
      const response = await fetch(`${BASE_URL}/health/auth`);
      const data = await response.json();
      
      if (data.status === 'healthy') {
        this.logResult('Health endpoint accessible', true);
        
        // Check critical settings
        const checks = [
          { name: 'Legacy login disabled', condition: data.auth?.legacyLoginDisabled === true },
          { name: 'CSRF dev bypass disabled in prod', condition: data.auth?.csrfDevBypass !== true || data.nodeEnv !== 'production' },
          { name: 'Session secrets configured', condition: data.auth?.sessionsConfigured?.customer && data.auth?.sessionsConfigured?.admin },
        ];
        
        checks.forEach(check => {
          this.logResult(check.name, check.condition);
        });
        
        // Log environment
        console.log(`  Environment: ${data.nodeEnv}`);
        console.log(`  Cookie secure: ${data.auth?.cookieConfig?.secure}`);
        
      } else {
        this.logResult('Health endpoint healthy', false, data.issues?.join(', '));
      }
    } catch (error) {
      this.logResult('Health endpoint accessible', false, error.message);
    }
  }

  async verifyCookieAttributes() {
    console.log(`\n${BLUE}2. Cookie Attributes Verification${RESET}`);
    
    // Test customer login to check cookie attributes
    try {
      const csrfRes = await fetch(`${BASE_URL}/api/csrf`);
      const csrfData = await csrfRes.json();
      
      const loginRes = await fetch(`${BASE_URL}/api/auth/customer/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.csrfToken
        },
        body: JSON.stringify({
          email: 'test.customer@example.com',
          password: 'TestCustomer123!'
        })
      });
      
      const setCookie = loginRes.headers.raw()['set-cookie'];
      if (setCookie) {
        const customerCookie = setCookie.find(c => c.includes('hh_cust_sess'));
        if (customerCookie) {
          this.logResult('Customer cookie present', true);
          
          // Check attributes
          const hasPath = customerCookie.includes('Path=/');
          const hasSameSite = customerCookie.includes('SameSite=Lax') || customerCookie.includes('SameSite=lax');
          const hasHttpOnly = customerCookie.includes('HttpOnly');
          
          this.logResult('Customer cookie Path=/', hasPath);
          this.logResult('Customer cookie SameSite=Lax', hasSameSite);
          this.logResult('Customer cookie HttpOnly', hasHttpOnly);
          
          // Note: Secure flag only in production
          if (BASE_URL.includes('https')) {
            const hasSecure = customerCookie.includes('Secure');
            this.logResult('Customer cookie Secure (prod)', hasSecure);
          }
        }
      }
    } catch (error) {
      this.logResult('Cookie attributes verification', false, error.message);
    }
  }

  async testCrossAuthBlockade() {
    console.log(`\n${BLUE}3. Cross-Auth Blockade Test${RESET}`);
    
    try {
      // Get customer session
      const csrfRes = await fetch(`${BASE_URL}/api/csrf`);
      const csrfData = await csrfRes.json();
      
      const loginRes = await fetch(`${BASE_URL}/api/auth/customer/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.csrfToken
        },
        body: JSON.stringify({
          email: 'test.customer@example.com',
          password: 'TestCustomer123!'
        })
      });
      
      const cookies = loginRes.headers.raw()['set-cookie'];
      const customerCookie = cookies?.map(c => c.split(';')[0]).join('; ') || '';
      
      // Try to access admin endpoint with customer cookie
      const adminRes = await fetch(`${BASE_URL}/api/admin/products`, {
        headers: { 'Cookie': customerCookie }
      });
      
      this.logResult('Customer cookie blocked from admin endpoint', adminRes.status === 401);
      
      // Test the reverse (admin cookie on customer endpoint)
      const adminCsrfRes = await fetch(`${BASE_URL}/api/admin/csrf`);
      const adminCsrfData = await adminCsrfRes.json();
      
      const adminLoginRes = await fetch(`${BASE_URL}/api/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': adminCsrfData.csrfToken
        },
        body: JSON.stringify({
          email: 'dn@thefourths.com',
          password: process.env.ADM_PW || 'admin123'
        })
      });
      
      const adminCookies = adminLoginRes.headers.raw()['set-cookie'];
      const adminCookie = adminCookies?.map(c => c.split(';')[0]).join('; ') || '';
      
      // Try to access customer endpoint with admin cookie
      const customerRes = await fetch(`${BASE_URL}/api/orders`, {
        headers: { 'Cookie': adminCookie }
      });
      
      this.logResult('Admin cookie blocked from customer endpoint', customerRes.status === 401);
      
    } catch (error) {
      this.logResult('Cross-auth blockade', false, error.message);
    }
  }

  async testProductionDefaults() {
    console.log(`\n${BLUE}4. Production Configuration${RESET}`);
    
    const envChecks = [
      { 
        name: 'NODE_ENV set', 
        condition: process.env.NODE_ENV !== undefined,
        value: process.env.NODE_ENV 
      },
      { 
        name: 'ENABLE_LEGACY_LOGIN disabled', 
        condition: process.env.ENABLE_LEGACY_LOGIN !== 'true',
        value: process.env.ENABLE_LEGACY_LOGIN || 'not set'
      },
      { 
        name: 'CSRF_DEV_BYPASS not in prod', 
        condition: process.env.NODE_ENV !== 'production' || process.env.CSRF_DEV_BYPASS !== 'true',
        value: process.env.CSRF_DEV_BYPASS || 'not set'
      }
    ];
    
    envChecks.forEach(check => {
      this.logResult(check.name, check.condition, `Value: ${check.value}`);
    });
  }

  async testLegacyEndpoints() {
    console.log(`\n${BLUE}5. Legacy Endpoint Verification${RESET}`);
    
    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'test' })
      });
      
      const isDisabled = response.status === 404 || response.status === 501;
      this.logResult('Legacy /api/auth/login disabled', isDisabled, `Status: ${response.status}`);
      
    } catch (error) {
      this.logResult('Legacy endpoint check', false, error.message);
    }
  }

  async generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log(`${BLUE}PHASE 8 SECURITY AUDIT REPORT${RESET}`);
    console.log('='.repeat(60));
    
    console.log(`\n${GREEN}Passed: ${this.passed}${RESET}`);
    console.log(`${RED}Failed: ${this.failed}${RESET}`);
    
    const criticalPassed = this.results.filter(r => 
      r.test.includes('blocked from') || 
      r.test.includes('Legacy login disabled') ||
      r.test.includes('CSRF dev bypass')
    ).every(r => r.passed);
    
    if (criticalPassed) {
      console.log(`\n${GREEN}✅ CRITICAL SECURITY CHECKS PASSED${RESET}`);
      console.log('The dual authentication system is properly isolated.');
    } else {
      console.log(`\n${RED}⚠️  CRITICAL SECURITY ISSUES DETECTED${RESET}`);
      console.log('Review failed tests before deploying to production.');
    }
    
    // Production readiness checklist
    console.log(`\n${BLUE}Production Deployment Checklist:${RESET}`);
    const checklist = [
      'Set NODE_ENV=production in Replit and Ortho',
      'Configure SESSION_SECRET_CUSTOMER (32+ chars)',
      'Configure SESSION_SECRET_ADMIN (32+ chars)',
      'Set ENABLE_LEGACY_LOGIN=false',
      'Never set CSRF_DEV_BYPASS=true in production',
      'Configure PROD_ORIGINS for your domains',
      'Enable trust proxy for HTTPS cookie support',
      'Test with production URLs after deployment'
    ];
    
    checklist.forEach(item => console.log(`  ☐ ${item}`));
    
    // Save report to file
    const report = {
      timestamp: new Date().toISOString(),
      passed: this.passed,
      failed: this.failed,
      criticalPassed,
      results: this.results
    };
    
    await require('fs').promises.writeFile(
      'phase8-security-report.json',
      JSON.stringify(report, null, 2)
    );
    
    console.log('\nReport saved to phase8-security-report.json');
  }

  async run() {
    console.log('Starting Phase 8 Security Audit...\n');
    
    await this.checkHealthEndpoint();
    await this.verifyCookieAttributes();
    await this.testCrossAuthBlockade();
    await this.testProductionDefaults();
    await this.testLegacyEndpoints();
    await this.generateReport();
  }
}

// Run the audit
const auditor = new SecurityAuditor();
auditor.run().catch(console.error);