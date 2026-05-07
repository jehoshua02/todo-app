import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

vi.mock('./db', () => ({
  prisma: {
    list: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      aggregate: vi.fn(),
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

  it('returns lists ordered by position ascending', async () => {
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

describe('POST /api/tasks/lists', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app)
      .post('/api/tasks/lists')
      .send({ name: 'Shopping' });
    expect(res.status).toBe(401);
  });

  it('creates a list with valid name and auto-assigned position', async () => {
    mockPrisma.list.aggregate.mockResolvedValue({ _max: { position: 2 } });
    mockPrisma.list.create.mockResolvedValue({
      id: 'new-list-id',
      userId: 'user-1',
      name: 'Shopping',
      isSystem: false,
      position: 3,
      createdAt: new Date('2026-01-01'),
    });

    const res = await request(app)
      .post('/api/tasks/lists')
      .set('Cookie', authCookie('user-1'))
      .send({ name: 'Shopping' });

    expect(res.status).toBe(201);
    expect(res.body.list.name).toBe('Shopping');
    expect(res.body.list.position).toBe(3);
    expect(res.body.list.isSystem).toBe(false);

    expect(mockPrisma.list.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        name: 'Shopping',
        isSystem: false,
        position: 3,
      }),
    });
  });

  it('trims whitespace from name', async () => {
    mockPrisma.list.aggregate.mockResolvedValue({ _max: { position: 0 } });
    mockPrisma.list.create.mockResolvedValue({
      id: 'new-id',
      userId: 'user-1',
      name: 'Groceries',
      isSystem: false,
      position: 1,
      createdAt: new Date(),
    });

    const res = await request(app)
      .post('/api/tasks/lists')
      .set('Cookie', authCookie('user-1'))
      .send({ name: '  Groceries  ' });

    expect(res.status).toBe(201);
    expect(res.body.list.name).toBe('Groceries');
  });

  it('assigns position 1 when user has no lists', async () => {
    mockPrisma.list.aggregate.mockResolvedValue({ _max: { position: null } });
    mockPrisma.list.create.mockResolvedValue({
      id: 'new-id',
      userId: 'user-1',
      name: 'First',
      isSystem: false,
      position: 1,
      createdAt: new Date(),
    });

    const res = await request(app)
      .post('/api/tasks/lists')
      .set('Cookie', authCookie('user-1'))
      .send({ name: 'First' });

    expect(res.status).toBe(201);
    expect(res.body.list.position).toBe(1);
  });

  it('returns 400 for empty name', async () => {
    const res = await request(app)
      .post('/api/tasks/lists')
      .set('Cookie', authCookie('user-1'))
      .send({ name: '' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('returns 400 for whitespace-only name', async () => {
    const res = await request(app)
      .post('/api/tasks/lists')
      .set('Cookie', authCookie('user-1'))
      .send({ name: '   ' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('returns 400 for missing name', async () => {
    const res = await request(app)
      .post('/api/tasks/lists')
      .set('Cookie', authCookie('user-1'))
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('returns 400 for name exceeding 100 characters', async () => {
    const longName = 'a'.repeat(101);
    const res = await request(app)
      .post('/api/tasks/lists')
      .set('Cookie', authCookie('user-1'))
      .send({ name: longName });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

describe('PATCH /api/tasks/lists/:id', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app)
      .patch('/api/tasks/lists/some-id')
      .send({ name: 'Renamed' });
    expect(res.status).toBe(401);
  });

  it('returns 404 when list does not exist', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/tasks/lists/nonexistent')
      .set('Cookie', authCookie('user-1'))
      .send({ name: 'Renamed' });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('List not found');
  });

  it('returns 404 when list belongs to another user', async () => {
    mockPrisma.list.findUnique.mockResolvedValue({
      id: 'list-1', userId: 'other-user', name: 'Shopping', isSystem: false, position: 1,
    });

    const res = await request(app)
      .patch('/api/tasks/lists/list-1')
      .set('Cookie', authCookie('user-1'))
      .send({ name: 'Renamed' });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('List not found');
  });

  it('returns 403 when renaming a system list', async () => {
    mockPrisma.list.findUnique.mockResolvedValue({
      id: 'inbox-id', userId: 'user-1', name: 'Inbox', isSystem: true, position: 0,
    });

    const res = await request(app)
      .patch('/api/tasks/lists/inbox-id')
      .set('Cookie', authCookie('user-1'))
      .send({ name: 'My Inbox' });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('System lists cannot be renamed');
  });

  it('renames a list with valid name', async () => {
    mockPrisma.list.findUnique.mockResolvedValue({
      id: 'list-1', userId: 'user-1', name: 'Shopping', isSystem: false, position: 1,
    });
    mockPrisma.list.update.mockResolvedValue({
      id: 'list-1', userId: 'user-1', name: 'Groceries', isSystem: false, position: 1, createdAt: new Date(),
    });

    const res = await request(app)
      .patch('/api/tasks/lists/list-1')
      .set('Cookie', authCookie('user-1'))
      .send({ name: 'Groceries' });

    expect(res.status).toBe(200);
    expect(res.body.list.name).toBe('Groceries');
    expect(mockPrisma.list.update).toHaveBeenCalledWith({
      where: { id: 'list-1' },
      data: { name: 'Groceries' },
    });
  });

  it('trims whitespace from name', async () => {
    mockPrisma.list.findUnique.mockResolvedValue({
      id: 'list-1', userId: 'user-1', name: 'Old', isSystem: false, position: 1,
    });
    mockPrisma.list.update.mockResolvedValue({
      id: 'list-1', userId: 'user-1', name: 'New', isSystem: false, position: 1, createdAt: new Date(),
    });

    const res = await request(app)
      .patch('/api/tasks/lists/list-1')
      .set('Cookie', authCookie('user-1'))
      .send({ name: '  New  ' });

    expect(res.status).toBe(200);
    expect(mockPrisma.list.update).toHaveBeenCalledWith({
      where: { id: 'list-1' },
      data: { name: 'New' },
    });
  });

  it('returns 400 for empty name', async () => {
    mockPrisma.list.findUnique.mockResolvedValue({
      id: 'list-1', userId: 'user-1', name: 'Shopping', isSystem: false, position: 1,
    });

    const res = await request(app)
      .patch('/api/tasks/lists/list-1')
      .set('Cookie', authCookie('user-1'))
      .send({ name: '' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('returns 400 for name exceeding 100 characters', async () => {
    mockPrisma.list.findUnique.mockResolvedValue({
      id: 'list-1', userId: 'user-1', name: 'Shopping', isSystem: false, position: 1,
    });

    const res = await request(app)
      .patch('/api/tasks/lists/list-1')
      .set('Cookie', authCookie('user-1'))
      .send({ name: 'a'.repeat(101) });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

describe('DELETE /api/tasks/lists/:id', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).delete('/api/tasks/lists/some-id');
    expect(res.status).toBe(401);
  });

  it('returns 404 when list does not exist', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .delete('/api/tasks/lists/nonexistent')
      .set('Cookie', authCookie('user-1'));

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('List not found');
  });

  it('returns 404 when list belongs to another user', async () => {
    mockPrisma.list.findUnique.mockResolvedValue({
      id: 'list-1', userId: 'other-user', name: 'Shopping', isSystem: false, position: 1,
    });

    const res = await request(app)
      .delete('/api/tasks/lists/list-1')
      .set('Cookie', authCookie('user-1'));

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('List not found');
  });

  it('returns 403 when deleting a system list', async () => {
    mockPrisma.list.findUnique.mockResolvedValue({
      id: 'inbox-id', userId: 'user-1', name: 'Inbox', isSystem: true, position: 0,
    });

    const res = await request(app)
      .delete('/api/tasks/lists/inbox-id')
      .set('Cookie', authCookie('user-1'));

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('System lists cannot be deleted');
  });

  it('deletes a non-system list', async () => {
    mockPrisma.list.findUnique.mockResolvedValue({
      id: 'list-1', userId: 'user-1', name: 'Shopping', isSystem: false, position: 1,
    });
    mockPrisma.list.delete.mockResolvedValue({
      id: 'list-1', userId: 'user-1', name: 'Shopping', isSystem: false, position: 1,
    });

    const res = await request(app)
      .delete('/api/tasks/lists/list-1')
      .set('Cookie', authCookie('user-1'));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockPrisma.list.delete).toHaveBeenCalledWith({
      where: { id: 'list-1' },
    });
  });
});
