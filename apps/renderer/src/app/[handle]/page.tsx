import { notFound } from 'next/navigation';
import { fetchProfileByHandle } from '@/lib/api';
import { ProfilePage } from '@/components/ProfilePage';

interface PageProps {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { handle } = await params;

  try {
    const profile = await fetchProfileByHandle(handle);
    return {
      title: `${profile.displayName} | Aether Link`,
      description: profile.bio ?? `Check out ${profile.displayName}'s links`,
    };
  } catch {
    return {
      title: 'Not Found | Aether Link',
    };
  }
}

export default async function HandlePage({ params }: PageProps) {
  const { handle } = await params;

  try {
    const profile = await fetchProfileByHandle(handle);

    if (!profile.isPublic) {
      notFound();
    }

    return <ProfilePage profile={profile} />;
  } catch {
    notFound();
  }
}
