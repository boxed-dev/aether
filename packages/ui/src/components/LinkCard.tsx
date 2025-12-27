import { forwardRef, type AnchorHTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export interface LinkCardProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  title: string;
  icon?: string;
  isLoading?: boolean;
}

export const LinkCard = forwardRef<HTMLAnchorElement, LinkCardProps>(
  ({ className, title, icon, href, isLoading = false, ...props }, ref) => {
    if (isLoading) {
      return (
        <div
          className={cn(
            'flex items-center gap-4 rounded-xl border border-brand-border bg-brand-gray p-4 animate-pulse',
            className
          )}
        >
          <div className="h-10 w-10 rounded-full bg-brand-border" />
          <div className="h-4 w-32 rounded-full bg-brand-border" />
        </div>
      );
    }

    return (
      <a
        ref={ref}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'group flex items-center justify-between rounded-xl bg-brand-gray border border-brand-border p-4',
          'transition-all duration-200',
          'hover:border-brand-accent/50 hover:bg-brand-surface',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark',
          'active:scale-[0.99]',
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-3">
          {icon ? (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-dark border border-brand-border text-lg">
              {icon}
            </div>
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-dark border border-brand-border text-brand-accent">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
          )}

          <div className="flex flex-col">
            <span className="font-medium text-brand-text group-hover:text-brand-accent-hover transition-colors">{title}</span>
            <span className="text-xs text-brand-muted">
              {href ? (() => {
                try {
                  return new URL(href, 'http://example.com').hostname.replace('www.', '');
                } catch {
                  return href.replace(/^https?:\/\//, '').replace('www.', '').split('/')[0];
                }
              })() : ''}
            </span>
          </div>
        </div>

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-brand-muted group-hover:text-brand-accent transition-colors">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </a>
    );
  }
);

LinkCard.displayName = 'LinkCard';
