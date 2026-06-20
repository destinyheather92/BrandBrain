"use client";

import type { CanvasSlide } from "@/features/canvas/types/canvas";

import {
  buildCanvasSlideSvg,
  buildPdfDocument,
  createExportFileName,
  createPdfFileName
} from "./canvas-export.service";
import type { CanvasExportRequest, PdfImagePage } from "../types/canvas-export";

export async function downloadCanvasDocument({
  document,
  format,
  projectTitle
}: CanvasExportRequest): Promise<void> {
  const slides = [...document.slides].sort((first, second) => first.order - second.order);

  if (format === "pdf") {
    const pages = await Promise.all(slides.map((slide) => renderSlideToJpegPage(slide)));
    const pdf = buildPdfDocument({ pages });
    const pdfBuffer = pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength) as ArrayBuffer;

    downloadBlob(new Blob([pdfBuffer], { type: "application/pdf" }), createPdfFileName(projectTitle));
    return;
  }

  for (let index = 0; index < slides.length; index += 1) {
    const slide = slides[index];
    const blob = await renderSlideToImageBlob(slide, format === "jpg" ? "image/jpeg" : "image/png");

    downloadBlob(blob, createExportFileName(projectTitle, index + 1, format));
  }
}

async function renderSlideToJpegPage(slide: CanvasSlide): Promise<PdfImagePage> {
  const blob = await renderSlideToImageBlob(slide, "image/jpeg");
  const jpegBytes = new Uint8Array(await blob.arrayBuffer());

  return {
    height: slide.height,
    jpegBytes,
    width: slide.width
  };
}

async function renderSlideToImageBlob(slide: CanvasSlide, mimeType: "image/jpeg" | "image/png"): Promise<Blob> {
  const svg = buildCanvasSlideSvg(slide);
  const image = await loadSvgImage(svg);
  const canvas = document.createElement("canvas");

  canvas.height = slide.height;
  canvas.width = slide.width;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas export is not available in this browser.");
  }

  if (mimeType === "image/jpeg") {
    context.fillStyle = slide.background.color;
    context.fillRect(0, 0, slide.width, slide.height);
  }

  context.drawImage(image, 0, 0, slide.width, slide.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error("Canvas export could not be rendered."));
      },
      mimeType,
      mimeType === "image/jpeg" ? 0.92 : undefined
    );
  });
}

function loadSvgImage(svg: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Canvas export image could not be loaded."));
    };
    image.src = url;
  });
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
