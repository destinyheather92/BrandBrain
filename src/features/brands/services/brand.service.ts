import { brandCreateForUserInputSchema, brandCreateInputSchema } from "../schemas/brand.schema";
import type { BrandCreateInput, BrandCreateResult, BrandRepository } from "../types/brand";

type CreateBrandForUserParams = {
  input: BrandCreateInput;
  ownerUserId: string;
  repository: BrandRepository;
};

function isPrismaErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === code
  );
}

function isMissingPrismaDelegateError(error: unknown): boolean {
  return (
    error instanceof TypeError &&
    error.message.includes("Cannot read properties of undefined")
  );
}

function mapRepositoryError(error: unknown): BrandCreateResult {
  if (isPrismaErrorCode(error, "P2002")) {
    return {
      error: {
        code: "duplicate_brand_name",
        fieldErrors: {
          name: ["You already have a brand with this name."]
        },
        message: "A brand with this name already exists."
      },
      ok: false,
      status: "failed"
    };
  }

  if (isMissingPrismaDelegateError(error)) {
    return {
      error: {
        code: "repository_unavailable",
        message: "Brand storage is not loaded. Restart the local server and try again."
      },
      ok: false,
      status: "failed"
    };
  }

  return {
    error: {
      code: "repository_error",
      message: "Brand creation failed."
    },
    ok: false,
    status: "failed"
  };
}

export async function createBrandForUser({
  input,
  ownerUserId,
  repository
}: CreateBrandForUserParams): Promise<BrandCreateResult> {
  const parsed = brandCreateInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: {
        code: "invalid_brand_input",
        fieldErrors: parsed.error.flatten().fieldErrors,
        message: "Check the brand details and try again."
      },
      ok: false,
      status: "failed"
    };
  }

  const createInput = brandCreateForUserInputSchema.parse({
    ...parsed.data,
    ownerUserId
  });

  try {
    const brand = await repository.create(createInput);

    return {
      brand,
      ok: true,
      status: "created"
    };
  } catch (error) {
    return mapRepositoryError(error);
  }
}
