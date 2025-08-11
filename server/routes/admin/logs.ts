import express, { Request, Response } from "express";
import { param, validationResult } from "express-validator";
import { requireAdmin } from '../../mw/requireAdmin';
import { storage } from "../../storage";
import { z } from "zod";

const router = express.Router();

// Middleware to check admin role
async function requireAdmin(req: Request, res: Response, next: Function) {
  const user = req.user as any;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Admin log routes - authentication and admin role required

// Get admin activity logs with pagination and filtering
router.get("/", requireAdmin, requireAdmin, async (req, res) => {
  try {
    // Parse and validate query parameters
    const querySchema = z.object({
      page: z.string().optional().transform(val => Math.max(1, parseInt(val || '1', 10))),
      limit: z.string().optional().transform(val => Math.min(100, Math.max(10, parseInt(val || '50', 10)))),
      hours: z.string().optional(),
      search: z.string().optional(),
      actionFilter: z.string().optional(),
      targetFilter: z.string().optional(),
      adminId: z.string().optional(),
      targetType: z.string().optional(),
      targetId: z.string().optional()
    });
    
    const result = querySchema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Invalid query parameters',
        details: result.error.errors
      });
    }
    
    const { page, limit, hours, search, actionFilter, targetFilter, adminId, targetType, targetId } = result.data;
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Build filters object
    const filters: any = {
      limit,
      offset,
      search: search || null,
      actionFilter: actionFilter === 'all' ? null : actionFilter,
      targetFilter: targetFilter === 'all' ? null : targetFilter,
      hours: hours === 'all' ? null : (hours ? parseInt(hours, 10) : null),
      adminId: adminId || null,
      targetType: targetType || null,
      targetId: targetId || null
    };
    
    // Get logs with filtering and pagination
    const { logs, total } = await storage.getAdminLogsWithPagination(filters);
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      logs,
      total,
      page,
      totalPages,
      hasMore: page < totalPages
    });
  } catch (error) {
    console.error("Failed to fetch admin logs:", error);
    res.status(500).json({ message: "Failed to fetch admin logs" });
  }
});

// Get logs for a specific admin user
router.get("/admin/:adminId", [
  param('adminId').isUUID().withMessage('Admin ID must be a valid UUID'),
  requireAdmin,
  requireAdmin
], async (req: Request, res: Response) => {
  try {
    // Check for validation errors first
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }
    
    // Use validated data directly instead of destructuring
    const adminId = req.params.adminId;
    const logs = await storage.getAdminLogsByAdmin(adminId);
    res.json(logs);
  } catch (error) {
    console.error("Failed to fetch admin logs by admin:", error);
    res.status(500).json({ message: "Failed to fetch admin logs" });
  }
});

// Get logs for a specific target
router.get("/target/:targetType/:targetId", [
  param('targetType').isAlpha().withMessage('Target type must contain only letters'),
  param('targetId').isLength({ min: 1, max: 50 }).withMessage('Target ID must be 1-50 characters'),
  requireAdmin,
  requireAdmin
], async (req: Request, res: Response) => {
  try {
    // Check for validation errors first
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }
    
    // Use validated data directly instead of destructuring
    const targetType = req.params.targetType;
    const targetId = req.params.targetId;
    const logs = await storage.getAdminLogsByTarget(targetType, targetId);
    res.json(logs);
  } catch (error) {
    console.error("Failed to fetch logs by target:", error);
    res.status(500).json({ message: "Failed to fetch logs by target" });
  }
});

export default router;