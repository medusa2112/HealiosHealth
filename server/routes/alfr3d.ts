import express from "express";
import { z } from "zod";
import { requireAuth, protectRoute } from "../lib/auth";
import { storage } from "../storage";
import { alfr3dExpert } from "../../lib/alfr3d/expert";
import type { SecurityIssue } from "@shared/schema";
import { spawn } from "child_process";
import { readFileSync } from "fs";
import path from "path";

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
    const paramsSchema = z.object({
      id: z.string().min(1)
    });
    
    const parsed = paramsSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
    }
    
    const { id } = parsed.data;
    
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
    
    console.log(`[ALFR3D] ✓ Generated fix prompt for issue: ${issue.id}`);
    
    res.json({
      success: true,
      fixPrompt,
      message: "Fix prompt generated successfully"
    });
    
  } catch (error) {
    console.error('[ALFR3D] Error generating fix prompt:', error);
    res.status(500).json({ 
      error: "Failed to generate AI fix prompt. Please try again.",
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

/**
 * Start a new security scan
 */
router.post("/scan", async (req, res) => {
  try {
    console.log('[ALFR3D] Starting actual security scan...');
    
    // Run the security scanner
    const scannerPath = path.join(process.cwd(), 'server', 'security-scanner.ts');
    const scanProcess = spawn('tsx', [scannerPath], {
      cwd: process.cwd(),
      stdio: 'pipe'
    });
    
    let scanOutput = '';
    let scanError = '';
    
    scanProcess.stdout.on('data', (data) => {
      scanOutput += data.toString();
    });
    
    scanProcess.stderr.on('data', (data) => {
      scanError += data.toString();
    });
    
    scanProcess.on('close', async (code) => {
      try {
        if (code === 0) {
          console.log('[ALFR3D] Security scan completed successfully');
          console.log('[ALFR3D] Scan output:', scanOutput);
          
          // Read the updated CSV file with scan results
          try {
            const csvPath = path.join(process.cwd(), 'security-issues.csv');
            const csvContent = readFileSync(csvPath, 'utf-8');
            
            // Parse CSV and update stored issues
            const lines = csvContent.split('\n').slice(1); // Skip header
            const updatedIssues: SecurityIssue[] = [];
            
            for (const line of lines) {
              if (line.trim()) {
                const [id, type, description, severity, file, lineNumber, snippet, fixed] = line.split(',');
                
                updatedIssues.push({
                  id: id.trim(),
                  type: type.trim(),
                  filePath: file.trim(),
                  line: parseInt(lineNumber) || 0,
                  snippet: snippet.replace(/^"|"$/g, '').trim(),
                  fixed: fixed.trim() === 'true',
                  createdAt: new Date().toISOString()
                });
              }
            }
            
            // Update storage with fresh scan results
            await storage.updateAllSecurityIssues(updatedIssues);
            console.log(`[ALFR3D] Updated ${updatedIssues.length} security issues in storage`);
            
          } catch (csvError) {
            console.warn('[ALFR3D] Could not read/parse CSV file:', csvError instanceof Error ? csvError.message : csvError);
            // Continue anyway - the scan might not have found issues
          }
        } else {
          console.error('[ALFR3D] Security scan failed with code:', code);
          console.error('[ALFR3D] Scan error:', scanError);
        }
      } catch (updateError) {
        console.error('[ALFR3D] Error updating scan results:', updateError);
      }
    });
    
    // Don't wait for the scan to complete - return immediately
    res.json({
      success: true,
      message: "Security scan started",
      scanId: `scan-${Date.now()}`
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
    const paramsSchema = z.object({
      id: z.string().min(1)
    });
    
    const bodySchema = z.object({
      status: z.enum(['open', 'in_progress', 'resolved'])
    });
    
    const paramsResult = paramsSchema.safeParse(req.params);
    if (!paramsResult.success) {
      return res.status(400).json({ error: 'Invalid params', details: paramsResult.error.issues });
    }
    
    const bodyResult = bodySchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({ error: 'Invalid input', details: bodyResult.error.issues });
    }
    
    const { id } = paramsResult.data;
    const { status } = bodyResult.data;

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