import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GlassCard } from './GlassCard';

describe('GlassCard', () => {
  it('renders children', () => {
    render(<GlassCard>Test Content</GlassCard>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    const { container } = render(<GlassCard isLoading>Hidden</GlassCard>);
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders error state with default message', () => {
    render(<GlassCard hasError>Hidden</GlassCard>);
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders error state with custom message', () => {
    render(
      <GlassCard hasError errorMessage="Custom error">
        Hidden
      </GlassCard>
    );
    expect(screen.getByText('Custom error')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<GlassCard className="custom-class">Test</GlassCard>);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('applies size variants', () => {
    const { rerender, container } = render(<GlassCard size="sm">Test</GlassCard>);
    expect(container.firstChild).toHaveClass('p-4');

    rerender(<GlassCard size="lg">Test</GlassCard>);
    expect(container.firstChild).toHaveClass('p-8');
  });

  it('applies interactive styles when interactive', () => {
    const { container } = render(<GlassCard interactive>Test</GlassCard>);
    expect(container.firstChild).toHaveClass('cursor-pointer');
  });
});
