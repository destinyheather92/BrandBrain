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
  const palette = extractPalette(prompt.user);
  const label = summarizePrompt(prompt.prompt);
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="720" viewBox="0 0 1080 720">',
    "<defs>",
    `<linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${palette.primary}" /><stop offset="1" stop-color="${palette.accent}" /></linearGradient>`,
    '<filter id="soft"><feGaussianBlur stdDeviation="32" /></filter>',
    "</defs>",
    '<rect width="1080" height="720" fill="url(#bg)" />',
    `<circle cx="842" cy="126" r="210" fill="${palette.background}" opacity="0.2" filter="url(#soft)" />`,
    `<circle cx="176" cy="604" r="240" fill="${palette.accent}" opacity="0.18" filter="url(#soft)" />`,
    '<path d="M96 512 C260 406 384 600 552 472 C686 370 784 406 984 292" fill="none" stroke="rgba(255,255,255,0.48)" stroke-width="18" stroke-linecap="round" />',
    '<rect x="72" y="72" width="936" height="576" rx="42" fill="rgba(11,15,25,0.42)" />',
    `<text x="112" y="142" fill="${palette.background}" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" letter-spacing="4">${escapeSvgText(prompt.provider.toUpperCase())}</text>`,
    `<text x="112" y="250" fill="${palette.background}" font-family="Geist, Inter, Arial, sans-serif" font-size="54" font-weight="700">${escapeSvgText(label.firstLine)}</text>`,
    `<text x="112" y="322" fill="${palette.background}" font-family="Geist, Inter, Arial, sans-serif" font-size="54" font-weight="700">${escapeSvgText(label.secondLine)}</text>`,
    `<text x="112" y="566" fill="${palette.background}" font-family="Inter, Arial, sans-serif" font-size="26" opacity="0.86">Generated as an editable BrandBrain image object</text>`,
    "</svg>"
  ].join("");

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function extractPalette(userPayload: string): { accent: string; background: string; primary: string } {
  try {
    const payload = JSON.parse(userPayload) as {
      theme?: {
        palette?: {
          accent?: string;
          background?: string;
          primary?: string;
        };
      };
    };

    return {
      accent: payload.theme?.palette?.accent ?? "#00E5FF",
      background: payload.theme?.palette?.background ?? "#F8FAFC",
      primary: payload.theme?.palette?.primary ?? "#0B0F19"
    };
  } catch {
    return {
      accent: "#00E5FF",
      background: "#F8FAFC",
      primary: "#0B0F19"
    };
  }
}

function summarizePrompt(value: string): { firstLine: string; secondLine: string } {
  const cleaned = value
    .replace(/\s+/g, " ")
    .replace(/^Create one image for BrandBrain project "[^"]+"\.\s*/i, "")
    .trim();
  const words = cleaned.split(" ");

  return {
    firstLine: words.slice(0, 6).join(" ") || "Brand-consistent",
    secondLine: words.slice(6, 12).join(" ") || "AI image"
  };
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
