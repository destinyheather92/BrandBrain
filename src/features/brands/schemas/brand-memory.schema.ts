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

const nullableMemoryColorSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (typeof value !== "string") {
      return null;
    }

    const trimmed = value.trim();

    return trimmed.length > 0 ? trimmed.toUpperCase() : null;
  })
  .pipe(z.string().regex(/^#[0-9A-F]{6}$/, "Use a 6-digit hex color.").nullable())
  .optional()
  .transform((value) => value ?? null);

export const brandMemoryUpdateInputSchema = z.object({
  accentColor: nullableMemoryColorSchema,
  audience: nullableMemoryTextSchema,
  backgroundColor: nullableMemoryColorSchema,
  brandRules: nullableMemoryTextSchema,
  notes: nullableMemoryTextSchema,
  preferredCtas: nullableMemoryTextSchema,
  primaryColor: nullableMemoryColorSchema,
  productsServices: nullableMemoryTextSchema,
  textColor: nullableMemoryColorSchema,
  voice: nullableMemoryTextSchema
});

export const brandMemoryCreateInputSchema = brandMemoryUpdateInputSchema.extend({
  brandId: z.string().min(1)
});

export const brandMemorySchema = z.object({
  accentColor: nullableMemoryColorSchema,
  audience: z.string().nullable(),
  backgroundColor: nullableMemoryColorSchema,
  brandId: z.string().min(1),
  brandRules: z.string().nullable(),
  createdAt: z.date(),
  id: z.string().min(1),
  notes: z.string().nullable(),
  preferredCtas: z.string().nullable(),
  primaryColor: nullableMemoryColorSchema,
  productsServices: z.string().nullable(),
  textColor: nullableMemoryColorSchema,
  updatedAt: z.date(),
  voice: z.string().nullable()
});
