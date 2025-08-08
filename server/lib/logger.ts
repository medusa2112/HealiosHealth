/**
 * Comprehensive logging utility for tracking all system operations
 * Provides detailed logging for debugging and monitoring
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

export interface LogContext {
  userId?: string;
  userEmail?: string;
  sessionId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
  [key: string]: any;
}

class SystemLogger {
  private static instance: SystemLogger;
  private isDevelopment = process.env.NODE_ENV === 'development';

  private constructor() {}

  static getInstance(): SystemLogger {
    if (!SystemLogger.instance) {
      SystemLogger.instance = new SystemLogger();
    }
    return SystemLogger.instance;
  }

  private formatLog(level: LogLevel, module: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? JSON.stringify(context) : '';
    return `[${timestamp}] [${level}] [${module}] ${message} ${contextStr}`;
  }

  log(level: LogLevel, module: string, message: string, context?: LogContext) {
    const formattedLog = this.formatLog(level, module, message, context);
    
    switch (level) {
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(formattedLog);
        break;
      case LogLevel.WARN:
        console.warn(formattedLog);
        break;
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.log(formattedLog);
        }
        break;
      default:
        console.log(formattedLog);
    }

    // In production, could send to external logging service
    if (!this.isDevelopment && (level === LogLevel.ERROR || level === LogLevel.CRITICAL)) {
      this.sendToMonitoring(level, module, message, context);
    }
  }

  private sendToMonitoring(level: LogLevel, module: string, message: string, context?: LogContext) {
    // Placeholder for external monitoring service integration
    // e.g., Sentry, DataDog, CloudWatch, etc.
  }

  // Convenience methods
  debug(module: string, message: string, context?: LogContext) {
    this.log(LogLevel.DEBUG, module, message, context);
  }

  info(module: string, message: string, context?: LogContext) {
    this.log(LogLevel.INFO, module, message, context);
  }

  warn(module: string, message: string, context?: LogContext) {
    this.log(LogLevel.WARN, module, message, context);
  }

  error(module: string, message: string, context?: LogContext) {
    this.log(LogLevel.ERROR, module, message, context);
  }

  critical(module: string, message: string, context?: LogContext) {
    this.log(LogLevel.CRITICAL, module, message, context);
  }

  // Track API requests
  apiRequest(method: string, url: string, userId?: string, duration?: number, status?: number) {
    this.info('API', `${method} ${url}`, {
      method,
      url,
      userId,
      duration: duration ? `${duration}ms` : undefined,
      status
    });
  }

  // Track database operations
  dbOperation(operation: string, table: string, duration?: number, success?: boolean) {
    this.debug('DATABASE', `${operation} on ${table}`, {
      operation,
      table,
      duration: duration ? `${duration}ms` : undefined,
      success
    });
  }

  // Track authentication events
  authEvent(event: string, userId?: string, success?: boolean, details?: any) {
    const level = success === false ? LogLevel.WARN : LogLevel.INFO;
    this.log(level, 'AUTH', event, {
      userId,
      success,
      ...details
    });
  }

  // Track product operations
  productOperation(operation: string, productId?: string, userId?: string, details?: any) {
    this.info('PRODUCT', operation, {
      productId,
      userId,
      ...details
    });
  }

  // Track cart operations
  cartOperation(operation: string, cartId?: string, userId?: string, details?: any) {
    this.info('CART', operation, {
      cartId,
      userId,
      ...details
    });
  }

  // Track order operations
  orderOperation(operation: string, orderId?: string, userId?: string, details?: any) {
    this.info('ORDER', operation, {
      orderId,
      userId,
      ...details
    });
  }

  // Track payment operations
  paymentOperation(operation: string, orderId?: string, amount?: number, status?: string, details?: any) {
    this.info('PAYMENT', operation, {
      orderId,
      amount,
      status,
      ...details
    });
  }

  // Track errors with full context
  logError(module: string, error: Error | any, context?: LogContext) {
    this.error(module, error.message || 'Unknown error', {
      ...context,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
  }
}

export const logger = SystemLogger.getInstance();