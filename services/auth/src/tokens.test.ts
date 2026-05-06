import { describe, it, expect } from 'vitest';
import { generateAccessToken, verifyAccessToken, generateRefreshToken } from './tokens';

const TEST_SECRET = 'test-secret-key-for-unit-tests';

describe('generateAccessToken', () => {
  it('returns a signed JWT string', () => {
    const token = generateAccessToken('user-123', TEST_SECRET);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  it('encodes the userId in the sub claim', () => {
    const token = generateAccessToken('user-456', TEST_SECRET);
    const payload = verifyAccessToken(token, TEST_SECRET);
    expect(payload.sub).toBe('user-456');
  });
});

describe('verifyAccessToken', () => {
  it('returns decoded payload for a valid token', () => {
    const token = generateAccessToken('user-789', TEST_SECRET);
    const payload = verifyAccessToken(token, TEST_SECRET);
    expect(payload.sub).toBe('user-789');
    expect(payload.iat).toBeTypeOf('number');
    expect(payload.exp).toBeTypeOf('number');
  });

  it('throws for a tampered token', () => {
    const token = generateAccessToken('user-123', TEST_SECRET);
    const tampered = token.slice(0, -4) + 'xxxx';
    expect(() => verifyAccessToken(tampered, TEST_SECRET)).toThrow();
  });

  it('throws for a token signed with wrong secret', () => {
    const token = generateAccessToken('user-123', 'wrong-secret');
    expect(() => verifyAccessToken(token, TEST_SECRET)).toThrow();
  });

  it('throws for an expired token', () => {
    const jwt = require('jsonwebtoken');
    const expired = jwt.sign({ sub: 'user-123' }, TEST_SECRET, { expiresIn: -1 });
    expect(() => verifyAccessToken(expired, TEST_SECRET)).toThrow();
  });
});

describe('generateRefreshToken', () => {
  it('returns a 128-character hex string', () => {
    const token = generateRefreshToken();
    expect(token).toHaveLength(128);
    expect(token).toMatch(/^[0-9a-f]+$/);
  });

  it('returns unique values on each call', () => {
    const a = generateRefreshToken();
    const b = generateRefreshToken();
    expect(a).not.toBe(b);
  });
});
