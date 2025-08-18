import { Router } from 'express';
import { z } from 'zod';
import { rateLimit } from '../lib/auth';
import { storage } from '../storage';
import { EmailService } from '../email';

const router = Router();

// Review submission schema
const reviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  rating: z.number().min(1).max(5),
  title: z.string().min(1, "Review title is required").max(100),
  comment: z.string().min(10, "Review must be at least 10 characters").max(1000),
  customerName: z.string().min(1, "Name is required").max(100),
  customerEmail: z.string().email("Valid email is required")
});

// Submit product review
router.post('/', rateLimit(3, 300000), async (req, res) => {
  try {
    const validatedData = reviewSchema.parse(req.body);
    
    // Create review in storage (would normally go to database)
    const review = {
      id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...validatedData,
      status: 'pending', // Reviews need moderation
      createdAt: new Date().toISOString()
    };
    
    // Store review (this would go to database in real implementation)
    console.log('[REVIEW] New review submitted:', review);
    
    // Send admin alert notification
    try {
      await EmailService.sendAdminAlert({
        subject: `New Product Review: ${review.title}`,
        message: `New review for product ${review.productId} by ${review.customerName} (${review.customerEmail}). Rating: ${review.rating}/5. Comment: ${review.comment}`,
        severity: 'info'
      });
    } catch (emailError) {
      console.error('Failed to send review notification:', emailError);
      // Don't fail the review submission if email fails
    }
    
    res.json({ 
      success: true,
      message: "Thank you for your review! We'll review it and publish it soon.",
      reviewId: review.id
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid review data", 
        errors: error.errors 
      });
    }
    console.error('Review submission error:', error);
    res.status(500).json({ 
      message: "Failed to submit review. Please try again later." 
    });
  }
});

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    // In a real implementation, this would fetch from database
    // For now, return empty array since we're just storing in console
    const reviews: any[] = [];
    
    res.json(reviews);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ 
      message: "Failed to fetch reviews" 
    });
  }
});

export default router;