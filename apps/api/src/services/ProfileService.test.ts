import { describe, it, expect, beforeEach } from 'vitest';
import { isOk, isFail } from '@aether-link/core-logic';
import { MockProfileRepository } from '@aether-link/db';
import { ProfileService } from './ProfileService';

describe('ProfileService', () => {
  let service: ProfileService;
  let mockRepo: MockProfileRepository;

  beforeEach(() => {
    mockRepo = new MockProfileRepository();
    service = new ProfileService(mockRepo);
  });

  describe('createProfile', () => {
    it('creates a valid profile', async () => {
      const result = await service.createProfile({
        userId: 'user-1',
        handle: 'john_doe',
        displayName: 'John Doe',
        bio: 'Hello world',
      });

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.handle).toBe('john_doe');
        expect(result.data.displayName).toBe('John Doe');
      }
    });

    it('fails with invalid handle format', async () => {
      const result = await service.createProfile({
        userId: 'user-1',
        handle: 'invalid handle!',
        displayName: 'John Doe',
      });

      expect(isFail(result)).toBe(true);
      if (isFail(result)) {
        expect(result.error.code).toBe('VALIDATION_ERROR');
      }
    });

    it('fails with handle too short', async () => {
      const result = await service.createProfile({
        userId: 'user-1',
        handle: 'ab',
        displayName: 'John Doe',
      });

      expect(isFail(result)).toBe(true);
      if (isFail(result)) {
        expect(result.error.code).toBe('VALIDATION_ERROR');
      }
    });

    it('fails when user already has a profile', async () => {
      await service.createProfile({
        userId: 'user-1',
        handle: 'john',
        displayName: 'John',
      });

      const result = await service.createProfile({
        userId: 'user-1',
        handle: 'jane',
        displayName: 'Jane',
      });

      expect(isFail(result)).toBe(true);
      if (isFail(result)) {
        expect(result.error.code).toBe('CONFLICT');
        expect(result.error.message).toContain('already has a profile');
      }
    });

    it('fails when handle is taken', async () => {
      await service.createProfile({
        userId: 'user-1',
        handle: 'john',
        displayName: 'John',
      });

      const result = await service.createProfile({
        userId: 'user-2',
        handle: 'john',
        displayName: 'Jane',
      });

      expect(isFail(result)).toBe(true);
      if (isFail(result)) {
        expect(result.error.code).toBe('CONFLICT');
        expect(result.error.message).toContain('taken');
      }
    });
  });

  describe('getProfileByHandle', () => {
    it('returns profile by handle', async () => {
      await service.createProfile({
        userId: 'user-1',
        handle: 'john',
        displayName: 'John',
      });

      const result = await service.getProfileByHandle('john');

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data?.displayName).toBe('John');
      }
    });

    it('returns null for non-existent handle', async () => {
      const result = await service.getProfileByHandle('nobody');

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toBeNull();
      }
    });
  });

  describe('updateProfile', () => {
    it('updates profile fields', async () => {
      const createResult = await service.createProfile({
        userId: 'user-1',
        handle: 'john',
        displayName: 'John',
      });

      if (!isOk(createResult)) throw new Error('Create failed');

      const result = await service.updateProfile(createResult.data.id, {
        displayName: 'Johnny',
        bio: 'Updated bio',
      });

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.displayName).toBe('Johnny');
        expect(result.data.bio).toBe('Updated bio');
      }
    });

    it('fails when changing to taken handle', async () => {
      await service.createProfile({
        userId: 'user-1',
        handle: 'john',
        displayName: 'John',
      });

      const createResult = await service.createProfile({
        userId: 'user-2',
        handle: 'jane',
        displayName: 'Jane',
      });

      if (!isOk(createResult)) throw new Error('Create failed');

      const result = await service.updateProfile(createResult.data.id, {
        handle: 'john',
      });

      expect(isFail(result)).toBe(true);
      if (isFail(result)) {
        expect(result.error.code).toBe('CONFLICT');
      }
    });

    it('fails for non-existent profile', async () => {
      const result = await service.updateProfile('non-existent', {
        displayName: 'Test',
      });

      expect(isFail(result)).toBe(true);
      if (isFail(result)) {
        expect(result.error.code).toBe('NOT_FOUND');
      }
    });
  });

  describe('checkHandleAvailability', () => {
    it('returns true for available handle', async () => {
      const result = await service.checkHandleAvailability('available');

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toBe(true);
      }
    });

    it('returns false for taken handle', async () => {
      await service.createProfile({
        userId: 'user-1',
        handle: 'taken',
        displayName: 'User',
      });

      const result = await service.checkHandleAvailability('taken');

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toBe(false);
      }
    });
  });

  describe('deleteProfile', () => {
    it('deletes existing profile', async () => {
      const createResult = await service.createProfile({
        userId: 'user-1',
        handle: 'john',
        displayName: 'John',
      });

      if (!isOk(createResult)) throw new Error('Create failed');

      const deleteResult = await service.deleteProfile(createResult.data.id);
      expect(isOk(deleteResult)).toBe(true);

      const findResult = await service.getProfileById(createResult.data.id);
      expect(isOk(findResult)).toBe(true);
      if (isOk(findResult)) {
        expect(findResult.data).toBeNull();
      }
    });
  });
});
