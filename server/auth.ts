import crypto from 'node:crypto';

const ITERATIONS = 100000;
const KEYLEN = 64;
const DIGEST = 'sha512';

/**
 * Hashes a plaintext password using PBKDF2 with a randomly generated 32-byte salt
 */
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(32).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, DIGEST).toString('hex');
  return { hash, salt };
}

/**
 * Verifies a password against the stored PBKDF2 hash and salt using constant-time comparison
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const computedHash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, DIGEST).toString('hex');
    const computedBuffer = Buffer.from(computedHash, 'hex');
    const storedBuffer = Buffer.from(hash, 'hex');

    if (computedBuffer.length !== storedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(computedBuffer, storedBuffer);
  } catch {
    return false;
  }
}

/**
 * Generates an opaque cryptographically-secure session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(48).toString('base64url');
}

/**
 * Validates password strength:
 * - At least 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number or special character
 */
export function validatePasswordStrength(password: string): { valid: boolean; reason?: string } {
  if (!password || password.length < 8) {
    return { valid: false, reason: 'Mật khẩu phải có độ dài tối thiểu 8 ký tự.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, reason: 'Mật khẩu phải chứa ít nhất 1 chữ hoa (A-Z).' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, reason: 'Mật khẩu phải chứa ít nhất 1 chữ thường (a-z).' };
  }
  if (!/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return { valid: false, reason: 'Mật khẩu phải chứa ít nhất 1 chữ số hoặc ký tự đặc biệt.' };
  }
  return { valid: true };
}
