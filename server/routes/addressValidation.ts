import express from 'express';
import { z } from 'zod';
import { addressValidation } from '../lib/addressValidation';
import { logger } from '../lib/logger';

const router = express.Router();

// Bypass CSRF for address validation in development
const bypassCSRF = (req: any, res: any, next: any) => {
  if (process.env.NODE_ENV === 'development') {
    req.csrfToken = () => 'dev-bypass';
    next();
  } else {
    next();
  }
};

// Address validation schema
const addressValidationSchema = z.object({
  line1: z.string().min(1, 'Street address is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State/Province is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required')
});

// Validate complete address
router.post('/validate', bypassCSRF, async (req, res) => {
  try {
    const validationResult = addressValidationSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        errors: validationResult.error.errors.map(e => e.message)
      });
    }

    const address = validationResult.data;
    const result = await addressValidation.validateAddress(address);

    logger.info('ADDRESS_VALIDATION', 'Address validation request', { 
      address: address.line1,
      city: address.city,
      isValid: result.isValid,
      confidence: result.confidence
    });

    res.json({
      success: true,
      validation: result
    });
  } catch (error) {
    logger.error('ADDRESS_VALIDATION', 'Validation error', { error });
    res.status(500).json({
      success: false,
      errors: ['Internal server error']
    });
  }
});

// Validate postal code only
router.post('/validate-postal', bypassCSRF, async (req, res) => {
  try {
    const { postalCode, country } = req.body;
    
    if (!postalCode || !country) {
      return res.status(400).json({
        success: false,
        errors: ['Postal code and country are required']
      });
    }

    const isValid = await addressValidation.validatePostalCode(postalCode, country);

    res.json({
      success: true,
      isValid
    });
  } catch (error) {
    logger.error('ADDRESS_VALIDATION', 'Postal code validation error', { error });
    res.status(500).json({
      success: false,
      errors: ['Internal server error']
    });
  }
});

export default router;