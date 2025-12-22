import { NextRequest } from 'next/server';
import { isOk } from '@aether-link/core-logic';
import { getContainer } from '@/container';
import { toResponse, parseJsonBody } from '@/lib/response';
import type { RegisterInput } from '@/services/AuthService';

export async function POST(request: NextRequest) {
  const { authService } = getContainer();
  const bodyResult = await parseJsonBody<RegisterInput>(request);

  if (!isOk(bodyResult)) {
    return toResponse(bodyResult);
  }

  const result = await authService.register(bodyResult.data);
  return toResponse(result, 201);
}
