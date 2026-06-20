import { z } from "zod";

import { canvasDocumentSchema } from "@/features/canvas/schemas/canvas-object.schema";

export const contentTemplateSchema = z
  .object({
    canvasJson: canvasDocumentSchema,
    category: z.string().trim().min(1).max(80),
    description: z.string().trim().min(1).max(240),
    id: z.string().trim().min(1).max(120),
    name: z.string().trim().min(1).max(120),
    recommendedUse: z.string().trim().min(1).max(160)
  })
  .strict();

export const templateProjectCreateInputSchema = z.object({
  brandId: z.string().trim().min(1, "Choose a brand."),
  templateId: z.string().trim().min(1, "Choose a template."),
  title: z.string().trim().min(1, "Project title is required.").max(160)
});
