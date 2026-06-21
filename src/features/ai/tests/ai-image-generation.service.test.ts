import { describe, expect, it, vi } from "vitest";

import type { BrandMemoryRepository } from "@/features/brands/types/brand-memory";
import type { BrandRepository } from "@/features/brands/types/brand";
import type { CanvasDocument } from "@/features/canvas/types/canvas";
import type { ContentProjectRepository } from "@/features/projects/types/content-project";
import type { ProjectThemeRepository } from "@/features/themes/types/project-theme";

import { generateProjectImageForUser } from "../services/ai-image-generation.service";
import type {
  AiImageGenerationProvider,
  AiImageProviderRegistry,
  GenerationCostRepository
} from "../types/ai-generation";

const createdAt = new Date("2026-06-18T12:00:00.000Z");

const brand = {
  createdAt,
  description: "Premium outdoor land management services.",
  id: "brand_1",
  industry: "Land management",
  name: "Land Strong",
  ownerUserId: "user_1",
  updatedAt: createdAt,
  websiteUrl: "https://example.com"
};

const memory = {
  audience: "Rural homeowners and land owners",
  brandId: "brand_1",
  brandRules: "Use forest green #14532D and harvest gold #D97706.",
  createdAt,
  id: "memory_1",
  notes: "Grounded, strong, premium.",
  preferredCtas: "Schedule a land assessment",
  productsServices: "Land clearing, grading, drainage",
  updatedAt: createdAt,
  voice: "Confident and practical"
};

const theme = {
  brandId: "brand_1",
  createdAt,
  id: "theme_1",
  imageStyle: "Crisp outdoor photography with strong natural contrast.",
  layout: {
    density: "editorial" as const,
    heroTreatment: "large-headline-left" as const,
    spacingScale: "comfortable" as const
  },
  name: "Land Strong Theme",
  ownerUserId: "user_1",
  palette: {
    accent: "#D97706",
    background: "#FFFFFF",
    ctaText: "#FFFFFF",
    primary: "#14532D",
    secondary: "#DCFCE7",
    surface: "#F8FAFC",
    text: "#0B0F19"
  },
  projectId: "project_1",
  typography: {
    body: "Inter",
    bodyWeight: "regular" as const,
    heading: "Geist",
    headingWeight: "bold" as const
  },
  updatedAt: createdAt
};

function blankCanvas(): CanvasDocument {
  return {
    documentId: "document_1",
    format: "instagram-carousel",
    height: 1080,
    schemaVersion: "1.0.0",
    slides: [
      {
        background: {
          color: "#FFFFFF",
          type: "solid"
        },
        elements: [],
        height: 1080,
        id: "slide_1",
        name: "Slide 1",
        order: 1,
        width: 1080
      }
    ],
    themeId: "theme_1",
    title: "Spring Land Prep Carousel",
    unit: "px",
    width: 1080
  };
}

function createRepositories() {
  const project = {
    brandId: "brand_1",
    brandName: "Land Strong",
    canvasJson: blankCanvas(),
    createdAt,
    format: "instagram-carousel",
    id: "project_1",
    ownerUserId: "user_1",
    status: "draft",
    title: "Spring Land Prep Carousel",
    updatedAt: createdAt
  };

  const brandRepository = {
    create: vi.fn(),
    findByIdForOwner: vi.fn().mockResolvedValue(brand),
    listByOwnerUserId: vi.fn()
  } satisfies BrandRepository;

  const brandMemoryRepository = {
    create: vi.fn(),
    getByBrandId: vi.fn().mockResolvedValue(memory),
    update: vi.fn()
  } satisfies BrandMemoryRepository;

  const projectRepository = {
    create: vi.fn(),
    findByIdForOwner: vi.fn().mockResolvedValue(project),
    listByOwnerUserId: vi.fn(),
    updateCanvasForOwner: vi.fn().mockImplementation((_projectId, _ownerUserId, canvasJson) =>
      Promise.resolve({
        ...project,
        canvasJson
      })
    )
  } satisfies ContentProjectRepository;

  const themeRepository = {
    findByProjectIdForOwner: vi.fn().mockResolvedValue(theme),
    upsertForProject: vi.fn()
  } satisfies ProjectThemeRepository;

  const generationCostRepository = {
    create: vi.fn().mockResolvedValue(undefined)
  } satisfies GenerationCostRepository;

  const provider: AiImageGenerationProvider = {
    generateImage: vi.fn().mockResolvedValue({
      imageUrl: "data:image/svg+xml,%3Csvg%3E%3C/svg%3E",
      usage: {
        cost: 0.04,
        tokens: 900
      }
    }),
    id: "flux"
  };

  const imageProviderRegistry: AiImageProviderRegistry = {
    getImageProvider: vi.fn().mockReturnValue(provider)
  };

  return {
    brandMemoryRepository,
    brandRepository,
    generationCostRepository,
    imageProviderRegistry,
    projectRepository,
    provider,
    themeRepository
  };
}

describe("generateProjectImageForUser", () => {
  it("adds a generated image as an editable canvas image object on the active slide", async () => {
    const repositories = createRepositories();

    const result = await generateProjectImageForUser({
      ...repositories,
      idFactory: () => "image_generated_1",
      ownerUserId: "user_1",
      preferredProvider: "auto",
      projectId: "project_1",
      slideId: "slide_1",
      userRequest: "Generate marketing photography of freshly graded land at sunrise."
    });

    expect(result).toMatchObject({
      ok: true,
      project: {
        canvasJson: {
          slides: [
            {
              elements: [
                expect.objectContaining({
                  alt: expect.stringContaining("Land Strong"),
                  assetId: "asset_image_generated_1",
                  id: "image_generated_1",
                  provider: "flux",
                  src: "data:image/svg+xml,%3Csvg%3E%3C/svg%3E",
                  type: "image"
                })
              ]
            }
          ]
        }
      },
      status: "generated"
    });
    expect(repositories.imageProviderRegistry.getImageProvider).toHaveBeenCalledWith("flux");
    expect(repositories.provider.generateImage).toHaveBeenCalledTimes(1);
    expect(repositories.projectRepository.updateCanvasForOwner).toHaveBeenCalled();
    expect(repositories.generationCostRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        cost: 0.04,
        provider: "flux",
        tokens: 900,
        workflow: "image-generation"
      })
    );
  });

  it("requires a saved theme before generating images", async () => {
    const repositories = createRepositories();
    repositories.themeRepository.findByProjectIdForOwner.mockResolvedValue(null);

    const result = await generateProjectImageForUser({
      ...repositories,
      ownerUserId: "user_1",
      preferredProvider: "auto",
      projectId: "project_1",
      slideId: "slide_1",
      userRequest: "Generate image."
    });

    expect(result).toMatchObject({
      error: {
        code: "theme_required"
      },
      ok: false,
      status: "failed"
    });
    expect(repositories.provider.generateImage).not.toHaveBeenCalled();
  });
});
