import express from "express";
import { sendEmail, sendAdminAlert } from "../lib/email";

const router = express.Router();

// Email test endpoint for development
router.post("/test", async (req, res) => {
  try {
    const { type, email, testData } = req.body;

    if (!email || !type) {
      return res.status(400).json({ 
        error: "Missing required fields: email and type" 
      });
    }

    let result;
    switch (type) {
      case "order_confirm":
        result = await sendEmail(email, "order_confirm", {
          amount: 89.97,
          id: "test_order_" + Date.now(),
          customerName: "Test Customer",
          items: [
            { productName: "KSM-66® Ashwagandha", quantity: 1, price: "39.99" },
            { productName: "Magnesium Complex", quantity: 2, price: "24.99" }
          ],
          ...testData
        });
        break;

      case "refund":
        result = await sendEmail(email, "refund", {
          amount: 39.99,
          id: "test_refund_" + Date.now(),
          customerName: "Test Customer",
          ...testData
        });
        break;

      case "reorder":
        result = await sendEmail(email, "reorder", {
          amount: 89.97,
          id: "test_reorder_" + Date.now(),
          customerName: "Test Customer",
          ...testData
        });
        break;

      case "admin_alert":
        await sendAdminAlert("Test Admin Alert - " + Date.now(), {
          source: "manual_test",
          testEmail: email,
          ...testData
        });
        result = { message: "Admin alert sent" };
        break;

      default:
        return res.status(400).json({ error: "Invalid email type" });
    }

    res.json({
      success: true,
      message: `Test ${type} email sent successfully`,
      result: result?.id || result?.message || "sent"
    });

  } catch (error: any) {
    console.error("Email test error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to send test email"
    });
  }
});

// Get email system status
router.get("/status", (req, res) => {
  res.json({
    status: "operational",
    configured: !!process.env.RESEND_API_KEY,
    emailTypes: ["order_confirm", "refund", "reorder", "admin_alert"],
    testEndpoint: "/api/email/test"
  });
});

export default router;