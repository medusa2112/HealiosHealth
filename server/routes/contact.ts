import { Router } from 'express';
import { z } from 'zod';
import { rateLimit } from '../lib/auth';
import { EmailService } from '../email';

const router = Router();

// Contact form schema
const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Valid email is required"),
  subject: z.string().min(1, "Subject is required").max(200),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000)
});

// Submit contact form
router.post('/', rateLimit(5, 300000), async (req, res) => {
  try {
    const validatedData = contactFormSchema.parse(req.body);
    
    // Log contact form submission (email service method doesn't exist yet)
    console.log(`[CONTACT] Contact form submitted by ${validatedData.name} <${validatedData.email}>: ${validatedData.subject}`);
    console.log(`[CONTACT] Message: ${validatedData.message}`);
    
    // TODO: Implement EmailService.sendAdminAlert method for notifications
    
    res.json({ 
      success: true,
      message: "Thank you for your message. We'll get back to you soon!" 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid form data", 
        errors: error.errors 
      });
    }
    console.error('Contact form error:', error);
    res.status(500).json({ 
      message: "Failed to send message. Please try again later." 
    });
  }
});

export default router;