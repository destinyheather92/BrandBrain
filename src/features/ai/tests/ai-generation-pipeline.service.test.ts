import { describe, expect, it, vi } from "vitest";

import type { BrandMemoryRepository } from "@/features/brands/types/brand-memory";
import type { BrandRepository } from "@/features/brands/types/brand";
import type { CanvasDocument } from "@/features/canvas/types/canvas";
import type { ContentProjectRepository } from "@/features/projects/types/content-project";
import type { ProjectThemeRepository } from "@/features/themes/types/project-theme";

import { generateProjectDraftForUser } from "../services/ai-generation-pipeline.service";
import type {
  AiCanvasGenerationProvider,
  AiProviderRegistry,
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
    density: "editorial",
    heroTreatment: "large-headline-left",
    spacingScale: "comfortable"
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
    bodyWeight: "regular",
    heading: "Geist",
    headingWeight: "bold"
  },
  updatedAt: createdAt
};

function blankCanvas(): CanvasDocument {
  return {
    documentId: "document_1",
    format: "instagram-carousel",
    height: 1080,
    schemaVersion: "1.0.0",
    slides: [1, 2, 3].map((order) => ({
      background: {
        color: "#FFFFFF",
        type: "solid"
      },
      elements: [],
      height: 1080,
      id: `slide_${order}`,
      name: `Slide ${order}`,
      order,
      width: 1080
    })),
    themeId: "theme_1",
    title: "Spring Land Prep Carousel",
    unit: "px",
    width: 1080
  };
}

function generatedCanvas(): CanvasDocument {
  return {
    ...blankCanvas(),
    slides: blankCanvas().slides.map((slide) => ({
      ...slide,
      elements: [
        {
          color: "#0B0F19",
          content: slide.order === 1 ? "Prepare land before spring growth" : `Land prep step ${slide.order}`,
          fontFamily: "Geist",
          fontSize: 72,
          fontWeight: "bold",
          height: 180,
          id: `text_${slide.order}`,
          letterSpacing: 0,
          lineHeight: 1.1,
          locked: false,
          opacity: 1,
          rotation: 0,
          textAlign: "left",
          type: "text",
          width: 760,
          x: 96,
          y: 150,
          zIndex: 1
        },
        {
          backgroundColor: "#D97706",
          borderRadius: 18,
          fontFamily: "Inter",
          fontSize: 32,
          height: 92,
          id: `cta_${slide.order}`,
          label: "Schedule a land assessment",
          locked: false,
          opacity: 1,
          rotation: 0,
          textColor: "#FFFFFF",
          type: "cta",
          width: 520,
          x: 96,
          y: 860,
          zIndex: 2
        }
      ]
    }))
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

  const provider: AiCanvasGenerationProvider = {
    generateJson: vi.fn().mockResolvedValue({
      data: generatedCanvas(),
      usage: {
        cost: 0.02,
        tokens: 1200
      }
    }),
    id: "openai"
  };

  const providerRegistry: AiProviderRegistry = {
    getProvider: vi.fn().mockReturnValue(provider)
  };

  return {
    brandMemoryRepository,
    brandRepository,
    generationCostRepository,
    projectRepository,
    provider,
    providerRegistry,
    themeRepository
  };
}

describe("generateProjectDraftForUser", () => {
  it("generates validated editable canvas JSON and saves it to the project", async () => {
    const repositories = createRepositories();

    const result = await generateProjectDraftForUser({
      ...repositories,
      ownerUserId: "user_1",
      projectId: "project_1",
      userRequest: "Explain why early spring is the best time to prepare land."
    });

    expect(result).toMatchObject({
      ok: true,
      project: {
        canvasJson: {
          themeId: "theme_1"
        }
      },
      status: "generated"
    });
    expect(repositories.providerRegistry.getProvider).toHaveBeenCalledWith("canvas-generation");
    expect(repositories.provider.generateJson).toHaveBeenCalledTimes(1);
    expect(repositories.projectRepository.updateCanvasForOwner).toHaveBeenCalledWith(
      "project_1",
      "user_1",
      expect.objectContaining({
        slides: expect.arrayContaining([
          expect.objectContaining({
            elements: expect.arrayContaining([
              expect.objectContaining({
                content: "Prepare land before spring growth",
                type: "text"
              })
            ])
          })
        ]),
        themeId: "theme_1"
      })
    );
    expect(repositories.generationCostRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        cost: 0.02,
        provider: "openai",
        tokens: 1200,
        workflow: "canvas-generation"
      })
    );
  });

  it("requires a saved theme before generating slides", async () => {
    const repositories = createRepositories();
    repositories.themeRepository.findByProjectIdForOwner.mockResolvedValue(null);

    const result = await generateProjectDraftForUser({
      ...repositories,
      ownerUserId: "user_1",
      projectId: "project_1",
      userRequest: "Generate a carousel."
    });

    expect(result).toMatchObject({
      error: {
        code: "theme_required"
      },
      ok: false,
      status: "failed"
    });
    expect(repositories.provider.generateJson).not.toHaveBeenCalled();
    expect(repositories.projectRepository.updateCanvasForOwner).not.toHaveBeenCalled();
  });

  it("retries once when provider output fails canvas validation", async () => {
    const repositories = createRepositories();
    repositories.provider.generateJson = vi
      .fn()
      .mockResolvedValueOnce({
        data: {
          slides: []
        },
        usage: {
          cost: 0,
          tokens: 100
        }
      })
      .mockResolvedValueOnce({
        data: generatedCanvas(),
        usage: {
          cost: 0.03,
          tokens: 1500
        }
      });

    const result = await generateProjectDraftForUser({
      ...repositories,
      ownerUserId: "user_1",
      projectId: "project_1",
      userRequest: "Generate a carousel."
    });

    expect(result.ok).toBe(true);
    expect(repositories.provider.generateJson).toHaveBeenCalledTimes(2);
  });

  it("does not fail draft generation when cost recording is unavailable", async () => {
    const repositories = createRepositories();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    repositories.generationCostRepository.create.mockRejectedValue(new Error("cost table unavailable"));

    const result = await generateProjectDraftForUser({
      ...repositories,
      ownerUserId: "user_1",
      projectId: "project_1",
      userRequest: "Generate a carousel."
    });

    expect(result).toMatchObject({
      ok: true,
      status: "generated"
    });
    expect(repositories.projectRepository.updateCanvasForOwner).toHaveBeenCalled();
    expect(repositories.generationCostRepository.create).toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      "AI generation cost could not be recorded.",
      expect.any(Error)
    );
    warnSpy.mockRestore();
  });

  it("replaces previous AI-generated slide objects when regenerating a draft", async () => {
    const repositories = createRepositories();
    const existingGeneratedCanvas = blankCanvas();

    existingGeneratedCanvas.slides[0]?.elements.push({
      color: "#14532D",
      content: "Old generated junk",
      fontFamily: "Geist",
      fontSize: 64,
      fontWeight: "bold",
      height: 160,
      id: "text_1_headline",
      letterSpacing: 0,
      lineHeight: 1.1,
      locked: false,
      opacity: 1,
      rotation: 0,
      textAlign: "left",
      type: "text",
      width: 720,
      x: 96,
      y: 180,
      zIndex: 1
    });
    repositories.projectRepository.findByIdForOwner.mockResolvedValue({
      brandId: "brand_1",
      brandName: "Land Strong",
      canvasJson: existingGeneratedCanvas,
      createdAt,
      format: "instagram-carousel",
      id: "project_1",
      ownerUserId: "user_1",
      status: "draft",
      title: "Spring Land Prep Carousel",
      updatedAt: createdAt
    });

    await generateProjectDraftForUser({
      ...repositories,
      ownerUserId: "user_1",
      projectId: "project_1",
      userRequest: "Generate a cleaner carousel."
    });

    expect(repositories.projectRepository.updateCanvasForOwner).toHaveBeenCalledWith(
      "project_1",
      "user_1",
      expect.objectContaining({
        slides: expect.arrayContaining([
          expect.objectContaining({
            elements: expect.arrayContaining([
              expect.objectContaining({
                content: "Prepare land before spring growth",
                id: "text_1"
              })
            ])
          })
        ])
      })
    );
  });

  it("preserves slides that already contain user edits", async () => {
    const repositories = createRepositories();
    const editedCanvas = blankCanvas();

    editedCanvas.slides[0]?.elements.push({
      color: "#14532D",
      content: "Do not overwrite this user edit",
      fontFamily: "Geist",
      fontSize: 64,
      fontWeight: "bold",
      height: 160,
      id: "manual_text_1",
      letterSpacing: 0,
      lineHeight: 1.1,
      locked: false,
      opacity: 1,
      rotation: 0,
      textAlign: "left",
      type: "text",
      width: 720,
      x: 96,
      y: 180,
      zIndex: 1
    });
    repositories.projectRepository.findByIdForOwner.mockResolvedValue({
      brandId: "brand_1",
      brandName: "Land Strong",
      canvasJson: editedCanvas,
      createdAt,
      format: "instagram-carousel",
      id: "project_1",
      ownerUserId: "user_1",
      status: "draft",
      title: "Spring Land Prep Carousel",
      updatedAt: createdAt
    });

    await generateProjectDraftForUser({
      ...repositories,
      ownerUserId: "user_1",
      projectId: "project_1",
      userRequest: "Generate a carousel."
    });

    expect(repositories.projectRepository.updateCanvasForOwner).toHaveBeenCalledWith(
      "project_1",
      "user_1",
      expect.objectContaining({
        slides: expect.arrayContaining([
          expect.objectContaining({
            elements: [
              expect.objectContaining({
                content: "Do not overwrite this user edit",
                id: "manual_text_1"
              })
            ]
          })
        ])
      })
    );
  });
});
