import { NextRequest } from 'next/server';
import { isOk } from '@aether-link/core-logic';
import { getContainer } from '@/container';
import { toResponse, parseJsonBody } from '@/lib/response';
import type { ReorderLinksInput } from '@/services/LinkService';

export async function POST(request: NextRequest) {
  const { linkService } = getContainer();
  const bodyResult = await parseJsonBody<ReorderLinksInput>(request);

  if (!isOk(bodyResult)) {
    return toResponse(bodyResult);
  }

  const result = await linkService.reorderLinks(bodyResult.data);
  return toResponse(result);
}
