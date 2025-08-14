#!/usr/bin/env node

import { Resend } from 'resend';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('=== Production Email System Diagnostic ===\n');

// Check environment variables
console.log('Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
console.log('RESEND_FROM_ADDRESS exists:', !!process.env.RESEND_FROM_ADDRESS);
console.log('RESEND_FROM_ADDRESS value:', process.env.RESEND_FROM_ADDRESS);

if (!process.env.RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY is missing');
  process.exit(1);
}

if (!process.env.RESEND_FROM_ADDRESS) {
  console.error('❌ RESEND_FROM_ADDRESS is missing');
  process.exit(1);
}

const resend = new Resend(process.env.RESEND_API_KEY);

async function testProductionEmail() {
  try {
    console.log('\n=== Testing Production Email Delivery ===');
    
    // Test 1: Simple test email
    console.log('\n1. Testing basic email delivery...');
    const testResult = await resend.emails.send({
      from: `Healios <${process.env.RESEND_FROM_ADDRESS}>`,
      to: ['dn@thefourths.com'], // Verified email
      subject: 'Production Email Test - ' + new Date().toISOString(),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>Production Email Test</h1>
          <p>This is a test email to verify production email functionality.</p>
          <p><strong>Test Time:</strong> ${new Date().toISOString()}</p>
          <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'unknown'}</p>
          <p><strong>From Address:</strong> ${process.env.RESEND_FROM_ADDRESS}</p>
        </div>
      `,
    });

    console.log('Test result:', JSON.stringify(testResult, null, 2));

    if (testResult.error) {
      console.error('❌ Basic email test failed:', testResult.error);
      return false;
    }
    
    console.log('✅ Basic email test successful - ID:', testResult.data?.id);

    // Test 2: PIN authentication email format
    console.log('\n2. Testing PIN authentication email format...');
    const pinResult = await resend.emails.send({
      from: `Healios <${process.env.RESEND_FROM_ADDRESS}>`,
      to: ['dn@thefourths.com'],
      subject: 'Your Healios Login PIN - Production Test',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Healios Login PIN</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; background-color: #f8f9fa;">
          <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, hsl(280, 100%, 35%), hsl(320, 100%, 50%)); padding: 48px 40px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">Healios</h1>
              <p style="margin: 12px 0 0 0; color: #ffffff; font-size: 16px;">Your secure login PIN</p>
            </div>
            
            <div style="padding: 48px 40px;">
              <h2 style="margin: 0 0 24px 0; color: #000000; font-size: 28px; font-weight: 600;">Welcome back!</h2>
              <p style="font-size: 18px; color: #000000; margin: 0 0 40px 0;">Use this PIN to complete your sign-in to Healios.</p>
              
              <div style="background: linear-gradient(135deg, hsl(160, 100%, 35%), hsl(30, 25%, 65%)); padding: 3px; border-radius: 12px; margin: 0 0 40px 0;">
                <div style="background-color: #ffffff; padding: 40px 20px; text-align: center; border-radius: 9px;">
                  <div style="font-size: 48px; font-weight: 700; letter-spacing: 12px; color: #000000; font-family: monospace;">123456</div>
                  <div style="font-size: 16px; color: hsl(280, 100%, 35%); font-weight: 500; margin-top: 16px;">Expires in 5 minutes</div>
                </div>
              </div>
              
              <p style="font-size: 16px; color: #666666; text-align: center; margin: 0;">Need help? Reply to this email and we'll assist you.</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 32px 40px; text-align: center; border-top: 1px solid #e5e5e5; border-radius: 0 0 12px 12px;">
              <p style="margin: 0; color: #666666; font-size: 14px;">This is an automated security message from Healios.</p>
              <p style="margin: 8px 0 0 0; color: #999999; font-size: 12px;">© ${new Date().getFullYear()} Healios - Premium wellness supplements</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (pinResult.error) {
      console.error('❌ PIN email test failed:', pinResult.error);
      return false;
    }
    
    console.log('✅ PIN email test successful - ID:', pinResult.data?.id);

    // Test 3: Check account status
    console.log('\n3. Checking Resend account status...');
    try {
      const domains = await resend.domains.list();
      console.log('Domain status:', JSON.stringify(domains, null, 2));
    } catch (error) {
      console.warn('Could not fetch domain status:', error.message);
    }

    return true;

  } catch (error) {
    console.error('❌ Production email test failed with error:', error);
    
    if (error.message?.includes('403')) {
      console.error('🔒 This appears to be a permissions issue. The API key might:');
      console.error('   - Be for a sandbox/testing account');
      console.error('   - Not have permission to send emails');
      console.error('   - Be expired or invalid');
    }
    
    if (error.message?.includes('422')) {
      console.error('📧 This appears to be a validation issue:');
      console.error('   - From address might not be verified');
      console.error('   - Domain might not be verified');
      console.error('   - Email format might be invalid');
    }

    return false;
  }
}

testProductionEmail()
  .then(success => {
    if (success) {
      console.log('\n✅ Production email system is working correctly!');
      console.log('Check your inbox at dn@thefourths.com for test emails.');
    } else {
      console.log('\n❌ Production email system has issues that need to be addressed.');
    }
  })
  .catch(error => {
    console.error('\n💥 Unexpected error during testing:', error);
  });