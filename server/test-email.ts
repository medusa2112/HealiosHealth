#!/usr/bin/env tsx

/**
 * Email Service Test Script
 * Tests Resend API configuration and email delivery functionality
 */

import { Resend } from 'resend';
import { sendVerificationEmail } from './lib/verification';
import { EmailService } from './email';
import type { Newsletter } from '@shared/schema';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

async function testResendConfig() {
  console.log('\n🔧 Testing Resend Configuration...');
  
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY environment variable not found');
    return false;
  }
  
  console.log('✅ RESEND_API_KEY found:', apiKey.substring(0, 8) + '...');
  
  try {
    const resend = new Resend(apiKey);
    console.log('✅ Resend instance created successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to create Resend instance:', error);
    return false;
  }
}

async function testBasicEmailSending() {
  console.log('\n📧 Testing Basic Email Sending...');
  
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('❌ No API key available');
    return false;
  }
  
  const resend = new Resend(apiKey);
  
  try {
    const result = await resend.emails.send({
      from: 'Healios Test <dn@thefourths.com>',
      to: ['dn@thefourths.com'], // Send to admin email for testing
      subject: 'Healios Email Service Test',
      html: `
        <h1>Email Service Test</h1>
        <p>This is a test email to verify the Resend integration is working.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `,
    });
    
    console.log('✅ Test email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('❌ Failed to send test email:', error);
    return false;
  }
}

async function testVerificationEmail() {
  console.log('\n🔐 Testing Verification Email...');
  
  try {
    await sendVerificationEmail(
      'dn@thefourths.com', // Send to admin for testing
      '123456',
      'Test User',
      'verification'
    );
    console.log('✅ Verification email sent successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
    return false;
  }
}

async function testNewsletterEmail() {
  console.log('\n📰 Testing Newsletter Email...');
  
  const testNewsletter: Newsletter = {
    id: 'test-newsletter',
    firstName: 'Test',
    lastName: 'User', 
    email: 'dn@thefourths.com', // Send to admin for testing
    interests: ['wellness'],
    createdAt: new Date().toISOString()
  };
  
  try {
    const result = await EmailService.sendNewsletterConfirmation(testNewsletter);
    console.log(result ? '✅ Newsletter email sent successfully' : '❌ Newsletter email failed');
    return result;
  } catch (error) {
    console.error('❌ Failed to send newsletter email:', error);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Healios Email Service Tests...\n');
  
  const tests = [
    { name: 'Resend Configuration', test: testResendConfig },
    { name: 'Basic Email Sending', test: testBasicEmailSending },
    { name: 'Verification Email', test: testVerificationEmail },
    { name: 'Newsletter Email', test: testNewsletterEmail },
  ];
  
  let passedTests = 0;
  const totalTests = tests.length;
  
  for (const { name, test } of tests) {
    console.log(`\n📋 Running Test: ${name}`);
    try {
      const result = await test();
      if (result) {
        passedTests++;
        console.log(`✅ ${name} - PASSED`);
      } else {
        console.log(`❌ ${name} - FAILED`);
      }
    } catch (error) {
      console.error(`❌ ${name} - ERROR:`, error);
    }
  }
  
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All email tests passed! Email service is working correctly.');
  } else {
    console.log('\n⚠️  Some email tests failed. Check the errors above.');
  }
}

// Run tests if called directly (ES module compatible)
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export { runAllTests, testResendConfig, testBasicEmailSending };