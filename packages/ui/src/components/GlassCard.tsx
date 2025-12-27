import { forwardRef, type ReactNode, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

const glassCardVariants = cva(
  'relative rounded-[24px] border border-glass-border transition-all duration-300 isolate overflow-hidden',
  {
    variants: {
      variant: {
        default: 'bg-glass-bg border-glass-border backdrop-blur-glass shadow-glass-card hover:bg-glass-bg/20',
        elevated: 'bg-glass-bg/10 backdrop-blur-xl shadow-glass-hover border-glass-highlight',
        solid: 'bg-white shadow-sm border-gray-100',
        ghost: 'bg-transparent border-transparent hover:bg-glass-bg hover:shadow-glass-card',
      },
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
      interactive: {
        true: 'cursor-pointer hover:-translate-y-1 hover:shadow-glass-hover active:scale-[0.99] active:translate-y-0 hover:border-glass-highlight transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glass-highlight focus-visible:ring-offset-2',
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
            'border-red-200 bg-red-50/80',
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-3 text-red-600">
            <svg
              className="h-5 w-5 flex-shrink-0"
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
            <div className="h-4 w-3/4 rounded-full bg-gray-200" />
            <div className="h-4 w-1/2 rounded-full bg-gray-200" />
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