import { NextRequest } from 'next/server';
import { fail, isOk } from '@aether-link/core-logic';
import { getContainer } from '@/container';
import { toResponse, parseJsonBody } from '@/lib/response';
import type { CreateProfileInput } from '@/services/ProfileService';

export async function GET(request: NextRequest) {
  const { profileService } = getContainer();
  const userId = request.nextUrl.searchParams.get('userId');

  if (!userId) {
    return toResponse(fail('VALIDATION_ERROR', 'userId parameter is required'));
  }

  const result = await profileService.getProfileByUserId(userId);
  return toResponse(result);
}

export async function POST(request: NextRequest) {
  const { profileService } = getContainer();
  const bodyResult = await parseJsonBody<CreateProfileInput>(request);

  if (!isOk(bodyResult)) {
    return toResponse(bodyResult);
  }

  const result = await profileService.createProfile(bodyResult.data);
  return toResponse(result, 201);
}
