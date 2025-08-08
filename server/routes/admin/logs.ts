import express from "express";
import { requireAuth } from "../../lib/auth";
import { storage } from "../../storage";
import { z } from "zod";

const router = express.Router();

// Admin log routes - authentication required

// Get admin activity logs with pagination and filtering
router.get("/", requireAuth, async (req, res) => {
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
router.get("/admin/:adminId", requireAuth, async (req, res) => {
  try {
    const { adminId } = req.params;
    const logs = await storage.getAdminLogsByAdmin(adminId);
    res.json(logs);
  } catch (error) {
    console.error("Failed to fetch admin logs by admin:", error);
    res.status(500).json({ message: "Failed to fetch admin logs" });
  }
});

// Get logs for a specific target
router.get("/target/:targetType/:targetId", requireAuth, async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const logs = await storage.getAdminLogsByTarget(targetType, targetId);
    res.json(logs);
  } catch (error) {
    console.error("Failed to fetch logs by target:", error);
    res.status(500).json({ message: "Failed to fetch logs by target" });
  }
});

export default router;