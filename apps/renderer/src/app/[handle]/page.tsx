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
    const title = `${profile.displayName} | Aether Link`;
    const description = profile.bio ?? `Check out ${profile.displayName}'s links`;
    const url = `${process.env.NEXT_PUBLIC_RENDERER_URL ?? 'https://aetherlink.app'}/${handle}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url,
        siteName: 'Aether Link',
        type: 'profile',
        images: profile.avatarUrl
          ? [
              {
                url: profile.avatarUrl,
                width: 400,
                height: 400,
                alt: `${profile.displayName}'s avatar`,
              },
            ]
          : [],
      },
      twitter: {
        card: 'summary',
        title,
        description,
        images: profile.avatarUrl ? [profile.avatarUrl] : [],
      },
      alternates: {
        canonical: url,
      },
    };
  } catch {
    return {
      title: 'Not Found | Aether Link',
      description: 'Profile not found',
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
