import express from 'express';
import { csrfTokenEndpoint } from '../middleware/csrf';

const router = express.Router();

// Get CSRF token endpoint
router.get('/token', csrfTokenEndpoint);

export default router;