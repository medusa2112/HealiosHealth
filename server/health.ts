import { Router } from 'express';
import { db } from './db';

export const healthRouter = () => {
  const r = Router();
  
  // Check auth cookies presence
  r.get('/health/auth', (req, res) => {
    const custCookie = req.cookies?.['hh_cust_sess'] ? 'present' : 'absent';
    const adminCookie = req.cookies?.['hh_admin_sess'] ? 'present' : 'absent';
    const legacyCookie = req.cookies?.['healios.sid'] ? 'present' : 'absent';
    
    res.json({ 
      custCookie, 
      adminCookie,
      legacyCookie, // Current cookie still in use
      nodeEnv: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
  });
  
  // Basic status check
  r.get('/status', async (_req, res) => {
    try {
      // Simple DB ping
      const result = await db.execute('SELECT 1');
      res.json({ 
        ok: true, 
        db: 'connected',
        migrationLevel: process.env.DRIZZLE_MIGRATION || 'unknown',
        nodeEnv: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ 
        ok: false, 
        db: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  return r;
};