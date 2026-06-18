import type { z } from "zod";

import type {
  brandCreateForUserInputSchema,
  brandCreateInputSchema,
  brandSchema
} from "../schemas/brand.schema";

export type Brand = z.infer<typeof brandSchema>;
export type BrandCreateInput = z.input<typeof brandCreateInputSchema>;
export type BrandCreateForUserInput = z.infer<typeof brandCreateForUserInputSchema>;

export type BrandCreateResult =
  | {
      brand: Brand;
      ok: true;
      status: "created";
    }
  | {
      error: {
        code: "invalid_brand_input" | "repository_error";
        fieldErrors?: Partial<Record<keyof BrandCreateInput, string[]>>;
        message: string;
      };
      ok: false;
      status: "failed";
    };

export type BrandRepository = {
  create(input: BrandCreateForUserInput): Promise<Brand>;
  listByOwnerUserId(ownerUserId: string): Promise<Brand[]>;
};
