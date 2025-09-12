import { Resend } from "resend";

// Email service configuration
const isEmailEnabled = true;

export const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export type EmailType = "order_confirm" | "refund" | "reorder" | "admin_alert";

interface EmailData {
  amount?: number;
  id?: string;
  customerName?: string;
  items?: any[];
  cart?: any;
  userName?: string;
  cartItems?: any[];
  resumeCheckoutUrl?: string;
  discountCode?: string;
  discountAmount?: string;
  [key: string]: any;
}

// Rate limiting for email sends (Resend allows 2 per second)
// Thread-safe rate limiting using Map to avoid race conditions
const userEmailLimits = new Map<string, number>();
const EMAIL_RATE_LIMIT_MS = 600; // 600ms between emails (safer than 500ms)

async function rateLimitedSend(fn: () => Promise<any>, userId: string = 'global'): Promise<any> {
  const now = Date.now();
  const lastTime = userEmailLimits.get(userId) || 0;
  const timeSinceLastEmail = now - lastTime;
  
  if (timeSinceLastEmail < EMAIL_RATE_LIMIT_MS) {
    const delay = EMAIL_RATE_LIMIT_MS - timeSinceLastEmail;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  userEmailLimits.set(userId, Date.now());
  
  // Clean up old entries periodically to prevent memory leaks
  if (userEmailLimits.size > 1000) {
    const cutoff = Date.now() - (60 * 60 * 1000); // 1 hour ago
    for (const [key, timestamp] of userEmailLimits.entries()) {
      if (timestamp < cutoff) {
        userEmailLimits.delete(key);
      }
    }
  }
  
  return fn();
}

export async function sendEmail(to: string, type: EmailType, data: EmailData) {
  if (!isEmailEnabled || !resend) {
    
    return { id: 'mock-' + Date.now(), success: false };
  }
  const subjectMap: Record<EmailType, string> = {
    order_confirm: "Your Healios Order Confirmation",
    refund: "Your Healios Refund Has Been Processed",
    reorder: "Your Healios Reorder Is Complete",
    admin_alert: "⚠️ Healios Admin Alert",
  };

  const healiosEmailTemplate = (title: string, content: string, footerNote?: string) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
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
        <h2 style="margin: 0 0 24px 0; color: #000000; font-size: 24px; font-weight: 600; letter-spacing: -0.025em; border-bottom: 2px solid #000000; padding-bottom: 12px;">${title}</h2>
        
        ${content}
        
        ${footerNote ? `
        <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e5e5;">
          <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.5;">${footerNote}</p>
        </div>
        ` : ''}
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
  `;

  const bodyMap: Record<EmailType, (data: EmailData) => string> = {
    order_confirm: (data) => healiosEmailTemplate(
      "Order Confirmation",
      `
        <p style="margin: 0 0 20px 0; font-size: 16px; color: #000000;">Hi${data.customerName ? ` ${data.customerName}` : ''},</p>
        
        <p style="margin: 0 0 24px 0; font-size: 16px; color: #000000;">Thank you for your order! Your payment of <strong style="color: #000000;">R${(data.amount || 0).toFixed(2)}</strong> has been received and is being processed.</p>
        
        <div style="background: linear-gradient(135deg, hsl(160, 100%, 35%), hsl(30, 25%, 65%)); padding: 20px; border-radius: 8px; margin: 24px 0;">
          <div style="background-color: rgba(255, 255, 255, 0.95); padding: 20px; border-radius: 6px;">
            <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #000000;">ORDER DETAILS</p>
            <p style="margin: 0 0 8px 0; font-size: 16px; color: #000000;"><strong>Order ID:</strong> ${data.id}</p>
            <p style="margin: 0 0 8px 0; font-size: 16px; color: #000000;"><strong>Payment Status:</strong> <span style="color: hsl(160, 100%, 35%); font-weight: 500;">Completed</span></p>
            <p style="margin: 0; font-size: 16px; color: #000000;"><strong>Order Status:</strong> <span style="color: hsl(220, 100%, 40%); font-weight: 500;">Processing</span></p>
          </div>
        </div>
        
        ${data.items ? `
        <div style="margin: 32px 0;">
          <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #000000; letter-spacing: -0.025em;">Order Items</h3>
          <div style="border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden;">
            ${data.items.map((item: any, index: number) => `
              <div style="padding: 16px; ${index > 0 ? 'border-top: 1px solid #e5e5e5;' : ''} background-color: ${index % 2 === 0 ? '#ffffff' : '#f8f9fa'};">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <p style="margin: 0 0 4px 0; font-size: 16px; font-weight: 500; color: #000000;">${item.productName || item.product?.name}</p>
                    <p style="margin: 0; font-size: 14px; color: #666666;">Quantity: ${item.quantity}</p>
                  </div>
                  <p style="margin: 0; font-size: 16px; font-weight: 600; color: #000000;">R${(parseFloat(item.price || item.product?.price || '0') * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
        
        <p style="margin: 24px 0 0 0; font-size: 16px; color: #000000;">We'll send you an update once your order has been shipped. Thank you for choosing Healios for your wellness journey!</p>
      `,
      "Questions about your order? Simply reply to this email and we'll be happy to help."
    ),
    refund: (data) => healiosEmailTemplate(
      "Refund Processed",
      `
        <p style="margin: 0 0 24px 0; font-size: 16px; color: #000000;">Your refund of <strong style="color: #000000;">R${(data.amount || 0).toFixed(2)}</strong> has been processed successfully.</p>
        
        <div style="background: linear-gradient(135deg, hsl(220, 100%, 40%), hsl(260, 100%, 60%)); padding: 20px; border-radius: 8px; margin: 24px 0;">
          <div style="background-color: rgba(255, 255, 255, 0.95); padding: 20px; border-radius: 6px;">
            <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #000000;">REFUND DETAILS</p>
            <p style="margin: 0 0 8px 0; font-size: 16px; color: #000000;"><strong>Payment Intent ID:</strong> ${data.id}</p>
            <p style="margin: 0; font-size: 16px; color: #000000;"><strong>Refund Amount:</strong> <span style="color: hsl(160, 100%, 35%); font-weight: 600;">R${(data.amount || 0).toFixed(2)}</span></p>
          </div>
        </div>
        
        <p style="margin: 24px 0; font-size: 16px; color: #000000;">It may take 5–10 business days for the refund to appear in your account, depending on your bank's processing time.</p>
        
        <p style="margin: 0; font-size: 16px; color: #000000;">If you have any questions about this refund, please don't hesitate to contact us.</p>
      `,
      "We appreciate your understanding and look forward to serving you again in the future."
    ),
    reorder: (data) => healiosEmailTemplate(
      "Reorder Confirmation",
      `
        <p style="margin: 0 0 20px 0; font-size: 16px; color: #000000;">Hi${data.customerName ? ` ${data.customerName}` : ''},</p>
        
        <p style="margin: 0 0 24px 0; font-size: 16px; color: #000000;">Your reorder has been confirmed! Thank you for continuing your wellness journey with us.</p>
        
        <div style="background: linear-gradient(135deg, hsl(280, 100%, 35%), hsl(320, 100%, 50%)); padding: 20px; border-radius: 8px; margin: 24px 0;">
          <div style="background-color: rgba(255, 255, 255, 0.95); padding: 20px; border-radius: 6px;">
            <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #000000;">REORDER DETAILS</p>
            <p style="margin: 0 0 8px 0; font-size: 16px; color: #000000;"><strong>Total Amount:</strong> <span style="color: hsl(160, 100%, 35%); font-weight: 600;">R${(data.amount || 0).toFixed(2)}</span></p>
            <p style="margin: 0 0 8px 0; font-size: 16px; color: #000000;"><strong>Session ID:</strong> ${data.id}</p>
            <p style="margin: 0; font-size: 16px; color: #000000;"><strong>Status:</strong> <span style="color: hsl(220, 100%, 40%); font-weight: 500;">Processing</span></p>
          </div>
        </div>
        
        <p style="margin: 24px 0 0 0; font-size: 16px; color: #000000;">You'll receive an update once your order has been shipped. Thank you for your continued trust in Healios!</p>
      `,
      "We appreciate your loyalty and are committed to supporting your wellness goals."
    ),
    admin_alert: (data) => healiosEmailTemplate(
      "🚨 Admin Alert",
      `
        <div style="background: linear-gradient(135deg, hsl(0, 84.2%, 60.2%), hsl(320, 100%, 50%)); padding: 20px; border-radius: 8px; margin: 0 0 24px 0;">
          <div style="background-color: rgba(255, 255, 255, 0.95); padding: 20px; border-radius: 6px;">
            <p style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #000000;">URGENT: System Alert</p>
            <p style="margin: 0 0 8px 0; font-size: 16px; color: #000000;"><strong>Alert Type:</strong> ${data.id}</p>
          </div>
        </div>
        
        <div style="background-color: #fff3cd; border: 2px solid #ffb74d; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <p style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #000000;">Alert Details:</p>
          <pre style="background-color: #f8f9fa; padding: 16px; border-radius: 4px; font-size: 14px; color: #000000; white-space: pre-wrap; word-wrap: break-word; overflow-wrap: break-word;">${JSON.stringify(data, null, 2)}</pre>
        </div>
        
        <p style="margin: 24px 0 0 0; font-size: 16px; color: #000000;">Please review this alert immediately and take appropriate action if necessary.</p>
      `,
      "This is an automated alert from the Healios system monitoring."
    ),
  };

  // Send email using Resend API
  try {
    console.log(`[EMAIL] Attempting to send ${type} email to ${to}`);

    const fromAddress = 'Healios <dn@thefourths.com>';

    console.log(`[EMAIL] From address: ${fromAddress}`);

    const result = await rateLimitedSend(async () => {
      return await resend!.emails.send({
        from: fromAddress,
        to: [to],
        subject: subjectMap[type],
        html: bodyMap[type](data),
      });
    });
    
    console.log(`[EMAIL] Resend result:`, { hasError: !!result.error, hasData: !!result.data });
    
    // Check if there's an error from Resend
    if (result.error) {
      console.error(`[EMAIL ERROR] Resend API error:`, result.error);
      
      // Handle testing mode limitation
      if (result.error.statusCode === 403 && result.error.error?.includes('testing emails')) {
        console.log(`[EMAIL] Resend in testing mode - allowing fallback`);
        return { id: 'testing-mode-' + Date.now(), success: false, error: 'testing_mode' };
      }
      
      return { id: 'error-' + Date.now(), success: false, error: result.error };
    }

    console.log(`[EMAIL] Email sent successfully with ID: ${result.data?.id}`);
    return { id: result.data?.id || 'unknown', success: true };
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send ${type} email to ${to}:`, error);
    console.error(`[EMAIL ERROR] Error details:`, JSON.stringify(error, null, 2));
    return { id: 'error-' + Date.now(), success: false };
  }
}


// Send admin alert emails for critical issues
export async function sendAdminAlert(message: string, data?: any) {
  const adminEmails = ["admin@thehealios.com", "dn@thefourths.com"];
  
  for (const email of adminEmails) {
    try {
      await sendEmail(email, "admin_alert", {
        id: message,
        amount: 0,
        ...data
      });
    } catch (error) {
      // // console.error(`Failed to send admin alert to ${email}:`, error);
      // Don't throw - admin alerts should not break the main flow
    }
  }
}

// Subscription-specific email functions (Phase 18)
export async function sendSubscriptionCancelled(data: {
  customerEmail: string;
  customerName: string;
  productName: string;
  subscriptionId: string;
  cancellationDate: Date;
}) {
  const subject = "Your Healios Subscription Has Been Cancelled";
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 10px;">Subscription Cancelled</h1>
      <p>Hi ${data.customerName},</p>
      <p>We've successfully cancelled your subscription for <strong>${data.productName}</strong>.</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #000; margin: 20px 0;">
        <p><strong>Subscription ID:</strong> ${data.subscriptionId}</p>
        <p><strong>Product:</strong> ${data.productName}</p>
        <p><strong>Cancellation Date:</strong> ${data.cancellationDate.toLocaleDateString()}</p>
      </div>
      
      <p>You won't be charged for any future deliveries. If you have any remaining deliveries from previous charges, they will still be fulfilled.</p>
      <p>We're sad to see you go! If you'd like to restart your subscription in the future, you can easily do so from your account.</p>
      
      <div style="margin: 30px 0; padding: 20px; background-color: #f1f3f4; border-radius: 8px;">
        <p style="margin: 0; color: #666;">Need help or have questions? Contact our support team anytime.</p>
      </div>
      
      <p>Thank you for being a valued Healios customer!</p>
    </div>
  `;

  // EMAIL DISABLED - Subscription cancellation email skipped
  
  return { id: 'disabled-' + Date.now(), success: false };
}

export async function sendSubscriptionPaymentFailed(data: {
  customerEmail: string;
  customerName: string;
  subscriptionId: string;
  productName: string;
  amount: string;
  nextRetryDate: Date;
}) {
  const subject = "Payment Failed - Action Required for Your Healios Subscription";
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #dc3545; border-bottom: 2px solid #dc3545; padding-bottom: 10px;">Payment Failed</h1>
      <p>Hi ${data.customerName},</p>
      <p>We weren't able to process the payment for your <strong>${data.productName}</strong> subscription.</p>
      
      <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0;">
        <p><strong>Subscription ID:</strong> ${data.subscriptionId}</p>
        <p><strong>Product:</strong> ${data.productName}</p>
        <p><strong>Amount:</strong> R${data.amount}</p>
        <p><strong>Next Retry:</strong> ${data.nextRetryDate.toLocaleDateString()}</p>
      </div>
      
      <p><strong>What happens next?</strong></p>
      <ul>
        <li>We'll automatically retry the payment in 3 days</li>
        <li>You can update your payment method in your account anytime</li>
        <li>Your subscription remains active during the retry period</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="/portal/subscriptions" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 4px;">Update Payment Method</a>
      </div>
      
      <p>If you need assistance, please don't hesitate to contact our support team.</p>
      <p>Thank you for your understanding!</p>
    </div>
  `;

  // EMAIL DISABLED - Subscription payment failed email skipped
  
  return { id: 'disabled-' + Date.now(), success: false };
}

export async function sendSubscriptionCreated(data: {
  customerEmail: string;
  customerName: string;
  subscriptionId: string;
  productName: string;
  intervalDays: number;
  nextBillingDate: Date;
  amount: string;
}) {
  const subject = "Your Healios Subscription Is Active!";
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 10px;">Subscription Active</h1>
      <p>Hi ${data.customerName},</p>
      <p>Great news! Your subscription for <strong>${data.productName}</strong> is now active.</p>
      
      <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p><strong>Subscription Details:</strong></p>
        <p><strong>Product:</strong> ${data.productName}</p>
        <p><strong>Delivery Schedule:</strong> Every ${data.intervalDays} days</p>
        <p><strong>Amount:</strong> R${data.amount} per delivery</p>
        <p><strong>Next Billing:</strong> ${data.nextBillingDate.toLocaleDateString()}</p>
      </div>
      
      <p><strong>What's next?</strong></p>
      <ul>
        <li>Your first order will be processed and shipped within 1-2 business days</li>
        <li>You'll automatically receive your next delivery every ${data.intervalDays} days</li>
        <li>You can manage your subscription anytime in your account</li>
        <li>Cancel or modify your subscription without any fees</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="/portal/subscriptions" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 4px;">Manage Subscription</a>
      </div>
      
      <p>Thank you for choosing Healios for your wellness journey!</p>
    </div>
  `;

  // EMAIL DISABLED - Subscription created email skipped
  
  return { id: 'disabled-' + Date.now(), success: false };
}