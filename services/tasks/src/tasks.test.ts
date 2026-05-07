import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

vi.mock('./db', () => ({
  prisma: {
    list: {
      findUnique: vi.fn(),
    },
    task: {
      findMany: vi.fn(),
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

const LIST = {
  id: 'list-1',
  userId: 'user-1',
  name: 'Inbox',
  isSystem: true,
  position: 0,
  createdAt: new Date('2026-01-01'),
};

beforeEach(() => {
  vi.clearAllMocks();
  process.env.JWT_SECRET = TEST_SECRET;
});

describe('GET /api/tasks/lists/:listId/tasks', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/tasks/lists/list-1/tasks');
    expect(res.status).toBe(401);
  });

  it('returns 404 when list does not exist', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/tasks/lists/nonexistent/tasks')
      .set('Cookie', authCookie('user-1'));

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('List not found');
  });

  it('returns 404 when list belongs to another user', async () => {
    mockPrisma.list.findUnique.mockResolvedValue({ ...LIST, userId: 'other-user' });

    const res = await request(app)
      .get('/api/tasks/lists/list-1/tasks')
      .set('Cookie', authCookie('user-1'));

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('List not found');
  });

  it('returns tasks ordered by creation date ascending', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(LIST);
    const tasks = [
      { id: 't1', listId: 'list-1', userId: 'user-1', title: 'First', completed: false, createdAt: new Date('2026-01-01') },
      { id: 't2', listId: 'list-1', userId: 'user-1', title: 'Second', completed: false, createdAt: new Date('2026-01-02') },
    ];
    mockPrisma.task.findMany.mockResolvedValue(tasks);

    const res = await request(app)
      .get('/api/tasks/lists/list-1/tasks')
      .set('Cookie', authCookie('user-1'));

    expect(res.status).toBe(200);
    expect(res.body.tasks).toHaveLength(2);
    expect(res.body.tasks[0].title).toBe('First');
    expect(res.body.tasks[1].title).toBe('Second');

    expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
      where: { listId: 'list-1', userId: 'user-1' },
      orderBy: { createdAt: 'asc' },
    });
  });

  it('returns empty array when list has no tasks', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(LIST);
    mockPrisma.task.findMany.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/tasks/lists/list-1/tasks')
      .set('Cookie', authCookie('user-1'));

    expect(res.status).toBe(200);
    expect(res.body.tasks).toEqual([]);
  });
});

describe('POST /api/tasks/lists/:listId/tasks', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app)
      .post('/api/tasks/lists/list-1/tasks')
      .send({ title: 'Buy milk' });
    expect(res.status).toBe(401);
  });

  it('returns 404 when list does not exist', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/tasks/lists/nonexistent/tasks')
      .set('Cookie', authCookie('user-1'))
      .send({ title: 'Buy milk' });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('List not found');
  });

  it('returns 404 when list belongs to another user', async () => {
    mockPrisma.list.findUnique.mockResolvedValue({ ...LIST, userId: 'other-user' });

    const res = await request(app)
      .post('/api/tasks/lists/list-1/tasks')
      .set('Cookie', authCookie('user-1'))
      .send({ title: 'Buy milk' });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('List not found');
  });

  it('creates a task with valid title', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(LIST);
    const created = {
      id: 'task-1',
      listId: 'list-1',
      userId: 'user-1',
      title: 'Buy milk',
      completed: false,
      createdAt: new Date('2026-01-01'),
    };
    mockPrisma.task.create.mockResolvedValue(created);

    const res = await request(app)
      .post('/api/tasks/lists/list-1/tasks')
      .set('Cookie', authCookie('user-1'))
      .send({ title: 'Buy milk' });

    expect(res.status).toBe(201);
    expect(res.body.task.title).toBe('Buy milk');
    expect(res.body.task.completed).toBe(false);
    expect(mockPrisma.task.create).toHaveBeenCalledWith({
      data: { listId: 'list-1', userId: 'user-1', title: 'Buy milk' },
    });
  });

  it('trims whitespace from title', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(LIST);
    mockPrisma.task.create.mockResolvedValue({
      id: 'task-1', listId: 'list-1', userId: 'user-1', title: 'Trimmed', completed: false, createdAt: new Date(),
    });

    const res = await request(app)
      .post('/api/tasks/lists/list-1/tasks')
      .set('Cookie', authCookie('user-1'))
      .send({ title: '  Trimmed  ' });

    expect(res.status).toBe(201);
    expect(mockPrisma.task.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ title: 'Trimmed' }),
    });
  });

  it('returns 400 for empty title', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(LIST);

    const res = await request(app)
      .post('/api/tasks/lists/list-1/tasks')
      .set('Cookie', authCookie('user-1'))
      .send({ title: '' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Title is required');
  });

  it('returns 400 for missing title', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(LIST);

    const res = await request(app)
      .post('/api/tasks/lists/list-1/tasks')
      .set('Cookie', authCookie('user-1'))
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Title is required');
  });

  it('returns 400 for title exceeding 500 characters', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(LIST);

    const res = await request(app)
      .post('/api/tasks/lists/list-1/tasks')
      .set('Cookie', authCookie('user-1'))
      .send({ title: 'a'.repeat(501) });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Title must be 500 characters or less');
  });
});
