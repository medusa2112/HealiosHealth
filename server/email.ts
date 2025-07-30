import { Resend } from 'resend';
import { type Order } from '@shared/schema';

interface CartItem {
  product: {
    id: string;
    name: string;
    price: string;
    imageUrl: string;
  };
  quantity: number;
}

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderEmailData {
  order: Order;
  orderItems: CartItem[];
}

export class EmailService {
  private static readonly FROM_EMAIL = 'noreply@thehealios.com';
  private static readonly ADMIN_EMAIL = 'dn@thefourths.com';

  static async sendOrderConfirmation(emailData: OrderEmailData): Promise<boolean> {
    try {
      const { order, orderItems } = emailData;
      
      const orderItemsHtml = orderItems.map(item => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px 0;">
            <div style="display: flex; align-items: center;">
              <img src="${item.product.imageUrl}" alt="${item.product.name}" 
                   style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; margin-right: 12px;" />
              <div>
                <h4 style="margin: 0; font-size: 14px; color: #333;">${item.product.name}</h4>
                <p style="margin: 4px 0 0 0; color: #666; font-size: 12px;">Qty: ${item.quantity}</p>
              </div>
            </div>
          </td>
          <td style="text-align: right; padding: 12px 0;">
            <strong style="color: #333;">R${(parseFloat(item.product.price) * item.quantity).toFixed(2)}</strong>
          </td>
        </tr>
      `).join('');

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Order Confirmation - Healios</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #000; margin: 0;">Healios</h1>
            <p style="color: #666; margin: 5px 0 0 0;">Premium Wellness Supplements</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #333; margin: 0 0 10px 0;">Order Confirmed!</h2>
            <p style="margin: 0; color: #666;">Thank you for your order. We'll send you shipping details once your order is on its way.</p>
          </div>

          <div style="margin-bottom: 30px;">
            <h3 style="color: #333; border-bottom: 2px solid #000; padding-bottom: 8px;">Order Details</h3>
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt || Date.now()).toLocaleDateString()}</p>
            <p><strong>Total:</strong> R${order.totalAmount}</p>
          </div>

          <div style="margin-bottom: 30px;">
            <h3 style="color: #333; border-bottom: 2px solid #000; padding-bottom: 8px;">Items Ordered</h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${orderItemsHtml}
            </table>
          </div>

          <div style="margin-bottom: 30px;">
            <h3 style="color: #333; border-bottom: 2px solid #000; padding-bottom: 8px;">Shipping Address</h3>
            <p style="white-space: pre-line;">${order.shippingAddress}</p>
          </div>

          <div style="background: #000; color: white; padding: 20px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0 0 10px 0;">What's Next?</h3>
            <p style="margin: 0;">We'll process your order within 1-2 business days and send you tracking information via email.</p>
          </div>

          <div style="text-center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              Questions? Contact us at <a href="mailto:support@thehealios.com" style="color: #000;">support@thehealios.com</a>
            </p>
          </div>
        </body>
        </html>
      `;

      await resend.emails.send({
        from: this.FROM_EMAIL,
        to: order.customerEmail,
        subject: `Order Confirmation #${order.id.slice(-8)} - Healios`,
        html,
      });

      return true;
    } catch (error) {
      console.error('Failed to send order confirmation email:', error);
      return false;
    }
  }

  static async sendAdminOrderNotification(emailData: OrderEmailData): Promise<boolean> {
    try {
      const { order, orderItems } = emailData;
      
      const orderItemsList = orderItems.map(item => 
        `• ${item.product.name} (Qty: ${item.quantity}) - R${(parseFloat(item.product.price) * item.quantity).toFixed(2)}`
      ).join('\n');

      const html = `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #000;">New Order Received - Healios</h2>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #333;">Order #${order.id}</h3>
            <p><strong>Customer:</strong> ${order.customerEmail}</p>
            <p><strong>Total:</strong> R${order.totalAmount}</p>
            <p><strong>Date:</strong> ${new Date(order.createdAt || Date.now()).toLocaleString()}</p>
          </div>

          <div style="margin: 20px 0;">
            <h4>Items:</h4>
            <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px;">${orderItemsList}</pre>
          </div>

          <div style="margin: 20px 0;">
            <h4>Shipping Address:</h4>
            <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px;">${order.shippingAddress}</pre>
          </div>

          <div style="background: #000; color: white; padding: 15px; border-radius: 8px; text-align: center; margin-top: 20px;">
            <p style="margin: 0;"><strong>Action Required:</strong> Process this order and update stock levels</p>
          </div>
        </body>
        </html>
      `;

      await resend.emails.send({
        from: this.FROM_EMAIL,
        to: this.ADMIN_EMAIL,
        subject: `New Order #${order.id.slice(-8)} - R${order.totalAmount}`,
        html,
      });

      return true;
    } catch (error) {
      console.error('Failed to send admin order notification:', error);
      return false;
    }
  }

  static async sendLowStockAlert(productName: string, currentStock: number, productId: string): Promise<boolean> {
    try {
      const html = `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #e74c3c;">Low Stock Alert - Healios</h2>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #856404;">⚠️ Stock Running Low</h3>
            <p><strong>Product:</strong> ${productName}</p>
            <p><strong>Current Stock:</strong> ${currentStock} units remaining</p>
            <p><strong>Product ID:</strong> ${productId}</p>
          </div>

          <div style="background: #000; color: white; padding: 15px; border-radius: 8px; text-align: center;">
            <p style="margin: 0;"><strong>Action Required:</strong> Restock this product to avoid stockouts</p>
          </div>

          <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              This alert was sent automatically when stock fell below the threshold of 3 units.
            </p>
          </div>
        </body>
        </html>
      `;

      await resend.emails.send({
        from: this.FROM_EMAIL,
        to: this.ADMIN_EMAIL,
        subject: `Low Stock Alert: ${productName} (${currentStock} remaining)`,
        html,
      });

      return true;
    } catch (error) {
      console.error('Failed to send low stock alert:', error);
      return false;
    }
  }

  static async sendPreOrderNotification(productName: string, customerEmail: string, productId: string): Promise<boolean> {
    try {
      const html = `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #000;">New Pre-Order - Healios</h2>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #333;">Pre-Order Details</h3>
            <p><strong>Product:</strong> ${productName}</p>
            <p><strong>Customer Email:</strong> ${customerEmail}</p>
            <p><strong>Product ID:</strong> ${productId}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <div style="background: #e8f5e8; border: 1px solid #28a745; padding: 15px; border-radius: 8px;">
            <p style="margin: 0; color: #155724;">
              <strong>💡 Note:</strong> Customer will receive 10% discount when product becomes available.
            </p>
          </div>
        </body>
        </html>
      `;

      await resend.emails.send({
        from: this.FROM_EMAIL,
        to: this.ADMIN_EMAIL,
        subject: `New Pre-Order: ${productName}`,
        html,
      });

      return true;
    } catch (error) {
      console.error('Failed to send pre-order notification:', error);
      return false;
    }
  }
}