import { z } from "zod";

import {
  canvasDocumentFormatSchema,
  canvasDocumentSchema
} from "@/features/canvas/schemas/canvas-object.schema";

export const contentProjectStatusSchema = z.enum(["draft", "ready", "archived"]);

export const contentProjectCreateInputSchema = z.object({
  brandId: z.string().trim().min(1, "Choose a brand."),
  format: canvasDocumentFormatSchema.default("instagram-carousel"),
  title: z.string().trim().min(1, "Project title is required.").max(160)
});

export const contentProjectCreateForUserInputSchema = contentProjectCreateInputSchema.extend({
  canvasJson: canvasDocumentSchema,
  ownerUserId: z.string().min(1),
  status: contentProjectStatusSchema.default("draft")
});

export const contentProjectSchema = z.object({
  brandId: z.string().min(1),
  brandName: z.string().min(1),
  canvasJson: canvasDocumentSchema,
  createdAt: z.date(),
  format: canvasDocumentFormatSchema,
  id: z.string().min(1),
  ownerUserId: z.string().min(1),
  status: contentProjectStatusSchema,
  title: z.string().min(1),
  updatedAt: z.date()
});
