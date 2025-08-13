import express from 'express';

const router = express.Router();

// Get Google Maps API key for frontend  
router.get('/google-maps-key', (req, res) => {
  // For Places API to work on frontend, we need to use the server key
  // that has Places API (New) enabled, since that's where Places API is configured
  const apiKey = process.env.GOOGLE_MAPS_SERVER_KEY || process.env.ENV_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    console.log('Google Maps API key not found in environment variables');
    return res.status(404).json({ error: 'Google Maps API key not configured' });
  }
  
  console.log('Returning Google Maps API key with Places API access to client');
  res.json({ apiKey });
});

export { router as configRouter };