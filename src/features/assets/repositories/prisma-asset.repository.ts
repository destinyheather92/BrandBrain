import type { PrismaClient } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";

import { assetSchema } from "../schemas/asset.schema";
import type { Asset, AssetCreateInput, AssetRepository } from "../types/asset";

type AssetWithRelations = {
  brand: {
    name: string;
  } | null;
  brandId: string | null;
  createdAt: Date;
  height: number | null;
  id: string;
  kind: string;
  mimeType: string | null;
  name: string;
  ownerUserId: string;
  project: {
    title: string;
  } | null;
  projectId: string | null;
  prompt: string | null;
  provider: string | null;
  sizeBytes: number | null;
  sourceUrl: string;
  updatedAt: Date;
  width: number | null;
};

export class PrismaAssetRepository implements AssetRepository {
  constructor(private readonly client: PrismaClient) {}

  async create(input: AssetCreateInput): Promise<Asset> {
    const asset = await this.client.asset.create({
      data: {
        brandId: input.brandId,
        height: input.height ?? null,
        kind: input.kind,
        mimeType: input.mimeType,
        name: input.name,
        ownerUserId: input.ownerUserId,
        projectId: input.projectId,
        prompt: input.prompt,
        provider: input.provider,
        sizeBytes: input.sizeBytes ?? null,
        sourceUrl: input.sourceUrl,
        width: input.width ?? null
      },
      include: assetIncludes
    });

    return parseAsset(asset);
  }

  async listByOwnerUserId(ownerUserId: string): Promise<Asset[]> {
    const assets = await this.client.asset.findMany({
      include: assetIncludes,
      orderBy: {
        createdAt: "desc"
      },
      where: {
        ownerUserId
      }
    });

    return assets.map((asset) => parseAsset(asset));
  }
}

export function createPrismaAssetRepository(): AssetRepository {
  return new PrismaAssetRepository(getPrisma());
}

const assetIncludes = {
  brand: {
    select: {
      name: true
    }
  },
  project: {
    select: {
      title: true
    }
  }
} as const;

function parseAsset(asset: AssetWithRelations): Asset {
  return assetSchema.parse({
    ...asset,
    brandName: asset.brand?.name ?? null,
    projectTitle: asset.project?.title ?? null
  });
}
