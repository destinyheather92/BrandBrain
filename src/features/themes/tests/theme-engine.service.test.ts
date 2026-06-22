import { describe, expect, it, vi } from "vitest";

import type { BrandMemoryRepository } from "@/features/brands/types/brand-memory";
import type { BrandRepository } from "@/features/brands/types/brand";
import type { CanvasDocument } from "@/features/canvas/types/canvas";
import type { ContentProjectRepository } from "@/features/projects/types/content-project";

import { applyProjectThemeToCanvas, generateProjectThemeForUser } from "../services/theme-engine.service";
import type { ProjectTheme, ProjectThemeRepository } from "../types/project-theme";

const createdAt = new Date("2026-06-18T12:00:00.000Z");

const brand = {
  createdAt,
  description: "Premium roofing company focused on storm damage inspections.",
  id: "brand_1",
  industry: "Roofing",
  name: "ABC Roofing",
  ownerUserId: "user_1",
  updatedAt: createdAt,
  websiteUrl: "https://example.com"
};

const memory = {
  audience: "Homeowners worried about leaks and insurance claims.",
  accentColor: null,
  backgroundColor: null,
  brandId: "brand_1",
  brandRules: "Sound practical, reassuring, and never gimmicky.",
  createdAt,
  id: "memory_1",
  notes: "Use storm clouds, roof details, and clear service offers.",
  preferredCtas: "Book an inspection",
  primaryColor: null,
  productsServices: "Roof inspections, storm damage repair, roof replacement",
  textColor: null,
  updatedAt: createdAt,
  voice: "Premium, calm, technical"
};

const canvasJson: CanvasDocument = {
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
      elements: [
        {
          color: "#111827",
          content: "User edited headline",
          fontFamily: "Inter",
          fontSize: 72,
          fontWeight: "bold",
          height: 160,
          id: "text_1",
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
        },
        {
          borderRadius: 24,
          fill: "#E5E7EB",
          height: 240,
          id: "shape_1",
          locked: false,
          opacity: 1,
          rotation: 0,
          shape: "rectangle",
          stroke: null,
          strokeWidth: 0,
          type: "shape",
          width: 520,
          x: 280,
          y: 420,
          zIndex: 0
        },
        {
          backgroundColor: "#111827",
          borderRadius: 18,
          fontFamily: "Inter",
          fontSize: 32,
          height: 92,
          id: "cta_1",
          label: "Schedule now",
          locked: false,
          opacity: 1,
          rotation: 0,
          textColor: "#FFFFFF",
          type: "cta",
          width: 420,
          x: 96,
          y: 860,
          zIndex: 2
        }
      ],
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
};

const project = {
  brandId: "brand_1",
  brandName: "ABC Roofing",
  canvasJson,
  createdAt,
  format: "instagram-carousel",
  id: "project_1",
  ownerUserId: "user_1",
  status: "draft",
  title: "Storm Damage Carousel",
  updatedAt: createdAt
};

const theme: ProjectTheme = {
  brandId: "brand_1",
  createdAt,
  id: "theme_1",
  imageStyle: "Crisp exterior photography with storm-ready contrast and professional lighting.",
  layout: {
    density: "editorial",
    heroTreatment: "large-headline-left",
    spacingScale: "comfortable"
  },
  name: "ABC Roofing Theme",
  ownerUserId: "user_1",
  palette: {
    accent: "#00A6FB",
    background: "#FFFFFF",
    ctaText: "#FFFFFF",
    primary: "#0F172A",
    secondary: "#E2E8F0",
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

function createRepositories() {
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
    updateCanvasForOwner: vi.fn()
  } satisfies ContentProjectRepository;

  const themeRepository = {
    findByProjectIdForOwner: vi.fn().mockResolvedValue(null),
    upsertForProject: vi.fn().mockImplementation((input) =>
      Promise.resolve({
        ...input,
        createdAt,
        updatedAt: createdAt
      })
    )
  } satisfies ProjectThemeRepository;

  return {
    brandMemoryRepository,
    brandRepository,
    projectRepository,
    themeRepository
  };
}

describe("ThemeEngineService", () => {
  it("generates and stores a project theme from brand memory before slides are generated", async () => {
    const repositories = createRepositories();

    const result = await generateProjectThemeForUser({
      ...repositories,
      idFactory: () => "theme_1",
      ownerUserId: "user_1",
      projectId: "project_1"
    });

    expect(result).toMatchObject({
      ok: true,
      status: "generated",
      theme: {
        brandId: "brand_1",
        id: "theme_1",
        name: "ABC Roofing Theme",
        ownerUserId: "user_1",
        projectId: "project_1"
      }
    });
    expect(repositories.projectRepository.findByIdForOwner).toHaveBeenCalledWith("project_1", "user_1");
    expect(repositories.brandRepository.findByIdForOwner).toHaveBeenCalledWith("brand_1", "user_1");
    expect(repositories.brandMemoryRepository.getByBrandId).toHaveBeenCalledWith("brand_1");
    expect(repositories.themeRepository.upsertForProject).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "theme_1",
        imageStyle: "Crisp exterior photography with storm-ready contrast and professional lighting.",
        layout: expect.objectContaining({
          density: "editorial",
          spacingScale: "comfortable"
        }),
        palette: expect.objectContaining({
          accent: "#00A6FB",
          background: "#FFFFFF",
          primary: "#0F172A"
        }),
        typography: expect.objectContaining({
          body: "Inter",
          heading: "Geist"
        })
      })
    );
  });

  it("does not generate a theme when the project is not owned by the user", async () => {
    const repositories = createRepositories();
    repositories.projectRepository.findByIdForOwner.mockResolvedValue(null);

    const result = await generateProjectThemeForUser({
      ...repositories,
      ownerUserId: "user_1",
      projectId: "project_missing"
    });

    expect(result).toMatchObject({
      error: {
        code: "project_not_found"
      },
      ok: false,
      status: "failed"
    });
    expect(repositories.themeRepository.upsertForProject).not.toHaveBeenCalled();
  });

  it("prioritizes explicit brand colors from memory over industry fallback colors", async () => {
    const repositories = createRepositories();

    repositories.brandRepository.findByIdForOwner.mockResolvedValue({
      ...brand,
      description: "Land Strong provides premium outdoor land management services.",
      industry: "Land management",
      name: "Land Strong"
    });
    repositories.brandMemoryRepository.getByBrandId.mockResolvedValue({
      ...memory,
      brandRules: "Use the brand colors forest green #14532D and harvest gold #D97706.",
      notes: "The design should feel grounded, strong, and premium."
    });

    const result = await generateProjectThemeForUser({
      ...repositories,
      idFactory: () => "theme_land_strong",
      ownerUserId: "user_1",
      projectId: "project_1"
    });

    expect(result).toMatchObject({
      ok: true,
      theme: {
        palette: {
          accent: "#D97706",
          primary: "#14532D",
          secondary: "#DCFCE7"
        }
      }
    });
    expect(repositories.themeRepository.upsertForProject).toHaveBeenCalledWith(
      expect.objectContaining({
        palette: expect.objectContaining({
          accent: "#D97706",
          primary: "#14532D",
          secondary: "#DCFCE7"
        })
      })
    );
  });

  it("uses scraped website palette hints when regenerating a theme for an imported brand", async () => {
    const repositories = createRepositories();
    const websiteFetcher = vi.fn().mockResolvedValue({
      finalUrl: "https://landstrong.example/",
      html: `
        <html>
          <head>
            <meta property="og:site_name" content="Land Strong" />
            <meta name="description" content="Premium land clearing and grading." />
            <style>
              :root { --primary: #315B2C; --accent: #C49A3A; --cream: #F7F3E8; }
            </style>
          </head>
        </html>
      `,
      ok: true
    });

    repositories.brandRepository.findByIdForOwner.mockResolvedValue({
      ...brand,
      description: "Premium land clearing and grading.",
      industry: "Land management",
      name: "Land Strong",
      websiteUrl: "https://landstrong.example/"
    });
    repositories.brandMemoryRepository.getByBrandId.mockResolvedValue({
      ...memory,
      brandRules: "Use the website's actual palette.",
      notes: "Do not use BrandBrain colors."
    });

    const result = await generateProjectThemeForUser({
      ...repositories,
      idFactory: () => "theme_land_strong_scraped",
      ownerUserId: "user_1",
      projectId: "project_1",
      websiteFetcher
    });

    expect(websiteFetcher).toHaveBeenCalledWith("https://landstrong.example/");
    expect(result).toMatchObject({
      ok: true,
      theme: {
        palette: {
          accent: "#C49A3A",
          primary: "#315B2C",
          secondary: "#F7F3E8"
        }
      }
    });
    expect(repositories.themeRepository.upsertForProject).toHaveBeenCalledWith(
      expect.objectContaining({
        palette: expect.not.objectContaining({
          accent: "#00E5FF",
          primary: "#0B0F19"
        })
      })
    );
  });

  it("uses a land-management fallback instead of BrandBrain colors when scrape data is unavailable", async () => {
    const repositories = createRepositories();

    repositories.brandRepository.findByIdForOwner.mockResolvedValue({
      ...brand,
      description: "Land clearing, grading, drainage, and rural property preparation.",
      industry: "Land management",
      name: "Land Strong"
    });
    repositories.brandMemoryRepository.getByBrandId.mockResolvedValue({
      ...memory,
      brandRules: "Use the website palette when available.",
      notes: "No explicit hex colors here."
    });

    const result = await generateProjectThemeForUser({
      ...repositories,
      idFactory: () => "theme_land_strong_fallback",
      ownerUserId: "user_1",
      projectId: "project_1"
    });

    expect(result).toMatchObject({
      ok: true,
      theme: {
        palette: {
          accent: "#D97706",
          primary: "#14532D"
        }
      }
    });
  });

  it("prioritizes the saved brand palette and repairs unreadable text contrast", async () => {
    const repositories = createRepositories();

    repositories.brandRepository.findByIdForOwner.mockResolvedValue({
      ...brand,
      description: "Counseling service with grounded, calm support.",
      industry: "Mental health",
      name: "Land Strong"
    });
    repositories.brandMemoryRepository.getByBrandId.mockResolvedValue({
      ...memory,
      accentColor: "#F59E0B",
      backgroundColor: "#F7F3E8",
      primaryColor: "#315B2C",
      textColor: "#F7F3E8"
    });

    const result = await generateProjectThemeForUser({
      ...repositories,
      idFactory: () => "theme_palette_readability",
      ownerUserId: "user_1",
      projectId: "project_1"
    });

    expect(result).toMatchObject({
      ok: true,
      theme: {
        palette: {
          accent: "#F59E0B",
          background: "#F7F3E8",
          ctaText: "#0B0F19",
          primary: "#315B2C",
          text: "#0B0F19"
        }
      }
    });
  });

  it("applies a theme to canvas styling while preserving user edits", () => {
    const themedDocument = applyProjectThemeToCanvas(canvasJson, theme);

    expect(themedDocument.themeId).toBe("theme_1");
    expect(themedDocument.slides[0]?.background.color).toBe("#FFFFFF");
    expect(themedDocument.slides[0]?.elements[0]).toMatchObject({
      color: "#0B0F19",
      content: "User edited headline",
      fontFamily: "Geist",
      height: 160,
      type: "text",
      width: 720,
      x: 96,
      y: 180
    });
    expect(themedDocument.slides[0]?.elements[1]).toMatchObject({
      fill: "#F8FAFC",
      id: "shape_1",
      stroke: null,
      strokeWidth: 0,
      type: "shape"
    });
    expect(themedDocument.slides[0]?.elements[2]).toMatchObject({
      backgroundColor: "#00A6FB",
      label: "Schedule now",
      textColor: "#FFFFFF",
      type: "cta"
    });
    expect(canvasJson.themeId).toBeNull();
  });
});
