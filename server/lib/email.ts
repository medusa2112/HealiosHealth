import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY environment variable is required");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export type EmailType = "order_confirm" | "refund" | "reorder" | "admin_alert";

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