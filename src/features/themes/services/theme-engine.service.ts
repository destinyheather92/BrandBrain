import type { Brand } from "@/features/brands/types/brand";
import type { BrandMemory, BrandMemoryRepository } from "@/features/brands/types/brand-memory";
import { extractWebsiteBrandProfile } from "@/features/brands/services/website-import.service";
import type { WebsiteImportFetcher } from "@/features/brands/types/website-import";
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
  websiteFetcher?: WebsiteImportFetcher;
};

type BuildProjectThemeParams = {
  brand: Brand;
  idFactory?: () => string;
  memory: BrandMemory | null;
  ownerUserId: string;
  project: ContentProject;
  websiteDescription: string | null;
};

type GetProjectThemeForUserParams = {
  ownerUserId: string;
  projectId: string;
  themeRepository: ProjectThemeRepository;
};

type ThemePalette = ProjectThemeUpsertInput["palette"];

type ColorMention = {
  hex: string;
  index: number;
};

const namedBrandColors: Array<{ hex: string; name: string }> = [
  {
    hex: "#14532D",
    name: "forest green"
  },
  {
    hex: "#D97706",
    name: "harvest gold"
  },
  {
    hex: "#0F172A",
    name: "navy"
  },
  {
    hex: "#0B0F19",
    name: "black"
  },
  {
    hex: "#FFFFFF",
    name: "white"
  },
  {
    hex: "#334155",
    name: "slate"
  },
  {
    hex: "#64748B",
    name: "gray"
  },
  {
    hex: "#64748B",
    name: "grey"
  },
  {
    hex: "#2563EB",
    name: "blue"
  },
  {
    hex: "#00E5FF",
    name: "cyan"
  },
  {
    hex: "#0F766E",
    name: "teal"
  },
  {
    hex: "#166534",
    name: "green"
  },
  {
    hex: "#047857",
    name: "emerald"
  },
  {
    hex: "#65A30D",
    name: "lime"
  },
  {
    hex: "#D97706",
    name: "gold"
  },
  {
    hex: "#F59E0B",
    name: "yellow"
  },
  {
    hex: "#EA580C",
    name: "orange"
  },
  {
    hex: "#DC2626",
    name: "red"
  },
  {
    hex: "#7F1D1D",
    name: "burgundy"
  },
  {
    hex: "#7C3AED",
    name: "purple"
  },
  {
    hex: "#DB2777",
    name: "pink"
  }
];

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
  themeRepository,
  websiteFetcher
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
    const websiteDescription = await getWebsiteDescriptionForTheme(brand, websiteFetcher);
    const themeInput = buildProjectTheme({
      brand,
      idFactory,
      memory,
      ownerUserId,
      project,
      websiteDescription
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
  project,
  websiteDescription
}: BuildProjectThemeParams): ProjectThemeUpsertInput {
  const context = [
    brand.name,
    brand.industry,
    memory?.primaryColor,
    memory?.accentColor,
    memory?.backgroundColor,
    memory?.textColor,
    memory?.voice,
    memory?.audience,
    memory?.productsServices,
    memory?.brandRules,
    memory?.preferredCtas,
    memory?.notes,
    websiteDescription,
    brand.description
  ]
    .filter(Boolean)
    .join(" ");
  const normalizedContext = context.toLowerCase();
  const isRoofing = /roof|storm|inspection|exterior|claim/.test(normalizedContext);
  const isSolar = /solar|energy|panel|renewable/.test(normalizedContext);
  const isMentalHealth =
    /\b(counseling|counselling|therapy|therapist|mental health|anxiety|trauma|nervous system|burnout|grounding|somatic|psychotherapy|wellness)\b/.test(
      normalizedContext
    );
  const isLandManagement =
    !isMentalHealth &&
    /\b(land clearing|land management|clearing|grading|drainage|rural|acreage|brush|forestry)\b/.test(
      normalizedContext
    );
  const isTechnical = /technical|professional|premium|precise|practical/.test(normalizedContext);
  const fallbackPalette: ThemePalette = isMentalHealth
    ? {
        accent: "#C49A6C",
        background: "#FFFFFF",
        ctaText: "#0B0F19",
        primary: "#2F5D62",
        secondary: "#E8F1EF",
        surface: "#F8FAFC",
        text: "#0B0F19"
      }
    : isSolar
    ? {
        accent: "#F59E0B",
        background: "#FFFFFF",
        ctaText: "#0B0F19",
        primary: "#0B1220",
        secondary: "#DCFCE7",
        surface: "#F8FAFC",
        text: "#0B0F19"
      }
    : isLandManagement
      ? {
          accent: "#D97706",
          background: "#FFFFFF",
          ctaText: "#FFFFFF",
          primary: "#14532D",
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
          accent: "#475569",
          background: "#FFFFFF",
          ctaText: "#FFFFFF",
          primary: "#111827",
          secondary: "#E5E7EB",
          surface: "#F8FAFC",
          text: "#111827"
        };
  const palette = enforceReadablePalette(
    applySavedBrandPalette(
      applyExplicitBrandColors(fallbackPalette, extractBrandColors(context)),
      memory
    )
  );

  return projectThemeUpsertInputSchema.parse({
    brandId: brand.id,
    id: idFactory(),
    imageStyle: isMentalHealth
      ? "Calm human-centered counseling imagery with warm natural light, grounded details, quiet interiors, and supportive non-clinical composition."
      : isLandManagement
      ? "Grounded outdoor photography with cleared land, equipment paths, soil texture, and natural light."
      : isRoofing
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

async function getWebsiteDescriptionForTheme(
  brand: Brand,
  websiteFetcher: WebsiteImportFetcher | undefined
): Promise<string | null> {
  if (!websiteFetcher || !brand.websiteUrl) {
    return null;
  }

  try {
    const result = await websiteFetcher(brand.websiteUrl);

    if (!result.ok) {
      return null;
    }

    return extractWebsiteBrandProfile(result.html).description;
  } catch {
    return null;
  }
}

function extractBrandColors(context: string): string[] {
  const mentions: ColorMention[] = [];
  const namedMentions: Array<ColorMention & { end: number }> = [];
  const namedRanges: Array<{ end: number; start: number }> = [];
  const hexPattern = /#[0-9A-Fa-f]{6}\b/g;
  let hexMatch: RegExpExecArray | null;

  while ((hexMatch = hexPattern.exec(context)) !== null) {
    mentions.push({
      hex: normalizeHexColor(hexMatch[0]),
      index: hexMatch.index
    });
  }

  for (const color of [...namedBrandColors].sort((first, second) => second.name.length - first.name.length)) {
    const namePattern = new RegExp(`\\b${escapeRegExp(color.name)}\\b`, "gi");
    let nameMatch: RegExpExecArray | null;

    while ((nameMatch = namePattern.exec(context)) !== null) {
      const start = nameMatch.index;
      const end = start + nameMatch[0].length;

      if (namedRanges.some((range) => start < range.end && end > range.start)) {
        continue;
      }

      namedRanges.push({
        end,
        start
      });
      namedMentions.push({
        end,
        hex: color.hex,
        index: start
      });
    }
  }

  return [...mentions, ...namedMentions]
    .sort((first, second) => first.index - second.index)
    .reduce<string[]>((colors, mention) => {
      if (!colors.includes(mention.hex)) {
        colors.push(mention.hex);
      }

      return colors;
    }, []);
}

function applyExplicitBrandColors(fallbackPalette: ThemePalette, explicitColors: string[]): ThemePalette {
  if (explicitColors.length === 0) {
    return fallbackPalette;
  }

  const primary = explicitColors[0] ?? fallbackPalette.primary;
  const accent = explicitColors[1] ?? fallbackPalette.accent;

  return {
    ...fallbackPalette,
    accent,
    ctaText: readableTextColor(accent),
    primary,
    secondary: explicitColors[2] ?? supportingColor(primary) ?? fallbackPalette.secondary
  };
}

function applySavedBrandPalette(palette: ThemePalette, memory: BrandMemory | null): ThemePalette {
  if (!memory) {
    return palette;
  }

  return {
    ...palette,
    accent: memory.accentColor ?? palette.accent,
    background: memory.backgroundColor ?? palette.background,
    primary: memory.primaryColor ?? palette.primary,
    text: memory.textColor ?? palette.text
  };
}

function enforceReadablePalette(palette: ThemePalette): ThemePalette {
  const text = hasReadableContrast(palette.text, palette.background)
    ? palette.text
    : readableTextColor(palette.background);
  const ctaText = hasReadableContrast(palette.ctaText, palette.accent)
    ? palette.ctaText
    : readableTextColor(palette.accent);

  return {
    ...palette,
    ctaText,
    text
  };
}

function normalizeHexColor(color: string): string {
  return color.toUpperCase();
}

function supportingColor(primary: string): string | null {
  const normalized = normalizeHexColor(primary);

  if (["#14532D", "#166534", "#047857"].includes(normalized)) {
    return "#DCFCE7";
  }

  if (["#D97706", "#F59E0B", "#EA580C"].includes(normalized)) {
    return "#FEF3C7";
  }

  if (["#0F172A", "#0B0F19", "#334155"].includes(normalized)) {
    return "#E2E8F0";
  }

  if (["#2563EB", "#00E5FF", "#0F766E"].includes(normalized)) {
    return "#DBEAFE";
  }

  if (["#DC2626", "#7F1D1D"].includes(normalized)) {
    return "#FEE2E2";
  }

  if (["#7C3AED", "#DB2777"].includes(normalized)) {
    return "#F3E8FF";
  }

  return null;
}

function readableTextColor(background: string): "#0B0F19" | "#FFFFFF" {
  const blackContrast = contrastRatio("#0B0F19", background);
  const whiteContrast = contrastRatio("#FFFFFF", background);

  return blackContrast >= whiteContrast ? "#0B0F19" : "#FFFFFF";
}

function hasReadableContrast(foreground: string, background: string): boolean {
  return contrastRatio(foreground, background) >= 4.5;
}

function contrastRatio(foreground: string, background: string): number {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance(color: string): number {
  const red = parseInt(color.slice(1, 3), 16);
  const green = parseInt(color.slice(3, 5), 16);
  const blue = parseInt(color.slice(5, 7), 16);
  const [linearRed, linearGreen, linearBlue] = [red, green, blue].map((channel) => {
    const normalized = channel / 255;

    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * linearRed + 0.7152 * linearGreen + 0.0722 * linearBlue;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
