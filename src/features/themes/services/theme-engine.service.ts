import type { Brand } from "@/features/brands/types/brand";
import type { BrandMemory, BrandMemoryRepository } from "@/features/brands/types/brand-memory";
import { canvasDocumentSchema } from "@/features/canvas/schemas/canvas-object.schema";
import type { CanvasDocument, CanvasElement } from "@/features/canvas/types/canvas";
import type { ContentProject, ContentProjectRepository } from "@/features/projects/types/content-project";
import type { BrandRepository } from "@/features/brands/types/brand";

import { projectThemeUpsertInputSchema } from "../schemas/project-theme.schema";
import type {
  ProjectTheme,
  ProjectThemeGenerationResult,
  ProjectThemeReadResult,
  ProjectThemeRepository,
  ProjectThemeUpsertInput
} from "../types/project-theme";

type GenerateProjectThemeForUserParams = {
  brandMemoryRepository: BrandMemoryRepository;
  brandRepository: BrandRepository;
  idFactory?: () => string;
  ownerUserId: string;
  projectId: string;
  projectRepository: ContentProjectRepository;
  themeRepository: ProjectThemeRepository;
};

type BuildProjectThemeParams = {
  brand: Brand;
  idFactory?: () => string;
  memory: BrandMemory | null;
  ownerUserId: string;
  project: ContentProject;
};

type GetProjectThemeForUserParams = {
  ownerUserId: string;
  projectId: string;
  themeRepository: ProjectThemeRepository;
};

function isMissingPrismaDelegateError(error: unknown): boolean {
  return error instanceof TypeError && error.message.includes("Cannot read properties of undefined");
}

function repositoryUnavailableResult(): ProjectThemeGenerationResult {
  return {
    error: {
      code: "theme_repository_unavailable",
      message: "Theme storage is not loaded. Restart the local server and try again."
    },
    ok: false,
    status: "failed"
  };
}

function generationRepositoryError(error: unknown): ProjectThemeGenerationResult {
  if (isMissingPrismaDelegateError(error)) {
    return repositoryUnavailableResult();
  }

  console.error("Theme generation failed.", error);

  return {
    error: {
      code: "theme_repository_error",
      message: "Theme could not be generated."
    },
    ok: false,
    status: "failed"
  };
}

function readRepositoryError(error: unknown): ProjectThemeReadResult {
  if (isMissingPrismaDelegateError(error)) {
    return {
      error: {
        code: "theme_repository_unavailable",
        message: "Theme storage is not loaded. Restart the local server and try again."
      },
      ok: false,
      status: "failed"
    };
  }

  console.error("Theme load failed.", error);

  return {
    error: {
      code: "theme_repository_error",
      message: "Theme could not be loaded."
    },
    ok: false,
    status: "failed"
  };
}

export async function generateProjectThemeForUser({
  brandMemoryRepository,
  brandRepository,
  idFactory,
  ownerUserId,
  projectId,
  projectRepository,
  themeRepository
}: GenerateProjectThemeForUserParams): Promise<ProjectThemeGenerationResult> {
  try {
    const project = await projectRepository.findByIdForOwner(projectId, ownerUserId);

    if (!project) {
      return {
        error: {
          code: "project_not_found",
          message: "Project could not be found."
        },
        ok: false,
        status: "failed"
      };
    }

    const brand = await brandRepository.findByIdForOwner(project.brandId, ownerUserId);

    if (!brand) {
      return {
        error: {
          code: "brand_not_found",
          message: "Brand could not be found."
        },
        ok: false,
        status: "failed"
      };
    }

    const memory = await brandMemoryRepository.getByBrandId(brand.id);
    const themeInput = buildProjectTheme({
      brand,
      idFactory,
      memory,
      ownerUserId,
      project
    });
    const theme = await themeRepository.upsertForProject(themeInput);

    return {
      ok: true,
      status: "generated",
      theme
    };
  } catch (error) {
    return generationRepositoryError(error);
  }
}

export async function getProjectThemeForUser({
  ownerUserId,
  projectId,
  themeRepository
}: GetProjectThemeForUserParams): Promise<ProjectThemeReadResult> {
  try {
    const theme = await themeRepository.findByProjectIdForOwner(projectId, ownerUserId);

    return {
      ok: true,
      status: "ready",
      theme
    };
  } catch (error) {
    return readRepositoryError(error);
  }
}

export function applyProjectThemeToCanvas(document: CanvasDocument, theme: ProjectTheme): CanvasDocument {
  return canvasDocumentSchema.parse({
    ...document,
    slides: document.slides.map((slide) => ({
      ...slide,
      background: {
        ...slide.background,
        color: theme.palette.background
      },
      elements: slide.elements.map((element) => applyThemeToElement(element, theme))
    })),
    themeId: theme.id
  });
}

function buildProjectTheme({
  brand,
  idFactory = createThemeId,
  memory,
  ownerUserId,
  project
}: BuildProjectThemeParams): ProjectThemeUpsertInput {
  const context = [
    brand.name,
    brand.industry,
    brand.description,
    memory?.voice,
    memory?.audience,
    memory?.productsServices,
    memory?.brandRules,
    memory?.preferredCtas,
    memory?.notes
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const isRoofing = /roof|storm|inspection|exterior|claim/.test(context);
  const isSolar = /solar|energy|panel|renewable/.test(context);
  const isTechnical = /technical|professional|premium|precise|practical/.test(context);
  const palette = isSolar
    ? {
        accent: "#F59E0B",
        background: "#FFFFFF",
        ctaText: "#0B0F19",
        primary: "#0B1220",
        secondary: "#DCFCE7",
        surface: "#F8FAFC",
        text: "#0B0F19"
      }
    : isRoofing
      ? {
          accent: "#00A6FB",
          background: "#FFFFFF",
          ctaText: "#FFFFFF",
          primary: "#0F172A",
          secondary: "#E2E8F0",
          surface: "#F8FAFC",
          text: "#0B0F19"
        }
      : {
          accent: "#00E5FF",
          background: "#FFFFFF",
          ctaText: "#0B0F19",
          primary: "#0B0F19",
          secondary: "#CBD5E1",
          surface: "#F8FAFC",
          text: "#0B0F19"
        };

  return projectThemeUpsertInputSchema.parse({
    brandId: brand.id,
    id: idFactory(),
    imageStyle: isRoofing
      ? "Crisp exterior photography with storm-ready contrast and professional lighting."
      : isSolar
        ? "Clean daylight photography with confident contrast and bright installation details."
        : "Premium product photography with realistic lighting, sharp details, and restrained contrast.",
    layout: {
      density: isTechnical ? "editorial" : "spacious",
      heroTreatment: isTechnical ? "large-headline-left" : "centered-statement",
      spacingScale: "comfortable"
    },
    name: `${brand.name} Theme`,
    ownerUserId,
    palette,
    projectId: project.id,
    typography: {
      body: "Inter",
      bodyWeight: "regular",
      heading: "Geist",
      headingWeight: "bold"
    }
  });
}

function applyThemeToElement(element: CanvasElement, theme: ProjectTheme): CanvasElement {
  if (element.type === "text") {
    return {
      ...element,
      color: theme.palette.text,
      fontFamily: theme.typography.heading,
      fontWeight: theme.typography.headingWeight
    };
  }

  if (element.type === "shape") {
    return {
      ...element,
      fill: theme.palette.surface,
      stroke: null,
      strokeWidth: 0
    };
  }

  if (element.type === "cta") {
    return {
      ...element,
      backgroundColor: theme.palette.accent,
      fontFamily: theme.typography.body,
      textColor: theme.palette.ctaText
    };
  }

  if (element.type === "icon") {
    return {
      ...element,
      color: theme.palette.accent
    };
  }

  return element;
}

function createThemeId(): string {
  const randomId = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 12);

  return `theme_${randomId}`;
}
