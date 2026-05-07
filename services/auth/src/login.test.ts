import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

vi.mock('./db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    credential: {
      update: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@simplewebauthn/server', () => ({
  generateAuthenticationOptions: vi.fn(),
  verifyAuthenticationResponse: vi.fn(),
}));

import { app } from './app';
import { prisma } from './db';
import { generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';

const mockPrisma = prisma as any;
const mockGenOptions = generateAuthenticationOptions as any;
const mockVerify = verifyAuthenticationResponse as any;

const fakeUser = {
  id: 'user-uuid-1',
  username: 'alice',
  credentials: [
    {
      id: 'cred-row-id',
      credentialId: 'cred-id-base64',
      publicKey: Buffer.from([1, 2, 3, 4]),
      counter: 5,
      transports: ['internal'],
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  process.env.JWT_SECRET = 'test-secret';
  process.env.RP_ID = 'localhost';
  process.env.RP_ORIGIN = 'http://localhost:8080';
});

describe('POST /api/auth/login', () => {
  it('returns 400 if username is missing', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('username is required');
  });

  it('returns 404 if user does not exist', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app).post('/api/auth/login').send({ username: 'nobody' });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('user not found');
  });

  it('returns 200 with authentication options for existing user', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(fakeUser);
    mockGenOptions.mockResolvedValue({
      challenge: 'auth-challenge-base64',
      allowCredentials: [{ id: 'cred-id-base64', transports: ['internal'] }],
    });

    const res = await request(app).post('/api/auth/login').send({ username: 'alice' });
    expect(res.status).toBe(200);
    expect(res.body.challenge).toBe('auth-challenge-base64');
  });
});

describe('POST /api/auth/login/verify', () => {
  it('returns 400 if username is missing', async () => {
    const res = await request(app).post('/api/auth/login/verify').send({ credential: {} });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('username is required');
  });

  it('returns 400 if credential is missing', async () => {
    const res = await request(app).post('/api/auth/login/verify').send({ username: 'alice' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('credential is required');
  });

  it('returns 400 if no pending login challenge exists', async () => {
    const res = await request(app)
      .post('/api/auth/login/verify')
      .send({ username: 'nochallenge', credential: { id: 'cred-id-base64' } });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('no pending login for this username');
  });

  it('returns 404 if user not found during verify', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'u1', username: 'ghost', credentials: [] });
    mockGenOptions.mockResolvedValue({ challenge: 'c1' });

    await request(app).post('/api/auth/login').send({ username: 'ghost' });

    mockPrisma.user.findUnique.mockResolvedValueOnce(null);

    const res = await request(app)
      .post('/api/auth/login/verify')
      .send({ username: 'ghost', credential: { id: 'x' } });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('user not found');
  });

  it('returns 400 if credential id does not match any stored credential', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(fakeUser);
    mockGenOptions.mockResolvedValue({ challenge: 'c2' });

    await request(app).post('/api/auth/login').send({ username: 'alice' });

    const res = await request(app)
      .post('/api/auth/login/verify')
      .send({ username: 'alice', credential: { id: 'unknown-cred' } });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('credential not recognized');
  });

  it('returns 400 if assertion verification fails', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(fakeUser);
    mockGenOptions.mockResolvedValue({ challenge: 'c3' });

    await request(app).post('/api/auth/login').send({ username: 'alice' });

    mockVerify.mockRejectedValue(new Error('bad assertion'));

    const res = await request(app)
      .post('/api/auth/login/verify')
      .send({ username: 'alice', credential: { id: 'cred-id-base64', response: {} } });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('assertion verification failed');
  });

  it('returns 200 with cookies on successful login', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(fakeUser);
    mockGenOptions.mockResolvedValue({ challenge: 'c4' });

    await request(app).post('/api/auth/login').send({ username: 'alice' });

    mockVerify.mockResolvedValue({
      verified: true,
      authenticationInfo: { newCounter: 6 },
    });

    mockPrisma.credential.update.mockResolvedValue({});
    mockPrisma.refreshToken.create.mockResolvedValue({});

    const res = await request(app)
      .post('/api/auth/login/verify')
      .send({ username: 'alice', credential: { id: 'cred-id-base64', response: {} } });

    expect(res.status).toBe(200);
    expect(res.body.userId).toBe('user-uuid-1');
    expect(res.body.username).toBe('alice');

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    const cookieStr = Array.isArray(cookies) ? cookies.join('; ') : cookies;
    expect(cookieStr).toContain('access_token');
    expect(cookieStr).toContain('refresh_token');
    expect(cookieStr).toContain('HttpOnly');
  });
});
