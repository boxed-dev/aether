'use client';

import { useState, useEffect, useCallback } from 'react';
import { BentoCard } from '@aether-link/ui';
import { useUpdateProfile, useCheckHandle } from '@/hooks/useProfile';
import type { Profile } from '@/lib/api';
import toast from 'react-hot-toast';

interface ProfileEditorProps {
  profile: Profile;
}

export function ProfileEditor({ profile }: ProfileEditorProps) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [handle, setHandle] = useState(profile.handle);
  const [bio, setBio] = useState(profile.bio ?? '');
  const [isPublic, setIsPublic] = useState(profile.isPublic);
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);

  const updateProfile = useUpdateProfile();
  const checkHandle = useCheckHandle();

  const checkHandleAvailability = useCallback(async (handleToCheck: string) => {
    try {
      const result = await checkHandle.mutateAsync(handleToCheck);
      setHandleAvailable(result.available);
    } catch {
      setHandleAvailable(null);
    }
  }, [checkHandle]);

  useEffect(() => {
    if (handle !== profile.handle && handle.length >= 3) {
      const timeout = setTimeout(() => {
        checkHandleAvailability(handle);
      }, 500);
      return () => clearTimeout(timeout);
    } else {
      setHandleAvailable(null);
    }
  }, [handle, profile.handle, checkHandleAvailability]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateProfile.mutateAsync({
        id: profile.id,
        data: {
          displayName: displayName.trim(),
          handle: handle !== profile.handle ? handle.trim() : undefined,
          bio: bio.trim() || null,
          isPublic,
        },
      });
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    }
  };

  const profileUrl = `${process.env.NEXT_PUBLIC_RENDERER_URL ?? 'http://localhost:3002'}/${profile.handle}`;

  return (
    <BentoCard className="bg-brand-gray border-brand-border h-full">
      <form onSubmit={handleSubmit} className="space-y-5 h-full flex flex-col">
        <h2 className="text-lg font-semibold text-brand-text">Profile Settings</h2>

        <div className="space-y-4 flex-1">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-brand-text-secondary mb-2">
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-brand-dark border border-brand-border text-brand-text focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/30 focus:outline-none transition-colors text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="handle" className="block text-sm font-medium text-brand-text-secondary mb-2">
              Handle
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted text-sm">@</span>
              <input
                id="handle"
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-brand-dark border border-brand-border text-brand-text focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/30 focus:outline-none transition-colors text-sm"
                required
                minLength={3}
                maxLength={30}
                aria-describedby="handle-status"
              />
            </div>
            {handle !== profile.handle && handleAvailable !== null && (
              <p id="handle-status" className={`text-xs mt-1.5 ${handleAvailable ? 'text-brand-success' : 'text-red-400'}`}>
                {handleAvailable ? 'Available' : 'Already taken'}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-brand-text-secondary mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-brand-dark border border-brand-border text-brand-text focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/30 focus:outline-none resize-none transition-colors text-sm"
              rows={3}
              maxLength={500}
              aria-describedby="bio-count"
            />
            <p id="bio-count" className="text-xs text-brand-muted mt-1 text-right">{bio.length}/500</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-brand-dark border border-brand-border">
          <span className="text-sm text-brand-text">Public Profile</span>
          <button
            type="button"
            role="switch"
            aria-checked={isPublic}
            aria-label="Public profile"
            onClick={() => setIsPublic(!isPublic)}
            className={`relative w-11 h-6 rounded-full transition-colors ${isPublic ? 'bg-brand-accent' : 'bg-brand-border'}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isPublic ? 'translate-x-5' : ''}`}
            />
          </button>
        </div>

        <div className="p-4 rounded-xl bg-brand-accent/10 border border-brand-accent/20">
          <span className="text-xs font-medium text-brand-text-secondary block mb-1">Your profile URL</span>
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-brand-accent hover:text-brand-accent-hover truncate block transition-colors"
          >
            {profileUrl}
          </a>
        </div>

        <button
          type="submit"
          disabled={updateProfile.isPending || (handle !== profile.handle && !handleAvailable)}
          className="w-full px-4 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </BentoCard>
  );
}
