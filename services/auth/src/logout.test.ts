import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import crypto from 'node:crypto';

vi.mock('./db', () => ({
  prisma: {
    refreshToken: {
      findFirst: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('@simplewebauthn/server', () => ({
  generateRegistrationOptions: vi.fn(),
  verifyRegistrationResponse: vi.fn(),
  generateAuthenticationOptions: vi.fn(),
  verifyAuthenticationResponse: vi.fn(),
}));

import { app } from './app';
import { prisma } from './db';

const mockPrisma = prisma as any;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/auth/logout', () => {
  it('clears cookies and returns 204 even without a refresh token', async () => {
    const res = await request(app).post('/api/auth/logout').send();

    expect(res.status).toBe(204);
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    const cookieStr = Array.isArray(cookies) ? cookies.join('; ') : cookies;
    expect(cookieStr).toContain('access_token=;');
    expect(cookieStr).toContain('refresh_token=;');
  });

  it('revokes the refresh token when one is present', async () => {
    const token = 'valid-token';
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    mockPrisma.refreshToken.findFirst.mockResolvedValue({
      id: 'rt-1',
      tokenHash,
      revoked: false,
    });
    mockPrisma.refreshToken.update.mockResolvedValue({});

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', `refresh_token=${token}`)
      .send();

    expect(res.status).toBe(204);
    expect(mockPrisma.refreshToken.update).toHaveBeenCalledWith({
      where: { id: 'rt-1' },
      data: { revoked: true },
    });
  });
});
