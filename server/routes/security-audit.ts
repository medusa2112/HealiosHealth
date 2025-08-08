import express from 'express';
import { requireAuth, protectRoute } from '../lib/auth';
import { SecurityValidator } from '../lib/security-validator';

const router = express.Router();

// Security audit routes - admin access required

// Run comprehensive security audit
router.get('/audit', requireAuth, async (req, res) => {
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

export default router;