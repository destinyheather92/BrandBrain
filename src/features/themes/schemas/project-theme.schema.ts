import { z } from "zod";

const projectThemeIdSchema = z.string().trim().min(1);
const projectThemeColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Use a 6-digit hex color.");

export const projectThemePaletteSchema = z
  .object({
    accent: projectThemeColorSchema,
    background: projectThemeColorSchema,
    ctaText: projectThemeColorSchema,
    primary: projectThemeColorSchema,
    secondary: projectThemeColorSchema,
    surface: projectThemeColorSchema,
    text: projectThemeColorSchema
  })
  .strict();

export const projectThemeTypographySchema = z
  .object({
    body: z.string().trim().min(1).max(120),
    bodyWeight: z.enum(["regular", "medium", "semibold", "bold"]),
    heading: z.string().trim().min(1).max(120),
    headingWeight: z.enum(["regular", "medium", "semibold", "bold"])
  })
  .strict();

export const projectThemeLayoutSchema = z
  .object({
    density: z.enum(["compact", "editorial", "spacious"]),
    heroTreatment: z.enum(["large-headline-left", "centered-statement", "split-proof"]),
    spacingScale: z.enum(["tight", "comfortable", "generous"])
  })
  .strict();

export const projectThemeUpsertInputSchema = z
  .object({
    brandId: projectThemeIdSchema,
    id: projectThemeIdSchema,
    imageStyle: z.string().trim().min(1).max(500),
    layout: projectThemeLayoutSchema,
    name: z.string().trim().min(1).max(160),
    ownerUserId: projectThemeIdSchema,
    palette: projectThemePaletteSchema,
    projectId: projectThemeIdSchema,
    typography: projectThemeTypographySchema
  })
  .strict();

export const projectThemeSchema = projectThemeUpsertInputSchema.extend({
  createdAt: z.date(),
  updatedAt: z.date()
});
