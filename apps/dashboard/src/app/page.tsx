'use client';

import { useProfile } from '@/hooks/useProfile';
import { Dashboard } from '@/components/Dashboard';
import { Onboarding } from '@/components/Onboarding';
import { BentoCard } from '@aether-link/ui';

export default function DashboardPage() {
  const { data: profile, isLoading, error } = useProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-dark">
        <BentoCard className="animate-pulse p-8 bg-brand-gray border-brand-border">
          <div className="w-48 h-6 bg-brand-border/50 rounded-full" />
        </BentoCard>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-brand-dark">
        <BentoCard className="p-8 border-red-500/20 bg-red-500/5">
          <p className="text-red-400">Failed to load profile</p>
        </BentoCard>
      </div>
    );
  }

  if (!profile) {
    return <Onboarding />;
  }

  return <Dashboard profile={profile} />;
}