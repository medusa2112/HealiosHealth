#!/usr/bin/env node

/**
 * Test script to send a test email using the existing Resend configuration
 */

import { Resend } from 'resend';

// Direct Resend test
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendTestEmail() {
  try {
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'dn@thefourths.com',
      subject: '🔐 Test Admin Login Alert - Healios',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Test Admin Login Notification - Healios</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; background-color: #ffffff; color: #000;">
          <div style="max-width: 600px; margin: 0 auto;">
            <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 30px;">
              TEST SECURITY NOTIFICATION
            </div>
            
            <h1 style="font-size: 32px; font-weight: 400; line-height: 1.2; margin: 0 0 30px 0; color: #000;">
              Test Email - Admin Login System
            </h1>
            
            <p style="font-size: 16px; line-height: 1.6; color: #666; margin: 0 0 40px 0;">
              This is a test email to verify the admin login notification system is working correctly.
            </p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-left: 3px solid #22c55e; margin-bottom: 40px;">
              <p style="color: #000; font-size: 14px; line-height: 1.5; margin: 0; font-weight: 600;">
                ✅ Email System Status: Working
              </p>
              <p style="color: #666; font-size: 14px; line-height: 1.5; margin: 8px 0 0 0;">
                The admin login notification system is now properly configured and ready to send security alerts.
              </p>
            </div>
            
            <p style="color: #999; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
              This is a test from the Healios Admin System.
            </p>
          </div>
        </body>
        </html>
      `,
    });
    
    return result;
  } catch (error) {
    console.error('Resend error:', error);
    throw error;
  }
}

console.log('====================================');
console.log(' RESEND EMAIL TEST');
console.log('====================================\n');

console.log('📧 Testing email delivery to jv@thefourths.com...\n');

async function testEmail() {
  try {
    console.log('Sending test email to jv@thefourths.com...');
    const result = await sendTestEmail();
    
    console.log('✅ Email sent successfully!');
    console.log('Result:', result);
    console.log('Please check jv@thefourths.com for the test email.');
    
  } catch (error) {
    console.error('❌ Email test failed:', error);
  }
}

testEmail();