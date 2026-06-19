import { canvasDocumentSchema } from "@/features/canvas/schemas/canvas-object.schema";
import type { CanvasDocument, CanvasDocumentFormat, CanvasSlide } from "@/features/canvas/types/canvas";

import type { AiCanvasGenerationProvider, AiGenerationPrompt, AiProviderRegistry } from "../types/ai-generation";

type PromptPayload = {
  brand?: {
    memory?: {
      preferredCtas?: string | null;
    } | null;
    name?: string;
  };
  outputRules?: {
    slideCount?: number;
  };
  projectTitle?: string;
  theme?: {
    palette?: {
      accent?: string;
      background?: string;
      ctaText?: string;
      primary?: string;
      surface?: string;
      text?: string;
    };
    typography?: {
      body?: string;
      heading?: string;
    };
  };
  userRequest?: string;
};

const formatDimensions: Record<CanvasDocumentFormat, { height: number; width: number }> = {
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
const canvasCtaLabelMaxLength = 200;

export class LocalCanvasGenerationProvider implements AiCanvasGenerationProvider {
  readonly id = "openai";

  async generateJson(prompt: AiGenerationPrompt) {
    const payload = parsePromptPayload(prompt.user);
    const document = buildLocalCanvasDocument(payload);

    return {
      data: document,
      usage: {
        cost: 0,
        tokens: estimateTokens(prompt.system, prompt.user)
      }
    };
  }
}

export function createDefaultAiProviderRegistry(): AiProviderRegistry {
  const canvasProvider = new LocalCanvasGenerationProvider();

  return {
    getProvider() {
      return canvasProvider;
    }
  };
}

function parsePromptPayload(userPrompt: string): PromptPayload {
  try {
    return JSON.parse(userPrompt) as PromptPayload;
  } catch {
    return {};
  }
}

function buildLocalCanvasDocument(payload: PromptPayload): CanvasDocument {
  const dimensions = formatDimensions["instagram-carousel"];
  const slideCount = Math.min(10, Math.max(3, payload.outputRules?.slideCount ?? 3));
  const title = payload.projectTitle?.trim() || "Generated BrandBrain Carousel";
  const brandName = payload.brand?.name?.trim() || "Brand";
  const cta = fitCanvasText(
    payload.brand?.memory?.preferredCtas?.split(/\r?\n|,/)[0],
    canvasCtaLabelMaxLength,
    "Learn more"
  );
  const topic = payload.userRequest?.trim() || title;
  const palette = {
    accent: payload.theme?.palette?.accent ?? "#00E5FF",
    background: payload.theme?.palette?.background ?? "#FFFFFF",
    ctaText: payload.theme?.palette?.ctaText ?? "#0B0F19",
    primary: payload.theme?.palette?.primary ?? "#0B0F19",
    surface: payload.theme?.palette?.surface ?? "#F8FAFC",
    text: payload.theme?.palette?.text ?? "#0B0F19"
  };
  const typography = {
    body: payload.theme?.typography?.body ?? "Inter",
    heading: payload.theme?.typography?.heading ?? "Geist"
  };
  const slides = Array.from({ length: slideCount }, (_, index) =>
    buildSlide({
      brandName,
      cta,
      dimensions,
      index,
      palette,
      title,
      topic,
      typography
    })
  );

  return canvasDocumentSchema.parse({
    documentId: `document_generated_${slugify(title)}`,
    format: "instagram-carousel",
    height: dimensions.height,
    schemaVersion: "1.0.0",
    slides,
    themeId: null,
    title,
    unit: "px",
    width: dimensions.width
  });
}

function buildSlide({
  brandName,
  cta,
  dimensions,
  index,
  palette,
  title,
  topic,
  typography
}: {
  brandName: string;
  cta: string;
  dimensions: { height: number; width: number };
  index: number;
  palette: {
    accent: string;
    background: string;
    ctaText: string;
    primary: string;
    surface: string;
    text: string;
  };
  title: string;
  topic: string;
  typography: {
    body: string;
    heading: string;
  };
}): CanvasSlide {
  const order = index + 1;
  const headline =
    order === 1
      ? title
      : order === 2
        ? "Why this matters now"
        : order === 3
          ? "What to handle first"
          : `Step ${order}`;
  const body =
    order === 1
      ? topic
      : order === 2
        ? `${brandName} keeps the message focused on the audience, the timing, and the business outcome.`
        : order === 3
          ? "Turn the main idea into one clear action, then support it with practical details."
          : "Keep each slide direct, useful, and easy to edit.";

  return {
    background: {
      color: palette.background,
      type: "solid"
    },
    elements: [
      {
        borderRadius: 32,
        fill: palette.surface,
        height: 760,
        id: `shape_${order}_surface`,
        locked: false,
        opacity: 1,
        rotation: 0,
        shape: "rectangle",
        stroke: null,
        strokeWidth: 0,
        type: "shape",
        width: 880,
        x: 100,
        y: 140,
        zIndex: 0
      },
      {
        color: palette.primary,
        content: headline,
        fontFamily: typography.heading,
        fontSize: order === 1 ? 74 : 64,
        fontWeight: "bold",
        height: 190,
        id: `text_${order}_headline`,
        letterSpacing: 0,
        lineHeight: 1.05,
        locked: false,
        opacity: 1,
        rotation: 0,
        textAlign: "left",
        type: "text",
        width: 760,
        x: 150,
        y: 220,
        zIndex: 1
      },
      {
        color: palette.text,
        content: body,
        fontFamily: typography.body,
        fontSize: 36,
        fontWeight: "regular",
        height: 220,
        id: `text_${order}_body`,
        letterSpacing: 0,
        lineHeight: 1.25,
        locked: false,
        opacity: 1,
        rotation: 0,
        textAlign: "left",
        type: "text",
        width: 760,
        x: 150,
        y: 450,
        zIndex: 1
      },
      {
        backgroundColor: palette.accent,
        borderRadius: 18,
        fontFamily: typography.body,
        fontSize: 31,
        height: 86,
        id: `cta_${order}`,
        label: cta,
        locked: false,
        opacity: 1,
        rotation: 0,
        textColor: palette.ctaText,
        type: "cta",
        width: 470,
        x: 150,
        y: 770,
        zIndex: 2
      }
    ],
    height: dimensions.height,
    id: `slide_generated_${order}`,
    name: `Slide ${order}`,
    order,
    width: dimensions.width
  };
}

function estimateTokens(...values: string[]): number {
  return Math.ceil(values.join(" ").length / 4);
}

function fitCanvasText(value: string | null | undefined, maxLength: number, fallback: string): string {
  const normalized = (value ?? "").replace(/\s+/g, " ").trim();
  const text = normalized || fallback;

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3).trimEnd()}...`;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
}
