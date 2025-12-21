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
                    'relative overflow-hidden rounded-[32px] border border-brand-border bg-brand-gray/50',
                    'transition-all duration-300 hover:border-brand-green/30',
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
