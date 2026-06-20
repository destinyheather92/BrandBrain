import { canvasDocumentSchema, canvasElementSchema } from "@/features/canvas/schemas/canvas-object.schema";
import type { CanvasDocument, CanvasElement } from "@/features/canvas/types/canvas";

const minimumCanvasElementSize = 32;

type CanvasElementMoveInput = {
  deltaX: number;
  deltaY: number;
  document: CanvasDocument;
  elementId: string;
  slideId: string;
};

type CanvasElementResizeInput = {
  deltaHeight: number;
  deltaWidth: number;
  document: CanvasDocument;
  elementId: string;
  slideId: string;
};

export function createCanvasTextElement(id: string): CanvasElement {
  return canvasElementSchema.parse({
    color: "#F8FAFC",
    content: "Editable headline",
    fontFamily: "Geist",
    fontSize: 72,
    fontWeight: "bold",
    height: 180,
    id,
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
  });
}

export function createCanvasShapeElement(id: string): CanvasElement {
  return canvasElementSchema.parse({
    borderRadius: 24,
    fill: "#1C2433",
    height: 260,
    id,
    locked: false,
    opacity: 1,
    rotation: 0,
    shape: "rectangle",
    stroke: null,
    strokeWidth: 0,
    type: "shape",
    width: 520,
    x: 280,
    y: 410,
    zIndex: 0
  });
}

export function createCanvasCtaElement(id: string): CanvasElement {
  return canvasElementSchema.parse({
    backgroundColor: "#00E5FF",
    borderRadius: 18,
    fontFamily: "Geist",
    fontSize: 32,
    height: 92,
    id,
    label: "Book an inspection",
    locked: false,
    opacity: 1,
    rotation: 0,
    textColor: "#0B0F19",
    type: "cta",
    width: 420,
    x: 96,
    y: 860,
    zIndex: 2
  });
}

export function addCanvasElementToSlide(
  document: CanvasDocument,
  slideId: string,
  element: CanvasElement
): CanvasDocument {
  return canvasDocumentSchema.parse({
    ...document,
    slides: document.slides.map((slide) =>
      slide.id === slideId
        ? {
            ...slide,
            elements: [...slide.elements, element]
          }
        : slide
    )
  });
}

export function updateCanvasElement(
  document: CanvasDocument,
  slideId: string,
  elementId: string,
  changes: Partial<CanvasElement>
): CanvasDocument {
  return canvasDocumentSchema.parse({
    ...document,
    slides: document.slides.map((slide) =>
      slide.id === slideId
        ? {
            ...slide,
            elements: slide.elements.map((element) =>
              element.id === elementId
                ? {
                    ...element,
                    ...changes,
                    type: element.type
                  }
                : element
            )
          }
        : slide
    )
  });
}

export function moveCanvasElementInSlide({
  deltaX,
  deltaY,
  document,
  elementId,
  slideId
}: CanvasElementMoveInput): CanvasDocument {
  const slide = document.slides.find((candidate) => candidate.id === slideId);
  const element = slide?.elements.find((candidate) => candidate.id === elementId);

  if (!slide || !element || element.locked) {
    return document;
  }

  return updateCanvasElement(document, slideId, elementId, {
    x: clampCanvasNumber(element.x + deltaX, 0, slide.width - element.width),
    y: clampCanvasNumber(element.y + deltaY, 0, slide.height - element.height)
  });
}

export function resizeCanvasElementInSlide({
  deltaHeight,
  deltaWidth,
  document,
  elementId,
  slideId
}: CanvasElementResizeInput): CanvasDocument {
  const slide = document.slides.find((candidate) => candidate.id === slideId);
  const element = slide?.elements.find((candidate) => candidate.id === elementId);

  if (!slide || !element || element.locked) {
    return document;
  }

  return updateCanvasElement(document, slideId, elementId, {
    height: clampCanvasNumber(element.height + deltaHeight, minimumCanvasElementSize, slide.height - element.y),
    width: clampCanvasNumber(element.width + deltaWidth, minimumCanvasElementSize, slide.width - element.x)
  });
}

export function removeCanvasElement(document: CanvasDocument, slideId: string, elementId: string): CanvasDocument {
  return canvasDocumentSchema.parse({
    ...document,
    slides: document.slides.map((slide) =>
      slide.id === slideId
        ? {
            ...slide,
            elements: slide.elements.filter((element) => element.id !== elementId)
          }
        : slide
      )
  });
}

function clampCanvasNumber(value: number, minimum: number, maximum: number): number {
  return Math.round(Math.min(Math.max(value, minimum), Math.max(minimum, maximum)));
}

export function normalizeEditorCanvas(document: CanvasDocument): CanvasDocument {
  return canvasDocumentSchema.parse({
    ...document,
    slides: document.slides.map((slide) => ({
      ...slide,
      elements: slide.elements.map((element) => {
        if (element.type !== "shape") {
          return element;
        }

        const hasLegacyDefaultStroke = element.stroke === "#00E5FF" && element.strokeWidth === 2;

        return hasLegacyDefaultStroke
          ? {
              ...element,
              stroke: null,
              strokeWidth: 0
            }
          : element;
      })
    }))
  });
}
