import { describe, it, expect } from 'vitest';
import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { requireAuth } from './auth';

const TEST_SECRET = 'test-jwt-secret';

function buildApp() {
  const app = express();
  app.use(cookieParser());
  app.get('/protected', requireAuth(TEST_SECRET), (req, res) => {
    res.json({ userId: req.userId });
  });
  return app;
}

function signToken(userId: string, expiresIn: number = 900): string {
  return jwt.sign({ sub: userId }, TEST_SECRET, { algorithm: 'HS256', expiresIn });
}

describe('requireAuth middleware', () => {
  it('extracts userId from a valid access_token cookie', async () => {
    const app = buildApp();
    const token = signToken('user-123');

    const res = await request(app)
      .get('/protected')
      .set('Cookie', `access_token=${token}`);

    expect(res.status).toBe(200);
    expect(res.body.userId).toBe('user-123');
  });

  it('returns 401 when no access_token cookie is present', async () => {
    const app = buildApp();

    const res = await request(app).get('/protected');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });

  it('returns 401 for an expired token', async () => {
    const app = buildApp();
    const token = jwt.sign({ sub: 'user-123' }, TEST_SECRET, {
      algorithm: 'HS256',
      expiresIn: 0,
    });

    const res = await request(app)
      .get('/protected')
      .set('Cookie', `access_token=${token}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid or expired token');
  });

  it('returns 401 for a token signed with a different secret', async () => {
    const app = buildApp();
    const token = jwt.sign({ sub: 'user-123' }, 'wrong-secret', {
      algorithm: 'HS256',
      expiresIn: 900,
    });

    const res = await request(app)
      .get('/protected')
      .set('Cookie', `access_token=${token}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid or expired token');
  });

  it('returns 401 for a malformed token', async () => {
    const app = buildApp();

    const res = await request(app)
      .get('/protected')
      .set('Cookie', 'access_token=not-a-real-jwt');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid or expired token');
  });
});
