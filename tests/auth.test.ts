import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, validatePasswordStrength, generateSessionToken } from '../server/auth.ts';

describe('Chairman Security & Auth Mechanisms', () => {
  it('should hash password with unique salts', () => {
    const rawPass = 'Chairman@2026Secure!';
    const h1 = hashPassword(rawPass);
    const h2 = hashPassword(rawPass);

    expect(h1.salt).not.toBe(h2.salt);
    expect(h1.hash).not.toBe(h2.hash);
    expect(h1.hash.length).toBe(128); // 64 bytes hex
  });

  it('should verify password correctly with constant-time compare', () => {
    const rawPass = 'Chairman@2026Secure!';
    const { hash, salt } = hashPassword(rawPass);

    expect(verifyPassword(rawPass, hash, salt)).toBe(true);
    expect(verifyPassword('WrongPassword123!', hash, salt)).toBe(false);
  });

  it('should validate password complexity rules', () => {
    expect(validatePasswordStrength('short1!').valid).toBe(false);
    expect(validatePasswordStrength('alllowercase123!').valid).toBe(false);
    expect(validatePasswordStrength('ALLUPPERCASE123!').valid).toBe(false);
    expect(validatePasswordStrength('NoNumbersOrSpecial').valid).toBe(false);
    expect(validatePasswordStrength('Strong@Pass2026').valid).toBe(true);
  });

  it('should generate secure opaque session tokens', () => {
    const token = generateSessionToken();
    expect(token).toBeTruthy();
    expect(token.length).toBeGreaterThan(40);
  });
});
