import { Router, Request, Response } from 'express';
import { Prisma } from './generated/prisma/client';
import { prisma } from './db';

export const tasksRouter = Router({ mergeParams: true });

function validateNullableInt(
  field: string,
  value: unknown,
  min: number,
  max: number,
): { valid: true; value: number | null } | { valid: false; error: string } {
  if (value === null || value === undefined) {
    return { valid: true, value: null };
  }
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    return { valid: false, error: `${field} must be an integer` };
  }
  if (value < min || value > max) {
    return { valid: false, error: `${field} must be between ${min} and ${max}` };
  }
  return { valid: true, value };
}

function validateTimeEstimate(value: unknown) {
  return validateNullableInt('timeEstimate', value, 1, 1440);
}

function validateUrgency(value: unknown) {
  return validateNullableInt('urgency', value, 1, 4);
}

function validateImportance(value: unknown) {
  return validateNullableInt('importance', value, 1, 4);
}

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
    orderBy: { position: 'asc' },
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

  const data: Prisma.TaskUncheckedCreateInput = { listId, userId, title: validation.title, position: 0 };

  if (req.body.timeEstimate !== undefined) {
    const v = validateTimeEstimate(req.body.timeEstimate);
    if (!v.valid) { res.status(400).json({ error: v.error }); return; }
    data.timeEstimate = v.value;
  }

  if (req.body.urgency !== undefined) {
    const v = validateUrgency(req.body.urgency);
    if (!v.valid) { res.status(400).json({ error: v.error }); return; }
    data.urgency = v.value;
  }

  if (req.body.importance !== undefined) {
    const v = validateImportance(req.body.importance);
    if (!v.valid) { res.status(400).json({ error: v.error }); return; }
    data.importance = v.value;
  }

  const maxPos = await prisma.task.aggregate({
    where: { listId },
    _max: { position: true },
  });
  data.position = (maxPos._max.position ?? -1) + 1;

  const task = await prisma.task.create({ data });
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

  const data: Prisma.TaskUncheckedUpdateInput = {};
  const { title, description, dueDate, completed, timeEstimate, urgency, importance } = req.body;

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

  if (timeEstimate !== undefined) {
    const v = validateTimeEstimate(timeEstimate);
    if (!v.valid) { res.status(400).json({ error: v.error }); return; }
    data.timeEstimate = v.value;
  }

  if (urgency !== undefined) {
    const v = validateUrgency(urgency);
    if (!v.valid) { res.status(400).json({ error: v.error }); return; }
    data.urgency = v.value;
  }

  if (importance !== undefined) {
    const v = validateImportance(importance);
    if (!v.valid) { res.status(400).json({ error: v.error }); return; }
    data.importance = v.value;
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

async function getTask(req: Request, res: Response): Promise<void> {
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

  res.json({ task });
}

function validateTaskIds(taskIds: unknown): { valid: true; ids: string[] } | { valid: false; error: string } {
  if (!Array.isArray(taskIds) || taskIds.length === 0) {
    return { valid: false, error: 'taskIds must be a non-empty array' };
  }
  if (!taskIds.every((id) => typeof id === 'string' && id.length > 0)) {
    return { valid: false, error: 'Each taskId must be a non-empty string' };
  }
  const unique = new Set(taskIds);
  if (unique.size !== taskIds.length) {
    return { valid: false, error: 'Duplicate taskIds are not allowed' };
  }
  return { valid: true, ids: taskIds };
}

async function reorderTasks(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const { listId } = req.params;

  const list = await findUserList(listId, userId);
  if (!list) {
    res.status(404).json({ error: 'List not found' });
    return;
  }

  const validation = validateTaskIds(req.body.taskIds);
  if (!validation.valid) {
    res.status(400).json({ error: validation.error });
    return;
  }

  const listTasks = await prisma.task.findMany({
    where: { listId, userId },
    select: { id: true },
  });
  const listTaskIds = new Set(listTasks.map((t) => t.id));

  if (validation.ids.length !== listTaskIds.size) {
    res.status(400).json({ error: 'taskIds must include all tasks in the list' });
    return;
  }
  for (const id of validation.ids) {
    if (!listTaskIds.has(id)) {
      res.status(400).json({ error: 'taskIds must include only tasks in the list' });
      return;
    }
  }

  const updates = validation.ids.map((id, index) =>
    prisma.task.update({ where: { id }, data: { position: index } })
  );
  await prisma.$transaction(updates);

  const tasks = await prisma.task.findMany({
    where: { listId, userId },
    orderBy: { position: 'asc' },
  });
  res.json({ tasks });
}

tasksRouter.get('/', getTasks);
tasksRouter.get('/:taskId', getTask);
tasksRouter.post('/', createTask);
tasksRouter.put('/reorder', reorderTasks);
tasksRouter.patch('/:taskId', updateTask);
tasksRouter.delete('/:taskId', deleteTask);
