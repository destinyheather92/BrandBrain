import { canvasDocumentSchema } from "@/features/canvas/schemas/canvas-object.schema";
import type { CanvasDocument, CanvasDocumentFormat, CanvasSlide } from "@/features/canvas/types/canvas";

import type { AiCanvasGenerationProvider, AiGenerationPrompt, AiProviderRegistry } from "../types/ai-generation";
import type { CreativeBrief } from "../types/creative-brief";

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
  creativeSource?: {
    creativeBrief?: CreativeBrief | null;
    designInstructions?: string;
  };
  outputRules?: {
    contentFormat?: CanvasDocumentFormat;
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
  slidePlans: LocalSlidePlan[];
  title: string;
  topic: string;
  voice: string;
};

type LocalSlidePlan = {
  body: string;
  cta?: string;
  title: string;
};

type BuildSlideParams = {
  content: SlideContent;
  dimensions: {
    height: number;
    width: number;
  };
  order: number;
  palette: LocalPalette;
  slidePlan: LocalSlidePlan;
  typography: LocalTypography;
};

export class LocalCanvasGenerationProvider implements AiCanvasGenerationProvider {
  readonly id = "local-canvas";

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
  const contentFormat = getContentFormat(payload.outputRules?.contentFormat);
  const dimensions = formatDimensions[contentFormat];
  const slideCount = Math.min(10, Math.max(1, payload.outputRules?.slideCount ?? 3));
  const title = payload.projectTitle?.trim() || "Generated BrandBrain Carousel";
  const brandName = payload.brand?.name?.trim() || "Brand";
  const instructionProfile = extractInstructionProfile(payload);
  const creativeBrief = payload.creativeSource?.creativeBrief ?? null;
  const cta = creativeBrief?.cta ?? instructionProfile.cta ?? selectCtaLabel(payload.brand?.memory?.preferredCtas);
  const topic = fitCanvasText(creativeBrief?.hook ?? instructionProfile.summary ?? payload.userRequest, 160, title);
  const audience = fitCanvasText(creativeBrief?.audience ?? payload.brand?.memory?.audience, 96, "your ideal customers");
  const services = getServices(payload.brand?.memory?.productsServices);
  const voice = fitCanvasText(payload.brand?.memory?.voice, 90, "clear, practical, on-brand");
  const themePalette = {
    accent: payload.theme?.palette?.accent ?? "#00E5FF",
    background: payload.theme?.palette?.background ?? "#FFFFFF",
    ctaText: payload.theme?.palette?.ctaText ?? "#0B0F19",
    primary: payload.theme?.palette?.primary ?? "#0B0F19",
    secondary: payload.theme?.palette?.secondary ?? payload.theme?.palette?.surface ?? "#E2E8F0",
    surface: payload.theme?.palette?.surface ?? "#F8FAFC",
    text: payload.theme?.palette?.text ?? "#0B0F19"
  };
  const palette = applyInstructionPalette(themePalette, instructionProfile);
  const typography = {
    body: instructionProfile.bodyFont ?? payload.theme?.typography?.body ?? "Inter",
    heading: instructionProfile.headingFont ?? payload.theme?.typography?.heading ?? "Geist"
  };
  const slidePlans = createSlidePlans({
    audience,
    brandName,
    cta,
    requestedSlideCount: slideCount,
    services,
    title,
    topic,
    voice,
    creativeBrief,
    extractedPlans: instructionProfile.slides
  });
  const slides = Array.from({ length: slideCount }, (_, index) =>
    buildSlide({
      content: {
        audience,
        brandName,
        cta,
        services,
        slidePlans,
        title,
        topic,
        voice
      },
      dimensions,
      order: index + 1,
      palette,
      slidePlan: slidePlans[index] ?? slidePlans[slidePlans.length - 1] ?? {
        body: topic,
        title
      },
      typography
    })
  );

  return canvasDocumentSchema.parse({
    documentId: `document_generated_${slugify(title)}`,
    format: contentFormat,
    height: dimensions.height,
    schemaVersion: "1.0.0",
    slides,
    themeId: null,
    title,
    unit: "px",
    width: dimensions.width
  });
}

function getContentFormat(value: CanvasDocumentFormat | undefined): CanvasDocumentFormat {
  return value && value in formatDimensions ? value : "instagram-carousel";
}

function buildSlide({
  content,
  dimensions,
  order,
  palette,
  slidePlan,
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
      elements: buildCoverElements({ content, order, palette, slidePlan, typography })
    };
  }

  if (order % 3 === 2) {
    return {
      ...slideParams,
      elements: buildInsightElements({ content, order, palette, slidePlan, typography })
    };
  }

  return {
    ...slideParams,
    elements: buildActionElements({ content, order, palette, slidePlan, typography })
  };
}

function buildCoverElements({
  content,
  order,
  palette,
  slidePlan,
  typography
}: Omit<BuildSlideParams, "dimensions">) {
  return [
    shape(`shape_${order}_accent_bar`, 0, 0, 22, 1080, palette.accent, 0, 0),
    shape(`shape_${order}_corner_block`, 742, 0, 338, 338, palette.secondary, 42, 0),
    shape(`shape_${order}_kicker_pill`, 84, 84, 366, 54, palette.primary, 18, 1),
    text(`text_${order}_kicker`, content.brandName.toUpperCase(), 112, 101, 308, 26, 20, "bold", palette.ctaText, typography.body, 2),
    text(`text_${order}_headline`, fitCanvasText(slidePlan.title, 86, content.title), 84, 218, 812, 240, 76, "bold", palette.primary, typography.heading, 2),
    shape(`shape_${order}_accent_rule`, 84, 512, 118, 8, palette.accent, 4, 1),
    text(`text_${order}_body`, slidePlan.body, 84, 552, 746, 150, 34, "regular", palette.text, typography.body, 2),
    text(`text_${order}_brand_note`, `Designed for ${content.audience}`, 84, 902, 430, 48, 24, "medium", palette.text, typography.body, 2),
    cta(`cta_${order}`, slidePlan.cta ?? content.cta, 578, 882, 418, 80, 28, palette.accent, palette.ctaText, typography.body, 2)
  ];
}

function buildInsightElements({
  content,
  order,
  palette,
  slidePlan,
  typography
}: Omit<BuildSlideParams, "dimensions">) {
  const service = content.services[0] ?? "your core offer";

  return [
    shape(`shape_${order}_side_panel`, 70, 80, 342, 920, palette.primary, 34, 0),
    shape(`shape_${order}_accent_chip`, 510, 112, 210, 54, palette.accent, 18, 1),
    text(`text_${order}_stat`, "01", 112, 132, 210, 110, 92, "bold", palette.ctaText, typography.heading, 1),
    text(`text_${order}_panel_note`, content.brandName, 112, 858, 230, 46, 26, "bold", palette.ctaText, typography.body, 1),
    text(`text_${order}_kicker`, "AUDIENCE SIGNAL", 532, 128, 160, 22, 18, "bold", palette.ctaText, typography.body, 2),
    text(`text_${order}_headline`, slidePlan.title, 510, 226, 482, 178, 58, "bold", palette.primary, typography.heading, 2),
    text(
      `text_${order}_body`,
      fitCanvasText(slidePlan.body || `Use a ${content.voice} voice to connect ${service} with what your audience needs next.`, 160, service),
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
    text(`text_${order}_proof`, fitCanvasText(content.services.slice(0, 3).join(", "), 105, service), 510, 744, 482, 54, 23, "medium", palette.text, typography.body, 2),
    cta(`cta_${order}`, slidePlan.cta ?? content.cta, 510, 872, 430, 76, 26, palette.accent, palette.ctaText, typography.body, 2)
  ];
}

function buildActionElements({
  content,
  order,
  palette,
  slidePlan,
  typography
}: Omit<BuildSlideParams, "dimensions">) {
  const steps = [
    `Lead with the problem ${content.audience} already feels.`,
    `Show how ${content.services[0] ?? content.brandName} solves it clearly.`,
    "Close with one next step that is easy to take."
  ];

  return [
    shape(`shape_${order}_top_rule`, 84, 86, 190, 8, palette.accent, 4, 0),
    text(`text_${order}_headline`, slidePlan.title, 84, 136, 820, 150, 64, "bold", palette.primary, typography.heading, 1),
    text(`text_${order}_body`, slidePlan.body, 84, 304, 760, 82, 30, "regular", palette.text, typography.body, 1),
    shape(`shape_${order}_step_1_marker`, 92, 444, 64, 64, palette.accent, 32, 1, "ellipse"),
    text(`text_${order}_step_1`, fitCanvasText(steps[0], 105, "Lead with the customer problem."), 184, 430, 740, 76, 30, "medium", palette.text, typography.body, 2),
    shape(`shape_${order}_step_2_marker`, 92, 560, 64, 64, palette.primary, 32, 1, "ellipse"),
    text(`text_${order}_step_2`, fitCanvasText(steps[1], 105, "Show the solution clearly."), 184, 546, 740, 76, 30, "medium", palette.text, typography.body, 2),
    shape(`shape_${order}_step_3_marker`, 92, 676, 64, 64, palette.secondary, 32, 1, "ellipse"),
    text(`text_${order}_step_3`, steps[2], 184, 662, 740, 76, 30, "medium", palette.text, typography.body, 2),
    shape(`shape_${order}_footer`, 0, 920, 1080, 160, palette.primary, 0, 0),
    text(`text_${order}_brand`, content.brandName, 92, 974, 360, 42, 26, "bold", palette.ctaText, typography.body, 1),
    cta(`cta_${order}`, slidePlan.cta ?? content.cta, 578, 964, 410, 72, 25, palette.accent, palette.ctaText, typography.body, 1)
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

function selectCtaLabel(value: string | null | undefined): string {
  const candidates = getCtaCandidates(value);
  const selected =
    candidates.find((candidate) => /^(book|call|contact|download|explore|get|join|learn|schedule|start|try|visit)\b/i.test(candidate)) ??
    candidates[0];

  return fitCanvasText(selected, previewCtaLabelMaxLength, "Learn more");
}

function getCtaCandidates(value: string | null | undefined): string[] {
  const source = (value ?? "")
    .replace(/\b(?:cta|ctas|examples?|preferred)\s*:/gi, "")
    .split(/\r?\n|[.;!?]+|,|\s+\|\s+/)
    .map((candidate) =>
      candidate
        .replace(/^[-*•\d.)\s]+/, "")
        .replace(/^["'“”‘’]+|["'“”‘’]+$/g, "")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter((candidate) => candidate.length > 0 && !/^(and|or)$/i.test(candidate));

  return source.length > 0 ? source : ["Learn more"];
}

function getServices(value: string | null | undefined): string[] {
  const services = (value ?? "")
    .split(/\r?\n|,/)
    .map((service) => fitCanvasText(service, 56, ""))
    .filter(Boolean)
    .slice(0, 4);

  return services.length > 0 ? services : ["brand strategy", "content planning", "creative production"];
}

type InstructionProfile = {
  accentColor?: string;
  backgroundColor?: string;
  bodyFont?: string;
  cta?: string;
  headingFont?: string;
  primaryColor?: string;
  slides: LocalSlidePlan[];
  summary?: string;
};

function extractInstructionProfile(payload: PromptPayload): InstructionProfile {
  const instructionText = [payload.creativeSource?.designInstructions, payload.userRequest]
    .filter(Boolean)
    .join("\n")
    .trim();
  const colorHints = extractInstructionColors(instructionText);

  return {
    ...colorHints,
    ...extractInstructionFonts(instructionText),
    cta: extractInstructionCta(instructionText),
    slides: extractInstructionSlides(instructionText),
    summary: summarizeInstructionText(instructionText)
  };
}

function applyInstructionPalette(palette: LocalPalette, profile: InstructionProfile): LocalPalette {
  const primary = profile.primaryColor ?? palette.primary;
  const accent = profile.accentColor ?? palette.accent;
  const background = profile.backgroundColor ?? palette.background;

  return {
    ...palette,
    accent,
    background,
    ctaText: profile.accentColor ? readableTextColor(accent) : palette.ctaText,
    primary,
    secondary: profile.accentColor ?? palette.secondary,
    surface: profile.backgroundColor ?? palette.surface,
    text: primary
  };
}

function createSlidePlans({
  audience,
  brandName,
  cta,
  extractedPlans,
  creativeBrief,
  requestedSlideCount,
  services,
  title,
  topic,
  voice
}: {
  audience: string;
  brandName: string;
  cta: string;
  extractedPlans: LocalSlidePlan[];
  creativeBrief: CreativeBrief | null;
  requestedSlideCount: number;
  services: string[];
  title: string;
  topic: string;
  voice: string;
}): LocalSlidePlan[] {
  const refinedPlans = extractedPlans.length > 0 ? extractedPlans : creativeBrief ? buildBriefSlidePlans({
    brandName,
    brief: creativeBrief
  }) : buildRefinedPlans({
    audience,
    brandName,
    cta,
    services,
    title,
    topic,
    voice
  });

  return Array.from({ length: requestedSlideCount }, (_, index) => {
    const plan = refinedPlans[index] ?? refinedPlans[refinedPlans.length - 1] ?? {
      body: topic,
      title
    };

    return {
      body: fitCanvasText(plan.body, 180, topic),
      cta: plan.cta ? fitCanvasText(plan.cta, previewCtaLabelMaxLength, cta) : cta,
      title: fitCanvasText(plan.title, 120, title)
    };
  });
}

function buildBriefSlidePlans({
  brandName,
  brief
}: {
  brandName: string;
  brief: CreativeBrief;
}): LocalSlidePlan[] {
  return [
    {
      body: brief.angle,
      cta: brief.cta,
      title: brief.hook
    },
    {
      body: brief.goal,
      cta: brief.cta,
      title: `For ${brief.audience}`
    },
    {
      body: `${brandName} can help turn this into one calm, clear next step.`,
      cta: brief.cta,
      title: brief.cta
    }
  ];
}

function buildRefinedPlans({
  audience,
  brandName,
  cta,
  services,
  title,
  topic,
  voice
}: {
  audience: string;
  brandName: string;
  cta: string;
  services: string[];
  title: string;
  topic: string;
  voice: string;
}): LocalSlidePlan[] {
  const serviceList = services.slice(0, 3).join(", ");
  const mainTopic = deriveMainTopic(topic, title, services);
  const audiencePhrase = lowerFirst(audience);
  const domain = inferBrandDomain({
    audience,
    brandName,
    services,
    title,
    topic,
    voice
  });

  if (domain === "mental-health") {
    return [
      {
        body: `For ${audiencePhrase}, ${serviceList} should feel warm, calm, and manageable.`,
        cta,
        title: `${mainTopic} with steady support`
      },
      {
        body: `Name what your body is signaling, then offer one practical grounding step people can try gently.`,
        cta,
        title: "Make the next moment feel safer"
      },
      {
        body: `${brandName} supports ${serviceList.toLowerCase()} with ${lowerFirst(voice)} guidance.`,
        cta,
        title: "Take the next gentle step"
      }
    ];
  }

  if (domain === "land-management") {
    return [
      {
        body: `For ${audiencePhrase}, ${serviceList} starts with access, water flow, and usable ground.`,
        cta,
        title: `${mainTopic} that protects your property`
      },
      {
        body: `Clear access first so equipment, drainage, and grading decisions happen in the right order.`,
        cta,
        title: "Start with the path crews need"
      },
      {
        body: `${brandName} helps prioritize ${serviceList.toLowerCase()} before the season creates bigger problems.`,
        cta,
        title: "Plan the next right step"
      }
    ];
  }

  return [
    {
      body: `For ${audiencePhrase}, connect ${serviceList} to one clear problem and one useful next step.`,
      cta,
      title: `${mainTopic} with a clear next step`
    },
    {
      body: `Lead with the practical insight, then explain why it matters in a ${lowerFirst(voice)} voice.`,
      cta,
      title: "Show what matters first"
    },
    {
      body: `${brandName} helps people understand the choice in front of them without guessing.`,
      cta,
      title: "Make action feel simple"
    }
  ];
}

type BrandDomain = "generic" | "land-management" | "mental-health";

function inferBrandDomain({
  audience,
  brandName,
  services,
  title,
  topic,
  voice
}: {
  audience: string;
  brandName: string;
  services: string[];
  title: string;
  topic: string;
  voice: string;
}): BrandDomain {
  const context = [audience, brandName, services.join(" "), title, topic, voice].join(" ").toLowerCase();

  if (
    /\b(counseling|counselling|therapy|therapist|mental health|anxiety|trauma|nervous system|burnout|grounding|somatic|emotional|wellness|psychotherapy)\b/.test(
      context
    )
  ) {
    return "mental-health";
  }

  if (/\b(land clearing|land management|grading|drainage|acreage|brush|forestry|rural|storm cleanup)\b/.test(context)) {
    return "land-management";
  }

  return "generic";
}

function extractInstructionColors(value: string): Pick<
  InstructionProfile,
  "accentColor" | "backgroundColor" | "primaryColor"
> {
  const primaryColor = extractLabeledColor(value, "primary");
  const accentColor = extractLabeledColor(value, "accent");
  const backgroundColor = extractLabeledColor(value, "background");
  const allColors = extractHexColors(value);

  return {
    accentColor: accentColor ?? allColors.find((color) => color !== primaryColor) ?? allColors[1],
    backgroundColor,
    primaryColor: primaryColor ?? allColors[0]
  };
}

function extractInstructionFonts(value: string): Pick<InstructionProfile, "bodyFont" | "headingFont"> {
  const fontLine = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => /^fonts?\s*:/i.test(line));

  if (!fontLine) {
    return {};
  }

  const fontText = fontLine.replace(/^fonts?\s*:\s*/i, "");
  const headingFont = fontText.match(/(.+?)\s+for\s+(?:headlines?|headings?)/i)?.[1]?.split(",").pop()?.trim();
  const bodyFont = fontText.match(/,\s*(.+?)\s+for\s+body/i)?.[1]?.trim();

  return {
    bodyFont: bodyFont || undefined,
    headingFont: headingFont || undefined
  };
}

function extractInstructionCta(value: string): string | undefined {
  const ctaLine = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => /^cta\s*:/i.test(line));
  const cta = ctaLine?.replace(/^cta\s*:\s*/i, "").trim();

  return cta ? fitCanvasText(cta, previewCtaLabelMaxLength, cta) : undefined;
}

function extractInstructionSlides(value: string): LocalSlidePlan[] {
  const lines = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const slides: Array<LocalSlidePlan & { bodyParts: string[] }> = [];
  let current: (LocalSlidePlan & { bodyParts: string[] }) | null = null;

  for (const line of lines) {
    const slideMatch = line.match(/^slide\s+(\d+)\s*(?:[-:]\s*)?(.*)$/i);

    if (slideMatch) {
      if (current) {
        slides.push(current);
      }

      current = {
        body: "",
        bodyParts: [],
        title: cleanInstructionText(slideMatch[2] || `Slide ${slideMatch[1]}`)
      };
      continue;
    }

    if (!current) {
      continue;
    }

    if (/^headline\s*:/i.test(line)) {
      current.title = cleanInstructionText(line.replace(/^headline\s*:\s*/i, ""));
      continue;
    }

    if (/^body\s*:/i.test(line)) {
      current.bodyParts.push(cleanInstructionText(line.replace(/^body\s*:\s*/i, "")));
      continue;
    }

    if (/^cta\s*:/i.test(line)) {
      current.cta = cleanInstructionText(line.replace(/^cta\s*:\s*/i, ""));
      continue;
    }

    if (!/^(primary|accent|background|fonts?)\s*:/i.test(line)) {
      current.bodyParts.push(cleanInstructionText(line));
    }
  }

  if (current) {
    slides.push(current);
  }

  return slides
    .map(({ bodyParts, ...slide }) => ({
      ...slide,
      body: bodyParts.join(" ").trim() || slide.title
    }))
    .filter((slide) => slide.title || slide.body);
}

function extractLabeledColor(value: string, label: string): string | undefined {
  const pattern = new RegExp(`\\b${label}\\s*(?:color)?\\s*:\\s*(#[0-9A-Fa-f]{6})\\b`, "i");
  const color = value.match(pattern)?.[1];

  return color ? normalizeHexColor(color) : undefined;
}

function extractHexColors(value: string): string[] {
  const matches = value.match(/#[0-9A-Fa-f]{6}\b/g) ?? [];

  return matches.reduce<string[]>((colors, color) => {
    const normalized = normalizeHexColor(color);

    if (!colors.includes(normalized)) {
      colors.push(normalized);
    }

    return colors;
  }, []);
}

function summarizeInstructionText(value: string): string | undefined {
  const firstUsefulLine = value
    .split(/\r?\n/)
    .map(cleanInstructionText)
    .find((line) => line && !/^(chatgpt response|create a canva|primary|accent|background|fonts?|slide \d+)/i.test(line));

  return firstUsefulLine;
}

function deriveMainTopic(topic: string, title: string, services: string[]): string {
  const normalizedTopic = topic.toLowerCase();
  const matchingService = services.find((service) => normalizedTopic.includes(service.toLowerCase()));

  if (matchingService) {
    return capitalizeFirst(matchingService);
  }

  const topicMatch = normalizedTopic.match(/\b(?:about|for)\s+([a-z\s]{4,60})[.!?]?$/);

  if (topicMatch?.[1]) {
    return capitalizeFirst(topicMatch[1].trim());
  }

  return fitCanvasText(title, 64, "Brand message");
}

function cleanInstructionText(value: string): string {
  return value
    .replace(/^[-*\u2022\d.)\s]+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeHexColor(color: string): string {
  return color.toUpperCase();
}

function readableTextColor(background: string): "#0B0F19" | "#FFFFFF" {
  const red = parseInt(background.slice(1, 3), 16);
  const green = parseInt(background.slice(3, 5), 16);
  const blue = parseInt(background.slice(5, 7), 16);
  const luminance = (red * 299 + green * 587 + blue * 114) / 1000;

  return luminance > 150 ? "#0B0F19" : "#FFFFFF";
}

function lowerFirst(value: string): string {
  return value ? `${value.charAt(0).toLowerCase()}${value.slice(1)}` : value;
}

function capitalizeFirst(value: string): string {
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
}
