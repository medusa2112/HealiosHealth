import express from 'express';

const router = express.Router();

// Get Google Maps API key for frontend
router.get('/google-maps-key', (req, res) => {
  const apiKey = process.env.ENV_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return res.status(404).json({ error: 'Google Maps API key not configured' });
  }
  
  res.json({ apiKey });
});

export { router as configRouter };