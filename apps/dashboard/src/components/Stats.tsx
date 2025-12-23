'use client';

import { BentoCard } from '@aether-link/ui';
import { useLinks } from '@/hooks/useLinks';

interface StatsProps {
  profileId: string;
}

export function Stats({ profileId }: StatsProps) {
  const { data: links, isLoading } = useLinks(profileId);

  if (isLoading || !links) {
    return (
      <BentoCard className="bg-brand-gray border-brand-border">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-brand-border/50 rounded-full w-32" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-brand-border/30 rounded-2xl" />
            <div className="h-24 bg-brand-border/30 rounded-2xl" />
            <div className="h-24 bg-brand-border/30 rounded-2xl" />
          </div>
        </div>
      </BentoCard>
    );
  }

  const totalClicks = links.reduce((sum, link) => sum + link.clickCount, 0);
  const activeLinks = links.filter((link) => link.isActive).length;
  const topLink = links.length > 0
    ? links.reduce((top, link) => link.clickCount > top.clickCount ? link : top, links[0])
    : null;

  return (
    <BentoCard className="overflow-hidden bg-brand-gray border-brand-border">
      <div className="space-y-8">
        <h2 className="text-xl font-bold text-white tracking-tight font-serif italic">Analytics Overview</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-brand-dark border border-brand-border/50">
            <p className="text-4xl font-extrabold text-brand-green tracking-tight font-serif italic">{totalClicks}</p>
            <p className="text-xs font-mono font-medium text-brand-muted uppercase tracking-widest mt-2">Total Clicks</p>
          </div>
          <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-brand-dark border border-brand-border/50">
            <p className="text-4xl font-extrabold text-white tracking-tight font-serif italic">{activeLinks}</p>
            <p className="text-xs font-mono font-medium text-brand-muted uppercase tracking-widest mt-2">Active Links</p>
          </div>
          <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-brand-dark border border-brand-border/50">
            <p className="text-4xl font-extrabold text-brand-purple tracking-tight font-serif italic">{links.length}</p>
            <p className="text-xs font-mono font-medium text-brand-muted uppercase tracking-widest mt-2">Total Links</p>
          </div>
        </div>

        {links.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold text-brand-muted/70 uppercase tracking-widest">Top Performing Links</h3>
            <div className="space-y-3">
              {links
                .sort((a, b) => b.clickCount - a.clickCount)
                .slice(0, 3)
                .map((link) => {
                  const maxClicks = Math.max(...links.map((l) => l.clickCount));
                  const percentage = maxClicks > 0 ? (link.clickCount / maxClicks) * 100 : 0;
                  return (
                    <div key={link.id} className="group">
                      <div className="flex justify-between text-sm font-medium mb-1">
                        <span className="truncate max-w-[200px] text-brand-text flex items-center gap-2 font-sans">
                          {link.icon && <span className="opacity-70 grayscale">{link.icon}</span>}
                          {link.title}
                        </span>
                        <span className="text-brand-muted font-mono text-xs">{link.clickCount}</span>
                      </div>
                      <div className="h-1.5 bg-brand-dark rounded-full overflow-hidden border border-brand-border/30">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ease-out bg-brand-green shadow-[0_0_10px_-2px_theme(colors.brand.green)]`}
                          style={{ width: `${Math.max(percentage, 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </BentoCard>
  );
}