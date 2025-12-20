import { eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { ok, fail, fromPromise, isOk, type Result } from '@aether-link/core-logic';
import { profiles, type Profile, type NewProfile } from '../schema';
import type { IProfileRepository } from './IProfileRepository';

export class PostgresProfileRepository implements IProfileRepository {
  constructor(private db: PostgresJsDatabase) {}

  async findById(id: string): Promise<Result<Profile | null>> {
    const result = await fromPromise(
      this.db.select().from(profiles).where(eq(profiles.id, id)).limit(1)
    );

    if (!isOk(result)) return result;
    return ok(result.data[0] ?? null);
  }

  async findByHandle(handle: string): Promise<Result<Profile | null>> {
    const result = await fromPromise(
      this.db.select().from(profiles).where(eq(profiles.handle, handle.toLowerCase())).limit(1)
    );

    if (!isOk(result)) return result;
    return ok(result.data[0] ?? null);
  }

  async findByUserId(userId: string): Promise<Result<Profile | null>> {
    const result = await fromPromise(
      this.db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1)
    );

    if (!isOk(result)) return result;
    return ok(result.data[0] ?? null);
  }

  async create(data: NewProfile): Promise<Result<Profile>> {
    const result = await fromPromise(
      this.db
        .insert(profiles)
        .values({ ...data, handle: data.handle.toLowerCase() })
        .returning()
    );

    if (!isOk(result)) {
      if (result.error.message.includes('unique')) {
        return fail('CONFLICT', 'Handle or user already exists');
      }
      return result;
    }

    if (result.data.length === 0) {
      return fail('INTERNAL_ERROR', 'Failed to create profile');
    }

    return ok(result.data[0]);
  }

  async update(id: string, data: Partial<NewProfile>): Promise<Result<Profile>> {
    const updateData = { ...data, updatedAt: new Date() };
    if (data.handle) {
      updateData.handle = data.handle.toLowerCase();
    }

    const result = await fromPromise(
      this.db.update(profiles).set(updateData).where(eq(profiles.id, id)).returning()
    );

    if (!isOk(result)) return result;

    if (result.data.length === 0) {
      return fail('NOT_FOUND', 'Profile not found', { id });
    }

    return ok(result.data[0]);
  }

  async delete(id: string): Promise<Result<void>> {
    const result = await fromPromise(
      this.db.delete(profiles).where(eq(profiles.id, id)).returning()
    );

    if (!isOk(result)) return result;

    if (result.data.length === 0) {
      return fail('NOT_FOUND', 'Profile not found', { id });
    }

    return ok(undefined);
  }

  async handleExists(handle: string): Promise<Result<boolean>> {
    const result = await this.findByHandle(handle);
    if (!isOk(result)) return result;
    return ok(result.data !== null);
  }
}
