import { z } from "zod";

const canvasIdSchema = z.string().trim().min(1);
const canvasColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Use a 6-digit hex color.");
const canvasCoordinateSchema = z.number().finite().min(-10000).max(10000);
const canvasLengthSchema = z.number().finite().positive().max(10000);
const canvasOpacitySchema = z.number().finite().min(0).max(1);
const canvasRotationSchema = z.number().finite().min(-360).max(360);
const canvasImageSourceSchema = z
  .string()
  .trim()
  .min(1)
  .max(10000000)
  .refine(
    (value) =>
      value.startsWith("data:image/") ||
      value.startsWith("https://") ||
      value.startsWith("/") ||
      value.startsWith("blob:"),
    "Image source must be a safe image URL."
  );

const baseCanvasElementSchema = z
  .object({
    height: canvasLengthSchema,
    id: canvasIdSchema,
    locked: z.boolean(),
    opacity: canvasOpacitySchema,
    rotation: canvasRotationSchema,
    width: canvasLengthSchema,
    x: canvasCoordinateSchema,
    y: canvasCoordinateSchema,
    zIndex: z.number().int().min(0).max(10000)
  })
  .strict();

export const canvasTextElementSchema = baseCanvasElementSchema
  .extend({
    color: canvasColorSchema,
    content: z.string().max(5000),
    fontFamily: z.string().trim().min(1).max(120),
    fontSize: z.number().finite().positive().max(512),
    fontWeight: z.enum(["regular", "medium", "semibold", "bold"]),
    letterSpacing: z.number().finite().min(-10).max(50),
    lineHeight: z.number().finite().min(0.8).max(3),
    textAlign: z.enum(["left", "center", "right"]),
    type: z.literal("text")
  })
  .strict();

export const canvasImageElementSchema = baseCanvasElementSchema
  .extend({
    alt: z.string().max(240),
    assetId: canvasIdSchema,
    crop: z
      .object({
        height: canvasLengthSchema,
        width: canvasLengthSchema,
        x: z.number().finite().min(0).max(1),
        y: z.number().finite().min(0).max(1)
      })
      .strict()
      .nullable(),
    prompt: z.string().max(2000).nullable(),
    provider: z.enum(["flux", "ideogram", "imagen", "local-image", "openai"]),
    src: canvasImageSourceSchema,
    type: z.literal("image")
  })
  .strict();

export const canvasLogoElementSchema = baseCanvasElementSchema
  .extend({
    assetId: canvasIdSchema.nullable(),
    brandName: z.string().trim().min(1).max(120),
    type: z.literal("logo")
  })
  .strict();

export const canvasShapeElementSchema = baseCanvasElementSchema
  .extend({
    borderRadius: z.number().finite().min(0).max(512),
    fill: canvasColorSchema,
    shape: z.enum(["rectangle", "ellipse", "line"]),
    stroke: canvasColorSchema.nullable(),
    strokeWidth: z.number().finite().min(0).max(64),
    type: z.literal("shape")
  })
  .strict();

export const canvasIconElementSchema = baseCanvasElementSchema
  .extend({
    color: canvasColorSchema,
    name: z.string().trim().min(1).max(120),
    strokeWidth: z.number().finite().min(0).max(16),
    type: z.literal("icon")
  })
  .strict();

export const canvasCtaElementSchema = baseCanvasElementSchema
  .extend({
    backgroundColor: canvasColorSchema,
    borderRadius: z.number().finite().min(0).max(512),
    fontFamily: z.string().trim().min(1).max(120),
    fontSize: z.number().finite().positive().max(256),
    label: z.string().max(200),
    textColor: canvasColorSchema,
    type: z.literal("cta")
  })
  .strict();

export const canvasElementSchema = z.discriminatedUnion("type", [
  canvasTextElementSchema,
  canvasImageElementSchema,
  canvasLogoElementSchema,
  canvasShapeElementSchema,
  canvasIconElementSchema,
  canvasCtaElementSchema
]);

export const canvasSlideSchema = z
  .object({
    background: z
      .object({
        color: canvasColorSchema,
        type: z.literal("solid")
      })
      .strict(),
    elements: z.array(canvasElementSchema).max(100),
    height: canvasLengthSchema,
    id: canvasIdSchema,
    name: z.string().trim().min(1).max(120),
    order: z.number().int().min(1).max(10),
    width: canvasLengthSchema
  })
  .strict()
  .superRefine((slide, context) => {
    const elementIds = new Set<string>();

    for (const element of slide.elements) {
      if (elementIds.has(element.id)) {
        context.addIssue({
          code: "custom",
          message: "Element IDs must be unique per slide.",
          path: ["elements"]
        });
      }

      elementIds.add(element.id);
    }
  });

export const canvasDocumentFormatSchema = z.enum(["instagram-carousel", "square-post", "story", "presentation"]);

export const canvasDocumentSchema = z
  .object({
    documentId: canvasIdSchema,
    format: canvasDocumentFormatSchema,
    height: canvasLengthSchema,
    schemaVersion: z.literal("1.0.0"),
    slides: z.array(canvasSlideSchema).min(1).max(10),
    themeId: canvasIdSchema.nullable(),
    title: z.string().trim().min(1).max(160),
    unit: z.literal("px"),
    width: canvasLengthSchema
  })
  .strict()
  .superRefine((document, context) => {
    const slideOrders = new Set<number>();

    for (const slide of document.slides) {
      if (slideOrders.has(slide.order)) {
        context.addIssue({
          code: "custom",
          message: "Slide order values must be unique.",
          path: ["slides"]
        });
      }

      slideOrders.add(slide.order);
    }
  });
