import { NextRequest, NextResponse } from 'next/server';
import { fail, isOk } from '@aether-link/core-logic';
import { getContainer } from '@/container';
import { toResponse } from '@/lib/response';

export async function GET(request: NextRequest) {
  const { profileService } = getContainer();
  const handle = request.nextUrl.searchParams.get('handle');

  if (!handle) {
    return toResponse(fail('VALIDATION_ERROR', 'Handle parameter is required'));
  }

  const result = await profileService.checkHandleAvailability(handle);

  if (!isOk(result)) {
    return toResponse(result);
  }

  return NextResponse.json({ available: result.data });
}
