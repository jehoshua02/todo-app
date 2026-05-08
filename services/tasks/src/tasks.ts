import { Router, Request, Response } from 'express';
import { prisma } from './db';

export const tasksRouter = Router({ mergeParams: true });

function validateTitle(title: unknown): { valid: true; title: string } | { valid: false; error: string } {
  if (typeof title !== 'string' || title.trim().length === 0) {
    return { valid: false, error: 'Title is required' };
  }
  const trimmed = title.trim();
  if (trimmed.length > 500) {
    return { valid: false, error: 'Title must be 500 characters or less' };
  }
  return { valid: true, title: trimmed };
}

async function findUserList(listId: string, userId: string) {
  const list = await prisma.list.findUnique({ where: { id: listId } });
  if (!list || list.userId !== userId) return null;
  return list;
}

async function getTasks(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const { listId } = req.params;

  const list = await findUserList(listId, userId);
  if (!list) {
    res.status(404).json({ error: 'List not found' });
    return;
  }

  const tasks = await prisma.task.findMany({
    where: { listId, userId },
    orderBy: { createdAt: 'asc' },
  });
  res.json({ tasks });
}

async function findUserTask(taskId: string, listId: string, userId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task || task.listId !== listId || task.userId !== userId) return null;
  return task;
}

async function createTask(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const { listId } = req.params;

  const list = await findUserList(listId, userId);
  if (!list) {
    res.status(404).json({ error: 'List not found' });
    return;
  }

  const validation = validateTitle(req.body.title);
  if (!validation.valid) {
    res.status(400).json({ error: validation.error });
    return;
  }

  const task = await prisma.task.create({
    data: { listId, userId, title: validation.title },
  });
  res.status(201).json({ task });
}

function validateDescription(description: unknown): { valid: true; description: string | null } | { valid: false; error: string } {
  if (description === null || description === undefined) {
    return { valid: true, description: null };
  }
  if (typeof description !== 'string') {
    return { valid: false, error: 'Description must be a string' };
  }
  const trimmed = description.trim();
  if (trimmed.length > 2000) {
    return { valid: false, error: 'Description must be 2000 characters or less' };
  }
  return { valid: true, description: trimmed || null };
}

function validateDueDate(dueDate: unknown): { valid: true; dueDate: Date | null } | { valid: false; error: string } {
  if (dueDate === null || dueDate === undefined) {
    return { valid: true, dueDate: null };
  }
  if (typeof dueDate !== 'string') {
    return { valid: false, error: 'dueDate must be a string in YYYY-MM-DD format' };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    return { valid: false, error: 'dueDate must be in YYYY-MM-DD format' };
  }
  const parsed = new Date(dueDate + 'T00:00:00Z');
  if (isNaN(parsed.getTime())) {
    return { valid: false, error: 'dueDate is not a valid date' };
  }
  return { valid: true, dueDate: parsed };
}

async function updateTask(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const { listId, taskId } = req.params;

  const list = await findUserList(listId, userId);
  if (!list) {
    res.status(404).json({ error: 'List not found' });
    return;
  }

  const task = await findUserTask(taskId, listId, userId);
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  const data: Record<string, unknown> = {};
  const { title, description, dueDate, completed } = req.body;

  if (title !== undefined) {
    const v = validateTitle(title);
    if (!v.valid) { res.status(400).json({ error: v.error }); return; }
    data.title = v.title;
  }

  if (description !== undefined) {
    const v = validateDescription(description);
    if (!v.valid) { res.status(400).json({ error: v.error }); return; }
    data.description = v.description;
  }

  if (dueDate !== undefined) {
    const v = validateDueDate(dueDate);
    if (!v.valid) { res.status(400).json({ error: v.error }); return; }
    data.dueDate = v.dueDate;
  }

  if (completed !== undefined) {
    if (typeof completed !== 'boolean') {
      res.status(400).json({ error: 'completed must be a boolean' });
      return;
    }
    data.completed = completed;
  }

  if (Object.keys(data).length === 0) {
    res.status(400).json({ error: 'No valid fields to update' });
    return;
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data,
  });
  res.json({ task: updated });
}

async function deleteTask(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const { listId, taskId } = req.params;

  const list = await findUserList(listId, userId);
  if (!list) {
    res.status(404).json({ error: 'List not found' });
    return;
  }

  const task = await findUserTask(taskId, listId, userId);
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  await prisma.task.delete({ where: { id: taskId } });
  res.status(204).end();
}

tasksRouter.get('/', getTasks);
tasksRouter.post('/', createTask);
tasksRouter.patch('/:taskId', updateTask);
tasksRouter.delete('/:taskId', deleteTask);
