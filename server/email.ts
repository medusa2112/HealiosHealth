import { Resend } from 'resend';
import type { PreOrder } from '@shared/schema';
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
  private static readonly FROM_EMAIL = 'dn@thefourths.com';
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
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white;">
            <!-- Header -->
            <div style="padding: 40px 40px 20px 40px; text-align: left;">
              <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px;">
                ORDER CONFIRMATION
              </div>
              
              <h1 style="color: #000; font-size: 28px; font-weight: 400; line-height: 1.3; margin: 0 0 20px 0;">
                Your order has been confirmed and will be processed within 1-2 business days.
              </h1>
            </div>

            <!-- Order Stats Grid -->
            <div style="padding: 0 40px; margin-bottom: 40px;">
              <div style="display: table; width: 100%; border-collapse: collapse;">
                <div style="display: table-row;">
                  <div style="display: table-cell; width: 25%; padding: 20px 10px; text-align: left; vertical-align: top;">
                    <div style="font-size: 24px; font-weight: 400; color: #000; margin-bottom: 8px;">#${order.id.slice(-8)}</div>
                    <div style="font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px; line-height: 1.4;">ORDER<br>NUMBER</div>
                  </div>
                  <div style="display: table-cell; width: 25%; padding: 20px 10px; text-align: left; vertical-align: top;">
                    <div style="font-size: 24px; font-weight: 400; color: #000; margin-bottom: 8px;">R${order.totalAmount}</div>
                    <div style="font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px; line-height: 1.4;">ORDER<br>TOTAL</div>
                  </div>
                  <div style="display: table-cell; width: 25%; padding: 20px 10px; text-align: left; vertical-align: top;">
                    <div style="font-size: 24px; font-weight: 400; color: #000; margin-bottom: 8px;">${new Date(order.createdAt || Date.now()).toLocaleDateString()}</div>
                    <div style="font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px; line-height: 1.4;">ORDER<br>DATE</div>
                  </div>
                  <div style="display: table-cell; width: 25%; padding: 20px 10px; text-align: left; vertical-align: top;">
                    <div style="font-size: 24px; font-weight: 400; color: #000; margin-bottom: 8px;">1-2 Days</div>
                    <div style="font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px; line-height: 1.4;">PROCESSING<br>TIME</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Items Ordered -->
            <div style="padding: 0 40px; margin-bottom: 40px;">
              <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px;">
                ITEMS ORDERED
              </div>
              <table style="width: 100%; border-collapse: collapse; border-top: 1px solid #eee;">
                ${orderItemsHtml}
              </table>
            </div>

            <!-- CTA Buttons -->
            <div style="padding: 0 40px 60px 40px;">
              <div style="margin-bottom: 20px;">
                <a href="https://healios.com/products" style="display: inline-block; background-color: #000; color: white; padding: 16px 32px; text-decoration: none; font-size: 14px; font-weight: 500; margin-right: 15px;">Shop Healios supplements →</a>
                <a href="https://healios.com/science" style="display: inline-block; background-color: #000; color: white; padding: 16px 32px; text-decoration: none; font-size: 14px; font-weight: 500;">Learn about our science →</a>
              </div>
            </div>
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

  private static async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async sendPreOrderNotification(preOrder: PreOrder): Promise<boolean> {
    console.log('📧 Starting pre-order email notification process for:', preOrder.customerEmail);
    try {
      const adminHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>New Pre-Order - Healios</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #000; margin: 0;">Healios</h1>
            <p style="color: #666; margin: 5px 0 0 0;">Premium Wellness Supplements</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #333; margin: 0 0 10px 0;">🎯 New Pre-Order Alert</h2>
            <p style="margin: 0; color: #666;">A customer has placed a pre-order for an out-of-stock product.</p>
          </div>

          <div style="margin-bottom: 30px;">
            <h3 style="color: #333; border-bottom: 2px solid #000; padding-bottom: 8px;">Customer Details</h3>
            <p><strong>Name:</strong> ${preOrder.customerName}</p>
            <p><strong>Email:</strong> <a href="mailto:${preOrder.customerEmail}" style="color: #000;">${preOrder.customerEmail}</a></p>
            ${preOrder.customerPhone ? `<p><strong>Phone:</strong> <a href="tel:${preOrder.customerPhone}" style="color: #000;">${preOrder.customerPhone}</a></p>` : ''}
            <p><strong>Pre-Order Date:</strong> ${new Date(preOrder.createdAt || Date.now()).toLocaleDateString()}</p>
          </div>

          <div style="margin-bottom: 30px;">
            <h3 style="color: #333; border-bottom: 2px solid #000; padding-bottom: 8px;">Product Information</h3>
            <p><strong>Product:</strong> ${preOrder.productName}</p>
            <p><strong>Price:</strong> R${preOrder.productPrice}</p>
            <p><strong>Quantity Requested:</strong> ${preOrder.quantity}</p>
            <p><strong>Total Value:</strong> R${(parseFloat(preOrder.productPrice) * (preOrder.quantity || 1)).toFixed(2)}</p>
          </div>

          ${preOrder.notes ? `
          <div style="margin-bottom: 30px;">
            <h3 style="color: #333; border-bottom: 2px solid #000; padding-bottom: 8px;">Customer Notes</h3>
            <p style="background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 0;">${preOrder.notes}</p>
          </div>` : ''}

          <div style="background: #000; color: white; padding: 20px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0 0 10px 0;">Next Steps</h3>
            <p style="margin: 0;">Add this customer to the pre-order waiting list and notify them when stock arrives.</p>
          </div>

          <div style="text-center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              Pre-Order ID: ${preOrder.id}
            </p>
          </div>
        </body>
        </html>
      `;

      // Send to both admin emails
      const adminEmails = ['dn@thefourths.com', 'ms@thefourths.com'];
      
      console.log('📧 Sending admin emails to:', adminEmails);
      for (const adminEmail of adminEmails) {
        try {
          const adminResult = await resend.emails.send({
            from: this.FROM_EMAIL,
            to: adminEmail,
            subject: `🎯 New Pre-Order: ${preOrder.productName} - ${preOrder.customerName}`,
            html: adminHtml,
          });
          console.log(`📧 Admin email sent to ${adminEmail}:`, adminResult);
          
          if (adminResult.error) {
            console.error(`❌ Error sending admin email to ${adminEmail}:`, adminResult.error);
          } else {
            console.log(`✅ Admin email successfully sent to ${adminEmail}`);
          }
        } catch (error) {
          console.error(`❌ Failed to send admin email to ${adminEmail}:`, error);
        }
        
        // Add delay to avoid rate limiting
        await this.sleep(600); // 600ms delay between emails (under 2 per second)
      }

      // Send confirmation to customer
      const customerHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Pre-Order Confirmation - Healios</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white;">
            <!-- Header -->
            <div style="padding: 40px 40px 20px 40px; text-align: left;">
              <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px;">
                THE COGNITIVE ADVANTAGE
              </div>
              
              <h1 style="color: #000; font-size: 28px; font-weight: 400; line-height: 1.3; margin: 0 0 20px 0;">
                Your ${preOrder.productName} pre-order has been confirmed.
              </h1>
            </div>

            <!-- Product Stats Grid -->
            <div style="padding: 0 40px; margin-bottom: 40px;">
              <div style="display: table; width: 100%; border-collapse: collapse;">
                <div style="display: table-row;">
                  <div style="display: table-cell; width: 25%; padding: 20px 10px; text-align: left; vertical-align: top;">
                    <div style="font-size: 24px; font-weight: 400; color: #000; margin-bottom: 8px;">R${preOrder.productPrice}</div>
                    <div style="font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px; line-height: 1.4;">PREORDER<br>PRICE</div>
                  </div>
                  <div style="display: table-cell; width: 25%; padding: 20px 10px; text-align: left; vertical-align: top;">
                    <div style="font-size: 24px; font-weight: 400; color: #000; margin-bottom: 8px;">${preOrder.quantity || 1}</div>
                    <div style="font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px; line-height: 1.4;">QUANTITY<br>REQUESTED</div>
                  </div>
                  <div style="display: table-cell; width: 25%; padding: 20px 10px; text-align: left; vertical-align: top;">
                    <div style="font-size: 24px; font-weight: 400; color: #000; margin-bottom: 8px;">Sept 1st</div>
                    <div style="font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px; line-height: 1.4;">EXPECTED<br>RESTOCK</div>
                  </div>
                  <div style="display: table-cell; width: 25%; padding: 20px 10px; text-align: left; vertical-align: top;">
                    <div style="font-size: 24px; font-weight: 400; color: #000; margin-bottom: 8px;">No Payment</div>
                    <div style="font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px; line-height: 1.4;">REQUIRED<br>UNTIL STOCK</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- CTA Buttons -->
            <div style="padding: 0 40px 60px 40px;">
              <div style="margin-bottom: 20px;">
                <a href="https://healios.com/products" style="display: inline-block; background-color: #000; color: white; padding: 16px 32px; text-decoration: none; font-size: 14px; font-weight: 500; margin-right: 15px;">Shop Healios supplements →</a>
                <a href="https://healios.com/science" style="display: inline-block; background-color: #000; color: white; padding: 16px 32px; text-decoration: none; font-size: 14px; font-weight: 500;">Learn about our science →</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      console.log('📧 Sending customer confirmation email to:', preOrder.customerEmail);
      try {
        const customerResult = await resend.emails.send({
          from: this.FROM_EMAIL,
          to: preOrder.customerEmail,
          subject: `Pre-Order Confirmation: ${preOrder.productName} - Healios`,
          html: customerHtml,
        });
        console.log('📧 Customer email sent:', customerResult);
        
        if (customerResult.error) {
          console.error('❌ Error sending customer email:', customerResult.error);
          return false;
        } else {
          console.log('✅ Customer email successfully sent');
        }
      } catch (error) {
        console.error('❌ Failed to send customer email:', error);
        return false;
      }

      console.log('✅ All pre-order emails sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending pre-order notification emails:', error);
      return false;
    }
  }

  static async sendRestockNotification(data: {
    firstName: string;
    email: string;
    product: string;
    restockDate: string;
  }): Promise<boolean> {
    try {
      const { firstName, email, product, restockDate } = data;

      // Admin notification HTML
      const adminHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Restock Notification Request - Healios</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #000; margin: 0;">Healios</h1>
            <p style="color: #666; margin: 5px 0 0 0;">Restock Notification Request</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #333; margin: 0 0 10px 0;">New Restock Notification Request</h2>
            <p style="margin: 0; color: #666;">A customer has requested to be notified when a product is back in stock.</p>
          </div>

          <div style="margin-bottom: 30px;">
            <h3 style="color: #333; border-bottom: 2px solid #000; padding-bottom: 8px;">Customer Details</h3>
            <p><strong>Name:</strong> ${firstName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Product:</strong> ${product}</p>
            <p><strong>Expected Restock:</strong> ${restockDate}</p>
          </div>

          <div style="background: #000; color: white; padding: 20px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0 0 10px 0;">Action Required</h3>
            <p style="margin: 0;">Add this customer to the ${product} restock notification list.</p>
          </div>
        </body>
        </html>
      `;

      // Send to admin emails
      const adminEmails = ['dn@thefourths.com', 'ms@thefourths.com'];
      
      console.log('📧 Sending restock notification to admins:', adminEmails);
      for (const adminEmail of adminEmails) {
        try {
          const adminResult = await resend.emails.send({
            from: this.FROM_EMAIL,
            to: adminEmail,
            subject: `🔔 Restock Notification Request: ${product} - ${firstName}`,
            html: adminHtml,
          });
          console.log(`📧 Admin restock email sent to ${adminEmail}:`, adminResult);
        } catch (error) {
          console.error(`❌ Failed to send admin restock email to ${adminEmail}:`, error);
        }
        
        // Add delay to avoid rate limiting
        await this.sleep(600);
      }

      // Customer confirmation HTML
      const customerHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Restock Notification Confirmed - Healios</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white;">
            <!-- Header -->
            <div style="padding: 40px 40px 20px 40px; text-align: left;">
              <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px;">
                RESTOCK NOTIFICATION
              </div>
              
              <h1 style="color: #000; font-size: 28px; font-weight: 400; line-height: 1.3; margin: 0 0 20px 0;">
                You're on the list, ${firstName}! We'll notify you as soon as ${product} is back in stock.
              </h1>
            </div>

            <!-- Product Stats Grid -->
            <div style="padding: 0 40px; margin-bottom: 40px;">
              <div style="display: table; width: 100%; border-collapse: collapse;">
                <div style="display: table-row;">
                  <div style="display: table-cell; width: 25%; padding: 20px 10px; text-align: left; vertical-align: top;">
                    <div style="font-size: 24px; font-weight: 400; color: #000; margin-bottom: 8px;">${product}</div>
                    <div style="font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px; line-height: 1.4;">PRODUCT<br>REQUESTED</div>
                  </div>
                  <div style="display: table-cell; width: 25%; padding: 20px 10px; text-align: left; vertical-align: top;">
                    <div style="font-size: 24px; font-weight: 400; color: #000; margin-bottom: 8px;">${restockDate}</div>
                    <div style="font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px; line-height: 1.4;">EXPECTED<br>RESTOCK</div>
                  </div>
                  <div style="display: table-cell; width: 25%; padding: 20px 10px; text-align: left; vertical-align: top;">
                    <div style="font-size: 24px; font-weight: 400; color: #000; margin-bottom: 8px;">${email}</div>
                    <div style="font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px; line-height: 1.4;">NOTIFICATION<br>EMAIL</div>
                  </div>
                  <div style="display: table-cell; width: 25%; padding: 20px 10px; text-align: left; vertical-align: top;">
                    <div style="font-size: 24px; font-weight: 400; color: #000; margin-bottom: 8px;">Instant</div>
                    <div style="font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px; line-height: 1.4;">EMAIL<br>ALERT</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- CTA Buttons -->
            <div style="padding: 0 40px 60px 40px;">
              <div style="margin-bottom: 20px;">
                <a href="https://healios.com/products" style="display: inline-block; background-color: #000; color: white; padding: 16px 32px; text-decoration: none; font-size: 14px; font-weight: 500; margin-right: 15px;">Shop Healios supplements →</a>
                <a href="https://healios.com/science" style="display: inline-block; background-color: #000; color: white; padding: 16px 32px; text-decoration: none; font-size: 14px; font-weight: 500;">Learn about our science →</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      // Send confirmation to customer
      console.log('📧 Sending restock confirmation email to customer:', email);
      try {
        const customerResult = await resend.emails.send({
          from: this.FROM_EMAIL,
          to: email,
          subject: `You're on the list! ${product} Restock Notification - Healios`,
          html: customerHtml,
        });
        console.log('📧 Customer restock email sent:', customerResult);
        
        if (customerResult.error) {
          console.error('❌ Error sending customer restock email:', customerResult.error);
          return false;
        }
      } catch (error) {
        console.error('❌ Failed to send customer restock email:', error);
        return false;
      }

      console.log('✅ All restock notification emails sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending restock notification emails:', error);
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


}