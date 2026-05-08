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
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
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

describe('GET /api/tasks/lists/:listId/tasks/:taskId', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/tasks/lists/list-1/tasks/task-1');
    expect(res.status).toBe(401);
  });

  it('returns 404 when list does not exist', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/tasks/lists/nonexistent/tasks/task-1')
      .set('Cookie', authCookie('user-1'));

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('List not found');
  });

  it('returns 404 when list belongs to another user', async () => {
    mockPrisma.list.findUnique.mockResolvedValue({ ...LIST, userId: 'other-user' });

    const res = await request(app)
      .get('/api/tasks/lists/list-1/tasks/task-1')
      .set('Cookie', authCookie('user-1'));

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('List not found');
  });

  it('returns 404 when task does not exist', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(LIST);
    mockPrisma.task.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/tasks/lists/list-1/tasks/nonexistent')
      .set('Cookie', authCookie('user-1'));

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Task not found');
  });

  it('returns 404 when task belongs to a different list', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(LIST);
    mockPrisma.task.findUnique.mockResolvedValue({
      id: 'task-1', listId: 'other-list', userId: 'user-1', title: 'Buy milk',
      completed: false, createdAt: new Date('2026-01-01'),
    });

    const res = await request(app)
      .get('/api/tasks/lists/list-1/tasks/task-1')
      .set('Cookie', authCookie('user-1'));

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Task not found');
  });

  it('returns 404 when task belongs to another user', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(LIST);
    mockPrisma.task.findUnique.mockResolvedValue({
      id: 'task-1', listId: 'list-1', userId: 'other-user', title: 'Buy milk',
      completed: false, createdAt: new Date('2026-01-01'),
    });

    const res = await request(app)
      .get('/api/tasks/lists/list-1/tasks/task-1')
      .set('Cookie', authCookie('user-1'));

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Task not found');
  });

  it('returns the task', async () => {
    const task = {
      id: 'task-1', listId: 'list-1', userId: 'user-1', title: 'Buy milk',
      description: 'Whole milk', dueDate: new Date('2026-06-15T00:00:00Z'),
      completed: false, createdAt: new Date('2026-01-01'),
    };
    mockPrisma.list.findUnique.mockResolvedValue(LIST);
    mockPrisma.task.findUnique.mockResolvedValue(task);

    const res = await request(app)
      .get('/api/tasks/lists/list-1/tasks/task-1')
      .set('Cookie', authCookie('user-1'));

    expect(res.status).toBe(200);
    expect(res.body.task.id).toBe('task-1');
    expect(res.body.task.title).toBe('Buy milk');
    expect(res.body.task.description).toBe('Whole milk');
    expect(res.body.task.completed).toBe(false);
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

const TASK = {
  id: 'task-1',
  listId: 'list-1',
  userId: 'user-1',
  title: 'Buy milk',
  completed: false,
  createdAt: new Date('2026-01-01'),
};

describe('PATCH /api/tasks/lists/:listId/tasks/:taskId', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app)
      .patch('/api/tasks/lists/list-1/tasks/task-1')
      .send({ completed: true });
    expect(res.status).toBe(401);
  });

  it('returns 404 when list does not exist', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/tasks/lists/list-1/tasks/task-1')
      .set('Cookie', authCookie('user-1'))
      .send({ completed: true });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('List not found');
  });

  it('returns 404 when list belongs to another user', async () => {
    mockPrisma.list.findUnique.mockResolvedValue({ ...LIST, userId: 'other-user' });

    const res = await request(app)
      .patch('/api/tasks/lists/list-1/tasks/task-1')
      .set('Cookie', authCookie('user-1'))
      .send({ completed: true });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('List not found');
  });

  it('returns 404 when task does not exist', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(LIST);
    mockPrisma.task.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/tasks/lists/list-1/tasks/nonexistent')
      .set('Cookie', authCookie('user-1'))
      .send({ completed: true });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Task not found');
  });

  it('returns 404 when task belongs to a different list', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(LIST);
    mockPrisma.task.findUnique.mockResolvedValue({ ...TASK, listId: 'other-list' });

    const res = await request(app)
      .patch('/api/tasks/lists/list-1/tasks/task-1')
      .set('Cookie', authCookie('user-1'))
      .send({ completed: true });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Task not found');
  });

  it('returns 404 when task belongs to another user', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(LIST);
    mockPrisma.task.findUnique.mockResolvedValue({ ...TASK, userId: 'other-user' });

    const res = await request(app)
      .patch('/api/tasks/lists/list-1/tasks/task-1')
      .set('Cookie', authCookie('user-1'))
      .send({ completed: true });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Task not found');
  });

  it('returns 400 when completed is not a boolean', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(LIST);
    mockPrisma.task.findUnique.mockResolvedValue(TASK);

    const res = await request(app)
      .patch('/api/tasks/lists/list-1/tasks/task-1')
      .set('Cookie', authCookie('user-1'))
      .send({ completed: 'yes' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('completed must be a boolean');
  });

  it('returns 400 when no valid fields provided', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(LIST);
    mockPrisma.task.findUnique.mockResolvedValue(TASK);

    const res = await request(app)
      .patch('/api/tasks/lists/list-1/tasks/task-1')
      .set('Cookie', authCookie('user-1'))
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('No valid fields to update');
  });

  it('marks a task as completed', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(LIST);
    mockPrisma.task.findUnique.mockResolvedValue(TASK);
    mockPrisma.task.update.mockResolvedValue({ ...TASK, completed: true });

    const res = await request(app)
      .patch('/api/tasks/lists/list-1/tasks/task-1')
      .set('Cookie', authCookie('user-1'))
      .send({ completed: true });

    expect(res.status).toBe(200);
    expect(res.body.task.completed).toBe(true);
    expect(mockPrisma.task.update).toHaveBeenCalledWith({
      where: { id: 'task-1' },
      data: { completed: true },
    });
  });

  it('marks a task as incomplete', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(LIST);
    mockPrisma.task.findUnique.mockResolvedValue({ ...TASK, completed: true });
    mockPrisma.task.update.mockResolvedValue({ ...TASK, completed: false });

    const res = await request(app)
      .patch('/api/tasks/lists/list-1/tasks/task-1')
      .set('Cookie', authCookie('user-1'))
      .send({ completed: false });

    expect(res.status).toBe(200);
    expect(res.body.task.completed).toBe(false);
    expect(mockPrisma.task.update).toHaveBeenCalledWith({
      where: { id: 'task-1' },
      data: { completed: false },
    });
  });

  it('updates the title', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(LIST);
    mockPrisma.task.findUnique.mockResolvedValue(TASK);
    mockPrisma.task.update.mockResolvedValue({ ...TASK, title: 'Updated title' });

    const res = await request(app)
      .patch('/api/tasks/lists/list-1/tasks/task-1')
      .set('Cookie', authCookie('user-1'))
      .send({ title: 'Updated title' });

    expect(res.status).toBe(200);
    expect(res.body.task.title).toBe('Updated title');
    expect(mockPrisma.task.update).toHaveBeenCalledWith({
      where: { id: 'task-1' },
      data: { title: 'Updated title' },
    });
  });

  it('trims whitespace from updated title', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(LIST);
    mockPrisma.task.findUnique.mockResolvedValue(TASK);
    mockPrisma.task.update.mockResolvedValue({ ...TASK, title: 'Trimmed' });

    const res = await request(app)
      .patch('/api/tasks/lists/list-1/tasks/task-1')
      .set('Cookie', authCookie('user-1'))
      .send({ title: '  Trimmed  ' });

    expect(res.status).toBe(200);
    expect(mockPrisma.task.update).toHaveBeenCalledWith({
      where: { id: 'task-1' },
      data: { title: 'Trimmed' },
    });
  });

  it('returns 400 for empty title', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(LIST);
    mockPrisma.task.findUnique.mockResolvedValue(TASK);

    const res = await request(app)
      .patch('/api/tasks/lists/list-1/tasks/task-1')
      .set('Cookie', authCookie('user-1'))
      .send({ title: '' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Title is required');
  });

  it('returns 400 for title exceeding 500 characters', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(LIST);
    mockPrisma.task.findUnique.mockResolvedValue(TASK);

    const res = await request(app)
      .patch('/api/tasks/lists/list-1/tasks/task-1')
      .set('Cookie', authCookie('user-1'))
      .send({ title: 'a'.repeat(501) });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Title must be 500 characters or less');
  });

  it('updates the description', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(LIST);
    mockPrisma.task.findUnique.mockResolvedValue(TASK);
    mockPrisma.task.update.mockResolvedValue({ ...TASK, description: 'Some details' });

    const res = await request(app)
      .patch('/api/tasks/lists/list-1/tasks/task-1')
      .set('Cookie', authCookie('user-1'))
      .send({ description: 'Some details' });

    expect(res.status).toBe(200);
    expect(res.body.task.description).toBe('Some details');
    expect(mockPrisma.task.update).toHaveBeenCalledWith({
      where: { id: 'task-1' },
      data: { description: 'Some details' },
    });
  });

  it('clears description with null', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(LIST);
    mockPrisma.task.findUnique.mockResolvedValue({ ...TASK, description: 'Old' });
    mockPrisma.task.update.mockResolvedValue({ ...TASK, description: null });

    const res = await request(app)
      .patch('/api/tasks/lists/list-1/tasks/task-1')
      .set('Cookie', authCookie('user-1'))
      .send({ description: null });

    expect(res.status).toBe(200);
    expect(res.body.task.description).toBeNull();
    expect(mockPrisma.task.update).toHaveBeenCalledWith({
      where: { id: 'task-1' },
      data: { description: null },
    });
  });

  it('returns 400 for non-string description', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(LIST);
    mockPrisma.task.findUnique.mockResolvedValue(TASK);

    const res = await request(app)
      .patch('/api/tasks/lists/list-1/tasks/task-1')
      .set('Cookie', authCookie('user-1'))
      .send({ description: 123 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Description must be a string');
  });

  it('returns 400 for description exceeding 2000 characters', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(LIST);
    mockPrisma.task.findUnique.mockResolvedValue(TASK);

    const res = await request(app)
      .patch('/api/tasks/lists/list-1/tasks/task-1')
      .set('Cookie', authCookie('user-1'))
      .send({ description: 'a'.repeat(2001) });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Description must be 2000 characters or less');
  });

  it('updates the due date', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(LIST);
    mockPrisma.task.findUnique.mockResolvedValue(TASK);
    const date = new Date('2026-06-15T00:00:00Z');
    mockPrisma.task.update.mockResolvedValue({ ...TASK, dueDate: date });

    const res = await request(app)
      .patch('/api/tasks/lists/list-1/tasks/task-1')
      .set('Cookie', authCookie('user-1'))
      .send({ dueDate: '2026-06-15' });

    expect(res.status).toBe(200);
    expect(mockPrisma.task.update).toHaveBeenCalledWith({
      where: { id: 'task-1' },
      data: { dueDate: new Date('2026-06-15T00:00:00Z') },
    });
  });

  it('clears due date with null', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(LIST);
    mockPrisma.task.findUnique.mockResolvedValue({ ...TASK, dueDate: new Date() });
    mockPrisma.task.update.mockResolvedValue({ ...TASK, dueDate: null });

    const res = await request(app)
      .patch('/api/tasks/lists/list-1/tasks/task-1')
      .set('Cookie', authCookie('user-1'))
      .send({ dueDate: null });

    expect(res.status).toBe(200);
    expect(res.body.task.dueDate).toBeNull();
    expect(mockPrisma.task.update).toHaveBeenCalledWith({
      where: { id: 'task-1' },
      data: { dueDate: null },
    });
  });

  it('returns 400 for invalid due date format', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(LIST);
    mockPrisma.task.findUnique.mockResolvedValue(TASK);

    const res = await request(app)
      .patch('/api/tasks/lists/list-1/tasks/task-1')
      .set('Cookie', authCookie('user-1'))
      .send({ dueDate: '06/15/2026' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('dueDate must be in YYYY-MM-DD format');
  });

  it('returns 400 for non-string due date', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(LIST);
    mockPrisma.task.findUnique.mockResolvedValue(TASK);

    const res = await request(app)
      .patch('/api/tasks/lists/list-1/tasks/task-1')
      .set('Cookie', authCookie('user-1'))
      .send({ dueDate: 20260615 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('dueDate must be a string in YYYY-MM-DD format');
  });

  it('updates multiple fields at once', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(LIST);
    mockPrisma.task.findUnique.mockResolvedValue(TASK);
    mockPrisma.task.update.mockResolvedValue({
      ...TASK,
      title: 'New title',
      description: 'New desc',
      dueDate: new Date('2026-06-15T00:00:00Z'),
      completed: true,
    });

    const res = await request(app)
      .patch('/api/tasks/lists/list-1/tasks/task-1')
      .set('Cookie', authCookie('user-1'))
      .send({ title: 'New title', description: 'New desc', dueDate: '2026-06-15', completed: true });

    expect(res.status).toBe(200);
    expect(mockPrisma.task.update).toHaveBeenCalledWith({
      where: { id: 'task-1' },
      data: {
        title: 'New title',
        description: 'New desc',
        dueDate: new Date('2026-06-15T00:00:00Z'),
        completed: true,
      },
    });
  });
});

describe('DELETE /api/tasks/lists/:listId/tasks/:taskId', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app)
      .delete('/api/tasks/lists/list-1/tasks/task-1');
    expect(res.status).toBe(401);
  });

  it('returns 404 when list does not exist', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .delete('/api/tasks/lists/list-1/tasks/task-1')
      .set('Cookie', authCookie('user-1'));

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('List not found');
  });

  it('returns 404 when list belongs to another user', async () => {
    mockPrisma.list.findUnique.mockResolvedValue({ ...LIST, userId: 'other-user' });

    const res = await request(app)
      .delete('/api/tasks/lists/list-1/tasks/task-1')
      .set('Cookie', authCookie('user-1'));

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('List not found');
  });

  it('returns 404 when task does not exist', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(LIST);
    mockPrisma.task.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .delete('/api/tasks/lists/list-1/tasks/nonexistent')
      .set('Cookie', authCookie('user-1'));

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Task not found');
  });

  it('returns 404 when task belongs to a different list', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(LIST);
    mockPrisma.task.findUnique.mockResolvedValue({ ...TASK, listId: 'other-list' });

    const res = await request(app)
      .delete('/api/tasks/lists/list-1/tasks/task-1')
      .set('Cookie', authCookie('user-1'));

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Task not found');
  });

  it('returns 404 when task belongs to another user', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(LIST);
    mockPrisma.task.findUnique.mockResolvedValue({ ...TASK, userId: 'other-user' });

    const res = await request(app)
      .delete('/api/tasks/lists/list-1/tasks/task-1')
      .set('Cookie', authCookie('user-1'));

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Task not found');
  });

  it('deletes a task and returns 204', async () => {
    mockPrisma.list.findUnique.mockResolvedValue(LIST);
    mockPrisma.task.findUnique.mockResolvedValue(TASK);
    mockPrisma.task.delete.mockResolvedValue(TASK);

    const res = await request(app)
      .delete('/api/tasks/lists/list-1/tasks/task-1')
      .set('Cookie', authCookie('user-1'));

    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
    expect(mockPrisma.task.delete).toHaveBeenCalledWith({
      where: { id: 'task-1' },
    });
  });
});
