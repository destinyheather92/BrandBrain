import type {
  AiGenerationBrandContext,
  AiGenerationThemeContext,
  AiImageGenerationPrompt,
  AiImageProviderId
} from "../types/ai-generation";

export const IMAGE_GENERATION_PROMPT_VERSION = "1.0.0";

type BuildImageGenerationPromptParams = {
  brand: AiGenerationBrandContext;
  projectTitle: string;
  theme: AiGenerationThemeContext;
  userRequest: string;
};

export function buildImageGenerationPrompt({
  brand,
  projectTitle,
  theme,
  userRequest
}: BuildImageGenerationPromptParams): AiImageGenerationPrompt {
  const normalizedRequest = normalizeText(userRequest, "Create a brand-consistent marketing image.");
  const provider = selectImageProvider(normalizedRequest, theme.imageStyle);
  const providerRole = imageProviderRole(provider);
  const brandRules = [brand.memory?.brandRules, brand.memory?.notes].filter(Boolean).join(" ");
  const prompt = [
    `Create one image for BrandBrain project "${projectTitle}".`,
    `Internal image route: ${providerRole}.`,
    `Brand: ${brand.name}.`,
    brand.industry ? `Industry: ${brand.industry}.` : "",
    brand.description ? `Brand description: ${brand.description}.` : "",
    brand.memory?.audience ? `Audience: ${brand.memory.audience}.` : "",
    brand.memory?.productsServices ? `Offer context: ${brand.memory.productsServices}.` : "",
    brand.memory?.voice ? `Voice: ${brand.memory.voice}.` : "",
    brandRules ? `Brand rules and memory notes: ${brandRules}.` : "",
    brand.memory?.preferredCtas ? `CTA context to inspire visual intent, not embedded text: ${brand.memory.preferredCtas}.` : "",
    `Approved image style: ${theme.imageStyle}.`,
    `Use brand palette cues: primary ${theme.palette.primary}, accent ${theme.palette.accent}, background ${theme.palette.background}.`,
    `User image request: ${normalizedRequest}.`,
    "Make the result specific, non-generic, polished, premium, professional, and usable inside an editable marketing canvas.",
    "Include a clear subject, real-world context, composition direction, lighting, camera or graphic treatment, and brand-specific visual cues.",
    "Do not create placeholder abstraction, random gradients, generic AI art, text-heavy gibberish, or a finished slide layout."
  ]
    .filter(Boolean)
    .join(" ");

  return {
    negativePrompt: [
      "off-brand colors",
      "generic AI startup aesthetic",
      "generic placeholder imagery",
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
      "Select the internal image provider automatically from BrandBrain's product discovery rules.",
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

  if (/\b(text|text-heavy|typography|poster|cover|carousel cover|social graphic|graphic|headline|wordmark)\b/.test(searchable)) {
    return "ideogram";
  }

  if (/\b(consistent|series|brand imagery|campaign|campaign-wide|recurring|visual system)\b/.test(searchable)) {
    return "imagen";
  }

  if (/\b(photo|photography|product|mockup|realistic|camera|scene)\b/.test(searchable)) {
    return "flux";
  }

  return "flux";
}

function imageProviderRole(provider: AiImageProviderId): string {
  if (provider === "ideogram") {
    return "Ideogram for social graphics, carousel covers, and text-heavy designs";
  }

  if (provider === "imagen") {
    return "Imagen for consistent brand imagery and campaign visuals";
  }

  if (provider === "flux") {
    return "Flux for marketing photography and product mockups";
  }

  return "OpenAI for image support tasks";
}

function normalizeText(value: string, fallback: string): string {
  return value.replace(/\s+/g, " ").trim() || fallback;
}
