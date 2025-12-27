'use client';

import { useQuery } from '@tanstack/react-query';
import { ProfileHeader, LinkCard, GlassCard } from '@aether-link/ui';
import { fetchLinksByProfileId, trackClick, type Profile, type Link } from '@/lib/api';

interface ProfilePageProps {
  profile: Profile;
}

export function ProfilePage({ profile }: ProfilePageProps) {
  const { data: links, isLoading, error } = useQuery({
    queryKey: ['links', profile.id],
    queryFn: () => fetchLinksByProfileId(profile.id),
  });

  const activeLinks = links?.filter((link) => link.isActive) ?? [];

  const handleClick = (linkId: string) => {
    trackClick(linkId);
  };

  return (
    <main className="min-h-screen w-full bg-brand-dark text-brand-text p-6 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-lg animate-fade-in space-y-8">
        <header className="w-full py-8">
          <ProfileHeader
            displayName={profile.displayName}
            bio={profile.bio}
            avatarUrl={profile.avatarUrl}
          />
        </header>

        <div className="space-y-3">
          {isLoading ? (
            <>
              <LinkCard title="" href="#" isLoading />
              <LinkCard title="" href="#" isLoading />
              <LinkCard title="" href="#" isLoading />
            </>
          ) : error ? (
            <GlassCard hasError errorMessage="Failed to load links" />
          ) : activeLinks.length === 0 ? (
            <GlassCard className="text-center py-8 bg-brand-gray border-brand-border">
              <p className="text-brand-muted">No links yet</p>
            </GlassCard>
          ) : (
            activeLinks.map((link) => (
              <LinkCard
                key={link.id}
                title={link.title}
                href={link.url}
                icon={link.icon ?? undefined}
                onClick={() => handleClick(link.id)}
              />
            ))
          )}
        </div>

        <footer className="w-full pt-8 pb-4 flex justify-center">
          <a href="/" className="text-brand-muted text-sm hover:text-brand-accent transition-colors">
            Powered by Aether Link
          </a>
        </footer>
      </div>
    </main>
  );
}
