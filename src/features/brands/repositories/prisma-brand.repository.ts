import type { PrismaClient } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";

import { brandSchema } from "../schemas/brand.schema";
import type { Brand, BrandCreateForUserInput, BrandRepository } from "../types/brand";

export class PrismaBrandRepository implements BrandRepository {
  constructor(private readonly client: PrismaClient) {}

  async create(input: BrandCreateForUserInput): Promise<Brand> {
    const brand = await this.client.brand.create({
      data: input
    });

    return brandSchema.parse(brand);
  }

  async findByIdForOwner(brandId: string, ownerUserId: string): Promise<Brand | null> {
    const brand = await this.client.brand.findFirst({
      where: {
        id: brandId,
        ownerUserId
      }
    });

    return brand ? brandSchema.parse(brand) : null;
  }

  async listByOwnerUserId(ownerUserId: string): Promise<Brand[]> {
    const brands = await this.client.brand.findMany({
      orderBy: {
        createdAt: "desc"
      },
      where: {
        ownerUserId
      }
    });

    return brands.map((brand) => brandSchema.parse(brand));
  }
}

export function createPrismaBrandRepository(): BrandRepository {
  return new PrismaBrandRepository(getPrisma());
}
