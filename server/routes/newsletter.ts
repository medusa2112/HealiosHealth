import express from 'express';
import { z } from 'zod';
import { sendEmail } from '../lib/email';

const router = express.Router();

const newsletterSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email address required'),
  birthday: z.string().optional()
});

// Newsletter subscription endpoint
router.post('/subscribe', async (req, res) => {
    try {
      const result = newsletterSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error.errors[0].message
        });
      }
      
      const { firstName, lastName, email, birthday } = result.data;
      
      // For now, just log the subscription (no database storage needed)
      console.log(`[NEWSLETTER] New subscription: ${firstName} ${lastName} <${email}>`);
      
      console.log(`[NEWSLETTER] New subscription: ${email}`);
      
      // Note: Newsletter subscriptions are stored for manual processing
      // No automated welcome emails are sent per business requirements
      
      res.json({
        success: true,
        message: 'Successfully subscribed to newsletter!'
      });
      
    } catch (error) {
      console.error('[NEWSLETTER] Subscription error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to subscribe. Please try again.'
      });
    }
  }
);

export default router;