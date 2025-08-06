// Phase 19: Automated Abandoned Cart Email Job
import { storage } from "../storage";
import { sendEmail } from "../lib/email";

export async function processAbandonedCartEmails(): Promise<void> {
  try {
    console.log("[ABANDONED CART JOB] Starting abandoned cart email processing...");
    
    // Get carts abandoned 1 hour ago
    const abandoned1h = await storage.getAbandonedCarts(1);
    console.log(`[ABANDONED CART JOB] Found ${abandoned1h.length} carts abandoned for 1 hour`);
    
    // Get carts abandoned 24 hours ago  
    const abandoned24h = await storage.getAbandonedCarts(24);
    console.log(`[ABANDONED CART JOB] Found ${abandoned24h.length} carts abandoned for 24 hours`);

    // Process 1-hour abandoned carts (soft reminder)  
    for (const cart of abandoned1h) {
      const user = cart.userId ? await storage.getUserById(cart.userId) : null;
      const userEmail = user?.email;
      if (!userEmail) continue;

      // Check if we already sent 1h email
      const alreadySent1h = await storage.hasEmailBeenSent("abandoned_cart_1h", cart.id);
      if (alreadySent1h) continue;

      console.log(`[ABANDONED CART JOB] Sending 1h reminder to ${userEmail} for cart ${cart.id}`);
      
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

        console.log(`[ABANDONED CART JOB] ✓ 1h reminder sent to ${userEmail}`);
      } catch (error) {
        console.error(`[ABANDONED CART JOB] Failed to send 1h email to ${userEmail}:`, error);
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

      console.log(`[ABANDONED CART JOB] Sending 24h reminder to ${userEmail} for cart ${cart.id}`);
      
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

        console.log(`[ABANDONED CART JOB] ✓ 24h reminder sent to ${userEmail}`);
      } catch (error) {
        console.error(`[ABANDONED CART JOB] Failed to send 24h email to ${userEmail}:`, error);
      }
    }

    console.log("[ABANDONED CART JOB] ✓ Abandoned cart email processing completed");
  } catch (error) {
    console.error("[ABANDONED CART JOB] Error processing abandoned cart emails:", error);
  }
}

// Manual testing can be done by importing and calling processAbandonedCartEmails()