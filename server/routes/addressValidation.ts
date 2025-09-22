import express, { Request, Response } from 'express';
import { z } from 'zod';
import { addressValidation } from '../lib/addressValidation';
import { logger } from '../lib/logger';
import { protectRoute } from '../lib/auth';

const router = express.Router();

// Bypass CSRF for address validation in development
const bypassCSRF = (req: any, res: any, next: any) => {
  if (process.env.NODE_ENV === 'development') {
    
    req.csrfToken = () => 'dev-bypass';
    // Skip CSRF validation
    next();
  } else {
    next();
  }
};

// Address validation schema for South Africa
const addressValidationSchema = z.object({
  addressLines: z.array(z.string()).min(1, 'At least one address line is required'),
  regionCode: z.string().optional().default('ZA')
});

// Postal code validation schema
const postalValidationSchema = z.object({
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(2, 'Country code is required')
});

// CSRF bypass middleware for address validation in development
const bypassCSRFForDev = (req: any, res: any, next: any) => {
  if (process.env.NODE_ENV === 'development') {
    
    return next('route');
  }
  next();
};

// Validate complete address using Google Address Validation API
router.post('/validate', protectRoute, bypassCSRFForDev);

// Development route (no CSRF)
router.post('/validate', protectRoute, async (req: Request, res: Response) => {
  try {
    const validationResult = addressValidationSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        errors: validationResult.error.errors.map(e => e.message)
      });
    }

    const { addressLines, regionCode } = validationResult.data;
    const result = await addressValidation.validateAddress(addressLines, regionCode);

    logger.info('ADDRESS_VALIDATION', 'Address validation request', { 
      addressLines,
      regionCode,
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
router.post('/validate-postal', protectRoute, bypassCSRF, async (req: Request, res: Response) => {
  try {
    const validationResult = postalValidationSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        errors: validationResult.error.errors.map(e => e.message)
      });
    }

    const { postalCode, country } = validationResult.data;

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