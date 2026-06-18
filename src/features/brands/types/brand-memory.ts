import type { z } from "zod";

import type {
  brandMemoryCreateInputSchema,
  brandMemorySchema,
  brandMemoryUpdateInputSchema
} from "../schemas/brand-memory.schema";

export type BrandMemory = z.infer<typeof brandMemorySchema>;
export type BrandMemoryCreateInput = z.infer<typeof brandMemoryCreateInputSchema>;
export type BrandMemoryUpdateInput = z.infer<typeof brandMemoryUpdateInputSchema>;
export type BrandMemoryUpdateFormInput = z.input<typeof brandMemoryUpdateInputSchema>;

export type BrandMemoryResult =
  | {
      memory: BrandMemory;
      ok: true;
      status: "ready" | "saved";
    }
  | {
      error: {
        code: "brand_memory_repository_error" | "invalid_brand_memory_input";
        fieldErrors?: Partial<Record<keyof BrandMemoryUpdateFormInput, string[]>>;
        message: string;
      };
      ok: false;
      status: "failed";
    };

export type BrandMemoryRepository = {
  create(input: BrandMemoryCreateInput): Promise<BrandMemory>;
  getByBrandId(brandId: string): Promise<BrandMemory | null>;
  update(brandId: string, input: BrandMemoryUpdateInput): Promise<BrandMemory>;
};
