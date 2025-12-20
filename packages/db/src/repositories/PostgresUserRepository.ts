import { eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { ok, fail, fromPromise, isOk, type Result } from '@aether-link/core-logic';
import { users, type User, type NewUser } from '../schema';
import type { IUserRepository } from './IUserRepository';

export class PostgresUserRepository implements IUserRepository {
  constructor(private db: PostgresJsDatabase) {}

  async findById(id: string): Promise<Result<User | null>> {
    const result = await fromPromise(
      this.db.select().from(users).where(eq(users.id, id)).limit(1)
    );

    if (!isOk(result)) return result;
    return ok(result.data[0] ?? null);
  }

  async findByEmail(email: string): Promise<Result<User | null>> {
    const result = await fromPromise(
      this.db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1)
    );

    if (!isOk(result)) return result;
    return ok(result.data[0] ?? null);
  }

  async create(data: NewUser): Promise<Result<User>> {
    const result = await fromPromise(
      this.db
        .insert(users)
        .values({ ...data, email: data.email.toLowerCase() })
        .returning()
    );

    if (!isOk(result)) {
      if (result.error.message.includes('unique')) {
        return fail('CONFLICT', 'Email already exists');
      }
      return result;
    }

    if (result.data.length === 0) {
      return fail('INTERNAL_ERROR', 'Failed to create user');
    }

    return ok(result.data[0]);
  }
}
