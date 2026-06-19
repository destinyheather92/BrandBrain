import { canvasDocumentSchema } from "@/features/canvas/schemas/canvas-object.schema";
import type { CanvasDocument, CanvasDocumentFormat, CanvasSlide } from "@/features/canvas/types/canvas";

import type { AiCanvasGenerationProvider, AiGenerationPrompt, AiProviderRegistry } from "../types/ai-generation";

type PromptPayload = {
  brand?: {
    memory?: {
      audience?: string | null;
      preferredCtas?: string | null;
      productsServices?: string | null;
      voice?: string | null;
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
      secondary?: string;
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
const previewCtaLabelMaxLength = 80;

type LocalPalette = {
  accent: string;
  background: string;
  ctaText: string;
  primary: string;
  secondary: string;
  surface: string;
  text: string;
};

type LocalTypography = {
  body: string;
  heading: string;
};

type SlideContent = {
  audience: string;
  brandName: string;
  cta: string;
  services: string[];
  title: string;
  topic: string;
  voice: string;
};

type BuildSlideParams = {
  content: SlideContent;
  dimensions: {
    height: number;
    width: number;
  };
  order: number;
  palette: LocalPalette;
  typography: LocalTypography;
};

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
    previewCtaLabelMaxLength,
    "Learn more"
  );
  const topic = fitCanvasText(payload.userRequest, 160, title);
  const audience = fitCanvasText(payload.brand?.memory?.audience, 96, "your ideal customers");
  const services = getServices(payload.brand?.memory?.productsServices);
  const voice = fitCanvasText(payload.brand?.memory?.voice, 90, "clear, practical, on-brand");
  const palette = {
    accent: payload.theme?.palette?.accent ?? "#00E5FF",
    background: payload.theme?.palette?.background ?? "#FFFFFF",
    ctaText: payload.theme?.palette?.ctaText ?? "#0B0F19",
    primary: payload.theme?.palette?.primary ?? "#0B0F19",
    secondary: payload.theme?.palette?.secondary ?? payload.theme?.palette?.surface ?? "#E2E8F0",
    surface: payload.theme?.palette?.surface ?? "#F8FAFC",
    text: payload.theme?.palette?.text ?? "#0B0F19"
  };
  const typography = {
    body: payload.theme?.typography?.body ?? "Inter",
    heading: payload.theme?.typography?.heading ?? "Geist"
  };
  const slides = Array.from({ length: slideCount }, (_, index) =>
    buildSlide({
      content: {
        audience,
        brandName,
        cta,
        services,
        title,
        topic,
        voice
      },
      dimensions,
      order: index + 1,
      palette,
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
  content,
  dimensions,
  order,
  palette,
  typography
}: BuildSlideParams): CanvasSlide {
  const slideParams = {
    background: {
      color: palette.background,
      type: "solid" as const
    },
    height: dimensions.height,
    id: `slide_generated_${order}`,
    name: `Slide ${order}`,
    order,
    width: dimensions.width
  };

  if (order % 3 === 1) {
    return {
      ...slideParams,
      elements: buildCoverElements({ content, order, palette, typography })
    };
  }

  if (order % 3 === 2) {
    return {
      ...slideParams,
      elements: buildInsightElements({ content, order, palette, typography })
    };
  }

  return {
    ...slideParams,
    elements: buildActionElements({ content, order, palette, typography })
  };
}

function buildCoverElements({
  content,
  order,
  palette,
  typography
}: Omit<BuildSlideParams, "dimensions">) {
  return [
    shape(`shape_${order}_accent_bar`, 0, 0, 22, 1080, palette.accent, 0, 0),
    shape(`shape_${order}_corner_block`, 742, 0, 338, 338, palette.secondary, 42, 0),
    shape(`shape_${order}_kicker_pill`, 84, 84, 366, 54, palette.primary, 18, 1),
    text(`text_${order}_kicker`, content.brandName.toUpperCase(), 112, 101, 308, 26, 20, "bold", palette.ctaText, typography.body, 2),
    text(`text_${order}_headline`, fitCanvasText(content.title, 86, "Brand-ready content"), 84, 218, 812, 240, 76, "bold", palette.primary, typography.heading, 2),
    shape(`shape_${order}_accent_rule`, 84, 512, 118, 8, palette.accent, 4, 1),
    text(`text_${order}_body`, content.topic, 84, 552, 746, 150, 34, "regular", palette.text, typography.body, 2),
    text(`text_${order}_brand_note`, `Designed for ${content.audience}`, 84, 902, 430, 48, 24, "medium", palette.text, typography.body, 2),
    cta(`cta_${order}`, content.cta, 578, 882, 418, 80, 28, palette.accent, palette.ctaText, typography.body, 2)
  ];
}

function buildInsightElements({
  content,
  order,
  palette,
  typography
}: Omit<BuildSlideParams, "dimensions">) {
  const service = content.services[0] ?? "your core offer";

  return [
    shape(`shape_${order}_side_panel`, 70, 80, 342, 920, palette.primary, 34, 0),
    shape(`shape_${order}_accent_chip`, 510, 112, 210, 54, palette.accent, 18, 1),
    text(`text_${order}_stat`, "01", 112, 132, 210, 110, 92, "bold", palette.ctaText, typography.heading, 1),
    text(`text_${order}_panel_note`, content.brandName, 112, 858, 230, 46, 26, "bold", palette.ctaText, typography.body, 1),
    text(`text_${order}_kicker`, "AUDIENCE SIGNAL", 532, 128, 160, 22, 18, "bold", palette.ctaText, typography.body, 2),
    text(`text_${order}_headline`, `Built for ${content.audience}`, 510, 226, 482, 178, 58, "bold", palette.primary, typography.heading, 2),
    text(
      `text_${order}_body`,
      fitCanvasText(`Use a ${content.voice} voice to connect ${service} with what your audience needs next.`, 160, service),
      510,
      452,
      482,
      190,
      32,
      "regular",
      palette.text,
      typography.body,
      2
    ),
    shape(`shape_${order}_proof_line`, 510, 710, 482, 3, palette.accent, 2, 1),
    text(`text_${order}_proof`, fitCanvasText(content.services.slice(0, 3).join(" | "), 105, service), 510, 744, 482, 54, 23, "medium", palette.text, typography.body, 2),
    cta(`cta_${order}`, content.cta, 510, 872, 430, 76, 26, palette.accent, palette.ctaText, typography.body, 2)
  ];
}

function buildActionElements({
  content,
  order,
  palette,
  typography
}: Omit<BuildSlideParams, "dimensions">) {
  const steps = [
    `Lead with the problem ${content.audience} already feels.`,
    `Show how ${content.services[0] ?? content.brandName} solves it clearly.`,
    "Close with one next step that is easy to take."
  ];

  return [
    shape(`shape_${order}_top_rule`, 84, 86, 190, 8, palette.accent, 4, 0),
    text(`text_${order}_headline`, "Turn the message into action", 84, 136, 820, 150, 64, "bold", palette.primary, typography.heading, 1),
    text(`text_${order}_body`, "A strong draft should give the editor structure, not lock the brand into a flat image.", 84, 304, 760, 82, 30, "regular", palette.text, typography.body, 1),
    shape(`shape_${order}_step_1_marker`, 92, 444, 64, 64, palette.accent, 32, 1, "ellipse"),
    text(`text_${order}_step_1`, fitCanvasText(steps[0], 105, "Lead with the customer problem."), 184, 430, 740, 76, 30, "medium", palette.text, typography.body, 2),
    shape(`shape_${order}_step_2_marker`, 92, 560, 64, 64, palette.primary, 32, 1, "ellipse"),
    text(`text_${order}_step_2`, fitCanvasText(steps[1], 105, "Show the solution clearly."), 184, 546, 740, 76, 30, "medium", palette.text, typography.body, 2),
    shape(`shape_${order}_step_3_marker`, 92, 676, 64, 64, palette.secondary, 32, 1, "ellipse"),
    text(`text_${order}_step_3`, steps[2], 184, 662, 740, 76, 30, "medium", palette.text, typography.body, 2),
    shape(`shape_${order}_footer`, 0, 920, 1080, 160, palette.primary, 0, 0),
    text(`text_${order}_brand`, content.brandName, 92, 974, 360, 42, 26, "bold", palette.ctaText, typography.body, 1),
    cta(`cta_${order}`, content.cta, 578, 964, 410, 72, 25, palette.accent, palette.ctaText, typography.body, 1)
  ];
}

function shape(
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  borderRadius: number,
  zIndex: number,
  shapeType: "ellipse" | "rectangle" = "rectangle"
) {
  return {
    borderRadius,
    fill,
    height,
    id,
    locked: false,
    opacity: 1,
    rotation: 0,
    shape: shapeType,
    stroke: null,
    strokeWidth: 0,
    type: "shape" as const,
    width,
    x,
    y,
    zIndex
  };
}

function text(
  id: string,
  content: string,
  x: number,
  y: number,
  width: number,
  height: number,
  fontSize: number,
  fontWeight: "bold" | "medium" | "regular" | "semibold",
  color: string,
  fontFamily: string,
  zIndex: number
) {
  return {
    color,
    content: fitCanvasText(content, 180, "Brand-ready content"),
    fontFamily,
    fontSize,
    fontWeight,
    height,
    id,
    letterSpacing: 0,
    lineHeight: fontSize >= 54 ? 1.05 : 1.22,
    locked: false,
    opacity: 1,
    rotation: 0,
    textAlign: "left" as const,
    type: "text" as const,
    width,
    x,
    y,
    zIndex
  };
}

function cta(
  id: string,
  label: string,
  x: number,
  y: number,
  width: number,
  height: number,
  fontSize: number,
  backgroundColor: string,
  textColor: string,
  fontFamily: string,
  zIndex: number
) {
  return {
    backgroundColor,
    borderRadius: 18,
    fontFamily,
    fontSize,
    height,
    id,
    label: fitCanvasText(label, previewCtaLabelMaxLength, "Learn more"),
    locked: false,
    opacity: 1,
    rotation: 0,
    textColor,
    type: "cta" as const,
    width,
    x,
    y,
    zIndex
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

function getServices(value: string | null | undefined): string[] {
  const services = (value ?? "")
    .split(/\r?\n|,/)
    .map((service) => fitCanvasText(service, 56, ""))
    .filter(Boolean)
    .slice(0, 4);

  return services.length > 0 ? services : ["brand strategy", "content planning", "creative production"];
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
}
