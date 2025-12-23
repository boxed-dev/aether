'use client';

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (handle !== profile.handle && handle.length >= 3) {
      const timeout = setTimeout(async () => {
        try {
          const result = await checkHandle.mutateAsync(handle);
          setHandleAvailable(result.available);
        } catch {
          setHandleAvailable(null);
        }
      }, 500);
      return () => clearTimeout(timeout);
    } else {
      setHandleAvailable(null);
    }
  }, [handle, profile.handle]);

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

  const profileUrl = `${typeof window !== 'undefined' ? window.location.origin.replace(':3000', ':3002') : ''}/${profile.handle}`;

  return (
    <BentoCard className="bg-brand-gray border-brand-border h-full">
      <form onSubmit={handleSubmit} className="space-y-6 h-full flex flex-col">
        <h2 className="text-xl font-bold text-white tracking-tight font-serif italic">Profile Settings</h2>

        <div className="space-y-4 flex-1">
          <div>
            <label htmlFor="displayName" className="block text-xs font-mono font-medium text-brand-muted mb-2 uppercase tracking-wider">Display Name</label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-brand-dark border border-brand-border text-white focus:border-brand-green focus:ring-1 focus:ring-brand-green/50 focus:outline-none transition-all text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="handle" className="block text-xs font-mono font-medium text-brand-muted mb-2 uppercase tracking-wider">Handle</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted font-mono text-sm" aria-hidden="true">@</span>
              <input
                id="handle"
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                className="w-full pl-8 pr-4 py-3 rounded-2xl bg-brand-dark border border-brand-border text-white focus:border-brand-green focus:ring-1 focus:ring-brand-green/50 focus:outline-none transition-all text-sm"
                required
                minLength={3}
                maxLength={30}
                aria-describedby="handle-status"
              />
            </div>
            {handle !== profile.handle && handleAvailable !== null && (
              <p id="handle-status" className={`text-xs mt-2 font-mono ${handleAvailable ? 'text-brand-green' : 'text-red-500'}`} role="status">
                {handleAvailable ? 'AVAILABLE' : 'TAKEN'}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="bio" className="block text-xs font-mono font-medium text-brand-muted mb-2 uppercase tracking-wider">Bio</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-brand-dark border border-brand-border text-white focus:border-brand-green focus:ring-1 focus:ring-brand-green/50 focus:outline-none resize-none transition-all text-sm font-light"
              rows={3}
              maxLength={500}
              aria-describedby="bio-count"
            />
            <p id="bio-count" className="text-[10px] text-brand-muted/50 mt-1 text-right font-mono">{bio.length}/500</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-dark border border-brand-border">
          <span className="text-sm font-medium text-white">Public Profile</span>
          <button
            type="button"
            role="switch"
            aria-checked={isPublic}
            aria-label="Public profile"
            onClick={() => setIsPublic(!isPublic)}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 border border-transparent ${isPublic ? 'bg-brand-green/20 border-brand-green' : 'bg-brand-border'
              }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full shadow-md transition-transform duration-300 ${isPublic ? 'translate-x-6 bg-brand-green' : 'bg-brand-muted'
                }`}
              aria-hidden="true"
            />
          </button>
        </div>

        <div className="flex flex-col gap-2 p-4 rounded-2xl bg-brand-purple/5 border border-brand-purple/20">
          <span className="text-xs font-mono font-medium text-brand-muted uppercase tracking-widest">Your profile URL</span>
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-brand-purple hover:text-brand-purple/80 hover:underline truncate transition-colors"
          >
            {profileUrl}
          </a>
        </div>

        <button
          type="submit"
          disabled={updateProfile.isPending || (handle !== profile.handle && !handleAvailable)}
          className="w-full px-4 py-3 rounded-full bg-white text-brand-dark font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none"
        >
          {updateProfile.isPending ? 'SAVING...' : 'SAVE CHANGES'}
        </button>
      </form>
    </BentoCard>
  );
}