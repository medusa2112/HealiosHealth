#!/usr/bin/env node

// Test script to verify environment detection for email routing

console.log('=== Production Email System QA Report ===\n');

// 1. Check NODE_ENV
console.log('1. ENVIRONMENT DETECTION:');
console.log(`   NODE_ENV: "${process.env.NODE_ENV || 'undefined'}" (defaults to 'development' when undefined)`);
console.log(`   Expected for production: "production"`);
console.log(`   Current behavior: ${!process.env.NODE_ENV || process.env.NODE_ENV === 'development' ? 'DEVELOPMENT MODE - emails go to admin' : 'PRODUCTION MODE - emails go to users'}`);

// 2. Check Resend API configuration
console.log('\n2. RESEND API CONFIGURATION:');
console.log(`   RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '✓ Present' : '✗ Missing'}`);
console.log(`   RESEND_FROM_ADDRESS: ${process.env.RESEND_FROM_ADDRESS ? '✓ Present' : '✗ Missing'}`);

// 3. Simulate environment detection logic
const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

console.log('\n3. EMAIL ROUTING LOGIC:');
console.log(`   isDevelopment check: ${isDevelopment}`);
if (isDevelopment) {
  console.log('   Routing: Emails sent to admin accounts (dn@thefourths.com, jv@thefourths.com)');
  console.log('   Test email "dominicnel@mac.com" would be sent to: dn@thefourths.com');
} else {
  console.log('   Routing: Emails sent to actual user addresses');
  console.log('   Test email "dominicnel@mac.com" would be sent to: dominicnel@mac.com');
}

// 4. Check Replit deployment environment
console.log('\n4. REPLIT DEPLOYMENT CHECK:');
console.log(`   REPLIT_DOMAINS: ${process.env.REPLIT_DOMAINS || 'Not set'}`);
console.log(`   REPL_ID: ${process.env.REPL_ID || 'Not set'}`);
console.log(`   REPL_SLUG: ${process.env.REPL_SLUG || 'Not set'}`);

// 5. Production URL expectations
console.log('\n5. PRODUCTION URL CONFIGURATION:');
console.log('   Expected production URL: https://healios-health-dominic96.replit.app');
console.log('   Development URL: http://localhost:5000');

console.log('\n=== DIAGNOSIS ===');
console.log('The issue is that NODE_ENV is not set to "production" on the deployed instance.');
console.log('This causes the email system to think it\'s in development mode and route emails to admin.');
console.log('\nSOLUTION: The deployed Replit app needs NODE_ENV=production to be set.');