#!/usr/bin/env node

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function testProductionReadiness() {
  console.log('=== Resend Production Readiness Test ===\n');
  
  try {
    // Test sending to verified address (should work)
    console.log('1. Testing email to verified address (dn@thefourths.com)...');
    const verifiedResult = await resend.emails.send({
      from: `Healios <${process.env.RESEND_FROM_ADDRESS}>`,
      to: ['dn@thefourths.com'],
      subject: 'Healios Production Test - Verified Address',
      html: '<h1>✅ Verified Address Test</h1><p>This email confirms sending to verified addresses works.</p>',
    });
    
    console.log('Verified address result:', verifiedResult.error ? 'FAILED' : 'SUCCESS', verifiedResult.data?.id || verifiedResult.error);
    
    // Test sending to unverified address (will show if in production mode)
    console.log('\n2. Testing email to unverified address (test@example.com)...');
    const unverifiedResult = await resend.emails.send({
      from: `Healios <${process.env.RESEND_FROM_ADDRESS}>`,
      to: ['test@example.com'],
      subject: 'Healios Production Test - Unverified Address',
      html: '<h1>🚀 Production Mode Test</h1><p>If you receive this, your account is in production mode.</p>',
    });
    
    if (unverifiedResult.error) {
      console.log('Unverified address result: FAILED (Expected in testing mode)');
      console.log('Error:', unverifiedResult.error.error);
      
      if (unverifiedResult.error.statusCode === 403) {
        console.log('\n📧 ACCOUNT STATUS: TESTING MODE');
        console.log('To enable production email sending:');
        console.log('1. Go to https://resend.com/billing');
        console.log('2. Upgrade to a paid plan (starts at $20/month for 50,000 emails)');
        console.log('3. Or add more verified email addresses for testing');
      }
    } else {
      console.log('Unverified address result: SUCCESS - Account is in production mode!');
      console.log('Email ID:', unverifiedResult.data?.id);
    }
    
    // Check API limits
    console.log('\n3. Checking API usage and limits...');
    // Note: Resend doesn't have a direct API for checking usage, but we can infer from errors
    
  } catch (error) {
    console.error('Error during production test:', error);
  }
}

testProductionReadiness();