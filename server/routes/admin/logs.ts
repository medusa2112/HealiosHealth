import express from "express";
import { storage } from "../../storage";
// Authentication removed - admin routes now publicly accessible

const router = express.Router();

// Admin log routes accessible without authentication

// Get admin activity logs with optional filters
router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const adminId = req.query.adminId as string;
    const targetType = req.query.targetType as string;
    const targetId = req.query.targetId as string;
    
    let logs;
    
    if (adminId) {
      logs = await storage.getAdminLogsByAdmin(adminId);
    } else if (targetType && targetId) {
      logs = await storage.getAdminLogsByTarget(targetType, targetId);
    } else {
      logs = await storage.getAdminLogs(limit);
    }
    
    res.json(logs);
  } catch (error) {
    console.error("Failed to fetch admin logs:", error);
    res.status(500).json({ message: "Failed to fetch admin logs" });
  }
});

// Get logs for a specific admin user
router.get("/admin/:adminId", async (req, res) => {
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
router.get("/target/:targetType/:targetId", async (req, res) => {
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