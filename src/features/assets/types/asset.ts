import type { z } from "zod";

import type {
  assetCreateInputSchema,
  assetSchema,
  generatedImageAssetCreateInputSchema
} from "../schemas/asset.schema";

export type Asset = z.infer<typeof assetSchema>;
export type AssetCreateInput = z.infer<typeof assetCreateInputSchema>;
export type GeneratedImageAssetCreateInput = z.infer<typeof generatedImageAssetCreateInputSchema>;

export type AssetListResult =
  | {
      assets: Asset[];
      ok: true;
      status: "ready";
    }
  | {
      error: {
        code: "asset_repository_error" | "asset_repository_unavailable";
        message: string;
      };
      ok: false;
      status: "failed";
    };

export type AssetCreateResult =
  | {
      asset: Asset;
      ok: true;
      status: "created";
    }
  | {
      error: {
        code: "asset_repository_error" | "asset_repository_unavailable" | "invalid_asset_input";
        fieldErrors?: Record<string, string[] | undefined>;
        message: string;
      };
      ok: false;
      status: "failed";
    };

export type AssetRepository = {
  create(input: AssetCreateInput): Promise<Asset>;
  listByOwnerUserId(ownerUserId: string): Promise<Asset[]>;
};
