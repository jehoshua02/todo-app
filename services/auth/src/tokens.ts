import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';

export function generateAccessToken(userId: string, secret: string): string {
  return jwt.sign({ sub: userId }, secret, { algorithm: 'HS256', expiresIn: '15m' });
}

export function verifyAccessToken(token: string, secret: string): jwt.JwtPayload {
  const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });
  if (typeof payload === 'string') {
    throw new Error('Unexpected string payload');
  }
  return payload;
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}
