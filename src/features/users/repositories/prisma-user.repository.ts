import type { PrismaClient } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";

import { localUserSchema } from "../schemas/local-user.schema";
import type { LocalUser, LocalUserUpsertInput, UserRepository } from "../types/user";

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly client: PrismaClient) {}

  async upsertFromClerk(input: LocalUserUpsertInput): Promise<LocalUser> {
    const user = await this.client.user.upsert({
      create: input,
      update: {
        email: input.email,
        firstName: input.firstName,
        imageUrl: input.imageUrl,
        lastName: input.lastName,
        name: input.name
      },
      where: {
        clerkUserId: input.clerkUserId
      }
    });

    return localUserSchema.parse(user);
  }
}

export function createPrismaUserRepository(): UserRepository {
  return new PrismaUserRepository(getPrisma());
}
