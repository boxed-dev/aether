import type { Result } from '@aether-link/core-logic';
import type { User, NewUser } from '../schema';

export interface IUserRepository {
  findById(id: string): Promise<Result<User | null>>;
  findByEmail(email: string): Promise<Result<User | null>>;
  create(data: NewUser): Promise<Result<User>>;
}
