import express from 'express';
// Authentication removed - admin routes now publicly accessible
import { storage } from '../storage';
import { products } from '@shared/schema';
import { db } from '../db';
import { eq, sql } from 'drizzle-orm';
import { AdminLogger } from '../lib/admin-logger';
import { auditAction } from '../lib/auditMiddleware';
import ordersRouter from './admin/orders';
import abandonedCartsRouter from './admin/abandoned-carts';
import discountCodesRouter from './adminDiscounts';

const router = express.Router();

// Admin routes accessible without authentication for development

// Mount orders subrouter
router.use('/orders', ordersRouter);

// Mount abandoned carts subrouter
router.use('/abandoned-carts', abandonedCartsRouter);

// Mount discount codes subrouter
router.use('/discount-codes', discountCodesRouter);

// Admin Logs API - Get audit logs
router.get('/logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const logs = await storage.getAdminLogs(limit);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching admin logs:', error);
    res.status(500).json({ error: 'Failed to fetch admin logs' });
  }
});

// Admin Dashboard - Overview stats
router.get('/', async (req, res) => {
  try {
    // Query database directly with proper serialization
    const dbProducts = await db.select().from(products);
    const orders = []; // Orders table to be implemented
    let totalQuizCompletions = 0;
    
    // Try to get quiz completions
    try {
      const quizCount = await db.execute(sql`SELECT COUNT(*) as count FROM quiz_results`);
      totalQuizCompletions = parseInt(quizCount.rows[0]?.count || '0');
    } catch (quizError) {
      console.log('Quiz results table not found, using default count');
      totalQuizCompletions = 0;
    }

    // Serialize low stock products properly
    const lowStockProducts = dbProducts
      .filter(p => (p.stockQuantity || 0) < 5)
      .map(product => ({
        id: product.id,
        name: product.name,
        stockQuantity: product.stockQuantity,
        price: product.price,
        imageUrl: product.imageUrl
      }));

    res.json({
      totalProducts: dbProducts.length,
      totalOrders: orders.length,
      totalQuizCompletions,
      recentOrders: orders.slice(-5),
      lowStockProducts
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Failed to load dashboard data' });
  }
});

// Product Management - Full CRUD
router.get('/products', async (req, res) => {
  try {
    // Query database directly and ensure proper serialization
    const dbProducts = await db.select().from(products);
    // Ensure proper JSON serialization by creating plain objects
    const serializedProducts = dbProducts.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      imageUrl: product.imageUrl,
      categories: product.categories,
      rating: product.rating,
      reviewCount: product.reviewCount,
      inStock: product.inStock,
      stockQuantity: product.stockQuantity,
      featured: product.featured,
      type: product.type,
      bottleCount: product.bottleCount,
      dailyDosage: product.dailyDosage,
      supplyDays: product.supplyDays,
      seoTitle: product.seoTitle,
      seoDescription: product.seoDescription,
      seoKeywords: product.seoKeywords
    }));
    res.json(serializedProducts);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const product = await db.select().from(products).where(eq(products.id, req.params.id)).limit(1);
    if (!product || product.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product[0]);
  } catch (error) {
    console.error('Failed to fetch product:', error);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});

router.post('/products', auditAction('create_product', 'product'), async (req, res) => {
  try {
    const { name, description, price, originalPrice, imageUrl, categories, stockQuantity, featured, type, bottleCount, dailyDosage, supplyDays } = req.body;
    
    // Basic validation
    if (!name || !description || !price || !imageUrl || !categories) {
      return res.status(400).json({ message: 'Missing required fields: name, description, price, imageUrl, categories' });
    }

    const productData = {
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price).toString(),
      originalPrice: originalPrice ? parseFloat(originalPrice).toString() : null,
      imageUrl: imageUrl.trim(),
      categories: Array.isArray(categories) ? categories : [categories],
      stockQuantity: parseInt(stockQuantity) || 0,
      featured: Boolean(featured),
      type: type || 'supplement',
      bottleCount: bottleCount ? parseInt(bottleCount) : null,
      dailyDosage: dailyDosage ? parseInt(dailyDosage) : null,
      supplyDays: supplyDays ? parseInt(supplyDays) : null,
      inStock: true,
      rating: "5.0",
      reviewCount: 0
    };

    const [product] = await db.insert(products).values(productData).returning();
    
    // Log admin action (no auth required)
    await AdminLogger.logProductAction(
      'system-admin',
      'create',
      product.id,
      { name: product.name, price: product.price, categories: product.categories }
    );
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Failed to create product:', error);
    res.status(500).json({ message: 'Failed to create product' });
  }
});

router.put('/products/:id', auditAction('update_product', 'product'), async (req, res) => {
  try {
    const { name, description, price, originalPrice, imageUrl, categories, stockQuantity, featured, inStock, type, bottleCount, dailyDosage, supplyDays } = req.body;
    
    const updates: any = {};
    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description.trim();
    if (price !== undefined) updates.price = parseFloat(price).toString();
    if (originalPrice !== undefined) updates.originalPrice = originalPrice ? parseFloat(originalPrice).toString() : null;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl.trim();
    if (categories !== undefined) updates.categories = Array.isArray(categories) ? categories : [categories];
    if (stockQuantity !== undefined) updates.stockQuantity = parseInt(stockQuantity) || 0;
    if (featured !== undefined) updates.featured = Boolean(featured);
    if (inStock !== undefined) updates.inStock = Boolean(inStock);
    if (type !== undefined) updates.type = type;
    if (bottleCount !== undefined) updates.bottleCount = bottleCount ? parseInt(bottleCount) : null;
    if (dailyDosage !== undefined) updates.dailyDosage = dailyDosage ? parseInt(dailyDosage) : null;
    if (supplyDays !== undefined) updates.supplyDays = supplyDays ? parseInt(supplyDays) : null;

    const [product] = await db.update(products).set(updates).where(eq(products.id, req.params.id)).returning();
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Log admin action (no auth required)
    await AdminLogger.logProductAction(
      'system-admin',
      'update',
      req.params.id,
      updates
    );

    res.json(product);
  } catch (error) {
    console.error('Failed to update product:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
});

router.delete('/products/:id', auditAction('delete_product', 'product'), async (req, res) => {
  try {
    const [deletedProduct] = await db.delete(products).where(eq(products.id, req.params.id)).returning();
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Log admin action (no auth required)
    await AdminLogger.logProductAction(
      'system-admin',
      'delete',
      req.params.id
    );
    
    res.status(204).end();
  } catch (error) {
    console.error('Failed to delete product:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

router.put('/products/:id/stock', auditAction('update_stock', 'product'), async (req, res) => {
  try {
    const { quantity } = req.body;
    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    const [product] = await db.update(products).set({ stockQuantity: quantity }).where(eq(products.id, req.params.id)).returning();
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Log admin action (no auth required)
    await AdminLogger.logProductAction(
      'system-admin',
      'update',
      req.params.id,
      { stockUpdate: quantity }
    );

    res.json(product);
  } catch (error) {
    console.error('Failed to update stock:', error);
    res.status(500).json({ message: 'Failed to update stock' });
  }
});

// Order Management
router.get('/orders', async (req, res) => {
  try {
    // We'll need to implement a method to get all orders
    res.json({ message: 'Order management coming soon' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Quiz Analytics
router.get('/quiz/analytics', async (req, res) => {
  try {
    // Query quiz_results table directly with error handling
    let quizResults = [];
    let totalCompletions = 0;
    
    try {
      const quizResultsQuery = await db.execute(sql`SELECT * FROM quiz_results ORDER BY created_at DESC LIMIT 20`);
      quizResults = quizResultsQuery.rows;
      
      const countQuery = await db.execute(sql`SELECT COUNT(*) as count FROM quiz_results`);
      totalCompletions = parseInt(countQuery.rows[0]?.count || '0');
    } catch (dbError) {
      console.log('Quiz results table not found or empty, returning empty results');
      quizResults = [];
      totalCompletions = 0;
    }
    
    res.json({
      totalCompletions,
      recentCompletions: quizResults.map((result: any) => ({
        id: result.id,
        name: `${result.first_name} ${result.last_name}`,
        email: result.email,
        completedAt: result.created_at,
        consentToMarketing: result.consent_to_marketing
      }))
    });
  } catch (error) {
    console.error('Quiz analytics error:', error);
    res.status(500).json({ message: 'Failed to get quiz analytics' });
  }
});

// Phase 13: Reorder Analytics API Routes
router.get("/reorder-logs", async (req, res) => {
  try {
    const { status, channel, limit = 100 } = req.query;
    
    const options: any = { limit: parseInt(limit as string) };
    if (status && status !== 'all') options.status = status as string;
    if (channel && channel !== 'all') options.channel = channel as string;
    
    const logs = await storage.getReorderLogs(options);
    res.json(logs);
  } catch (error) {
    console.error("Error fetching reorder logs:", error);
    res.status(500).json({ error: "Failed to fetch reorder logs" });
  }
});

router.get("/reorder-analytics", async (req, res) => {
  try {
    const logs = await storage.getReorderLogs({ limit: 1000 }); // Get more data for analytics
    
    // Calculate analytics
    const totalReorders = logs.length;
    const completedReorders = logs.filter(log => log.status === 'completed').length;
    const conversionRate = totalReorders > 0 ? completedReorders / totalReorders : 0;
    
    const completedLogs = logs.filter(log => log.status === 'completed' && log.newAmount);
    const totalReorderValue = completedLogs.reduce((sum, log) => sum + (log.newAmount || 0), 0);
    const avgReorderValue = completedReorders > 0 ? totalReorderValue / completedReorders : 0;
    
    // Channel analytics
    const channelMap = new Map<string, { count: number; value: number }>();
    logs.forEach(log => {
      const existing = channelMap.get(log.channel) || { count: 0, value: 0 };
      channelMap.set(log.channel, {
        count: existing.count + 1,
        value: existing.value + (log.newAmount || 0)
      });
    });
    
    const topChannels = Array.from(channelMap.entries()).map(([channel, data]) => ({
      channel,
      ...data
    })).sort((a, b) => b.count - a.count);
    
    // Status analytics
    const statusMap = new Map<string, number>();
    logs.forEach(log => {
      statusMap.set(log.status, (statusMap.get(log.status) || 0) + 1);
    });
    
    const reordersByStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count
    }));
    
    // Daily reorders (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentLogs = logs.filter(log => new Date(log.timestamp) >= sevenDaysAgo);
    const dailyMap = new Map<string, { count: number; value: number }>();
    
    recentLogs.forEach(log => {
      const date = new Date(log.timestamp).toISOString().split('T')[0];
      const existing = dailyMap.get(date) || { count: 0, value: 0 };
      dailyMap.set(date, {
        count: existing.count + 1,
        value: existing.value + (log.newAmount || 0)
      });
    });
    
    const dailyReorders = Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      ...data
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    const analytics = {
      totalReorders,
      completedReorders,
      conversionRate,
      totalReorderValue,
      avgReorderValue,
      topChannels,
      reordersByStatus,
      dailyReorders
    };
    
    res.json(analytics);
  } catch (error) {
    console.error("Error calculating reorder analytics:", error);
    res.status(500).json({ error: "Failed to calculate reorder analytics" });
  }
});

// Phase 14: Product Variant Management
router.get('/products/:id/variants', async (req, res) => {
  try {
    const variants = await storage.getProductVariants(req.params.id);
    res.json(variants);
  } catch (error) {
    console.error('Failed to fetch product variants:', error);
    res.status(500).json({ message: 'Failed to fetch product variants' });
  }
});

router.post('/products/:id/variants', async (req, res) => {
  try {
    const { name, sku, type, attributes, price, imageUrl, stockQuantity, inStock, isDefault } = req.body;
    const productId = req.params.id;
    
    // Validate required fields
    if (!name || !type) {
      return res.status(400).json({ message: 'Missing required fields: name, type' });
    }
    
    const variantData = {
      productId,
      name,
      sku: sku || `${productId}-${name.toLowerCase().replace(/\s+/g, '-')}`,
      type,
      attributes: attributes || {},
      price: price || 0,
      imageUrl: imageUrl || null,
      stockQuantity: stockQuantity || 0,
      inStock: inStock ?? true,
      isDefault: isDefault ?? false
    };
    
    const variant = await storage.createProductVariant(variantData);
    
    // Log the action
    await AdminLogger.logAction({
      adminId: req.user?.id || 'system',
      adminEmail: req.user?.email || 'system@healios.com',
      action: 'CREATE_PRODUCT_VARIANT',
      resourceType: 'PRODUCT_VARIANT',
      resourceId: variant.id,
      details: {
        productId,
        variantName: name,
        variantType: type,
        sku: variant.sku
      }
    });
    
    res.status(201).json(variant);
  } catch (error) {
    console.error('Failed to create product variant:', error);
    res.status(500).json({ message: 'Failed to create product variant' });
  }
});

router.put('/product-variants/:id', async (req, res) => {
  try {
    const { name, sku, type, attributes, price, imageUrl, stockQuantity, inStock, isDefault } = req.body;
    const variantId = req.params.id;
    
    const existingVariant = await storage.getProductVariant(variantId);
    if (!existingVariant) {
      return res.status(404).json({ message: 'Product variant not found' });
    }
    
    const updateData = {
      name: name || existingVariant.name,
      sku: sku || existingVariant.sku,
      type: type || existingVariant.type,
      attributes: attributes !== undefined ? attributes : existingVariant.attributes,
      price: price !== undefined ? price : existingVariant.price,
      imageUrl: imageUrl !== undefined ? imageUrl : existingVariant.imageUrl,
      stockQuantity: stockQuantity !== undefined ? stockQuantity : existingVariant.stockQuantity,
      inStock: inStock !== undefined ? inStock : existingVariant.inStock,
      isDefault: isDefault !== undefined ? isDefault : existingVariant.isDefault
    };
    
    const variant = await storage.updateProductVariant(variantId, updateData);
    
    // Log the action
    await AdminLogger.logAction({
      adminId: req.user?.id || 'system',
      adminEmail: req.user?.email || 'system@healios.com',
      action: 'UPDATE_PRODUCT_VARIANT',
      resourceType: 'PRODUCT_VARIANT',
      resourceId: variantId,
      details: {
        productId: existingVariant.productId,
        changes: updateData
      }
    });
    
    res.json(variant);
  } catch (error) {
    console.error('Failed to update product variant:', error);
    res.status(500).json({ message: 'Failed to update product variant' });
  }
});

router.delete('/product-variants/:id', async (req, res) => {
  try {
    const variantId = req.params.id;
    
    const existingVariant = await storage.getProductVariant(variantId);
    if (!existingVariant) {
      return res.status(404).json({ message: 'Product variant not found' });
    }
    
    const deleted = await storage.deleteProductVariant(variantId);
    if (!deleted) {
      return res.status(404).json({ message: 'Product variant not found' });
    }
    
    // Log the action
    await AdminLogger.logAction({
      adminId: req.user?.id || 'system',
      adminEmail: req.user?.email || 'system@healios.com',
      action: 'DELETE_PRODUCT_VARIANT',
      resourceType: 'PRODUCT_VARIANT',
      resourceId: variantId,
      details: {
        productId: existingVariant.productId,
        variantName: existingVariant.name,
        variantSku: existingVariant.sku
      }
    });
    
    res.json({ message: 'Product variant deleted successfully' });
  } catch (error) {
    console.error('Failed to delete product variant:', error);
    res.status(500).json({ message: 'Failed to delete product variant' });
  }
});

export default router;