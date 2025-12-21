import { type HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export interface ProfileHeaderProps extends HTMLAttributes<HTMLDivElement> {
  displayName: string;
  bio?: string | null;
  avatarUrl?: string | null;
  isLoading?: boolean;
}

export function ProfileHeader({
  className,
  displayName,
  bio,
  avatarUrl,
  isLoading = false,
  ...props
}: ProfileHeaderProps) {
  if (isLoading) {
    return (
      <div className={cn('flex flex-col items-center gap-4 animate-pulse', className)} {...props}>
        <div className="h-28 w-28 rounded-full bg-gray-200" />
        <div className="h-8 w-40 rounded-full bg-gray-200" />
        <div className="h-4 w-64 rounded-full bg-gray-200" />
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center gap-8 text-center', className)} {...props}>
      <div className="relative group">
        <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-brand-green/50 to-brand-green/20 blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="relative h-32 w-32 rounded-full border-4 border-brand-dark object-cover"
          />
        ) : (
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-brand-dark bg-brand-green text-5xl font-serif text-brand-dark">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        {/* Decorative asterisk */}
        <div className="absolute -bottom-2 -right-2 text-brand-green text-4xl animate-spin-slow">
          ❋
        </div>
      </div>

      <div className="space-y-4 max-w-lg">
        <h1 className="text-5xl font-serif text-brand-text tracking-tight italic">{displayName}</h1>
        {bio && <p className="text-lg text-brand-muted font-sans font-light leading-relaxed">{bio}</p>}
      </div>
    </div>
  );
}