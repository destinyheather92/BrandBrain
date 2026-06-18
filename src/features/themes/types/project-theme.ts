import type { z } from "zod";

import type { projectThemeSchema, projectThemeUpsertInputSchema } from "../schemas/project-theme.schema";

export type ProjectTheme = z.infer<typeof projectThemeSchema>;
export type ProjectThemeUpsertInput = z.infer<typeof projectThemeUpsertInputSchema>;

export type ProjectThemeGenerationResult =
  | {
      ok: true;
      status: "generated";
      theme: ProjectTheme;
    }
  | {
      error: {
        code:
          | "brand_not_found"
          | "brand_repository_error"
          | "brand_memory_repository_error"
          | "project_not_found"
          | "project_repository_error"
          | "theme_repository_error"
          | "theme_repository_unavailable";
        message: string;
      };
      ok: false;
      status: "failed";
    };

export type ProjectThemeReadResult =
  | {
      ok: true;
      status: "ready";
      theme: ProjectTheme | null;
    }
  | {
      error: {
        code: "theme_repository_error" | "theme_repository_unavailable";
        message: string;
      };
      ok: false;
      status: "failed";
    };

export type ProjectThemeRepository = {
  findByProjectIdForOwner(projectId: string, ownerUserId: string): Promise<ProjectTheme | null>;
  upsertForProject(input: ProjectThemeUpsertInput): Promise<ProjectTheme>;
};
