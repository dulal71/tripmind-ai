import { Router, Response, NextFunction } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db';
import { Favorite } from '../models/Favorite';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

const getCollection = () => getDB().collection<Favorite>('favorites');
const getDestinationsCollection = () => getDB().collection('destinations');

router.use(requireAuth);

// ─── GET /api/favorites ─────────────────────────────────────────────────────
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const favorites = await getCollection()
      .find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({ status: 'success', data: favorites });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/favorites ────────────────────────────────────────────────────
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { destinationId } = req.body;

    if (!destinationId || !ObjectId.isValid(destinationId)) {
      res.status(400).json({ status: 'error', message: 'Valid destination ID is required' });
      return;
    }

    const existing = await getCollection().findOne({
      userId: req.userId,
      destinationId: new ObjectId(destinationId),
    });

    if (existing) {
      res.status(409).json({ status: 'error', message: 'Already in favorites' });
      return;
    }

    const destination = await getDestinationsCollection().findOne({ _id: new ObjectId(destinationId) });

    const favorite: Favorite = {
      userId: req.userId!,
      destinationId: new ObjectId(destinationId),
      destinationName: destination?.name || '',
      destinationImage: destination?.imageUrl || '',
      destinationCountry: destination?.country || '',
      destinationRating: destination?.rating || 0,
      destinationCostPerDay: destination?.averageCostPerDay || 0,
      createdAt: new Date(),
    };

    const result = await getCollection().insertOne(favorite);

    res.status(201).json({
      status: 'success',
      data: { ...favorite, _id: result.insertedId },
    });
  } catch (error) {
    next(error);
  }
});

// ─── DELETE /api/favorites/:destinationId ────────────────────────────────────
router.delete('/:destinationId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { destinationId } = req.params;

    if (!ObjectId.isValid(destinationId)) {
      res.status(400).json({ status: 'error', message: 'Invalid destination ID' });
      return;
    }

    const result = await getCollection().deleteOne({
      userId: req.userId,
      destinationId: new ObjectId(destinationId),
    });

    if (result.deletedCount === 0) {
      res.status(404).json({ status: 'error', message: 'Favorite not found' });
      return;
    }

    res.status(200).json({ status: 'success', message: 'Removed from favorites' });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/favorites/check/:destinationId ────────────────────────────────
router.get('/check/:destinationId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { destinationId } = req.params;

    if (!ObjectId.isValid(destinationId)) {
      res.status(400).json({ status: 'error', message: 'Invalid destination ID' });
      return;
    }

    const existing = await getCollection().findOne({
      userId: req.userId,
      destinationId: new ObjectId(destinationId),
    });

    res.status(200).json({ status: 'success', data: { isFavorited: !!existing } });
  } catch (error) {
    next(error);
  }
});

export default router;
