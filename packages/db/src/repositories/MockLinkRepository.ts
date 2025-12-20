import { ok, fail, type Result } from '@aether-link/core-logic';
import type { Link, NewLink } from '../schema';
import type { ILinkRepository } from './ILinkRepository';

export class MockLinkRepository implements ILinkRepository {
  private links = new Map<string, Link>();
  private profileIndex = new Map<string, Set<string>>();

  async findById(id: string): Promise<Result<Link | null>> {
    return ok(this.links.get(id) ?? null);
  }

  async findByProfileId(profileId: string): Promise<Result<Link[]>> {
    const linkIds = this.profileIndex.get(profileId) ?? new Set();
    const links = Array.from(linkIds)
      .map((id) => this.links.get(id))
      .filter((link): link is Link => link !== undefined)
      .sort((a, b) => a.position - b.position);
    return ok(links);
  }

  async create(data: NewLink): Promise<Result<Link>> {
    const id = data.id ?? crypto.randomUUID();
    const now = new Date();

    const existingLinks = this.profileIndex.get(data.profileId) ?? new Set();
    const position = data.position ?? existingLinks.size;

    const link: Link = {
      id,
      profileId: data.profileId,
      title: data.title,
      url: data.url,
      icon: data.icon ?? null,
      position,
      isActive: data.isActive ?? true,
      clickCount: data.clickCount ?? 0,
      createdAt: now,
      updatedAt: now,
    };

    this.links.set(id, link);

    if (!this.profileIndex.has(data.profileId)) {
      this.profileIndex.set(data.profileId, new Set());
    }
    this.profileIndex.get(data.profileId)!.add(id);

    return ok(link);
  }

  async update(id: string, data: Partial<NewLink>): Promise<Result<Link>> {
    const existing = this.links.get(id);
    if (!existing) {
      return fail('NOT_FOUND', 'Link not found', { id });
    }

    const updated: Link = {
      ...existing,
      ...data,
      id,
      profileId: existing.profileId,
      updatedAt: new Date(),
    };

    this.links.set(id, updated);
    return ok(updated);
  }

  async delete(id: string): Promise<Result<void>> {
    const existing = this.links.get(id);
    if (!existing) {
      return fail('NOT_FOUND', 'Link not found', { id });
    }

    this.links.delete(id);
    this.profileIndex.get(existing.profileId)?.delete(id);

    return ok(undefined);
  }

  async reorder(profileId: string, linkIds: string[]): Promise<Result<void>> {
    const existingIds = this.profileIndex.get(profileId);
    if (!existingIds) {
      return fail('NOT_FOUND', 'Profile has no links', { profileId });
    }

    for (const id of linkIds) {
      if (!existingIds.has(id)) {
        return fail('VALIDATION_ERROR', 'Link does not belong to profile', { linkId: id });
      }
    }

    for (let i = 0; i < linkIds.length; i++) {
      const link = this.links.get(linkIds[i]);
      if (link) {
        link.position = i;
        link.updatedAt = new Date();
      }
    }

    return ok(undefined);
  }

  async incrementClickCount(id: string): Promise<Result<void>> {
    const link = this.links.get(id);
    if (!link) {
      return fail('NOT_FOUND', 'Link not found', { id });
    }

    link.clickCount += 1;
    return ok(undefined);
  }

  clear(): void {
    this.links.clear();
    this.profileIndex.clear();
  }
}
