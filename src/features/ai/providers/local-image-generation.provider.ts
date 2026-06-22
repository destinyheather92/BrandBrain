import type {
  AiImageGenerationPrompt,
  AiImageGenerationProvider,
  AiImageElementProviderId,
  AiImageProviderId,
  AiImageProviderRegistry
} from "../types/ai-generation";

export class LocalImageGenerationProvider implements AiImageGenerationProvider {
  constructor(readonly id: AiImageElementProviderId = "local-image") {}

  async generateImage(prompt: AiImageGenerationPrompt) {
    return {
      imageUrl: buildLocalSvgDataUrl(prompt),
      usage: {
        cost: 0,
        tokens: estimateTokens(prompt.system, prompt.prompt, prompt.negativePrompt)
      }
    };
  }
}

export function createDefaultAiImageProviderRegistry(): AiImageProviderRegistry {
  const providers = {
    flux: new LocalImageGenerationProvider("flux"),
    ideogram: new LocalImageGenerationProvider("ideogram"),
    imagen: new LocalImageGenerationProvider("imagen"),
    openai: new LocalImageGenerationProvider("openai")
  } satisfies Record<AiImageProviderId, AiImageGenerationProvider>;

  return {
    getImageProvider(providerId) {
      return providers[providerId];
    }
  };
}

function buildLocalSvgDataUrl(prompt: AiImageGenerationPrompt): string {
  const preview = extractPreviewContext(prompt);
  const palette = preview.palette;
  const scene = buildPreviewScene(preview);
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="720" viewBox="0 0 1080 720">',
    `<title>${escapeSvgText(scene.title)}</title>`,
    "<defs>",
    `<linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${palette.background}" /><stop offset="1" stop-color="${scene.backgroundAccent}" /></linearGradient>`,
    '<filter id="soft"><feGaussianBlur stdDeviation="32" /></filter>',
    '<filter id="shadow"><feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="rgba(11,15,25,0.22)" /></filter>',
    "</defs>",
    '<rect width="1080" height="720" fill="url(#bg)" />',
    ...scene.elements,
    `<text x="72" y="84" fill="${palette.primary}" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="2">${escapeSvgText(preview.brandName)}</text>`,
    `<text x="72" y="628" fill="${palette.primary}" font-family="Geist, Inter, Arial, sans-serif" font-size="34" font-weight="700">${escapeSvgText(preview.headline.firstLine)}</text>`,
    `<text x="72" y="670" fill="${palette.primary}" font-family="Inter, Arial, sans-serif" font-size="22" opacity="0.82">${escapeSvgText(preview.headline.secondLine)}</text>`,
    "</svg>"
  ].join("");

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

type LocalImagePreviewContext = {
  brandName: string;
  domain: "generic" | "land-management" | "mental-health";
  headline: {
    firstLine: string;
    secondLine: string;
  };
  imageStyle: string;
  palette: {
    accent: string;
    background: string;
    primary: string;
  };
};

function extractPreviewContext(prompt: AiImageGenerationPrompt): LocalImagePreviewContext {
  try {
    const payload = JSON.parse(prompt.user) as {
      brand?: {
        description?: string | null;
        industry?: string | null;
        memory?: {
          audience?: string | null;
          productsServices?: string | null;
          voice?: string | null;
        } | null;
        name?: string;
      };
      slideContext?: string | null;
      theme?: {
        imageStyle?: string;
        palette?: {
          accent?: string;
          background?: string;
          primary?: string;
        };
      };
      userRequest?: string;
    };
    const request = selectPreviewRequest(payload.userRequest ?? prompt.prompt, payload.slideContext ?? "");
    const domain = inferPreviewDomain(payload);

    return {
      brandName: fitLocalSvgText(payload.brand?.name ?? "BrandBrain", 30),
      domain,
      headline: summarizeLocalRequest(request, domain),
      imageStyle: fitLocalSvgText(payload.theme?.imageStyle ?? "Brand-consistent visual direction", 78),
      palette: {
        accent: payload.theme?.palette?.accent ?? "#00E5FF",
        background: payload.theme?.palette?.background ?? "#F8FAFC",
        primary: payload.theme?.palette?.primary ?? "#0B0F19"
      }
    };
  } catch {
    return {
      brandName: "BrandBrain",
      domain: "generic",
      headline: summarizeLocalRequest(prompt.prompt, "generic"),
      imageStyle: "Brand-consistent visual direction",
      palette: {
        accent: "#00E5FF",
        background: "#F8FAFC",
        primary: "#0B0F19"
      }
    };
  }
}

function selectPreviewRequest(userRequest: string, slideContext: string): string {
  if (isGenericImageRequest(userRequest) && slideContext.trim()) {
    return slideContext;
  }

  return userRequest;
}

function summarizeLocalRequest(
  value: string,
  domain: LocalImagePreviewContext["domain"]
): { firstLine: string; secondLine: string } {
  const cleaned = value
    .replace(/\s+/g, " ")
    .replace(/^Create one image for BrandBrain project "[^"]+"\.\s*/i, "")
    .replace(/^(generate|create|make|produce)\s+/i, "")
    .replace(/^(realistic\s+)?marketing photography of\s+/i, "")
    .replace(/^a\s+brand-consistent\s+image\s+for\s+this\s+slide\.?$/i, "")
    .trim();
  const words = cleaned.split(" ");

  return {
    firstLine: fitLocalSvgText(words.slice(0, 7).join(" ") || fallbackHeadline(domain), 52),
    secondLine: fitLocalSvgText(words.slice(7, 15).join(" ") || fallbackDetail(domain), 62)
  };
}

function buildPreviewScene(preview: LocalImagePreviewContext): {
  backgroundAccent: string;
  elements: string[];
  title: string;
} {
  if (preview.domain === "mental-health") {
    return {
      backgroundAccent: preview.palette.accent,
      elements: [
        `<rect x="86" y="138" width="908" height="390" rx="46" fill="${preview.palette.background}" opacity="0.72" filter="url(#shadow)" />`,
        `<rect x="154" y="276" width="312" height="156" rx="34" fill="${preview.palette.primary}" opacity="0.16" />`,
        `<rect x="596" y="270" width="296" height="162" rx="34" fill="${preview.palette.accent}" opacity="0.28" />`,
        `<circle cx="300" cy="236" r="56" fill="${preview.palette.accent}" opacity="0.55" />`,
        `<circle cx="736" cy="228" r="54" fill="${preview.palette.primary}" opacity="0.22" />`,
        `<path d="M230 474 C318 418 430 418 520 474 C614 532 744 530 838 474" fill="none" stroke="${preview.palette.primary}" stroke-width="10" stroke-linecap="round" opacity="0.34" />`,
        `<path d="M494 214 C540 172 608 174 654 214 C608 254 540 254 494 214Z" fill="${preview.palette.accent}" opacity="0.48" />`,
        `<text x="146" y="186" fill="${preview.palette.primary}" font-family="Inter, Arial, sans-serif" font-size="18" opacity="0.68">calm counseling space</text>`,
        `<text x="146" y="508" fill="${preview.palette.primary}" font-family="Inter, Arial, sans-serif" font-size="18" opacity="0.68">grounding support in soft natural light</text>`
      ],
      title: `${preview.brandName} calm counseling space grounding visual`
    };
  }

  if (preview.domain === "land-management") {
    return {
      backgroundAccent: preview.palette.accent,
      elements: [
        `<rect x="0" y="402" width="1080" height="318" fill="${preview.palette.primary}" opacity="0.16" />`,
        `<path d="M0 456 C170 392 296 438 420 392 C578 334 720 378 1080 300 L1080 720 L0 720Z" fill="${preview.palette.primary}" opacity="0.52" />`,
        `<path d="M86 546 C260 490 394 560 572 486 C730 420 896 438 1020 364" fill="none" stroke="${preview.palette.accent}" stroke-width="26" stroke-linecap="round" opacity="0.74" />`,
        `<circle cx="872" cy="168" r="86" fill="${preview.palette.accent}" opacity="0.58" />`,
        `<rect x="164" y="366" width="184" height="92" rx="18" fill="${preview.palette.background}" opacity="0.82" filter="url(#shadow)" />`,
        `<text x="72" y="132" fill="${preview.palette.primary}" font-family="Inter, Arial, sans-serif" font-size="18" opacity="0.7">freshly graded land and outdoor work detail</text>`
      ],
      title: `${preview.brandName} land management visual`
    };
  }

  return {
    backgroundAccent: preview.palette.accent,
    elements: [
      `<rect x="96" y="150" width="888" height="360" rx="42" fill="${preview.palette.background}" opacity="0.78" filter="url(#shadow)" />`,
      `<circle cx="266" cy="332" r="112" fill="${preview.palette.accent}" opacity="0.32" />`,
      `<rect x="470" y="238" width="360" height="54" rx="18" fill="${preview.palette.primary}" opacity="0.22" />`,
      `<rect x="470" y="324" width="286" height="38" rx="16" fill="${preview.palette.accent}" opacity="0.32" />`,
      `<rect x="470" y="392" width="420" height="34" rx="16" fill="${preview.palette.primary}" opacity="0.14" />`,
      `<text x="146" y="548" fill="${preview.palette.primary}" font-family="Inter, Arial, sans-serif" font-size="18" opacity="0.68">specific supporting brand image</text>`
    ],
    title: `${preview.brandName} specific supporting brand image`
  };
}

function inferPreviewDomain(payload: {
  brand?: {
    description?: string | null;
    industry?: string | null;
    memory?: {
      audience?: string | null;
      productsServices?: string | null;
      voice?: string | null;
    } | null;
    name?: string;
  };
  slideContext?: string | null;
  userRequest?: string;
}): LocalImagePreviewContext["domain"] {
  const context = [
    payload.brand?.name,
    payload.brand?.industry,
    payload.brand?.description,
    payload.brand?.memory?.audience,
    payload.brand?.memory?.productsServices,
    payload.brand?.memory?.voice,
    payload.slideContext,
    payload.userRequest
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/\b(counseling|counselling|therapy|therapist|mental health|anxiety|trauma|nervous system|grounding|somatic|wellness|psychotherapy)\b/.test(context)) {
    return "mental-health";
  }

  if (/\b(land clearing|land management|grading|drainage|acreage|brush|forestry|rural|storm cleanup|graded land)\b/.test(context)) {
    return "land-management";
  }

  return "generic";
}

function isGenericImageRequest(value: string): boolean {
  return /\bbrand-consistent image for this slide\b/i.test(value) || /\bsupporting image based on this slide\b/i.test(value);
}

function fallbackHeadline(domain: LocalImagePreviewContext["domain"]): string {
  if (domain === "mental-health") {
    return "calm counseling space";
  }

  if (domain === "land-management") {
    return "freshly graded land";
  }

  return "specific brand image";
}

function fallbackDetail(domain: LocalImagePreviewContext["domain"]): string {
  if (domain === "mental-health") {
    return "grounding support";
  }

  if (domain === "land-management") {
    return "outdoor work detail";
  }

  return "supporting visual";
}

function fitLocalSvgText(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trim()}...`;
}

function escapeSvgText(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function estimateTokens(...values: string[]): number {
  return Math.ceil(values.join(" ").length / 4);
}
