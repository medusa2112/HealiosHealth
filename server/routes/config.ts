import express from 'express';
import { ENV } from '../config/env';

const router = express.Router();

// Get Google Maps API key for frontend  
router.get('/google-maps-key', (req, res) => {
  // Use the centralized configuration for Google Maps API key
  const apiKey = ENV.GOOGLE_MAPS_BROWSER_KEY;
  
  if (!apiKey) {
    
    return res.status(404).json({ error: 'Google Maps Browser API key not configured' });
  }

  res.json({ apiKey });
});

export { router as configRouter };