import { NextRequest } from 'next/server';
import { fail, isOk } from '@aether-link/core-logic';
import { getContainer } from '@/container';
import { toResponse, parseJsonBody } from '@/lib/response';
import { requireAuth, verifyProfileOwnership } from '@/lib/auth';
import type { CreateLinkInput } from '@/services/LinkService';

export async function GET(request: NextRequest) {
  const { linkService } = getContainer();
  const profileId = request.nextUrl.searchParams.get('profileId');

  if (!profileId) {
    return toResponse(fail('VALIDATION_ERROR', 'profileId parameter is required'));
  }

  const result = await linkService.getLinksByProfileId(profileId);
  return toResponse(result);
}

export async function POST(request: NextRequest) {
  const { linkService, profileService } = getContainer();

  // Require authentication
  const authResult = await requireAuth(request);
  if (!isOk(authResult)) {
    return toResponse(authResult);
  }

  const userId = authResult.data;

  // Parse request body
  const bodyResult = await parseJsonBody<CreateLinkInput>(request);
  if (!isOk(bodyResult)) {
    return toResponse(bodyResult);
  }

  // Verify user owns the profile they're adding a link to
  const profileResult = await profileService.getProfileById(bodyResult.data.profileId);
  if (!isOk(profileResult)) {
    return toResponse(profileResult);
  }

  const ownershipResult = verifyProfileOwnership(userId, profileResult.data);
  if (!isOk(ownershipResult)) {
    return toResponse(ownershipResult);
  }

  // Create link
  const result = await linkService.createLink(bodyResult.data);
  return toResponse(result, 201);
}
