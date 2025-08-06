import express from 'express';
import { protectRoute } from '../lib/auth';
import { storage } from '../storage';

const router = express.Router();

// Protect all admin routes - only admin role allowed
router.use(protectRoute(['admin']));

// Admin Dashboard - Overview stats
router.get('/', async (req, res) => {
  try {
    const [products, orders, quizResults, newsletters] = await Promise.all([
      storage.getProducts(),
      storage.getOrdersByEmail(''), // Get all orders - we'll need to modify this
      storage.getQuizResults(),
      // We'll need a method to get all newsletters
    ]);

    res.json({
      stats: {
        totalProducts: products.length,
        totalOrders: orders.length,
        totalQuizCompletions: quizResults.length,
        recentOrders: orders.slice(-5),
        lowStockProducts: products.filter(p => (p.stockQuantity || 0) < 5)
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Failed to load dashboard data' });
  }
});

// Product Management - Full CRUD
router.get('/products', async (req, res) => {
  try {
    const products = await storage.getProducts();
    res.json(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const product = await storage.getProduct(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Failed to fetch product:', error);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});

router.post('/products', async (req, res) => {
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

    const product = await storage.createProduct(productData);
    res.status(201).json(product);
  } catch (error) {
    console.error('Failed to create product:', error);
    res.status(500).json({ message: 'Failed to create product' });
  }
});

router.put('/products/:id', async (req, res) => {
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

    const product = await storage.updateProduct(req.params.id, updates);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Failed to update product:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const success = await storage.deleteProduct(req.params.id);
    if (!success) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(204).end();
  } catch (error) {
    console.error('Failed to delete product:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

router.put('/products/:id/stock', async (req, res) => {
  try {
    const { quantity } = req.body;
    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    const product = await storage.updateProductStock(req.params.id, quantity);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

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
    const quizResults = await storage.getQuizResults();
    
    res.json({
      totalCompletions: quizResults.length,
      recentCompletions: quizResults
        .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
        .slice(0, 20)
        .map(result => ({
          id: result.id,
          name: `${result.firstName} ${result.lastName}`,
          email: result.email,
          completedAt: result.createdAt,
          consentToMarketing: result.consentToMarketing
        }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get quiz analytics' });
  }
});

export default router;