import { NextRequest } from 'next/server';
import { fail } from '@aether-link/core-logic';
import { getContainer } from '@/container';
import { toResponse } from '@/lib/response';

export async function GET(request: NextRequest) {
  const { authService } = getContainer();
  const email = request.nextUrl.searchParams.get('email');

  if (!email) {
    return toResponse(fail('VALIDATION_ERROR', 'email parameter is required'));
  }

  const result = await authService.getUserByEmail(email);
  return toResponse(result);
}
