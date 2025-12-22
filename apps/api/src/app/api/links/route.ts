import { NextRequest } from 'next/server';
import { fail, isOk } from '@aether-link/core-logic';
import { getContainer } from '@/container';
import { toResponse, parseJsonBody } from '@/lib/response';
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
  const { linkService } = getContainer();
  const bodyResult = await parseJsonBody<CreateLinkInput>(request);

  if (!isOk(bodyResult)) {
    return toResponse(bodyResult);
  }

  const result = await linkService.createLink(bodyResult.data);
  return toResponse(result, 201);
}
