import {
  assetCreateInputSchema,
  generatedImageAssetCreateInputSchema
} from "../schemas/asset.schema";
import type {
  AssetCreateResult,
  AssetListResult,
  AssetRepository,
  GeneratedImageAssetCreateInput
} from "../types/asset";

type ListAssetsForUserParams = {
  assetRepository: AssetRepository;
  ownerUserId: string;
};

type CreateGeneratedImageAssetForUserParams = {
  assetRepository: AssetRepository;
  input: Omit<GeneratedImageAssetCreateInput, "kind" | "mimeType">;
};

function isMissingPrismaDelegateError(error: unknown): boolean {
  return error instanceof TypeError && error.message.includes("Cannot read properties of undefined");
}

export async function listAssetsForUser({
  assetRepository,
  ownerUserId
}: ListAssetsForUserParams): Promise<AssetListResult> {
  try {
    const assets = await assetRepository.listByOwnerUserId(ownerUserId);

    return {
      assets,
      ok: true,
      status: "ready"
    };
  } catch (error) {
    return mapListRepositoryError(error);
  }
}

export async function createGeneratedImageAssetForUser({
  assetRepository,
  input
}: CreateGeneratedImageAssetForUserParams): Promise<AssetCreateResult> {
  const parsed = generatedImageAssetCreateInputSchema.safeParse({
    ...input,
    kind: "generated-image",
    mimeType: "image/svg+xml"
  });

  if (!parsed.success) {
    return {
      error: {
        code: "invalid_asset_input",
        fieldErrors: parsed.error.flatten().fieldErrors,
        message: "Asset details could not be saved."
      },
      ok: false,
      status: "failed"
    };
  }

  try {
    const createInput = assetCreateInputSchema.parse(parsed.data);
    const asset = await assetRepository.create(createInput);

    return {
      asset,
      ok: true,
      status: "created"
    };
  } catch (error) {
    return mapCreateRepositoryError(error);
  }
}

function mapListRepositoryError(error: unknown): AssetListResult {
  if (isMissingPrismaDelegateError(error)) {
    return {
      error: {
        code: "asset_repository_unavailable",
        message: "Asset storage is not loaded. Restart the local server and try again."
      },
      ok: false,
      status: "failed"
    };
  }

  console.error("Asset listing failed.", error);

  return {
    error: {
      code: "asset_repository_error",
      message: "Assets could not be loaded."
    },
    ok: false,
    status: "failed"
  };
}

function mapCreateRepositoryError(error: unknown): AssetCreateResult {
  if (isMissingPrismaDelegateError(error)) {
    return {
      error: {
        code: "asset_repository_unavailable",
        message: "Asset storage is not loaded. Restart the local server and try again."
      },
      ok: false,
      status: "failed"
    };
  }

  console.error("Asset create failed.", error);

  return {
    error: {
      code: "asset_repository_error",
      message: "Asset could not be saved."
    },
    ok: false,
    status: "failed"
  };
}
