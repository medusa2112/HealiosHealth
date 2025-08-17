import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12; // Higher than default 10 for enhanced security

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Promise<string> - Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    // // console.error('Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * Verify a password against its hash
 * @param password - Plain text password
 * @param hash - Stored password hash
 * @returns Promise<boolean> - True if password matches
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    // // console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Check if password meets security requirements
 * @param password - Plain text password
 * @returns Object with validation result and message
 */
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }

  if (!/\d/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }

  return { valid: true };
}