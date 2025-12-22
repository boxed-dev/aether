import { z } from 'zod';
import { fail, isOk, type Result } from '@aether-link/core-logic';
import type { ILinkRepository, IProfileRepository, Link } from '@aether-link/db';

const createLinkSchema = z.object({
  profileId: z.string().uuid(),
  title: z.string().min(1).max(100),
  url: z.string().url(),
  icon: z.string().max(50).optional(),
  position: z.number().int().min(0).optional(),
});

const updateLinkSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  url: z.string().url().optional(),
  icon: z.string().max(50).optional().nullable(),
  isActive: z.boolean().optional(),
});

const reorderLinksSchema = z.object({
  profileId: z.string().uuid(),
  linkIds: z.array(z.string().uuid()).min(1),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;
export type ReorderLinksInput = z.infer<typeof reorderLinksSchema>;

export class LinkService {
  constructor(
    private linkRepo: ILinkRepository,
    private profileRepo: IProfileRepository
  ) {}

  async createLink(input: CreateLinkInput): Promise<Result<Link>> {
    const validation = createLinkSchema.safeParse(input);
    if (!validation.success) {
      return fail('VALIDATION_ERROR', 'Invalid link data', {
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const profile = await this.profileRepo.findById(input.profileId);
    if (!isOk(profile) || !profile.data) {
      return fail('NOT_FOUND', 'Profile not found');
    }

    return this.linkRepo.create({
      profileId: input.profileId,
      title: input.title,
      url: input.url,
      icon: input.icon,
      position: input.position,
    });
  }

  async getLinksByProfileId(profileId: string): Promise<Result<Link[]>> {
    return this.linkRepo.findByProfileId(profileId);
  }

  async getLinkById(id: string): Promise<Result<Link | null>> {
    return this.linkRepo.findById(id);
  }

  async updateLink(id: string, input: UpdateLinkInput): Promise<Result<Link>> {
    const validation = updateLinkSchema.safeParse(input);
    if (!validation.success) {
      return fail('VALIDATION_ERROR', 'Invalid update data', {
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const existing = await this.linkRepo.findById(id);
    if (!isOk(existing) || !existing.data) {
      return fail('NOT_FOUND', 'Link not found');
    }

    return this.linkRepo.update(id, validation.data);
  }

  async deleteLink(id: string): Promise<Result<void>> {
    return this.linkRepo.delete(id);
  }

  async reorderLinks(input: ReorderLinksInput): Promise<Result<void>> {
    const validation = reorderLinksSchema.safeParse(input);
    if (!validation.success) {
      return fail('VALIDATION_ERROR', 'Invalid reorder data', {
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const existingLinks = await this.linkRepo.findByProfileId(input.profileId);
    if (!isOk(existingLinks)) {
      return existingLinks;
    }

    const existingIds = new Set(existingLinks.data.map((l) => l.id));
    for (const id of input.linkIds) {
      if (!existingIds.has(id)) {
        return fail('VALIDATION_ERROR', 'Link does not belong to profile', { linkId: id });
      }
    }

    return this.linkRepo.reorder(input.profileId, input.linkIds);
  }

  async trackClick(id: string): Promise<Result<void>> {
    const link = await this.linkRepo.findById(id);
    if (!isOk(link) || !link.data) {
      return fail('NOT_FOUND', 'Link not found');
    }

    return this.linkRepo.incrementClickCount(id);
  }
}
