import { NextRequest } from 'next/server';
import { fail, isOk } from '@aether-link/core-logic';
import { getContainer } from '@/container';
import { toResponse, parseJsonBody } from '@/lib/response';
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
  const { linkService } = getContainer();
  const bodyResult = await parseJsonBody<UpdateLinkInput>(request);

  if (!isOk(bodyResult)) {
    return toResponse(bodyResult);
  }

  const result = await linkService.updateLink(id, bodyResult.data);
  return toResponse(result);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const { linkService } = getContainer();

  const result = await linkService.deleteLink(id);
  return toResponse(result);
}
