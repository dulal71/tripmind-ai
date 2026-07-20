export interface Activity {
  time: string;
  title: string;
  description: string;
  location?: string;
  cost?: number;
  duration?: string;
}

export interface DailyPlan {
  dayNumber: number;
  theme: string;
  activities: Activity[];
}

export interface BudgetBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export interface BudgetAnalysis {
  totalEstimatedCost: number;
  currency: string;
  breakdown: BudgetBreakdown[];
}

export interface Itinerary {
  days: DailyPlan[];
  budgetAnalysis: BudgetAnalysis;
  packingList: string[];
  aiTips: string[];
}

export interface RecommendDestination {
  name: string;
  country: string;
  continent: string;
  shortDescription: string;
  matchScore: number;
  estimatedDailyBudget: number;
  bestFor: string[];
  highlight: string;
}

export interface Recommendations {
  recommendations: RecommendDestination[];
}

export interface ChatMessageUI {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface PlannerInput {
  destinationId: string;
  duration: number;
  budget: string;
  travelStyle: string;
  travelerCount: number;
  interests: string[];
}

export interface RecommendInput {
  budget: string;
  travelStyle: string;
  interests: string[];
  duration: number;
}

export type AIBudget = 'economy' | 'budget' | 'moderate' | 'luxury';
export type AIStyle = 'adventure' | 'cultural' | 'relaxation' | 'family' | 'romantic' | 'solo';

export const BUDGET_OPTIONS: { value: AIBudget; label: string }[] = [
  { value: 'economy', label: 'Economy' },
  { value: 'budget', label: 'Budget' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'luxury', label: 'Luxury' },
];

export const STYLE_OPTIONS: { value: AIStyle; label: string }[] = [
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

export const SUGGESTED_PROMPTS = [
  "What should I pack for a beach vacation?",
  "How much should I budget for a trip to Japan?",
  "What are the best restaurants in Paris?",
  "Do I need a visa to visit Thailand?",
  "What's the best time to visit Iceland?",
  "How can I save money while traveling in Europe?",
];
