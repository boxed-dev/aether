'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type CreateLinkInput, type UpdateLinkInput, type Link } from '@/lib/api';

export function useLinks(profileId: string | undefined) {
  return useQuery({
    queryKey: ['links', profileId],
    queryFn: () => api.links.getByProfileId(profileId!),
    enabled: !!profileId,
  });
}

export function useCreateLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLinkInput) => api.links.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['links', variables.profileId] });
    },
  });
}

export function useUpdateLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLinkInput }) =>
      api.links.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
    },
  });
}

export function useDeleteLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.links.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
    },
  });
}

export function useReorderLinks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ profileId, linkIds }: { profileId: string; linkIds: string[] }) =>
      api.links.reorder(profileId, linkIds),
    onMutate: async ({ profileId, linkIds }) => {
      await queryClient.cancelQueries({ queryKey: ['links', profileId] });

      const previousLinks = queryClient.getQueryData<Link[]>(['links', profileId]);

      if (previousLinks) {
        const reorderedLinks = linkIds.map((id, index) => {
          const link = previousLinks.find((l) => l.id === id);
          return link ? { ...link, position: index } : null;
        }).filter(Boolean) as Link[];

        queryClient.setQueryData(['links', profileId], reorderedLinks);
      }

      return { previousLinks };
    },
    onError: (_, { profileId }, context) => {
      if (context?.previousLinks) {
        queryClient.setQueryData(['links', profileId], context.previousLinks);
      }
    },
    onSettled: (_, __, { profileId }) => {
      queryClient.invalidateQueries({ queryKey: ['links', profileId] });
    },
  });
}
