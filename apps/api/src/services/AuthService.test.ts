import { describe, it, expect, beforeEach } from 'vitest';
import { isOk, isFail } from '@aether-link/core-logic';
import { MockUserRepository } from '@aether-link/db';
import { AuthService } from './AuthService';

describe('AuthService', () => {
  let service: AuthService;
  let mockRepo: MockUserRepository;

  beforeEach(() => {
    mockRepo = new MockUserRepository();
    service = new AuthService(mockRepo);
  });

  describe('register', () => {
    it('creates a new user', async () => {
      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.email).toBe('test@example.com');
        expect(result.data).not.toHaveProperty('passwordHash');
      }
    });

    it('fails with invalid email', async () => {
      const result = await service.register({
        email: 'invalid-email',
        password: 'password123',
      });

      expect(isFail(result)).toBe(true);
      if (isFail(result)) {
        expect(result.error.code).toBe('VALIDATION_ERROR');
      }
    });

    it('fails with short password', async () => {
      const result = await service.register({
        email: 'test@example.com',
        password: 'short',
      });

      expect(isFail(result)).toBe(true);
      if (isFail(result)) {
        expect(result.error.code).toBe('VALIDATION_ERROR');
      }
    });

    it('fails when email is already registered', async () => {
      await service.register({
        email: 'test@example.com',
        password: 'password123',
      });

      const result = await service.register({
        email: 'test@example.com',
        password: 'different123',
      });

      expect(isFail(result)).toBe(true);
      if (isFail(result)) {
        expect(result.error.code).toBe('CONFLICT');
      }
    });

    it('never exposes passwordHash', async () => {
      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).not.toHaveProperty('passwordHash');
        expect(Object.keys(result.data)).not.toContain('passwordHash');
      }
    });
  });

  describe('getUserByEmail', () => {
    it('returns user without passwordHash', async () => {
      await service.register({
        email: 'test@example.com',
        password: 'password123',
      });

      const result = await service.getUserByEmail('test@example.com');

      expect(isOk(result)).toBe(true);
      if (isOk(result) && result.data) {
        expect(result.data.email).toBe('test@example.com');
        expect(result.data).not.toHaveProperty('passwordHash');
        expect(Object.keys(result.data)).not.toContain('passwordHash');
      }
    });

    it('returns null for non-existent email', async () => {
      const result = await service.getUserByEmail('nonexistent@example.com');

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toBeNull();
      }
    });
  });

  describe('getUserById', () => {
    it('returns user without passwordHash', async () => {
      const registerResult = await service.register({
        email: 'test@example.com',
        password: 'password123',
      });

      if (!isOk(registerResult)) throw new Error('Register failed');

      const result = await service.getUserById(registerResult.data.id);

      expect(isOk(result)).toBe(true);
      if (isOk(result) && result.data) {
        expect(result.data.email).toBe('test@example.com');
        expect(result.data).not.toHaveProperty('passwordHash');
        expect(Object.keys(result.data)).not.toContain('passwordHash');
      }
    });
  });

  describe('getUserByEmailWithPassword', () => {
    it('returns user with passwordHash for authentication', async () => {
      await service.register({
        email: 'test@example.com',
        password: 'password123',
      });

      const result = await service.getUserByEmailWithPassword('test@example.com');

      expect(isOk(result)).toBe(true);
      if (isOk(result) && result.data) {
        expect(result.data.email).toBe('test@example.com');
        expect(result.data).toHaveProperty('passwordHash');
        expect(typeof result.data.passwordHash).toBe('string');
      }
    });

    it('returns null for non-existent email', async () => {
      const result = await service.getUserByEmailWithPassword('nonexistent@example.com');

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toBeNull();
      }
    });
  });
});
