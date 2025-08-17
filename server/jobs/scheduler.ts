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
      
      return;
    }

    this.isRunning = true;

    // FIXED: Do NOT run immediately on start to prevent emails on server restart
    // Only schedule the interval - first run will be after 1 hour
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
    
  }

  private async runJobs(): Promise<void> {
    const startTime = Date.now();

    try {
      // Run jobs in parallel
      await Promise.all([
        processAbandonedCartEmails(),
        processReorderReminders()
      ]);

      const duration = Date.now() - startTime;
      
    } catch (error) {
      // // console.error("[SCHEDULER] Error running email jobs:", error);
    }
  }

  // Manual trigger for testing
  async runNow(): Promise<void> {
    
    await this.runJobs();
  }
}

// Export singleton instance
export const emailScheduler = new EmailJobScheduler();

// Auto-start scheduler when this module is imported (for production)
if (process.env.NODE_ENV === 'production') {
  // Only auto-start if explicitly enabled to prevent unwanted emails
  if (process.env.AUTO_START_EMAIL_SCHEDULER === 'true') {
    emailScheduler.start();
  } else {

  }
}