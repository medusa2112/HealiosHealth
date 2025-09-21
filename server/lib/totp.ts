import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import bcrypt from 'bcrypt';

/**
 * Built-in TOTP (Time-based One-Time Password) implementation
 * Uses HMAC-SHA1 algorithm as per RFC 6238
 */

const TOTP_WINDOW = 30; // 30 second window
const TOTP_DIGITS = 6; // 6-digit codes
const TOTP_SKEW = 1; // Allow 1 window tolerance (±30 seconds)

/**
 * Generate a random TOTP secret (base32 encoded)
 */
export function generateTotpSecret(): string {
  const buffer = randomBytes(20); // 160 bits
  return base32Encode(buffer);
}

/**
 * Generate TOTP code for a given secret and time
 */
export function generateTotpCode(secret: string, time?: number): string {
  const timeStep = Math.floor((time || Date.now()) / 1000 / TOTP_WINDOW);
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeUInt32BE(0, 0);
  timeBuffer.writeUInt32BE(timeStep, 4);
  
  const secretBuffer = base32Decode(secret);
  const hmac = createHmac('sha1', secretBuffer);
  hmac.update(timeBuffer);
  const hash = hmac.digest();
  
  const offset = hash[hash.length - 1] & 0x0f;
  const code = ((hash[offset] & 0x7f) << 24) |
               ((hash[offset + 1] & 0xff) << 16) |
               ((hash[offset + 2] & 0xff) << 8) |
               (hash[offset + 3] & 0xff);
  
  return (code % Math.pow(10, TOTP_DIGITS)).toString().padStart(TOTP_DIGITS, '0');
}

/**
 * Verify TOTP code against secret with replay protection
 */
export function verifyTotpCodeWithReplay(
  secret: string, 
  code: string, 
  lastUsedTimestep?: number | null, 
  time?: number
): { valid: boolean; timestep?: number } {
  // Input validation - TOTP codes must be exactly 6 digits
  if (!code || typeof code !== 'string' || !/^\d{6}$/.test(code)) {
    return { valid: false };
  }
  
  // Validate secret format
  if (!secret || typeof secret !== 'string') {
    return { valid: false };
  }
  
  try {
    const currentTime = time || Date.now();
    const currentTimestep = Math.floor(currentTime / 1000 / TOTP_WINDOW);
    
    // Check current window and adjacent windows for clock skew tolerance
    for (let i = -TOTP_SKEW; i <= TOTP_SKEW; i++) {
      const testTimestep = currentTimestep + i;
      const testTime = testTimestep * TOTP_WINDOW * 1000;
      const expectedCode = generateTotpCode(secret, testTime);
      
      // Safe timing comparison - ensure both strings are same length
      if (code.length === expectedCode.length && safeTimingCompare(code, expectedCode)) {
        // Check for replay attack
        if (lastUsedTimestep !== null && lastUsedTimestep !== undefined && testTimestep <= lastUsedTimestep) {
          // This timestep was already used - replay attack
          return { valid: false };
        }
        
        return { valid: true, timestep: testTimestep };
      }
    }
    
    return { valid: false };
  } catch (error) {
    // Log error but don't expose internal details
    console.error('[TOTP] Verification error:', error);
    return { valid: false };
  }
}

/**
 * Legacy verify function for backward compatibility
 */
export function verifyTotpCode(secret: string, code: string, time?: number): boolean {
  const result = verifyTotpCodeWithReplay(secret, code, null, time);
  return result.valid;
}

/**
 * Safe timing comparison for strings of equal length
 */
function safeTimingCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  try {
    const bufferA = Buffer.from(a, 'utf8');
    const bufferB = Buffer.from(b, 'utf8');
    
    // Only call timingSafeEqual if buffers are same length
    if (bufferA.length === bufferB.length) {
      return timingSafeEqual(bufferA, bufferB);
    }
    
    return false;
  } catch (error) {
    // Fallback to constant-time comparison if Buffer operations fail
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
}

/**
 * Generate backup codes for TOTP recovery (plaintext for user display)
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = randomBytes(4).toString('hex').toUpperCase();
    codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}`);
  }
  return codes;
}

/**
 * Hash backup codes for secure storage
 */
export async function hashBackupCodes(codes: string[]): Promise<string[]> {
  const saltRounds = 12; // High security for backup codes
  const hashedCodes: string[] = [];
  
  for (const code of codes) {
    // Normalize code format (remove dashes and convert to uppercase)
    const normalizedCode = code.replace(/[-\s]/g, '').toUpperCase();
    const hashedCode = await bcrypt.hash(normalizedCode, saltRounds);
    hashedCodes.push(hashedCode);
  }
  
  return hashedCodes;
}

/**
 * Verify backup code against hashed codes stored in database
 */
export async function verifyBackupCode(inputCode: string, hashedCodes: string[]): Promise<{ valid: boolean; remainingHashes?: string[] }> {
  // Normalize input code format
  const normalizedCode = inputCode.replace(/[-\s]/g, '').toUpperCase();
  
  // Validate input format (8 characters, alphanumeric)
  if (!/^[A-F0-9]{8}$/.test(normalizedCode)) {
    return { valid: false };
  }
  
  try {
    // Check each hashed code
    for (let i = 0; i < hashedCodes.length; i++) {
      const isValid = await bcrypt.compare(normalizedCode, hashedCodes[i]);
      if (isValid) {
        // Remove the used backup code hash
        const remainingHashes = hashedCodes.filter((_, index) => index !== i);
        return { valid: true, remainingHashes };
      }
    }
    
    return { valid: false };
  } catch (error) {
    console.error('[TOTP] Backup code verification error:', error);
    return { valid: false };
  }
}

/**
 * Generate TOTP QR code data URL for authenticator apps
 */
export function generateTotpQrData(secret: string, label: string, issuer: string = 'Healios'): string {
  const otpAuthUrl = `otpauth://totp/${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=${TOTP_DIGITS}&period=${TOTP_WINDOW}`;
  return otpAuthUrl;
}

/**
 * Base32 encoding (RFC 4648)
 */
function base32Encode(buffer: Buffer): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  let output = '';
  
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  
  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }
  
  return output;
}

/**
 * Base32 decoding (RFC 4648)
 */
function base32Decode(encoded: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  let index = 0;
  const output = Buffer.alloc(Math.ceil(encoded.length * 5 / 8));
  
  for (let i = 0; i < encoded.length; i++) {
    const char = encoded[i].toUpperCase();
    const charIndex = alphabet.indexOf(char);
    
    if (charIndex === -1) continue;
    
    value = (value << 5) | charIndex;
    bits += 5;
    
    if (bits >= 8) {
      output[index++] = (value >>> (bits - 8)) & 255;
      bits -= 8;
    }
  }
  
  return output.slice(0, index);
}