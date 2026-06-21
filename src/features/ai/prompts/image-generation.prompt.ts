import type {
  AiGenerationBrandContext,
  AiGenerationThemeContext,
  AiImageGenerationPrompt,
  AiImageProviderId,
  AiImageProviderPreference
} from "../types/ai-generation";

export const IMAGE_GENERATION_PROMPT_VERSION = "1.0.0";

type BuildImageGenerationPromptParams = {
  brand: AiGenerationBrandContext;
  preferredProvider: AiImageProviderPreference;
  projectTitle: string;
  theme: AiGenerationThemeContext;
  userRequest: string;
};

export function buildImageGenerationPrompt({
  brand,
  preferredProvider,
  projectTitle,
  theme,
  userRequest
}: BuildImageGenerationPromptParams): AiImageGenerationPrompt {
  const normalizedRequest = normalizeText(userRequest, "Create a brand-consistent marketing image.");
  const provider = preferredProvider === "auto" ? selectImageProvider(normalizedRequest, theme.imageStyle) : preferredProvider;
  const prompt = [
    `Create one image for BrandBrain project "${projectTitle}".`,
    `Brand: ${brand.name}.`,
    brand.industry ? `Industry: ${brand.industry}.` : "",
    brand.description ? `Brand description: ${brand.description}.` : "",
    brand.memory?.audience ? `Audience: ${brand.memory.audience}.` : "",
    brand.memory?.productsServices ? `Offer context: ${brand.memory.productsServices}.` : "",
    brand.memory?.voice ? `Voice: ${brand.memory.voice}.` : "",
    brand.memory?.brandRules ? `Brand rules: ${brand.memory.brandRules}.` : "",
    `Approved image style: ${theme.imageStyle}.`,
    `Use brand palette cues: primary ${theme.palette.primary}, accent ${theme.palette.accent}, background ${theme.palette.background}.`,
    `User image request: ${normalizedRequest}.`,
    "Make the result polished, premium, professional, and usable inside an editable marketing canvas."
  ]
    .filter(Boolean)
    .join(" ");

  return {
    negativePrompt: [
      "off-brand colors",
      "generic AI startup aesthetic",
      "cartoon visuals",
      "distorted text",
      "watermarks",
      "low resolution",
      "messy composition"
    ].join(", "),
    prompt,
    provider,
    system: [
      `BrandBrain image generation prompt v${IMAGE_GENERATION_PROMPT_VERSION}.`,
      "Return image generation instructions for one canvas image asset.",
      "Do not generate slide copy, HTML, markdown, or a flat rendered slide.",
      "The resulting image will be stored as an editable canvas image object."
    ].join(" "),
    temperature: 0.7,
    user: JSON.stringify(
      {
        brand,
        projectTitle,
        provider,
        theme,
        userRequest: normalizedRequest
      },
      null,
      2
    ),
    workflow: "image-generation"
  };
}

function selectImageProvider(userRequest: string, imageStyle: string): AiImageProviderId {
  const searchable = `${userRequest} ${imageStyle}`.toLowerCase();

  if (/\b(text|typography|poster|cover|graphic|headline|wordmark)\b/.test(searchable)) {
    return "ideogram";
  }

  if (/\b(consistent|series|brand imagery|campaign)\b/.test(searchable)) {
    return "imagen";
  }

  if (/\b(photo|photography|product|mockup|realistic|camera|scene)\b/.test(searchable)) {
    return "flux";
  }

  return "flux";
}

function normalizeText(value: string, fallback: string): string {
  return value.replace(/\s+/g, " ").trim() || fallback;
}
