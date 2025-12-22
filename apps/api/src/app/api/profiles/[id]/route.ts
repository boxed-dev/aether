import { NextRequest } from 'next/server';
import { fail, isOk } from '@aether-link/core-logic';
import { getContainer } from '@/container';
import { toResponse, parseJsonBody } from '@/lib/response';
import type { UpdateProfileInput } from '@/services/ProfileService';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const { profileService } = getContainer();

  const result = await profileService.getProfileById(id);

  if (isOk(result) && !result.data) {
    return toResponse(fail('NOT_FOUND', 'Profile not found'));
  }

  return toResponse(result);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const { profileService } = getContainer();
  const bodyResult = await parseJsonBody<UpdateProfileInput>(request);

  if (!isOk(bodyResult)) {
    return toResponse(bodyResult);
  }

  const result = await profileService.updateProfile(id, bodyResult.data);
  return toResponse(result);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const { profileService } = getContainer();

  const result = await profileService.deleteProfile(id);
  return toResponse(result);
}
