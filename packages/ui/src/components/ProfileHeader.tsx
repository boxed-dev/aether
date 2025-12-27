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
        <div className="h-24 w-24 rounded-full bg-brand-border" />
        <div className="h-6 w-32 rounded-full bg-brand-border" />
        <div className="h-4 w-48 rounded-full bg-brand-border" />
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center gap-6 text-center', className)} {...props}>
      <div className="relative">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="h-24 w-24 rounded-full border-2 border-brand-border object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-brand-border bg-brand-accent text-3xl font-semibold text-white">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="space-y-2 max-w-md">
        <h1 className="text-2xl font-semibold text-brand-text">{displayName}</h1>
        {bio && <p className="text-brand-text-secondary leading-relaxed">{bio}</p>}
      </div>
    </div>
  );
}
