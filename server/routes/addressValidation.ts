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

// Address validation schema for South Africa
const addressValidationSchema = z.object({
  addressLines: z.array(z.string()).min(1, 'At least one address line is required'),
  regionCode: z.string().optional().default('ZA')
});

// Validate complete address using Google Address Validation API
router.post('/validate', bypassCSRF, async (req, res) => {
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