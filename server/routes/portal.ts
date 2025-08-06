import express from 'express';
import { protectRoute } from '../lib/auth';
import { storage } from '../storage';

const router = express.Router();

// Protect all customer portal routes - only customer role allowed
router.use(protectRoute(['customer']));

// Customer Dashboard
router.get('/', async (req, res) => {
  try {
    const user = req.user!; // Type assertion safe due to middleware
    
    // Get customer's orders and quiz results
    const [orders, quizResults] = await Promise.all([
      storage.getOrdersByEmail(user.email),
      storage.getQuizResults().then(results => 
        results.filter(result => result.email === user.email)
      )
    ]);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      orders,
      quizResults: quizResults.map(result => ({
        id: result.id,
        completedAt: result.createdAt,
        recommendationsCount: JSON.parse(result.recommendations || '{}').primaryRecommendations?.length || 0
      })),
      stats: {
        totalOrders: orders.length,
        totalSpent: orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0)
      }
    });
  } catch (error) {
    console.error('Customer portal error:', error);
    res.status(500).json({ message: 'Failed to load portal data' });
  }
});

// Get customer's order history
router.get('/orders', async (req, res) => {
  try {
    const user = req.user!;
    const orders = await storage.getOrdersByEmail(user.email);
    
    res.json(orders.map(order => ({
      id: order.id,
      totalAmount: order.totalAmount,
      currency: order.currency,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      trackingNumber: order.trackingNumber,
      items: JSON.parse(order.orderItems)
    })));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Get specific order details
router.get('/orders/:orderId', async (req, res) => {
  try {
    const user = req.user!;
    const order = await storage.getOrderById(req.params.orderId);
    
    if (!order || order.customerEmail !== user.email) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      ...order,
      orderItems: JSON.parse(order.orderItems)
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order details' });
  }
});

// Get customer's quiz results
router.get('/quiz-results', async (req, res) => {
  try {
    const user = req.user!;
    const quizResults = await storage.getQuizResults();
    const userQuizResults = quizResults.filter(result => result.email === user.email);
    
    res.json(userQuizResults.map(result => ({
      id: result.id,
      completedAt: result.createdAt,
      answers: JSON.parse(result.answers),
      recommendations: JSON.parse(result.recommendations)
    })));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch quiz results' });
  }
});

export default router;