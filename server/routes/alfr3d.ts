import express from "express";
import { Alfr3dScanner } from "../../lib/alfr3d/scanner";
import { alfr3dExpert } from "../../lib/alfr3d/expert";
import { storage } from "../storage";
import { requireAuth, protectRoute } from "../lib/auth";
import type { SecurityFinding } from "../../types/alfr3d";
import type { SecurityIssue as SecurityIssueInterface } from "../../types/alfr3d";
import type { SecurityIssue as DatabaseSecurityIssue } from "@shared/alfr3d-schema";

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
        issueKey: `${finding.type}-${finding.file}-${finding.line || 'noLine'}-${finding.message.replace(/\s+/g, '')}`,
        archived: false,
        fixAttempts: []
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

// Convert database SecurityIssue to expert SecurityIssue format
function convertDatabaseIssueToExpertFormat(dbIssue: DatabaseSecurityIssue): SecurityIssueInterface {
  return {
    id: dbIssue.id,
    type: dbIssue.type as 'security' | 'routing' | 'schema' | 'sync',
    severity: dbIssue.severity as 'low' | 'medium' | 'high' | 'critical',
    title: dbIssue.title,
    description: dbIssue.description,
    file: dbIssue.file,
    line: (dbIssue.line && dbIssue.line !== null) ? parseInt(dbIssue.line) : undefined,
    route: dbIssue.route || undefined,
    recommendation: dbIssue.recommendation,
    timestamp: dbIssue.createdAt?.toISOString() || new Date().toISOString(),
    reviewed: dbIssue.reviewed,
    reviewedAt: dbIssue.reviewedAt?.toISOString() || undefined,
    reviewedBy: dbIssue.reviewedBy || undefined,
    archived: dbIssue.archived,
    archivedAt: dbIssue.archivedAt?.toISOString() || undefined,
    archivedBy: dbIssue.archivedBy || undefined,
    fixPrompt: dbIssue.fixPrompt as any,
    fixAttempts: (dbIssue.fixAttempts as any) || [],
    issueKey: dbIssue.issueKey
  };
}

// Generate AI fix prompt for an issue
router.post("/issues/:id/fix-prompt", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[ALFR3D Expert] Starting fix prompt generation for issue: ${id}`);
    
    const dbIssue = await storage.getSecurityIssueById(id);
    
    if (!dbIssue) {
      console.log(`[ALFR3D Expert] Issue not found: ${id}`);
      return res.status(404).json({ error: "Issue not found" });
    }
    
    console.log(`[ALFR3D Expert] Found issue: ${dbIssue.title}`);
    
    // Convert database format to expert interface format
    const expertIssue = convertDatabaseIssueToExpertFormat(dbIssue);
    console.log(`[ALFR3D Expert] Converted issue format successfully`);
    
    // Generate AI fix prompt
    console.log(`[ALFR3D Expert] Calling AI expert for issue: ${expertIssue.title}`);
    const fixPrompt = await alfr3dExpert.generateFixPrompt(expertIssue);
    console.log(`[ALFR3D Expert] AI expert returned prompt successfully`);
    
    // Add metadata to fix prompt
    const promptWithMetadata = {
      ...fixPrompt,
      generatedAt: new Date().toISOString(),
      generatedBy: req.user?.email || 'system'
    };
    
    console.log(`[ALFR3D Expert] Fix prompt generated successfully for issue: ${id}`);
    res.json({ fixPrompt: promptWithMetadata, message: "Fix prompt generated successfully" });
  } catch (error: any) {
    console.error("[ALFR3D Expert] Error generating fix prompt:", error);
    console.error("[ALFR3D Expert] Error details:", {
      message: error?.message,
      stack: error?.stack,
      issueId: req.params.id
    });
    res.status(500).json({ error: "Failed to generate fix prompt", details: error?.message });
  }
});

// Archive/unarchive issue
router.patch("/issues/:id/archive", async (req, res) => {
  try {
    const { id } = req.params;
    const { archived } = req.body;
    
    if (typeof archived !== 'boolean') {
      return res.status(400).json({ error: "archived must be a boolean" });
    }
    
    const updated = archived 
      ? await storage.archiveSecurityIssue(id, req.user?.email || 'system')
      : await storage.unarchiveSecurityIssue(id);
    
    if (!updated) {
      return res.status(404).json({ error: "Issue not found" });
    }
    
    res.json({ message: archived ? "Issue archived successfully" : "Issue unarchived successfully" });
  } catch (error) {
    console.error("Error archiving/unarchiving issue:", error);
    res.status(500).json({ error: "Failed to update archive status" });
  }
});

// Get archived issues
router.get("/archived", async (req, res) => {
  try {
    const archivedIssues = await storage.getArchivedSecurityIssues();
    res.json(archivedIssues);
  } catch (error) {
    console.error("Error fetching archived issues:", error);
    res.status(500).json({ error: "Failed to fetch archived issues" });
  }
});

// Record fix attempt
router.post("/issues/:id/fix-attempts", async (req, res) => {
  try {
    const { id } = req.params;
    const { success, notes, scanResultBefore, scanResultAfter, newIssuesIntroduced } = req.body;
    
    if (typeof success !== 'boolean' || 
        typeof scanResultBefore !== 'number' || 
        typeof scanResultAfter !== 'number' || 
        typeof newIssuesIntroduced !== 'number') {
      return res.status(400).json({ error: "Invalid fix attempt data" });
    }
    
    const issue = await storage.getSecurityIssueById(id);
    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }
    
    const fixAttempt = await storage.recordFixAttempt(id, {
      appliedBy: req.user?.email || 'system',
      success,
      notes,
      scanResultBefore,
      scanResultAfter,
      newIssuesIntroduced
    });
    
    res.json({ fixAttempt, message: "Fix attempt recorded successfully" });
  } catch (error) {
    console.error("Error recording fix attempt:", error);
    res.status(500).json({ error: "Failed to record fix attempt" });
  }
});

// Get fix attempts for an issue
router.get("/issues/:id/fix-attempts", async (req, res) => {
  try {
    const { id } = req.params;
    const fixAttempts = await storage.getFixAttempts(id);
    res.json(fixAttempts);
  } catch (error) {
    console.error("Error fetching fix attempts:", error);
    res.status(500).json({ error: "Failed to fetch fix attempts" });
  }
});

// Compare scan results for fix effectiveness
router.post("/compare", async (req, res) => {
  try {
    const { beforeIssues, afterIssues } = req.body;
    
    if (!Array.isArray(beforeIssues) || !Array.isArray(afterIssues)) {
      return res.status(400).json({ error: "beforeIssues and afterIssues must be arrays" });
    }
    
    const analysis = await alfr3dExpert.analyzeFixEffectiveness(beforeIssues, afterIssues);
    res.json(analysis);
  } catch (error) {
    console.error("Error comparing scan results:", error);
    res.status(500).json({ error: "Failed to compare scan results" });
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

// Start background scanning when module loads (development only) - DISABLED FOR TESTING
// Background scanning disabled to prevent interference with manual fix prompts
if (process.env.NODE_ENV === 'development' && process.env.ALFR3D_BACKGROUND_SCAN === 'true') {
  scanner.startBackgroundScanning(300000); // Every 5 minutes instead of 30 seconds
  console.log("[ALFR3D] Background security scanning started (5min intervals)");
} else {
  console.log("[ALFR3D] Background scanning disabled - use manual scan button");
}

export default router;