export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INTERNAL_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT';

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export type Success<T> = {
  success: true;
  data: T;
};

export type Failure = {
  success: false;
  error: AppError;
};

export type Result<T> = Success<T> | Failure;

export function ok<T>(data: T): Success<T> {
  return { success: true, data };
}

export function fail(code: ErrorCode, message: string, details?: Record<string, unknown>): Failure {
  return {
    success: false,
    error: { code, message, details },
  };
}

export function isOk<T>(result: Result<T>): result is Success<T> {
  return result.success === true;
}

export function isFail<T>(result: Result<T>): result is Failure {
  return result.success === false;
}

export function unwrap<T>(result: Result<T>): T {
  if (isOk(result)) {
    return result.data;
  }
  throw new Error(`Unwrap failed: ${result.error.code} - ${result.error.message}`);
}

export function unwrapOr<T>(result: Result<T>, defaultValue: T): T {
  if (isOk(result)) {
    return result.data;
  }
  return defaultValue;
}

export function map<T, U>(result: Result<T>, fn: (data: T) => U): Result<U> {
  if (isOk(result)) {
    return ok(fn(result.data));
  }
  return result;
}

export async function fromPromise<T>(
  promise: Promise<T>,
  errorCode: ErrorCode = 'INTERNAL_ERROR'
): Promise<Result<T>> {
  try {
    const data = await promise;
    return ok(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const details = error instanceof Error && process.env.NODE_ENV !== 'production'
      ? { stack: error.stack }
      : undefined;
    return fail(errorCode, message, details);
  }
}

export function fromArray<T>(arr: T[], errorCode: ErrorCode = 'NOT_FOUND', message = 'Item not found'): Result<T> {
  if (arr.length === 0) {
    return fail(errorCode, message);
  }
  return ok(arr[0]);
}
