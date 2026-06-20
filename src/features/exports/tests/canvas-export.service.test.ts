import { describe, expect, it } from "vitest";

import type { CanvasDocument } from "@/features/canvas/types/canvas";

import {
  buildCanvasSlideSvg,
  buildPdfDocument,
  createExportFileName
} from "../services/canvas-export.service";

const document: CanvasDocument = {
  documentId: "document_1",
  format: "instagram-carousel",
  height: 1080,
  schemaVersion: "1.0.0",
  slides: [
    {
      background: {
        color: "#FFFFFF",
        type: "solid"
      },
      elements: [
        {
          borderRadius: 24,
          fill: "#F1F5F9",
          height: 260,
          id: "shape_1",
          locked: false,
          opacity: 1,
          rotation: 0,
          shape: "rectangle",
          stroke: null,
          strokeWidth: 0,
          type: "shape",
          width: 520,
          x: 120,
          y: 450,
          zIndex: 0
        },
        {
          color: "#0B0F19",
          content: "Export <ready> & editable",
          fontFamily: "Geist",
          fontSize: 72,
          fontWeight: "bold",
          height: 180,
          id: "headline_1",
          letterSpacing: 0,
          lineHeight: 1.1,
          locked: false,
          opacity: 1,
          rotation: 0,
          textAlign: "left",
          type: "text",
          width: 720,
          x: 96,
          y: 180,
          zIndex: 1
        },
        {
          backgroundColor: "#00E5FF",
          borderRadius: 18,
          fontFamily: "Geist",
          fontSize: 32,
          height: 92,
          id: "cta_1",
          label: "Book now",
          locked: false,
          opacity: 1,
          rotation: 0,
          textColor: "#0B0F19",
          type: "cta",
          width: 420,
          x: 96,
          y: 860,
          zIndex: 2
        }
      ],
      height: 1080,
      id: "slide_1",
      name: "Slide 1",
      order: 1,
      width: 1080
    }
  ],
  themeId: null,
  title: "Storm Damage Carousel",
  unit: "px",
  width: 1080
};

describe("canvas export service", () => {
  it("renders editable canvas JSON to SVG artwork", () => {
    const svg = buildCanvasSlideSvg(document.slides[0]);

    expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080"');
    expect(svg).toContain('fill="#FFFFFF"');
    expect(svg).toContain("Export &lt;ready&gt; &amp;");
    expect(svg).toContain("editable");
    expect(svg).toContain("Book now");
    expect(svg).not.toContain("<foreignObject");
    expect(svg).not.toContain("<script");
  });

  it("creates stable export filenames for slide assets", () => {
    expect(createExportFileName("Storm Damage Carousel", 2, "jpg")).toBe("storm-damage-carousel-slide-2.jpg");
    expect(createExportFileName("  !!!  ", 1, "png")).toBe("brandbrain-slide-1.png");
  });

  it("builds a multi-page PDF document from slide JPEG assets", () => {
    const pdf = buildPdfDocument({
      pages: [
        {
          height: 1080,
          jpegBytes: new Uint8Array([255, 216, 255, 217]),
          width: 1080
        },
        {
          height: 1080,
          jpegBytes: new Uint8Array([255, 216, 255, 217]),
          width: 1080
        }
      ]
    });
    const text = new TextDecoder().decode(pdf);

    expect(text.startsWith("%PDF-1.4")).toBe(true);
    expect(text).toContain("/Count 2");
    expect(text).toContain("/DCTDecode");
    expect(text).toContain("%%EOF");
  });
});
