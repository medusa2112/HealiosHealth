#!/usr/bin/env node

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function testResendConfiguration() {
  console.log('=== Resend Configuration Test ===\n');
  
  console.log('API Key configured:', !!process.env.RESEND_API_KEY);
  console.log('From Address configured:', process.env.RESEND_FROM_ADDRESS);
  console.log('');
  
  try {
    // Try to get domain information
    const domains = await resend.domains.list();
    console.log('Verified domains:', JSON.stringify(domains, null, 2));
    
    // Test sending to the verified address
    console.log('\n=== Testing Email Send ===');
    const result = await resend.emails.send({
      from: `Healios <${process.env.RESEND_FROM_ADDRESS}>`,
      to: [process.env.RESEND_FROM_ADDRESS], // Send to self
      subject: 'Healios Email Test',
      html: '<h1>Test Email</h1><p>This is a test to confirm Resend is working properly.</p>',
    });
    
    console.log('Email send result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Error testing Resend:', error);
  }
}

testResendConfiguration();