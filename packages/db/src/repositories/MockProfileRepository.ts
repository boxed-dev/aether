import { ok, fail, type Result } from '@aether-link/core-logic';
import type { Profile, NewProfile } from '../schema';
import type { IProfileRepository } from './IProfileRepository';

export class MockProfileRepository implements IProfileRepository {
  private profiles = new Map<string, Profile>();
  private handleIndex = new Map<string, string>();
  private userIdIndex = new Map<string, string>();

  async findById(id: string): Promise<Result<Profile | null>> {
    return ok(this.profiles.get(id) ?? null);
  }

  async findByHandle(handle: string): Promise<Result<Profile | null>> {
    const id = this.handleIndex.get(handle.toLowerCase());
    if (!id) return ok(null);
    return ok(this.profiles.get(id) ?? null);
  }

  async findByUserId(userId: string): Promise<Result<Profile | null>> {
    const id = this.userIdIndex.get(userId);
    if (!id) return ok(null);
    return ok(this.profiles.get(id) ?? null);
  }

  async create(data: NewProfile): Promise<Result<Profile>> {
    const id = data.id ?? crypto.randomUUID();
    const now = new Date();

    if (this.handleIndex.has(data.handle.toLowerCase())) {
      return fail('CONFLICT', 'Handle already exists', { handle: data.handle });
    }

    if (this.userIdIndex.has(data.userId)) {
      return fail('CONFLICT', 'User already has a profile', { userId: data.userId });
    }

    const profile: Profile = {
      id,
      userId: data.userId,
      handle: data.handle,
      displayName: data.displayName,
      bio: data.bio ?? null,
      avatarUrl: data.avatarUrl ?? null,
      isPublic: data.isPublic ?? true,
      createdAt: now,
      updatedAt: now,
    };

    this.profiles.set(id, profile);
    this.handleIndex.set(data.handle.toLowerCase(), id);
    this.userIdIndex.set(data.userId, id);

    return ok(profile);
  }

  async update(id: string, data: Partial<NewProfile>): Promise<Result<Profile>> {
    const existing = this.profiles.get(id);
    if (!existing) {
      return fail('NOT_FOUND', 'Profile not found', { id });
    }

    if (data.handle && data.handle.toLowerCase() !== existing.handle.toLowerCase()) {
      if (this.handleIndex.has(data.handle.toLowerCase())) {
        return fail('CONFLICT', 'Handle already exists', { handle: data.handle });
      }
      this.handleIndex.delete(existing.handle.toLowerCase());
      this.handleIndex.set(data.handle.toLowerCase(), id);
    }

    const updated: Profile = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date(),
    };

    this.profiles.set(id, updated);
    return ok(updated);
  }

  async delete(id: string): Promise<Result<void>> {
    const existing = this.profiles.get(id);
    if (!existing) {
      return fail('NOT_FOUND', 'Profile not found', { id });
    }

    this.profiles.delete(id);
    this.handleIndex.delete(existing.handle.toLowerCase());
    this.userIdIndex.delete(existing.userId);

    return ok(undefined);
  }

  async handleExists(handle: string): Promise<Result<boolean>> {
    return ok(this.handleIndex.has(handle.toLowerCase()));
  }

  clear(): void {
    this.profiles.clear();
    this.handleIndex.clear();
    this.userIdIndex.clear();
  }
}
