import type { Result } from '@aether-link/core-logic';
import type { Link, NewLink } from '../schema';

export interface ILinkRepository {
  findById(id: string): Promise<Result<Link | null>>;
  findByProfileId(profileId: string): Promise<Result<Link[]>>;
  create(data: NewLink): Promise<Result<Link>>;
  update(id: string, data: Partial<NewLink>): Promise<Result<Link>>;
  delete(id: string): Promise<Result<void>>;
  reorder(profileId: string, linkIds: string[]): Promise<Result<void>>;
  incrementClickCount(id: string): Promise<Result<void>>;
}
