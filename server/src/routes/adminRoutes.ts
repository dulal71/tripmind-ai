import { Router, Response, NextFunction } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';

const router = Router();

router.use(requireAuth);
router.use(requireAdmin);

// ─── GET /api/admin/stats ────────────────────────────────────────────────
router.get('/stats', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const db = getDB();

    const [totalUsers, totalDestinations, totalTrips, totalFavorites, totalContactMessages] = await Promise.all([
      db.collection('user').countDocuments(),
      db.collection('destinations').countDocuments(),
      db.collection('trips').countDocuments(),
      db.collection('favorites').countDocuments(),
      db.collection('contactmessages').countDocuments(),
    ]);

    const usersWithRole = await db.collection('user').aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]).toArray();

    const recentUsers = await db.collection('user')
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .project({ name: 1, email: 1, role: 1, createdAt: 1 })
      .toArray();

    const recentTrips = await db.collection('trips')
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    res.status(200).json({
      status: 'success',
      data: {
        totalUsers,
        totalDestinations,
        totalTrips,
        totalFavorites,
        totalContactMessages,
        usersByRole: usersWithRole.reduce((acc, r) => {
          acc[r._id || 'unknown'] = r.count;
          return acc;
        }, {} as Record<string, number>),
        recentUsers,
        recentTrips,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/admin/users ────────────────────────────────────────────────
router.get('/users', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const db = getDB();
    const { page = '1', limit = '20', search, role } = req.query as Record<string, string>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (search) {
      const regex = { $regex: search, $options: 'i' };
      filter.$or = [{ name: regex }, { email: regex }];
    }

    if (role) {
      filter.role = role;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [users, totalCount] = await Promise.all([
      db.collection('user')
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .project({ name: 1, email: 1, role: 1, createdAt: 1, image: 1 })
        .toArray(),
      db.collection('user').countDocuments(filter),
    ]);

    res.status(200).json({
      status: 'success',
      data: users,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalCount,
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ─── PUT /api/admin/users/:id/role ───────────────────────────────────────
router.put('/users/:id/role', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({ status: 'error', message: 'Invalid user ID' });
      return;
    }

    if (!role || !['user', 'admin'].includes(role)) {
      res.status(400).json({ status: 'error', message: 'Role must be "user" or "admin"' });
      return;
    }

    const db = getDB();
    const result = await db.collection('user').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { role, updatedAt: new Date() } },
      { returnDocument: 'after' },
    );

    if (!result) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: {
        id: result._id,
        name: result.name,
        email: result.email,
        role: result.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ─── DELETE /api/admin/users/:id ─────────────────────────────────────────
router.delete('/users/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({ status: 'error', message: 'Invalid user ID' });
      return;
    }

    if (id === req.userId) {
      res.status(400).json({ status: 'error', message: 'Cannot delete your own account' });
      return;
    }

    const db = getDB();
    const result = await db.collection('user').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }

    await db.collection('session').deleteMany({ userId: id });
    await db.collection('favorites').deleteMany({ userId: id });
    await db.collection('trips').deleteMany({ userId: id });

    res.status(200).json({ status: 'success', message: 'User deleted' });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/admin/destinations ─────────────────────────────────────────
router.get('/destinations', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const db = getDB();
    const { page = '1', limit = '20', search } = req.query as Record<string, string>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (search) {
      const regex = { $regex: search, $options: 'i' };
      filter.$or = [{ name: regex }, { country: regex }];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [destinations, totalCount] = await Promise.all([
      db.collection('destinations')
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .toArray(),
      db.collection('destinations').countDocuments(filter),
    ]);

    res.status(200).json({
      status: 'success',
      data: destinations,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalCount,
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/admin/destinations ────────────────────────────────────────
router.post('/destinations', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const db = getDB();
    const now = new Date();
    const destination = {
      ...req.body,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection('destinations').insertOne(destination);

    res.status(201).json({
      status: 'success',
      data: { ...destination, _id: result.insertedId },
    });
  } catch (error) {
    next(error);
  }
});

// ─── PUT /api/admin/destinations/:id ─────────────────────────────────────
router.put('/destinations/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({ status: 'error', message: 'Invalid destination ID' });
      return;
    }

    const db = getDB();
    const updateData = { ...req.body, updatedAt: new Date() };
    delete updateData._id;

    const result = await db.collection('destinations').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' },
    );

    if (!result) {
      res.status(404).json({ status: 'error', message: 'Destination not found' });
      return;
    }

    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
});

// ─── DELETE /api/admin/destinations/:id ──────────────────────────────────
router.delete('/destinations/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({ status: 'error', message: 'Invalid destination ID' });
      return;
    }

    const db = getDB();
    const result = await db.collection('destinations').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      res.status(404).json({ status: 'error', message: 'Destination not found' });
      return;
    }

    res.status(200).json({ status: 'success', message: 'Destination deleted' });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/admin/trips ────────────────────────────────────────────────
router.get('/trips', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const db = getDB();
    const { page = '1', limit = '20' } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [trips, totalCount] = await Promise.all([
      db.collection('trips')
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .toArray(),
      db.collection('trips').countDocuments(),
    ]);

    res.status(200).json({
      status: 'success',
      data: trips,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalCount,
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/admin/contact-messages ─────────────────────────────────────
router.get('/contact-messages', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const db = getDB();
    const { page = '1', limit = '20' } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [messages, totalCount] = await Promise.all([
      db.collection('contactmessages')
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .toArray(),
      db.collection('contactmessages').countDocuments(),
    ]);

    res.status(200).json({
      status: 'success',
      data: messages,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalCount,
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ─── DELETE /api/admin/contact-messages/:id ──────────────────────────────
router.delete('/contact-messages/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({ status: 'error', message: 'Invalid message ID' });
      return;
    }

    const db = getDB();
    const result = await db.collection('contactmessages').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      res.status(404).json({ status: 'error', message: 'Message not found' });
      return;
    }

    res.status(200).json({ status: 'success', message: 'Message deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
