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
    mutationFn: async (params: { messages: { role: string; content: string }[]; historyId?: string }) => {
      const { data } = await api.post<{ status: string; data: { reply: string; historyId?: string } }>('/api/ai/chat', params);
      return data.data;
    },
  });
}

export function useChatHistoryList() {
  return useMutation({
    mutationFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await api.get<{ status: string; data: any[] }>('/api/ai/chat/history');
      return data.data;
    },
  });
}

export function useDeleteChatHistory() {
  return useMutation({
    mutationFn: async (historyId: string) => {
      await api.delete(`/api/ai/chat/history/${historyId}`);
    },
  });
}
