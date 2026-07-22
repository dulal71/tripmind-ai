import { Response, NextFunction } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db';
import { AuthRequest } from './auth';

export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      res.status(401).json({ status: 'error', message: 'Authentication required' });
      return;
    }

    const db = getDB();
    const user = await db.collection('user').findOne({ _id: new ObjectId(req.userId) });

    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }

    if (user.role !== "admin") {
      res.status(403).json({ status: 'error', message: 'Admin access required' });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};
