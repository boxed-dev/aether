import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export interface BentoCardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  noPadding?: boolean;
}

export const BentoCard = forwardRef<HTMLDivElement, BentoCardProps>(
  ({ className, children, noPadding = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-2xl border border-brand-border bg-brand-gray',
          'transition-colors duration-200',
          noPadding ? '' : 'p-6',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

BentoCard.displayName = 'BentoCard';
