import type { Result } from '@aether-link/core-logic';
import type { Profile, NewProfile } from '../schema';

export interface IProfileRepository {
  findById(id: string): Promise<Result<Profile | null>>;
  findByHandle(handle: string): Promise<Result<Profile | null>>;
  findByUserId(userId: string): Promise<Result<Profile | null>>;
  create(data: NewProfile): Promise<Result<Profile>>;
  update(id: string, data: Partial<NewProfile>): Promise<Result<Profile>>;
  delete(id: string): Promise<Result<void>>;
  handleExists(handle: string): Promise<Result<boolean>>;
}
