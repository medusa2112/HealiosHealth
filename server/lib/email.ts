import { Resend } from "resend";

// Email service is ENABLED for PIN authentication
const isEmailEnabled = true; // ENABLED for PIN emails

export const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export type EmailType = "order_confirm" | "refund" | "reorder" | "admin_alert" | "abandoned_cart_1h" | "abandoned_cart_24h" | "reorder_reminder" | "reorder_final" | "referral_reward" | "referral_welcome" | "pin_auth";

interface EmailData {
  amount: number;
  id: string;
  customerName?: string;
  items?: any[];
  [key: string]: any;
}

// Rate limiting for email sends (Resend allows 2 per second)
let lastEmailTime = 0;
const EMAIL_RATE_LIMIT_MS = 600; // 600ms between emails (safer than 500ms)

async function rateLimitedSend(fn: () => Promise<any>): Promise<any> {
  const now = Date.now();
  const timeSinceLastEmail = now - lastEmailTime;
  
  if (timeSinceLastEmail < EMAIL_RATE_LIMIT_MS) {
    const delay = EMAIL_RATE_LIMIT_MS - timeSinceLastEmail;
    console.log(`[EMAIL RATE LIMIT] Waiting ${delay}ms before sending next email`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  lastEmailTime = Date.now();
  return fn();
}

export async function sendEmail(to: string, type: EmailType, data: EmailData) {
  if (!isEmailEnabled || !resend) {
    console.warn('Email service not configured - skipping email to:', to);
    return { id: 'mock-' + Date.now(), success: false };
  }
  const subjectMap: Record<EmailType, string> = {
    order_confirm: "Your Healios Order Confirmation",
    refund: "Your Healios Refund Has Been Processed",
    reorder: "Your Healios Reorder Is Complete",
    admin_alert: "⚠️ Healios Admin Alert",
    abandoned_cart_1h: "We're here when you're ready",
    abandoned_cart_24h: "A gentle reminder about your wellness selections",
    reorder_reminder: "A thoughtful reminder about your wellness routine",
    reorder_final: "A final gentle reminder from Healios",
    referral_reward: "Great news! You've earned a reward",
    referral_welcome: "Welcome to Healios! Your discount has been applied",
    pin_auth: "Your Healios Login PIN",
  };

  const bodyMap: Record<EmailType, (data: EmailData) => string> = {
    order_confirm: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 10px;">Order Confirmation</h1>
        <p>Hi${data.customerName ? ` ${data.customerName}` : ''},</p>
        <p>Thank you for your order! Your payment of <strong>R${data.amount.toFixed(2)}</strong> has been received.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #000; margin: 20px 0;">
          <p><strong>Order ID:</strong> ${data.id}</p>
          <p><strong>Payment Status:</strong> Completed</p>
          <p><strong>Order Status:</strong> Processing</p>
        </div>
        ${data.items ? `
        <h3>Order Items:</h3>
        <ul style="list-style: none; padding: 0;">
          ${data.items.map((item: any) => `
            <li style="border-bottom: 1px solid #eee; padding: 10px 0;">
              <strong>${item.productName || item.product?.name}</strong> - Qty: ${item.quantity} - R${(parseFloat(item.price || item.product?.price || '0') * item.quantity).toFixed(2)}
            </li>
          `).join('')}
        </ul>
        ` : ''}
        <p>We'll send you an update once your order has been shipped.</p>
        <p>Thank you for choosing Healios!</p>
      </div>
    `,
    refund: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 10px;">Refund Processed</h1>
        <p>Your refund of <strong>R${data.amount.toFixed(2)}</strong> has been processed successfully.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #000; margin: 20px 0;">
          <p><strong>Payment Intent ID:</strong> ${data.id}</p>
          <p><strong>Refund Amount:</strong> R${data.amount.toFixed(2)}</p>
        </div>
        <p>It may take 5–10 business days for the refund to appear in your account, depending on your bank.</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
      </div>
    `,
    reorder: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 10px;">Reorder Confirmation</h1>
        <p>Hi${data.customerName ? ` ${data.customerName}` : ''},</p>
        <p>Your reorder has been confirmed! Total amount: <strong>R${data.amount.toFixed(2)}</strong></p>
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #000; margin: 20px 0;">
          <p><strong>Session ID:</strong> ${data.id}</p>
          <p><strong>Status:</strong> Processing</p>
        </div>
        <p>You'll receive an update once your order has been shipped.</p>
        <p>Thank you for your continued trust in Healios!</p>
      </div>
    `,
    admin_alert: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #dc3545; border-bottom: 2px solid #dc3545; padding-bottom: 10px;">🚨 Admin Alert</h1>
        <p><strong>Alert:</strong> ${data.id}</p>
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0;">
          <p><strong>Details:</strong> ${JSON.stringify(data, null, 2)}</p>
        </div>
        <p>Please review this alert and take appropriate action if necessary.</p>
      </div>
    `,
    abandoned_cart_1h: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 10px;">We're here when you're ready</h1>
        <p>Hi ${data.userName},</p>
        <p>We noticed you were exploring some of our wellness products earlier. There's absolutely no rush – we just wanted to let you know we've saved everything in your cart for whenever you're ready to continue.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #6c757d;">
          <p style="margin: 0; color: #495057;">Take your time to make the right choice for your wellness journey. We're here to support you, not pressure you.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.resumeCheckoutUrl}" 
             style="background-color: #6c757d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-size: 14px;">
            Continue When Ready
          </a>
        </div>
        <p style="font-size: 14px; color: #6c757d;">Have questions about any products? Just reply to this email – we'd love to help you find exactly what you're looking for.</p>
        <p>Warmly,<br>The Healios Team</p>
      </div>
    `,
    abandoned_cart_24h: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 10px;">A gentle reminder about your wellness selections</h1>
        <p>Hi ${data.userName},</p>
        <p>We hope you've had time to consider the wellness products you were exploring yesterday. We understand that choosing the right supplements is an important decision.</p>
        
        <p style="color: #6c757d; font-style: italic;">Why we reach out gently: We believe wellness is a personal journey that shouldn't be rushed. We're simply here to remind you of the products you showed interest in, in case you'd like to continue exploring them.</p>
        
        <div style="background-color: #e8f4fd; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #4dabf7;">
          <h3 style="color: #1864ab; margin-top: 0; font-size: 16px;">As a thank you for considering us</h3>
          <p style="margin-bottom: 0;">If you do decide to proceed, use <strong>${data.discountCode}</strong> for <strong>${data.discountAmount} off</strong> your order as our way of saying thank you for taking the time to explore our products.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.resumeCheckoutUrl}" 
             style="background-color: #4dabf7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-size: 14px;">
            Review Your Selections
          </a>
        </div>
        <p style="font-size: 14px; color: #6c757d;">Remember, there's no pressure at all. We'll keep your selections safe for a few more days, and if you decide not to proceed, that's perfectly okay too.</p>
        <p>With care,<br>The Healios Team</p>
      </div>
    `,
    reorder_reminder: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 10px;">A thoughtful reminder about your ${data.productName}</h1>
        <p>Hi ${data.userName},</p>
        <p>We hope your wellness journey with <strong>${data.productName}</strong> has been going well! It's been ${data.orderAge} days since your last order, and we wanted to gently remind you that you might be running low soon.</p>
        
        <p style="color: #6c757d; font-style: italic;">Why we send these gentle reminders: We don't want your wellness routine to be interrupted unexpectedly. This is simply a helpful nudge based on typical usage patterns – not a sales push.</p>
        
        <div style="background-color: #fff8e1; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #ffb74d;">
          <p style="margin-top: 0;"><strong>Gentle timing reminder:</strong></p>
          <p style="margin-bottom: 0;">Based on typical usage, you might want to consider reordering in about <strong>${data.daysRemaining} days</strong>. Of course, you know your routine best, so please adjust this timing as needed.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.reorderUrl}" 
             style="background-color: #ffb74d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-size: 14px;">
            Reorder When Ready
          </a>
        </div>
        <p style="font-size: 12px; color: #999;">Reference: Order #${data.originalOrderId} from ${data.originalOrderDate}</p>
        <p>Supporting your wellness journey,<br>The Healios Team</p>
      </div>
    `,
    reorder_final: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #6c757d; border-bottom: 2px solid #6c757d; padding-bottom: 10px;">A final gentle reminder about your ${data.productName}</h1>
        <p>Hi ${data.userName},</p>
        <p>We hope this message finds you well. It's been <strong>${data.orderAge} days</strong> since your last <strong>${data.productName}</strong> order, and you might be running low by now.</p>
        
        <p style="color: #6c757d; font-style: italic;">Why this is our final reminder: We believe in respecting your choices. This will be our last gentle nudge about reordering – we trust you to manage your wellness routine in the way that works best for you.</p>
        
        <div style="background-color: #f1f3f4; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #9e9e9e;">
          <p style="margin-top: 0;"><strong>If you're still using ${data.productName}:</strong></p>
          <p style="margin-bottom: 0;">You might want to consider reordering soon to avoid any gap in your routine. If your needs have changed or you're taking a break, that's perfectly fine too.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.reorderUrl}" 
             style="background-color: #6c757d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-size: 14px;">
            Reorder If Needed
          </a>
        </div>
        <p style="font-size: 12px; color: #999;">Reference: Order #${data.originalOrderId} from ${data.originalOrderDate}</p>
        <p style="font-size: 14px; color: #6c757d;">Thank you for being part of our wellness community. Whether you reorder or not, we appreciate the trust you've placed in us.</p>
        <p>With gratitude,<br>The Healios Team</p>
      </div>
    `,
    referral_reward: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #28a745; border-bottom: 2px solid #28a745; padding-bottom: 10px;">🎉 You've Earned a Reward!</h1>
        <p>Hi ${data.userName},</p>
        <p>Wonderful news! ${data.refereeFirstName} just used your referral code <strong>${data.code}</strong> and made their first Healios purchase.</p>
        
        <div style="background-color: #d4edda; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #28a745;">
          <p style="margin-top: 0;"><strong>Your Reward:</strong></p>
          <p style="font-size: 18px; font-weight: bold; color: #155724; margin-bottom: 0;">R${data.rewardAmount} Credit</p>
          <p style="font-size: 14px; color: #6c757d; margin-bottom: 0;">This will be automatically applied to your next order</p>
        </div>
        
        <p style="color: #6c757d; font-style: italic;">Thank you for sharing Healios with your friends and helping us grow our wellness community. Your support means everything to us!</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://healios.com/portal/referrals" 
             style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-size: 14px;">
            Share Your Code Again
          </a>
        </div>
        
        <p>Keep sharing the wellness,<br>The Healios Team</p>
      </div>
    `,
    referral_welcome: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 10px;">Welcome to Healios!</h1>
        <p>Hi ${data.userName},</p>
        <p>What a great way to start your wellness journey! ${data.referrerFirstName} referred you to Healios, and we've applied your ${data.discountUsed} discount to your first order.</p>
        
        <div style="background-color: #cce5ff; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #007bff;">
          <p style="margin-top: 0;"><strong>Your First Order Benefits:</strong></p>
          <p>✓ ${data.discountUsed} discount applied automatically</p>
          <p>✓ Welcome to our wellness community</p>
          <p style="margin-bottom: 0;">✓ Access to premium supplements and expert guidance</p>
        </div>
        
        <p style="color: #6c757d; font-style: italic;">When you're ready, you can also create your own referral code and earn rewards when you share Healios with friends!</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://healios.com/portal" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-size: 14px;">
            Explore Your Portal
          </a>
        </div>
        
        <p>Welcome to the family,<br>The Healios Team</p>
      </div>
    `,
    pin_auth: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Your Healios Login PIN</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; background-color: #ffffff; color: #000;">
        <div style="max-width: 600px; margin: 0 auto;">
          <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 30px;">
            LOGIN AUTHENTICATION
          </div>
          
          <h1 style="font-size: 32px; font-weight: 400; line-height: 1.2; margin: 0 0 30px 0; color: #000;">
            Your login PIN
          </h1>
          
          ${data.originalUserEmail ? `
          <div style="background-color: #e3f2fd; padding: 20px; margin: 0 0 30px 0; border-left: 4px solid #2196f3; border-radius: 4px;">
            <div style="font-size: 14px; font-weight: 600; color: #1976d2; margin-bottom: 8px;">DEVELOPMENT MODE</div>
            <div style="font-size: 16px; color: #333;">PIN requested for user: <strong>${data.originalUserEmail}</strong></div>
          </div>
          ` : ''}
          
          <p style="font-size: 16px; line-height: 1.6; color: #666; margin: 0 0 40px 0;">
            Use this PIN to complete your sign-in to Healios. Enter it on the login page to access your account.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-left: 4px solid #000; margin: 0 0 40px 0;">
            <div style="font-size: 36px; font-weight: 600; letter-spacing: 8px; color: #000; font-family: monospace;">
              ${data.pin}
            </div>
            <div style="font-size: 14px; color: #666; margin-top: 15px;">
              This PIN expires in 5 minutes
            </div>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #666; margin: 0 0 40px 0;">
            If you didn't request this login PIN, please ignore this email. Your account security remains protected.
          </p>
          
          <div style="border-top: 1px solid #e0e0e0; padding-top: 30px; margin-top: 50px;">
            <p style="color: #999; font-size: 14px; line-height: 1.5; margin: 0;">
              This is an automated message from Healios. Please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  // Send email using Resend API
  try {
    console.log(`[EMAIL DEBUG] Attempting to send ${type} email to ${to}`);
    console.log(`[EMAIL DEBUG] Resend client exists:`, !!resend);
    console.log(`[EMAIL DEBUG] API Key exists:`, !!process.env.RESEND_API_KEY);
    
    const result = await rateLimitedSend(async () => {
      return await resend!.emails.send({
        from: 'Healios <onboarding@resend.dev>',
        to: [to],
        subject: subjectMap[type],
        html: bodyMap[type](data),
      });
    });

    console.log(`[EMAIL DEBUG] Full Resend result:`, JSON.stringify(result, null, 2));
    
    // Check if there's an error from Resend
    if (result.error) {
      console.error(`[EMAIL ERROR] Resend API error:`, result.error);
      
      // Handle testing mode limitation
      if (result.error.statusCode === 403 && result.error.error?.includes('testing emails')) {
        console.warn(`[EMAIL WARNING] Resend is in testing mode - can only send to verified email address`);
        return { id: 'testing-mode-' + Date.now(), success: false, error: 'testing_mode' };
      }
      
      return { id: 'error-' + Date.now(), success: false, error: result.error };
    }
    
    console.log(`[EMAIL SENT] ${type} email sent to ${to} - ID: ${result.data?.id}`);
    return { id: result.data?.id || 'unknown', success: true };
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send ${type} email to ${to}:`, error);
    console.error(`[EMAIL ERROR] Error details:`, JSON.stringify(error, null, 2));
    return { id: 'error-' + Date.now(), success: false };
  }
}

// Send PIN authentication email
export async function sendPinEmail(userEmail: string, pin: string): Promise<{ success: boolean; id?: string }> {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    // In development/testing: send to all admin accounts
    const adminEmails = ["admin@thehealios.com", "dn@thefourths.com"];
    console.log(`[PIN_AUTH] Development mode - sending PIN to admin accounts instead of user email`);
    
    let lastResult = { success: false, id: 'no-attempts' };
    
    for (const adminEmail of adminEmails) {
      try {
        const result = await sendEmail(adminEmail, "pin_auth", {
          pin,
          amount: 0,
          id: 'pin-' + Date.now(),
          originalUserEmail: userEmail // Include original email in the data
        });
        
        if (result.success) {
          console.log(`[PIN_AUTH] PIN sent successfully to admin: ${adminEmail}`);
          lastResult = result;
          break; // Stop on first successful send
        } else {
          console.log(`[PIN_AUTH] Failed to send to admin: ${adminEmail}`);
          lastResult = result;
        }
      } catch (error) {
        console.error(`[PIN_AUTH] Error sending to admin ${adminEmail}:`, error);
      }
    }
    
    return lastResult;
  } else {
    // In production: send to the actual user email
    console.log(`[PIN_AUTH] Production mode - sending PIN to user email: ${userEmail}`);
    return await sendEmail(userEmail, "pin_auth", {
      pin,
      amount: 0,
      id: 'pin-' + Date.now()
    });
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
      console.error(`Failed to send admin alert to ${email}:`, error);
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
  console.log(`[EMAIL DISABLED] Subscription cancellation email skipped for ${data.customerEmail}`);
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
  console.log(`[EMAIL DISABLED] Subscription payment failed email skipped for ${data.customerEmail}`);
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
  console.log(`[EMAIL DISABLED] Subscription created email skipped for ${data.customerEmail}`);
  return { id: 'disabled-' + Date.now(), success: false };
}