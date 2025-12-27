'use client';

import { useMemo } from 'react';
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
        <div className="animate-pulse space-y-5">
          <div className="h-5 bg-brand-border rounded w-32" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-20 bg-brand-border/50 rounded-xl" />
            <div className="h-20 bg-brand-border/50 rounded-xl" />
            <div className="h-20 bg-brand-border/50 rounded-xl" />
          </div>
        </div>
      </BentoCard>
    );
  }

  const totalClicks = links.reduce((sum, link) => sum + link.clickCount, 0);
  const activeLinks = links.filter((link) => link.isActive).length;

  const topPerformingLinks = useMemo(() => {
    return [...links]
      .sort((a, b) => b.clickCount - a.clickCount)
      .slice(0, 3);
  }, [links]);

  return (
    <BentoCard className="bg-brand-gray border-brand-border">
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-brand-text">Analytics</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col items-center justify-center p-5 rounded-xl bg-brand-dark border border-brand-border">
            <p className="text-3xl font-semibold text-brand-accent">{totalClicks}</p>
            <p className="text-xs text-brand-muted mt-1">Total Clicks</p>
          </div>
          <div className="flex flex-col items-center justify-center p-5 rounded-xl bg-brand-dark border border-brand-border">
            <p className="text-3xl font-semibold text-brand-text">{activeLinks}</p>
            <p className="text-xs text-brand-muted mt-1">Active Links</p>
          </div>
          <div className="flex flex-col items-center justify-center p-5 rounded-xl bg-brand-dark border border-brand-border">
            <p className="text-3xl font-semibold text-brand-text">{links.length}</p>
            <p className="text-xs text-brand-muted mt-1">Total Links</p>
          </div>
        </div>

        {topPerformingLinks.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-brand-text-secondary">Top Performing</h3>
            <div className="space-y-2">
              {topPerformingLinks.map((link) => {
                const maxClicks = Math.max(...links.map((l) => l.clickCount));
                const percentage = maxClicks > 0 ? (link.clickCount / maxClicks) * 100 : 0;
                return (
                  <div key={link.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="truncate max-w-[200px] text-brand-text flex items-center gap-2">
                        {link.icon && <span>{link.icon}</span>}
                        {link.title}
                      </span>
                      <span className="text-brand-muted text-xs">{link.clickCount}</span>
                    </div>
                    <div className="h-1.5 bg-brand-dark rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand-accent transition-all duration-500"
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
