// Phase 19: Email Job Scheduler
import { processAbandonedCartEmails } from "./emailAbandonedCarts";
import { processReorderReminders } from "./emailReorderReminders";

// Run email jobs every hour
const EMAIL_JOB_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

export class EmailJobScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  start(): void {
    if (this.isRunning) {
      console.log("[SCHEDULER] Email job scheduler is already running");
      return;
    }

    console.log("[SCHEDULER] Starting email job scheduler (runs every hour)");
    this.isRunning = true;

    // Run immediately on start
    this.runJobs();

    // Schedule to run every hour
    this.intervalId = setInterval(() => {
      this.runJobs();
    }, EMAIL_JOB_INTERVAL);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log("[SCHEDULER] Email job scheduler stopped");
  }

  private async runJobs(): Promise<void> {
    const startTime = Date.now();
    console.log(`[SCHEDULER] Running email jobs at ${new Date().toISOString()}`);

    try {
      // Run jobs in parallel
      await Promise.all([
        processAbandonedCartEmails(),
        processReorderReminders()
      ]);

      const duration = Date.now() - startTime;
      console.log(`[SCHEDULER] ✓ All email jobs completed in ${duration}ms`);
    } catch (error) {
      console.error("[SCHEDULER] Error running email jobs:", error);
    }
  }

  // Manual trigger for testing
  async runNow(): Promise<void> {
    console.log("[SCHEDULER] Manually triggering email jobs...");
    await this.runJobs();
  }
}

// Export singleton instance
export const emailScheduler = new EmailJobScheduler();

// Auto-start scheduler when this module is imported (for production)
if (process.env.NODE_ENV === 'production') {
  emailScheduler.start();
}