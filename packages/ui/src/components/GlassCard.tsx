import { forwardRef, type ReactNode, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

const glassCardVariants = cva(
  'relative rounded-2xl border transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-brand-gray border-brand-border',
        elevated: 'bg-brand-surface border-brand-border shadow-medium',
        ghost: 'bg-transparent border-transparent hover:bg-brand-gray hover:border-brand-border',
      },
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
      interactive: {
        true: 'cursor-pointer hover:border-brand-accent/50 hover:shadow-glass-hover active:scale-[0.99] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      interactive: false,
    },
  }
);

export interface GlassCardProps
  extends HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof glassCardVariants> {
  children?: ReactNode;
  isLoading?: boolean;
  hasError?: boolean;
  errorMessage?: string;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      className,
      variant,
      size,
      interactive,
      children,
      isLoading = false,
      hasError = false,
      errorMessage,
      ...props
    },
    ref
  ) => {
    if (hasError) {
      return (
        <div
          ref={ref}
          className={cn(
            glassCardVariants({ variant, size, interactive: false }),
            'border-red-500/30 bg-red-500/10',
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-3 text-red-400">
            <svg
              className="h-5 w-5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-medium">{errorMessage ?? 'Something went wrong'}</span>
          </div>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div
          ref={ref}
          className={cn(
            glassCardVariants({ variant, size, interactive: false }),
            'animate-pulse',
            className
          )}
          {...props}
        >
          <div className="space-y-4">
            <div className="h-4 w-3/4 rounded-full bg-brand-border" />
            <div className="h-4 w-1/2 rounded-full bg-brand-border" />
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(glassCardVariants({ variant, size, interactive }), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
