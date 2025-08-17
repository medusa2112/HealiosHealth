// Phase 19: Automated Reorder Reminder Email Job
import { storage } from "../storage";
import { sendEmail } from "../lib/email";

export async function processReorderReminders(): Promise<void> {
  try {
    
    const candidates = await storage.getReorderCandidates(45);

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

      } catch (error) {
        // // console.error(`[REORDER JOB] Failed to send ${emailType} to ${user.email}:`, error);
      }
    }

  } catch (error) {
    // // console.error("[REORDER JOB] Error processing reorder reminders:", error);
  }
}

// Manual testing can be done by importing and calling processReorderReminders()