import { ObjectId } from 'mongodb';

export interface Trip {
  _id?: ObjectId;
  userId: string; // References Better Auth User ID
  destination: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  budget: 'economy' | 'budget' | 'moderate' | 'luxury';
  travelStyle: 'adventure' | 'cultural' | 'relaxation' | 'family' | 'romantic' | 'solo';
  travelerCount: number;
  interests: string[];
  imageUrl?: string;
  status: 'planning' | 'upcoming' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}
