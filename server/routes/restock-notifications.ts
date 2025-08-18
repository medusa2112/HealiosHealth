import express from 'express';
import { z } from 'zod';
import { sendEmail } from '../lib/email';

const router = express.Router();

const restockSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email address required'),
  agreeToContact: z.boolean().refine(val => val === true, 'You must agree to be contacted'),
  productId: z.string().min(1, 'Product ID is required'),
  productName: z.string().min(1, 'Product name is required'),
  requestedAt: z.string()
});

// Restock notification endpoint
router.post('/', async (req, res) => {
    try {
      const result = restockSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error.errors[0].message
        });
      }
      
      const { firstName, lastName, email, productId, productName, requestedAt } = result.data;
      
      // Store restock notification request
      const notification = {
        email,
        firstName,
        lastName,
        productId,
        productName,
        requestedAt: new Date().toISOString(),
        notified: false
      };
      
      // For now, just log the request (no database storage needed)
      console.log(`[RESTOCK] Notification request for ${productName} from ${email}`);
      
      // Send confirmation email to user
      try {
        await sendEmail(email, 'admin_alert', {
          customerName: `${firstName} ${lastName}`,
          productName,
          email
        });
        console.log(`[RESTOCK] Confirmation email sent to ${email}`);
      } catch (emailError) {
        console.error(`[RESTOCK] Failed to send confirmation email:`, emailError);
      }
      
      // Send alert to admin about restock request
      try {
        await sendEmail('dn@thefourths.com', 'admin_alert', {
          title: `Restock Request: ${productName}`,
          message: `New restock notification request from ${firstName} ${lastName} (${email}) for product: ${productName}`,
          productId,
          email
        });
        console.log(`[RESTOCK] Admin alert sent for ${productName}`);
      } catch (emailError) {
        console.error(`[RESTOCK] Failed to send admin alert:`, emailError);
      }
      
      res.json({
        success: true,
        message: `We'll notify you when ${productName} is back in stock!`
      });
      
    } catch (error) {
      console.error('[RESTOCK] Request error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to set restock notification. Please try again.'
      });
    }
  }
);

export default router;