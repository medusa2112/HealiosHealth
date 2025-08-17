import { Router } from "express";
import { createReferral, validateReferralCode, getReferralStats, processReferralClaim } from "../lib/referralService";
import { requireAuth } from "../lib/auth";
import { z } from "zod";

const router = Router();

// Create/Get referral code for authenticated user
router.get("/my-referral", requireAuth, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const referral = await createReferral(req.user.id);
    res.json({
      code: referral.code,
      shareUrl: `https://healios.com?ref=${referral.code}`,
    });
  } catch (error) {
    // // console.error("Failed to create/get referral:", error);
    res.status(500).json({ error: "Failed to process referral" });
  }
});

// Get referral statistics for authenticated user
router.get("/stats", requireAuth, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const stats = await getReferralStats(req.user.id);
    res.json(stats);
  } catch (error) {
    // // console.error("Failed to get referral stats:", error);
    res.status(500).json({ error: "Failed to get referral statistics" });
  }
});

// Validate referral code (secured endpoint)
router.post("/validate", requireAuth, async (req, res) => {
  try {
    const schema = z.object({
      code: z.string().min(1),
      userId: z.string().optional(),
    });

    const { code, userId } = schema.parse(req.body);
    const result = await validateReferralCode(code, userId);

    if (result.valid && result.referral) {
      res.json({
        valid: true,
        discount: result.referral.rewardValue,
        rewardType: result.referral.rewardType,
      });
    } else {
      res.json({
        valid: false,
        error: result.error,
      });
    }
  } catch (error) {
    // // console.error("Failed to validate referral code:", error);
    res.status(400).json({ error: "Invalid request" });
  }
});

// Process referral claim (secured endpoint)
router.post("/claim", requireAuth, async (req, res) => {
  try {
    const schema = z.object({
      referralId: z.string(),
      refereeId: z.string(),
      orderId: z.string(),
      orderAmount: z.number(),
    });

    const { referralId, refereeId, orderId, orderAmount } = schema.parse(req.body);
    await processReferralClaim(referralId, refereeId, orderId, orderAmount);

    res.json({ success: true });
  } catch (error) {
    // // console.error("Failed to process referral claim:", error);
    res.status(500).json({ error: "Failed to process referral claim" });
  }
});

export default router;