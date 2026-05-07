import { Request, Response } from 'express';
import crypto from 'node:crypto';
import { prisma } from './db';
import { clearTokenCookies } from './cookies';

export async function logout(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.refresh_token;

  if (token && typeof token === 'string') {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const stored = await prisma.refreshToken.findFirst({
      where: { tokenHash, revoked: false },
    });

    if (stored) {
      await prisma.refreshToken.update({
        where: { id: stored.id },
        data: { revoked: true },
      });
    }
  }

  clearTokenCookies(res);
  res.status(204).end();
}
