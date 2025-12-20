import { describe, it, expect } from 'vitest';
import {
  ok,
  fail,
  isOk,
  isFail,
  unwrap,
  unwrapOr,
  map,
  fromPromise,
  type Result,
} from './result';

describe('Result Pattern', () => {
  describe('ok', () => {
    it('creates a success result with data', () => {
      const result = ok({ id: 1, name: 'test' });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: 1, name: 'test' });
    });

    it('works with primitive values', () => {
      expect(ok(42).data).toBe(42);
      expect(ok('hello').data).toBe('hello');
      expect(ok(true).data).toBe(true);
      expect(ok(null).data).toBe(null);
    });
  });

  describe('fail', () => {
    it('creates a failure result with error', () => {
      const result = fail('VALIDATION_ERROR', 'Invalid input');

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.message).toBe('Invalid input');
    });

    it('includes optional details', () => {
      const result = fail('VALIDATION_ERROR', 'Invalid input', {
        field: 'email',
        reason: 'format',
      });

      expect(result.error.details).toEqual({
        field: 'email',
        reason: 'format',
      });
    });
  });

  describe('isOk', () => {
    it('returns true for success results', () => {
      const result = ok('data');
      expect(isOk(result)).toBe(true);
    });

    it('returns false for failure results', () => {
      const result = fail('NOT_FOUND', 'Not found');
      expect(isOk(result)).toBe(false);
    });

    it('narrows type correctly', () => {
      const result: Result<number> = ok(42);

      if (isOk(result)) {
        const value: number = result.data;
        expect(value).toBe(42);
      }
    });
  });

  describe('isFail', () => {
    it('returns true for failure results', () => {
      const result = fail('INTERNAL_ERROR', 'Server error');
      expect(isFail(result)).toBe(true);
    });

    it('returns false for success results', () => {
      const result = ok('data');
      expect(isFail(result)).toBe(false);
    });

    it('narrows type correctly', () => {
      const result: Result<number> = fail('NOT_FOUND', 'Missing');

      if (isFail(result)) {
        expect(result.error.code).toBe('NOT_FOUND');
      }
    });
  });

  describe('unwrap', () => {
    it('returns data for success results', () => {
      const result = ok({ value: 100 });
      expect(unwrap(result)).toEqual({ value: 100 });
    });

    it('throws for failure results', () => {
      const result = fail('UNAUTHORIZED', 'Access denied');

      expect(() => unwrap(result)).toThrow(
        'Unwrap failed: UNAUTHORIZED - Access denied'
      );
    });
  });

  describe('unwrapOr', () => {
    it('returns data for success results', () => {
      const result = ok(42);
      expect(unwrapOr(result, 0)).toBe(42);
    });

    it('returns default for failure results', () => {
      const result = fail('NOT_FOUND', 'Missing');
      expect(unwrapOr(result, 0)).toBe(0);
    });
  });

  describe('map', () => {
    it('transforms success data', () => {
      const result = ok(10);
      const mapped = map(result, (n) => n * 2);

      expect(isOk(mapped)).toBe(true);
      if (isOk(mapped)) {
        expect(mapped.data).toBe(20);
      }
    });

    it('passes through failure unchanged', () => {
      const result = fail('VALIDATION_ERROR', 'Invalid');
      const mapped = map(result, (n: number) => n * 2);

      expect(isFail(mapped)).toBe(true);
      if (isFail(mapped)) {
        expect(mapped.error.code).toBe('VALIDATION_ERROR');
      }
    });
  });

  describe('fromPromise', () => {
    it('wraps resolved promise in success', async () => {
      const promise = Promise.resolve('resolved value');
      const result = await fromPromise(promise);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toBe('resolved value');
      }
    });

    it('wraps rejected promise in failure', async () => {
      const promise = Promise.reject(new Error('Something went wrong'));
      const result = await fromPromise(promise);

      expect(isFail(result)).toBe(true);
      if (isFail(result)) {
        expect(result.error.message).toBe('Something went wrong');
        expect(result.error.code).toBe('INTERNAL_ERROR');
      }
    });

    it('uses custom error code', async () => {
      const promise = Promise.reject(new Error('Network failure'));
      const result = await fromPromise(promise, 'NETWORK_ERROR');

      expect(isFail(result)).toBe(true);
      if (isFail(result)) {
        expect(result.error.code).toBe('NETWORK_ERROR');
      }
    });

    it('handles non-Error rejections', async () => {
      const promise = Promise.reject('string error');
      const result = await fromPromise(promise);

      expect(isFail(result)).toBe(true);
      if (isFail(result)) {
        expect(result.error.message).toBe('Unknown error');
      }
    });
  });
});
