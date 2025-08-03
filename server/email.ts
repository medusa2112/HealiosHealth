import { Resend } from 'resend';
import type { PreOrder, Newsletter, QuizResult, Product } from '@shared/schema';
import { type Order } from '@shared/schema';
import { QuizRecommendationService } from './quiz-service';
import { storage } from './storage';

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

interface ProductRecommendation {
  productId: string;
  productName: string;
  reason: string;
  medicalBasis: string;
  researchCitations: string[];
  priority: number;
}

interface EnhancedProductRecommendation extends ProductRecommendation {
  product?: Product;
}

interface QuizRecommendations {
  primaryRecommendations: ProductRecommendation[];
  secondaryRecommendations: ProductRecommendation[];
  personalizedMessage: string;
}

interface EnhancedQuizRecommendations {
  primaryRecommendations: EnhancedProductRecommendation[];
  secondaryRecommendations: EnhancedProductRecommendation[];
  personalizedMessage: string;
  cartUrl: string;
}

export class EmailService {
  private static readonly FROM_EMAIL = 'dn@thefourths.com';
  private static readonly ADMIN_EMAILS = ['dn@thefourths.com', 'ms@thefourths.com'];
  private static readonly BASE_URL = process.env.NODE_ENV === 'production' ? 'https://healios.com' : 'http://localhost:5000';

  private static async enhanceRecommendationsWithProductData(
    recommendations: QuizRecommendations
  ): Promise<EnhancedQuizRecommendations> {
    // Fetch product data for all recommendations
    const allProductIds = [
      ...recommendations.primaryRecommendations.map(r => r.productId),
      ...recommendations.secondaryRecommendations.map(r => r.productId)
    ];

    const productDataMap = new Map<string, Product>();
    for (const productId of allProductIds) {
      try {
        const product = await storage.getProductById(productId);
        if (product) {
          productDataMap.set(productId, product);
        }
      } catch (error) {
        console.error(`Failed to fetch product data for ${productId}:`, error);
      }
    }

    // Enhance recommendations with product data
    const enhancedPrimary = recommendations.primaryRecommendations.map(rec => ({
      ...rec,
      product: productDataMap.get(rec.productId)
    }));

    const enhancedSecondary = recommendations.secondaryRecommendations.map(rec => ({
      ...rec,
      product: productDataMap.get(rec.productId)
    }));

    // Generate cart URL with all primary recommendations
    const cartItems = enhancedPrimary
      .filter(rec => rec.product)
      .map(rec => `${rec.productId}:1`)
      .join(',');
    
    const cartUrl = `${this.BASE_URL}/cart?items=${encodeURIComponent(cartItems)}`;

    return {
      primaryRecommendations: enhancedPrimary,
      secondaryRecommendations: enhancedSecondary,
      personalizedMessage: recommendations.personalizedMessage,
      cartUrl
    };
  }

  static async sendNewsletterConfirmation(newsletter: Newsletter): Promise<boolean> {
    try {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to Healios</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; background-color: #ffffff; color: #000;">
          <div style="max-width: 600px; margin: 0 auto;">
            <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 30px;">
              WELCOME TO HEALIOS
            </div>
            
            <h1 style="font-size: 32px; font-weight: 400; line-height: 1.2; margin: 0 0 30px 0; color: #000;">
              Hi ${newsletter.firstName}, welcome to our wellness community.
            </h1>
            
            <p style="font-size: 16px; line-height: 1.6; color: #666; margin: 0 0 40px 0;">
              Thank you for joining Healios. You're now part of a community dedicated to premium, science-backed nutrition.
            </p>
            
            <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 30px;">
              WHAT TO EXPECT
            </div>
            
            <div style="border-left: 2px solid #000; padding-left: 30px; margin-bottom: 40px;">
              <div style="margin-bottom: 25px;">
                <div style="font-weight: 600; margin-bottom: 8px; color: #000;">Exclusive wellness insights</div>
                <div style="color: #666; line-height: 1.5;">Evidence-based nutrition tips and health guidance</div>
              </div>
              
              <div style="margin-bottom: 25px;">
                <div style="font-weight: 600; margin-bottom: 8px; color: #000;">Early product access</div>
                <div style="color: #666; line-height: 1.5;">Be first to discover new supplements and formulations</div>
              </div>
              
              <div style="margin-bottom: 25px;">
                <div style="font-weight: 600; margin-bottom: 8px; color: #000;">Member-only offers</div>
                <div style="color: #666; line-height: 1.5;">Special pricing and exclusive promotions</div>
              </div>
              
              <div>
                <div style="font-weight: 600; margin-bottom: 8px; color: #000;">Personalized recommendations</div>
                <div style="color: #666; line-height: 1.5;">Tailored wellness suggestions and birthday offers</div>
              </div>
            </div>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0; text-align: center;">
              Thank you for choosing Healios for your wellness journey.
            </p>
          </div>
        </body>
        </html>
      `;

      await resend.emails.send({
        from: this.FROM_EMAIL,
        to: newsletter.email,
        subject: 'Welcome to the Healios Community!',
        html,
      });

      return true;
    } catch (error) {
      console.error('Failed to send newsletter confirmation email:', error);
      return false;
    }
  }

  static async sendOrderConfirmation(emailData: OrderEmailData): Promise<boolean> {
    try {
      const { order, orderItems } = emailData;

      const itemsList = orderItems.map(item => `
        <div style="padding: 12px 0; border-bottom: 1px solid #eee;">
          <div style="font-weight: 600; margin-bottom: 4px; color: #000;">${item.product.name}</div>
          <div style="color: #666; font-size: 14px;">Qty: ${item.quantity} × R${item.product.price} = R${(parseFloat(item.product.price) * item.quantity).toFixed(2)}</div>
        </div>
      `).join('');

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Order Confirmation - Healios</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; background-color: #ffffff; color: #000;">
          <div style="max-width: 600px; margin: 0 auto;">
            <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 30px;">
              ORDER CONFIRMATION
            </div>
            
            <h1 style="font-size: 32px; font-weight: 400; line-height: 1.2; margin: 0 0 30px 0; color: #000;">
              Hi ${order.customerName || 'there'}, your order has been confirmed.
            </h1>
            
            <p style="font-size: 16px; line-height: 1.6; color: #666; margin: 0 0 40px 0;">
              Thank you for your order. Your supplements will be processed within 1-2 business days and shipped to ${order.shippingAddress}.
            </p>
            
            <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 30px;">
              ORDER DETAILS
            </div>
            
            <div style="border-left: 2px solid #000; padding-left: 30px; margin-bottom: 40px;">
              <div style="margin-bottom: 20px;">
                <div style="font-weight: 600; margin-bottom: 8px; color: #000;">Order #${order.id.slice(-8)}</div>
                <div style="color: #666; line-height: 1.5;">Order Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString()}</div>
              </div>
              
              <div style="margin-bottom: 20px;">
                <div style="font-weight: 600; margin-bottom: 8px; color: #000;">Total Amount</div>
                <div style="color: #666; line-height: 1.5;">R${order.totalAmount}</div>
              </div>
              
              <div>
                <div style="font-weight: 600; margin-bottom: 12px; color: #000;">Items Ordered</div>
                ${itemsList}
              </div>
            </div>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0; text-align: center;">
              Thank you for choosing Healios for your wellness journey.
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

  private static async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async sendPreOrderNotification(preOrder: PreOrder): Promise<boolean> {
    console.log('📧 Starting pre-order email notification process for:', preOrder.customerEmail);
    try {
      // Admin notification
      const adminHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>New Pre-Order - Healios</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; background-color: #ffffff; color: #000;">
          <div style="max-width: 600px; margin: 0 auto;">
            <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 30px;">
              NEW PRE-ORDER RECEIVED
            </div>
            
            <h1 style="font-size: 32px; font-weight: 400; line-height: 1.2; margin: 0 0 30px 0; color: #000;">
              ${preOrder.customerName} pre-ordered ${preOrder.productName}.
            </h1>
            
            <p style="font-size: 16px; line-height: 1.6; color: #666; margin: 0 0 40px 0;">
              A customer has placed a pre-order for an out-of-stock product. Please add them to the waiting list.
            </p>
            
            <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 30px;">
              CUSTOMER DETAILS
            </div>
            
            <div style="border-left: 2px solid #000; padding-left: 30px; margin-bottom: 40px;">
              <div style="margin-bottom: 20px;">
                <div style="font-weight: 600; margin-bottom: 8px; color: #000;">Customer Name</div>
                <div style="color: #666; line-height: 1.5;">${preOrder.customerName}</div>
              </div>
              
              <div style="margin-bottom: 20px;">
                <div style="font-weight: 600; margin-bottom: 8px; color: #000;">Email Address</div>
                <div style="color: #666; line-height: 1.5;">${preOrder.customerEmail}</div>
              </div>
              
              ${preOrder.customerPhone ? `
              <div style="margin-bottom: 20px;">
                <div style="font-weight: 600; margin-bottom: 8px; color: #000;">Phone Number</div>
                <div style="color: #666; line-height: 1.5;">${preOrder.customerPhone}</div>
              </div>
              ` : ''}
              
              <div style="margin-bottom: 20px;">
                <div style="font-weight: 600; margin-bottom: 8px; color: #000;">Product Requested</div>
                <div style="color: #666; line-height: 1.5;">${preOrder.productName}</div>
              </div>
              
              <div style="margin-bottom: 20px;">
                <div style="font-weight: 600; margin-bottom: 8px; color: #000;">Quantity</div>
                <div style="color: #666; line-height: 1.5;">${preOrder.quantity}</div>
              </div>
              
              <div>
                <div style="font-weight: 600; margin-bottom: 8px; color: #000;">Total Value</div>
                <div style="color: #666; line-height: 1.5;">R${(parseFloat(preOrder.productPrice) * (preOrder.quantity || 1)).toFixed(2)}</div>
              </div>
            </div>
            
            ${preOrder.notes ? `
            <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px;">
              CUSTOMER NOTES
            </div>
            <div style="background: #f5f5f5; padding: 20px; margin-bottom: 40px; border-left: 2px solid #000;">
              <div style="color: #000; line-height: 1.6; white-space: pre-line;">${preOrder.notes}</div>
            </div>
            ` : ''}
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0; text-align: center;">
              Action required: Add customer to pre-order waiting list.
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
        } catch (error) {
          console.error(`❌ Failed to send admin email to ${adminEmail}:`, error);
        }
        
        // Add delay to avoid rate limiting
        await this.sleep(600);
      }

      // Customer confirmation
      const customerHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Pre-Order Confirmation - Healios</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; background-color: #ffffff; color: #000;">
          <div style="max-width: 600px; margin: 0 auto;">
            <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 30px;">
              PRE-ORDER CONFIRMATION
            </div>
            
            <h1 style="font-size: 32px; font-weight: 400; line-height: 1.2; margin: 0 0 30px 0; color: #000;">
              Hi ${preOrder.customerName}, your pre-order has been confirmed.
            </h1>
            
            <p style="font-size: 16px; line-height: 1.6; color: #666; margin: 0 0 40px 0;">
              Thank you for your pre-order for ${preOrder.productName}. We'll notify you as soon as it's back in stock.
            </p>
            
            <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 30px;">
              WHAT TO EXPECT
            </div>
            
            <div style="border-left: 2px solid #000; padding-left: 30px; margin-bottom: 40px;">
              <div style="margin-bottom: 25px;">
                <div style="font-weight: 600; margin-bottom: 8px; color: #000;">Priority notification</div>
                <div style="color: #666; line-height: 1.5;">You'll be first to know when ${preOrder.productName} is available</div>
              </div>
              
              <div style="margin-bottom: 25px;">
                <div style="font-weight: 600; margin-bottom: 8px; color: #000;">No payment required</div>
                <div style="color: #666; line-height: 1.5;">We'll only charge you when the product ships</div>
              </div>
              
              <div style="margin-bottom: 25px;">
                <div style="font-weight: 600; margin-bottom: 8px; color: #000;">Expected availability</div>
                <div style="color: #666; line-height: 1.5;">We expect ${preOrder.productName} to be available within 2-4 weeks</div>
              </div>
              
              <div>
                <div style="font-weight: 600; margin-bottom: 8px; color: #000;">Your pre-order price</div>
                <div style="color: #666; line-height: 1.5;">R${preOrder.productPrice} per item (${preOrder.quantity} requested)</div>
              </div>
            </div>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0; text-align: center;">
              Thank you for choosing Healios for your wellness journey.
            </p>
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

      // Admin notification
      const adminHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Restock Notification Request - Healios</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; background-color: #ffffff; color: #000;">
          <div style="max-width: 600px; margin: 0 auto;">
            <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 30px;">
              RESTOCK NOTIFICATION REQUEST
            </div>
            
            <h1 style="font-size: 32px; font-weight: 400; line-height: 1.2; margin: 0 0 30px 0; color: #000;">
              ${firstName} wants to be notified about ${product}.
            </h1>
            
            <p style="font-size: 16px; line-height: 1.6; color: #666; margin: 0 0 40px 0;">
              A customer has requested to be notified when this product is back in stock.
            </p>
            
            <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 30px;">
              REQUEST DETAILS
            </div>
            
            <div style="border-left: 2px solid #000; padding-left: 30px; margin-bottom: 40px;">
              <div style="margin-bottom: 20px;">
                <div style="font-weight: 600; margin-bottom: 8px; color: #000;">Customer Name</div>
                <div style="color: #666; line-height: 1.5;">${firstName}</div>
              </div>
              
              <div style="margin-bottom: 20px;">
                <div style="font-weight: 600; margin-bottom: 8px; color: #000;">Email Address</div>
                <div style="color: #666; line-height: 1.5;">${email}</div>
              </div>
              
              <div style="margin-bottom: 20px;">
                <div style="font-weight: 600; margin-bottom: 8px; color: #000;">Product Requested</div>
                <div style="color: #666; line-height: 1.5;">${product}</div>
              </div>
              
              <div>
                <div style="font-weight: 600; margin-bottom: 8px; color: #000;">Expected Restock</div>
                <div style="color: #666; line-height: 1.5;">${restockDate}</div>
              </div>
            </div>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0; text-align: center;">
              Action required: Add customer to restock notification list.
            </p>
          </div>
        </body>
        </html>
      `;

      // Customer confirmation
      const customerHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Restock Notification - Healios</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; background-color: #ffffff; color: #000;">
          <div style="max-width: 600px; margin: 0 auto;">
            <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 30px;">
              RESTOCK NOTIFICATION
            </div>
            
            <h1 style="font-size: 32px; font-weight: 400; line-height: 1.2; margin: 0 0 30px 0; color: #000;">
              Hi ${firstName}, we'll notify you when ${product} is available.
            </h1>
            
            <p style="font-size: 16px; line-height: 1.6; color: #666; margin: 0 0 40px 0;">
              Thank you for your interest in ${product}. We've added you to our notification list and will email you as soon as it's back in stock.
            </p>
            
            <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 30px;">
              WHAT TO EXPECT
            </div>
            
            <div style="border-left: 2px solid #000; padding-left: 30px; margin-bottom: 40px;">
              <div style="margin-bottom: 25px;">
                <div style="font-weight: 600; margin-bottom: 8px; color: #000;">Priority notification</div>
                <div style="color: #666; line-height: 1.5;">You'll be among the first to know when ${product} is available</div>
              </div>
              
              <div style="margin-bottom: 25px;">
                <div style="font-weight: 600; margin-bottom: 8px; color: #000;">Expected availability</div>
                <div style="color: #666; line-height: 1.5;">We expect ${product} to be available by ${restockDate}</div>
              </div>
              
              <div>
                <div style="font-weight: 600; margin-bottom: 8px; color: #000;">No obligation</div>
                <div style="color: #666; line-height: 1.5;">This is just a notification - you're not committed to purchase</div>
              </div>
            </div>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0; text-align: center;">
              Thank you for choosing Healios for your wellness journey.
            </p>
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
            subject: `📦 Restock Request: ${product} - ${firstName}`,
            html: adminHtml,
          });
          console.log(`📧 Admin restock email sent to ${adminEmail}:`, adminResult);
        } catch (error) {
          console.error(`❌ Failed to send admin restock email to ${adminEmail}:`, error);
        }
        
        await this.sleep(600);
      }

      // Send confirmation to customer
      try {
        const customerResult = await resend.emails.send({
          from: this.FROM_EMAIL,
          to: email,
          subject: `Restock Notification Set: ${product} - Healios`,
          html: customerHtml,
        });
        console.log('📧 Customer restock email sent:', customerResult);
      } catch (error) {
        console.error('❌ Failed to send customer restock email:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending restock notification emails:', error);
      return false;
    }
  }

  static async sendLowStockAlert(data: {
    productName: string;
    currentStock: number;
    threshold: number;
  }): Promise<boolean> {
    try {
      const { productName, currentStock, threshold } = data;

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Low Stock Alert - Healios</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; background-color: #ffffff; color: #000;">
          <div style="max-width: 600px; margin: 0 auto;">
            <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 30px;">
              LOW STOCK ALERT
            </div>
            
            <h1 style="font-size: 32px; font-weight: 400; line-height: 1.2; margin: 0 0 30px 0; color: #000;">
              ${productName} is running low on stock.
            </h1>
            
            <p style="font-size: 16px; line-height: 1.6; color: #666; margin: 0 0 40px 0;">
              Stock levels have dropped below the threshold. Please review and reorder if necessary.
            </p>
            
            <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 30px;">
              STOCK DETAILS
            </div>
            
            <div style="border-left: 2px solid #000; padding-left: 30px; margin-bottom: 40px;">
              <div style="margin-bottom: 20px;">
                <div style="font-weight: 600; margin-bottom: 8px; color: #000;">Product Name</div>
                <div style="color: #666; line-height: 1.5;">${productName}</div>
              </div>
              
              <div style="margin-bottom: 20px;">
                <div style="font-weight: 600; margin-bottom: 8px; color: #000;">Current Stock</div>
                <div style="color: #666; line-height: 1.5;">${currentStock} units</div>
              </div>
              
              <div>
                <div style="font-weight: 600; margin-bottom: 8px; color: #000;">Alert Threshold</div>
                <div style="color: #666; line-height: 1.5;">${threshold} units</div>
              </div>
            </div>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0; text-align: center;">
              Action required: Review stock levels and reorder if necessary.
            </p>
          </div>
        </body>
        </html>
      `;

      for (const adminEmail of this.ADMIN_EMAILS) {
        try {
          await resend.emails.send({
            from: this.FROM_EMAIL,
            to: adminEmail,
            subject: `⚠️ Low Stock Alert: ${productName}`,
            html,
          });
        } catch (error) {
          console.error(`Failed to send low stock alert to ${adminEmail}:`, error);
        }
        
        await this.sleep(600);
      }

      return true;
    } catch (error) {
      console.error('Error sending low stock alert:', error);
      return false;
    }
  }

  static async sendQuizRecommendations(
    quizResult: QuizResult, 
    recommendations: QuizRecommendations
  ): Promise<boolean> {
    try {
      // Enhance recommendations with product data and cart URL
      const enhancedRecommendations = await this.enhanceRecommendationsWithProductData(recommendations);
      
      // Send personalized recommendations to user
      const userEmailSuccess = await this.sendUserQuizRecommendations(quizResult, enhancedRecommendations);
      
      // Send admin notification to dn@thefourths.com
      const adminEmailSuccess = await this.sendQuizAdminNotification(quizResult, enhancedRecommendations);
      
      return userEmailSuccess && adminEmailSuccess;
    } catch (error) {
      console.error('Error sending quiz recommendation emails:', error);
      return false;
    }
  }

  private static async sendUserQuizRecommendations(
    quizResult: QuizResult,
    recommendations: EnhancedQuizRecommendations
  ): Promise<boolean> {
    try {
      const personalizedMessage = recommendations.personalizedMessage.replace('there', quizResult.firstName);
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Your Personalized Wellness Recommendations</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; background-color: #ffffff; color: #000;">
          <div style="max-width: 600px; margin: 0 auto;">
            <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 30px;">
              YOUR PERSONALIZED RECOMMENDATIONS
            </div>
            
            <h1 style="font-size: 32px; font-weight: 400; line-height: 1.2; margin: 0 0 30px 0; color: #000;">
              Hi ${quizResult.firstName}, here are your personalized supplement recommendations.
            </h1>
            
            <div style="font-size: 16px; line-height: 1.6; color: #666; margin: 0 0 40px 0; white-space: pre-line;">
              ${personalizedMessage}
            </div>
            
            <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 30px;">
              RECOMMENDED FOR YOU
            </div>
            
            ${recommendations.primaryRecommendations.map((rec, index) => `
              <div style="border-left: 4px solid #000; padding-left: 20px; margin-bottom: 40px;">
                ${rec.product ? `
                  <div style="margin-bottom: 20px;">
                    <img src="${this.BASE_URL}${rec.product.imageUrl}" alt="${rec.product.name}" style="width: 120px; height: 120px; object-fit: cover; border: 1px solid #eee;" />
                  </div>
                ` : ''}
                <h3 style="font-size: 18px; font-weight: 500; margin: 0 0 15px 0; color: #000;">
                  ${rec.productName}
                </h3>
                ${rec.product ? `
                  <div style="font-size: 14px; color: #666; margin-bottom: 15px;">
                    <strong>Price:</strong> R${rec.product.price}
                  </div>
                ` : ''}
                <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 15px 0;">
                  ${rec.reason}
                </p>
                <div style="background-color: #f8f9fa; padding: 15px; margin: 15px 0;">
                  <h4 style="font-size: 14px; font-weight: 500; margin: 0 0 10px 0; color: #666;">
                    RESEARCH BASIS
                  </h4>
                  <p style="font-size: 14px; line-height: 1.5; color: #666; margin: 0 0 10px 0;">
                    ${rec.medicalBasis}
                  </p>
                  <div style="font-size: 12px; color: #888;">
                    <strong>References:</strong><br>
                    ${rec.researchCitations.map(citation => `• <a href="${citation.split(' - ')[0]}" style="color: #666; text-decoration: underline;">${citation.split(' - ')[1] || 'View Study'}</a>`).join('<br>')}
                  </div>
                </div>
                <div style="margin-top: 20px;">
                  <a href="${this.BASE_URL}/products/${rec.productId}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: 500; font-size: 14px;">
                    View Product →
                  </a>
                </div>
              </div>
            `).join('')}
            
            ${recommendations.secondaryRecommendations.length > 0 ? `
              <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin: 50px 0 30px 0;">
                ADDITIONAL CONSIDERATIONS
              </div>
              ${recommendations.secondaryRecommendations.map(rec => `
                <div style="border-left: 2px solid #ccc; padding-left: 20px; margin-bottom: 30px;">
                  <h4 style="font-size: 16px; font-weight: 500; margin: 0 0 10px 0; color: #000;">
                    ${rec.productName}
                  </h4>
                  <p style="font-size: 14px; line-height: 1.5; color: #666; margin: 0 0 10px 0;">
                    ${rec.reason}
                  </p>
                  <a href="https://healios.com/products/${rec.productId}" style="color: #666; text-decoration: underline; font-size: 14px;">
                    Learn More →
                  </a>
                </div>
              `).join('')}
            ` : ''}
            
            <div style="border-top: 1px solid #eee; padding-top: 30px; margin-top: 50px;">
              <div style="background-color: #000; padding: 30px; text-align: center; margin-bottom: 30px;">
                <h3 style="font-size: 18px; font-weight: 500; margin: 0 0 15px 0; color: #fff;">
                  Ready to Start Your Wellness Journey?
                </h3>
                <p style="font-size: 14px; color: #ccc; margin: 0 0 20px 0;">
                  Add all your recommended supplements to your cart with one click.
                </p>
                <a href="${recommendations.cartUrl}" style="display: inline-block; background-color: #fff; color: #000; padding: 15px 30px; text-decoration: none; font-weight: 600; font-size: 16px; margin-bottom: 15px;">
                  🛒 Add All to Cart
                </a>
                <div style="font-size: 12px; color: #ccc;">
                  Convenient one-click shopping for your personalized recommendations
                </div>
              </div>
              
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
                <h3 style="font-size: 16px; font-weight: 500; margin: 0 0 10px 0; color: #000;">
                  Questions About These Recommendations?
                </h3>
                <p style="font-size: 14px; color: #666; margin: 0 0 15px 0;">
                  Our wellness team is here to help you make informed decisions about your health journey.
                </p>
                <a href="mailto:dn@thefourths.com" style="display: inline-block; border: 1px solid #000; color: #000; padding: 10px 20px; text-decoration: none; font-weight: 500; font-size: 14px;">
                  Contact Our Team
                </a>
              </div>
            </div>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888; text-align: center;">
              <p style="margin: 0;">
                <strong>Important:</strong> These recommendations are for educational purposes only and are not intended as medical advice. Always consult with your healthcare provider before starting any new supplement regimen, especially if you have existing health conditions or take medications.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      const result = await resend.emails.send({
        from: this.FROM_EMAIL,
        to: [quizResult.email],
        subject: `Your Personalized Wellness Recommendations from Healios`,
        html,
      });

      return result.error ? false : true;
    } catch (error) {
      console.error('Error sending user quiz recommendations:', error);
      return false;
    }
  }

  private static async sendQuizAdminNotification(
    quizResult: QuizResult,
    recommendations: EnhancedQuizRecommendations
  ): Promise<boolean> {
    try {
      const answers = JSON.parse(quizResult.answers);
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>New Quiz Completion - Admin Notification</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; background-color: #ffffff; color: #000;">
          <div style="max-width: 600px; margin: 0 auto;">
            <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 30px;">
              NEW QUIZ COMPLETION
            </div>
            
            <h1 style="font-size: 24px; font-weight: 400; line-height: 1.2; margin: 0 0 30px 0; color: #000;">
              Quiz completed by ${quizResult.firstName} ${quizResult.lastName}
            </h1>
            
            <div style="background-color: #f8f9fa; padding: 20px; margin-bottom: 30px;">
              <h3 style="font-size: 16px; font-weight: 500; margin: 0 0 15px 0; color: #000;">Customer Details</h3>
              <p style="font-size: 14px; line-height: 1.5; color: #666; margin: 0;">
                <strong>Name:</strong> ${quizResult.firstName} ${quizResult.lastName}<br>
                <strong>Email:</strong> ${quizResult.email}<br>
                <strong>Marketing Consent:</strong> ${quizResult.consentToMarketing ? 'Yes' : 'No'}<br>
                <strong>Completed:</strong> ${new Date(quizResult.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            
            <div style="border-left: 4px solid #000; padding-left: 20px; margin-bottom: 30px;">
              <h3 style="font-size: 16px; font-weight: 500; margin: 0 0 15px 0; color: #000;">Quiz Responses</h3>
              <div style="font-size: 14px; line-height: 1.6; color: #666;">
                <p><strong>Primary Health Goal:</strong> ${answers[1] || 'Not answered'}</p>
                <p><strong>Energy Level:</strong> ${answers[2] || 'Not answered'}</p>
                <p><strong>Areas to Improve:</strong> ${Array.isArray(answers[3]) ? answers[3].join(', ') : (answers[3] || 'Not answered')}</p>
                <p><strong>Current Supplements:</strong> ${answers[4] || 'Not answered'}</p>
                <p><strong>Age Range:</strong> ${answers[5] || 'Not answered'}</p>
                <p><strong>Dietary Restrictions:</strong> ${Array.isArray(answers[6]) ? answers[6].join(', ') : (answers[6] || 'Not answered')}</p>
              </div>
            </div>
            
            <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px;">
              RECOMMENDED PRODUCTS
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px;">
              <h4 style="font-size: 14px; font-weight: 500; margin: 0 0 15px 0; color: #000;">Primary Recommendations:</h4>
              ${recommendations.primaryRecommendations.map(rec => `
                <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
                  <strong style="color: #000;">${rec.productName}</strong><br>
                  <span style="font-size: 13px; color: #666;">${rec.reason}</span>
                </div>
              `).join('')}
              
              ${recommendations.secondaryRecommendations.length > 0 ? `
                <h4 style="font-size: 14px; font-weight: 500; margin: 20px 0 15px 0; color: #000;">Secondary Recommendations:</h4>
                ${recommendations.secondaryRecommendations.map(rec => `
                  <div style="margin-bottom: 10px;">
                    <strong style="color: #000;">${rec.productName}</strong><br>
                    <span style="font-size: 13px; color: #666;">${rec.reason}</span>
                  </div>
                `).join('')}
              ` : ''}
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888;">
              <p style="margin: 0;">This is an automated notification from the Healios wellness quiz system.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const result = await resend.emails.send({
        from: this.FROM_EMAIL,
        to: ['dn@thefourths.com'],
        subject: `New Quiz Completion: ${quizResult.firstName} ${quizResult.lastName}`,
        html,
      });

      return result.error ? false : true;
    } catch (error) {
      console.error('Error sending quiz admin notification:', error);
      return false;
    }
  }

  // Test email method
  static async sendTestEmails(): Promise<{ success: boolean; message: string }> {
    try {
      const testNewsletterData: Newsletter = {
        id: 'test-id',
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        birthday: '1990-01-01',
        subscribedAt: new Date().toISOString(),
      };

      const testOrderData: OrderEmailData = {
        order: {
          id: 'test-order-12345678',
          customerEmail: 'test@example.com',
          customerName: 'John Doe',
          customerPhone: '+27123456789',
          shippingAddress: '123 Test Street, Cape Town, 8001',
          billingAddress: '123 Test Street, Cape Town, 8001',
          orderItems: JSON.stringify([]),
          totalAmount: '2000.00',
          currency: 'ZAR',
          paymentStatus: 'completed',
          orderStatus: 'processing',
          stripePaymentIntentId: 'pi_test123',
          trackingNumber: null,
          notes: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        orderItems: [
          {
            product: {
              id: 'vitamin-d3',
              name: 'Vitamin D3 4000 IU Gummies',
              price: '1000.00',
              imageUrl: '/assets/vitamin-d3.png'
            },
            quantity: 2
          }
        ]
      };

      const testPreOrderData: PreOrder = {
        id: 'test-preorder-id',
        customerEmail: 'test@example.com',
        customerName: 'John Doe',
        customerPhone: '+27123456789',
        productId: 'magnesium',
        productName: 'Magnesium Gummies',
        quantity: 1,
        notes: 'Please notify me as soon as available!',
        productPrice: '1000.00',
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      // Send test emails
      await this.sendNewsletterConfirmation(testNewsletterData);
      console.log('✅ Newsletter confirmation test email sent');

      await this.sendOrderConfirmation(testOrderData);
      console.log('✅ Order confirmation test email sent');

      await this.sendPreOrderNotification(testPreOrderData);
      console.log('✅ Pre-order notification test emails sent');

      await this.sendRestockNotification({
        firstName: 'John',
        email: 'test@example.com',
        product: 'Ashwagandha Capsules',
        restockDate: 'September 1st, 2025'
      });
      console.log('✅ Restock notification test emails sent');

      await this.sendLowStockAlert({
        productName: 'Vitamin D3 4000 IU Gummies',
        currentStock: 2,
        threshold: 5
      });
      console.log('✅ Low stock alert test email sent');

      return {
        success: true,
        message: 'All test emails sent successfully! Check your inbox at dn@thefourths.com and ms@thefourths.com'
      };
    } catch (error) {
      console.error('Error sending test emails:', error);
      return {
        success: false,
        message: `Failed to send test emails: ${error}`
      };
    }
  }
}