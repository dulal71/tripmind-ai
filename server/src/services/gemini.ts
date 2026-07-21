import { GoogleGenerativeAI, Content } from "@google/generative-ai";

let _genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!_genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables.');
    }
    _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return _genAI;
}

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
  const genAI = getGenAI();

  const prompt = `Plan a ${input.duration}-day trip to ${input.destinationName}, ${input.country}.
Budget level: ${input.budget}
Travel style: ${input.travelStyle}
Number of travelers: ${input.travelerCount}
Interests: ${input.interests.join(', ')}

Create a detailed day-by-day itinerary with activities, meals, budget breakdown, packing list, and travel tips.`;

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: PLANNER_SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4000,
    },
  });

  const result = await model.generateContent(prompt);
  const response = result.response;
  const content = response.text();

  if (!content) throw new Error('No response from Gemini');

  // Extract JSON from the response (handle markdown code blocks)
  const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/(\{[\s\S]*\})/);
  const jsonString = jsonMatch ? jsonMatch[1] : content;

  return JSON.parse(jsonString.trim());
}

export async function getRecommendations(input: RecommendInput) {
  const genAI = getGenAI();

  const prompt = `Recommend travel destinations for a traveler with these preferences:
Budget level: ${input.budget}
Travel style: ${input.travelStyle}
Interests: ${input.interests.join(', ')}
Trip duration: ${input.duration} days${input.previousDestinations?.length ? `\nPreviously visited: ${input.previousDestinations.join(', ')}` : ''}

Suggest personalized destinations that match their profile.`;

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: RECOMMEND_SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 2000,
    },
  });

  const result = await model.generateContent(prompt);
  const response = result.response;
  const content = response.text();

  if (!content) throw new Error('No response from Gemini');

  const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/(\{[\s\S]*\})/);
  const jsonString = jsonMatch ? jsonMatch[1] : content;

  return JSON.parse(jsonString.trim());
}

export async function chat(
  messages: ChatMessage[],
  context?: string
) {
  const genAI = getGenAI();

  const systemMessage = context
    ? `${CHAT_SYSTEM_PROMPT}\n\nAdditional context about the user's trips: ${context}`
    : CHAT_SYSTEM_PROMPT;

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: systemMessage,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1500,
    },
  });

  // Convert messages to Gemini format
  const history: Content[] = [];
  const userMessages = messages.slice(0, -1);
  const lastMessage = messages[messages.length - 1];

  for (let i = 0; i < userMessages.length; i++) {
    const msg = userMessages[i];
    if (i === 0 && msg.role === 'user') {
      history.push({ role: 'user', parts: [{ text: msg.content }] });
    } else if (msg.role === 'assistant') {
      history.push({ role: 'model', parts: [{ text: msg.content }] });
    } else if (msg.role === 'user') {
      history.push({ role: 'user', parts: [{ text: msg.content }] });
    }
  }

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(lastMessage.content);
  const response = result.response;

  return response.text() || 'I apologize, but I could not generate a response.';
}

export async function chatStream(
  messages: ChatMessage[],
  context?: string
) {
  const genAI = getGenAI();

  const systemMessage = context
    ? `${CHAT_SYSTEM_PROMPT}\n\nAdditional context about the user's trips: ${context}`
    : CHAT_SYSTEM_PROMPT;

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: systemMessage,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1500,
    },
  });

  // Convert messages to Gemini format
  const history: Content[] = [];
  const userMessages = messages.slice(0, -1);
  const lastMessage = messages[messages.length - 1];

  for (let i = 0; i < userMessages.length; i++) {
    const msg = userMessages[i];
    if (i === 0 && msg.role === 'user') {
      history.push({ role: 'user', parts: [{ text: msg.content }] });
    } else if (msg.role === 'assistant') {
      history.push({ role: 'model', parts: [{ text: msg.content }] });
    } else if (msg.role === 'user') {
      history.push({ role: 'user', parts: [{ text: msg.content }] });
    }
  }

  const chat = model.startChat({ history });
  const result = await chat.sendMessageStream(lastMessage.content);

  return result.stream;
}

export async function generateTripItinerary(
  destinationName: string,
  country: string,
  duration: number,
  budget: string,
  travelStyle: string,
  interests: string[]
) {
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
