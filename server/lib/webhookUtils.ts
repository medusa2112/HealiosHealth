import { storage } from "../storage";
import { InsertWebhookEvent } from "@shared/schema";
import crypto from "crypto";

/**
 * Webhook idempotency and utility functions for PayStack webhooks
 */

export interface WebhookProcessingResult {
  success: boolean;
  alreadyProcessed: boolean;
  error?: string;
  eventId?: string;
}

/**
 * Check if a webhook event has already been processed
 */
export async function isEventAlreadyProcessed(eventId: string): Promise<boolean> {
  try {
    const existingEvent = await storage.getWebhookEventByEventId(eventId);
    return !!existingEvent;
  } catch (error) {
    console.error('Error checking webhook event idempotency:', error);
    // On error, assume not processed to avoid blocking legitimate webhooks
    return false;
  }
}

/**
 * Record a webhook event for idempotency tracking
 */
export async function recordWebhookEvent(
  eventId: string,
  eventType: string,
  payload: any,
  status: 'processed' | 'failed' | 'skipped' = 'processed',
  errorMessage?: string
): Promise<void> {
  try {
    const webhookEvent: InsertWebhookEvent = {
      eventId,
      eventType,
      payload: JSON.stringify(payload),
      processingStatus: status,
      errorMessage: errorMessage || null,
    };

    await storage.createWebhookEvent(webhookEvent);
  } catch (error) {
    console.error('Error recording webhook event:', error);
    // Don't throw - we don't want recording failures to block webhook processing
  }
}

/**
 * Generate a unique event ID from webhook payload
 * Falls back to timestamp + hash if no PayStack event ID is available
 */
export function generateEventId(payload: any): string {
  // Try to use PayStack's event ID if available
  if (payload.id) {
    return `paystack_${payload.id}`;
  }
  
  // Try to use transaction reference + event type as fallback
  if (payload.data?.reference && payload.event) {
    return `paystack_${payload.event}_${payload.data.reference}`;
  }
  
  // Last resort: generate from payload hash + timestamp
  const payloadString = JSON.stringify(payload);
  const hash = crypto.createHash('sha256').update(payloadString).digest('hex').substring(0, 16);
  return `paystack_generated_${Date.now()}_${hash}`;
}

/**
 * Extract safe event data for logging (removes sensitive information)
 */
export function sanitizeEventDataForLogging(payload: any): any {
  const sanitized = JSON.parse(JSON.stringify(payload));
  
  // Remove or mask sensitive fields
  if (sanitized.data) {
    // Remove authorization details
    if (sanitized.data.authorization) {
      sanitized.data.authorization = { masked: true };
    }
    
    // Mask customer email (keep domain for debugging)
    if (sanitized.data.customer?.email) {
      const email = sanitized.data.customer.email;
      const [local, domain] = email.split('@');
      sanitized.data.customer.email = `${local.substring(0, 2)}***@${domain}`;
    }
    
    // Remove sensitive metadata
    if (sanitized.data.metadata) {
      const safeMeta = { ...sanitized.data.metadata };
      delete safeMeta.authorization;
      delete safeMeta.customerPhone;
      sanitized.data.metadata = safeMeta;
    }
    
    // Remove IP addresses
    delete sanitized.data.ip_address;
  }
  
  return sanitized;
}

/**
 * Validate webhook signature
 */
export function verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
  const hash = crypto.createHmac('sha512', secret)
    .update(body)
    .digest('hex');
  
  return hash === signature;
}

/**
 * Get PayStack secret key from environment
 */
export function getPaystackSecret(): string {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('PAYSTACK_SECRET_KEY not configured in production');
  }
  return secret || '';
}

/**
 * Safe JSON parsing with error handling
 */
export function safeParseJSON(jsonString: string): { success: boolean; data?: any; error?: string } {
  try {
    // Handle case where input might already be an object
    if (typeof jsonString === 'object') {
      return { success: true, data: jsonString };
    }
    
    // Ensure we have a string
    const stringInput = typeof jsonString === 'string' ? jsonString : String(jsonString);
    const data = JSON.parse(stringInput);
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown JSON parsing error' 
    };
  }
}

/**
 * Webhook processing wrapper with error handling and logging
 */
export async function processWebhookSafely<T>(
  eventId: string,
  eventType: string,
  payload: any,
  processor: () => Promise<T>
): Promise<WebhookProcessingResult & { result?: T }> {
  try {
    // Check idempotency first
    const alreadyProcessed = await isEventAlreadyProcessed(eventId);
    if (alreadyProcessed) {
      console.log(`[WEBHOOK] Event ${eventId} already processed, skipping`);
      return {
        success: true,
        alreadyProcessed: true,
        eventId
      };
    }

    // Process the webhook
    const result = await processor();
    
    // Record success
    await recordWebhookEvent(eventId, eventType, payload, 'processed');
    
    console.log(`[WEBHOOK] Successfully processed ${eventType} event ${eventId}`);
    return {
      success: true,
      alreadyProcessed: false,
      eventId,
      result
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Record failure
    await recordWebhookEvent(eventId, eventType, payload, 'failed', errorMessage);
    
    console.error(`[WEBHOOK] Failed to process ${eventType} event ${eventId}:`, error);
    return {
      success: false,
      alreadyProcessed: false,
      error: errorMessage,
      eventId
    };
  }
}