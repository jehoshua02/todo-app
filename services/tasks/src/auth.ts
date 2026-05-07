import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function requireAuth(secret: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const token = req.cookies?.access_token;
    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    try {
      const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });
      if (typeof payload === 'string' || !payload.sub) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
      }
      req.userId = payload.sub;
      next();
    } catch {
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}
