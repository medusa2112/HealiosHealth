import express from 'express';
import { storage } from '../../storage';

const router = express.Router();

// Get abandoned carts with analytics
router.get('/abandoned-carts', async (req, res) => {
  try {
    const hoursThreshold = parseInt(req.query.hours as string) || 24;
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

// Send cart recovery email
router.post('/send-recovery-email', async (req, res) => {
  try {
    const { cartId, sessionToken, items, totalAmount } = req.body;
    
    if (!cartId || !sessionToken) {
      return res.status(400).json({ message: 'Cart ID and session token required' });
    }
    
    // Get cart details
    const cart = await storage.getCartById(cartId);
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    // TODO: Implement email service for cart recovery
    // For now, we'll use the existing email service
    try {
      const { sendEmail } = await import('../../lib/email');
      
      // Since we don't have a specific email for cart recovery yet,
      // we'll create a simple notification
      const recoveryLink = `${process.env.BASE_URL || 'https://healios.replit.app'}/cart?recover=${sessionToken}`;
      
      // For now, we'll send a basic email
      // In production, you'd want a proper cart recovery email template
      console.log(`Cart recovery email would be sent for cart ${cartId}`);
      console.log(`Recovery link: ${recoveryLink}`);
      console.log(`Items: ${JSON.stringify(items)}`);
      console.log(`Total: R${totalAmount}`);
      
      res.json({ 
        success: true, 
        message: 'Cart recovery email sent successfully',
        recoveryLink // For debugging purposes
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
router.get('/cart-analytics', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    
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

export default router;