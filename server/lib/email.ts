import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY environment variable is required");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export type EmailType = "order_confirm" | "refund" | "reorder" | "admin_alert" | "abandoned_cart_1h" | "abandoned_cart_24h" | "reorder_reminder" | "reorder_final" | "referral_reward" | "referral_welcome";

interface EmailData {
  amount: number;
  id: string;
  customerName?: string;
  items?: any[];
  [key: string]: any;
}

export async function sendEmail(to: string, type: EmailType, data: EmailData) {
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
    `
  };

  try {
    const result = await resend.emails.send({
      from: "Healios <no-reply@thehealios.com>",
      to,
      subject: subjectMap[type],
      html: bodyMap[type](data),
    });

    console.log(`Email sent successfully: ${type} to ${to}`, result);
    return result;
  } catch (error) {
    console.error(`Failed to send email: ${type} to ${to}`, error);
    // Log the full error details
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    throw error;
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

  try {
    const result = await resend.emails.send({
      from: "Healios <onboarding@resend.dev>",
      to: data.customerEmail,
      subject,
      html,
    });
    console.log(`Subscription cancellation email sent to ${data.customerEmail}`, result);
    return result;
  } catch (error) {
    console.error(`Failed to send subscription cancellation email to ${data.customerEmail}`, error);
    throw error;
  }
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

  try {
    const result = await resend.emails.send({
      from: "Healios <onboarding@resend.dev>",
      to: data.customerEmail,
      subject,
      html,
    });
    console.log(`Subscription payment failed email sent to ${data.customerEmail}`, result);
    return result;
  } catch (error) {
    console.error(`Failed to send subscription payment failed email to ${data.customerEmail}`, error);
    throw error;
  }
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

  try {
    const result = await resend.emails.send({
      from: "Healios <onboarding@resend.dev>",
      to: data.customerEmail,
      subject,
      html,
    });
    console.log(`Subscription created email sent to ${data.customerEmail}`, result);
    return result;
  } catch (error) {
    console.error(`Failed to send subscription created email to ${data.customerEmail}`, error);
    throw error;
  }
}