'use client';

import { useQuery } from '@tanstack/react-query';
import { ProfileHeader, LinkCard, GlassCard, cn } from '@aether-link/ui';
import { usePerformanceTier, usePhysicsTilt } from '@aether-link/three-utils';
import { fetchLinksByProfileId, trackClick, type Profile, type Link } from '@/lib/api';

interface ProfilePageProps {
  profile: Profile;
}

function TiltableLinkCard({ link }: { link: Link }) {
  const { tier } = usePerformanceTier();
  const { handlers, getTransformStyle } = usePhysicsTilt({
    maxTilt: 10,
    scale: 1.02,
    disabled: tier === 'TIER_0',
  });

  const handleClick = () => {
    trackClick(link.id);
  };

  return (
    <div style={getTransformStyle()} {...handlers} className="h-full">
      <LinkCard
        title={link.title}
        href={link.url}
        icon={link.icon ?? undefined}
        onClick={handleClick}
        className="h-full"
      />
    </div>
  );
}

export function ProfilePage({ profile }: ProfilePageProps) {
  const { data: links, isLoading, error } = useQuery({
    queryKey: ['links', profile.id],
    queryFn: () => fetchLinksByProfileId(profile.id),
  });

  const activeLinks = links?.filter((link) => link.isActive) ?? [];

  return (
    <main className="min-h-screen w-full bg-brand-dark text-brand-text p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl animate-fade-in space-y-8">

        {/* Profile Section - Spans Full Width */}
        <header className="w-full py-12">
          <ProfileHeader
            displayName={profile.displayName}
            bio={profile.bio}
            avatarUrl={profile.avatarUrl}
          />
        </header>

        {/* Links Grid - Bento Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 auto-rows-[160px]">
          {isLoading ? (
            <>
              <div className="md:col-span-2 lg:col-span-3 md:row-span-2">
                <LinkCard title="" href="#" isLoading className="h-full" />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <LinkCard title="" href="#" isLoading className="h-full" />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <LinkCard title="" href="#" isLoading className="h-full" />
              </div>
            </>
          ) : error ? (
            <div className="col-span-full">
              <GlassCard hasError errorMessage="Failed to load links" />
            </div>
          ) : activeLinks.length === 0 ? (
            <div className="col-span-full">
              <GlassCard className="text-center py-12 bg-brand-gray border-dashed border-brand-border">
                <p className="text-brand-muted">No links yet</p>
              </GlassCard>
            </div>
          ) : (
            activeLinks.map((link, index) => {
              const getBentoClass = (idx: number) => {
                const patterns = [
                  'md:col-span-2 lg:col-span-3 md:row-span-2',
                  'md:col-span-2 lg:col-span-3',
                  'md:col-span-2 lg:col-span-2',
                  'md:col-span-2 lg:col-span-4 md:row-span-2',
                  'md:col-span-2 lg:col-span-2',
                  'md:col-span-2 lg:col-span-3',
                ];
                return patterns[idx % patterns.length];
              };

              return (
                <div
                  key={link.id}
                  className={cn(
                    'transform transition-all duration-300 hover:scale-[1.02] hover:z-10',
                    getBentoClass(index)
                  )}
                >
                  <TiltableLinkCard link={link} />
                </div>
              );
            })
          )}
        </div>

        <footer className="w-full pt-16 pb-8 flex justify-between items-end border-t border-brand-border/30 mt-12">
          <div className="text-sm text-brand-muted/50 font-mono uppercase tracking-widest">
            © 2024
          </div>
          <a href="/" className="group flex items-center gap-2">
            <span className="text-brand-muted text-sm font-medium group-hover:text-brand-green transition-colors">Powered by</span>
            <span className="font-serif font-bold tracking-tight text-white text-lg group-hover:text-brand-green transition-colors">Aether Link</span>
          </a>
        </footer>
      </div>
    </main>
  );
}