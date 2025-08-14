#!/usr/bin/env node

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function testRealUserEmail() {
  console.log('=== Testing Real User Email (Production Mode Simulation) ===\n');
  
  try {
    // Test sending PIN to a real user email (like production would)
    const testUserEmail = 'dominic@oricle.app'; // Your actual email for testing
    const testPIN = '123456';
    
    console.log(`Testing PIN email to real user: ${testUserEmail}`);
    
    const result = await resend.emails.send({
      from: `Healios <${process.env.RESEND_FROM_ADDRESS}>`,
      to: [testUserEmail],
      subject: 'Your Healios Login PIN',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 10px;">Your Login PIN</h1>
          <p>Hi,</p>
          <p>Use this PIN to complete your sign-in to Healios:</p>
          
          <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-left: 4px solid #000; margin: 20px 0;">
            <div style="font-size: 36px; font-weight: 600; letter-spacing: 8px; color: #000; font-family: monospace;">
              ${testPIN}
            </div>
            <div style="font-size: 14px; color: #666; margin-top: 15px;">
              This PIN expires in 5 minutes
            </div>
          </div>
          
          <p>If you didn't request this login PIN, please ignore this email.</p>
        </div>
      `,
    });
    
    if (result.error) {
      console.log('❌ FAILED to send to real user email');
      console.log('Error:', result.error);
    } else {
      console.log('✅ SUCCESS - Email sent to real user!');
      console.log('Email ID:', result.data?.id);
      console.log('\nThis confirms production email functionality is working.');
    }
    
  } catch (error) {
    console.error('Error during real user email test:', error);
  }
}

testRealUserEmail();