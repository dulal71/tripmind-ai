import { ObjectId } from 'mongodb';

export interface Activity {
  time: string; // e.g. "09:00 AM", "Morning", "Evening"
  title: string;
  description: string;
  location?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  cost?: number;
  duration?: string; // e.g., "2 hours", "Half day"
}

export interface DailyPlan {
  dayNumber: number;
  date?: string; // e.g. "Day 1" or a specific date string
  theme: string;
  activities: Activity[];
}

export interface Itinerary {
  _id?: ObjectId;
  tripId: ObjectId; // Reference to Trip collection _id
  days: DailyPlan[];
  budgetAnalysis: {
    totalEstimatedCost: number;
    currency: string;
    breakdown: {
      category: string; // e.g., "Accommodation", "Food", "Activities", "Transport"
      amount: number;
      percentage: number;
    }[];
  };
  packingList: string[];
  aiTips: string[];
  createdAt: Date;
  updatedAt: Date;
}
