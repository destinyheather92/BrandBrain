import { describe, expect, it, vi } from "vitest";

import type { BrandMemoryRepository } from "@/features/brands/types/brand-memory";
import type { BrandRepository } from "@/features/brands/types/brand";
import type { ContentProjectRepository } from "@/features/projects/types/content-project";

import { generateCreativeBriefForUser } from "../services/creative-brief.service";

const createdAt = new Date("2026-06-22T12:00:00.000Z");

const counselingBrand = {
  createdAt,
  description: "Counseling and nervous system support for anxious high-achievers.",
  id: "brand_mental_1",
  industry: "Mental health counseling",
  name: "Harbor & Root Counseling",
  ownerUserId: "user_1",
  updatedAt: createdAt,
  websiteUrl: "https://example-counseling.test"
};

const counselingMemory = {
  audience: "Adults navigating anxiety, burnout, and nervous system overwhelm",
  brandId: "brand_mental_1",
  brandRules: "Use calming language, practical grounding, and a supportive tone.",
  createdAt,
  id: "memory_mental_1",
  notes: "Avoid shame, urgency, or sales pressure.",
  preferredCtas: "Schedule a consultation. Learn more about nervous system regulation. Download a grounding resource.",
  productsServices: "Anxiety counseling, burnout therapy, nervous system regulation",
  updatedAt: createdAt,
  voice: "Warm, validating, grounded, and practical"
};

const project = {
  brandId: "brand_mental_1",
  brandName: "Harbor & Root Counseling",
  canvasJson: {
    documentId: "document_1",
    format: "instagram-carousel" as const,
    height: 1080,
    schemaVersion: "1.0.0",
    slides: [],
    themeId: null,
    title: "Anxiety Support Carousel",
    unit: "px" as const,
    width: 1080
  },
  createdAt,
  format: "instagram-carousel" as const,
  id: "project_1",
  ownerUserId: "user_1",
  status: "draft" as const,
  title: "Anxiety Support Carousel",
  updatedAt: createdAt
};

function createRepositories() {
  const brandRepository = {
    create: vi.fn(),
    findByIdForOwner: vi.fn().mockResolvedValue(counselingBrand),
    listByOwnerUserId: vi.fn()
  } satisfies BrandRepository;
  const brandMemoryRepository = {
    create: vi.fn(),
    getByBrandId: vi.fn().mockResolvedValue(counselingMemory),
    update: vi.fn()
  } satisfies BrandMemoryRepository;
  const projectRepository = {
    create: vi.fn(),
    findByIdForOwner: vi.fn().mockResolvedValue(project),
    listByOwnerUserId: vi.fn(),
    updateCanvasForOwner: vi.fn()
  } satisfies ContentProjectRepository;

  return {
    brandMemoryRepository,
    brandRepository,
    projectRepository
  };
}

describe("generateCreativeBriefForUser", () => {
  it("turns a vague counseling prompt into a brand-specific creative brief", async () => {
    const repositories = createRepositories();

    const result = await generateCreativeBriefForUser({
      ...repositories,
      ownerUserId: "user_1",
      projectId: "project_1",
      userRequest: "make me a carousel about what to do when anxiety spikes"
    });

    expect(result).toMatchObject({
      brief: {
        audience: expect.stringContaining("anxiety"),
        cta: "Schedule a consultation",
        goal: expect.stringContaining("anxiety"),
        hook: expect.stringMatching(/anxiety|nervous system/i)
      },
      ok: true,
      status: "generated"
    });

    const serializedBrief = JSON.stringify(result.ok ? result.brief : {});

    expect(serializedBrief).toMatch(/counseling|nervous system|grounding|anxiety/i);
    expect(serializedBrief).not.toMatch(/land clearing|grading|drainage|property|acreage/i);
  });

  it("returns a project not found error before building a brief", async () => {
    const repositories = createRepositories();

    repositories.projectRepository.findByIdForOwner.mockResolvedValue(null);

    const result = await generateCreativeBriefForUser({
      ...repositories,
      ownerUserId: "user_1",
      projectId: "missing_project",
      userRequest: "make a carousel"
    });

    expect(result).toMatchObject({
      error: {
        code: "project_not_found"
      },
      ok: false,
      status: "failed"
    });
    expect(repositories.brandRepository.findByIdForOwner).not.toHaveBeenCalled();
  });
});
