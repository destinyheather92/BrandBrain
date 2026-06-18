import { z } from "zod";

import {
  canvasDocumentFormatSchema,
  canvasDocumentSchema,
  canvasSlideSchema
} from "../schemas/canvas-object.schema";
import type {
  CanvasDocument,
  CanvasDocumentFormat,
  CanvasDocumentValidationResult,
  CanvasElement,
  CanvasSlide
} from "../types/canvas";

type CanvasIdScope = "document" | "slide" | "element";

type CreateBlankCanvasDocumentParams = {
  format?: CanvasDocumentFormat;
  idFactory?: (scope?: CanvasIdScope) => string;
  slideCount?: number;
  title: string;
};

const canvasFormatDimensions: Record<CanvasDocumentFormat, { height: number; width: number }> = {
  "instagram-carousel": {
    height: 1080,
    width: 1080
  },
  presentation: {
    height: 1080,
    width: 1920
  },
  "square-post": {
    height: 1080,
    width: 1080
  },
  story: {
    height: 1920,
    width: 1080
  }
};

const slideCountSchema = z.number().int().min(1).max(10);

export function createBlankCanvasDocument({
  format = "instagram-carousel",
  idFactory = createCanvasId,
  slideCount = 3,
  title
}: CreateBlankCanvasDocumentParams): CanvasDocument {
  const parsedFormat = canvasDocumentFormatSchema.parse(format);
  const parsedSlideCount = slideCountSchema.parse(slideCount);
  const dimensions = canvasFormatDimensions[parsedFormat];
  const document = {
    documentId: idFactory("document"),
    format: parsedFormat,
    height: dimensions.height,
    schemaVersion: "1.0.0",
    slides: Array.from({ length: parsedSlideCount }, (_, index) =>
      createBlankSlide({
        height: dimensions.height,
        id: idFactory("slide"),
        order: index + 1,
        width: dimensions.width
      })
    ),
    themeId: null,
    title: title.trim() || "Untitled Canvas",
    unit: "px",
    width: dimensions.width
  };

  return canvasDocumentSchema.parse(document);
}

export function validateCanvasDocument(input: unknown): CanvasDocumentValidationResult {
  const parsed = canvasDocumentSchema.safeParse(input);

  if (parsed.success) {
    return {
      document: parsed.data,
      ok: true,
      status: "ready"
    };
  }

  return {
    error: {
      code: "invalid_canvas_document",
      issues: parsed.error.issues.map((issue) => issue.message),
      message: "Canvas JSON is invalid."
    },
    ok: false,
    status: "failed"
  };
}

export function getCanvasElementsInPaintOrder(slide: CanvasSlide): CanvasElement[] {
  return [...slide.elements].sort((first, second) => first.zIndex - second.zIndex || first.id.localeCompare(second.id));
}

function createBlankSlide({
  height,
  id,
  order,
  width
}: {
  height: number;
  id: string;
  order: number;
  width: number;
}): CanvasSlide {
  return canvasSlideSchema.parse({
    background: {
      color: "#0B0F19",
      type: "solid"
    },
    elements: [],
    height,
    id,
    name: `Slide ${order}`,
    order,
    width
  });
}

function createCanvasId(scope: CanvasIdScope = "element"): string {
  const randomId = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 12);

  return `${scope}_${randomId}`;
}
