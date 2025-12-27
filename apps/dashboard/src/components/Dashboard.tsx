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
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="flex items-center justify-between py-6 border-b border-brand-border/50">
          <div>
            <span className="font-semibold text-xl text-brand-text">Aether</span>
          </div>

          <div className="hidden md:block">
            <div className="px-4 py-1.5 rounded-full bg-brand-gray border border-brand-border inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-success" />
              <p className="text-xs font-medium text-brand-text-secondary">Dashboard</p>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="px-4 py-2 rounded-lg border border-brand-border hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm font-medium text-brand-text-secondary"
          >
            Sign Out
          </button>
        </header>

        <div className="flex justify-center py-4">
          <ProfileHeader
            displayName={profile.displayName}
            bio={profile.bio}
            avatarUrl={profile.avatarUrl}
          />
        </div>

        <Stats profileId={profile.id} />

        <div className="grid lg:grid-cols-2 gap-6 items-start">
          <ProfileEditor profile={profile} />
          <LinkEditor profileId={profile.id} />
        </div>
      </div>
    </div>
  );
}
