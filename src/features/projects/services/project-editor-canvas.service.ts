import { canvasDocumentSchema, canvasElementSchema } from "@/features/canvas/schemas/canvas-object.schema";
import type { CanvasDocument, CanvasElement } from "@/features/canvas/types/canvas";

const defaultMinimumCanvasElementSize = 32;
const textCharacterWidthRatio = 0.62;

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
    color: "#0B0F19",
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

  const minimumWidth = getMinimumCanvasElementWidth(element);
  const width = clampCanvasNumber(element.width + deltaWidth, minimumWidth, slide.width - element.x);
  const minimumHeight = getMinimumCanvasElementHeight(element, width);

  return updateCanvasElement(document, slideId, elementId, {
    height: clampCanvasNumber(element.height + deltaHeight, minimumHeight, slide.height - element.y),
    width
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

function getMinimumCanvasElementWidth(element: CanvasElement): number {
  if (element.type === "text") {
    const longestWordLength = getLongestWordLength(element.content);

    return Math.max(
      defaultMinimumCanvasElementSize,
      Math.ceil(element.fontSize * textCharacterWidthRatio * longestWordLength)
    );
  }

  if (element.type === "cta") {
    const longestWordLength = getLongestWordLength(element.label);

    return Math.max(96, Math.ceil(element.fontSize * textCharacterWidthRatio * longestWordLength + 48));
  }

  return defaultMinimumCanvasElementSize;
}

function getMinimumCanvasElementHeight(element: CanvasElement, width: number): number {
  if (element.type === "text") {
    const lineCount = getWrappedTextLineCount({
      fontSize: element.fontSize,
      text: element.content,
      width
    });

    return Math.max(defaultMinimumCanvasElementSize, Math.ceil(element.fontSize * element.lineHeight * lineCount));
  }

  if (element.type === "cta") {
    const lineCount = getWrappedTextLineCount({
      fontSize: element.fontSize,
      text: element.label,
      width: Math.max(1, width - 48)
    });

    return Math.max(defaultMinimumCanvasElementSize, Math.ceil(element.fontSize * 1.15 * lineCount + 24));
  }

  return defaultMinimumCanvasElementSize;
}

function getWrappedTextLineCount({
  fontSize,
  text,
  width
}: {
  fontSize: number;
  text: string;
  width: number;
}): number {
  const charactersPerLine = Math.max(1, Math.floor(width / Math.max(1, fontSize * textCharacterWidthRatio)));

  return text.split(/\r?\n/).reduce((lineCount, line) => {
    const words = line.trim().split(/\s+/).filter(Boolean);

    if (words.length === 0) {
      return lineCount + 1;
    }

    let wrappedLines = 1;
    let currentLineLength = 0;

    for (const word of words) {
      const nextLength = currentLineLength === 0 ? word.length : currentLineLength + 1 + word.length;

      if (nextLength > charactersPerLine && currentLineLength > 0) {
        wrappedLines += 1;
        currentLineLength = word.length;
      } else {
        currentLineLength = nextLength;
      }
    }

    return lineCount + wrappedLines;
  }, 0);
}

function getLongestWordLength(value: string): number {
  return Math.max(1, ...value.trim().split(/\s+/).map((word) => word.length));
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
