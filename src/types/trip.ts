import { Itinerary } from './ai';

export type TripBudget = 'economy' | 'budget' | 'moderate' | 'luxury';
export type TripStyle = 'adventure' | 'cultural' | 'relaxation' | 'family' | 'romantic' | 'solo';
export type TripStatus = 'planning' | 'upcoming' | 'completed' | 'cancelled';

export interface Trip {
  _id: string;
  userId: string;
  destinationId: string;
  destinationName: string;
  destinationImage: string;
  startDate: string;
  endDate: string;
  duration: number;
  budget: TripBudget;
  travelStyle: TripStyle;
  travelerCount: number;
  interests: string[];
  status: TripStatus;
  aiItinerary?: Itinerary;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTripInput {
  destinationId: string;
  startDate: string;
  endDate: string;
  budget: TripBudget;
  travelStyle: TripStyle;
  travelerCount: number;
  interests: string[];
}

export interface UpdateTripInput extends Partial<CreateTripInput> {
  status?: TripStatus;
}

export const BUDGET_OPTIONS: { value: TripBudget; label: string }[] = [
  { value: 'economy', label: 'Economy' },
  { value: 'budget', label: 'Budget' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'luxury', label: 'Luxury' },
];

export const STYLE_OPTIONS: { value: TripStyle; label: string }[] = [
  { value: 'adventure', label: 'Adventure' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'relaxation', label: 'Relaxation' },
  { value: 'family', label: 'Family' },
  { value: 'romantic', label: 'Romantic' },
  { value: 'solo', label: 'Solo' },
];

export const INTEREST_OPTIONS = [
  'History',
  'Food',
  'Nature',
  'Nightlife',
  'Shopping',
  'Photography',
  'Architecture',
  'Beaches',
  'Hiking',
  'Museums',
  'Wildlife',
  'Art',
  'Music',
  'Sports',
  'Wellness',
];
