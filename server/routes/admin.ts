import express, { Request, Response } from 'express';
import { z } from 'zod';
import { query, body, param, validationResult } from 'express-validator';
import { requireAdmin } from '../mw/requireAdmin';
import { storage } from '../storage';
import { products, orders, insertProductSchema, quizResults } from '@shared/schema';
import { db } from '../db';
import { eq, sql, desc, sum, count, countDistinct } from 'drizzle-orm';
import { AdminLogger } from '../lib/admin-logger';
import { auditAction } from '../lib/auditMiddleware';
import ordersRouter from './admin/orders';
import abandonedCartsRouter from './admin/abandoned-carts';
import discountCodesRouter from './adminDiscounts';
import logsRouter from './admin/logs';
import { deriveAvailability, isOrderable } from '../../lib/availability';

const router = express.Router();

// Admin routes protected with authentication

// Mount orders subrouter
router.use('/orders', ordersRouter);

// Mount abandoned carts subrouter
router.use('/abandoned-carts', abandonedCartsRouter);

// Mount discount codes subrouter
router.use('/discount-codes', discountCodesRouter);

// Mount activity logs subrouter
router.use('/logs', logsRouter);

// Admin Dashboard - Overview stats with real-time data
router.get('/', requireAdmin, async (req, res) => {
  try {
    // Query limit for performance with large datasets
    const queryLimit = parseInt(req.query.limit as string) || 1000;
    
    // Query database directly with proper serialization
    const dbProducts = await db.select().from(products);
    
    // Query actual orders from database with pagination support
    let dbOrders: any[] = [];
    let totalRevenue = 0;
    let totalOrdersCount = 0;
    
    try {
      // Get order count first for performance
      // Use safe Drizzle count query instead of raw SQL
      const orderCountResult = await db.select({ count: count() }).from(orders);
      totalOrdersCount = orderCountResult[0]?.count || 0;
      
      // Get recent orders with limit
      dbOrders = await db
        .select({
          id: orders.id,
          customerEmail: orders.customerEmail,
          customerName: orders.customerName,
          totalAmount: orders.totalAmount,
          currency: orders.currency,
          paymentStatus: orders.paymentStatus,
          orderStatus: orders.orderStatus,
          createdAt: orders.createdAt
        })
        .from(orders)
        .orderBy(desc(orders.createdAt))
        .limit(Math.min(queryLimit, 100)); // Cap at 100 for dashboard performance
        
      // Calculate total revenue from completed orders only
      // Use safe Drizzle aggregation instead of raw SQL
      const revenueResult = await db
        .select({ total: sum(orders.totalAmount) })
        .from(orders)
        .where(eq(orders.paymentStatus, 'completed'));
      totalRevenue = parseFloat(revenueResult[0]?.total || '0');
      
    } catch (ordersError) {
      console.log('Orders table query failed, using default values:', ordersError.message);
      dbOrders = [];
      totalRevenue = 0;
      totalOrdersCount = 0;
    }
    
    let totalQuizCompletions = 0;
    
    // Try to get quiz completions
    try {
      // Use safe Drizzle count query instead of raw SQL
      const quizCount = await db.select({ count: count() }).from(quizResults);
      totalQuizCompletions = quizCount[0]?.count || 0;
    } catch (quizError) {
      console.log('Quiz results table not found, using default count');
      totalQuizCompletions = 0;
    }

    // Calculate cart abandonment rate
    let abandonmentRate = 0;
    try {
      const cartResults = await db.execute(
        sql`SELECT 
          COUNT(CASE WHEN converted_to_order = false THEN 1 END) as abandoned,
          COUNT(*) as total 
          FROM carts 
          WHERE created_at::timestamp >= NOW() - INTERVAL '30 days'`
      );
      const { abandoned, total } = cartResults.rows[0] || { abandoned: 0, total: 0 };
      abandonmentRate = total > 0 ? (abandoned / total) * 100 : 0;
    } catch (cartError: any) {
      console.log('Cart abandonment calculation failed:', cartError.message);
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

    // Calculate active users (customers who placed orders in last 30 days)
    let activeUsers = 0;
    try {
      // Use safe Drizzle query with countDistinct instead of raw SQL
      const activeUsersResult = await db
        .select({ count: countDistinct(orders.customerEmail) })
        .from(orders)
        .where(sql`created_at::timestamp >= NOW() - INTERVAL '30 days'`);
      activeUsers = activeUsersResult[0]?.count || 0;
    } catch (activeUsersError: any) {
      console.log('Active users calculation failed:', activeUsersError.message);
    }

    res.json({
      totalProducts: dbProducts.length,
      totalOrders: totalOrdersCount,
      totalRevenue: Math.round(totalRevenue * 100) / 100, // Round to 2 decimal places
      totalQuizCompletions,
      cartAbandonmentRate: Math.round(abandonmentRate * 10) / 10, // Round to 1 decimal place
      activeUsers,
      recentOrders: dbOrders.slice(0, 5).map(order => ({
        id: order.id,
        customerEmail: order.customerEmail,
        customerName: order.customerName,
        totalAmount: order.totalAmount,
        currency: order.currency,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt
      })),
      lowStockProducts,
      // Metadata for frontend performance handling
      _metadata: {
        queryLimit,
        ordersCount: totalOrdersCount,
        productsCount: dbProducts.length,
        performanceWarning: totalOrdersCount > 500 ? 'Large dataset detected - consider pagination' : null
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Failed to load dashboard data', error: error.message });
  }
});

// Product Management - Full CRUD
router.get('/products', requireAdmin, async (req, res) => {
  try {
    // Add pagination support for large datasets (>1000 products)
    const limit = parseInt(req.query.limit as string) || 1000;
    const offset = parseInt(req.query.offset as string) || 0;
    
    // Query database directly and ensure proper serialization with performance limits
    const dbProducts = await db.select().from(products).limit(limit).offset(offset);
    const totalCount = await db.select({ count: sql`count(*)` }).from(products);
    
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
      allowPreorder: product.allowPreorder,
      preorderCap: product.preorderCap,
      preorderCount: product.preorderCount,
      seoTitle: product.seoTitle,
      seoDescription: product.seoDescription,
      seoKeywords: product.seoKeywords
    }));
    res.json({
      products: serializedProducts,
      pagination: {
        total: parseInt(totalCount[0]?.count?.toString() || '0'),
        limit,
        offset,
        hasMore: serializedProducts.length === limit
      },
      performanceWarning: serializedProducts.length > 500 ? 'Large dataset detected - consider using filters' : null
    });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

router.get('/products/:id', requireAdmin, async (req, res) => {
  try {
    const paramsSchema = z.object({
      id: z.string().min(1)
    });
    
    const result = paramsSchema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Invalid product ID',
        details: result.error.errors
      });
    }
    
    const product = await db.select().from(products).where(eq(products.id, result.data.id)).limit(1);
    if (!product || product.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Add availability to the product
    const productData = product[0];
    const availability = deriveAvailability({
      stockQuantity: productData.stockQuantity || 0,
      allowPreorder: productData.allowPreorder || false,
      preorderCap: productData.preorderCap,
      preorderCount: productData.preorderCount || 0
    });
    
    res.json({
      ...productData,
      availability,
      isOrderable: isOrderable(availability)
    });
  } catch (error) {
    console.error('Failed to fetch product:', error);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});

router.post('/products', requireAdmin, auditAction('create_product', 'product'), async (req, res) => {
  console.log('[ADMIN_PRODUCT] POST /products - Request received', {
    userId: (req as any).session?.userId,
    userEmail: (req as any).user?.email,
    bodyKeys: Object.keys(req.body),
    bodySize: JSON.stringify(req.body).length
  });
  
  try {
    console.log('[ADMIN_PRODUCT] Validating product data', {
      name: req.body.name,
      price: req.body.price,
      priceType: typeof req.body.price,
      categories: req.body.categories
    });
    
    // Preprocess data before validation
    const preprocessedData = {
      ...req.body,
      // Fix stock validation: inStock should be false when stockQuantity is 0
      inStock: (req.body.stockQuantity || 0) > 0,
      // Auto-generate SEO fields if not provided
      seoTitle: req.body.seoTitle || `${req.body.name} | Premium Supplements | Healios`,
      seoDescription: req.body.seoDescription || req.body.description?.substring(0, 160) || `Buy ${req.body.name} from Healios. Premium quality supplements with science-backed ingredients. Free shipping on orders over R500.`,
      seoKeywords: req.body.seoKeywords?.length > 0 ? req.body.seoKeywords : [req.body.name, ...(req.body.categories || []), 'supplements', 'health', 'wellness'].filter(Boolean),
    };

    // Use SINGLE SOURCE OF TRUTH - shared schema
    const result = insertProductSchema.safeParse(preprocessedData);
    if (!result.success) {
      console.error('[ADMIN_PRODUCT] Validation failed', {
        errors: result.error.errors,
        receivedData: preprocessedData,
        issues: result.error.issues
      });
      return res.status(400).json({ 
        error: 'Invalid product data',
        details: result.error.errors
      });
    }
    
    console.log('[ADMIN_PRODUCT] Validation successful, inserting to database', {
      validatedData: result.data
    });
    
    // Use validated data DIRECTLY - no double conversion needed
    const validatedProductData = result.data;
    const [product] = await db.insert(products).values(validatedProductData).returning();
    
    console.log('[ADMIN_PRODUCT] Product created successfully', {
      productId: product.id,
      productName: product.name
    });
    
    // Log admin action (no auth required)
    await AdminLogger.logProductAction(
      'system-admin',
      'create',
      product.id,
      { name: product.name, price: product.price, categories: product.categories }
    );
    
    res.status(201).json(product);
  } catch (error: any) {
    console.error('[ADMIN_PRODUCT] Failed to create product', {
      error: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
});

router.put('/products/:id', requireAdmin, auditAction('update_product', 'product'), async (req, res) => {
  console.log('[ADMIN_PRODUCT] PUT /products/:id - Request received', {
    productId: req.params.id,
    userId: (req as any).session?.userId,
    userEmail: (req as any).user?.email,
    bodyKeys: Object.keys(req.body),
    bodySize: JSON.stringify(req.body).length
  });
  
  try {
    const paramsSchema = z.object({
      id: z.string().min(1)
    });
    
    const paramsResult = paramsSchema.safeParse(req.params);
    if (!paramsResult.success) {
      console.error('[ADMIN_PRODUCT] Invalid product ID', {
        params: req.params,
        errors: paramsResult.error.errors
      });
      return res.status(400).json({ 
        error: 'Invalid product ID',
        details: paramsResult.error.errors
      });
    }
    
    console.log('[ADMIN_PRODUCT] Validating update data', {
      productId: req.params.id,
      updateFields: Object.keys(req.body),
      price: req.body.price,
      priceType: typeof req.body.price
    });
    
    // Preprocess data before validation
    const preprocessedData = {
      ...req.body,
      // Fix stock validation: inStock should be false when stockQuantity is 0
      ...(req.body.stockQuantity !== undefined && { inStock: req.body.stockQuantity > 0 }),
      // Validate pre-order fields
      ...(req.body.allowPreorder === true && !req.body.preorderCap && { preorderCap: null }),
      // Auto-generate SEO fields if not provided and name/description are being updated
      ...(req.body.name && !req.body.seoTitle && { seoTitle: `${req.body.name} | Premium Supplements | Healios` }),
      ...(req.body.description && !req.body.seoDescription && { seoDescription: req.body.description.substring(0, 160) }),
      ...(req.body.categories && (!req.body.seoKeywords || req.body.seoKeywords.length === 0) && { 
        seoKeywords: [req.body.name || '', ...(req.body.categories || []), 'supplements', 'health', 'wellness'].filter(Boolean)
      }),
    };
    
    // Validate pre-order logic
    if (preprocessedData.allowPreorder === true && !preprocessedData.preorderCap) {
      return res.status(400).json({ 
        error: 'Pre-order cap is required when pre-order is enabled'
      });
    }

    // Use SINGLE SOURCE OF TRUTH - shared schema made partial for updates  
    const updateSchema = insertProductSchema.partial();
    const bodyResult = updateSchema.safeParse(preprocessedData);
    if (!bodyResult.success) {
      console.error('[ADMIN_PRODUCT] Update validation failed', {
        errors: bodyResult.error.errors,
        receivedData: preprocessedData,
        issues: bodyResult.error.issues
      });
      return res.status(400).json({ 
        error: 'Invalid product data',
        details: bodyResult.error.errors
      });
    }
    
    const { id } = paramsResult.data;
    
    console.log('[ADMIN_PRODUCT] Validation successful, updating database', {
      productId: id,
      updates: bodyResult.data
    });
    
    // Use validated data DIRECTLY - add timestamp for updates
    const updates = {
      ...bodyResult.data,
      updatedAt: sql`CURRENT_TIMESTAMP`
    };

    const [product] = await db.update(products).set(updates).where(eq(products.id, id)).returning();
    if (!product) {
      console.warn('[ADMIN_PRODUCT] Product not found', { productId: id });
      return res.status(404).json({ message: 'Product not found' });
    }
    
    console.log('[ADMIN_PRODUCT] Product updated successfully', {
      productId: product.id,
      productName: product.name
    });
    
    // Log admin action (no auth required)
    await AdminLogger.logProductAction(
      'system-admin',
      'update',
      id,
      updates
    );

    res.json(product);
  } catch (error: any) {
    console.error('[ADMIN_PRODUCT] Failed to update product', {
      productId: req.params.id,
      error: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
});

router.delete('/products/:id', requireAdmin, auditAction('delete_product', 'product'), async (req, res) => {
  try {
    const paramsSchema = z.object({
      id: z.string().min(1)
    });
    
    const result = paramsSchema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Invalid product ID',
        details: result.error.errors
      });
    }
    
    const { id } = result.data;
    const [deletedProduct] = await db.delete(products).where(eq(products.id, id)).returning();
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Log admin action (no auth required)
    await AdminLogger.logProductAction(
      'system-admin',
      'delete',
      id
    );
    
    res.status(204).end();
  } catch (error) {
    console.error('Failed to delete product:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

router.put('/products/:id/stock', requireAdmin, auditAction('update_stock', 'product'), async (req, res) => {
  try {
    const paramsSchema = z.object({
      id: z.string().min(1)
    });
    
    const paramsResult = paramsSchema.safeParse(req.params);
    if (!paramsResult.success) {
      return res.status(400).json({ 
        error: 'Invalid product ID',
        details: paramsResult.error.errors
      });
    }
    
    const bodySchema = z.object({
      quantity: z.number().int().nonnegative()
    });
    
    const bodyResult = bodySchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({ 
        error: 'Invalid quantity',
        details: bodyResult.error.errors
      });
    }
    
    const { id } = paramsResult.data;
    const { quantity } = bodyResult.data;

    // Update both stockQuantity and inStock status
    const [product] = await db.update(products).set({ 
      stockQuantity: quantity,
      inStock: quantity > 0 
    }).where(eq(products.id, id)).returning();
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

// Order Management with pagination for large datasets
router.get('/orders', requireAdmin, async (req, res) => {
  try {
    const querySchema = z.object({
      page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
      limit: z.string().optional().transform(val => val ? Math.min(parseInt(val, 10), 500) : 50), // Cap at 500 for performance
      status: z.string().optional(),
      paymentStatus: z.string().optional()
    });
    
    const result = querySchema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Invalid query parameters',
        details: result.error.errors
      });
    }
    
    const { page, limit, status, paymentStatus } = result.data;
    const offset = (page - 1) * limit;
    
    // Build where conditions
    let whereConditions = [];
    if (status) whereConditions.push(sql`order_status = ${status}`);
    if (paymentStatus) whereConditions.push(sql`payment_status = ${paymentStatus}`);
    
    const whereClause = whereConditions.length > 0 
      ? sql`WHERE ${sql.join(whereConditions, sql` AND `)}`
      : sql``;
    
    // Get total count for pagination
    const countQuery = sql`SELECT COUNT(*) as count FROM orders ${whereClause}`;
    const countResult = await db.execute(countQuery);
    const totalCount = parseInt(countResult.rows[0]?.count || '0');
    
    // Get paginated orders
    const ordersQuery = sql`
      SELECT * FROM orders 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    const ordersResult = await db.execute(ordersQuery);
    const dbOrders = ordersResult.rows;
    
    res.json({
      orders: dbOrders,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        hasNext: offset + limit < totalCount,
        hasPrev: page > 1
      },
      filters: { status, paymentStatus },
      performanceWarning: totalCount > 1000 ? 'Large dataset - consider using filters' : null
    });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
});

// Quiz Analytics
router.get('/quiz/analytics', requireAdmin, async (req, res) => {
  try {
    // Query quiz_results table directly with error handling
    let quizResultsList = [];
    let totalCompletions = 0;
    
    try {
      // Use safe Drizzle query methods instead of raw SQL
      const quizResultsQuery = await db
        .select()
        .from(quizResults)
        .orderBy(desc(quizResults.createdAt))
        .limit(20);
      quizResultsList = quizResultsQuery;
      
      const countQuery = await db.select({ count: count() }).from(quizResults);
      totalCompletions = countQuery[0]?.count || 0;
    } catch (dbError) {
      console.log('Quiz results table not found or empty, returning empty results');
      quizResultsList = [];
      totalCompletions = 0;
    }
    
    res.json({
      totalCompletions,
      recentCompletions: quizResultsList.map((result: any) => ({
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
router.get("/reorder-logs", [
  query('status').optional().isString().withMessage('Status must be a string'),
  query('channel').optional().isString().withMessage('Channel must be a string'), 
  query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
  requireAdmin
], async (req: Request, res: Response) => {
  try {
    // Check for validation errors first
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }
    
    // Use validated data directly instead of destructuring
    const status = req.query.status;
    const channel = req.query.channel;
    const limit = req.query.limit || 100;
    
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

router.get("/reorder-analytics", requireAdmin, async (req, res) => {
  try {
    const logs = await storage.getReorderLogs({ limit: 1000 }); // Get more data for analytics
    
    // Calculate analytics
    const totalReorders = logs.length;
    const completedReorders = logs.filter(log => log.status === 'completed').length;
    const conversionRate = totalReorders > 0 ? completedReorders / totalReorders : 0;
    
    const completedLogs = logs.filter(log => log.status === 'completed' && log.metadata);
    const totalReorderValue = completedLogs.reduce((sum, log) => {
      try {
        const meta = typeof log.metadata === 'string' ? JSON.parse(log.metadata) : log.metadata;
        return sum + (meta?.newAmount || 0);
      } catch { return sum; }
    }, 0);
    const avgReorderValue = completedReorders > 0 ? totalReorderValue / completedReorders : 0;
    
    // Channel analytics
    const channelMap = new Map<string, { count: number; value: number }>();
    logs.forEach(log => {
      const meta = typeof log.metadata === 'string' ? JSON.parse(log.metadata) : log.metadata;
      const channel = meta?.channel || 'unknown';
      const existing = channelMap.get(channel) || { count: 0, value: 0 };
      channelMap.set(channel, {
        count: existing.count + 1,
        value: existing.value + (meta?.newAmount || 0)
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
    
    const recentLogs = logs.filter(log => log.timestamp && new Date(log.timestamp) >= sevenDaysAgo);
    const dailyMap = new Map<string, { count: number; value: number }>();
    
    recentLogs.forEach(log => {
      const date = log.timestamp ? new Date(log.timestamp).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
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

// Metrics API endpoint for dashboard (as requested in QA prompt)
router.get('/metrics', requireAdmin, async (req, res) => {
  try {
    // Use the same logic as main dashboard but with lighter response
    const dbProducts = await db.select({ 
      id: products.id, 
      stockQuantity: products.stockQuantity 
    }).from(products);
    
    let totalOrdersCount = 0;
    let totalRevenue = 0;
    
    try {
      // Get total orders count using Drizzle ORM
      const orderCountResult = await db.select({ count: count() }).from(orders);
      totalOrdersCount = orderCountResult[0]?.count || 0;
      
      // Get total revenue using Drizzle ORM
      const revenueResult = await db
        .select({ total: sum(orders.totalAmount) })
        .from(orders)
        .where(eq(orders.paymentStatus, 'completed'));
      totalRevenue = parseFloat(revenueResult[0]?.total || '0');
    } catch (error) {
      console.log('Orders metrics query failed:', error.message);
    }
    
    let abandonmentRate = 0;
    try {
      const cartResults = await db.execute(
        sql`SELECT 
          COUNT(CASE WHEN converted_to_order = false THEN 1 END) as abandoned,
          COUNT(*) as total 
          FROM carts 
          WHERE created_at::timestamp >= NOW() - INTERVAL '30 days'`
      );
      const { abandoned, total } = cartResults.rows[0] || { abandoned: 0, total: 0 };
      abandonmentRate = total > 0 ? (abandoned / total) * 100 : 0;
    } catch (error) {
      console.log('Cart abandonment metrics failed:', error.message);
    }
    
    let activeUsers = 0;
    try {
      // Get active users count using Drizzle ORM
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const activeUsersResult = await db
        .select({ count: countDistinct(orders.customerEmail) })
        .from(orders)
        .where(sql`${orders.createdAt} >= ${thirtyDaysAgo}`);
      activeUsers = activeUsersResult[0]?.count || 0;
    } catch (error) {
      console.log('Active users metrics failed:', error.message);
    }
    
    const lowStockCount = dbProducts.filter(p => (p.stockQuantity || 0) < 5).length;
    
    res.json({
      totalProducts: dbProducts.length,
      totalOrders: totalOrdersCount,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      cartAbandonmentRate: Math.round(abandonmentRate * 10) / 10,
      activeUsers,
      lowStockAlerts: lowStockCount,
      lastUpdated: new Date().toISOString(),
      // Performance metadata
      performanceInfo: {
        hasLargeDataset: totalOrdersCount > 500,
        recommendsPagination: totalOrdersCount > 1000,
        cacheRecommended: totalOrdersCount > 2000
      }
    });
  } catch (error) {
    console.error('Metrics API error:', error);
    res.status(500).json({ message: 'Failed to fetch metrics', error: error.message });
  }
});

// Orders summary endpoint for performance testing
router.get('/orders/summary', requireAdmin, async (req, res) => {
  try {
    const summaryResult = await db.execute(sql`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN payment_status = 'failed' THEN 1 END) as failed_orders,
        COUNT(CASE WHEN order_status = 'processing' THEN 1 END) as processing_orders,
        COUNT(CASE WHEN order_status = 'shipped' THEN 1 END) as shipped_orders,
        COUNT(CASE WHEN order_status = 'delivered' THEN 1 END) as delivered_orders,
        SUM(CASE WHEN payment_status = 'completed' THEN CAST(total_amount AS DECIMAL) ELSE 0 END) as total_revenue,
        AVG(CASE WHEN payment_status = 'completed' THEN CAST(total_amount AS DECIMAL) END) as avg_order_value
      FROM orders
    `);
    
    const summary = summaryResult.rows[0] || {};
    
    // Recent orders for trend analysis
    const recentOrdersResult = await db.execute(sql`
      SELECT 
        DATE(created_at) as order_date,
        COUNT(*) as orders_count,
        SUM(CAST(total_amount AS DECIMAL)) as daily_revenue
      FROM orders 
      WHERE created_at::timestamp >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY order_date DESC
    `);
    
    res.json({
      summary: {
        totalOrders: parseInt(summary.total_orders || '0'),
        completedOrders: parseInt(summary.completed_orders || '0'),
        pendingOrders: parseInt(summary.pending_orders || '0'),
        failedOrders: parseInt(summary.failed_orders || '0'),
        processingOrders: parseInt(summary.processing_orders || '0'),
        shippedOrders: parseInt(summary.shipped_orders || '0'),
        deliveredOrders: parseInt(summary.delivered_orders || '0'),
        totalRevenue: Math.round((parseFloat(summary.total_revenue || '0')) * 100) / 100,
        averageOrderValue: Math.round((parseFloat(summary.avg_order_value || '0')) * 100) / 100
      },
      trends: recentOrdersResult.rows.map(row => ({
        date: row.order_date,
        ordersCount: parseInt(row.orders_count || '0'),
        dailyRevenue: Math.round((parseFloat(row.daily_revenue || '0')) * 100) / 100
      })),
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Orders summary API error:', error);
    res.status(500).json({ message: 'Failed to fetch orders summary', error: error.message });
  }
});

// Phase 14: Product Variant Management
router.get('/products/:id/variants', requireAdmin, async (req, res) => {
  try {
    const variants = await storage.getProductVariants(req.params.id);
    res.json(variants);
  } catch (error) {
    console.error('Failed to fetch product variants:', error);
    res.status(500).json({ message: 'Failed to fetch product variants' });
  }
});

router.post('/products/:id/variants', [
  param('id').isUUID().withMessage('Product ID must be a valid UUID'),
  body('name').isString().notEmpty().withMessage('Name is required and must be a string'),
  body('sku').optional().isString().withMessage('SKU must be a string'),
  body('type').isString().notEmpty().withMessage('Type is required and must be a string'),
  body('attributes').optional().isObject().withMessage('Attributes must be an object'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('imageUrl').optional().isURL().withMessage('Image URL must be valid'),
  body('stockQuantity').optional().isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),
  body('inStock').optional().isBoolean().withMessage('inStock must be a boolean'),
  body('isDefault').optional().isBoolean().withMessage('isDefault must be a boolean'),
  requireAdmin
], async (req: Request, res: Response) => {
  try {
    // Check for validation errors first
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }
    
    // Use validated data directly instead of destructuring
    const name = req.body.name;
    const sku = req.body.sku;
    const type = req.body.type;
    const attributes = req.body.attributes;
    const price = req.body.price;
    const imageUrl = req.body.imageUrl;
    const stockQuantity = req.body.stockQuantity;
    const inStock = req.body.inStock;
    const isDefault = req.body.isDefault;
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
    await AdminLogger.log(
      req.user?.id || 'system',
      'CREATE_PRODUCT_VARIANT',
      'PRODUCT_VARIANT',
      variant.id,
      {
        productId,
        variantName: name,
        variantType: type,
        sku: variant.sku
      }
    );
    
    res.status(201).json(variant);
  } catch (error) {
    console.error('Failed to create product variant:', error);
    res.status(500).json({ message: 'Failed to create product variant' });
  }
});

router.put('/product-variants/:id', requireAdmin, async (req, res) => {
  try {
    // Use validated data directly from req.body after validation
    const name = req.body.name;
    const sku = req.body.sku;
    const type = req.body.type;
    const attributes = req.body.attributes;
    const price = req.body.price;
    const imageUrl = req.body.imageUrl;
    const stockQuantity = req.body.stockQuantity;
    const inStock = req.body.inStock;
    const isDefault = req.body.isDefault;
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
    await AdminLogger.log(
      req.user?.id || 'system',
      'UPDATE_PRODUCT_VARIANT',
      'PRODUCT_VARIANT',
      variantId,
      {
        productId: existingVariant.productId,
        changes: updateData
      }
    );
    
    res.json(variant);
  } catch (error) {
    console.error('Failed to update product variant:', error);
    res.status(500).json({ message: 'Failed to update product variant' });
  }
});

router.delete('/product-variants/:id', requireAdmin, async (req, res) => {
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
    await AdminLogger.log(
      req.user?.id || 'system',
      'DELETE_PRODUCT_VARIANT',
      'PRODUCT_VARIANT',
      variantId,
      {
        productId: existingVariant.productId,
        variantName: existingVariant.name,
        variantSku: existingVariant.sku
      }
    );
    
    res.json({ message: 'Product variant deleted successfully' });
  } catch (error) {
    console.error('Failed to delete product variant:', error);
    res.status(500).json({ message: 'Failed to delete product variant' });
  }
});

export default router;