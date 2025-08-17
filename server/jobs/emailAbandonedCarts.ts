// Phase 19: Automated Abandoned Cart Email Job
import { storage } from "../storage";
import { sendEmail } from "../lib/email";

export async function processAbandonedCartEmails(): Promise<void> {
  try {
    
    const abandoned1h = await storage.getAbandonedCarts(1);
    
    const abandoned24h = await storage.getAbandonedCarts(24);
    
    for (const cart of abandoned1h) {
      const user = cart.userId ? await storage.getUserById(cart.userId) : null;
      const userEmail = user?.email;
      if (!userEmail) continue;

      // Check if we already sent 1h email
      const alreadySent1h = await storage.hasEmailBeenSent("abandoned_cart_1h", cart.id);
      if (alreadySent1h) continue;

      try {
        await sendEmail(
          userEmail,
          "abandoned_cart_1h", 
          { 
            cart,
            userName: user?.firstName || "Valued Customer",
            cartItems: JSON.parse(cart.items || '[]'),
            resumeCheckoutUrl: `${process.env.FRONTEND_URL || 'https://healios.replit.app'}/cart`
          }
        );

        // Log email event
        await storage.createEmailEvent({
          userId: cart.userId || undefined,
          emailType: "abandoned_cart_1h",
          relatedId: cart.id,
          emailAddress: userEmail
        });

      } catch (error) {
        // // console.error(`[ABANDONED CART JOB] Failed to send 1h email to ${userEmail}:`, error);
      }
    }

    // Process 24-hour abandoned carts (stronger reminder with incentive)
    for (const cart of abandoned24h) {
      const user = cart.userId ? await storage.getUserById(cart.userId) : null;
      const userEmail = user?.email;
      if (!userEmail) continue;

      // Check if we already sent 24h email
      const alreadySent24h = await storage.hasEmailBeenSent("abandoned_cart_24h", cart.id);
      if (alreadySent24h) continue;

      // Skip if cart is too old (3+ days)
      const cartAge = Date.now() - new Date(cart.lastUpdated || cart.createdAt || '').getTime();
      const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
      if (cartAge > threeDaysMs) continue;

      try {
        await sendEmail(
          userEmail,
          "abandoned_cart_24h",
          { 
            cart,
            userName: user?.firstName || "Valued Customer", 
            cartItems: JSON.parse(cart.items || '[]'),
            resumeCheckoutUrl: `${process.env.FRONTEND_URL || 'https://healios.replit.app'}/cart`,
            discountCode: "COMEBACK10",
            discountAmount: "10%"
          }
        );

        // Log email event
        await storage.createEmailEvent({
          userId: cart.userId || undefined,
          emailType: "abandoned_cart_24h",
          relatedId: cart.id,
          emailAddress: userEmail
        });

      } catch (error) {
        // // console.error(`[ABANDONED CART JOB] Failed to send 24h email to ${userEmail}:`, error);
      }
    }

  } catch (error) {
    // // console.error("[ABANDONED CART JOB] Error processing abandoned cart emails:", error);
  }
}

// Manual testing can be done by importing and calling processAbandonedCartEmails()