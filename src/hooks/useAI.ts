import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Itinerary, Recommendations, PlannerInput, RecommendInput } from '@/types/ai';

export function useGenerateItinerary() {
  return useMutation({
    mutationFn: async (input: PlannerInput) => {
      const { data } = await api.post<{ status: string; data: Itinerary }>('/api/ai/planner', input);
      return data.data;
    },
  });
}

export function useGenerateTripItinerary() {
  return useMutation({
    mutationFn: async (tripId: string) => {
      const { data } = await api.post<{ status: string; data: Itinerary }>(`/api/ai/trip/${tripId}/itinerary`);
      return data.data;
    },
  });
}

export function useGetRecommendations() {
  return useMutation({
    mutationFn: async (input: RecommendInput) => {
      const { data } = await api.post<{ status: string; data: Recommendations }>('/api/ai/recommend', input);
      return data.data;
    },
  });
}

export function useChat() {
  return useMutation({
    mutationFn: async (messages: { role: string; content: string }[]) => {
      const { data } = await api.post<{ status: string; data: { reply: string } }>('/api/ai/chat', { messages });
      return data.data.reply;
    },
  });
}
