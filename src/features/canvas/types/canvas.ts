import type { z } from "zod";

import type {
  canvasDocumentFormatSchema,
  canvasDocumentSchema,
  canvasElementSchema,
  canvasSlideSchema
} from "../schemas/canvas-object.schema";

export type CanvasDocument = z.infer<typeof canvasDocumentSchema>;
export type CanvasDocumentFormat = z.infer<typeof canvasDocumentFormatSchema>;
export type CanvasElement = z.infer<typeof canvasElementSchema>;
export type CanvasSlide = z.infer<typeof canvasSlideSchema>;

export type CanvasDocumentValidationResult =
  | {
      document: CanvasDocument;
      ok: true;
      status: "ready";
    }
  | {
      error: {
        code: "invalid_canvas_document";
        issues: string[];
        message: string;
      };
      ok: false;
      status: "failed";
    };
