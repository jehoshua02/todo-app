import { Router, Request, Response } from 'express';
import { prisma } from './db';

export const listsRouter = Router();

async function ensureInbox(userId: string): Promise<void> {
  const count = await prisma.list.count({ where: { userId } });
  if (count === 0) {
    await prisma.list.create({
      data: { userId, name: 'Inbox', isSystem: true, position: 0 },
    });
  }
}

async function getLists(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  await ensureInbox(userId);
  const lists = await prisma.list.findMany({
    where: { userId },
    orderBy: { position: 'asc' },
  });
  res.json({ lists });
}

function validateListName(name: unknown): { valid: true; name: string } | { valid: false; error: string } {
  if (typeof name !== 'string' || name.trim().length === 0) {
    return { valid: false, error: 'Name is required' };
  }
  const trimmed = name.trim();
  if (trimmed.length > 100) {
    return { valid: false, error: 'Name must be 100 characters or less' };
  }
  return { valid: true, name: trimmed };
}

async function nextPosition(userId: string): Promise<number> {
  const result = await prisma.list.aggregate({
    where: { userId },
    _max: { position: true },
  });
  return (result._max.position ?? 0) + 1;
}

async function createList(req: Request, res: Response): Promise<void> {
  const validation = validateListName(req.body.name);
  if (!validation.valid) {
    res.status(400).json({ error: validation.error });
    return;
  }

  const userId = req.userId!;
  const position = await nextPosition(userId);
  const list = await prisma.list.create({
    data: { userId, name: validation.name, isSystem: false, position },
  });
  res.status(201).json({ list });
}

listsRouter.get('/', getLists);
listsRouter.post('/', createList);
