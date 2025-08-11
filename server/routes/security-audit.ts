import express from 'express';
import { z } from 'zod';
import { requireAdmin } from '../mw/requireAdmin';
import { protectRoute } from '../lib/auth';
import { SecurityValidator } from '../lib/security-validator';
import { SecurityLogger } from '../lib/security-logger';

const router = express.Router();

// Security audit routes - admin access required

// Run comprehensive security audit
router.get('/audit', requireAdmin, async (req, res) => {
  try {
    const results = await SecurityValidator.runSecurityAudit();
    const report = SecurityValidator.generateSecurityReport(results);
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
      report,
      summary: {
        totalTests: results.length,
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length,
        criticalIssues: results.filter(r => !r.passed && r.severity === 'critical').length
      }
    });
  } catch (error) {
    console.error('Security audit error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to run security audit',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Log security fix applied
router.post('/fix-log', requireAdmin, async (req, res) => {
  try {
    const securityFixSchema = z.object({
      route: z.string().min(1),
      file: z.string().min(1),
      type: z.enum(['unauthRoute', 'unvalidatedInput', 'duplicateRoute', 'rateLimitBypass', 'authBypass', 'other']),
      fixedBy: z.string().min(1),
      timestamp: z.string().min(1),
      severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      details: z.record(z.any()).optional()
    });
    
    const parsed = securityFixSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        error: 'Invalid security fix log data', 
        details: parsed.error.issues 
      });
    }
    
    await SecurityLogger.logSecurityFix(parsed.data);
    
    res.json({ 
      success: true, 
      message: 'Security fix logged successfully' 
    });
    
  } catch (error) {
    console.error('Failed to log security fix:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to log security fix',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;