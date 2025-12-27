import { NextRequest } from 'next/server';
import { fail, isOk } from '@aether-link/core-logic';
import { getContainer } from '@/container';
import { toResponse, parseJsonBody } from '@/lib/response';
import { requireAuth, verifyProfileOwnership } from '@/lib/auth';
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

  // Require authentication
  const authResult = await requireAuth(request);
  if (!isOk(authResult)) {
    return toResponse(authResult);
  }

  const userId = authResult.data;

  // Verify ownership
  const profileResult = await profileService.getProfileById(id);
  if (!isOk(profileResult)) {
    return toResponse(profileResult);
  }

  const ownershipResult = verifyProfileOwnership(userId, profileResult.data);
  if (!isOk(ownershipResult)) {
    return toResponse(ownershipResult);
  }

  // Parse and update
  const bodyResult = await parseJsonBody<UpdateProfileInput>(request);
  if (!isOk(bodyResult)) {
    return toResponse(bodyResult);
  }

  const result = await profileService.updateProfile(id, bodyResult.data);
  return toResponse(result);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const { profileService } = getContainer();

  // Require authentication
  const authResult = await requireAuth(request);
  if (!isOk(authResult)) {
    return toResponse(authResult);
  }

  const userId = authResult.data;

  // Verify ownership
  const profileResult = await profileService.getProfileById(id);
  if (!isOk(profileResult)) {
    return toResponse(profileResult);
  }

  const ownershipResult = verifyProfileOwnership(userId, profileResult.data);
  if (!isOk(ownershipResult)) {
    return toResponse(ownershipResult);
  }

  // Delete
  const result = await profileService.deleteProfile(id);
  return toResponse(result);
}
