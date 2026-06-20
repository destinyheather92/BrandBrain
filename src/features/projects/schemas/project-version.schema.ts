import { z } from "zod";

import { canvasDocumentSchema } from "@/features/canvas/schemas/canvas-object.schema";

export const projectVersionSourceSchema = z.enum(["autosave", "manual-save", "version-restore"]);

export const projectVersionSchema = z.object({
  canvasJson: canvasDocumentSchema,
  createdAt: z.date(),
  id: z.string().min(1),
  ownerUserId: z.string().min(1),
  projectId: z.string().min(1),
  source: projectVersionSourceSchema,
  versionNumber: z.number().int().positive()
});

export const projectVersionCreateInputSchema = z.object({
  canvasJson: canvasDocumentSchema,
  ownerUserId: z.string().min(1),
  projectId: z.string().min(1),
  source: projectVersionSourceSchema
});
