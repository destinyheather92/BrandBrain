import { describe, expect, it, vi } from "vitest";

import {
  deleteContentProjectForUser
} from "../services/content-project.service";
import type { ContentProjectRepository } from "../types/content-project";

function createProjectRepository(overrides: Partial<ContentProjectRepository> = {}): ContentProjectRepository {
  return {
    create: vi.fn(),
    deleteForOwner: vi.fn().mockResolvedValue(true),
    findByIdForOwner: vi.fn(),
    listByOwnerUserId: vi.fn(),
    updateCanvasForOwner: vi.fn(),
    ...overrides
  };
}

describe("deleteContentProjectForUser", () => {
  it("deletes a project only for the current owner", async () => {
    const projectRepository = createProjectRepository();

    const result = await deleteContentProjectForUser({
      ownerUserId: "user_local_123",
      projectId: "project_123",
      projectRepository
    });

    expect(result).toEqual({
      ok: true,
      status: "deleted"
    });
    expect(projectRepository.deleteForOwner).toHaveBeenCalledWith("project_123", "user_local_123");
  });

  it("returns not found when the project is not owned by the current user", async () => {
    const projectRepository = createProjectRepository({
      deleteForOwner: vi.fn().mockResolvedValue(false)
    });

    const result = await deleteContentProjectForUser({
      ownerUserId: "user_local_123",
      projectId: "project_other",
      projectRepository
    });

    expect(result).toEqual({
      error: {
        code: "project_not_found",
        message: "Project could not be found."
      },
      ok: false,
      status: "failed"
    });
  });
});
