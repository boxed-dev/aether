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
            'flex items-center gap-4 rounded-[20px] border border-glass-border bg-glass-bg p-4 backdrop-blur-glass animate-pulse',
            className
          )}
        >
          <div className="h-12 w-12 rounded-full bg-gray-200" />
          <div className="h-4 w-32 rounded-full bg-gray-200" />
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
          'group relative flex items-center justify-between overflow-hidden rounded-[24px] bg-brand-gray border border-brand-border p-5',
          'transition-all duration-300 ease-out',
          'hover:border-brand-green hover:-translate-y-1 hover:shadow-[0_4px_20px_-8px_rgba(0,223,93,0.3)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark',
          'active:scale-[0.98]',
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-4">
          {icon ? (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-dark border border-brand-border text-brand-green text-xl transition-transform duration-300 group-hover:scale-110">
              {icon}
            </div>
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-dark border border-brand-border text-brand-green transition-transform duration-300 group-hover:scale-110">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            </div>
          )}

          <div className="flex flex-col gap-0.5">
            <span className="font-sans text-lg font-semibold text-brand-text group-hover:text-brand-green transition-colors">{title}</span>
            <span className="font-sans text-xs text-brand-muted font-medium uppercase tracking-wider">
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

        {/* Arrow Icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-border bg-brand-dark/20 text-brand-muted transition-all duration-300 group-hover:border-brand-green group-hover:bg-brand-green group-hover:text-brand-dark">
          <svg
            className="h-5 w-5 -rotate-45 transform transition-transform duration-300 group-hover:rotate-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      </a>
    );
  }
);

LinkCard.displayName = 'LinkCard';