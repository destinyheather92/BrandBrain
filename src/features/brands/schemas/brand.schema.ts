import { z } from "zod";

const nullableTrimmedStringSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (typeof value !== "string") {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  });

const nullableUrlSchema = nullableTrimmedStringSchema.pipe(
  z.union([z.string().url("Website URL must be a valid URL."), z.null()])
);

export const brandCreateInputSchema = z.object({
  description: nullableTrimmedStringSchema,
  industry: nullableTrimmedStringSchema,
  name: z.string().trim().min(1, "Brand name is required.").max(120),
  websiteUrl: nullableUrlSchema
});

export const brandCreateForUserInputSchema = brandCreateInputSchema.extend({
  ownerUserId: z.string().min(1)
});

export const brandSchema = z.object({
  createdAt: z.date(),
  description: z.string().nullable(),
  id: z.string().min(1),
  industry: z.string().nullable(),
  name: z.string().min(1),
  ownerUserId: z.string().min(1),
  updatedAt: z.date(),
  websiteUrl: z.string().url().nullable()
});
