import { Router, Response, NextFunction } from 'express';
import { ObjectId, Document } from 'mongodb';
import { getDB } from '../config/db';
import { requireAuth, AuthRequest } from '../middleware/auth';
import {
  generateItinerary,
  getRecommendations,
  chat,
  generateTripItinerary,
  ChatMessage,
} from '../services/ai';

const router = Router();

// ─── POST /api/ai/planner ────────────────────────────────────────────────────
// Generate a full itinerary from scratch (standalone planner)
router.post('/planner', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { destinationId, duration, budget, travelStyle, travelerCount, interests } = req.body;

    if (!destinationId || !ObjectId.isValid(destinationId)) {
      res.status(400).json({ status: 'error', message: 'Valid destination ID is required' });
      return;
    }

    if (!duration || duration < 1 || duration > 30) {
      res.status(400).json({ status: 'error', message: 'Duration must be between 1 and 30 days' });
      return;
    }

    const db = getDB();
    const destination = await db.collection('destinations').findOne({ _id: new ObjectId(destinationId) });

    if (!destination) {
      res.status(404).json({ status: 'error', message: 'Destination not found' });
      return;
    }

    const itinerary = await generateItinerary({
      destinationName: destination.name,
      country: destination.country,
      duration: Number(duration),
      budget: budget || 'moderate',
      travelStyle: travelStyle || 'cultural',
      travelerCount: travelerCount || 1,
      interests: interests || [],
    });

    res.status(200).json({ status: 'success', data: itinerary });
  } catch (error) {
    console.error('[AI Planner Error]', error);
    next(error);
  }
});

// ─── POST /api/ai/trip/:id/itinerary ────────────────────────────────────────
// Generate itinerary for an existing trip
router.post('/trip/:id/itinerary', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({ status: 'error', message: 'Invalid trip ID' });
      return;
    }

    const db = getDB();
    const trip = await db.collection('trips').findOne({
      _id: new ObjectId(id),
      userId: req.userId,
    });

    if (!trip) {
      res.status(404).json({ status: 'error', message: 'Trip not found' });
      return;
    }

    const destination = await db.collection('destinations').findOne({ _id: trip.destinationId });

    const itinerary = await generateTripItinerary(
      destination?.name || trip.destinationName || 'Unknown',
      destination?.country || 'Unknown',
      trip.duration,
      trip.budget,
      trip.travelStyle,
      trip.interests || []
    );

    // Store itinerary in trip document
    await db.collection('trips').updateOne(
      { _id: new ObjectId(id) },
      { $set: { aiItinerary: itinerary, updatedAt: new Date() } }
    );

    res.status(200).json({ status: 'success', data: itinerary });
  } catch (error) {
    console.error('[AI Trip Itinerary Error]', error);
    next(error);
  }
});

// ─── POST /api/ai/recommend ──────────────────────────────────────────────────
// Get personalized destination recommendations
router.post('/recommend', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { budget, travelStyle, interests, duration } = req.body;

    if (!interests || interests.length === 0) {
      res.status(400).json({ status: 'error', message: 'At least one interest is required' });
      return;
    }

    // Get user's previous trip destinations for variety
    const db = getDB();
    const previousTrips = await db.collection('trips')
      .find({ userId: req.userId })
      .toArray();

    const previousDestinations = previousTrips
      .map((t: Document) => t.destinationName as string)
      .filter(Boolean);

    const recommendations = await getRecommendations({
      budget: budget || 'moderate',
      travelStyle: travelStyle || 'cultural',
      interests,
      duration: duration || 7,
      previousDestinations,
    });

    res.status(200).json({ status: 'success', data: recommendations });
  } catch (error) {
    console.error('[AI Recommend Error]', error);
    next(error);
  }
});

// ─── POST /api/ai/chat ───────────────────────────────────────────────────────
// Chat with AI assistant
router.post('/chat', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ status: 'error', message: 'Messages array is required' });
      return;
    }

    // Build context from user's trips
    const db = getDB();
    const trips = await db.collection('trips')
      .find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    let context = '';
    if (trips.length > 0) {
      context = 'User recent trips: ' + trips.map((t: Document) =>
        `${t.destinationName} (${t.duration} days, ${t.budget} budget, ${t.travelStyle} style)`
      ).join('; ');
    }

    const typedMessages: ChatMessage[] = messages.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const reply = await chat(typedMessages, context);

    res.status(200).json({ status: 'success', data: { reply } });
  } catch (error) {
    console.error('[AI Chat Error]', error);
    next(error);
  }
});

export default router;
