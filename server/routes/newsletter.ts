import express from 'express';
import { z } from 'zod';
import { sendEmail } from '../lib/email';
import { storage } from '../storage';
import { insertNewsletterSchema } from '@shared/schema';
import { newsletterLimiter } from '../middleware/rate-limiter';

const router = express.Router();

// Use the schema from shared/schema.ts for consistency

// Newsletter subscription endpoint with rate limiting and bot protection
router.post('/subscribe', newsletterLimiter, async (req, res) => {
    try {
      const result = insertNewsletterSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error.errors[0].message
        });
      }
      
      const { firstName, lastName, email, birthday, website } = result.data;
      
      // Honeypot protection - if 'website' field is filled, it's likely a bot
      if (website && website.trim() !== '') {
        console.log(`[NEWSLETTER] Bot detected - honeypot triggered: ${email}`);
        return res.status(400).json({
          success: false,
          message: 'Invalid submission. Please try again.'
        });
      }
      
      // Check for duplicate email subscription
      const existingSubscription = await storage.getNewsletterSubscription(email);
      if (existingSubscription) {
        return res.status(409).json({
          success: false,
          message: 'This email address is already subscribed to our newsletter.'
        });
      }
      
      // Store subscription in database (exclude honeypot field)
      const subscriptionData = { firstName, lastName, email, birthday, website: "" };
      const subscription = await storage.subscribeToNewsletter(subscriptionData);
      console.log(`[NEWSLETTER] New subscription stored: ${firstName} ${lastName} <${email}>`);
      
      // Send confirmation email
      try {
        await sendEmail(email, 'newsletter_confirmation', {
          firstName,
          lastName,
          email
        });
        console.log(`[NEWSLETTER] Confirmation email sent to: ${email}`);
      } catch (emailError) {
        console.error('[NEWSLETTER] Failed to send confirmation email:', emailError);
        // Don't fail the subscription if email fails
      }
      
      // Send admin notification emails
      const adminEmails = ['ms@thefourths.com', 'dn@thefourths.com'];
      for (const adminEmail of adminEmails) {
        try {
          await sendEmail(adminEmail, 'newsletter_admin_notification', {
            firstName,
            lastName,
            email,
            birthday
          });
          console.log(`[NEWSLETTER] Admin notification sent to: ${adminEmail}`);
        } catch (adminEmailError) {
          console.error(`[NEWSLETTER] Failed to send admin notification to ${adminEmail}:`, adminEmailError);
          // Don't fail the subscription if admin email fails
        }
      }
      
      res.json({
        success: true,
        message: 'Successfully subscribed to newsletter! Please check your email for confirmation.'
      });
      
    } catch (error: any) {
      console.error('[NEWSLETTER] Subscription error:', error);
      
      // Handle database constraint errors (duplicate email)
      if (error?.code === '23505' || error?.message?.includes('unique constraint')) {
        return res.status(409).json({
          success: false,
          message: 'This email address is already subscribed to our newsletter.'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to subscribe. Please try again.'
      });
    }
  }
);

export default router;