import { eq, sql, asc } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { ok, fail, fromPromise, isOk, type Result } from '@aether-link/core-logic';
import { links, type Link, type NewLink } from '../schema';
import type { ILinkRepository } from './ILinkRepository';

export class PostgresLinkRepository implements ILinkRepository {
  constructor(private db: PostgresJsDatabase) {}

  async findById(id: string): Promise<Result<Link | null>> {
    const result = await fromPromise(
      this.db.select().from(links).where(eq(links.id, id)).limit(1)
    );

    if (!isOk(result)) return result;
    return ok(result.data[0] ?? null);
  }

  async findByProfileId(profileId: string): Promise<Result<Link[]>> {
    const result = await fromPromise(
      this.db
        .select()
        .from(links)
        .where(eq(links.profileId, profileId))
        .orderBy(asc(links.position))
    );

    if (!isOk(result)) return result;
    return ok(result.data);
  }

  async create(data: NewLink): Promise<Result<Link>> {
    const result = await fromPromise(this.db.insert(links).values(data).returning());

    if (!isOk(result)) return result;

    if (result.data.length === 0) {
      return fail('INTERNAL_ERROR', 'Failed to create link');
    }

    return ok(result.data[0]);
  }

  async update(id: string, data: Partial<NewLink>): Promise<Result<Link>> {
    const result = await fromPromise(
      this.db
        .update(links)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(links.id, id))
        .returning()
    );

    if (!isOk(result)) return result;

    if (result.data.length === 0) {
      return fail('NOT_FOUND', 'Link not found', { id });
    }

    return ok(result.data[0]);
  }

  async delete(id: string): Promise<Result<void>> {
    const result = await fromPromise(
      this.db.delete(links).where(eq(links.id, id)).returning()
    );

    if (!isOk(result)) return result;

    if (result.data.length === 0) {
      return fail('NOT_FOUND', 'Link not found', { id });
    }

    return ok(undefined);
  }

  async reorder(profileId: string, linkIds: string[]): Promise<Result<void>> {
    if (linkIds.length === 0) {
      return fail('VALIDATION_ERROR', 'Link IDs array cannot be empty');
    }

    const uniqueIds = new Set(linkIds);
    if (uniqueIds.size !== linkIds.length) {
      return fail('VALIDATION_ERROR', 'Duplicate link IDs provided');
    }

    const result = await fromPromise(
      this.db.transaction(async (tx) => {
        for (let i = 0; i < linkIds.length; i++) {
          await tx
            .update(links)
            .set({ position: i, updatedAt: new Date() })
            .where(eq(links.id, linkIds[i]));
        }
      })
    );

    if (!isOk(result)) return result;
    return ok(undefined);
  }

  async incrementClickCount(id: string): Promise<Result<void>> {
    const result = await fromPromise(
      this.db
        .update(links)
        .set({ clickCount: sql`${links.clickCount} + 1` })
        .where(eq(links.id, id))
        .returning()
    );

    if (!isOk(result)) return result;

    if (result.data.length === 0) {
      return fail('NOT_FOUND', 'Link not found', { id });
    }

    return ok(undefined);
  }
}
