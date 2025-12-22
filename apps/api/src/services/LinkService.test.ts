import { describe, it, expect, beforeEach } from 'vitest';
import { isOk, isFail } from '@aether-link/core-logic';
import { MockProfileRepository, MockLinkRepository } from '@aether-link/db';
import { LinkService } from './LinkService';

describe('LinkService', () => {
  let service: LinkService;
  let mockLinkRepo: MockLinkRepository;
  let mockProfileRepo: MockProfileRepository;
  let profileId: string;

  beforeEach(async () => {
    mockLinkRepo = new MockLinkRepository();
    mockProfileRepo = new MockProfileRepository();
    service = new LinkService(mockLinkRepo, mockProfileRepo);

    const profileResult = await mockProfileRepo.create({
      userId: 'user-1',
      handle: 'john',
      displayName: 'John',
    });

    if (!isOk(profileResult)) throw new Error('Profile create failed');
    profileId = profileResult.data.id;
  });

  describe('createLink', () => {
    it('creates a valid link', async () => {
      const result = await service.createLink({
        profileId,
        title: 'GitHub',
        url: 'https://github.com/john',
        icon: 'github',
      });

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.title).toBe('GitHub');
        expect(result.data.url).toBe('https://github.com/john');
      }
    });

    it('fails with invalid URL', async () => {
      const result = await service.createLink({
        profileId,
        title: 'Bad Link',
        url: 'not-a-url',
      });

      expect(isFail(result)).toBe(true);
      if (isFail(result)) {
        expect(result.error.code).toBe('VALIDATION_ERROR');
      }
    });

    it('fails for non-existent profile', async () => {
      const result = await service.createLink({
        profileId: '00000000-0000-0000-0000-000000000000',
        title: 'Test',
        url: 'https://test.com',
      });

      expect(isFail(result)).toBe(true);
      if (isFail(result)) {
        expect(result.error.code).toBe('NOT_FOUND');
      }
    });

    it('fails with empty title', async () => {
      const result = await service.createLink({
        profileId,
        title: '',
        url: 'https://test.com',
      });

      expect(isFail(result)).toBe(true);
      if (isFail(result)) {
        expect(result.error.code).toBe('VALIDATION_ERROR');
      }
    });
  });

  describe('getLinksByProfileId', () => {
    it('returns links ordered by position', async () => {
      await service.createLink({ profileId, title: 'First', url: 'https://1.com' });
      await service.createLink({ profileId, title: 'Second', url: 'https://2.com' });

      const result = await service.getLinksByProfileId(profileId);

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toHaveLength(2);
        expect(result.data[0].title).toBe('First');
        expect(result.data[1].title).toBe('Second');
      }
    });
  });

  describe('updateLink', () => {
    it('updates link fields', async () => {
      const createResult = await service.createLink({
        profileId,
        title: 'Old',
        url: 'https://old.com',
      });

      if (!isOk(createResult)) throw new Error('Create failed');

      const result = await service.updateLink(createResult.data.id, {
        title: 'New',
        url: 'https://new.com',
      });

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.title).toBe('New');
        expect(result.data.url).toBe('https://new.com');
      }
    });

    it('fails for non-existent link', async () => {
      const result = await service.updateLink('non-existent', { title: 'Test' });

      expect(isFail(result)).toBe(true);
      if (isFail(result)) {
        expect(result.error.code).toBe('NOT_FOUND');
      }
    });
  });

  describe('reorderLinks', () => {
    it('reorders links', async () => {
      const link1 = await service.createLink({ profileId, title: 'A', url: 'https://a.com' });
      const link2 = await service.createLink({ profileId, title: 'B', url: 'https://b.com' });
      const link3 = await service.createLink({ profileId, title: 'C', url: 'https://c.com' });

      if (!isOk(link1) || !isOk(link2) || !isOk(link3)) throw new Error('Create failed');

      const reorderResult = await service.reorderLinks({
        profileId,
        linkIds: [link3.data.id, link1.data.id, link2.data.id],
      });

      expect(isOk(reorderResult)).toBe(true);

      const linksResult = await service.getLinksByProfileId(profileId);
      expect(isOk(linksResult)).toBe(true);
      if (isOk(linksResult)) {
        expect(linksResult.data.map((l) => l.title)).toEqual(['C', 'A', 'B']);
      }
    });

    it('fails for link not belonging to profile', async () => {
      await service.createLink({ profileId, title: 'A', url: 'https://a.com' });

      const result = await service.reorderLinks({
        profileId,
        linkIds: ['00000000-0000-0000-0000-000000000000'],
      });

      expect(isFail(result)).toBe(true);
      if (isFail(result)) {
        expect(result.error.code).toBe('VALIDATION_ERROR');
      }
    });
  });

  describe('trackClick', () => {
    it('increments click count', async () => {
      const createResult = await service.createLink({
        profileId,
        title: 'Clickable',
        url: 'https://click.com',
      });

      if (!isOk(createResult)) throw new Error('Create failed');

      await service.trackClick(createResult.data.id);
      await service.trackClick(createResult.data.id);

      const linkResult = await service.getLinkById(createResult.data.id);
      expect(isOk(linkResult)).toBe(true);
      if (isOk(linkResult)) {
        expect(linkResult.data?.clickCount).toBe(2);
      }
    });

    it('fails for non-existent link', async () => {
      const result = await service.trackClick('non-existent');

      expect(isFail(result)).toBe(true);
      if (isFail(result)) {
        expect(result.error.code).toBe('NOT_FOUND');
      }
    });
  });

  describe('deleteLink', () => {
    it('deletes existing link', async () => {
      const createResult = await service.createLink({
        profileId,
        title: 'To Delete',
        url: 'https://delete.com',
      });

      if (!isOk(createResult)) throw new Error('Create failed');

      const deleteResult = await service.deleteLink(createResult.data.id);
      expect(isOk(deleteResult)).toBe(true);

      const findResult = await service.getLinkById(createResult.data.id);
      expect(isOk(findResult)).toBe(true);
      if (isOk(findResult)) {
        expect(findResult.data).toBeNull();
      }
    });
  });
});
