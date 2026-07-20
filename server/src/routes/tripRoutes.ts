import { Router, Response, NextFunction } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db';
import { Trip } from '../models/Trip';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

const getCollection = () => getDB().collection<Trip>('trips');
const getDestinationsCollection = () => getDB().collection('destinations');

router.use(requireAuth);

// ─── POST /api/trips ─────────────────────────────────────────────────────────
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      destinationId,
      startDate,
      endDate,
      budget,
      travelStyle,
      travelerCount,
      interests,
    } = req.body;

    if (!destinationId || !ObjectId.isValid(destinationId)) {
      res.status(400).json({ status: 'error', message: 'Valid destination ID is required' });
      return;
    }

    if (!startDate || !endDate) {
      res.status(400).json({ status: 'error', message: 'Start date and end date are required' });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      res.status(400).json({ status: 'error', message: 'End date cannot be before start date' });
      return;
    }

    const duration = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    const destination = await getDestinationsCollection().findOne({ _id: new ObjectId(destinationId) });

    const now = new Date();
    const trip: Trip = {
      userId: req.userId!,
      destinationId: new ObjectId(destinationId),
      destinationName: destination?.name || '',
      destinationImage: destination?.imageUrl || '',
      startDate: start,
      endDate: end,
      duration,
      budget: budget || 'moderate',
      travelStyle: travelStyle || 'cultural',
      travelerCount: travelerCount || 1,
      interests: interests || [],
      status: 'planning',
      createdAt: now,
      updatedAt: now,
    };

    const result = await getCollection().insertOne(trip);

    res.status(201).json({
      status: 'success',
      data: { ...trip, _id: result.insertedId },
    });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/trips ──────────────────────────────────────────────────────────
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const trips = await getCollection()
      .find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({ status: 'success', data: trips });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/trips/:id ──────────────────────────────────────────────────────
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({ status: 'error', message: 'Invalid trip ID' });
      return;
    }

    const trip = await getCollection().findOne({
      _id: new ObjectId(id),
      userId: req.userId,
    });

    if (!trip) {
      res.status(404).json({ status: 'error', message: 'Trip not found' });
      return;
    }

    res.status(200).json({ status: 'success', data: trip });
  } catch (error) {
    next(error);
  }
});

// ─── PUT /api/trips/:id ──────────────────────────────────────────────────────
router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({ status: 'error', message: 'Invalid trip ID' });
      return;
    }

    const existing = await getCollection().findOne({
      _id: new ObjectId(id),
      userId: req.userId,
    });

    if (!existing) {
      res.status(404).json({ status: 'error', message: 'Trip not found' });
      return;
    }

    const {
      destinationId,
      startDate,
      endDate,
      budget,
      travelStyle,
      travelerCount,
      interests,
      status,
    } = req.body;

    const updateData: Partial<Trip> = { updatedAt: new Date() };

    if (destinationId !== undefined) {
      if (!ObjectId.isValid(destinationId)) {
        res.status(400).json({ status: 'error', message: 'Invalid destination ID' });
        return;
      }
      const dest = await getDestinationsCollection().findOne({ _id: new ObjectId(destinationId) });
      updateData.destinationId = new ObjectId(destinationId);
      updateData.destinationName = dest?.name || '';
      updateData.destinationImage = dest?.imageUrl || '';
    }

    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (budget !== undefined) updateData.budget = budget;
    if (travelStyle !== undefined) updateData.travelStyle = travelStyle;
    if (travelerCount !== undefined) updateData.travelerCount = travelerCount;
    if (interests !== undefined) updateData.interests = interests;
    if (status !== undefined) updateData.status = status;

    if (updateData.startDate || updateData.endDate) {
      const s = updateData.startDate || existing.startDate;
      const e = updateData.endDate || existing.endDate;
      updateData.duration = Math.max(1, Math.ceil((new Date(e).getTime() - new Date(s).getTime()) / (1000 * 60 * 60 * 24)));
    }

    const result = await getCollection().findOneAndUpdate(
      { _id: new ObjectId(id), userId: req.userId },
      { $set: updateData },
      { returnDocument: 'after' },
    );

    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
});

// ─── DELETE /api/trips/:id ───────────────────────────────────────────────────
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({ status: 'error', message: 'Invalid trip ID' });
      return;
    }

    const result = await getCollection().deleteOne({
      _id: new ObjectId(id),
      userId: req.userId,
    });

    if (result.deletedCount === 0) {
      res.status(404).json({ status: 'error', message: 'Trip not found' });
      return;
    }

    res.status(200).json({ status: 'success', message: 'Trip deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
