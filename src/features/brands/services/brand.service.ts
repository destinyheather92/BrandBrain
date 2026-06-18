import { brandCreateForUserInputSchema, brandCreateInputSchema } from "../schemas/brand.schema";
import type { BrandCreateInput, BrandCreateResult, BrandRepository } from "../types/brand";

type CreateBrandForUserParams = {
  input: BrandCreateInput;
  ownerUserId: string;
  repository: BrandRepository;
};

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
  } catch {
    return {
      error: {
        code: "repository_error",
        message: "Brand creation failed."
      },
      ok: false,
      status: "failed"
    };
  }
}
