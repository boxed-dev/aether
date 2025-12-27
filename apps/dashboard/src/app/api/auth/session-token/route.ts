import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { encode } from 'next-auth/jwt';

const AUTH_SECRET = process.env.AUTH_SECRET;

/**
 * Returns the JWT token for the current session
 * This endpoint is used by the client-side API client to get the auth token
 */
export async function GET() {
  const session = await auth();

  if (!session?.user?.id || !AUTH_SECRET) {
    return NextResponse.json({ token: null }, { status: 401 });
  }

  try {
    // Encode the token using NextAuth's JWT encoding
    const token = await encode({
      token: { id: session.user.id, email: session.user.email },
      secret: AUTH_SECRET,
      salt: '',
    });

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Failed to encode token:', error);
    return NextResponse.json({ token: null }, { status: 500 });
  }
}
