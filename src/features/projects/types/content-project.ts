import type { z } from "zod";

import type {
  contentProjectCreateForUserInputSchema,
  contentProjectCreateInputSchema,
  contentProjectSchema
} from "../schemas/content-project.schema";

export type ContentProject = z.infer<typeof contentProjectSchema>;
export type ContentProjectCreateFormInput = z.input<typeof contentProjectCreateInputSchema>;
export type ContentProjectCreateInput = z.infer<typeof contentProjectCreateInputSchema>;
export type ContentProjectCreateForUserInput = z.infer<typeof contentProjectCreateForUserInputSchema>;

export type ContentProjectCreateResult =
  | {
      ok: true;
      project: ContentProject;
      status: "created";
    }
  | {
      error: {
        code:
          | "brand_not_found"
          | "invalid_project_input"
          | "invalid_project_canvas"
          | "project_repository_error"
          | "project_repository_unavailable";
        fieldErrors?: Partial<Record<keyof ContentProjectCreateFormInput, string[]>>;
        message: string;
      };
      ok: false;
      status: "failed";
    };

export type ContentProjectListResult =
  | {
      ok: true;
      projects: ContentProject[];
      status: "ready";
    }
  | {
      error: {
        code: "project_repository_error" | "project_repository_unavailable";
        message: string;
      };
      ok: false;
      status: "failed";
    };

export type ContentProjectEditorResult =
  | {
      ok: true;
      project: ContentProject;
      status: "ready";
    }
  | {
      error: {
        code: "project_not_found" | "project_repository_error" | "project_repository_unavailable";
        message: string;
      };
      ok: false;
      status: "failed";
    };

export type ContentProjectCanvasSaveResult =
  | {
      ok: true;
      project: ContentProject;
      status: "saved";
    }
  | {
      error: {
        code:
          | "invalid_project_canvas"
          | "project_not_found"
          | "project_repository_error"
          | "project_repository_unavailable";
        issues?: string[];
        message: string;
      };
      ok: false;
      status: "failed";
    };

export type ContentProjectRepository = {
  create(input: ContentProjectCreateForUserInput): Promise<ContentProject>;
  findByIdForOwner(projectId: string, ownerUserId: string): Promise<ContentProject | null>;
  listByOwnerUserId(ownerUserId: string): Promise<ContentProject[]>;
  updateCanvasForOwner(projectId: string, ownerUserId: string, canvasJson: ContentProject["canvasJson"]): Promise<ContentProject | null>;
};
