import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileHeader } from './ProfileHeader';

describe('ProfileHeader', () => {
  it('renders display name', () => {
    render(<ProfileHeader displayName="John Doe" />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders bio when provided', () => {
    render(<ProfileHeader displayName="John Doe" bio="Hello world" />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('does not render bio when not provided', () => {
    render(<ProfileHeader displayName="John Doe" />);
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
  });

  it('renders avatar image when URL provided', () => {
    render(
      <ProfileHeader displayName="John Doe" avatarUrl="https://example.com/avatar.png" />
    );
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.png');
    expect(img).toHaveAttribute('alt', 'John Doe');
  });

  it('renders initial when no avatar URL', () => {
    render(<ProfileHeader displayName="John Doe" />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    const { container } = render(<ProfileHeader displayName="" isLoading />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});
