import { describe, expect, it } from "vitest";

import { canvasDocumentSchema } from "../schemas/canvas-object.schema";
import {
  createBlankCanvasDocument,
  getCanvasElementsInPaintOrder,
  validateCanvasDocument
} from "../services/canvas-object-model.service";

describe("canvas object model", () => {
  it("creates a valid blank carousel document with editable slide JSON", () => {
    const idFactory = createIdFactory(["document_1", "slide_1", "slide_2", "slide_3"]);

    const document = createBlankCanvasDocument({
      idFactory,
      slideCount: 3,
      title: "Storm Damage Carousel"
    });

    expect(canvasDocumentSchema.safeParse(document).success).toBe(true);
    expect(document).toMatchObject({
      documentId: "document_1",
      format: "instagram-carousel",
      schemaVersion: "1.0.0",
      title: "Storm Damage Carousel",
      unit: "px",
      width: 1080,
      height: 1080
    });
    expect(document.slides).toHaveLength(3);
    expect(document.slides.map((slide) => slide.order)).toEqual([1, 2, 3]);
    expect(document.slides[0]).toMatchObject({
      background: {
        color: "#FFFFFF",
        type: "solid"
      },
      elements: [],
      height: 1080,
      id: "slide_1",
      name: "Slide 1",
      width: 1080
    });
  });

  it("rejects flat rendered image sources as the canvas document source", () => {
    const result = validateCanvasDocument({
      documentId: "document_1",
      format: "instagram-carousel",
      height: 1080,
      renderedImageUrl: "https://cdn.example.com/flat.png",
      schemaVersion: "1.0.0",
      slides: [],
      title: "Flat image",
      unit: "px",
      width: 1080
    });

    expect(result).toMatchObject({
      error: {
        code: "invalid_canvas_document"
      },
      ok: false,
      status: "failed"
    });
  });

  it("preserves user-edited element IDs, content, and positioning during validation", () => {
    const result = validateCanvasDocument({
      documentId: "document_1",
      format: "instagram-carousel",
      height: 1080,
      schemaVersion: "1.0.0",
      slides: [
        {
          background: {
            color: "#0B0F19",
            type: "solid"
          },
          elements: [
            {
              color: "#F8FAFC",
              content: "5 Signs of Storm Damage",
              fontFamily: "Geist",
              fontSize: 72,
              fontWeight: "bold",
              height: 180,
              id: "headline_user_edited",
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
              zIndex: 2
            }
          ],
          height: 1080,
          id: "slide_1",
          name: "Hook",
          order: 1,
          width: 1080
        }
      ],
      themeId: null,
      title: "Storm Damage Carousel",
      unit: "px",
      width: 1080
    });

    expect(result.ok).toBe(true);
    expect(result.ok ? result.document.slides[0]?.elements[0] : null).toMatchObject({
      content: "5 Signs of Storm Damage",
      id: "headline_user_edited",
      x: 96,
      y: 180,
      zIndex: 2
    });
  });

  it("accepts AI-generated image elements as editable canvas objects", () => {
    const result = validateCanvasDocument({
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
              alt: "Land Strong generated image",
              assetId: "asset_image_1",
              crop: null,
              height: 520,
              id: "image_1",
              locked: false,
              opacity: 1,
              prompt: "Brand-consistent marketing photography for Land Strong.",
              provider: "flux",
              rotation: 0,
              src: "data:image/svg+xml,%3Csvg%3E%3C/svg%3E",
              type: "image",
              width: 888,
              x: 96,
              y: 280,
              zIndex: 1
            }
          ],
          height: 1080,
          id: "slide_1",
          name: "Hook",
          order: 1,
          width: 1080
        }
      ],
      themeId: null,
      title: "Generated Image",
      unit: "px",
      width: 1080
    });

    expect(result.ok).toBe(true);
    expect(result.ok ? result.document.slides[0]?.elements[0] : null).toMatchObject({
      provider: "flux",
      src: "data:image/svg+xml,%3Csvg%3E%3C/svg%3E",
      type: "image"
    });
  });

  it("rejects duplicate slide order and duplicate element IDs", () => {
    const document = createBlankCanvasDocument({
      idFactory: createIdFactory(["document_1", "slide_1", "slide_2"]),
      slideCount: 2,
      title: "Duplicate test"
    });

    const result = validateCanvasDocument({
      ...document,
      slides: [
        {
          ...document.slides[0],
          elements: [
            createTextElement("headline_1"),
            {
              ...createTextElement("headline_1"),
              content: "Duplicate ID"
            }
          ],
          order: 1
        },
        {
          ...document.slides[1],
          order: 1
        }
      ]
    });

    expect(result.ok).toBe(false);
    expect(result.ok ? [] : result.error.issues).toEqual(
      expect.arrayContaining(["Slide order values must be unique.", "Element IDs must be unique per slide."])
    );
  });

  it("returns elements in paint order without mutating the slide", () => {
    const low = createTextElement("low", 1);
    const high = createTextElement("high", 10);
    const middle = createTextElement("middle", 5);
    const slide = {
      background: {
        color: "#0B0F19",
        type: "solid" as const
      },
      elements: [high, low, middle],
      height: 1080,
      id: "slide_1",
      name: "Layered",
      order: 1,
      width: 1080
    };

    expect(getCanvasElementsInPaintOrder(slide).map((element) => element.id)).toEqual(["low", "middle", "high"]);
    expect(slide.elements.map((element) => element.id)).toEqual(["high", "low", "middle"]);
  });
});

function createIdFactory(ids: string[]) {
  return () => {
    const id = ids.shift();

    if (!id) {
      throw new Error("No test IDs left.");
    }

    return id;
  };
}

function createTextElement(id: string, zIndex = 0) {
  return {
    color: "#F8FAFC",
    content: "Editable headline",
    fontFamily: "Geist",
    fontSize: 72,
    fontWeight: "bold" as const,
    height: 180,
    id,
    letterSpacing: 0,
    lineHeight: 1.1,
    locked: false,
    opacity: 1,
    rotation: 0,
    textAlign: "left" as const,
    type: "text" as const,
    width: 720,
    x: 96,
    y: 180,
    zIndex
  };
}
