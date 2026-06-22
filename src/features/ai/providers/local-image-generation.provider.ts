import type {
  AiImageGenerationPrompt,
  AiImageGenerationProvider,
  AiImageProviderId,
  AiImageProviderRegistry
} from "../types/ai-generation";

export class LocalImageGenerationProvider implements AiImageGenerationProvider {
  constructor(readonly id: AiImageProviderId = "flux") {}

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
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="720" viewBox="0 0 1080 720">',
    "<defs>",
    `<linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${palette.primary}" /><stop offset="1" stop-color="${palette.accent}" /></linearGradient>`,
    '<filter id="soft"><feGaussianBlur stdDeviation="32" /></filter>',
    '<filter id="shadow"><feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="rgba(11,15,25,0.32)" /></filter>',
    "</defs>",
    '<rect width="1080" height="720" fill="url(#bg)" />',
    `<circle cx="842" cy="126" r="210" fill="${palette.background}" opacity="0.2" filter="url(#soft)" />`,
    `<circle cx="176" cy="604" r="240" fill="${palette.accent}" opacity="0.18" filter="url(#soft)" />`,
    '<path d="M92 528 C228 430 374 592 524 470 C650 366 810 412 988 286" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="18" stroke-linecap="round" />',
    '<rect x="72" y="72" width="936" height="576" rx="42" fill="rgba(11,15,25,0.42)" filter="url(#shadow)" />',
    `<text x="112" y="148" fill="${palette.background}" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" letter-spacing="3">${escapeSvgText(preview.brandName)}</text>`,
    `<text x="112" y="258" fill="${palette.background}" font-family="Geist, Inter, Arial, sans-serif" font-size="54" font-weight="700">${escapeSvgText(preview.headline.firstLine)}</text>`,
    `<text x="112" y="330" fill="${palette.background}" font-family="Geist, Inter, Arial, sans-serif" font-size="54" font-weight="700">${escapeSvgText(preview.headline.secondLine)}</text>`,
    `<text x="112" y="562" fill="${palette.background}" font-family="Inter, Arial, sans-serif" font-size="26" opacity="0.86">${escapeSvgText(preview.imageStyle)}</text>`,
    `<text x="112" y="602" fill="${palette.background}" font-family="Inter, Arial, sans-serif" font-size="22" opacity="0.72">Brand-ready generated asset preview</text>`,
    "</svg>"
  ].join("");

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

type LocalImagePreviewContext = {
  brandName: string;
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
        name?: string;
      };
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

    return {
      brandName: fitLocalSvgText(payload.brand?.name ?? "BrandBrain", 30),
      headline: summarizeLocalRequest(payload.userRequest ?? prompt.prompt),
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
      headline: summarizeLocalRequest(prompt.prompt),
      imageStyle: "Brand-consistent visual direction",
      palette: {
        accent: "#00E5FF",
        background: "#F8FAFC",
        primary: "#0B0F19"
      }
    };
  }
}

function summarizeLocalRequest(value: string): { firstLine: string; secondLine: string } {
  const cleaned = value
    .replace(/\s+/g, " ")
    .replace(/^Create one image for BrandBrain project "[^"]+"\.\s*/i, "")
    .replace(/^(generate|create|make|produce)\s+/i, "")
    .replace(/^(realistic\s+)?marketing photography of\s+/i, "")
    .trim();
  const words = cleaned.split(" ");

  return {
    firstLine: fitLocalSvgText(words.slice(0, 6).join(" ") || "Brand-consistent", 42),
    secondLine: fitLocalSvgText(words.slice(6, 12).join(" ") || "generated image", 42)
  };
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
