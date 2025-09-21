import express from 'express';
import { storage } from '../storage';

const router = express.Router();

/**
 * Test admin route to verify admin auth and optional 2FA is working
 * GET /api/admin/test
 * Note: middleware chain is applied at router level in routes.ts
 */
router.get('/test', async (req, res) => {
  try {
    const admin = (req as any).admin;
    
    res.json({
      success: true,
      message: 'Admin 2FA verification successful!',
      admin: {
        id: admin.id,
        email: admin.email,
        totpEnabled: admin.totpEnabled,
        lastLoginAt: admin.lastLoginAt
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[ADMIN_TEST] Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR' 
    });
  }
});

/**
 * Get admin status and info
 * GET /api/admin/info
 * Note: middleware chain is applied at router level in routes.ts
 */
router.get('/info', async (req, res) => {
  try {
    const admin = (req as any).admin;
    
    // Get some basic stats
    const products = await storage.getProducts();
    const orders = await storage.getAllOrders();
    
    res.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        totpEnabled: admin.totpEnabled,
        active: admin.active,
        lastLoginAt: admin.lastLoginAt
      },
      stats: {
        totalProducts: products.length,
        totalOrders: orders.length,
        featuredProducts: products.filter(p => p.featured).length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[ADMIN_INFO] Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR' 
    });
  }
});

export default router;