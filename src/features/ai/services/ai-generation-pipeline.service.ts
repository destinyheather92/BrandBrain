import type { BrandRepository } from "@/features/brands/types/brand";
import type { BrandMemoryRepository } from "@/features/brands/types/brand-memory";
import { validateCanvasDocument } from "@/features/canvas/services/canvas-object-model.service";
import type { CanvasDocument, CanvasSlide } from "@/features/canvas/types/canvas";
import type { ContentProjectRepository } from "@/features/projects/types/content-project";
import type { ProjectTheme, ProjectThemeRepository } from "@/features/themes/types/project-theme";

import { buildCanvasGenerationPrompt } from "../prompts/canvas-generation.prompt";
import type {
  AiGenerationBrandContext,
  AiGenerationResult,
  AiGenerationThemeContext,
  AiProviderRegistry,
  CanvasMergeResult,
  GenerationCostCreateInput,
  GenerationCostRepository
} from "../types/ai-generation";

type GenerateProjectDraftForUserParams = {
  brandMemoryRepository: BrandMemoryRepository;
  brandRepository: BrandRepository;
  generationCostRepository: GenerationCostRepository;
  ownerUserId: string;
  projectId: string;
  projectRepository: ContentProjectRepository;
  providerRegistry: AiProviderRegistry;
  themeRepository: ProjectThemeRepository;
  userRequest: string;
};

type ValidatedProviderCanvas = {
  canvasJson: CanvasDocument;
  cost: number;
  provider: string;
  tokens: number;
};

type AiGenerationErrorCode = Extract<AiGenerationResult, { ok: false }>["error"]["code"];

const maxProviderAttempts = 2;

export async function generateProjectDraftForUser({
  brandMemoryRepository,
  brandRepository,
  generationCostRepository,
  ownerUserId,
  projectId,
  projectRepository,
  providerRegistry,
  themeRepository,
  userRequest
}: GenerateProjectDraftForUserParams): Promise<AiGenerationResult> {
  try {
    const project = await projectRepository.findByIdForOwner(projectId, ownerUserId);

    if (!project) {
      return failure("project_not_found", "Project could not be found.");
    }

    const theme = await themeRepository.findByProjectIdForOwner(projectId, ownerUserId);

    if (!theme) {
      return failure("theme_required", "Generate and apply a theme before creating AI slides.");
    }

    const brand = await brandRepository.findByIdForOwner(project.brandId, ownerUserId);

    if (!brand) {
      return failure("brand_not_found", "Brand could not be found.");
    }

    const memory = await brandMemoryRepository.getByBrandId(brand.id);
    const prompt = buildCanvasGenerationPrompt({
      brand: {
        description: brand.description,
        industry: brand.industry,
        memory,
        name: brand.name
      } satisfies AiGenerationBrandContext,
      projectTitle: project.title,
      slideCount: project.canvasJson.slides.length,
      theme: toThemeContext(theme),
      userRequest: userRequest.trim() || project.title
    });
    const provider = providerRegistry.getProvider("canvas-generation");
    const generated = await requestValidatedCanvas(provider, prompt);

    if (!generated) {
      return failure("invalid_ai_canvas", "AI draft could not be validated.", ["Provider returned invalid canvas JSON."]);
    }

    const mergeResult = mergeGeneratedCanvasPreservingEdits(project.canvasJson, generated.canvasJson, theme);

    if (!mergeResult.ok) {
      return failure("ai_generation_failed", mergeResult.error);
    }

    const savedProject = await projectRepository.updateCanvasForOwner(projectId, ownerUserId, mergeResult.document);

    if (!savedProject) {
      return failure("project_not_found", "Project could not be found.");
    }

    await recordGenerationCost(generationCostRepository, {
      brandId: project.brandId,
      cost: generated.cost,
      ownerUserId,
      projectId,
      provider: generated.provider,
      tokens: generated.tokens,
      workflow: "canvas-generation"
    });

    return {
      ok: true,
      project: savedProject,
      status: "generated"
    };
  } catch (error) {
    console.error("AI generation pipeline failed.", error);

    return failure("project_repository_error", "AI draft could not be generated.");
  }
}

async function recordGenerationCost(
  generationCostRepository: GenerationCostRepository,
  input: GenerationCostCreateInput
): Promise<void> {
  try {
    await generationCostRepository.create(input);
  } catch (error) {
    console.warn("AI generation cost could not be recorded.", error);
  }
}

export function mergeGeneratedCanvasPreservingEdits(
  currentDocument: CanvasDocument,
  generatedDocument: CanvasDocument,
  theme: ProjectTheme
): CanvasMergeResult {
  const generatedSlidesByOrder = new Map(generatedDocument.slides.map((slide) => [slide.order, slide]));
  const mergedSlides = currentDocument.slides.map((slide) => {
    if (hasUserEdits(slide)) {
      return slide;
    }

    return generatedSlidesByOrder.get(slide.order) ?? slide;
  });

  if (mergedSlides.every((slide) => slide.elements.length === 0)) {
    return {
      error: "AI draft did not create any editable slide objects.",
      ok: false
    };
  }

  const validation = validateCanvasDocument({
    ...currentDocument,
    slides: mergedSlides.map((slide) => ({
      ...slide,
      background: {
        ...slide.background,
        color: theme.palette.background
      }
    })),
    themeId: theme.id
  });

  return validation.ok
    ? {
        document: validation.document,
        ok: true
      }
    : {
        error: validation.error.message,
        ok: false
      };
}

async function requestValidatedCanvas(
  provider: ReturnType<AiProviderRegistry["getProvider"]>,
  prompt: ReturnType<typeof buildCanvasGenerationPrompt>
): Promise<ValidatedProviderCanvas | null> {
  for (let attempt = 1; attempt <= maxProviderAttempts; attempt += 1) {
    const response = await provider.generateJson(prompt);
    const validation = validateCanvasDocument(response.data);

    if (validation.ok) {
      return {
        canvasJson: validation.document,
        cost: response.usage.cost,
        provider: provider.id,
        tokens: response.usage.tokens
      };
    }
  }

  return null;
}

function hasUserEdits(slide: CanvasSlide): boolean {
  return slide.elements.length > 0;
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
  code: AiGenerationErrorCode,
  message: string,
  issues?: string[]
): AiGenerationResult {
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
