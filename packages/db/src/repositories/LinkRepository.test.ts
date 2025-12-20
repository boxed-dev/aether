import { describe, it, expect, beforeEach } from 'vitest';
import { isOk, isFail } from '@aether-link/core-logic';
import { MockLinkRepository } from './MockLinkRepository';
import type { ILinkRepository } from './ILinkRepository';

describe('ILinkRepository', () => {
  let repo: ILinkRepository;
  const profileId = 'profile-1';

  beforeEach(() => {
    repo = new MockLinkRepository();
  });

  describe('create', () => {
    it('creates a link with all fields', async () => {
      const result = await repo.create({
        profileId,
        title: 'GitHub',
        url: 'https://github.com/john',
        icon: 'github',
      });

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.title).toBe('GitHub');
        expect(result.data.url).toBe('https://github.com/john');
        expect(result.data.icon).toBe('github');
        expect(result.data.isActive).toBe(true);
        expect(result.data.clickCount).toBe(0);
      }
    });

    it('auto-increments position', async () => {
      await repo.create({ profileId, title: 'Link 1', url: 'https://1.com' });
      await repo.create({ profileId, title: 'Link 2', url: 'https://2.com' });
      const result = await repo.create({ profileId, title: 'Link 3', url: 'https://3.com' });

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.position).toBe(2);
      }
    });
  });

  describe('findByProfileId', () => {
    it('returns links ordered by position', async () => {
      await repo.create({ profileId, title: 'First', url: 'https://1.com', position: 0 });
      await repo.create({ profileId, title: 'Third', url: 'https://3.com', position: 2 });
      await repo.create({ profileId, title: 'Second', url: 'https://2.com', position: 1 });

      const result = await repo.findByProfileId(profileId);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.map((l) => l.title)).toEqual(['First', 'Second', 'Third']);
      }
    });

    it('returns empty array for profile with no links', async () => {
      const result = await repo.findByProfileId('no-links');

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toEqual([]);
      }
    });
  });

  describe('update', () => {
    it('updates link fields', async () => {
      const createResult = await repo.create({
        profileId,
        title: 'Old Title',
        url: 'https://old.com',
      });

      if (!isOk(createResult)) throw new Error('Create failed');

      const result = await repo.update(createResult.data.id, {
        title: 'New Title',
        url: 'https://new.com',
      });

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.title).toBe('New Title');
        expect(result.data.url).toBe('https://new.com');
      }
    });

    it('fails for non-existent link', async () => {
      const result = await repo.update('non-existent', { title: 'Test' });

      expect(isFail(result)).toBe(true);
      if (isFail(result)) {
        expect(result.error.code).toBe('NOT_FOUND');
      }
    });
  });

  describe('delete', () => {
    it('deletes existing link', async () => {
      const createResult = await repo.create({
        profileId,
        title: 'To Delete',
        url: 'https://delete.com',
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
  });

  describe('reorder', () => {
    it('reorders links by new order', async () => {
      const link1 = await repo.create({ profileId, title: 'A', url: 'https://a.com' });
      const link2 = await repo.create({ profileId, title: 'B', url: 'https://b.com' });
      const link3 = await repo.create({ profileId, title: 'C', url: 'https://c.com' });

      if (!isOk(link1) || !isOk(link2) || !isOk(link3)) throw new Error('Create failed');

      const reorderResult = await repo.reorder(profileId, [
        link3.data.id,
        link1.data.id,
        link2.data.id,
      ]);

      expect(isOk(reorderResult)).toBe(true);

      const findResult = await repo.findByProfileId(profileId);
      expect(isOk(findResult)).toBe(true);
      if (isOk(findResult)) {
        expect(findResult.data.map((l) => l.title)).toEqual(['C', 'A', 'B']);
      }
    });

    it('fails for link not belonging to profile', async () => {
      await repo.create({ profileId, title: 'A', url: 'https://a.com' });

      const result = await repo.reorder(profileId, ['wrong-id']);

      expect(isFail(result)).toBe(true);
      if (isFail(result)) {
        expect(result.error.code).toBe('VALIDATION_ERROR');
      }
    });
  });

  describe('incrementClickCount', () => {
    it('increments click count', async () => {
      const createResult = await repo.create({
        profileId,
        title: 'Clickable',
        url: 'https://click.com',
      });

      if (!isOk(createResult)) throw new Error('Create failed');

      await repo.incrementClickCount(createResult.data.id);
      await repo.incrementClickCount(createResult.data.id);

      const findResult = await repo.findById(createResult.data.id);
      expect(isOk(findResult)).toBe(true);
      if (isOk(findResult)) {
        expect(findResult.data?.clickCount).toBe(2);
      }
    });

    it('fails for non-existent link', async () => {
      const result = await repo.incrementClickCount('non-existent');

      expect(isFail(result)).toBe(true);
      if (isFail(result)) {
        expect(result.error.code).toBe('NOT_FOUND');
      }
    });
  });
});
