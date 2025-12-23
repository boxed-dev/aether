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
          <div className="h-4 bg-brand-border/50 rounded w-1/3" />
          <div className="h-16 bg-brand-border/30 rounded-2xl" />
          <div className="h-16 bg-brand-border/30 rounded-2xl" />
        </div>
      </BentoCard>
    );
  }

  return (
    <BentoCard className="min-h-[400px] bg-brand-gray border-brand-border">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight font-serif italic">Your Links</h2>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className={`px-5 py-2.5 rounded-full transition-all text-xs font-mono font-bold uppercase tracking-widest ${isAdding
              ? 'bg-brand-dark text-brand-muted hover:text-white border border-brand-border'
              : 'bg-brand-green text-brand-dark hover:scale-105 shadow-[0_0_15px_-5px_theme(colors.brand.green)]'
              }`}
          >
            {isAdding ? 'CANCEL' : '+ ADD LINK'}
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleAddLink} className="space-y-4 p-6 rounded-2xl bg-brand-dark border border-brand-border/50" aria-label="Add new link">
            <div className="space-y-4">
              <div>
                <label htmlFor="link-title" className="sr-only">Link title</label>
                <input
                  id="link-title"
                  type="text"
                  placeholder="Title (e.g. My Website)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-brand-gray/50 border border-brand-border text-white placeholder-brand-muted/30 focus:border-brand-green focus:ring-1 focus:ring-brand-green/50 focus:outline-none transition-all text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="link-url" className="sr-only">Link URL</label>
                <input
                  id="link-url"
                  type="url"
                  placeholder="URL (https://...)"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-brand-gray/50 border border-brand-border text-white placeholder-brand-muted/30 focus:border-brand-green focus:ring-1 focus:ring-brand-green/50 focus:outline-none transition-all text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="link-icon" className="sr-only">Link Icon (Emoji)</label>
                <input
                  id="link-icon"
                  type="text"
                  placeholder="Icon (emoji, optional)"
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-brand-gray/50 border border-brand-border text-white placeholder-brand-muted/30 focus:border-brand-green focus:ring-1 focus:ring-brand-green/50 focus:outline-none transition-all text-sm"
                  maxLength={2}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={createLink.isPending}
              className="w-full px-4 py-3 rounded-xl bg-brand-green text-brand-dark font-bold text-sm tracking-wide hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {createLink.isPending ? 'ADDING...' : 'ADD LINK'}
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
            className="w-full py-16 rounded-3xl border-2 border-dashed border-brand-border/40 hover:border-brand-green/50 hover:bg-brand-green/5 transition-all flex flex-col items-center gap-4 group"
          >
            <div className="h-16 w-16 rounded-full bg-brand-dark border border-brand-border flex items-center justify-center group-hover:scale-110 transition-transform group-hover:border-brand-green">
              <svg className="w-8 h-8 text-brand-muted group-hover:text-brand-green transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-brand-muted font-mono text-sm group-hover:text-brand-green transition-colors">Click to add your first link</span>
          </button>
        ) : null}
      </div>
    </BentoCard>
  );
}