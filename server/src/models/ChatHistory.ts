import { ObjectId } from 'mongodb';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatHistory {
  _id?: ObjectId;
  userId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}
