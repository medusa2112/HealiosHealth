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
      
      // Send welcome email (optional)
      try {
        await sendEmail(email, 'referral_welcome', {
          customerName: `${firstName} ${lastName}`,
          email: email
        });
        console.log(`[NEWSLETTER] Welcome email sent to ${email}`);
      } catch (emailError) {
        console.error(`[NEWSLETTER] Failed to send welcome email:`, emailError);
        // Don't fail the subscription if email fails
      }
      
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