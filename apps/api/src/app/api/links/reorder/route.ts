import { NextRequest } from 'next/server';
import { isOk } from '@aether-link/core-logic';
import { getContainer } from '@/container';
import { toResponse, parseJsonBody } from '@/lib/response';
import { requireAuth, verifyProfileOwnership } from '@/lib/auth';
import type { ReorderLinksInput } from '@/services/LinkService';

export async function POST(request: NextRequest) {
  const { linkService, profileService } = getContainer();

  // Require authentication
  const authResult = await requireAuth(request);
  if (!isOk(authResult)) {
    return toResponse(authResult);
  }

  const userId = authResult.data;

  // Parse request body
  const bodyResult = await parseJsonBody<ReorderLinksInput>(request);
  if (!isOk(bodyResult)) {
    return toResponse(bodyResult);
  }

  // Verify user owns the profile
  const profileResult = await profileService.getProfileById(bodyResult.data.profileId);
  if (!isOk(profileResult)) {
    return toResponse(profileResult);
  }

  const ownershipResult = verifyProfileOwnership(userId, profileResult.data);
  if (!isOk(ownershipResult)) {
    return toResponse(ownershipResult);
  }

  // Reorder links
  const result = await linkService.reorderLinks(bodyResult.data);
  return toResponse(result);
}
