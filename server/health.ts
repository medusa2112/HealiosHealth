import { Router } from 'express';
import { db } from './db';

export const healthRouter = () => {
  const r = Router();
  
  // Note: /health/auth endpoint moved to server/routes/health.ts for richer auth status
  
  // Basic status check with no-cache headers
  r.get('/status', async (_req, res) => {
    // Set no-cache headers for health checks
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    try {
      // Simple DB ping
      const result = await db.execute('SELECT 1');
      res.json({ 
        status: 'healthy',
        ok: true, 
        db: 'connected',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
      });
    } catch (error) {
      res.status(500).json({ 
        status: 'unhealthy',
        ok: false, 
        db: 'disconnected',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  return r;
};