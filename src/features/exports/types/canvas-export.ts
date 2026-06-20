import type { CanvasDocument } from "@/features/canvas/types/canvas";

export type CanvasExportFormat = "jpg" | "pdf" | "png";

export type CanvasExportRequest = {
  document: CanvasDocument;
  format: CanvasExportFormat;
  projectTitle: string;
};

export type PdfImagePage = {
  height: number;
  jpegBytes: Uint8Array;
  width: number;
};
