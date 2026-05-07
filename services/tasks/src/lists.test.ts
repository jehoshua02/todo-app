import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

vi.mock('./db', () => ({
  prisma: {
    list: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { app } from './app';
import { prisma } from './db';

const mockPrisma = prisma as any;
const TEST_SECRET = 'dev-secret-change-me';

function authCookie(userId: string): string {
  const token = jwt.sign({ sub: userId }, TEST_SECRET, { algorithm: 'HS256', expiresIn: 900 });
  return `access_token=${token}`;
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.JWT_SECRET = TEST_SECRET;
});

describe('GET /api/tasks/lists', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/tasks/lists');
    expect(res.status).toBe(401);
  });

  it('auto-creates Inbox when user has no lists', async () => {
    mockPrisma.list.count.mockResolvedValue(0);
    mockPrisma.list.create.mockResolvedValue({
      id: 'inbox-id',
      userId: 'user-1',
      name: 'Inbox',
      isSystem: true,
      position: 0,
      createdAt: new Date('2026-01-01'),
    });
    mockPrisma.list.findMany.mockResolvedValue([
      {
        id: 'inbox-id',
        userId: 'user-1',
        name: 'Inbox',
        isSystem: true,
        position: 0,
        createdAt: new Date('2026-01-01'),
      },
    ]);

    const res = await request(app)
      .get('/api/tasks/lists')
      .set('Cookie', authCookie('user-1'));

    expect(res.status).toBe(200);
    expect(res.body.lists).toHaveLength(1);
    expect(res.body.lists[0].name).toBe('Inbox');
    expect(res.body.lists[0].isSystem).toBe(true);

    expect(mockPrisma.list.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        name: 'Inbox',
        isSystem: true,
        position: 0,
      }),
    });
  });

  it('returns existing lists without creating Inbox', async () => {
    mockPrisma.list.count.mockResolvedValue(2);
    mockPrisma.list.findMany.mockResolvedValue([
      { id: 'inbox-id', userId: 'user-2', name: 'Inbox', isSystem: true, position: 0, createdAt: new Date() },
      { id: 'list-2', userId: 'user-2', name: 'Shopping', isSystem: false, position: 1, createdAt: new Date() },
    ]);

    const res = await request(app)
      .get('/api/tasks/lists')
      .set('Cookie', authCookie('user-2'));

    expect(res.status).toBe(200);
    expect(res.body.lists).toHaveLength(2);
    expect(mockPrisma.list.create).not.toHaveBeenCalled();
  });

  it('isolates lists by user — user-A cannot see user-B lists', async () => {
    mockPrisma.list.count.mockResolvedValue(1);
    mockPrisma.list.findMany.mockResolvedValue([
      { id: 'a-inbox', userId: 'user-a', name: 'Inbox', isSystem: true, position: 0, createdAt: new Date() },
    ]);

    const res = await request(app)
      .get('/api/tasks/lists')
      .set('Cookie', authCookie('user-a'));

    expect(res.status).toBe(200);

    const countCall = mockPrisma.list.count.mock.calls[0][0];
    expect(countCall.where.userId).toBe('user-a');

    const findCall = mockPrisma.list.findMany.mock.calls[0][0];
    expect(findCall.where.userId).toBe('user-a');
  });

  it('returns lists ordered by position', async () => {
    mockPrisma.list.count.mockResolvedValue(3);
    mockPrisma.list.findMany.mockResolvedValue([
      { id: '1', userId: 'user-3', name: 'Inbox', isSystem: true, position: 0, createdAt: new Date() },
      { id: '2', userId: 'user-3', name: 'Work', isSystem: false, position: 1, createdAt: new Date() },
      { id: '3', userId: 'user-3', name: 'Personal', isSystem: false, position: 2, createdAt: new Date() },
    ]);

    const res = await request(app)
      .get('/api/tasks/lists')
      .set('Cookie', authCookie('user-3'));

    expect(res.status).toBe(200);

    const findCall = mockPrisma.list.findMany.mock.calls[0][0];
    expect(findCall.orderBy).toEqual({ position: 'asc' });
  });
});
