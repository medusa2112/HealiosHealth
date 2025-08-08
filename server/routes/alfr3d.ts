import express from "express";
import { requireAuth, protectRoute } from "../lib/auth";
import { storage } from "../storage";
import { alfr3dExpert } from "../../lib/alfr3d/expert";
import type { SecurityIssue } from "@shared/schema";

const router = express.Router();

// All ALFR3D routes require admin authentication
router.use(requireAuth);
router.use(protectRoute(['admin']));

/**
 * Get all security issues
 */
router.get("/issues", async (req, res) => {
  try {
    const issues = await storage.getSecurityIssues();
    res.json(issues);
  } catch (error) {
    console.error('[ALFR3D] Error fetching security issues:', error);
    res.status(500).json({ error: "Failed to fetch security issues" });
  }
});

/**
 * Get ALFR3D scan status
 */
router.get("/status", async (req, res) => {
  try {
    // For now, return a simple status
    // In a real implementation, this would check the actual scan status
    res.json({
      isScanning: false,
      lastScan: new Date().toISOString(),
      issuesCount: (await storage.getSecurityIssues()).length
    });
  } catch (error) {
    console.error('[ALFR3D] Error fetching scan status:', error);
    res.status(500).json({ error: "Failed to fetch scan status" });
  }
});

/**
 * Generate AI fix prompt for a specific security issue
 * This is the key functionality the user wants - individual issue processing
 */
router.post("/issues/:id/fix-prompt", async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`[ALFR3D] Generating fix prompt for issue: ${id}`);
    
    // Get the security issue
    const issues = await storage.getSecurityIssues();
    const issue = issues.find(i => i.id === id);
    
    if (!issue) {
      return res.status(404).json({ error: "Security issue not found" });
    }

    // Generate AI fix prompt for this specific issue
    const fixPrompt = await alfr3dExpert.generateFixPrompt(issue);
    
    // Update the issue with the generated prompt
    await storage.updateSecurityIssueWithFixPrompt(id, fixPrompt);
    
    console.log(`[ALFR3D] ✓ Generated fix prompt for issue: ${issue.title}`);
    
    res.json({
      success: true,
      fixPrompt,
      message: "Fix prompt generated successfully"
    });
    
  } catch (error) {
    console.error('[ALFR3D] Error generating fix prompt:', error);
    res.status(500).json({ 
      error: "Failed to generate AI fix prompt. Please try again.",
      details: error.message 
    });
  }
});

/**
 * Start a new security scan
 */
router.post("/scan", async (req, res) => {
  try {
    // For now, return mock data
    // In a real implementation, this would trigger the actual security scanner
    res.json({
      success: true,
      message: "Security scan started",
      scanId: "mock-scan-id"
    });
  } catch (error) {
    console.error('[ALFR3D] Error starting security scan:', error);
    res.status(500).json({ error: "Failed to start security scan" });
  }
});

/**
 * Update issue status (open, in_progress, resolved)
 */
router.patch("/issues/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['open', 'in_progress', 'resolved'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // Update issue status
    const updated = await storage.updateSecurityIssueReviewStatus(id, status === 'resolved', req.user?.email);
    
    if (!updated) {
      return res.status(404).json({ error: "Security issue not found" });
    }

    res.json({
      success: true,
      issue: updated,
      message: `Issue status updated to ${status}`
    });
    
  } catch (error) {
    console.error('[ALFR3D] Error updating issue status:', error);
    res.status(500).json({ error: "Failed to update issue status" });
  }
});

export default router;