'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { api, type UpdateProfileInput } from '@/lib/api';

export function useProfile() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      try {
        return await api.profiles.getByUserId(userId);
      } catch (error) {
        if (error instanceof Error && error.message.includes('404')) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!userId,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProfileInput }) =>
      api.profiles.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useCreateProfile() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { handle: string; displayName: string; bio?: string }) => {
      if (!session?.user?.id) throw new Error('Not authenticated');
      return api.profiles.create({ ...data, userId: session.user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useCheckHandle() {
  return useMutation({
    mutationFn: (handle: string) => api.profiles.checkHandle(handle),
  });
}
