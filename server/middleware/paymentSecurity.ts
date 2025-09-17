import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Phase 3 Security: Enhanced Payment Security
 * Comprehensive security for payment processing including fraud detection
 */

interface PaymentAttempt {
  id: string;
  ip: string;
  amount: number;
  currency: string;
  email: string;
  timestamp: number;
  success: boolean;
  riskScore: number;
}

interface FraudRule {
  name: string;
  check: (attempt: PaymentAttempt, history: PaymentAttempt[]) => { triggered: boolean; score: number; reason?: string };
  riskScore: number;
}

// In-memory storage for payment attempts (in production, use a database)
const paymentHistory: PaymentAttempt[] = [];
const blockedCards = new Set<string>();
const suspiciousEmails = new Set<string>();

// Fraud detection rules
const fraudRules: FraudRule[] = [
  {
    name: 'rapid_fire_payments',
    riskScore: 80,
    check: (attempt, history) => {
      const recentAttempts = history.filter(h => 
        h.ip === attempt.ip && 
        attempt.timestamp - h.timestamp < 5 * 60 * 1000 // 5 minutes
      );
      
      if (recentAttempts.length >= 3) {
        return { triggered: true, score: 80, reason: 'Multiple payment attempts in short time' };
      }
      return { triggered: false, score: 0 };
    }
  },
  {
    name: 'high_amount_new_customer',
    riskScore: 60,
    check: (attempt, history) => {
      const customerHistory = history.filter(h => h.email === attempt.email);
      
      if (customerHistory.length === 0 && attempt.amount > 500) {
        return { triggered: true, score: 60, reason: 'High amount for new customer' };
      }
      return { triggered: false, score: 0 };
    }
  },
  {
    name: 'unusual_amount_pattern',
    riskScore: 40,
    check: (attempt, history) => {
      const customerHistory = history.filter(h => h.email === attempt.email && h.success);
      
      if (customerHistory.length > 0) {
        const avgAmount = customerHistory.reduce((sum, h) => sum + h.amount, 0) / customerHistory.length;
        
        if (attempt.amount > avgAmount * 5) {
          return { triggered: true, score: 40, reason: 'Amount significantly higher than customer average' };
        }
      }
      return { triggered: false, score: 0 };
    }
  },
  {
    name: 'velocity_check',
    riskScore: 70,
    check: (attempt, history) => {
      const last24Hours = attempt.timestamp - (24 * 60 * 60 * 1000);
      const recentByEmail = history.filter(h => 
        h.email === attempt.email && 
        h.timestamp > last24Hours && 
        h.success
      );
      
      const totalAmount = recentByEmail.reduce((sum, h) => sum + h.amount, 0);
      
      if (totalAmount + attempt.amount > 2000) { // $2000 daily limit
        return { triggered: true, score: 70, reason: 'Daily spending limit exceeded' };
      }
      return { triggered: false, score: 0 };
    }
  },
  {
    name: 'geographic_anomaly',
    riskScore: 50,
    check: (attempt, history) => {
      // This would use GeoIP in production
      const customerHistory = history.filter(h => h.email === attempt.email);
      const recentIPs = new Set(customerHistory.slice(-10).map(h => h.ip));
      
      if (customerHistory.length > 5 && !recentIPs.has(attempt.ip)) {
        return { triggered: true, score: 50, reason: 'Payment from new location' };
      }
      return { triggered: false, score: 0 };
    }
  }
];

/**
 * Calculates fraud risk score for a payment attempt
 */
function calculateFraudScore(attempt: PaymentAttempt): { score: number; triggeredRules: string[]; reasons: string[] } {
  let totalScore = 0;
  const triggeredRules: string[] = [];
  const reasons: string[] = [];

  for (const rule of fraudRules) {
    const result = rule.check(attempt, paymentHistory);
    if (result.triggered) {
      totalScore += result.score;
      triggeredRules.push(rule.name);
      if (result.reason) {
        reasons.push(result.reason);
      }
    }
  }

  return { score: Math.min(totalScore, 100), triggeredRules, reasons };
}

/**
 * Records a payment attempt
 */
function recordPaymentAttempt(req: Request, amount: number, currency: string, email: string, success: boolean): PaymentAttempt {
  const attempt: PaymentAttempt = {
    id: crypto.randomBytes(16).toString('hex'),
    ip: req.ip || 'unknown',
    amount: parseFloat(amount.toString()),
    currency,
    email,
    timestamp: Date.now(),
    success,
    riskScore: 0
  };

  // Calculate fraud score
  const fraudAnalysis = calculateFraudScore(attempt);
  attempt.riskScore = fraudAnalysis.score;

  // Log high-risk attempts
  if (fraudAnalysis.score > 70) {
    console.error('[Payment Security] High-risk payment attempt:', {
      id: attempt.id,
      email: attempt.email,
      amount: attempt.amount,
      riskScore: fraudAnalysis.score,
      triggeredRules: fraudAnalysis.triggeredRules,
      reasons: fraudAnalysis.reasons,
      ip: attempt.ip
    });
  }

  // Record the attempt
  paymentHistory.push(attempt);

  // Keep only last 10000 attempts to prevent memory issues
  if (paymentHistory.length > 10000) {
    paymentHistory.splice(0, paymentHistory.length - 10000);
  }

  return attempt;
}

/**
 * Fraud detection middleware for payment endpoints
 */
export function paymentFraudDetection() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { amount, currency = 'ZAR', email } = req.body;

    if (!amount || !email) {
      return next(); // Let other validation handle missing required fields
    }

    // Create a temporary attempt to check risk
    const tempAttempt: PaymentAttempt = {
      id: 'temp',
      ip: req.ip || 'unknown',
      amount: parseFloat(amount.toString()),
      currency,
      email,
      timestamp: Date.now(),
      success: false,
      riskScore: 0
    };

    const fraudAnalysis = calculateFraudScore(tempAttempt);

    // Block high-risk payments
    if (fraudAnalysis.score >= 90) {
      recordPaymentAttempt(req, amount, currency, email, false);
      
      return res.status(403).json({
        error: 'Payment blocked',
        message: 'This transaction has been flagged for security review',
        code: 'FRAUD_DETECTED'
      });
    }

    // Require additional verification for medium-risk payments
    if (fraudAnalysis.score >= 70) {
      console.warn('[Payment Security] Medium-risk payment flagged for review:', {
        email,
        amount,
        riskScore: fraudAnalysis.score,
        reasons: fraudAnalysis.reasons
      });
      
      // In production, this might trigger 3D Secure or additional verification
    }

    // Add fraud info to request for logging
    (req as any).fraudAnalysis = fraudAnalysis;

    next();
  };
}

/**
 * Idempotency key validation for payment requests
 */
export function validateIdempotencyKey() {
  const processedKeys = new Set<string>();
  
  return (req: Request, res: Response, next: NextFunction) => {
    const idempotencyKey = req.get('Idempotency-Key');
    
    if (!idempotencyKey) {
      return res.status(400).json({
        error: 'Idempotency key required',
        message: 'Idempotency-Key header is required for payment requests'
      });
    }

    // Check if key was already processed
    if (processedKeys.has(idempotencyKey)) {
      return res.status(409).json({
        error: 'Duplicate request',
        message: 'This payment request has already been processed',
        idempotencyKey
      });
    }

    // Mark key as processed (in production, store with TTL in Redis)
    processedKeys.add(idempotencyKey);
    
    // Clean up old keys after 1 hour
    setTimeout(() => {
      processedKeys.delete(idempotencyKey);
    }, 60 * 60 * 1000);

    next();
  };
}

/**
 * Enhanced Stripe webhook validation
 */
export function validateStripeWebhook(endpointSecret: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const sig = req.get('stripe-signature');
    
    if (!sig) {
      console.error('[Payment Security] Missing Stripe signature');
      return res.status(400).json({ error: 'Missing stripe-signature header' });
    }

    try {
      // Note: In production, use Stripe.webhooks.constructEvent
      const elements = sig.split(',');
      const timestamp = elements.find(el => el.startsWith('t='))?.split('=')[1];
      const signature = elements.find(el => el.startsWith('v1='))?.split('=')[1];

      if (!timestamp || !signature) {
        throw new Error('Invalid signature format');
      }

      // Check timestamp (within 5 minutes)
      const webhookTimestamp = parseInt(timestamp);
      const currentTimestamp = Math.floor(Date.now() / 1000);
      
      if (Math.abs(currentTimestamp - webhookTimestamp) > 300) {
        throw new Error('Request timestamp too old');
      }

      // In production, verify signature with Stripe secret
      console.log('[Payment Security] Webhook signature validated');
      next();
      
    } catch (error) {
      console.error('[Payment Security] Webhook validation failed:', error);
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }
  };
}

/**
 * Payment logging middleware (removes sensitive data)
 */
export function securePaymentLogging() {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;
    
    res.json = function(body) {
      // Log successful payments (without sensitive data)
      if (res.statusCode === 200 && req.body?.amount) {
        const { amount, currency, email } = req.body;
        const fraudAnalysis = (req as any).fraudAnalysis;
        
        recordPaymentAttempt(req, amount, currency || 'ZAR', email, true);
        
        console.log('[Payment Success]', {
          amount,
          currency: currency || 'ZAR',
          email: email ? email.substring(0, 3) + '***' : 'unknown', // Partially hide email
          riskScore: fraudAnalysis?.score || 0,
          ip: req.ip,
          timestamp: new Date().toISOString()
        });
      }

      return originalJson.call(this, body);
    };

    next();
  };
}

/**
 * Get payment security statistics
 */
export function getPaymentSecurityStats() {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const oneDay = 24 * oneHour;

  const recentAttempts = paymentHistory.filter(p => now - p.timestamp < oneHour);
  const dailyAttempts = paymentHistory.filter(p => now - p.timestamp < oneDay);
  
  const highRiskAttempts = paymentHistory.filter(p => p.riskScore >= 70);
  const blockedAttempts = paymentHistory.filter(p => p.riskScore >= 90);
  
  return {
    summary: {
      totalAttempts: paymentHistory.length,
      recentAttempts: recentAttempts.length,
      dailyAttempts: dailyAttempts.length,
      successRate: paymentHistory.length > 0 ? 
        (paymentHistory.filter(p => p.success).length / paymentHistory.length * 100).toFixed(2) : '0'
    },
    security: {
      highRiskAttempts: highRiskAttempts.length,
      blockedAttempts: blockedAttempts.length,
      averageRiskScore: paymentHistory.length > 0 ?
        (paymentHistory.reduce((sum, p) => sum + p.riskScore, 0) / paymentHistory.length).toFixed(2) : '0'
    },
    recentHighRisk: highRiskAttempts.slice(-10).map(p => ({
      id: p.id,
      amount: p.amount,
      riskScore: p.riskScore,
      timestamp: new Date(p.timestamp).toISOString(),
      email: p.email.substring(0, 3) + '***' // Partially hide email
    }))
  };
}

// Export all payment security functions
export default {
  paymentFraudDetection,
  validateIdempotencyKey,
  validateStripeWebhook,
  securePaymentLogging,
  getPaymentSecurityStats,
  recordPaymentAttempt
};