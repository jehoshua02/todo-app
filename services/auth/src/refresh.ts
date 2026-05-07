import { Request, Response } from 'express';
import crypto from 'node:crypto';
import { prisma } from './db';
import { generateAccessToken, generateRefreshToken } from './tokens';
import { setTokenCookies } from './cookies';

export async function refresh(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.refresh_token;

  if (!token || typeof token !== 'string') {
    res.status(401).json({ error: 'refresh token required' });
    return;
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const stored = await prisma.refreshToken.findFirst({
    where: { tokenHash, revoked: false },
    include: { user: true },
  });

  if (!stored) {
    res.status(401).json({ error: 'invalid refresh token' });
    return;
  }

  if (stored.expiresAt < new Date()) {
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });
    res.status(401).json({ error: 'refresh token expired' });
    return;
  }

  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });

  const jwtSecret = process.env.JWT_SECRET!;
  const accessToken = generateAccessToken(stored.userId, jwtSecret);
  const newRefreshToken = generateRefreshToken();

  const newTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
  await prisma.refreshToken.create({
    data: {
      userId: stored.userId,
      tokenHash: newTokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  setTokenCookies(res, accessToken, newRefreshToken);
  res.status(200).json({ userId: stored.userId, username: stored.user.username });
}
