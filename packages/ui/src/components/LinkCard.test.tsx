import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LinkCard } from './LinkCard';

describe('LinkCard', () => {
  it('renders title', () => {
    render(<LinkCard title="GitHub" href="https://github.com" />);
    expect(screen.getByText('GitHub')).toBeInTheDocument();
  });

  it('renders link with correct href', () => {
    render(<LinkCard title="GitHub" href="https://github.com" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://github.com');
  });

  it('opens link in new tab', () => {
    render(<LinkCard title="GitHub" href="https://github.com" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders icon when provided', () => {
    render(<LinkCard title="GitHub" href="https://github.com" icon="🐙" />);
    expect(screen.getByText('🐙')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    const { container } = render(<LinkCard title="GitHub" href="https://github.com" isLoading />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});
