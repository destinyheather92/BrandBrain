import { describe, expect, it, vi } from "vitest";

import type { BrandRepository } from "@/features/brands/types/brand";

import {
  createContentProjectForUser,
  listContentProjectsForUser
} from "../services/content-project.service";
import type { ContentProject, ContentProjectRepository } from "../types/content-project";

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
    documentId: "document_1",
    format: "instagram-carousel",
    height: 1080,
    schemaVersion: "1.0.0",
    slides: [
      {
        background: {
          color: "#0B0F19",
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
    themeId: null,
    title: "Storm Damage Carousel",
    unit: "px",
    width: 1080
  },
  createdAt: new Date("2026-06-18T12:00:00.000Z"),
  format: "instagram-carousel",
  id: "project_123",
  ownerUserId: "user_local_123",
  status: "draft",
  title: "Storm Damage Carousel",
  updatedAt: new Date("2026-06-18T12:00:00.000Z")
};

function createProjectRepository(overrides: Partial<ContentProjectRepository> = {}): ContentProjectRepository {
  return {
    create: vi.fn().mockResolvedValue(project),
    listByOwnerUserId: vi.fn().mockResolvedValue([project]),
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

describe("createContentProjectForUser", () => {
  it("creates a saved content project with validated editable canvas JSON", async () => {
    const projectRepository = createProjectRepository();
    const brandRepository = createBrandRepository();
    const idFactory = createIdFactory(["document_1", "slide_1", "slide_2", "slide_3"]);

    const result = await createContentProjectForUser({
      brandRepository,
      idFactory,
      input: {
        brandId: "brand_123",
        title: "  Storm Damage Carousel  "
      },
      ownerUserId: "user_local_123",
      projectRepository
    });

    expect(result).toEqual({
      ok: true,
      project,
      status: "created"
    });
    expect(projectRepository.create).toHaveBeenCalledWith({
      brandId: "brand_123",
      canvasJson: expect.objectContaining({
        documentId: "document_1",
        slides: expect.arrayContaining([
          expect.objectContaining({
            id: "slide_1",
            name: "Slide 1"
          })
        ]),
        title: "Storm Damage Carousel"
      }),
      format: "instagram-carousel",
      ownerUserId: "user_local_123",
      status: "draft",
      title: "Storm Damage Carousel"
    });
  });

  it("does not create a project for a brand outside the current user", async () => {
    const projectRepository = createProjectRepository();
    const brandRepository = createBrandRepository({
      findByIdForOwner: vi.fn().mockResolvedValue(null)
    });

    const result = await createContentProjectForUser({
      brandRepository,
      input: {
        brandId: "brand_other",
        title: "Competitor Project"
      },
      ownerUserId: "user_local_123",
      projectRepository
    });

    expect(result).toEqual({
      error: {
        code: "brand_not_found",
        message: "Choose one of your brands before creating a project."
      },
      ok: false,
      status: "failed"
    });
    expect(projectRepository.create).not.toHaveBeenCalled();
  });

  it("returns typed validation errors for invalid project input", async () => {
    const projectRepository = createProjectRepository();
    const brandRepository = createBrandRepository();

    const result = await createContentProjectForUser({
      brandRepository,
      input: {
        brandId: "",
        title: ""
      },
      ownerUserId: "user_local_123",
      projectRepository
    });

    expect(result).toMatchObject({
      error: {
        code: "invalid_project_input",
        fieldErrors: {
          brandId: ["Choose a brand."],
          title: ["Project title is required."]
        }
      },
      ok: false,
      status: "failed"
    });
    expect(projectRepository.create).not.toHaveBeenCalled();
  });
});

describe("listContentProjectsForUser", () => {
  it("returns projects owned by the current user", async () => {
    const projectRepository = createProjectRepository();

    const result = await listContentProjectsForUser({
      ownerUserId: "user_local_123",
      projectRepository
    });

    expect(result).toEqual({
      ok: true,
      projects: [project],
      status: "ready"
    });
    expect(projectRepository.listByOwnerUserId).toHaveBeenCalledWith("user_local_123");
  });
});

function createIdFactory(ids: string[]) {
  return () => {
    const id = ids.shift();

    if (!id) {
      throw new Error("No test IDs left.");
    }

    return id;
  };
}
