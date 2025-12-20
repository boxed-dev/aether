import { describe, it, expect, beforeEach } from 'vitest';
import { isOk, isFail } from '@aether-link/core-logic';
import { MockProfileRepository } from './MockProfileRepository';
import type { IProfileRepository } from './IProfileRepository';

describe('IProfileRepository', () => {
  let repo: IProfileRepository;

  beforeEach(() => {
    repo = new MockProfileRepository();
  });

  describe('create', () => {
    it('creates a profile with all fields', async () => {
      const result = await repo.create({
        userId: 'user-1',
        handle: 'john',
        displayName: 'John Doe',
        bio: 'Hello world',
        avatarUrl: 'https://example.com/avatar.png',
      });

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.handle).toBe('john');
        expect(result.data.displayName).toBe('John Doe');
        expect(result.data.bio).toBe('Hello world');
        expect(result.data.isPublic).toBe(true);
        expect(result.data.id).toBeDefined();
      }
    });

    it('fails on duplicate handle', async () => {
      await repo.create({
        userId: 'user-1',
        handle: 'john',
        displayName: 'John Doe',
      });

      const result = await repo.create({
        userId: 'user-2',
        handle: 'JOHN',
        displayName: 'Jane Doe',
      });

      expect(isFail(result)).toBe(true);
      if (isFail(result)) {
        expect(result.error.code).toBe('CONFLICT');
      }
    });

    it('fails on duplicate userId', async () => {
      await repo.create({
        userId: 'user-1',
        handle: 'john',
        displayName: 'John Doe',
      });

      const result = await repo.create({
        userId: 'user-1',
        handle: 'jane',
        displayName: 'Jane Doe',
      });

      expect(isFail(result)).toBe(true);
      if (isFail(result)) {
        expect(result.error.code).toBe('CONFLICT');
      }
    });
  });

  describe('findByHandle', () => {
    it('finds profile by handle (case insensitive)', async () => {
      await repo.create({
        userId: 'user-1',
        handle: 'JohnDoe',
        displayName: 'John Doe',
      });

      const result = await repo.findByHandle('johndoe');

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data?.displayName).toBe('John Doe');
      }
    });

    it('returns null for non-existent handle', async () => {
      const result = await repo.findByHandle('nobody');

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toBeNull();
      }
    });
  });

  describe('findById', () => {
    it('finds profile by id', async () => {
      const createResult = await repo.create({
        userId: 'user-1',
        handle: 'john',
        displayName: 'John Doe',
      });

      if (!isOk(createResult)) throw new Error('Create failed');

      const result = await repo.findById(createResult.data.id);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data?.id).toBe(createResult.data.id);
      }
    });
  });

  describe('update', () => {
    it('updates profile fields', async () => {
      const createResult = await repo.create({
        userId: 'user-1',
        handle: 'john',
        displayName: 'John Doe',
      });

      if (!isOk(createResult)) throw new Error('Create failed');

      const result = await repo.update(createResult.data.id, {
        displayName: 'Johnny Doe',
        bio: 'Updated bio',
      });

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.displayName).toBe('Johnny Doe');
        expect(result.data.bio).toBe('Updated bio');
        expect(result.data.handle).toBe('john');
      }
    });

    it('fails for non-existent profile', async () => {
      const result = await repo.update('non-existent', {
        displayName: 'Test',
      });

      expect(isFail(result)).toBe(true);
      if (isFail(result)) {
        expect(result.error.code).toBe('NOT_FOUND');
      }
    });

    it('fails when changing to existing handle', async () => {
      await repo.create({
        userId: 'user-1',
        handle: 'john',
        displayName: 'John',
      });

      const createResult = await repo.create({
        userId: 'user-2',
        handle: 'jane',
        displayName: 'Jane',
      });

      if (!isOk(createResult)) throw new Error('Create failed');

      const result = await repo.update(createResult.data.id, {
        handle: 'john',
      });

      expect(isFail(result)).toBe(true);
      if (isFail(result)) {
        expect(result.error.code).toBe('CONFLICT');
      }
    });
  });

  describe('delete', () => {
    it('deletes existing profile', async () => {
      const createResult = await repo.create({
        userId: 'user-1',
        handle: 'john',
        displayName: 'John',
      });

      if (!isOk(createResult)) throw new Error('Create failed');

      const deleteResult = await repo.delete(createResult.data.id);
      expect(isOk(deleteResult)).toBe(true);

      const findResult = await repo.findById(createResult.data.id);
      expect(isOk(findResult)).toBe(true);
      if (isOk(findResult)) {
        expect(findResult.data).toBeNull();
      }
    });

    it('fails for non-existent profile', async () => {
      const result = await repo.delete('non-existent');

      expect(isFail(result)).toBe(true);
      if (isFail(result)) {
        expect(result.error.code).toBe('NOT_FOUND');
      }
    });
  });

  describe('handleExists', () => {
    it('returns true for existing handle', async () => {
      await repo.create({
        userId: 'user-1',
        handle: 'john',
        displayName: 'John',
      });

      const result = await repo.handleExists('john');

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toBe(true);
      }
    });

    it('returns false for non-existing handle', async () => {
      const result = await repo.handleExists('nobody');

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toBe(false);
      }
    });
  });
});
