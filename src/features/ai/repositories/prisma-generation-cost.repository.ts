import type { PrismaClient } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";

import type { GenerationCostCreateInput, GenerationCostRepository } from "../types/ai-generation";

export class PrismaGenerationCostRepository implements GenerationCostRepository {
  constructor(private readonly client: PrismaClient) {}

  async create(input: GenerationCostCreateInput): Promise<void> {
    await this.client.generationCost.create({
      data: input
    });
  }
}

export function createPrismaGenerationCostRepository(): GenerationCostRepository {
  return new PrismaGenerationCostRepository(getPrisma());
}
