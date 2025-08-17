import express from 'express';

const router = express.Router();

// Get Google Maps API key for frontend  
router.get('/google-maps-key', (req, res) => {
  // Use the browser key for frontend JavaScript API (Maps JavaScript API)
  const apiKey = process.env.GOOGLE_MAPS_BROWSER_KEY || process.env.ENV_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    
    return res.status(404).json({ error: 'Google Maps Browser API key not configured' });
  }

  res.json({ apiKey });
});

export { router as configRouter };