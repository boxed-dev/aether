import { NextRequest, NextResponse } from 'next/server';
import { fail, isOk, type Result, type ErrorCode } from '@aether-link/core-logic';

const HTTP_STATUS_MAP: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
  NETWORK_ERROR: 502,
  TIMEOUT: 504,
};

export function toResponse<T>(result: Result<T>, successStatus = 200): NextResponse {
  if (isOk(result)) {
    if (result.data === undefined || result.data === null) {
      return new NextResponse(null, { status: 204 });
    }
    return NextResponse.json(result.data, { status: successStatus });
  }

  const status = HTTP_STATUS_MAP[result.error.code] ?? 500;
  const isProduction = process.env.NODE_ENV === 'production';

  const headers: HeadersInit = {};

  // Add Retry-After header for rate limiting
  if (result.error.code === 'RATE_LIMITED' && result.error.details?.retryAfter) {
    headers['Retry-After'] = String(result.error.details.retryAfter);
  }

  return NextResponse.json(
    {
      error: {
        code: result.error.code,
        message: result.error.message,
        ...(isProduction ? {} : { details: result.error.details }),
      },
    },
    { status, headers }
  );
}

export async function parseJsonBody<T>(request: NextRequest): Promise<Result<T>> {
  try {
    const body = await request.json();
    return { success: true, data: body as T };
  } catch {
    return fail('VALIDATION_ERROR', 'Invalid JSON body');
  }
}
