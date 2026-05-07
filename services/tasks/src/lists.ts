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

listsRouter.get('/', getLists);
