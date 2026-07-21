import { Router, Response, NextFunction } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

// ─── PUT /api/users/profile ───────────────────────────────────────────────
// Update user profile
router.put('/profile', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, image } = req.body;
    const db = getDB();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (image !== undefined) updateData.image = image;

    const result = await db.collection('user').findOneAndUpdate(
      { _id: new ObjectId(req.userId) },
      { $set: updateData },
      { returnDocument: 'after' }
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
        image: result.image,
        role: result.role,
      },
    });
  } catch (error) {
    console.error('[User Profile Error]', error);
    next(error);
  }
});

// ─── GET /api/users/profile ───────────────────────────────────────────────
// Get current user profile
router.get('/profile', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const db = getDB();
    const user = await db.collection('user').findOne({ _id: new ObjectId(req.userId) });

    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('[User Profile Error]', error);
    next(error);
  }
});

export default router;
