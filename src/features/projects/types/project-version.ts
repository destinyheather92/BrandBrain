import type { z } from "zod";

import type {
  projectVersionCreateInputSchema,
  projectVersionSchema,
  projectVersionSourceSchema
} from "../schemas/project-version.schema";

export type ProjectVersionSource = z.infer<typeof projectVersionSourceSchema>;
export type ProjectVersion = z.infer<typeof projectVersionSchema>;
export type ProjectVersionCreateInput = z.infer<typeof projectVersionCreateInputSchema>;

export type ProjectVersionListResult =
  | {
      ok: true;
      status: "ready";
      versions: ProjectVersion[];
    }
  | {
      error: {
        code: "project_version_repository_error" | "project_version_repository_unavailable";
        message: string;
      };
      ok: false;
      status: "failed";
    };

export type ProjectVersionRepository = {
  create(input: ProjectVersionCreateInput): Promise<ProjectVersion>;
  listForProjectOwner(projectId: string, ownerUserId: string, limit: number): Promise<ProjectVersion[]>;
};
