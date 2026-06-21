import { describe, expect, it } from "vitest";

import type { CanvasDocument } from "@/features/canvas/types/canvas";

import {
  moveCanvasElementInSlide,
  resizeCanvasElementInSlide
} from "../services/project-editor-canvas.service";

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
          color: "#0B0F19",
          content: "Editable headline",
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
  title: "Editable Carousel",
  unit: "px",
  width: 1080
};

describe("project editor canvas interactions", () => {
  it("moves an element by delta while keeping it inside the slide", () => {
    const moved = moveCanvasElementInSlide({
      deltaX: 1200,
      deltaY: -500,
      document,
      elementId: "headline_1",
      slideId: "slide_1"
    });
    const element = moved.slides[0]?.elements[0];

    expect(element).toMatchObject({
      x: 360,
      y: 0
    });
  });

  it("resizes an element by delta while enforcing bounds and minimum size", () => {
    const larger = resizeCanvasElementInSlide({
      deltaHeight: 1200,
      deltaWidth: 1200,
      document,
      elementId: "headline_1",
      slideId: "slide_1"
    });
    const largerElement = larger.slides[0]?.elements[0];

    expect(largerElement).toMatchObject({
      height: 900,
      width: 984
    });

    const smaller = resizeCanvasElementInSlide({
      deltaHeight: -1000,
      deltaWidth: -1000,
      document,
      elementId: "headline_1",
      slideId: "slide_1"
    });
    const smallerElement = smaller.slides[0]?.elements[0];

    expect(smallerElement).toMatchObject({
      height: 159,
      width: 358
    });
  });
});
