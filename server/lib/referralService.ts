import { storage } from "../storage";
import { sendEmail } from "./email";

// Generate a unique referral code
export function generateReferralCode(): string {
  const prefix = "HEALIOS-";
  const chars = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789"; // Exclude similar chars
  let code = "";
  
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return prefix + code;
}

// Create a referral for a user
export async function createReferral(userId: string): Promise<{ code: string; id: string }> {
  // Check if user already has a referral code
  const existingReferral = await storage.getReferralByReferrerId(userId);

  if (existingReferral && existingReferral.isActive) {
    return {
      code: existingReferral.code,
      id: existingReferral.id
    };
  }

  // Generate unique code
  let code: string;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    code = generateReferralCode();
    const existing = await storage.getReferralByCode(code);
    isUnique = !existing;
    attempts++;
    
    if (attempts >= maxAttempts) {
      throw new Error("Failed to generate unique referral code");
    }
  } while (!isUnique);

  // Create new referral
  const referral = await storage.createReferral({
    referrerId: userId,
    code: code!,
    rewardType: "percentage",
    rewardValue: 10, // 10% discount for referee
    isActive: true,
    usedCount: 0,
    maxUses: 50
  });

  return {
    code: referral.code,
    id: referral.id
  };
}

// Validate referral code
export async function validateReferralCode(
  code: string,
  userId?: string
): Promise<{
  valid: boolean;
  referral?: any;
  error?: string;
}> {
  const referral = await storage.getReferralByCode(code);

  if (!referral) {
    return { valid: false, error: "Invalid referral code" };
  }

  if (!referral.isActive) {
    return { valid: false, error: "This referral code is no longer active" };
  }

  // Prevent self-referrals
  if (userId && referral.referrerId === userId) {
    return { valid: false, error: "You cannot use your own referral code" };
  }

  // Check if referral has reached max uses
  const usedCount = referral.usedCount || 0;
  const maxUses = referral.maxUses || 50;
  if (usedCount >= maxUses) {
    return { valid: false, error: "This referral code has reached its usage limit" };
  }

  return {
    valid: true,
    referral
  };
}

// Process referral claim (called after successful order)
export async function processReferralClaim(
  referralId: string,
  refereeId: string,
  orderId: string,
  orderAmount: number
): Promise<void> {
  try {
    // Get referral details
    const referral = Array.from((storage as any).referrals.values()).find((r: any) => r.id === referralId);
    if (!referral) {
      throw new Error("Referral not found");
    }

    // Calculate rewards
    const rewardValue = referral.rewardValue || 10;
    const refereeDiscount = Math.round(orderAmount * (rewardValue / 100)); // Percentage discount
    const referrerReward = 1000; // R10.00 credit in cents

    // Create referral claim
    await storage.createReferralClaim({
      referralId,
      refereeId,
      orderId,
      orderAmount,
      refereeDiscount,
      referrerRewardAmount: referrerReward,
      processed: false,
      claimedAt: new Date().toISOString()
    });

    // Update referral usage count
    const newUsedCount = (referral.usedCount || 0) + 1;
    await storage.updateReferralUsageCount(referralId, newUsedCount);

    // Get user details for email notifications
    const referrer = await storage.getUserById(referral.referrerId);
    const referee = await storage.getUserById(refereeId);

    if (referrer?.email) {
      // Send reward notification to referrer
      await sendEmail({
        to: referrer.email,
        subject: "🎉 Your referral earned you R10 credit!",
        template: "referral-reward",
        data: {
          referrerName: referrer.firstName || referrer.email,
          refereeName: referee?.firstName || referee?.email || "friend",
          rewardAmount: "R10.00",
          orderNumber: orderId.slice(0, 8),
          totalReferrals: newUsedCount
        }
      });
    }

    if (referee?.email) {
      // Send welcome email to referee
      await sendEmail({
        to: referee.email,
        subject: "Welcome to Healios! Your discount has been applied",
        template: "referral-welcome",
        data: {
          refereeName: referee.firstName || referee.email,
          referrerName: referrer?.firstName || "friend",
          discountAmount: `R${(refereeDiscount / 100).toFixed(2)}`,
          orderNumber: orderId.slice(0, 8)
        }
      });
    }

  } catch (error) {
    console.error("Failed to process referral claim:", error);
    throw error;
  }
}

// Get referral statistics for a user
export async function getReferralStats(userId: string): Promise<{
  referralCode: string;
  totalUses: number;
  totalEarned: number;
  claims: Array<{
    refereeEmail: string;
    rewardAmount: number;
    claimedAt: string;
    processed: boolean;
  }>;
}> {
  const referral = await storage.getReferralByReferrerId(userId);

  if (!referral) {
    return {
      referralCode: "",
      totalUses: 0,
      totalEarned: 0,
      claims: [],
    };
  }

  // Get referral claims
  const claims = await storage.getReferralClaimsByReferralId(referral.id);
  
  // Get referee details for each claim
  const claimsWithEmails = await Promise.all(
    claims.map(async (claim) => {
      const referee = await storage.getUserById(claim.refereeId);
      const email = referee?.email || '';
      const maskedEmail = email.length > 3 
        ? `${email.substring(0, 3)}***@${email.split('@')[1] || '***'}`
        : '***@***';
      
      return {
        refereeEmail: maskedEmail,
        rewardAmount: (claim.referrerRewardAmount || 0) / 100,
        claimedAt: claim.claimedAt || '',
        processed: claim.processed || false,
      };
    })
  );

  const totalEarned = claims.reduce((sum, claim) => sum + (claim.referrerRewardAmount || 0), 0);

  return {
    referralCode: referral.code,
    totalUses: referral.usedCount || 0,
    totalEarned: totalEarned / 100, // Convert from cents to dollars
    claims: claimsWithEmails,
  };
}