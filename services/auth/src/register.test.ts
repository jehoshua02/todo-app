import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

vi.mock('./db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@simplewebauthn/server', () => ({
  generateRegistrationOptions: vi.fn(),
  verifyRegistrationResponse: vi.fn(),
}));

import { app } from './app';
import { prisma } from './db';
import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server';

const mockPrisma = prisma as any;
const mockGenOptions = generateRegistrationOptions as any;
const mockVerify = verifyRegistrationResponse as any;

beforeEach(() => {
  vi.clearAllMocks();
  process.env.JWT_SECRET = 'test-secret';
  process.env.RP_ID = 'localhost';
  process.env.RP_ORIGIN = 'http://localhost:8080';
});

describe('POST /api/auth/register', () => {
  it('returns 400 if username is missing', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('username is required');
  });

  it('returns 409 if username already exists', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing', username: 'alice' });

    const res = await request(app).post('/api/auth/register').send({ username: 'alice' });
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('username already taken');
  });

  it('returns 200 with registration options for new username', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockGenOptions.mockResolvedValue({
      challenge: 'test-challenge-base64',
      rp: { name: 'Todo App', id: 'localhost' },
      user: { id: 'uid', name: 'alice', displayName: 'alice' },
      pubKeyCredParams: [],
    });

    const res = await request(app).post('/api/auth/register').send({ username: 'alice' });
    expect(res.status).toBe(200);
    expect(res.body.challenge).toBe('test-challenge-base64');
  });
});

describe('POST /api/auth/register/verify', () => {
  it('returns 400 if username is missing', async () => {
    const res = await request(app).post('/api/auth/register/verify').send({ credential: {} });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('username is required');
  });

  it('returns 400 if credential is missing', async () => {
    const res = await request(app).post('/api/auth/register/verify').send({ username: 'alice' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('credential is required');
  });

  it('returns 400 if no pending challenge exists', async () => {
    const res = await request(app)
      .post('/api/auth/register/verify')
      .send({ username: 'unknown', credential: {} });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('no pending registration for this username');
  });

  it('returns 400 if attestation verification fails', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockGenOptions.mockResolvedValue({ challenge: 'challenge123' });

    await request(app).post('/api/auth/register').send({ username: 'bob' });

    mockVerify.mockRejectedValue(new Error('Invalid attestation'));

    const res = await request(app)
      .post('/api/auth/register/verify')
      .send({ username: 'bob', credential: { response: {} } });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('attestation verification failed');
  });

  it('returns 201 with cookies on successful registration', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockGenOptions.mockResolvedValue({ challenge: 'challenge456' });

    await request(app).post('/api/auth/register').send({ username: 'carol' });

    mockVerify.mockResolvedValue({
      verified: true,
      registrationInfo: {
        credential: {
          id: 'cred-id-base64',
          publicKey: new Uint8Array([1, 2, 3, 4]),
          counter: 0,
        },
      },
    });

    mockPrisma.user.create.mockResolvedValue({ id: 'user-uuid-1', username: 'carol' });
    mockPrisma.refreshToken.create.mockResolvedValue({});

    const res = await request(app)
      .post('/api/auth/register/verify')
      .send({ username: 'carol', credential: { response: { transports: ['internal'] } } });

    expect(res.status).toBe(201);
    expect(res.body.userId).toBe('user-uuid-1');
    expect(res.body.username).toBe('carol');

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    const cookieStr = Array.isArray(cookies) ? cookies.join('; ') : cookies;
    expect(cookieStr).toContain('access_token');
    expect(cookieStr).toContain('refresh_token');
    expect(cookieStr).toContain('HttpOnly');
  });
});
