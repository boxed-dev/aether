import { NextRequest } from 'next/server';
import { fail, isOk } from '@aether-link/core-logic';
import { getContainer } from '@/container';
import { toResponse } from '@/lib/response';

type Params = { params: Promise<{ handle: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { handle } = await params;
  const { profileService } = getContainer();

  const result = await profileService.getProfileByHandle(handle);

  if (isOk(result) && !result.data) {
    return toResponse(fail('NOT_FOUND', 'Profile not found'));
  }

  return toResponse(result);
}
