import express from "express";
import { Alfr3dScanner } from "../../lib/alfr3d/scanner";
import { storage } from "../storage";
import { requireAuth, protectRoute } from "../lib/auth";
import type { SecurityFinding } from "../../types/alfr3d";

const router = express.Router();

// Initialize scanner
const scanner = new Alfr3dScanner();

// Development mode only middleware
router.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ message: 'Not found' });
  }
  next();
});

// Protect all routes - admin only
router.use(requireAuth);
router.use(protectRoute(['admin']));

// Get all security issues
router.get("/issues", async (req, res) => {
  try {
    const issues = await storage.getSecurityIssues();
    res.json(issues);
  } catch (error) {
    console.error("Error fetching security issues:", error);
    res.status(500).json({ error: "Failed to fetch security issues" });
  }
});

// Get scanner status
router.get("/status", async (req, res) => {
  try {
    const isScanning = scanner.isCurrentlyScanning();
    const lastScan = await storage.getLastScanTimestamp();
    
    res.json({
      isScanning,
      lastScan,
    });
  } catch (error) {
    console.error("Error fetching scanner status:", error);
    res.status(500).json({ error: "Failed to fetch scanner status" });
  }
});

// Trigger manual scan
router.post("/scan", async (req, res) => {
  try {
    console.log("[ALFR3D] Manual scan triggered by admin");
    
    // Perform scan in background
    scanner.performFullScan().then(async (findings) => {
      // Convert findings to security issues and store them
      const issues = findings.map(finding => ({
        type: findingTypeToIssueType(finding.type),
        severity: finding.severity,
        title: finding.message,
        description: finding.message,
        file: finding.file,
        line: finding.line?.toString(),
        route: undefined,
        recommendation: getRecommendation(finding),
        reviewed: false,
        timestamp: new Date().toISOString(),
      }));
      
      // Clear old issues and insert new ones
      await storage.clearSecurityIssues();
      for (const issue of issues) {
        await storage.createSecurityIssue(issue);
      }
      
      await storage.updateLastScanTimestamp();
      console.log(`[ALFR3D] Stored ${issues.length} security issues`);
    }).catch(error => {
      console.error("[ALFR3D] Background scan failed:", error);
    });
    
    res.json({ message: "Scan initiated", timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Error initiating scan:", error);
    res.status(500).json({ error: "Failed to initiate scan" });
  }
});

// Update issue review status
router.patch("/issues/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewed } = req.body;
    
    if (typeof reviewed !== 'boolean') {
      return res.status(400).json({ error: "reviewed must be a boolean" });
    }
    
    const updated = await storage.updateSecurityIssueReviewStatus(id, reviewed, req.user?.email);
    
    if (!updated) {
      return res.status(404).json({ error: "Issue not found" });
    }
    
    res.json({ message: "Issue updated successfully" });
  } catch (error) {
    console.error("Error updating issue:", error);
    res.status(500).json({ error: "Failed to update issue" });
  }
});

// Helper functions
function findingTypeToIssueType(findingType: SecurityFinding['type']): string {
  switch (findingType) {
    case 'api_security': return 'security';
    case 'routing_logic': return 'routing';
    case 'db_orm': return 'schema';
    case 'frontend_sync': return 'sync';
    default: return 'security';
  }
}

function getRecommendation(finding: SecurityFinding): string {
  switch (finding.type) {
    case 'api_security':
      return "Review authentication middleware, input validation, and ensure no sensitive data is exposed";
    case 'routing_logic':
      return "Verify route definitions, add missing middleware, and check for conflicts";
    case 'db_orm':
      return "Use parameterized queries, add proper WHERE clauses, and validate schema consistency";
    case 'frontend_sync':
      return "Add error handling, check type consistency, and ensure proper state management";
    default:
      return "Review code for security best practices";
  }
}

// Start background scanning when module loads (development only)
if (process.env.NODE_ENV === 'development') {
  scanner.startBackgroundScanning(30000); // Every 30 seconds
  console.log("[ALFR3D] Background security scanning started");
}

export default router;