import type { Brand } from "../types/brand";
import type {
  BrandMemoryCreateInput,
  BrandMemoryRepository,
  BrandMemoryResult,
  BrandMemoryUpdateFormInput
} from "../types/brand-memory";
import { brandMemoryCreateInputSchema, brandMemoryUpdateInputSchema } from "../schemas/brand-memory.schema";

type GetOrCreateBrandMemoryForBrandParams = {
  brand: Brand;
  repository: BrandMemoryRepository;
};

type UpdateBrandMemoryForBrandParams = {
  brandId: string;
  input: BrandMemoryUpdateFormInput;
  repository: BrandMemoryRepository;
};

function buildInitialMemoryInput(brand: Brand): BrandMemoryCreateInput {
  return brandMemoryCreateInputSchema.parse({
    accentColor: null,
    audience: null,
    backgroundColor: null,
    brandId: brand.id,
    brandRules: brand.industry ? `Stay relevant to ${brand.industry}.` : null,
    notes: brand.websiteUrl ? `Website: ${brand.websiteUrl}` : null,
    preferredCtas: null,
    primaryColor: null,
    productsServices: brand.description,
    textColor: null,
    voice: null
  });
}

function repositoryError(): BrandMemoryResult {
  return {
    error: {
      code: "brand_memory_repository_error",
      message: "Brand memory could not be saved."
    },
    ok: false,
    status: "failed"
  };
}

function repositoryUnavailableError(): BrandMemoryResult {
  return {
    error: {
      code: "brand_memory_repository_unavailable",
      message: "Brand memory storage is not loaded. Restart the local server and try again."
    },
    ok: false,
    status: "failed"
  };
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

function isStalePrismaClientError(error: unknown): boolean {
  if (!(error instanceof TypeError)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes("cannot read properties of undefined") &&
    (message.includes("findunique") || message.includes("create") || message.includes("update"))
  );
}

function repositoryFailure(error: unknown): BrandMemoryResult {
  if (isStalePrismaClientError(error)) {
    return repositoryUnavailableError();
  }

  console.error("Brand memory repository failed.", error);

  return repositoryError();
}

export async function getOrCreateBrandMemoryForBrand({
  brand,
  repository
}: GetOrCreateBrandMemoryForBrandParams): Promise<BrandMemoryResult> {
  try {
    const existingMemory = await repository.getByBrandId(brand.id);

    if (existingMemory) {
      return {
        memory: existingMemory,
        ok: true,
        status: "ready"
      };
    }

    const memory = await repository.create(buildInitialMemoryInput(brand)).catch(async (error: unknown) => {
      if (!isUniqueConstraintError(error)) {
        throw error;
      }

      const memoryCreatedByConcurrentRequest = await repository.getByBrandId(brand.id);

      if (!memoryCreatedByConcurrentRequest) {
        throw error;
      }

      return memoryCreatedByConcurrentRequest;
    });

    return {
      memory,
      ok: true,
      status: "ready"
    };
  } catch (error) {
    return repositoryFailure(error);
  }
}

export async function updateBrandMemoryForBrand({
  brandId,
  input,
  repository
}: UpdateBrandMemoryForBrandParams): Promise<BrandMemoryResult> {
  const parsed = brandMemoryUpdateInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: {
        code: "invalid_brand_memory_input",
        fieldErrors: parsed.error.flatten().fieldErrors,
        message: "Check the memory fields and try again."
      },
      ok: false,
      status: "failed"
    };
  }

  try {
    const memory = await repository.update(brandId, parsed.data);

    return {
      memory,
      ok: true,
      status: "saved"
    };
  } catch (error) {
    return repositoryFailure(error);
  }
}
