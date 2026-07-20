import { Router, Response, NextFunction } from 'express';
import { ObjectId, Document } from 'mongodb';
import { getDB } from '../config/db';
import { requireAuth, AuthRequest } from '../middleware/auth';
import {
  generateItinerary,
  getRecommendations,
  chat,
  chatStream,
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
    const { messages, historyId } = req.body;

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

    // Persist chat history
    const now = new Date();
    const allMessages = [
      ...typedMessages.map((m) => ({ ...m, timestamp: now })),
      { role: 'assistant' as const, content: reply, timestamp: now },
    ];

    if (historyId && ObjectId.isValid(historyId)) {
      await db.collection('chatHistories').updateOne(
        { _id: new ObjectId(historyId), userId: req.userId },
        { $set: { messages: allMessages, updatedAt: now } }
      );
    } else {
      const result = await db.collection('chatHistories').insertOne({
        userId: req.userId,
        messages: allMessages,
        createdAt: now,
        updatedAt: now,
      });
      res.status(200).json({ status: 'success', data: { reply, historyId: result.insertedId } });
      return;
    }

    res.status(200).json({ status: 'success', data: { reply, historyId } });
  } catch (error) {
    console.error('[AI Chat Error]', error);
    next(error);
  }
});

// ─── GET /api/ai/chat/history ──────────────────────────────────────────────
// Get user's chat histories
router.get('/chat/history', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const db = getDB();
    const histories = await db.collection('chatHistories')
      .find({ userId: req.userId })
      .sort({ updatedAt: -1 })
      .limit(20)
      .toArray();

    res.status(200).json({ status: 'success', data: histories });
  } catch (error) {
    console.error('[Chat History Error]', error);
    next(error);
  }
});

// ─── GET /api/ai/chat/history/:id ──────────────────────────────────────────
// Get a specific chat history
router.get('/chat/history/:id', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({ status: 'error', message: 'Invalid history ID' });
      return;
    }

    const db = getDB();
    const history = await db.collection('chatHistories').findOne({
      _id: new ObjectId(id),
      userId: req.userId,
    });

    if (!history) {
      res.status(404).json({ status: 'error', message: 'Chat history not found' });
      return;
    }

    res.status(200).json({ status: 'success', data: history });
  } catch (error) {
    console.error('[Chat History Error]', error);
    next(error);
  }
});

// ─── DELETE /api/ai/chat/history/:id ───────────────────────────────────────
// Delete a specific chat history
router.delete('/chat/history/:id', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      res.status(400).json({ status: 'error', message: 'Invalid history ID' });
      return;
    }

    const db = getDB();
    const result = await db.collection('chatHistories').deleteOne({
      _id: new ObjectId(id),
      userId: req.userId,
    });

    if (result.deletedCount === 0) {
      res.status(404).json({ status: 'error', message: 'Chat history not found' });
      return;
    }

    res.status(200).json({ status: 'success', message: 'Chat history deleted' });
  } catch (error) {
    console.error('[Chat History Error]', error);
    next(error);
  }
});

// ─── POST /api/ai/chat/stream ──────────────────────────────────────────────
// Stream chat with AI assistant using SSE
router.post('/chat/stream', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { messages, historyId } = req.body;

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

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const stream = await chatStream(typedMessages, context);
    let fullContent = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullContent += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    // Save chat history after streaming completes
    const now = new Date();
    const allMessages = [
      ...typedMessages.map((m) => ({ ...m, timestamp: now })),
      { role: 'assistant' as const, content: fullContent, timestamp: now },
    ];

    let savedHistoryId = historyId;
    if (historyId && ObjectId.isValid(historyId)) {
      await db.collection('chatHistories').updateOne(
        { _id: new ObjectId(historyId), userId: req.userId },
        { $set: { messages: allMessages, updatedAt: now } }
      );
    } else {
      const result = await db.collection('chatHistories').insertOne({
        userId: req.userId,
        messages: allMessages,
        createdAt: now,
        updatedAt: now,
      });
      savedHistoryId = result.insertedId.toString();
    }

    // Send completion event with historyId
    res.write(`data: ${JSON.stringify({ done: true, historyId: savedHistoryId })}\n\n`);
    res.end();
  } catch (error) {
    console.error('[AI Chat Stream Error]', error);
    res.write(`data: ${JSON.stringify({ error: 'Failed to generate response' })}\n\n`);
    res.end();
  }
});

export default router;
