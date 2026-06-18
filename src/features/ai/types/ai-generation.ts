import type { BrandMemory } from "@/features/brands/types/brand-memory";
import type { CanvasDocument } from "@/features/canvas/types/canvas";
import type { ContentProject } from "@/features/projects/types/content-project";

export type AiWorkflow = "canvas-generation";

export type AiGenerationBrandContext = {
  description: string | null;
  industry: string | null;
  memory: Pick<
    BrandMemory,
    "audience" | "brandRules" | "notes" | "preferredCtas" | "productsServices" | "voice"
  > | null;
  name: string;
};

export type AiGenerationThemeContext = {
  imageStyle: string;
  layout: {
    density: "compact" | "editorial" | "spacious";
    heroTreatment: "large-headline-left" | "centered-statement" | "split-proof";
    spacingScale: "tight" | "comfortable" | "generous";
  };
  palette: {
    accent: string;
    background: string;
    ctaText: string;
    primary: string;
    secondary: string;
    surface: string;
    text: string;
  };
  typography: {
    body: string;
    bodyWeight: "regular" | "medium" | "semibold" | "bold";
    heading: string;
    headingWeight: "regular" | "medium" | "semibold" | "bold";
  };
};

export type AiGenerationPrompt = {
  system: string;
  temperature: number;
  user: string;
  workflow: AiWorkflow;
};

export type AiProviderUsage = {
  cost: number;
  tokens: number;
};

export type AiCanvasGenerationProvider = {
  generateJson(prompt: AiGenerationPrompt): Promise<{
    data: unknown;
    usage: AiProviderUsage;
  }>;
  id: string;
};

export type AiProviderRegistry = {
  getProvider(workflow: AiWorkflow): AiCanvasGenerationProvider;
};

export type GenerationCostCreateInput = {
  brandId: string;
  cost: number;
  ownerUserId: string;
  projectId: string;
  provider: string;
  tokens: number;
  workflow: AiWorkflow;
};

export type GenerationCostRepository = {
  create(input: GenerationCostCreateInput): Promise<void>;
};

export type AiGenerationResult =
  | {
      ok: true;
      project: ContentProject;
      status: "generated";
    }
  | {
      error: {
        code:
          | "ai_generation_failed"
          | "brand_not_found"
          | "invalid_ai_canvas"
          | "project_not_found"
          | "project_repository_error"
          | "theme_required";
        issues?: string[];
        message: string;
      };
      ok: false;
      status: "failed";
    };

export type CanvasMergeResult =
  | {
      document: CanvasDocument;
      ok: true;
    }
  | {
      error: string;
      ok: false;
    };
