'use client';

import { Component, type ReactNode } from 'react';
import { BentoCard } from '@aether-link/ui';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen w-full bg-brand-dark flex items-center justify-center p-4">
          <BentoCard className="bg-brand-gray border-brand-border max-w-md w-full">
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white tracking-tight font-serif italic">
                  Something went wrong
                </h2>
                <p className="text-sm text-brand-muted">
                  We encountered an unexpected error. Please try refreshing the page.
                </p>
              </div>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="p-4 rounded-lg bg-brand-dark border border-brand-border text-left">
                  <p className="text-xs font-mono text-red-400 break-words">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="w-full px-4 py-3 rounded-full bg-white text-brand-dark font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                RELOAD PAGE
              </button>
            </div>
          </BentoCard>
        </div>
      );
    }

    return this.props.children;
  }
}
