import { ok, fail, type Result } from '@aether-link/core-logic';
import type { User, NewUser } from '../schema';
import type { IUserRepository } from './IUserRepository';

export class MockUserRepository implements IUserRepository {
  private users: User[] = [];

  async findById(id: string): Promise<Result<User | null>> {
    const user = this.users.find((u) => u.id === id);
    return ok(user ?? null);
  }

  async findByEmail(email: string): Promise<Result<User | null>> {
    const user = this.users.find((u) => u.email === email.toLowerCase());
    return ok(user ?? null);
  }

  async create(data: NewUser): Promise<Result<User>> {
    const existing = this.users.find((u) => u.email === data.email.toLowerCase());
    if (existing) {
      return fail('CONFLICT', 'Email already exists');
    }

    const user: User = {
      id: crypto.randomUUID(),
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(user);
    return ok(user);
  }
}
