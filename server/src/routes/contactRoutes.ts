import { Router, Request, Response, NextFunction } from 'express';
import { getDB } from '../config/db';
import { ContactMessage } from '../models/ContactMessage';

const router = Router();

// ─── POST /api/contact ─────────────────────────────────────────────────────
// Submit a contact message
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      res.status(400).json({ status: 'error', message: 'Name, email, and message are required' });
      return;
    }

    const contactMessage: ContactMessage = {
      name,
      email,
      subject,
      message,
      read: false,
      createdAt: new Date(),
    };

    const result = await getDB().collection('contactMessages').insertOne(contactMessage);

    res.status(201).json({
      status: 'success',
      data: { ...contactMessage, _id: result.insertedId },
    });
  } catch (error) {
    console.error('[Contact Error]', error);
    next(error);
  }
});

// ─── GET /api/contact ──────────────────────────────────────────────────────
// Get all contact messages (admin only - placeholder for future)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const messages = await getDB()
      .collection('contactMessages')
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({ status: 'success', data: messages });
  } catch (error) {
    console.error('[Contact Error]', error);
    next(error);
  }
});

export default router;
