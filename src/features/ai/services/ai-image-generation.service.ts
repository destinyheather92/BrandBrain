import type { BrandRepository } from "@/features/brands/types/brand";
import type { BrandMemoryRepository } from "@/features/brands/types/brand-memory";
import { createGeneratedImageAssetForUser } from "@/features/assets/services/asset-library.service";
import type { AssetRepository } from "@/features/assets/types/asset";
import { validateCanvasDocument } from "@/features/canvas/services/canvas-object-model.service";
import type { CanvasDocument, CanvasElement, CanvasSlide } from "@/features/canvas/types/canvas";
import type { ContentProjectRepository } from "@/features/projects/types/content-project";
import type { ProjectTheme, ProjectThemeRepository } from "@/features/themes/types/project-theme";

import { buildImageGenerationPrompt } from "../prompts/image-generation.prompt";
import type {
  AiGenerationBrandContext,
  AiGenerationThemeContext,
  AiImageGenerationResult,
  AiImageProviderId,
  AiImageProviderRegistry,
  GenerationCostCreateInput,
  GenerationCostRepository
} from "../types/ai-generation";

type GenerateProjectImageForUserParams = {
  assetRepository: AssetRepository;
  brandMemoryRepository: BrandMemoryRepository;
  brandRepository: BrandRepository;
  generationCostRepository: GenerationCostRepository;
  idFactory?: () => string;
  imageProviderRegistry: AiImageProviderRegistry;
  ownerUserId: string;
  projectId: string;
  projectRepository: ContentProjectRepository;
  slideId: string;
  themeRepository: ProjectThemeRepository;
  userRequest: string;
};

type AiImageGenerationErrorCode = Extract<AiImageGenerationResult, { ok: false }>["error"]["code"];

export async function generateProjectImageForUser({
  assetRepository,
  brandMemoryRepository,
  brandRepository,
  generationCostRepository,
  idFactory = createImageElementId,
  imageProviderRegistry,
  ownerUserId,
  projectId,
  projectRepository,
  slideId,
  themeRepository,
  userRequest
}: GenerateProjectImageForUserParams): Promise<AiImageGenerationResult> {
  try {
    const project = await projectRepository.findByIdForOwner(projectId, ownerUserId);

    if (!project) {
      return failure("project_not_found", "Project could not be found.");
    }

    const theme = await themeRepository.findByProjectIdForOwner(projectId, ownerUserId);

    if (!theme) {
      return failure("theme_required", "Generate and apply a theme before creating images.");
    }

    const brand = await brandRepository.findByIdForOwner(project.brandId, ownerUserId);

    if (!brand) {
      return failure("brand_not_found", "Brand could not be found.");
    }

    const targetSlide = project.canvasJson.slides.find((slide) => slide.id === slideId);

    if (!targetSlide) {
      return failure("slide_not_found", "Slide could not be found.");
    }

    const memory = await brandMemoryRepository.getByBrandId(brand.id);
    const prompt = buildImageGenerationPrompt({
      brand: {
        description: brand.description,
        industry: brand.industry,
        memory,
        name: brand.name
      } satisfies AiGenerationBrandContext,
      projectTitle: project.title,
      slideContext: summarizeSlideContext(targetSlide),
      theme: toThemeContext(theme),
      userRequest: userRequest.trim() || project.title
    });
    const provider = imageProviderRegistry.getImageProvider(prompt.provider);
    const response = await provider.generateImage(prompt);
    const imageElement = createGeneratedImageElement({
      id: idFactory(),
      imageUrl: response.imageUrl,
      prompt: prompt.prompt,
      provider: provider.id,
      slide: targetSlide
    });
    const document = addImageElementToSlide(project.canvasJson, slideId, imageElement);
    const validation = validateCanvasDocument(document);

    if (!validation.ok) {
      return failure("invalid_ai_image_canvas", "Generated image could not be added to the canvas.", validation.error.issues);
    }

    const savedProject = await projectRepository.updateCanvasForOwner(projectId, ownerUserId, validation.document);

    if (!savedProject) {
      return failure("project_not_found", "Project could not be found.");
    }

    await recordGenerationCost(generationCostRepository, {
      brandId: project.brandId,
      cost: response.usage.cost,
      ownerUserId,
      projectId,
      provider: provider.id,
      tokens: response.usage.tokens,
      workflow: "image-generation"
    });
    await recordGeneratedImageAsset({
      assetRepository,
      brandId: project.brandId,
      imageElement,
      ownerUserId,
      projectId,
      provider: provider.id
    });

    return {
      ok: true,
      project: savedProject,
      status: "generated"
    };
  } catch (error) {
    console.error("AI image generation failed.", error);

    return failure("project_repository_error", "AI image could not be generated.");
  }
}

async function recordGeneratedImageAsset({
  assetRepository,
  brandId,
  imageElement,
  ownerUserId,
  projectId,
  provider
}: {
  assetRepository: AssetRepository;
  brandId: string;
  imageElement: Extract<CanvasElement, { type: "image" }>;
  ownerUserId: string;
  projectId: string;
  provider: AiImageProviderId;
}): Promise<void> {
  const result = await createGeneratedImageAssetForUser({
    assetRepository,
    input: {
      brandId,
      height: Math.round(imageElement.height),
      name: toAssetName(imageElement.alt),
      ownerUserId,
      projectId,
      prompt: imageElement.prompt ?? null,
      provider,
      sourceUrl: imageElement.src,
      width: Math.round(imageElement.width)
    }
  });

  if (!result.ok) {
    console.warn("Generated image asset could not be recorded.", result.error);
  }
}

function toAssetName(altText: string): string {
  const normalized = altText.replace(/\s+/g, " ").trim();

  return (normalized || "Generated image").slice(0, 160);
}

function addImageElementToSlide(
  document: CanvasDocument,
  slideId: string,
  imageElement: CanvasElement
): CanvasDocument {
  return {
    ...document,
    slides: document.slides.map((slide) =>
      slide.id === slideId
        ? {
            ...slide,
            elements: [...slide.elements, imageElement]
          }
        : slide
    )
  };
}

function createGeneratedImageElement({
  id,
  imageUrl,
  prompt,
  provider,
  slide
}: {
  id: string;
  imageUrl: string;
  prompt: string;
  provider: AiImageProviderId;
  slide: CanvasSlide;
}): Extract<CanvasElement, { type: "image" }> {
  const width = Math.min(888, slide.width - 128);
  const height = Math.min(520, slide.height - 260);

  return {
    alt: summarizeAltText(prompt),
    assetId: `asset_${id}`,
    crop: null,
    height,
    id,
    locked: false,
    opacity: 1,
    prompt: prompt.slice(0, 2000),
    provider,
    rotation: 0,
    src: imageUrl,
    type: "image",
    width,
    x: Math.round((slide.width - width) / 2),
    y: Math.max(96, Math.round((slide.height - height) / 2)),
    zIndex: nextZIndex(slide)
  };
}

async function recordGenerationCost(
  generationCostRepository: GenerationCostRepository,
  input: GenerationCostCreateInput
): Promise<void> {
  try {
    await generationCostRepository.create(input);
  } catch (error) {
    console.warn("AI image generation cost could not be recorded.", error);
  }
}

function nextZIndex(slide: CanvasSlide): number {
  return Math.min(10000, Math.max(0, ...slide.elements.map((element) => element.zIndex)) + 1);
}

function summarizeAltText(prompt: string): string {
  return prompt
    .replace(/\s+/g, " ")
    .replace(/^Create one image for BrandBrain project "[^"]+"\.\s*/i, "")
    .trim()
    .slice(0, 180);
}

function summarizeSlideContext(slide: CanvasSlide): string {
  const visibleText = slide.elements
    .map((element) => {
      if (element.type === "text") {
        return element.content;
      }

      if (element.type === "cta") {
        return `CTA: ${element.label}`;
      }

      if (element.type === "image") {
        return element.alt;
      }

      if (element.type === "logo") {
        return element.brandName;
      }

      return "";
    })
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return visibleText.slice(0, 700);
}

function createImageElementId(): string {
  const randomId = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 12);

  return `image_${randomId}`;
}

function toThemeContext(theme: ProjectTheme): AiGenerationThemeContext {
  return {
    imageStyle: theme.imageStyle,
    layout: theme.layout,
    palette: theme.palette,
    typography: theme.typography
  };
}

function failure(
  code: AiImageGenerationErrorCode,
  message: string,
  issues?: string[]
): AiImageGenerationResult {
  return {
    error: {
      code,
      issues,
      message
    },
    ok: false,
    status: "failed"
  };
}
