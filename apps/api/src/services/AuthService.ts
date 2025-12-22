import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { ok, fail, isOk, type Result } from '@aether-link/core-logic';
import type { IUserRepository, User } from '@aether-link/db';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export class AuthService {
  constructor(private userRepo: IUserRepository) {}

  async register(input: RegisterInput): Promise<Result<Omit<User, 'passwordHash'>>> {
    const validation = registerSchema.safeParse(input);
    if (!validation.success) {
      return fail('VALIDATION_ERROR', 'Invalid registration data', {
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const existing = await this.userRepo.findByEmail(input.email);
    if (isOk(existing) && existing.data) {
      return fail('CONFLICT', 'Email already registered');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const result = await this.userRepo.create({
      email: input.email,
      passwordHash,
    });

    if (!isOk(result)) return result;

    const { passwordHash: _, ...userWithoutPassword } = result.data;
    return ok(userWithoutPassword);
  }

  async getUserByEmail(email: string): Promise<Result<User | null>> {
    return this.userRepo.findByEmail(email);
  }

  async getUserById(id: string): Promise<Result<User | null>> {
    return this.userRepo.findById(id);
  }
}
