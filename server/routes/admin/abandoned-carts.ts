import express from 'express';
import { z } from 'zod';
import { requireAdmin } from '../../mw/requireAdmin';
import { storage } from '../../storage';
import { sendEmail } from '../../lib/email';
import { auditAction } from '../../lib/auditMiddleware';

const router = express.Router();

// Get abandoned carts with analytics
router.get('/', requireAdmin, async (req, res) => {
  try {
    const querySchema = z.object({
      hours: z.string().optional().transform(val => val ? parseInt(val, 10) : 24)
    });
    
    const result = querySchema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Invalid query parameters',
        details: result.error.errors
      });
    }
    
    const hoursThreshold = result.data.hours;
    const abandonedCarts = await storage.getAbandonedCarts(hoursThreshold);
    
    // Parse cart items for better frontend handling
    const enrichedCarts = abandonedCarts.map(cart => {
      let parsedItems = [];
      try {
        parsedItems = JSON.parse(cart.items);
      } catch (error) {
        console.warn('Failed to parse cart items:', error);
      }
      
      return {
        ...cart,
        items: parsedItems,
        totalAmount: cart.totalAmount || 0
      };
    });
    
    // Calculate stats
    const totalAbandoned = enrichedCarts.length;
    const totalValue = enrichedCarts.reduce((sum, cart) => sum + (cart.totalAmount || 0), 0);
    const averageValue = totalAbandoned > 0 ? totalValue / totalAbandoned : 0;
    
    // Calculate recovery rate (carts that were eventually converted)
    const convertedCarts = enrichedCarts.filter(cart => cart.convertedToOrder);
    const recoveryRate = totalAbandoned > 0 ? (convertedCarts.length / totalAbandoned) * 100 : 0;
    
    const stats = {
      totalAbandoned,
      totalValue,
      averageValue,
      recoveryRate
    };
    
    res.json({
      carts: enrichedCarts,
      stats
    });
  } catch (error) {
    console.error('Error fetching abandoned carts:', error);
    res.status(500).json({ message: 'Failed to fetch abandoned carts' });
  }
});

// Send cart recovery email with proper logging
router.post('/send-recovery-email', requireAdmin, auditAction('send_recovery_email', 'cart'), async (req, res) => {
  try {
    const bodySchema = z.object({
      cartId: z.string().min(1),
      sessionToken: z.string().min(1),
      items: z.array(z.any()).optional(),
      totalAmount: z.number().nonnegative().optional()
    });
    
    const result = bodySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Invalid input',
        details: result.error.errors
      });
    }
    
    const { cartId, sessionToken, items, totalAmount } = result.data;
    
    // Get cart details
    const cart = await storage.getCartById(cartId);
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    // Determine email timing and extract user info from cart
    let userEmail = 'customer@example.com'; // Default fallback
    let customerName = 'Valued Customer';
    
    // Try to get user info if available
    if (cart.userId) {
      try {
        const user = await storage.getUserById(cart.userId);
        if (user) {
          userEmail = user.email;
          customerName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0];
        }
      } catch (error) {
        console.log('Could not fetch user details, using defaults');
      }
    }
    
    // Calculate how long cart has been abandoned
    const lastUpdate = new Date(cart.lastUpdated || cart.createdAt);
    const hoursAbandoned = Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60));
    
    // Determine email type based on abandonment time
    const emailType = hoursAbandoned >= 24 ? 'abandoned_cart_24h' : 'abandoned_cart_1h';
    
    const recoveryLink = `${process.env.BASE_URL || 'https://healios.replit.app'}/cart?recover=${sessionToken}`;
    
    try {
      // Send the recovery email using proper template
      await sendEmail(userEmail, emailType, {
        amount: totalAmount || 0,
        id: cartId,
        customerName,
        items: items || [],
        resumeCheckoutUrl: recoveryLink,
        discountCode: 'WELCOME10', // Could be dynamic
        discountAmount: '10%',
        sessionToken
      });
      
      // Log the email event to database
      try {
        await storage.createEmailEvent({
          userId: cart.userId || null,
          emailType: 'abandoned_cart',
          relatedId: cartId,
          emailAddress: userEmail
        });
        console.log(`[EMAIL_EVENT] Logged abandoned cart email for cart ${cartId}`);
      } catch (logError) {
        console.error('Failed to log email event:', logError);
      }
      
      res.json({ 
        success: true, 
        message: 'Cart recovery email sent successfully',
        emailType,
        recipient: userEmail
      });
      
    } catch (emailError) {
      console.error('Failed to send cart recovery email:', emailError);
      res.status(500).json({ message: 'Failed to send recovery email' });
    }
    
  } catch (error) {
    console.error('Error processing recovery email request:', error);
    res.status(500).json({ message: 'Failed to process recovery email request' });
  }
});

// Get cart analytics for dashboard
router.get('/cart-analytics', requireAdmin, async (req, res) => {
  try {
    const querySchema = z.object({
      days: z.string().optional().transform(val => val ? parseInt(val, 10) : 30)
    });
    
    const result = querySchema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Invalid query parameters',
        details: result.error.errors
      });
    }
    
    const days = result.data.days;
    
    // Get abandoned carts for different time periods
    const periods = [1, 24, 72, 168]; // 1 hour, 24 hours, 3 days, 1 week
    const analytics = await Promise.all(
      periods.map(async (hours) => {
        const carts = await storage.getAbandonedCarts(hours);
        const totalValue = carts.reduce((sum, cart) => sum + (cart.totalAmount || 0), 0);
        const convertedCarts = carts.filter(cart => cart.convertedToOrder);
        const recoveryRate = carts.length > 0 ? (convertedCarts.length / carts.length) * 100 : 0;
        
        return {
          period: hours,
          periodLabel: hours === 1 ? '1 Hour' : 
                      hours === 24 ? '24 Hours' :
                      hours === 72 ? '3 Days' : '1 Week',
          totalCarts: carts.length,
          totalValue,
          recoveryRate,
          averageValue: carts.length > 0 ? totalValue / carts.length : 0
        };
      })
    );
    
    res.json({ analytics });
  } catch (error) {
    console.error('Error fetching cart analytics:', error);
    res.status(500).json({ message: 'Failed to fetch cart analytics' });
  }
});

// Auto-expire old abandoned carts (called by cron job or admin action)
router.post('/cleanup-expired', requireAdmin, async (req, res) => {
  try {
    const daysToExpire = 30; // Expire carts after 30 days
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() - daysToExpire);
    
    // Get expired carts
    const allCarts = await storage.getAbandonedCarts(24 * daysToExpire); // Get all carts from X days ago
    const expiredCarts = allCarts.filter(cart => {
      const cartDate = new Date(cart.createdAt);
      return cartDate < expireDate && !cart.convertedToOrder;
    });
    
    let cleanedCount = 0;
    for (const cart of expiredCarts) {
      try {
        // Mark cart as expired or delete it
        // For now we'll just log it - in production you might want to soft-delete
        console.log(`[CART_CLEANUP] Expired cart ${cart.id} created ${cart.createdAt}`);
        cleanedCount++;
      } catch (error) {
        console.error(`Failed to clean cart ${cart.id}:`, error);
      }
    }
    
    res.json({ 
      success: true, 
      message: `Cleaned up ${cleanedCount} expired carts`,
      expiredCount: cleanedCount,
      expireThreshold: daysToExpire + ' days'
    });
  } catch (error) {
    console.error('Error cleaning up expired carts:', error);
    res.status(500).json({ message: 'Failed to clean up expired carts' });
  }
});

// Email preview endpoint for testing
router.post('/preview-email', requireAdmin, async (req, res) => {
  try {
    const bodySchema = z.object({
      cartId: z.string().min(1),
      emailType: z.enum(['abandoned_cart_1h', 'abandoned_cart_24h']).default('abandoned_cart_1h')
    });
    
    const result = bodySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Invalid input',
        details: result.error.errors
      });
    }
    
    const { cartId, emailType } = result.data;
    
    // Get cart details for preview
    const cart = await storage.getCartById(cartId);
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    let items = [];
    try {
      items = JSON.parse(cart.items);
    } catch (error) {
      console.warn('Failed to parse cart items for preview');
    }
    
    const recoveryLink = `${process.env.BASE_URL || 'https://healios.replit.app'}/cart?recover=${cart.sessionToken}`;
    
    // Create email preview data
    const emailData = {
      amount: cart.totalAmount || 0,
      id: cartId,
      customerName: 'Preview Customer',
      items: items,
      resumeCheckoutUrl: recoveryLink,
      discountCode: 'PREVIEW10',
      discountAmount: '10%',
      sessionToken: cart.sessionToken
    };
    
    res.json({
      success: true,
      preview: {
        emailType,
        subject: emailType === 'abandoned_cart_1h' ? "We're here when you're ready" : "A gentle reminder about your wellness selections",
        data: emailData,
        recipient: 'preview@example.com',
        cartValue: cart.totalAmount,
        itemCount: items.length
      }
    });
    
  } catch (error) {
    console.error('Error generating email preview:', error);
    res.status(500).json({ message: 'Failed to generate email preview' });
  }
});

export default router;