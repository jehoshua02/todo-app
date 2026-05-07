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
  process.env.JWT_SECRET = 'test-secret';
});

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

describe('POST /api/auth/refresh', () => {
  it('returns 401 if no refresh_token cookie is sent', async () => {
    const res = await request(app).post('/api/auth/refresh').send();
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('refresh token required');
  });

  it('returns 401 if token hash is not found in DB', async () => {
    mockPrisma.refreshToken.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', 'refresh_token=bad-token')
      .send();

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('invalid refresh token');
  });

  it('returns 401 and revokes if token is expired', async () => {
    const token = 'expired-refresh-token';
    mockPrisma.refreshToken.findFirst.mockResolvedValue({
      id: 'rt-1',
      userId: 'user-1',
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() - 1000),
      revoked: false,
      user: { id: 'user-1', username: 'alice' },
    });
    mockPrisma.refreshToken.update.mockResolvedValue({});

    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', `refresh_token=${token}`)
      .send();

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('refresh token expired');
    expect(mockPrisma.refreshToken.update).toHaveBeenCalledWith({
      where: { id: 'rt-1' },
      data: { revoked: true },
    });
  });

  it('returns 200 with new tokens on valid refresh', async () => {
    const token = 'valid-refresh-token';
    mockPrisma.refreshToken.findFirst.mockResolvedValue({
      id: 'rt-2',
      userId: 'user-2',
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 60000),
      revoked: false,
      user: { id: 'user-2', username: 'bob' },
    });
    mockPrisma.refreshToken.update.mockResolvedValue({});
    mockPrisma.refreshToken.create.mockResolvedValue({});

    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', `refresh_token=${token}`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.userId).toBe('user-2');
    expect(res.body.username).toBe('bob');

    expect(mockPrisma.refreshToken.update).toHaveBeenCalledWith({
      where: { id: 'rt-2' },
      data: { revoked: true },
    });
    expect(mockPrisma.refreshToken.create).toHaveBeenCalled();

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    const cookieStr = Array.isArray(cookies) ? cookies.join('; ') : cookies;
    expect(cookieStr).toContain('access_token');
    expect(cookieStr).toContain('refresh_token');
    expect(cookieStr).toContain('HttpOnly');
  });

  it('revokes old token before issuing new one (rotation)', async () => {
    const token = 'rotate-me';
    mockPrisma.refreshToken.findFirst.mockResolvedValue({
      id: 'rt-3',
      userId: 'user-3',
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 60000),
      revoked: false,
      user: { id: 'user-3', username: 'carol' },
    });
    mockPrisma.refreshToken.update.mockResolvedValue({});
    mockPrisma.refreshToken.create.mockResolvedValue({});

    await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', `refresh_token=${token}`)
      .send();

    const updateCall = mockPrisma.refreshToken.update.mock.calls[0][0];
    expect(updateCall.data.revoked).toBe(true);

    const createCall = mockPrisma.refreshToken.create.mock.calls[0][0];
    expect(createCall.data.userId).toBe('user-3');
    expect(createCall.data.tokenHash).not.toBe(hashToken(token));
  });
});
