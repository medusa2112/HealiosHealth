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
        
        <p style="margin: 0 0 24px 0; font-size: 16px; color: #000000;">Thank you for your order! Your payment of <strong style="color: #000000;">R${data.amount.toFixed(2)}</strong> has been received and is being processed.</p>
        
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
        <p style="margin: 0 0 24px 0; font-size: 16px; color: #000000;">Your refund of <strong style="color: #000000;">R${data.amount.toFixed(2)}</strong> has been processed successfully.</p>
        
        <div style="background: linear-gradient(135deg, hsl(220, 100%, 40%), hsl(260, 100%, 60%)); padding: 20px; border-radius: 8px; margin: 24px 0;">
          <div style="background-color: rgba(255, 255, 255, 0.95); padding: 20px; border-radius: 6px;">
            <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #000000;">REFUND DETAILS</p>
            <p style="margin: 0 0 8px 0; font-size: 16px; color: #000000;"><strong>Payment Intent ID:</strong> ${data.id}</p>
            <p style="margin: 0; font-size: 16px; color: #000000;"><strong>Refund Amount:</strong> <span style="color: hsl(160, 100%, 35%); font-weight: 600;">R${data.amount.toFixed(2)}</span></p>
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
            <p style="margin: 0 0 8px 0; font-size: 16px; color: #000000;"><strong>Total Amount:</strong> <span style="color: hsl(160, 100%, 35%); font-weight: 600;">R${data.amount.toFixed(2)}</span></p>
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
    abandoned_cart_1h: (data) => healiosEmailTemplate(
      "We're here when you're ready",
      `
        <p style="margin: 0 0 20px 0; font-size: 16px; color: #000000;">Hi ${data.userName},</p>
        
        <p style="margin: 0 0 24px 0; font-size: 16px; color: #000000;">We noticed you were exploring some of our wellness products earlier. There's absolutely no rush – we just wanted to let you know we've saved everything in your cart for whenever you're ready to continue.</p>
        
        <div style="background: linear-gradient(135deg, hsl(160, 100%, 35%), hsl(30, 25%, 65%)); padding: 20px; border-radius: 8px; margin: 24px 0;">
          <div style="background-color: rgba(255, 255, 255, 0.95); padding: 20px; border-radius: 6px;">
            <p style="margin: 0; font-size: 16px; color: #000000; font-style: italic;">Take your time to make the right choice for your wellness journey. We're here to support you, not pressure you.</p>
          </div>
        </div>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${data.resumeCheckoutUrl}" 
             style="background: linear-gradient(135deg, hsl(280, 100%, 35%), hsl(320, 100%, 50%)); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
            Continue When Ready
          </a>
        </div>
        
        <p style="margin: 24px 0 0 0; font-size: 16px; color: #000000;">Have questions about any products? Just reply to this email – we'd love to help you find exactly what you're looking for.</p>
        
        <p style="margin: 24px 0 0 0; font-size: 16px; color: #000000;">Warmly,<br><strong>The Healios Team</strong></p>
      `,
      "Your wellness journey is personal. We're here to support, never to pressure."
    ),
    abandoned_cart_24h: (data) => healiosEmailTemplate(
      "A gentle reminder about your wellness selections",
      `
        <p style="margin: 0 0 20px 0; font-size: 16px; color: #000000;">Hi ${data.userName},</p>
        
        <p style="margin: 0 0 24px 0; font-size: 16px; color: #000000;">We hope you've had time to consider the wellness products you were exploring yesterday. We understand that choosing the right supplements is an important decision.</p>
        
        <div style="background-color: #f8f9fa; padding: 24px; border-radius: 8px; border-left: 4px solid hsl(30, 25%, 65%); margin: 24px 0;">
          <p style="margin: 0; font-size: 16px; color: #000000; font-style: italic;"><strong>Why we reach out gently:</strong> We believe wellness is a personal journey that shouldn't be rushed. We're simply here to remind you of the products you showed interest in, in case you'd like to continue exploring them.</p>
        </div>
        
        ${data.discountCode ? `
        <div style="background: linear-gradient(135deg, hsl(220, 100%, 40%), hsl(260, 100%, 60%)); padding: 20px; border-radius: 8px; margin: 24px 0;">
          <div style="background-color: rgba(255, 255, 255, 0.95); padding: 20px; border-radius: 6px;">
            <h3 style="color: #000000; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">As a thank you for considering us</h3>
            <p style="margin: 0; font-size: 16px; color: #000000;">If you do decide to proceed, use <strong style="color: hsl(280, 100%, 35%);">${data.discountCode}</strong> for <strong style="color: hsl(160, 100%, 35%);">${data.discountAmount} off</strong> your order as our way of saying thank you for taking the time to explore our products.</p>
          </div>
        </div>
        ` : ''}
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${data.resumeCheckoutUrl}" 
             style="background: linear-gradient(135deg, hsl(160, 100%, 35%), hsl(30, 25%, 65%)); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
            Review Your Selections
          </a>
        </div>
        
        <p style="margin: 24px 0; font-size: 16px; color: #666666;">Remember, there's no pressure at all. We'll keep your selections safe for a few more days, and if you decide not to proceed, that's perfectly okay too.</p>
        
        <p style="margin: 24px 0 0 0; font-size: 16px; color: #000000;">With care,<br><strong>The Healios Team</strong></p>
      `,
      "Your wellness is worth the wait. We're here when you're ready."
    ),
    reorder_reminder: (data) => healiosEmailTemplate(
      `A thoughtful reminder about your ${data.productName}`,
      `
        <p style="margin: 0 0 20px 0; font-size: 16px; color: #000000;">Hi ${data.userName},</p>
        
        <p style="margin: 0 0 24px 0; font-size: 16px; color: #000000;">We hope your wellness journey with <strong>${data.productName}</strong> has been going well! It's been ${data.orderAge} days since your last order, and we wanted to gently remind you that you might be running low soon.</p>
        
        <div style="background-color: #f8f9fa; padding: 24px; border-radius: 8px; border-left: 4px solid hsl(30, 25%, 65%); margin: 24px 0;">
          <p style="margin: 0; font-size: 16px; color: #000000; font-style: italic;"><strong>Why we send these gentle reminders:</strong> We don't want your wellness routine to be interrupted unexpectedly. This is simply a helpful nudge based on typical usage patterns – not a sales push.</p>
        </div>
        
        <div style="background: linear-gradient(135deg, hsl(30, 25%, 65%), hsl(160, 100%, 35%)); padding: 20px; border-radius: 8px; margin: 24px 0;">
          <div style="background-color: rgba(255, 255, 255, 0.95); padding: 20px; border-radius: 6px;">
            <p style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #000000;">Gentle timing reminder:</p>
            <p style="margin: 0; font-size: 16px; color: #000000;">Based on typical usage, you might want to consider reordering in about <strong style="color: hsl(280, 100%, 35%);">${data.daysRemaining} days</strong>. Of course, you know your routine best, so please adjust this timing as needed.</p>
          </div>
        </div>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${data.reorderUrl}" 
             style="background: linear-gradient(135deg, hsl(30, 25%, 65%), hsl(160, 100%, 35%)); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
            Reorder When Ready
          </a>
        </div>
        
        <p style="margin: 24px 0; font-size: 14px; color: #666666;">Reference: Order #${data.originalOrderId} from ${data.originalOrderDate}</p>
        
        <p style="margin: 24px 0 0 0; font-size: 16px; color: #000000;">Supporting your wellness journey,<br><strong>The Healios Team</strong></p>
      `,
      "We're here to support your routine, not pressure you into purchases."
    ),
    reorder_final: (data) => healiosEmailTemplate(
      `A final gentle reminder about your ${data.productName}`,
      `
        <p style="margin: 0 0 20px 0; font-size: 16px; color: #000000;">Hi ${data.userName},</p>
        
        <p style="margin: 0 0 24px 0; font-size: 16px; color: #000000;">We hope this message finds you well. It's been <strong>${data.orderAge} days</strong> since your last <strong>${data.productName}</strong> order, and you might be running low by now.</p>
        
        <div style="background-color: #f8f9fa; padding: 24px; border-radius: 8px; border-left: 4px solid hsl(280, 100%, 35%); margin: 24px 0;">
          <p style="margin: 0; font-size: 16px; color: #000000; font-style: italic;"><strong>Why this is our final reminder:</strong> We believe in respecting your choices. This will be our last gentle nudge about reordering – we trust you to manage your wellness routine in the way that works best for you.</p>
        </div>
        
        <div style="background: linear-gradient(135deg, hsl(220, 100%, 40%), hsl(260, 100%, 60%)); padding: 20px; border-radius: 8px; margin: 24px 0;">
          <div style="background-color: rgba(255, 255, 255, 0.95); padding: 20px; border-radius: 6px;">
            <p style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #000000;">If you're still using ${data.productName}:</p>
            <p style="margin: 0; font-size: 16px; color: #000000;">You might want to consider reordering soon to avoid any gap in your routine. If your needs have changed or you're taking a break, that's perfectly fine too.</p>
          </div>
        </div>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${data.reorderUrl}" 
             style="background: linear-gradient(135deg, hsl(280, 100%, 35%), hsl(320, 100%, 50%)); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
            Reorder If Needed
          </a>
        </div>
        
        <p style="margin: 24px 0; font-size: 14px; color: #666666;">Reference: Order #${data.originalOrderId} from ${data.originalOrderDate}</p>
        
        <p style="margin: 24px 0; font-size: 16px; color: #666666;">Thank you for being part of our wellness community. Whether you reorder or not, we appreciate the trust you've placed in us.</p>
        
        <p style="margin: 24px 0 0 0; font-size: 16px; color: #000000;">With gratitude,<br><strong>The Healios Team</strong></p>
      `,
      "Your wellness journey is entirely your own. We're grateful to have been part of it."
    ),
    referral_reward: (data) => healiosEmailTemplate(
      "🎉 You've Earned a Reward!",
      `
        <p style="margin: 0 0 20px 0; font-size: 16px; color: #000000;">Hi ${data.userName},</p>
        
        <p style="margin: 0 0 24px 0; font-size: 16px; color: #000000;">Wonderful news! ${data.refereeFirstName} just used your referral code <strong>${data.code}</strong> and made their first Healios purchase.</p>
        
        <div style="background: linear-gradient(135deg, hsl(160, 100%, 35%), hsl(30, 25%, 65%)); padding: 20px; border-radius: 8px; margin: 24px 0;">
          <div style="background-color: rgba(255, 255, 255, 0.95); padding: 20px; border-radius: 6px;">
            <p style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #000000;">Your Reward:</p>
            <p style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: hsl(160, 100%, 35%);">R${data.rewardAmount} Credit</p>
            <p style="margin: 0; font-size: 14px; color: #666666;">This will be automatically applied to your next order</p>
          </div>
        </div>
        
        <p style="margin: 24px 0; font-size: 16px; color: #666666; font-style: italic;">Thank you for sharing Healios with your friends and helping us grow our wellness community. Your support means everything to us!</p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://healios.com/portal/referrals" 
             style="background: linear-gradient(135deg, hsl(160, 100%, 35%), hsl(30, 25%, 65%)); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
            Share Your Code Again
          </a>
        </div>
        
        <p style="margin: 24px 0 0 0; font-size: 16px; color: #000000;">Keep sharing the wellness,<br><strong>The Healios Team</strong></p>
      `,
      "Thank you for helping us grow our wellness community through referrals."
    ),
    referral_welcome: (data) => healiosEmailTemplate(
      "Welcome to Healios!",
      `
        <p style="margin: 0 0 20px 0; font-size: 16px; color: #000000;">Hi ${data.userName},</p>
        
        <p style="margin: 0 0 24px 0; font-size: 16px; color: #000000;">What a great way to start your wellness journey! ${data.referrerFirstName} referred you to Healios, and we've applied your ${data.discountUsed} discount to your first order.</p>
        
        <div style="background: linear-gradient(135deg, hsl(220, 100%, 40%), hsl(260, 100%, 60%)); padding: 20px; border-radius: 8px; margin: 24px 0;">
          <div style="background-color: rgba(255, 255, 255, 0.95); padding: 20px; border-radius: 6px;">
            <p style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #000000;">Your First Order Benefits:</p>
            <p style="margin: 0 0 8px 0; font-size: 16px; color: #000000;">✓ ${data.discountUsed} discount applied automatically</p>
            <p style="margin: 0 0 8px 0; font-size: 16px; color: #000000;">✓ Welcome to our wellness community</p>
            <p style="margin: 0; font-size: 16px; color: #000000;">✓ Access to premium supplements and expert guidance</p>
          </div>
        </div>
        
        <p style="margin: 24px 0; font-size: 16px; color: #666666; font-style: italic;">When you're ready, you can also create your own referral code and earn rewards when you share Healios with friends!</p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://healios.com/portal" 
             style="background: linear-gradient(135deg, hsl(220, 100%, 40%), hsl(260, 100%, 60%)); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
            Explore Your Portal
          </a>
        </div>
        
        <p style="margin: 24px 0 0 0; font-size: 16px; color: #000000;">Welcome to the family,<br><strong>The Healios Team</strong></p>
      `,
      "We're excited to have you join our wellness community!"
    ),
    pin_auth: (data) => `
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
          
            ${data.originalUserEmail ? `
            <div style="background: linear-gradient(135deg, hsl(220, 100%, 40%), hsl(260, 100%, 60%)); padding: 2px; border-radius: 8px; margin: 0 0 32px 0;">
              <div style="background-color: #ffffff; padding: 20px; border-radius: 6px;">
                <p style="margin: 0; font-size: 14px; color: #000000; font-weight: 500;">
                  <strong>Development Mode:</strong> This PIN was generated for <strong>${data.originalUserEmail}</strong> but sent to this admin account for testing.
                </p>
              </div>
            </div>
            ` : ''}
          
            <p style="font-size: 18px; line-height: 1.6; color: #000000; margin: 0 0 40px 0;">
              Use this PIN to complete your sign-in to Healios. Enter it on the login page to access your account.
            </p>
          
            <!-- PIN Display with Healios branding -->
            <div style="background: linear-gradient(135deg, hsl(160, 100%, 35%), hsl(30, 25%, 65%)); padding: 3px; border-radius: 12px; margin: 0 0 40px 0;">
              <div style="background-color: #ffffff; padding: 40px 20px; text-align: center; border-radius: 9px;">
                <div style="font-size: 48px; font-weight: 700; letter-spacing: 12px; color: #000000; font-family: 'Inter', monospace; margin: 0 0 16px 0;">
                  ${data.pin}
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
    `
  };

  // Send email using Resend API
  try {
    console.log(`[EMAIL DEBUG] Attempting to send ${type} email to ${to}`);
    console.log(`[EMAIL DEBUG] Resend client exists:`, !!resend);
    console.log(`[EMAIL DEBUG] API Key exists:`, !!process.env.RESEND_API_KEY);
    
    // Use environment variable for from address, fallback to testing address
    const fromAddress = process.env.RESEND_FROM_ADDRESS 
      ? (process.env.RESEND_FROM_ADDRESS.includes('<') 
         ? process.env.RESEND_FROM_ADDRESS 
         : `Healios <${process.env.RESEND_FROM_ADDRESS}>`)
      : 'Healios <onboarding@resend.dev>';
    
    console.log(`[EMAIL DEBUG] Using from address: ${fromAddress}`);
    
    const result = await rateLimitedSend(async () => {
      return await resend!.emails.send({
        from: fromAddress,
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
    const adminEmails = ["dn@thefourths.com", "jv@thefourths.com"];
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