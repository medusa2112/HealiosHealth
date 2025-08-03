import { Resend } from 'resend';
import type { PreOrder, Newsletter } from '@shared/schema';
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
  private static readonly ADMIN_EMAILS = ['dn@thefourths.com', 'ms@thefourths.com'];

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
            <!-- Logo Header -->
            <div style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 1px solid #f0f0f0;">
              <img src="${process.env.REPLIT_DOMAINS || 'http://localhost:5000'}/assets/Healios Logo_1754209950893.png" alt="Healios" style="height: 32px; width: auto;" />
            </div>
            
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
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white;">
            <!-- Logo Header -->
            <div style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 1px solid #f0f0f0;">
              <img src="${process.env.REPLIT_DOMAINS || 'http://localhost:5000'}/assets/Healios Logo_1754209950893.png" alt="Healios" style="height: 32px; width: auto;" />
            </div>
            
            <!-- Header -->
            <div style="padding: 40px 40px 20px 40px;">
              <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px;">
                NEW PRE-ORDER RECEIVED
              </div>
              
              <h1 style="color: #000; font-size: 24px; font-weight: 400; line-height: 1.3; margin: 0 0 20px 0;">
                ${preOrder.customerName} pre-ordered ${preOrder.productName}
              </h1>
              
              <p style="color: #666; font-size: 16px; line-height: 1.5; margin: 0;">
                A customer has placed a pre-order for an out-of-stock product.
              </p>
            </div>

            <!-- Customer Details -->
            <div style="padding: 0 40px; margin-bottom: 30px;">
              <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px;">
                CUSTOMER DETAILS
              </div>
              
              <div style="border: 1px solid #eee; padding: 30px;">
                <div style="display: table; width: 100%;">
                  <div style="display: table-row;">
                    <div style="display: table-cell; padding: 8px 0; color: #666; font-size: 14px; width: 120px;">Name</div>
                    <div style="display: table-cell; padding: 8px 0; color: #000; font-weight: 500;">${preOrder.customerName}</div>
                  </div>
                  <div style="display: table-row;">
                    <div style="display: table-cell; padding: 8px 0; color: #666; font-size: 14px;">Email</div>
                    <div style="display: table-cell; padding: 8px 0;"><a href="mailto:${preOrder.customerEmail}" style="color: #000; text-decoration: none;">${preOrder.customerEmail}</a></div>
                  </div>
                  ${preOrder.customerPhone ? `
                  <div style="display: table-row;">
                    <div style="display: table-cell; padding: 8px 0; color: #666; font-size: 14px;">Phone</div>
                    <div style="display: table-cell; padding: 8px 0;"><a href="tel:${preOrder.customerPhone}" style="color: #000; text-decoration: none;">${preOrder.customerPhone}</a></div>
                  </div>` : ''}
                  <div style="display: table-row;">
                    <div style="display: table-cell; padding: 8px 0; color: #666; font-size: 14px;">Pre-Order Date</div>
                    <div style="display: table-cell; padding: 8px 0; color: #000;">${new Date(preOrder.createdAt || Date.now()).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Product Information -->
            <div style="padding: 0 40px; margin-bottom: 30px;">
              <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px;">
                PRODUCT INFORMATION
              </div>
              
              <div style="border: 1px solid #eee; padding: 30px;">
                <div style="display: table; width: 100%;">
                  <div style="display: table-row;">
                    <div style="display: table-cell; padding: 8px 0; color: #666; font-size: 14px; width: 120px;">Product</div>
                    <div style="display: table-cell; padding: 8px 0; color: #000; font-weight: 500;">${preOrder.productName}</div>
                  </div>
                  <div style="display: table-row;">
                    <div style="display: table-cell; padding: 8px 0; color: #666; font-size: 14px;">Price</div>
                    <div style="display: table-cell; padding: 8px 0; color: #000;">R${preOrder.productPrice}</div>
                  </div>
                  <div style="display: table-row;">
                    <div style="display: table-cell; padding: 8px 0; color: #666; font-size: 14px;">Quantity</div>
                    <div style="display: table-cell; padding: 8px 0; color: #000;">${preOrder.quantity}</div>
                  </div>
                  <div style="display: table-row;">
                    <div style="display: table-cell; padding: 8px 0; color: #666; font-size: 14px;">Total Value</div>
                    <div style="display: table-cell; padding: 8px 0; color: #000; font-weight: 500;">R${(parseFloat(preOrder.productPrice) * (preOrder.quantity || 1)).toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </div>

            ${preOrder.notes ? `
            <!-- Customer Notes -->
            <div style="padding: 0 40px; margin-bottom: 30px;">
              <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px;">
                CUSTOMER NOTES
              </div>
              <div style="border: 1px solid #eee; padding: 20px; font-family: monospace; font-size: 14px; line-height: 1.6; color: #000; white-space: pre-line;">${preOrder.notes}</div>
            </div>` : ''}

            <!-- Action Required -->
            <div style="padding: 0 40px; margin-bottom: 30px;">
              <div style="background: #000; color: white; padding: 20px; text-align: center;">
                <div style="color: white; font-size: 14px; font-weight: 500; margin-bottom: 8px;">ACTION REQUIRED</div>
                <div style="color: #ccc; font-size: 14px;">Add this customer to the pre-order waiting list and notify them when stock arrives</div>
              </div>
            </div>

            <!-- Footer -->
            <div style="padding: 0 40px 40px 40px;">
              <div style="border-top: 1px solid #eee; padding-top: 20px;">
                <p style="color: #666; font-size: 12px; margin: 0;">
                  Pre-Order ID: ${preOrder.id}
                </p>
              </div>
            </div>
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
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white;">
            <!-- Logo Header -->
            <div style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 1px solid #f0f0f0;">
              <img src="${process.env.REPLIT_DOMAINS || 'http://localhost:5000'}/assets/Healios Logo_1754209950893.png" alt="Healios" style="height: 32px; width: auto;" />
            </div>
            
            <!-- Header -->
            <div style="padding: 40px 40px 20px 40px;">
              <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px;">
                RESTOCK NOTIFICATION REQUEST
              </div>
              
              <h1 style="color: #000; font-size: 24px; font-weight: 400; line-height: 1.3; margin: 0 0 20px 0;">
                ${firstName} wants to be notified about ${product}
              </h1>
              
              <p style="color: #666; font-size: 16px; line-height: 1.5; margin: 0;">
                A customer has requested to be notified when this product is back in stock.
              </p>
            </div>

            <!-- Request Details -->
            <div style="padding: 0 40px; margin-bottom: 30px;">
              <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px;">
                REQUEST DETAILS
              </div>
              
              <div style="border: 1px solid #eee; padding: 30px;">
                <div style="display: table; width: 100%;">
                  <div style="display: table-row;">
                    <div style="display: table-cell; padding: 8px 0; color: #666; font-size: 14px; width: 140px;">Customer Name</div>
                    <div style="display: table-cell; padding: 8px 0; color: #000; font-weight: 500;">${firstName}</div>
                  </div>
                  <div style="display: table-row;">
                    <div style="display: table-cell; padding: 8px 0; color: #666; font-size: 14px;">Email Address</div>
                    <div style="display: table-cell; padding: 8px 0; color: #000;">${email}</div>
                  </div>
                  <div style="display: table-row;">
                    <div style="display: table-cell; padding: 8px 0; color: #666; font-size: 14px;">Product Requested</div>
                    <div style="display: table-cell; padding: 8px 0; color: #000; font-weight: 500;">${product}</div>
                  </div>
                  <div style="display: table-row;">
                    <div style="display: table-cell; padding: 8px 0; color: #666; font-size: 14px;">Expected Restock</div>
                    <div style="display: table-cell; padding: 8px 0; color: #000;">${restockDate}</div>
                  </div>
                  <div style="display: table-row;">
                    <div style="display: table-cell; padding: 8px 0; color: #666; font-size: 14px;">Request Date</div>
                    <div style="display: table-cell; padding: 8px 0; color: #000;">${new Date().toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Required -->
            <div style="padding: 0 40px 40px 40px;">
              <div style="background: #000; color: white; padding: 20px; text-align: center;">
                <div style="color: white; font-size: 14px; font-weight: 500; margin-bottom: 8px;">ACTION REQUIRED</div>
                <div style="color: #ccc; font-size: 14px;">Add this customer to the ${product} restock notification list</div>
              </div>
            </div>
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
            <!-- Logo Header -->
            <div style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 1px solid #f0f0f0;">
              <img src="${process.env.REPLIT_DOMAINS || 'http://localhost:5000'}/assets/Healios Logo_1754209950893.png" alt="Healios" style="height: 32px; width: auto;" />
            </div>
            
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
        <head>
          <meta charset="utf-8">
          <title>New Order - Healios</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white;">
            <!-- Logo Header -->
            <div style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 1px solid #f0f0f0;">
              <img src="${process.env.REPLIT_DOMAINS || 'http://localhost:5000'}/assets/Healios Logo_1754209950893.png" alt="Healios" style="height: 32px; width: auto;" />
            </div>
            
            <!-- Header -->
            <div style="padding: 40px 40px 20px 40px;">
              <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px;">
                NEW ORDER RECEIVED
              </div>
              
              <h1 style="color: #000; font-size: 24px; font-weight: 400; line-height: 1.3; margin: 0 0 20px 0;">
                Order #${order.id.slice(-8)} - R${order.totalAmount}
              </h1>
              
              <p style="color: #666; font-size: 16px; line-height: 1.5; margin: 0;">
                Customer: ${order.customerEmail}
              </p>
            </div>

            <!-- Order Details -->
            <div style="padding: 0 40px; margin-bottom: 30px;">
              <div style="border: 1px solid #eee; padding: 30px;">
                <div style="display: table; width: 100%;">
                  <div style="display: table-row;">
                    <div style="display: table-cell; padding: 8px 0; color: #666; font-size: 14px; width: 120px;">Order Date</div>
                    <div style="display: table-cell; padding: 8px 0; color: #000;">${new Date(order.createdAt || Date.now()).toLocaleString()}</div>
                  </div>
                  <div style="display: table-row;">
                    <div style="display: table-cell; padding: 8px 0; color: #666; font-size: 14px;">Customer</div>
                    <div style="display: table-cell; padding: 8px 0; color: #000;">${order.customerName || 'N/A'}</div>
                  </div>
                  <div style="display: table-row;">
                    <div style="display: table-cell; padding: 8px 0; color: #666; font-size: 14px;">Phone</div>
                    <div style="display: table-cell; padding: 8px 0; color: #000;">${order.customerPhone || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Items Ordered -->
            <div style="padding: 0 40px; margin-bottom: 30px;">
              <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px;">
                ITEMS ORDERED
              </div>
              <div style="border: 1px solid #eee; padding: 20px; font-family: monospace; font-size: 14px; line-height: 1.8; color: #000; white-space: pre-line;">${orderItemsList}</div>
            </div>

            <!-- Shipping Address -->
            <div style="padding: 0 40px; margin-bottom: 30px;">
              <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px;">
                SHIPPING ADDRESS
              </div>
              <div style="border: 1px solid #eee; padding: 20px; font-family: monospace; font-size: 14px; line-height: 1.6; color: #000; white-space: pre-line;">${order.shippingAddress}</div>
            </div>

            <!-- Action Required -->
            <div style="padding: 0 40px 40px 40px;">
              <div style="background: #000; color: white; padding: 20px; text-align: center;">
                <div style="color: white; font-size: 14px; font-weight: 500; margin-bottom: 8px;">ACTION REQUIRED</div>
                <div style="color: #ccc; font-size: 14px;">Process this order and update stock levels</div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      await resend.emails.send({
        from: this.FROM_EMAIL,
        to: this.ADMIN_EMAILS,
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
        <head>
          <meta charset="utf-8">
          <title>Low Stock Alert - Healios</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white;">
            <!-- Logo Header -->
            <div style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 1px solid #f0f0f0;">
              <img src="${process.env.REPLIT_DOMAINS || 'http://localhost:5000'}/assets/Healios Logo_1754209950893.png" alt="Healios" style="height: 32px; width: auto;" />
            </div>
            
            <!-- Header -->
            <div style="padding: 40px 40px 20px 40px;">
              <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px;">
                LOW STOCK ALERT
              </div>
              
              <h1 style="color: #000; font-size: 24px; font-weight: 400; line-height: 1.3; margin: 0 0 20px 0;">
                ${productName} is running low
              </h1>
              
              <p style="color: #666; font-size: 16px; line-height: 1.5; margin: 0;">
                Immediate attention required to prevent stockouts.
              </p>
            </div>

            <!-- Stock Details -->
            <div style="padding: 0 40px; margin-bottom: 30px;">
              <div style="border: 1px solid #eee; padding: 30px;">
                <div style="display: table; width: 100%;">
                  <div style="display: table-row;">
                    <div style="display: table-cell; padding: 8px 0; color: #666; font-size: 14px; width: 140px;">Product</div>
                    <div style="display: table-cell; padding: 8px 0; color: #000; font-weight: 500;">${productName}</div>
                  </div>
                  <div style="display: table-row;">
                    <div style="display: table-cell; padding: 8px 0; color: #666; font-size: 14px;">Current Stock</div>
                    <div style="display: table-cell; padding: 8px 0; color: #000; font-weight: 500;">${currentStock} units remaining</div>
                  </div>
                  <div style="display: table-row;">
                    <div style="display: table-cell; padding: 8px 0; color: #666; font-size: 14px;">Product ID</div>
                    <div style="display: table-cell; padding: 8px 0; color: #000;">${productId}</div>
                  </div>
                  <div style="display: table-row;">
                    <div style="display: table-cell; padding: 8px 0; color: #666; font-size: 14px;">Alert Date</div>
                    <div style="display: table-cell; padding: 8px 0; color: #000;">${new Date().toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Required -->
            <div style="padding: 0 40px; margin-bottom: 30px;">
              <div style="background: #000; color: white; padding: 20px; text-align: center;">
                <div style="color: white; font-size: 14px; font-weight: 500; margin-bottom: 8px;">ACTION REQUIRED</div>
                <div style="color: #ccc; font-size: 14px;">Restock this product to avoid stockouts</div>
              </div>
            </div>

            <!-- Footer -->
            <div style="padding: 0 40px 40px 40px;">
              <div style="border-top: 1px solid #eee; padding-top: 20px;">
                <p style="color: #666; font-size: 12px; margin: 0;">
                  This alert was sent automatically when stock fell below the threshold of 3 units.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      await resend.emails.send({
        from: this.FROM_EMAIL,
        to: this.ADMIN_EMAILS,
        subject: `Low Stock Alert: ${productName} (${currentStock} remaining)`,
        html,
      });

      return true;
    } catch (error) {
      console.error('Failed to send low stock alert:', error);
      return false;
    }
  }

  static async sendNewsletterConfirmation(newsletter: Newsletter): Promise<boolean> {
    try {
      // Send confirmation to subscriber
      await resend.emails.send({
        from: this.FROM_EMAIL,
        to: newsletter.email,
        subject: 'Welcome to the Healios Community!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Welcome to Healios</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white;">
              <!-- Logo Header -->
              <div style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 1px solid #f0f0f0;">
                <img src="${process.env.REPLIT_DOMAINS || 'http://localhost:5000'}/assets/Healios Logo_1754209950893.png" alt="Healios" style="height: 32px; width: auto;" />
              </div>
              
              <!-- Header -->
              <div style="padding: 40px 40px 20px 40px; text-align: left;">
                <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px;">
                  WELCOME TO HEALIOS
                </div>
                
                <h1 style="color: #000; font-size: 28px; font-weight: 400; line-height: 1.3; margin: 0 0 20px 0;">
                  Hi ${newsletter.firstName}, welcome to our wellness community.
                </h1>
                
                <p style="color: #666; font-size: 16px; line-height: 1.5; margin: 0;">
                  Thank you for joining Healios. You're now part of a community dedicated to premium, science-backed nutrition.
                </p>
              </div>

              <!-- Benefits Section -->
              <div style="padding: 0 40px; margin-bottom: 40px;">
                <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px;">
                  WHAT TO EXPECT
                </div>
                
                <div style="border-left: 2px solid #000; padding-left: 20px; margin-bottom: 30px;">
                  <div style="margin-bottom: 16px;">
                    <div style="color: #000; font-weight: 500; margin-bottom: 4px;">Exclusive wellness insights</div>
                    <div style="color: #666; font-size: 14px;">Evidence-based nutrition tips and health guidance</div>
                  </div>
                  <div style="margin-bottom: 16px;">
                    <div style="color: #000; font-weight: 500; margin-bottom: 4px;">Early product access</div>
                    <div style="color: #666; font-size: 14px;">Be first to discover new supplements and formulations</div>
                  </div>
                  <div style="margin-bottom: 16px;">
                    <div style="color: #000; font-weight: 500; margin-bottom: 4px;">Member-only offers</div>
                    <div style="color: #666; font-size: 14px;">Special pricing and exclusive promotions</div>
                  </div>
                  <div>
                    <div style="color: #000; font-weight: 500; margin-bottom: 4px;">Personalized recommendations</div>
                    <div style="color: #666; font-size: 14px;">Tailored wellness suggestions and birthday offers</div>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div style="padding: 0 40px 40px 40px; text-align: center;">
                <div style="border-top: 1px solid #eee; padding-top: 20px;">
                  <p style="color: #666; font-size: 14px; margin: 0;">
                    Thank you for choosing Healios for your wellness journey.
                  </p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      });

      // Send notification to admin emails
      await resend.emails.send({
        from: this.FROM_EMAIL,
        to: this.ADMIN_EMAILS,
        subject: 'New Newsletter Subscription',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>New Newsletter Subscriber</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white;">
              <!-- Header -->
              <div style="padding: 40px 40px 20px 40px;">
                <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px;">
                  NEW NEWSLETTER SUBSCRIPTION
                </div>
                
                <h1 style="color: #000; font-size: 24px; font-weight: 400; line-height: 1.3; margin: 0 0 30px 0;">
                  ${newsletter.firstName} ${newsletter.lastName} joined the community
                </h1>
              </div>

              <!-- Details -->
              <div style="padding: 0 40px; margin-bottom: 40px;">
                <div style="border: 1px solid #eee; padding: 30px;">
                  <div style="display: table; width: 100%;">
                    <div style="display: table-row;">
                      <div style="display: table-cell; padding: 8px 0; color: #666; font-size: 14px; width: 120px;">Email</div>
                      <div style="display: table-cell; padding: 8px 0; color: #000; font-weight: 500;">${newsletter.email}</div>
                    </div>
                    <div style="display: table-row;">
                      <div style="display: table-cell; padding: 8px 0; color: #666; font-size: 14px;">Birthday</div>
                      <div style="display: table-cell; padding: 8px 0; color: #000;">${newsletter.birthday || 'Not provided'}</div>
                    </div>
                    <div style="display: table-row;">
                      <div style="display: table-cell; padding: 8px 0; color: #666; font-size: 14px;">Subscribed</div>
                      <div style="display: table-cell; padding: 8px 0; color: #000;">${new Date(newsletter.subscribedAt || Date.now()).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      });

      console.log('✅ Newsletter confirmation emails sent successfully');
      return true;
    } catch (error) {
      console.error('Failed to send newsletter confirmation:', error);
      return false;
    }
  }

}