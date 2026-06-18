import { z } from "zod";

const nullableMemoryTextSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (typeof value !== "string") {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  })
  .pipe(z.string().max(2000, "Keep this under 2000 characters.").nullable());

export const brandMemoryUpdateInputSchema = z.object({
  audience: nullableMemoryTextSchema,
  brandRules: nullableMemoryTextSchema,
  notes: nullableMemoryTextSchema,
  preferredCtas: nullableMemoryTextSchema,
  productsServices: nullableMemoryTextSchema,
  voice: nullableMemoryTextSchema
});

export const brandMemoryCreateInputSchema = brandMemoryUpdateInputSchema.extend({
  brandId: z.string().min(1)
});

export const brandMemorySchema = z.object({
  audience: z.string().nullable(),
  brandId: z.string().min(1),
  brandRules: z.string().nullable(),
  createdAt: z.date(),
  id: z.string().min(1),
  notes: z.string().nullable(),
  preferredCtas: z.string().nullable(),
  productsServices: z.string().nullable(),
  updatedAt: z.date(),
  voice: z.string().nullable()
});
