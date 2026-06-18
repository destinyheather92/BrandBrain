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
    audience: null,
    brandId: brand.id,
    brandRules: brand.industry ? `Stay relevant to ${brand.industry}.` : null,
    notes: brand.websiteUrl ? `Website: ${brand.websiteUrl}` : null,
    preferredCtas: null,
    productsServices: brand.description,
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

    const memory = await repository.create(buildInitialMemoryInput(brand));

    return {
      memory,
      ok: true,
      status: "ready"
    };
  } catch {
    return repositoryError();
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
  } catch {
    return repositoryError();
  }
}
