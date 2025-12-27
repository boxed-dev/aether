import { NextRequest } from 'next/server';
import { fail } from '@aether-link/core-logic';
import { getContainer } from '@/container';
import { toResponse } from '@/lib/response';

/**
 * Internal endpoint for authentication purposes only.
 * Returns user with passwordHash for credential verification.
 * Should only be called by trusted internal services.
 */
export async function GET(request: NextRequest) {
  const { authService } = getContainer();
  const email = request.nextUrl.searchParams.get('email');

  if (!email) {
    return toResponse(fail('VALIDATION_ERROR', 'email parameter is required'));
  }

  const result = await authService.getUserByEmailWithPassword(email);
  return toResponse(result);
}
