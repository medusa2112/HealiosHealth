import { sanitizeEventDataForLogging } from "./webhookUtils";

/**
 * Structured logging utility for webhook events and errors
 */

export interface WebhookLogContext {
  eventId: string;
  eventType: string;
  timestamp: string;
  processingTimeMs?: number;
  signature?: string;
  source: 'paystack';
}

export interface WebhookLogEvent extends WebhookLogContext {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Create a webhook logger instance with context
 */
export class WebhookLogger {
  private context: WebhookLogContext;
  private startTime: number;

  constructor(eventId: string, eventType: string, signature?: string) {
    this.context = {
      eventId,
      eventType,
      timestamp: new Date().toISOString(),
      signature: signature ? signature.substring(0, 16) + '...' : undefined,
      source: 'paystack'
    };
    this.startTime = Date.now();
  }

  /**
   * Log webhook acceptance
   */
  accepted(payload: any): void {
    this.log('info', 'Webhook received and accepted', {
      payloadSize: JSON.stringify(payload).length,
      hasSignature: !!this.context.signature
    });
  }

  /**
   * Log signature verification result
   */
  signatureVerification(isValid: boolean, skipped: boolean = false): void {
    if (skipped) {
      this.log('warn', 'Webhook signature verification skipped (development mode)');
    } else {
      this.log(isValid ? 'info' : 'error', 
        `Webhook signature verification ${isValid ? 'passed' : 'failed'}`);
    }
  }

  /**
   * Log idempotency check result
   */
  idempotencyCheck(alreadyProcessed: boolean): void {
    if (alreadyProcessed) {
      this.log('info', 'Webhook event already processed, skipping duplicate');
    } else {
      this.log('debug', 'Webhook event is new, proceeding with processing');
    }
  }

  /**
   * Log payload validation result
   */
  payloadValidation(isValid: boolean, errors?: any): void {
    if (isValid) {
      this.log('debug', 'Webhook payload validation passed');
    } else {
      this.log('error', 'Webhook payload validation failed', { 
        validationErrors: errors 
      });
    }
  }

  /**
   * Log processing start for a specific case
   */
  processingStart(caseType: string): void {
    this.log('debug', `Starting processing for ${caseType}`);
  }

  /**
   * Log processing success for a specific case
   */
  processingSuccess(caseType: string, result?: any): void {
    this.log('info', `Successfully processed ${caseType}`, {
      result: result ? sanitizeEventDataForLogging(result) : undefined
    });
  }

  /**
   * Log processing error for a specific case
   */
  processingError(caseType: string, error: Error): void {
    this.log('error', `Error processing ${caseType}`, undefined, error);
  }

  /**
   * Log overall webhook completion
   */
  completed(): void {
    const processingTime = Date.now() - this.startTime;
    this.context.processingTimeMs = processingTime;
    this.log('info', `Webhook processing completed in ${processingTime}ms`);
  }

  /**
   * Log overall webhook failure
   */
  failed(error: Error): void {
    const processingTime = Date.now() - this.startTime;
    this.context.processingTimeMs = processingTime;
    this.log('error', `Webhook processing failed after ${processingTime}ms`, undefined, error);
  }

  /**
   * Core logging method
   */
  private log(level: 'info' | 'warn' | 'error' | 'debug', message: string, data?: any, error?: Error): void {
    const logEvent: WebhookLogEvent = {
      ...this.context,
      level,
      message,
      data: data ? sanitizeEventDataForLogging(data) : undefined,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    };

    // Enhanced console output with structured format
    const prefix = `[WEBHOOK:${this.context.source.toUpperCase()}:${this.context.eventType}]`;
    const eventInfo = `[${this.context.eventId.substring(0, 12)}...]`;
    
    switch (level) {
      case 'error':
        console.error(`${prefix}${eventInfo} ERROR:`, message, logEvent.error || '', logEvent.data || '');
        break;
      case 'warn':
        console.warn(`${prefix}${eventInfo} WARN:`, message, logEvent.data || '');
        break;
      case 'info':
        console.log(`${prefix}${eventInfo} INFO:`, message, logEvent.data || '');
        break;
      case 'debug':
        if (process.env.NODE_ENV === 'development') {
          console.debug(`${prefix}${eventInfo} DEBUG:`, message, logEvent.data || '');
        }
        break;
    }

    // In production, you might want to send this to a logging service
    if (process.env.NODE_ENV === 'production' && level === 'error') {
      // TODO: Send to logging service like LogRocket, Sentry, etc.
      // logToExternalService(logEvent);
    }
  }

  /**
   * Create a child logger for a specific processing case
   */
  createCaseLogger(caseType: string): CaseLogger {
    return new CaseLogger(this, caseType);
  }
}

/**
 * Case-specific logger for individual webhook event handlers
 */
export class CaseLogger {
  constructor(private parent: WebhookLogger, private caseType: string) {}

  start(): void {
    this.parent.processingStart(this.caseType);
  }

  success(result?: any): void {
    this.parent.processingSuccess(this.caseType, result);
  }

  error(error: Error): void {
    this.parent.processingError(this.caseType, error);
  }

  info(message: string, data?: any): void {
    this.parent['log']('info', `[${this.caseType}] ${message}`, data);
  }

  warn(message: string, data?: any): void {
    this.parent['log']('warn', `[${this.caseType}] ${message}`, data);
  }

  debug(message: string, data?: any): void {
    this.parent['log']('debug', `[${this.caseType}] ${message}`, data);
  }
}

/**
 * Create a webhook logger instance
 */
export function createWebhookLogger(eventId: string, eventType: string, signature?: string): WebhookLogger {
  return new WebhookLogger(eventId, eventType, signature);
}