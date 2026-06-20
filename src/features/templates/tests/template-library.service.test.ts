import { describe, expect, it, vi } from "vitest";

import type { BrandRepository } from "@/features/brands/types/brand";
import { validateCanvasDocument } from "@/features/canvas/services/canvas-object-model.service";
import type { ContentProject, ContentProjectRepository } from "@/features/projects/types/content-project";

import {
  createProjectFromTemplateForUser,
  listContentTemplates
} from "../services/template-library.service";

const brand = {
  createdAt: new Date("2026-06-18T12:00:00.000Z"),
  description: "Storm restoration, inspections, and roof replacements.",
  id: "brand_123",
  industry: "Roofing",
  name: "ABC Roofing",
  ownerUserId: "user_local_123",
  updatedAt: new Date("2026-06-18T12:00:00.000Z"),
  websiteUrl: "https://abcroofing.com/"
};

const project: ContentProject = {
  brandId: "brand_123",
  brandName: "ABC Roofing",
  canvasJson: {
    documentId: "document_created",
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
        id: "slide_created",
        name: "Slide 1",
        order: 1,
        width: 1080
      }
    ],
    themeId: null,
    title: "Roofing Myth Buster",
    unit: "px",
    width: 1080
  },
  createdAt: new Date("2026-06-18T12:00:00.000Z"),
  format: "instagram-carousel",
  id: "project_123",
  ownerUserId: "user_local_123",
  status: "draft",
  title: "Roofing Myth Buster",
  updatedAt: new Date("2026-06-18T12:00:00.000Z")
};

function createProjectRepository(overrides: Partial<ContentProjectRepository> = {}): ContentProjectRepository {
  return {
    create: vi.fn().mockResolvedValue(project),
    findByIdForOwner: vi.fn().mockResolvedValue(project),
    listByOwnerUserId: vi.fn().mockResolvedValue([project]),
    updateCanvasForOwner: vi.fn().mockResolvedValue(project),
    ...overrides
  };
}

function createBrandRepository(overrides: Partial<BrandRepository> = {}): BrandRepository {
  return {
    create: vi.fn(),
    findByIdForOwner: vi.fn().mockResolvedValue(brand),
    listByOwnerUserId: vi.fn().mockResolvedValue([brand]),
    ...overrides
  };
}

describe("listContentTemplates", () => {
  it("returns reusable templates as validated editable canvas JSON", () => {
    const templates = listContentTemplates();

    expect(templates.length).toBeGreaterThanOrEqual(2);
    expect(templates[0]).toMatchObject({
      category: expect.any(String),
      id: expect.any(String),
      name: expect.any(String)
    });

    for (const template of templates) {
      const result = validateCanvasDocument(template.canvasJson);

      expect(result.ok).toBe(true);
      expect(JSON.stringify(template.canvasJson)).not.toContain("renderedImageUrl");
      expect(template.canvasJson.slides.some((slide) => slide.elements.length > 0)).toBe(true);
    }
  });
});

describe("createProjectFromTemplateForUser", () => {
  it("creates an editable project from a selected template for an owned brand", async () => {
    const projectRepository = createProjectRepository();
    const brandRepository = createBrandRepository();
    const idFactory = createIdFactory([
      "document_created",
      "slide_created_1",
      "element_created_1",
      "element_created_2",
      "element_created_3"
    ]);

    const result = await createProjectFromTemplateForUser({
      brandRepository,
      idFactory,
      input: {
        brandId: "brand_123",
        templateId: "myth-buster-carousel",
        title: "Roofing Myth Buster"
      },
      ownerUserId: "user_local_123",
      projectRepository
    });

    expect(result).toEqual({
      ok: true,
      project,
      status: "created"
    });
    expect(projectRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        brandId: "brand_123",
        format: "instagram-carousel",
        ownerUserId: "user_local_123",
        status: "draft",
        title: "Roofing Myth Buster"
      })
    );
    expect(projectRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        canvasJson: expect.objectContaining({
          documentId: "document_created",
          title: "Roofing Myth Buster"
        })
      })
    );
    expect(projectRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        canvasJson: expect.objectContaining({
          slides: expect.arrayContaining([
            expect.objectContaining({
              elements: expect.arrayContaining([
                expect.objectContaining({
                  id: "element_created_1"
                })
              ]),
              id: "slide_created_1"
            })
          ])
        })
      })
    );
  });

  it("does not create a project for an unknown template", async () => {
    const projectRepository = createProjectRepository();

    const result = await createProjectFromTemplateForUser({
      brandRepository: createBrandRepository(),
      input: {
        brandId: "brand_123",
        templateId: "missing-template",
        title: "Missing"
      },
      ownerUserId: "user_local_123",
      projectRepository
    });

    expect(result).toMatchObject({
      error: {
        code: "template_not_found"
      },
      ok: false,
      status: "failed"
    });
    expect(projectRepository.create).not.toHaveBeenCalled();
  });

  it("does not create a project for a brand outside the current user", async () => {
    const projectRepository = createProjectRepository();

    const result = await createProjectFromTemplateForUser({
      brandRepository: createBrandRepository({
        findByIdForOwner: vi.fn().mockResolvedValue(null)
      }),
      input: {
        brandId: "brand_other",
        templateId: "myth-buster-carousel",
        title: "Competitor Template"
      },
      ownerUserId: "user_local_123",
      projectRepository
    });

    expect(result).toMatchObject({
      error: {
        code: "brand_not_found"
      },
      ok: false,
      status: "failed"
    });
    expect(projectRepository.create).not.toHaveBeenCalled();
  });
});

function createIdFactory(ids: string[]) {
  return () => {
    const id = ids.shift();

    if (!id) {
      return `generated_${Math.random().toString(36).slice(2, 8)}`;
    }

    return id;
  };
}
