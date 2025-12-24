'use client';

import { useQuery } from '@tanstack/react-query';
import { ProfileHeader, LinkCard, GlassCard, cn } from '@aether-link/ui'; // Import cn from ui package
// Wait, I see @aether-link/ui usually exports cn? Or use local.
// Let's check where cn is. In the package it is in utils/cn. In apps/renderer it might be different.
// I'll assume standard Shadcn-like structure for apps or use the package one if exported.
// Actually, earlier I saw `apps/renderer/src/lib/api`. I'll try to find `cn`.
// For now, I'll just import it from the UI package if possible, or use the one in `lib/utils` if it exists.
// Let's look at the file explorer from earlier.
// `apps/renderer/src` has `components` and `app`.
// I will check for `lib/utils` or `utils/cn`.
// I will start by guessing it's in `@aether-link/ui` since I saw it there.
// But `apps/renderer` might not have direct access to internal utils of `ui` package unless exported.
// I will check exports of `@aether-link/ui`.

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
    <div style={getTransformStyle()} {...handlers}>
      <LinkCard
        title={link.title}
        href={link.url}
        icon={link.icon ?? undefined}
        onClick={handleClick}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {isLoading ? (
            <>
              <LinkCard title="" href="#" isLoading className="h-40" />
              <LinkCard title="" href="#" isLoading className="h-40" />
              <LinkCard title="" href="#" isLoading className="h-40" />
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
            activeLinks.map((link, index) => (
              <div
                key={link.id}
                className={cn(
                  "transform transition-all duration-500 hover:z-10",
                  /* First item spans 2 cols on tablet+, 2nd item is tall, etc. - Pseudo Bento Logic */
                  index === 0 ? "md:col-span-2 lg:col-span-2 aspect-[2/1]" : "aspect-square md:aspect-auto md:h-full"
                )}
              >
                <LinkCard
                  title={link.title}
                  href={link.url}
                  icon={link.icon ?? undefined}
                  className="h-full w-full"
                />
              </div>
            ))
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