import { z } from 'zod';
import { ok, fail, isOk, type Result } from '@aether-link/core-logic';
import type { IProfileRepository, Profile } from '@aether-link/db';

const createProfileSchema = z.object({
  userId: z.string().min(1),
  handle: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Handle can only contain letters, numbers, underscores, and hyphens'),
  displayName: z.string().min(1).max(100),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
});

const updateProfileSchema = z.object({
  handle: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .optional(),
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  isPublic: z.boolean().optional(),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export class ProfileService {
  constructor(private profileRepo: IProfileRepository) {}

  async createProfile(input: CreateProfileInput): Promise<Result<Profile>> {
    const validation = createProfileSchema.safeParse(input);
    if (!validation.success) {
      return fail('VALIDATION_ERROR', 'Invalid profile data', {
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const existingUser = await this.profileRepo.findByUserId(input.userId);
    if (isOk(existingUser) && existingUser.data) {
      return fail('CONFLICT', 'User already has a profile');
    }

    const handleExists = await this.profileRepo.handleExists(input.handle);
    if (isOk(handleExists) && handleExists.data) {
      return fail('CONFLICT', 'Handle is already taken', { handle: input.handle });
    }

    return this.profileRepo.create({
      userId: input.userId,
      handle: input.handle,
      displayName: input.displayName,
      bio: input.bio,
      avatarUrl: input.avatarUrl,
    });
  }

  async getProfileByHandle(handle: string): Promise<Result<Profile | null>> {
    return this.profileRepo.findByHandle(handle);
  }

  async getProfileById(id: string): Promise<Result<Profile | null>> {
    return this.profileRepo.findById(id);
  }

  async getProfileByUserId(userId: string): Promise<Result<Profile | null>> {
    return this.profileRepo.findByUserId(userId);
  }

  async updateProfile(id: string, input: UpdateProfileInput): Promise<Result<Profile>> {
    const validation = updateProfileSchema.safeParse(input);
    if (!validation.success) {
      return fail('VALIDATION_ERROR', 'Invalid update data', {
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const existing = await this.profileRepo.findById(id);
    if (!isOk(existing) || !existing.data) {
      return fail('NOT_FOUND', 'Profile not found');
    }

    if (input.handle && input.handle.toLowerCase() !== existing.data.handle.toLowerCase()) {
      const handleExists = await this.profileRepo.handleExists(input.handle);
      if (isOk(handleExists) && handleExists.data) {
        return fail('CONFLICT', 'Handle is already taken', { handle: input.handle });
      }
    }

    return this.profileRepo.update(id, validation.data);
  }

  async deleteProfile(id: string): Promise<Result<void>> {
    return this.profileRepo.delete(id);
  }

  async checkHandleAvailability(handle: string): Promise<Result<boolean>> {
    const handleExists = await this.profileRepo.handleExists(handle);
    if (!isOk(handleExists)) return handleExists;
    return ok(!handleExists.data);
  }
}
