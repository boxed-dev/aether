'use client';

import { useState } from 'react';
import { BentoCard } from '@aether-link/ui';
import { useLinks, useCreateLink, useDeleteLink, useUpdateLink } from '@/hooks/useLinks';
import { SortableLinks } from './SortableLinks';
import toast from 'react-hot-toast';

interface LinkEditorProps {
  profileId: string;
}

export function LinkEditor({ profileId }: LinkEditorProps) {
  const { data: links, isLoading } = useLinks(profileId);
  const createLink = useCreateLink();
  const deleteLink = useDeleteLink();
  const updateLink = useUpdateLink();

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newIcon, setNewIcon] = useState('');

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTitle.trim() || !newUrl.trim()) return;

    try {
      await createLink.mutateAsync({
        profileId,
        title: newTitle.trim(),
        url: newUrl.trim(),
        icon: newIcon.trim() || undefined,
      });
      setNewTitle('');
      setNewUrl('');
      setNewIcon('');
      setIsAdding(false);
      toast.success('Link added');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add link');
    }
  };

  const handleDeleteLink = async (id: string) => {
    try {
      await deleteLink.mutateAsync(id);
      toast.success('Link deleted');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete link');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateLink.mutateAsync({ id, data: { isActive: !isActive } });
      toast.success(isActive ? 'Link disabled' : 'Link enabled');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update link');
    }
  };

  if (isLoading) {
    return (
      <BentoCard className="bg-brand-gray border-brand-border">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-brand-border rounded w-1/3" />
          <div className="h-14 bg-brand-border/50 rounded-xl" />
          <div className="h-14 bg-brand-border/50 rounded-xl" />
        </div>
      </BentoCard>
    );
  }

  return (
    <BentoCard className="min-h-[400px] bg-brand-gray border-brand-border">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brand-text">Your Links</h2>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${isAdding
              ? 'bg-brand-dark text-brand-text-secondary hover:text-brand-text border border-brand-border'
              : 'bg-brand-accent hover:bg-brand-accent-hover text-white'
              }`}
          >
            {isAdding ? 'Cancel' : 'Add Link'}
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleAddLink} className="space-y-3 p-4 rounded-xl bg-brand-dark border border-brand-border">
            <input
              type="text"
              placeholder="Title (e.g. My Website)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-brand-gray border border-brand-border text-brand-text placeholder-brand-muted focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/30 focus:outline-none transition-colors text-sm"
              required
            />
            <input
              type="url"
              placeholder="URL (https://...)"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-brand-gray border border-brand-border text-brand-text placeholder-brand-muted focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/30 focus:outline-none transition-colors text-sm"
              required
            />
            <input
              type="text"
              placeholder="Icon (emoji, optional)"
              value={newIcon}
              onChange={(e) => setNewIcon(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-brand-gray border border-brand-border text-brand-text placeholder-brand-muted focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/30 focus:outline-none transition-colors text-sm"
              maxLength={2}
            />
            <button
              type="submit"
              disabled={createLink.isPending}
              className="w-full px-4 py-2.5 rounded-lg bg-brand-accent hover:bg-brand-accent-hover text-white font-medium text-sm transition-colors disabled:opacity-50"
            >
              {createLink.isPending ? 'Adding...' : 'Add Link'}
            </button>
          </form>
        )}

        {links && links.length > 0 ? (
          <SortableLinks
            profileId={profileId}
            links={links}
            onDelete={handleDeleteLink}
            onToggleActive={handleToggleActive}
          />
        ) : !isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-12 rounded-xl border-2 border-dashed border-brand-border hover:border-brand-accent/50 transition-colors flex flex-col items-center gap-3"
          >
            <div className="h-12 w-12 rounded-full bg-brand-dark border border-brand-border flex items-center justify-center">
              <svg className="w-6 h-6 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-brand-muted text-sm">Add your first link</span>
          </button>
        ) : null}
      </div>
    </BentoCard>
  );
}
