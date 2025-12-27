import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {
  PostgresUserRepository,
  PostgresProfileRepository,
  PostgresLinkRepository,
  MockUserRepository,
  MockProfileRepository,
  MockLinkRepository,
  type IUserRepository,
  type IProfileRepository,
  type ILinkRepository,
} from '@aether-link/db';
import { ProfileService, LinkService } from './services';
import { AuthService } from './services/AuthService';

type Container = {
  userRepo: IUserRepository;
  profileRepo: IProfileRepository;
  linkRepo: ILinkRepository;
  authService: AuthService;
  profileService: ProfileService;
  linkService: LinkService;
};

let container: Container | null = null;

export function getContainer(): Container {
  if (container) return container;

  const isTest = process.env.NODE_ENV === 'test';
  const databaseUrl = process.env.DATABASE_URL;

  if (isTest || !databaseUrl) {
    const userRepo = new MockUserRepository();
    const profileRepo = new MockProfileRepository();
    const linkRepo = new MockLinkRepository();

    container = {
      userRepo,
      profileRepo,
      linkRepo,
      authService: new AuthService(userRepo),
      profileService: new ProfileService(profileRepo),
      linkService: new LinkService(linkRepo, profileRepo),
    };
  } else {
    // Configure connection pool for production
    const client = postgres(databaseUrl, {
      max: 10, // Maximum pool size
      idle_timeout: 20, // Idle connection timeout in seconds
      connect_timeout: 10, // Connection timeout in seconds
      max_lifetime: 60 * 30, // Maximum lifetime of connection in seconds (30 minutes)
    });
    const db = drizzle(client);

    const userRepo = new PostgresUserRepository(db);
    const profileRepo = new PostgresProfileRepository(db);
    const linkRepo = new PostgresLinkRepository(db);

    container = {
      userRepo,
      profileRepo,
      linkRepo,
      authService: new AuthService(userRepo),
      profileService: new ProfileService(profileRepo),
      linkService: new LinkService(linkRepo, profileRepo),
    };
  }

  return container;
}

export function resetContainer(): void {
  container = null;
}
