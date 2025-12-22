import { NextRequest } from 'next/server';
import { getContainer } from '@/container';
import { toResponse } from '@/lib/response';

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const { linkService } = getContainer();

  const result = await linkService.trackClick(id);
  return toResponse(result);
}
