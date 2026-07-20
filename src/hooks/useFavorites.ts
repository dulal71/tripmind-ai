import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Favorite {
  _id: string;
  userId: string;
  destinationId: string;
  destinationName: string;
  destinationImage: string;
  createdAt: string;
}

export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const { data } = await api.get<{ status: string; data: Favorite[] }>('/api/favorites');
      return data.data;
    },
  });
}

export function useIsFavorited(destinationId: string) {
  return useQuery({
    queryKey: ['favorites', 'check', destinationId],
    queryFn: async () => {
      const { data } = await api.get<{ status: string; data: { isFavorited: boolean } }>(
        `/api/favorites/check/${destinationId}`
      );
      return data.data.isFavorited;
    },
    enabled: !!destinationId,
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (destinationId: string) => {
      const { data } = await api.post<{ status: string; data: Favorite }>('/api/favorites', { destinationId });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (destinationId: string) => {
      await api.delete(`/api/favorites/${destinationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}
