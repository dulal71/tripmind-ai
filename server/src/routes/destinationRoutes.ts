import { Router, Request, Response, NextFunction } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db';
import { Destination } from '../models/Destination';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';

const router = Router();

// Helper to get the destinations collection
const getCollection = () => getDB().collection<Destination>('destinations');

// ─── GET /api/destinations ─────────────────────────────────────────────────────
// Supports: ?search, ?continent, ?category, ?sort, ?page, ?limit
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      search,
      continent,
      category,
      season,
      sort = 'rating-desc',
      page = '1',
      limit = '12',
    } = req.query as Record<string, string>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    // Search — case-insensitive regex across name, country, description
    if (search) {
      const regex = { $regex: search, $options: 'i' };
      filter.$or = [
        { name: regex },
        { country: regex },
        { description: regex },
      ];
    }

    // Filter by continent
    if (continent) {
      filter.continent = continent;
    }

    // Filter by category (matches any in the categories array)
    if (category) {
      filter.categories = category;
    }

    // Filter by season/bestTimeToVisit
    if (season) {
      filter.bestTimeToVisit = { $regex: season, $options: 'i' };
    }

    // Sort mapping
    const sortMap: Record<string, Record<string, 1 | -1>> = {
      'rating-desc': { rating: -1, reviewCount: -1 },
      'rating-asc': { rating: 1, reviewCount: 1 },
      'cost-asc': { averageCostPerDay: 1 },
      'cost-desc': { averageCostPerDay: -1 },
      'name-asc': { name: 1 },
      'name-desc': { name: -1 },
    };
    const sortOption = sortMap[sort] || sortMap['rating-desc'];

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const collection = getCollection();

    const [destinations, totalCount] = await Promise.all([
      collection.find(filter).sort(sortOption).skip(skip).limit(limitNum).toArray(),
      collection.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.status(200).json({
      status: 'success',
      data: destinations,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/destinations/:id ──────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({ status: 'error', message: 'Invalid destination ID' });
      return;
    }

    const destination = await getCollection().findOne({ _id: new ObjectId(id) });

    if (!destination) {
      res.status(404).json({ status: 'error', message: 'Destination not found' });
      return;
    }

    res.status(200).json({ status: 'success', data: destination });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/destinations ─────────────────────────────────────────────────────
router.post('/', requireAuth, requireAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const destination: Destination = {
      ...req.body,
      createdAt: now,
      updatedAt: now,
    };

    const result = await getCollection().insertOne(destination);

    res.status(201).json({
      status: 'success',
      data: { ...destination, _id: result.insertedId },
    });
  } catch (error) {
    next(error);
  }
});

// ─── PUT /api/destinations/:id ──────────────────────────────────────────────────
router.put('/:id', requireAuth, requireAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({ status: 'error', message: 'Invalid destination ID' });
      return;
    }

    const updateData = { ...req.body, updatedAt: new Date() };
    delete updateData._id; // Prevent overwriting _id

    const result = await getCollection().findOneAndUpdate(
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

// ─── DELETE /api/destinations/:id ───────────────────────────────────────────────
router.delete('/:id', requireAuth, requireAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({ status: 'error', message: 'Invalid destination ID' });
      return;
    }

    const result = await getCollection().deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      res.status(404).json({ status: 'error', message: 'Destination not found' });
      return;
    }

    res.status(200).json({ status: 'success', message: 'Destination deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
