'use client';

import { useState, useEffect } from 'react';
import { BentoCard } from '@aether-link/ui';
import { useCreateProfile, useCheckHandle } from '@/hooks/useProfile';
import toast from 'react-hot-toast';

export function Onboarding() {
  const [handle, setHandle] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);

  const createProfile = useCreateProfile();
  const checkHandle = useCheckHandle();

  useEffect(() => {
    if (handle.length >= 3) {
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
  }, [handle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!handleAvailable) {
      toast.error('Please choose an available handle');
      return;
    }

    try {
      await createProfile.mutateAsync({
        handle: handle.trim(),
        displayName: displayName.trim(),
        bio: bio.trim() || undefined,
      });
      toast.success('Profile created!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create profile');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-brand-dark">
      <BentoCard className="max-w-md w-full shadow-2xl bg-brand-gray border-brand-border">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-serif font-bold text-white tracking-tight italic">Welcome</h1>
            <p className="text-brand-muted text-lg font-light">Let's claim your unique handle</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-brand-muted mb-2 uppercase tracking-wider">Choose your handle</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted font-mono">@</span>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  className="w-full pl-9 pr-4 py-4 rounded-2xl bg-brand-dark border border-brand-border text-white placeholder-brand-muted/30 focus:border-brand-green focus:ring-1 focus:ring-brand-green/50 focus:outline-none transition-all text-lg font-sans"
                  placeholder="yourname"
                  required
                  minLength={3}
                  maxLength={30}
                />
              </div>
              {handle.length >= 3 && handleAvailable !== null && (
                <p className={`text-sm mt-3 font-medium flex items-center gap-2 ${handleAvailable ? 'text-brand-green' : 'text-red-500'}`}>
                  {handleAvailable ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Available
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      Taken
                    </>
                  )}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-muted mb-2 uppercase tracking-wider">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-4 rounded-2xl bg-brand-dark border border-brand-border text-white placeholder-brand-muted/30 focus:border-brand-green focus:ring-1 focus:ring-brand-green/50 focus:outline-none transition-all text-lg font-serif"
                placeholder="Your Name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-muted mb-2 uppercase tracking-wider">Bio (optional)</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-4 rounded-2xl bg-brand-dark border border-brand-border text-white placeholder-brand-muted/30 focus:border-brand-green focus:ring-1 focus:ring-brand-green/50 focus:outline-none resize-none transition-all font-light"
                placeholder="Tell the world about yourself..."
                rows={3}
                maxLength={500}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={createProfile.isPending || !handleAvailable || !displayName.trim()}
            className="w-full px-6 py-4 rounded-full bg-brand-green text-brand-dark text-lg font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_-5px_theme(colors.brand.green)] disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none"
          >
            {createProfile.isPending ? 'Creating...' : 'Create Profile'}
          </button>
        </form>
      </BentoCard>
    </div>
  );
}