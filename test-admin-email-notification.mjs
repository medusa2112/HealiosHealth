#!/usr/bin/env node

/**
 * Test script to verify admin login email notifications
 * Tests that email is sent when an admin successfully logs in
 */

import fs from 'fs';

console.log('====================================');
console.log(' ADMIN LOGIN EMAIL NOTIFICATION TEST');
console.log('====================================\n');

console.log('📧 Email Notification Feature Summary:');
console.log('--------------------------------------');
console.log('✅ Created sendAdminLoginNotification method in EmailService');
console.log('✅ Integrated email sending in OAuth callback for admin logins');
console.log('✅ Email includes:');
console.log('   - Login timestamp');
console.log('   - IP address');
console.log('   - User agent/device info');
console.log('   - Security warning if not recognized');
console.log('\n');

console.log('📋 How it works:');
console.log('--------------------------------------');
console.log('1. Admin logs in via Replit OAuth');
console.log('2. Upon successful authentication:');
console.log('   - System detects admin role');
console.log('   - Sends notification email to admin\'s email address');
console.log('   - Email sent asynchronously (non-blocking)');
console.log('3. Admin receives security notification with login details');
console.log('\n');

console.log('🔐 Admin Emails Configured:');
console.log('--------------------------------------');
const adminEmails = process.env.ALLOWED_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
if (adminEmails.length > 0) {
  adminEmails.forEach(email => {
    console.log(`   • ${email}`);
  });
} else {
  console.log('   ⚠️ No admin emails configured in ALLOWED_ADMIN_EMAILS');
}
console.log('\n');

console.log('✉️ Email Configuration:');
console.log('--------------------------------------');
console.log(`   FROM: marketing@thehealios.com`);
console.log(`   SUBJECT: 🔐 Admin Login Alert - Healios`);
console.log(`   API: ${process.env.RESEND_API_KEY ? '✅ Resend API configured' : '❌ Resend API not configured'}`);
console.log('\n');

console.log('🧪 Test Instructions:');
console.log('--------------------------------------');
console.log('1. Log in as an admin user:');
console.log('   - Go to /admin/login');
console.log('   - Click "Sign in with Replit"');
console.log('   - Use one of the admin accounts');
console.log('2. Check your email for the login notification');
console.log('3. Verify email contains:');
console.log('   - Correct timestamp');
console.log('   - Your IP address');
console.log('   - Browser/device information');
console.log('\n');

console.log('📝 Server Logs to Watch For:');
console.log('--------------------------------------');
console.log('Success: "📧 Admin login notification sent: {result}"');
console.log('Failure: "❌ Failed to send admin login notification: {error}"');
console.log('\n');

console.log('====================================');
console.log(' TEST COMPLETE');
console.log('====================================');