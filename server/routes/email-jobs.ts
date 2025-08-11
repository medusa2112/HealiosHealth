// Phase 19: Email Jobs API Routes for Manual Testing and Admin Control
import { Router } from "express";
import { requireAdmin } from '../mw/requireAdmin';
import { processAbandonedCartEmails } from "../jobs/emailAbandonedCarts";
import { processReorderReminders } from "../jobs/emailReorderReminders";
import { emailScheduler } from "../jobs/scheduler";
import { storage } from "../storage";

const router = Router();

// Manual trigger for abandoned cart emails (Admin only)
router.post("/abandoned-carts", requireAdmin, async (req, res) => {
  try {
    console.log("[EMAIL-JOBS API] Manually triggering abandoned cart emails...");
    await processAbandonedCartEmails();
    res.json({ 
      success: true, 
      message: "Abandoned cart emails processed successfully" 
    });
  } catch (error) {
    console.error("[EMAIL-JOBS API] Error processing abandoned cart emails:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to process abandoned cart emails" 
    });
  }
});

// Manual trigger for reorder reminder emails (Admin only)
router.post("/reorder-reminders", requireAdmin, async (req, res) => {
  try {
    console.log("[EMAIL-JOBS API] Manually triggering reorder reminder emails...");
    await processReorderReminders();
    res.json({ 
      success: true, 
      message: "Reorder reminder emails processed successfully" 
    });
  } catch (error) {
    console.error("[EMAIL-JOBS API] Error processing reorder reminder emails:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to process reorder reminder emails" 
    });
  }
});

// Trigger both email jobs at once
router.post("/all", requireAdmin, async (req, res) => {
  try {
    console.log("[EMAIL-JOBS API] Manually triggering all email jobs...");
    await emailScheduler.runNow();
    res.json({ 
      success: true, 
      message: "All email jobs processed successfully" 
    });
  } catch (error) {
    console.error("[EMAIL-JOBS API] Error processing email jobs:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to process email jobs" 
    });
  }
});

// Get email job statistics
router.get("/stats", requireAdmin, async (req, res) => {
  try {
    const abandonedCarts1h = await storage.getAbandonedCarts(1);
    const abandonedCarts24h = await storage.getAbandonedCarts(24);
    const reorderCandidates = await storage.getReorderCandidates(45);
    
    const emailEvents = await storage.getEmailEventsByType("abandoned_cart_1h");
    const emailEvents24h = await storage.getEmailEventsByType("abandoned_cart_24h");
    const reorderEmails = await storage.getEmailEventsByType("reorder_reminder");
    const finalReorderEmails = await storage.getEmailEventsByType("reorder_final");

    res.json({
      success: true,
      stats: {
        abandonedCarts: {
          oneHour: abandonedCarts1h.length,
          twentyFourHour: abandonedCarts24h.length
        },
        reorderCandidates: reorderCandidates.length,
        emailsSent: {
          abandonedCart1h: emailEvents.length,
          abandonedCart24h: emailEvents24h.length,
          reorderReminders: reorderEmails.length,
          finalReorderReminders: finalReorderEmails.length,
          total: emailEvents.length + emailEvents24h.length + reorderEmails.length + finalReorderEmails.length
        }
      }
    });
  } catch (error) {
    console.error("[EMAIL-JOBS API] Error getting stats:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to get email job statistics" 
    });
  }
});

// Start/stop the email scheduler
router.post("/scheduler/start", requireAdmin, async (req, res) => {
  try {
    emailScheduler.start();
    res.json({ 
      success: true, 
      message: "Email scheduler started successfully" 
    });
  } catch (error) {
    console.error("[EMAIL-JOBS API] Error starting scheduler:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to start email scheduler" 
    });
  }
});

router.post("/scheduler/stop", requireAdmin, async (req, res) => {
  try {
    emailScheduler.stop();
    res.json({ 
      success: true, 
      message: "Email scheduler stopped successfully" 
    });
  } catch (error) {
    console.error("[EMAIL-JOBS API] Error stopping scheduler:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to stop email scheduler" 
    });
  }
});

export default router;