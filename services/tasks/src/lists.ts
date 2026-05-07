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

async function findUserList(listId: string, userId: string) {
  const list = await prisma.list.findUnique({ where: { id: listId } });
  if (!list || list.userId !== userId) return null;
  return list;
}

async function renameList(req: Request, res: Response): Promise<void> {
  const list = await findUserList(req.params.id, req.userId!);
  if (!list) {
    res.status(404).json({ error: 'List not found' });
    return;
  }

  if (list.isSystem) {
    res.status(403).json({ error: 'System lists cannot be renamed' });
    return;
  }

  const validation = validateListName(req.body.name);
  if (!validation.valid) {
    res.status(400).json({ error: validation.error });
    return;
  }

  const updated = await prisma.list.update({
    where: { id: list.id },
    data: { name: validation.name },
  });
  res.json({ list: updated });
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

function validateListIds(listIds: unknown): { valid: true; ids: string[] } | { valid: false; error: string } {
  if (!Array.isArray(listIds) || listIds.length === 0) {
    return { valid: false, error: 'listIds must be a non-empty array' };
  }
  if (!listIds.every((id) => typeof id === 'string' && id.length > 0)) {
    return { valid: false, error: 'Each listId must be a non-empty string' };
  }
  const unique = new Set(listIds);
  if (unique.size !== listIds.length) {
    return { valid: false, error: 'Duplicate listIds are not allowed' };
  }
  return { valid: true, ids: listIds };
}

async function reorderLists(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;
  const validation = validateListIds(req.body.listIds);
  if (!validation.valid) {
    res.status(400).json({ error: validation.error });
    return;
  }

  const userLists = await prisma.list.findMany({
    where: { userId },
    select: { id: true },
  });
  const userListIds = new Set(userLists.map((l) => l.id));

  if (validation.ids.length !== userListIds.size) {
    res.status(400).json({ error: 'listIds must include all user lists' });
    return;
  }
  for (const id of validation.ids) {
    if (!userListIds.has(id)) {
      res.status(400).json({ error: 'listIds must include only user lists' });
      return;
    }
  }

  const updates = validation.ids.map((id, index) =>
    prisma.list.update({ where: { id }, data: { position: index } })
  );
  await prisma.$transaction(updates);

  const lists = await prisma.list.findMany({
    where: { userId },
    orderBy: { position: 'asc' },
  });
  res.json({ lists });
}

async function deleteList(req: Request, res: Response): Promise<void> {
  const list = await findUserList(req.params.id, req.userId!);
  if (!list) {
    res.status(404).json({ error: 'List not found' });
    return;
  }

  if (list.isSystem) {
    res.status(403).json({ error: 'System lists cannot be deleted' });
    return;
  }

  await prisma.list.delete({ where: { id: list.id } });
  res.json({ success: true });
}

listsRouter.get('/', getLists);
listsRouter.post('/', createList);
listsRouter.put('/reorder', reorderLists);
listsRouter.patch('/:id', renameList);
listsRouter.delete('/:id', deleteList);
