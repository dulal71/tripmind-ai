import dotenv from "dotenv";

dotenv.config();
import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  console.error('FATAL: OPENAI_API_KEY is not set in environment variables');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface PlannerInput {
  destinationName: string;
  country: string;
  duration: number;
  budget: string;
  travelStyle: string;
  travelerCount: number;
  interests: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface RecommendInput {
  budget: string;
  travelStyle: string;
  interests: string[];
  duration: number;
  previousDestinations?: string[];
}

const PLANNER_SYSTEM_PROMPT = `You are TripMind AI, an expert travel planner. Generate detailed, personalized travel itineraries.

Always respond with valid JSON in this exact format:
{
  "days": [
    {
      "dayNumber": 1,
      "theme": "Theme for the day",
      "activities": [
        {
          "time": "09:00 AM",
          "title": "Activity Title",
          "description": "Brief description",
          "location": "Location name",
          "cost": 25,
          "duration": "2 hours"
        }
      ]
    }
  ],
  "budgetAnalysis": {
    "totalEstimatedCost": 500,
    "currency": "USD",
    "breakdown": [
      { "category": "Accommodation", "amount": 200, "percentage": 40 },
      { "category": "Food", "amount": 100, "percentage": 20 },
      { "category": "Activities", "amount": 120, "percentage": 24 },
      { "category": "Transport", "amount": 80, "percentage": 16 }
    ]
  },
  "packingList": ["Item 1", "Item 2"],
  "aiTips": ["Tip 1", "Tip 2"]
}

Rules:
- Generate activities for each day of the trip
- Include realistic costs
- Mix popular attractions with hidden gems
- Include meal suggestions
- Consider the traveler's interests
- Provide practical packing tips
- Keep tips concise and actionable`;

const RECOMMEND_SYSTEM_PROMPT = `You are TripMind AI, an expert travel recommendation engine. Suggest personalized travel destinations.

Always respond with valid JSON in this exact format:
{
  "recommendations": [
    {
      "name": "Destination Name",
      "country": "Country",
      "continent": "Continent",
      "shortDescription": "Why this destination is perfect for the user",
      "matchScore": 95,
      "estimatedDailyBudget": 100,
      "bestFor": ["Interest1", "Interest2"],
      "highlight": "One standout feature"
    }
  ]
}

Rules:
- Suggest 5-8 destinations
- Match user interests and budget
- Include variety (different continents if possible)
- Provide match scores (0-100)
- Give realistic budget estimates
- Explain why each matches their preferences`;

const CHAT_SYSTEM_PROMPT = `You are TripMind AI, a friendly and knowledgeable travel assistant. You help users with:
- Travel planning and destination advice
- Visa and travel document guidance
- Packing tips and travel essentials
- Budget planning and money-saving tips
- Local customs and cultural insights
- Transportation recommendations
- Restaurant and food suggestions
- Safety tips

Rules:
- Be conversational and helpful
- Provide specific, actionable advice
- Ask clarifying questions when needed
- Keep responses concise but informative
- Use emoji sparingly for friendliness
- If you don't know something specific, say so honestly`;

export async function generateItinerary(input: PlannerInput) {
  const prompt = `Plan a ${input.duration}-day trip to ${input.destinationName}, ${input.country}.
Budget level: ${input.budget}
Travel style: ${input.travelStyle}
Number of travelers: ${input.travelerCount}
Interests: ${input.interests.join(', ')}

Create a detailed day-by-day itinerary with activities, meals, budget breakdown, packing list, and travel tips.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: PLANNER_SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 4000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('No response from AI');

  return JSON.parse(content);
}

export async function getRecommendations(input: RecommendInput) {
  const prompt = `Recommend travel destinations for a traveler with these preferences:
Budget level: ${input.budget}
Travel style: ${input.travelStyle}
Interests: ${input.interests.join(', ')}
Trip duration: ${input.duration} days${input.previousDestinations?.length ? `\nPreviously visited: ${input.previousDestinations.join(', ')}` : ''}

Suggest personalized destinations that match their profile.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: RECOMMEND_SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    temperature: 0.8,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('No response from AI');

  return JSON.parse(content);
}

export async function chat(
  messages: ChatMessage[],
  context?: string
) {
  const systemMessage = context
    ? `${CHAT_SYSTEM_PROMPT}\n\nAdditional context about the user's trips: ${context}`
    : CHAT_SYSTEM_PROMPT;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemMessage },
      ...messages,
    ],
    temperature: 0.7,
    max_tokens: 1500,
  });

  return response.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
}

export async function chatStream(
  messages: ChatMessage[],
  context?: string
) {
  const systemMessage = context
    ? `${CHAT_SYSTEM_PROMPT}\n\nAdditional context about the user's trips: ${context}`
    : CHAT_SYSTEM_PROMPT;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemMessage },
      ...messages,
    ],
    temperature: 0.7,
    max_tokens: 1500,
    stream: true,
  });

  return response;
}

export async function generateTripItinerary(destinationName: string, country: string, duration: number, budget: string, travelStyle: string, interests: string[]) {
  return generateItinerary({
    destinationName,
    country,
    duration,
    budget,
    travelStyle,
    travelerCount: 1,
    interests,
  });
}
