import { Router } from 'express';
import { db } from '../db';
import { orders } from '@shared/schema';
import { eq, and, isNull, inArray } from 'drizzle-orm';
import { requireCustomer } from '../mw/requireCustomer';

const router = Router();

/**
 * Guest to Account Order Claim Endpoint
 * Claims guest orders and associates them with the logged-in user
 */
router.post('/claim', requireCustomer, async (req, res) => {
  const userId = req.session.customerUserId;
  const { orderIds } = req.body;
  
  // Validate input
  if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
    return res.status(400).json({ 
      error: 'Invalid request. Please provide an array of order IDs.' 
    });
  }
  
  // Validate order IDs format
  const validOrderIds = orderIds.filter(id => 
    typeof id === 'string' && id.length > 0
  );
  
  if (validOrderIds.length === 0) {
    return res.status(400).json({ 
      error: 'No valid order IDs provided.' 
    });
  }
  
  try {
    // Start transaction to ensure consistency
    const result = await db.transaction(async (tx) => {
      // Find unclaimed orders matching the provided IDs
      const unclaimedOrders = await tx
        .select()
        .from(orders)
        .where(
          and(
            inArray(orders.id, validOrderIds),
            isNull(orders.userId) // Only claim orders without a user
          )
        );
      
      if (unclaimedOrders.length === 0) {
        return { 
          claimed: 0, 
          message: 'No eligible orders found to claim.' 
        };
      }
      
      // Claim the orders by associating them with the user
      await tx
        .update(orders)
        .set({ 
          userId: userId!,
          updatedAt: new Date().toISOString()
        })
        .where(
          and(
            inArray(orders.id, unclaimedOrders.map(o => o.id)),
            isNull(orders.userId) // Double-check to prevent race conditions
          )
        );
      
      return {
        claimed: unclaimedOrders.length,
        orderIds: unclaimedOrders.map(o => o.id),
        message: `Successfully claimed ${unclaimedOrders.length} order(s).`
      };
    });

    return res.json({
      success: true,
      ...result
    });
    
  } catch (error) {
    // // console.error('[ORDER CLAIM] Error claiming orders:', error);
    return res.status(500).json({ 
      error: 'Failed to claim orders. Please try again.' 
    });
  }
});

export default router;