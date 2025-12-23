'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { api, type UpdateProfileInput } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export function useProfile() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      try {
        const response = await fetch(
          `${API_BASE}/api/profiles?userId=${userId}`
        );
        if (response.status === 404) return null;
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        return data || null;
      } catch {
        return null;
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
