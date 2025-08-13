import bcrypt from 'bcrypt';
import { resend } from './email';

// Generate a 6-digit verification code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Hash the verification code for secure storage
export async function hashVerificationCode(code: string): Promise<string> {
  return await bcrypt.hash(code, 10);
}

// Verify a code against its hash
export async function verifyCode(code: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(code, hash);
}

// Check if verification code has expired (15 minutes)
export function isCodeExpired(expiresAt: string | Date): boolean {
  const expiry = new Date(expiresAt);
  return new Date() > expiry;
}

// Generate expiry timestamp (15 minutes from now)
export function generateExpiryTime(): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 15);
  return expiry;
}

// Send verification email
export async function sendVerificationEmail(email: string, code: string, firstName?: string | null, type: 'verification' | 'reset' = 'verification'): Promise<void> {
  const isReset = type === 'reset';
  const subject = isReset ? "Reset your Healios password" : "Your Healios verification code";
  const actionText = isReset ? "PASSWORD RESET" : "EMAIL VERIFICATION";
  const headerText = isReset ? "Reset your password" : "Verify your email address";
  const instructionText = isReset 
    ? "To reset your password, please enter the following 6-digit verification code on our website:"
    : "To complete your registration and access your Healios account, please enter the verification code below:";
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${isReset ? 'Password Reset' : 'Email Verification'} - Healios</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; background-color: #ffffff; color: #000;">
      <div style="max-width: 600px; margin: 0 auto;">
        <div style="color: #666; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 30px;">
          ${actionText}
        </div>
        
        <h1 style="font-size: 32px; font-weight: 400; line-height: 1.2; margin: 0 0 30px 0; color: #000;">
          ${firstName ? `Hi ${firstName}, ` : ''}${headerText}
        </h1>
        
        <p style="font-size: 16px; line-height: 1.6; color: #666; margin: 0 0 40px 0;">
          ${instructionText}
        </p>
        
        <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-left: 4px solid #000; margin: 0 0 40px 0;">
          <div style="font-size: 36px; font-weight: 600; letter-spacing: 8px; color: #000; font-family: monospace;">
            ${code}
          </div>
          <div style="font-size: 14px; color: #666; margin-top: 15px;">
            This code expires in 15 minutes
          </div>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; color: #666; margin: 0 0 40px 0;">
          If you didn't request this ${isReset ? 'password reset' : 'verification code'}, please ignore this email. Your account security remains protected.
        </p>
        
        <div style="border-top: 1px solid #e0e0e0; padding-top: 30px; margin-top: 50px;">
          <p style="color: #999; font-size: 14px; line-height: 1.5; margin: 0;">
            This is an automated message from Healios. Please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  // EMAIL DISABLED - Verification email skipped
  console.log(`[EMAIL DISABLED] Verification email skipped for ${email} with code: ${code.substring(0, 2)}****`);
  // Note: Verification codes are still stored in database but emails are not sent
}

// Check rate limiting (max 5 attempts per hour)
export function canAttemptVerification(attempts: number, lastAttemptTime?: Date): boolean {
  const MAX_ATTEMPTS = 5;
  const HOUR_IN_MS = 60 * 60 * 1000;
  
  if (attempts >= MAX_ATTEMPTS) {
    if (lastAttemptTime) {
      const timeSinceLastAttempt = Date.now() - new Date(lastAttemptTime).getTime();
      return timeSinceLastAttempt > HOUR_IN_MS;
    }
    return false;
  }
  
  return true;
}