import { ObjectId } from 'mongodb';

export type TripBudget = 'economy' | 'budget' | 'moderate' | 'luxury';
export type TripStyle = 'adventure' | 'cultural' | 'relaxation' | 'family' | 'romantic' | 'solo';
export type TripStatus = 'planning' | 'upcoming' | 'completed' | 'cancelled';

export interface Trip {
  _id?: ObjectId;
  userId: string;
  destinationId: ObjectId;
  destinationName?: string;
  destinationImage?: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  budget: TripBudget;
  travelStyle: TripStyle;
  travelerCount: number;
  interests: string[];
  preferences?: string;
  status: TripStatus;
  aiItinerary?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
