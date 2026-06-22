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

const assetSourceUrlSchema = z
  .string()
  .trim()
  .min(1, "Asset source is required.")
  .max(10000000)
  .refine(
    (value) =>
      value.startsWith("data:image/") ||
      value.startsWith("https://") ||
      value.startsWith("/") ||
      value.startsWith("blob:"),
    "Asset source must be a safe image URL."
  );

export const assetKindSchema = z.enum(["generated-image", "uploaded-image", "logo", "document"]);

export const assetProviderSchema = z.enum(["flux", "ideogram", "imagen", "local-image", "openai", "uploadthing"]).nullable();

export const assetCreateInputSchema = z.object({
  brandId: nullableTrimmedStringSchema,
  height: z.number().int().positive().nullable().optional(),
  kind: assetKindSchema,
  mimeType: nullableTrimmedStringSchema,
  name: z.string().trim().min(1, "Asset name is required.").max(160),
  ownerUserId: z.string().min(1),
  projectId: nullableTrimmedStringSchema,
  prompt: nullableTrimmedStringSchema,
  provider: assetProviderSchema,
  sizeBytes: z.number().int().positive().nullable().optional(),
  sourceUrl: assetSourceUrlSchema,
  width: z.number().int().positive().nullable().optional()
});

export const generatedImageAssetCreateInputSchema = assetCreateInputSchema.extend({
  kind: z.literal("generated-image"),
  mimeType: z.enum(["image/jpeg", "image/png", "image/svg+xml", "image/webp"]),
  provider: z.enum(["flux", "ideogram", "imagen", "local-image", "openai"])
});

export const assetSchema = z.object({
  brandId: z.string().nullable(),
  brandName: z.string().nullable(),
  createdAt: z.date(),
  height: z.number().int().positive().nullable(),
  id: z.string().min(1),
  kind: assetKindSchema,
  mimeType: z.string().nullable(),
  name: z.string().min(1),
  ownerUserId: z.string().min(1),
  projectId: z.string().nullable(),
  projectTitle: z.string().nullable(),
  prompt: z.string().nullable(),
  provider: assetProviderSchema,
  sizeBytes: z.number().int().positive().nullable(),
  sourceUrl: assetSourceUrlSchema,
  updatedAt: z.date(),
  width: z.number().int().positive().nullable()
});
