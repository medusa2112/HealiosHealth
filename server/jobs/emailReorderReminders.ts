// Phase 19: Automated Reorder Reminder Email Job
import { storage } from "../storage";
import { sendEmail } from "../lib/email";

export async function processReorderReminders(): Promise<void> {
  try {
    console.log("[REORDER JOB] Starting reorder reminder processing...");
    
    // Get reorder candidates (orders from last 45 days that might need reordering)
    const candidates = await storage.getReorderCandidates(45);
    console.log(`[REORDER JOB] Found ${candidates.length} reorder candidates`);

    for (const candidate of candidates) {
      const { order, user, item, variant, orderAge, intervalDays } = candidate;
      
      if (!user.email) continue;

      // Check timing - send reminder 5 days before expected run-out
      const reminderDay = intervalDays - 5;
      const finalReminderDay = intervalDays + 1;
      
      let emailType = "";
      let shouldSend = false;

      if (orderAge >= reminderDay && orderAge < reminderDay + 1) {
        emailType = "reorder_reminder";
        shouldSend = true;
      } else if (orderAge >= finalReminderDay && orderAge < finalReminderDay + 1) {
        emailType = "reorder_final";  
        shouldSend = true;
      }

      if (!shouldSend) continue;

      // Check if we already sent this type of email for this order
      const alreadySent = await storage.hasEmailBeenSent(emailType, order.id);
      if (alreadySent) continue;

      console.log(`[REORDER JOB] Sending ${emailType} to ${user.email} for order ${order.id}`);
      
      try {
        const productName = variant.name;
        const daysRemaining = intervalDays - orderAge;
        const isRunningLow = daysRemaining <= 0;

        await sendEmail(
          user.email,
          emailType,
          {
            userName: user.firstName || "Valued Customer",
            productName,
            quantity: item.quantity,
            daysRemaining: Math.max(0, daysRemaining),
            isRunningLow,
            orderAge,
            intervalDays,
            reorderUrl: `${process.env.FRONTEND_URL || 'https://healios.replit.app'}/products/${variant.productId}`,
            originalOrderId: order.id,
            originalOrderDate: new Date(order.createdAt || '').toLocaleDateString()
          }
        );

        // Log email event
        await storage.createEmailEvent({
          userId: user.id,
          emailType,
          relatedId: order.id,
          emailAddress: user.email
        });

        console.log(`[REORDER JOB] ✓ ${emailType} sent to ${user.email} for ${productName}`);
      } catch (error) {
        console.error(`[REORDER JOB] Failed to send ${emailType} to ${user.email}:`, error);
      }
    }

    console.log("[REORDER JOB] ✓ Reorder reminder processing completed");
  } catch (error) {
    console.error("[REORDER JOB] Error processing reorder reminders:", error);
  }
}

// Manual testing can be done by importing and calling processReorderReminders()