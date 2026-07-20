import { Request, Response, NextFunction } from 'express';
import { getDB } from '../config/db';

interface Session {
  _id: string;
  userId: string;
  token: string;
  expiresAt: Date;
}

export interface AuthRequest extends Request {
  userId?: string;
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ status: 'error', message: 'Authentication required' });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ status: 'error', message: 'Authentication required' });
      return;
    }

    const db = getDB();
    const session = await db.collection<Session>('session').findOne({ token });

    if (!session) {
      res.status(401).json({ status: 'error', message: 'Invalid session' });
      return;
    }

    if (new Date(session.expiresAt) < new Date()) {
      res.status(401).json({ status: 'error', message: 'Session expired' });
      return;
    }

    (req as AuthRequest).userId = session.userId;
    next();
  } catch (error) {
    next(error);
  }
};
