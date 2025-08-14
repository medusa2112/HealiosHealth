#!/usr/bin/env node

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmailTemplates() {
  console.log('=== Testing Updated Healios Email Templates ===\n');
  
  const testEmail = 'dn@thefourths.com'; // Send to verified admin email
  
  try {
    // Test PIN authentication email with new branding
    console.log('1. Testing branded PIN authentication email...');
    const pinResult = await resend.emails.send({
      from: `Healios <${process.env.RESEND_FROM_ADDRESS}>`,
      to: [testEmail],
      subject: 'Your Healios Login PIN - Brand Test',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Healios Login PIN</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          </style>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; line-height: 1.6; color: #000000; background-color: #f8f9fa;">
          <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);">
            
            <!-- Header with Healios brand gradient -->
            <div style="background: linear-gradient(135deg, hsl(280, 100%, 35%), hsl(320, 100%, 50%)); padding: 48px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.025em;">
                Healios
              </h1>
              <p style="margin: 12px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9; font-weight: 500;">
                Your secure login PIN
              </p>
            </div>
            
            <!-- Content -->
            <div style="padding: 48px 40px;">
              <h2 style="margin: 0 0 24px 0; color: #000000; font-size: 28px; font-weight: 600; line-height: 1.3; letter-spacing: -0.025em;">
                Welcome back!
              </h2>
            
              <p style="font-size: 18px; line-height: 1.6; color: #000000; margin: 0 0 40px 0;">
                Use this PIN to complete your sign-in to Healios. Enter it on the login page to access your account.
              </p>
            
              <!-- PIN Display with Healios branding -->
              <div style="background: linear-gradient(135deg, hsl(160, 100%, 35%), hsl(30, 25%, 65%)); padding: 3px; border-radius: 12px; margin: 0 0 40px 0;">
                <div style="background-color: #ffffff; padding: 40px 20px; text-align: center; border-radius: 9px;">
                  <div style="font-size: 48px; font-weight: 700; letter-spacing: 12px; color: #000000; font-family: 'Inter', monospace; margin: 0 0 16px 0;">
                    123456
                  </div>
                  <div style="font-size: 16px; color: hsl(280, 100%, 35%); font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">
                    Expires in 5 minutes
                  </div>
                </div>
              </div>
            
              <div style="background-color: #f8f9fa; padding: 24px; border-radius: 8px; border-left: 4px solid hsl(320, 100%, 50%); margin: 0 0 32px 0;">
                <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #000000;">
                  <strong>Security Note:</strong> If you didn't request this login PIN, please ignore this email. Your account security remains protected.
                </p>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6; color: #666666; margin: 0; text-align: center;">
                Need help? Simply reply to this email and we'll assist you right away.
              </p>
            </div>

            <!-- Footer -->
            <div style="background-color: #f8f9fa; padding: 32px 40px; text-align: center; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0 0 8px 0; color: #666666; font-size: 14px;">
                This is an automated security message from Healios.
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                © ${new Date().getFullYear()} Healios - Premium wellness supplements for your health journey.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    
    if (pinResult.error) {
      console.log('❌ PIN email failed:', pinResult.error);
    } else {
      console.log('✅ PIN email sent successfully - ID:', pinResult.data?.id);
    }

    // Test Order Confirmation email with new branding
    console.log('\n2. Testing branded Order Confirmation email...');
    const orderResult = await resend.emails.send({
      from: `Healios <${process.env.RESEND_FROM_ADDRESS}>`,
      to: [testEmail],
      subject: 'Your Healios Order Confirmation - Brand Test',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          </style>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; line-height: 1.6; color: #000000; background-color: #ffffff;">
          
          <!-- Header with Healios branding -->
          <div style="background: linear-gradient(135deg, hsl(280, 100%, 35%), hsl(320, 100%, 50%)); padding: 24px 0; text-align: center;">
            <div style="max-width: 600px; margin: 0 auto; padding: 0 20px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.025em;">Healios</h1>
              <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">Premium Wellness Supplements</p>
            </div>
          </div>

          <!-- Main content -->
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff;">
            <h2 style="margin: 0 0 24px 0; color: #000000; font-size: 24px; font-weight: 600; letter-spacing: -0.025em; border-bottom: 2px solid #000000; padding-bottom: 12px;">Order Confirmation</h2>
            
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #000000;">Hi there,</p>
            
            <p style="margin: 0 0 24px 0; font-size: 16px; color: #000000;">Thank you for your order! Your payment of <strong style="color: #000000;">R299.00</strong> has been received and is being processed.</p>
            
            <div style="background: linear-gradient(135deg, hsl(160, 100%, 35%), hsl(30, 25%, 65%)); padding: 20px; border-radius: 8px; margin: 24px 0;">
              <div style="background-color: rgba(255, 255, 255, 0.95); padding: 20px; border-radius: 6px;">
                <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #000000;">ORDER DETAILS</p>
                <p style="margin: 0 0 8px 0; font-size: 16px; color: #000000;"><strong>Order ID:</strong> HLO-12345</p>
                <p style="margin: 0 0 8px 0; font-size: 16px; color: #000000;"><strong>Payment Status:</strong> <span style="color: hsl(160, 100%, 35%); font-weight: 500;">Completed</span></p>
                <p style="margin: 0; font-size: 16px; color: #000000;"><strong>Order Status:</strong> <span style="color: hsl(220, 100%, 40%); font-weight: 500;">Processing</span></p>
              </div>
            </div>
            
            <p style="margin: 24px 0 0 0; font-size: 16px; color: #000000;">We'll send you an update once your order has been shipped. Thank you for choosing Healios for your wellness journey!</p>
            
            <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.5;">Questions about your order? Simply reply to this email and we'll be happy to help.</p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 32px 20px; text-align: center; border-top: 1px solid #e5e5e5;">
            <div style="max-width: 600px; margin: 0 auto;">
              <p style="margin: 0 0 16px 0; color: #666666; font-size: 14px;">
                This email was sent from Healios. If you have any questions, please don't hesitate to contact us.
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.4;">
                © ${new Date().getFullYear()} Healios. All rights reserved.<br>
                Premium wellness supplements for your health journey.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    
    if (orderResult.error) {
      console.log('❌ Order confirmation email failed:', orderResult.error);
    } else {
      console.log('✅ Order confirmation email sent successfully - ID:', orderResult.data?.id);
    }

    console.log('\n🎨 Email template branding test complete!');
    console.log('Check your inbox at', testEmail, 'to see the new Healios-branded email designs.');
    
  } catch (error) {
    console.error('Error during email template testing:', error);
  }
}

testEmailTemplates();