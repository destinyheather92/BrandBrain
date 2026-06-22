import { describe, expect, it, vi } from "vitest";

import {
  createGeneratedImageAssetForUser,
  listAssetsForUser
} from "../services/asset-library.service";
import type { Asset, AssetRepository } from "../types/asset";

const createdAt = new Date("2026-06-21T10:00:00.000Z");
const asset: Asset = {
  brandId: "brand_1",
  brandName: "Land Strong",
  createdAt,
  height: 520,
  id: "asset_1",
  kind: "generated-image",
  mimeType: "image/svg+xml",
  name: "Freshly graded land at sunrise",
  ownerUserId: "user_1",
  projectId: "project_1",
  projectTitle: "Spring Land Prep Carousel",
  prompt: "Generate marketing photography of freshly graded land at sunrise.",
  provider: "flux",
  sizeBytes: null,
  sourceUrl: "data:image/svg+xml,%3Csvg%3E%3C/svg%3E",
  updatedAt: createdAt,
  width: 888
};

function createAssetRepository(overrides: Partial<AssetRepository> = {}): AssetRepository {
  return {
    create: vi.fn().mockResolvedValue(asset),
    listByOwnerUserId: vi.fn().mockResolvedValue([asset]),
    ...overrides
  };
}

describe("asset library service", () => {
  it("lists assets owned by the current user", async () => {
    const assetRepository = createAssetRepository();

    const result = await listAssetsForUser({
      assetRepository,
      ownerUserId: "user_1"
    });

    expect(result).toEqual({
      assets: [asset],
      ok: true,
      status: "ready"
    });
    expect(assetRepository.listByOwnerUserId).toHaveBeenCalledWith("user_1");
  });

  it("records a generated image asset with provider and project metadata", async () => {
    const assetRepository = createAssetRepository();

    const result = await createGeneratedImageAssetForUser({
      assetRepository,
      input: {
        brandId: "brand_1",
        height: 520,
        name: "Freshly graded land at sunrise",
        ownerUserId: "user_1",
        projectId: "project_1",
        prompt: "Generate marketing photography of freshly graded land at sunrise.",
        provider: "flux",
        sourceUrl: "data:image/svg+xml,%3Csvg%3E%3C/svg%3E",
        width: 888
      }
    });

    expect(result).toEqual({
      asset,
      ok: true,
      status: "created"
    });
    expect(assetRepository.create).toHaveBeenCalledWith({
      brandId: "brand_1",
      height: 520,
      kind: "generated-image",
      mimeType: "image/svg+xml",
      name: "Freshly graded land at sunrise",
      ownerUserId: "user_1",
      projectId: "project_1",
      prompt: "Generate marketing photography of freshly graded land at sunrise.",
      provider: "flux",
      sourceUrl: "data:image/svg+xml,%3Csvg%3E%3C/svg%3E",
      width: 888
    });
  });
});
