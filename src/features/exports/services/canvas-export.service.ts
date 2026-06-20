import { getCanvasElementsInPaintOrder } from "@/features/canvas/services/canvas-object-model.service";
import type { CanvasElement, CanvasSlide } from "@/features/canvas/types/canvas";

import type { CanvasExportFormat, PdfImagePage } from "../types/canvas-export";

const xmlNamespace = "http://www.w3.org/2000/svg";
const xhtmlNamespace = "http://www.w3.org/1999/xhtml";
const textEncoder = new TextEncoder();

export function buildCanvasSlideSvg(slide: CanvasSlide): string {
  const elements = getCanvasElementsInPaintOrder(slide).map((element) => renderElement(element)).join("");

  return [
    `<svg xmlns="${xmlNamespace}" width="${slide.width}" height="${slide.height}" viewBox="0 0 ${slide.width} ${slide.height}">`,
    `<rect width="${slide.width}" height="${slide.height}" fill="${slide.background.color}" />`,
    elements,
    "</svg>"
  ].join("");
}

export function createExportFileName(projectTitle: string, slideNumber: number, format: CanvasExportFormat): string {
  const slug = projectTitle
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${slug || "brandbrain"}-slide-${slideNumber}.${format}`;
}

export function createPdfFileName(projectTitle: string): string {
  const slug = projectTitle
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${slug || "brandbrain"}.pdf`;
}

export function buildPdfDocument({ pages }: { pages: PdfImagePage[] }): Uint8Array {
  if (pages.length === 0) {
    throw new Error("PDF export requires at least one page.");
  }

  const objectCount = 2 + pages.length * 3;
  const objects = new Map<number, Uint8Array>();
  const pageObjectIds: number[] = [];

  objects.set(
    1,
    encodeAscii("<< /Type /Catalog /Pages 2 0 R >>")
  );

  pages.forEach((page, index) => {
    const pageObjectId = 3 + index * 3;
    const contentObjectId = pageObjectId + 1;
    const imageObjectId = pageObjectId + 2;
    const imageName = `Im${index + 1}`;

    pageObjectIds.push(pageObjectId);
    objects.set(
      pageObjectId,
      encodeAscii(
        [
          "<< /Type /Page",
          "/Parent 2 0 R",
          `/MediaBox [0 0 ${page.width} ${page.height}]`,
          `/Resources << /XObject << /${imageName} ${imageObjectId} 0 R >> >>`,
          `/Contents ${contentObjectId} 0 R`,
          ">>"
        ].join(" ")
      )
    );

    const contentStream = encodeAscii(`q ${page.width} 0 0 ${page.height} 0 0 cm /${imageName} Do Q`);
    objects.set(contentObjectId, createStreamObject(contentStream));
    objects.set(
      imageObjectId,
      createStreamObject(
        page.jpegBytes,
        [
          "/Type /XObject",
          "/Subtype /Image",
          `/Width ${page.width}`,
          `/Height ${page.height}`,
          "/ColorSpace /DeviceRGB",
          "/BitsPerComponent 8",
          "/Filter /DCTDecode"
        ].join(" ")
      )
    );
  });

  objects.set(
    2,
    encodeAscii(`<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`)
  );

  const chunks: Uint8Array[] = [encodeAscii("%PDF-1.4\n")];
  const offsets = [0];
  let byteLength = chunks[0].length;

  for (let objectId = 1; objectId <= objectCount; objectId += 1) {
    const objectBody = objects.get(objectId);

    if (!objectBody) {
      throw new Error(`Missing PDF object ${objectId}.`);
    }

    offsets[objectId] = byteLength;
    const chunk = concatBytes([
      encodeAscii(`${objectId} 0 obj\n`),
      objectBody,
      encodeAscii("\nendobj\n")
    ]);

    chunks.push(chunk);
    byteLength += chunk.length;
  }

  const xrefOffset = byteLength;
  const xref = [
    "xref",
    `0 ${objectCount + 1}`,
    "0000000000 65535 f ",
    ...offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n `),
    "trailer",
    `<< /Size ${objectCount + 1} /Root 1 0 R >>`,
    "startxref",
    String(xrefOffset),
    "%%EOF"
  ].join("\n");

  chunks.push(encodeAscii(xref));

  return concatBytes(chunks);
}

function renderElement(element: CanvasElement): string {
  const transform = `rotate(${element.rotation} ${element.x + element.width / 2} ${element.y + element.height / 2})`;
  const opacity = formatNumber(element.opacity);

  if (element.type === "shape") {
    return renderShapeElement(element, transform, opacity);
  }

  if (element.type === "cta") {
    return [
      `<g transform="${transform}" opacity="${opacity}">`,
      `<rect x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}" rx="${element.borderRadius}" fill="${element.backgroundColor}" />`,
      renderTextBox({
        color: element.textColor,
        content: element.label,
        fontFamily: element.fontFamily,
        fontSize: element.fontSize,
        fontWeight: 700,
        height: element.height,
        lineHeight: 1.15,
        textAlign: "center",
        width: element.width,
        x: element.x,
        y: element.y
      }),
      "</g>"
    ].join("");
  }

  if (element.type === "text") {
    return [
      `<g transform="${transform}" opacity="${opacity}">`,
      renderTextBox({
        color: element.color,
        content: element.content,
        fontFamily: element.fontFamily,
        fontSize: element.fontSize,
        fontWeight: fontWeightValue(element.fontWeight),
        height: element.height,
        lineHeight: element.lineHeight,
        textAlign: element.textAlign,
        width: element.width,
        x: element.x,
        y: element.y
      }),
      "</g>"
    ].join("");
  }

  if (element.type === "logo") {
    return renderTextBox({
      color: "#0B0F19",
      content: element.brandName,
      fontFamily: "Geist, Inter, sans-serif",
      fontSize: Math.min(48, element.height * 0.45),
      fontWeight: 700,
      height: element.height,
      lineHeight: 1.1,
      textAlign: "left",
      width: element.width,
      x: element.x,
      y: element.y
    });
  }

  if (element.type === "icon") {
    return `<circle cx="${element.x + element.width / 2}" cy="${element.y + element.height / 2}" r="${Math.min(element.width, element.height) / 2}" fill="${element.color}" opacity="${opacity}" />`;
  }

  return "";
}

function renderShapeElement(
  element: Extract<CanvasElement, { type: "shape" }>,
  transform: string,
  opacity: string
): string {
  if (element.shape === "ellipse") {
    return `<ellipse cx="${element.x + element.width / 2}" cy="${element.y + element.height / 2}" rx="${element.width / 2}" ry="${element.height / 2}" fill="${element.fill}" opacity="${opacity}" transform="${transform}"${strokeAttributes(element)} />`;
  }

  if (element.shape === "line") {
    return `<line x1="${element.x}" y1="${element.y}" x2="${element.x + element.width}" y2="${element.y + element.height}" stroke="${element.stroke ?? element.fill}" stroke-width="${Math.max(1, element.strokeWidth)}" opacity="${opacity}" transform="${transform}" />`;
  }

  return `<rect x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}" rx="${element.borderRadius}" fill="${element.fill}" opacity="${opacity}" transform="${transform}"${strokeAttributes(element)} />`;
}

function strokeAttributes(element: Extract<CanvasElement, { type: "shape" }>): string {
  return element.stroke ? ` stroke="${element.stroke}" stroke-width="${element.strokeWidth}"` : "";
}

function renderTextBox({
  color,
  content,
  fontFamily,
  fontSize,
  fontWeight,
  height,
  lineHeight,
  textAlign,
  width,
  x,
  y
}: {
  color: string;
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  height: number;
  lineHeight: number;
  textAlign: "center" | "left" | "right";
  width: number;
  x: number;
  y: number;
}): string {
  const justifyContent = textAlign === "center" ? "center" : "flex-start";

  return [
    `<foreignObject x="${x}" y="${y}" width="${width}" height="${height}">`,
    `<div xmlns="${xhtmlNamespace}" style="${[
      "box-sizing:border-box",
      `color:${color}`,
      "display:flex",
      `font-family:${escapeStyle(fontFamily)},Inter,sans-serif`,
      `font-size:${fontSize}px`,
      `font-weight:${fontWeight}`,
      `height:${height}px`,
      `line-height:${lineHeight}`,
      "overflow:hidden",
      "white-space:pre-wrap",
      "word-break:break-word",
      `align-items:${justifyContent}`,
      `justify-content:${justifyContent}`,
      `text-align:${textAlign}`,
      `width:${width}px`
    ].join(";")}">`,
    escapeHtml(content),
    "</div>",
    "</foreignObject>"
  ].join("");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeStyle(value: string): string {
  return value.replaceAll(";", "").replaceAll('"', "");
}

function fontWeightValue(weight: Extract<CanvasElement, { type: "text" }>["fontWeight"]): number {
  return weight === "regular" ? 400 : weight === "medium" ? 500 : weight === "semibold" ? 600 : 700;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(3);
}

function createStreamObject(stream: Uint8Array, dictionary = ""): Uint8Array {
  return concatBytes([
    encodeAscii(`<< ${dictionary}${dictionary ? " " : ""}/Length ${stream.length} >>\nstream\n`),
    stream,
    encodeAscii("\nendstream")
  ]);
}

function encodeAscii(value: string): Uint8Array {
  return textEncoder.encode(value);
}

function concatBytes(chunks: Uint8Array[]): Uint8Array {
  const totalLength = chunks.reduce((length, chunk) => length + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}
