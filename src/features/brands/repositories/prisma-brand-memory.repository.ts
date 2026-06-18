import type { PrismaClient } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";

import { brandMemorySchema } from "../schemas/brand-memory.schema";
import type {
  BrandMemory,
  BrandMemoryCreateInput,
  BrandMemoryRepository,
  BrandMemoryUpdateInput
} from "../types/brand-memory";

export class PrismaBrandMemoryRepository implements BrandMemoryRepository {
  constructor(private readonly client: PrismaClient) {}

  async create(input: BrandMemoryCreateInput): Promise<BrandMemory> {
    const memory = await this.client.brandMemory.create({
      data: input
    });

    return brandMemorySchema.parse(memory);
  }

  async getByBrandId(brandId: string): Promise<BrandMemory | null> {
    const memory = await this.client.brandMemory.findUnique({
      where: {
        brandId
      }
    });

    return memory ? brandMemorySchema.parse(memory) : null;
  }

  async update(brandId: string, input: BrandMemoryUpdateInput): Promise<BrandMemory> {
    const memory = await this.client.brandMemory.update({
      data: input,
      where: {
        brandId
      }
    });

    return brandMemorySchema.parse(memory);
  }
}

export function createPrismaBrandMemoryRepository(): BrandMemoryRepository {
  return new PrismaBrandMemoryRepository(getPrisma());
}
