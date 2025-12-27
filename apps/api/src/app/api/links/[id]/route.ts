import { NextRequest } from 'next/server';
import { fail, isOk } from '@aether-link/core-logic';
import { getContainer } from '@/container';
import { toResponse, parseJsonBody } from '@/lib/response';
import { requireAuth, verifyLinkOwnership } from '@/lib/auth';
import type { UpdateLinkInput } from '@/services/LinkService';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const { linkService } = getContainer();

  const result = await linkService.getLinkById(id);

  if (isOk(result) && !result.data) {
    return toResponse(fail('NOT_FOUND', 'Link not found'));
  }

  return toResponse(result);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const { linkService, profileService } = getContainer();

  // Require authentication
  const authResult = await requireAuth(request);
  if (!isOk(authResult)) {
    return toResponse(authResult);
  }

  const userId = authResult.data;

  // Get link and verify ownership
  const linkResult = await linkService.getLinkById(id);
  if (!isOk(linkResult)) {
    return toResponse(linkResult);
  }

  const link = linkResult.data;
  if (!link) {
    return toResponse(fail('NOT_FOUND', 'Link not found'));
  }

  const profileResult = await profileService.getProfileById(link.profileId);
  if (!isOk(profileResult)) {
    return toResponse(profileResult);
  }

  const ownershipResult = verifyLinkOwnership(userId, link, profileResult.data);
  if (!isOk(ownershipResult)) {
    return toResponse(ownershipResult);
  }

  // Parse and update
  const bodyResult = await parseJsonBody<UpdateLinkInput>(request);
  if (!isOk(bodyResult)) {
    return toResponse(bodyResult);
  }

  const result = await linkService.updateLink(id, bodyResult.data);
  return toResponse(result);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const { linkService, profileService } = getContainer();

  // Require authentication
  const authResult = await requireAuth(request);
  if (!isOk(authResult)) {
    return toResponse(authResult);
  }

  const userId = authResult.data;

  // Get link and verify ownership
  const linkResult = await linkService.getLinkById(id);
  if (!isOk(linkResult)) {
    return toResponse(linkResult);
  }

  const link = linkResult.data;
  if (!link) {
    return toResponse(fail('NOT_FOUND', 'Link not found'));
  }

  const profileResult = await profileService.getProfileById(link.profileId);
  if (!isOk(profileResult)) {
    return toResponse(profileResult);
  }

  const ownershipResult = verifyLinkOwnership(userId, link, profileResult.data);
  if (!isOk(ownershipResult)) {
    return toResponse(ownershipResult);
  }

  // Delete
  const result = await linkService.deleteLink(id);
  return toResponse(result);
}
