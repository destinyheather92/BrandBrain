import { describe, expect, it, vi } from "vitest";

import type { CanvasDocument } from "@/features/canvas/types/canvas";

import {
  autosaveProjectCanvasForUser,
  listProjectVersionsForUser,
  saveProjectCanvasForUser
} from "../services/project-editor.service";
import type { ContentProject, ContentProjectRepository } from "../types/content-project";
import type { ProjectVersion, ProjectVersionRepository } from "../types/project-version";

const createdAt = new Date("2026-06-20T12:00:00.000Z");

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
      elements: [],
      height: 1080,
      id: "slide_1",
      name: "Slide 1",
      order: 1,
      width: 1080
    }
  ],
  themeId: null,
  title: "Autosaved Carousel",
  unit: "px",
  width: 1080
};

const project: ContentProject = {
  brandId: "brand_123",
  brandName: "ABC Roofing",
  canvasJson,
  createdAt,
  format: "instagram-carousel",
  id: "project_123",
  ownerUserId: "user_local_123",
  status: "draft",
  title: "Autosaved Carousel",
  updatedAt: createdAt
};

const autosaveVersion: ProjectVersion = {
  canvasJson,
  createdAt,
  id: "version_2",
  ownerUserId: "user_local_123",
  projectId: "project_123",
  source: "autosave",
  versionNumber: 2
};

const manualVersion: ProjectVersion = {
  ...autosaveVersion,
  id: "version_3",
  source: "manual-save",
  versionNumber: 3
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

function createProjectVersionRepository(
  overrides: Partial<ProjectVersionRepository> = {}
): ProjectVersionRepository {
  return {
    create: vi.fn().mockResolvedValue(autosaveVersion),
    listForProjectOwner: vi.fn().mockResolvedValue([autosaveVersion]),
    ...overrides
  };
}

describe("autosaveProjectCanvasForUser", () => {
  it("updates the project canvas and creates an autosave version", async () => {
    const projectRepository = createProjectRepository();
    const projectVersionRepository = createProjectVersionRepository();

    const result = await autosaveProjectCanvasForUser({
      canvasJson: JSON.stringify(canvasJson),
      ownerUserId: "user_local_123",
      projectId: "project_123",
      projectRepository,
      projectVersionRepository
    });

    expect(result).toEqual({
      ok: true,
      project,
      status: "saved",
      version: autosaveVersion
    });
    expect(projectRepository.updateCanvasForOwner).toHaveBeenCalledWith("project_123", "user_local_123", canvasJson);
    expect(projectVersionRepository.create).toHaveBeenCalledWith({
      canvasJson,
      ownerUserId: "user_local_123",
      projectId: "project_123",
      source: "autosave"
    });
  });
});

describe("saveProjectCanvasForUser", () => {
  it("records a manual-save version when the user saves the project", async () => {
    const projectRepository = createProjectRepository();
    const projectVersionRepository = createProjectVersionRepository({
      create: vi.fn().mockResolvedValue(manualVersion)
    });

    const result = await saveProjectCanvasForUser({
      canvasJson: JSON.stringify(canvasJson),
      ownerUserId: "user_local_123",
      projectId: "project_123",
      projectRepository,
      projectVersionRepository
    });

    expect(result).toMatchObject({
      ok: true,
      status: "saved",
      version: manualVersion
    });
    expect(projectVersionRepository.create).toHaveBeenCalledWith({
      canvasJson,
      ownerUserId: "user_local_123",
      projectId: "project_123",
      source: "manual-save"
    });
  });
});

describe("listProjectVersionsForUser", () => {
  it("loads recent project versions for the current owner", async () => {
    const projectVersionRepository = createProjectVersionRepository();

    const result = await listProjectVersionsForUser({
      ownerUserId: "user_local_123",
      projectId: "project_123",
      projectVersionRepository
    });

    expect(result).toEqual({
      ok: true,
      status: "ready",
      versions: [autosaveVersion]
    });
    expect(projectVersionRepository.listForProjectOwner).toHaveBeenCalledWith("project_123", "user_local_123", 8);
  });
});
