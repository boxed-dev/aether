'use client';

import { signOut } from 'next-auth/react';
import { ProfileHeader } from '@aether-link/ui';
import { ProfileEditor } from './ProfileEditor';
import { LinkEditor } from './LinkEditor';
import { Stats } from './Stats';
import type { Profile } from '@/lib/api';

interface DashboardProps {
  profile: Profile;
}

export function Dashboard({ profile }: DashboardProps) {
  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="flex items-center justify-between py-10 border-b border-brand-border/30 mb-12">
          <div className="w-48">
            <span className="font-serif font-black text-5xl tracking-tighter text-white italic drop-shadow-sm">Aether</span>
          </div>

          <div className="text-center hidden md:block">
            <div className="px-6 py-2 rounded-full bg-brand-gray border border-brand-border shadow-sm inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
              <p className="text-xs font-sans font-semibold text-brand-muted uppercase tracking-[0.2em]">Dashboard</p>
            </div>
          </div>

          <div className="w-48 flex justify-end">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="px-8 py-3 rounded-full border border-brand-border hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-500 transition-all text-sm font-bold text-white tracking-wide whitespace-nowrap shadow-sm hover:shadow-red-500/20"
            >
              Sign Out
            </button>
          </div>
        </header>

        <div className="flex justify-center py-6">
          <ProfileHeader
            displayName={profile.displayName}
            bio={profile.bio}
            avatarUrl={profile.avatarUrl}
          />
        </div>

        <Stats profileId={profile.id} />

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <ProfileEditor profile={profile} />
          <LinkEditor profileId={profile.id} />
        </div>
      </div>
    </div>
  );
}