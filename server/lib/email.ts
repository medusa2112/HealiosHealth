import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY environment variable is required");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export type EmailType = "order_confirm" | "refund" | "reorder" | "admin_alert" | "abandoned_cart_1h" | "abandoned_cart_24h" | "reorder_reminder" | "reorder_final";

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
    abandoned_cart_1h: "Still thinking it over?",
    abandoned_cart_24h: "Your wellness journey is waiting (10% off inside!)",
    reorder_reminder: "Running low on {productName}?",
    reorder_final: "Last chance to reorder your supplements",
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
        <h1 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 10px;">Still thinking it over?</h1>
        <p>Hi ${data.userName},</p>
        <p>You've left some amazing products in your cart. We thought you might want to complete your wellness journey with us.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.resumeCheckoutUrl}" 
             style="background-color: #000; color: white; padding: 15px 30px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
            Resume Checkout
          </a>
        </div>
        <p>Questions? Just reply to this email and we'll be happy to help!</p>
        <p>The Healios Team</p>
      </div>
    `,
    abandoned_cart_24h: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 10px;">Your wellness journey is waiting!</h1>
        <p>Hi ${data.userName},</p>
        <p>We noticed you haven't completed your order yet. Don't miss out on these premium supplements!</p>
        
        <div style="background-color: #e8f5e8; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #28a745;">
          <h3 style="color: #28a745; margin-top: 0;">🎉 Special Offer Just For You!</h3>
          <p><strong>Use code: ${data.discountCode}</strong> for <strong>${data.discountAmount} OFF</strong> your order</p>
          <p style="font-size: 14px; color: #666;">This offer expires in 24 hours</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.resumeCheckoutUrl}" 
             style="background-color: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
            Complete Your Order & Save ${data.discountAmount}
          </a>
        </div>
        <p>This exclusive offer won't last long. Complete your purchase now and start your wellness transformation!</p>
        <p>The Healios Team</p>
      </div>
    `,
    reorder_reminder: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 10px;">Running low on ${data.productName}?</h1>
        <p>Hi ${data.userName},</p>
        <p>It's been ${data.orderAge} days since your last order of <strong>${data.productName}</strong>.</p>
        
        <div style="background-color: #fff3cd; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #ffc107;">
          <p><strong>Reorder Reminder:</strong></p>
          <p>Based on typical usage, you might be running low in about <strong>${data.daysRemaining} days</strong>.</p>
          <p>Don't let your wellness routine be interrupted!</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.reorderUrl}" 
             style="background-color: #000; color: white; padding: 15px 30px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
            Reorder ${data.productName}
          </a>
        </div>
        <p><small>Original order #${data.originalOrderId} placed on ${data.originalOrderDate}</small></p>
        <p>The Healios Team</p>
      </div>
    `,
    reorder_final: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #dc3545; border-bottom: 2px solid #dc3545; padding-bottom: 10px;">Last chance to reorder your supplements</h1>
        <p>Hi ${data.userName},</p>
        <p>${data.isRunningLow ? 
          `You should be running low on <strong>${data.productName}</strong> by now.` :
          `You'll likely run out of <strong>${data.productName}</strong> very soon.`
        }</p>
        
        <div style="background-color: #f8d7da; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #dc3545;">
          <p><strong>Don't let your routine be disrupted!</strong></p>
          <p>It's been <strong>${data.orderAge} days</strong> since your last order. Reorder now to maintain your wellness journey.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.reorderUrl}" 
             style="background-color: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
            Reorder ${data.productName} Now
          </a>
        </div>
        <p><small>Original order #${data.originalOrderId} placed on ${data.originalOrderDate}</small></p>
        <p>The Healios Team</p>
      </div>
    `
  };

  try {
    const result = await resend.emails.send({
      from: "Healios <onboarding@resend.dev>", // Using verified Resend domain for testing
      to,
      subject: subjectMap[type],
      html: bodyMap[type](data),
    });

    console.log(`Email sent successfully: ${type} to ${to}`, result);
    return result;
  } catch (error) {
    console.error(`Failed to send email: ${type} to ${to}`, error);
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