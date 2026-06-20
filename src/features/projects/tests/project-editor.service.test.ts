import { describe, expect, it, vi } from "vitest";

import type { CanvasDocument } from "@/features/canvas/types/canvas";

import {
  autosaveProjectCanvasForUser,
  listProjectVersionsForUser,
  restoreProjectVersionForUser,
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

const restoredCanvasJson: CanvasDocument = {
  ...canvasJson,
  slides: [
    {
      ...canvasJson.slides[0],
      background: {
        color: "#F8FAFC",
        type: "solid"
      },
      elements: [
        {
          color: "#0B0F19",
          content: "Restored headline",
          fontFamily: "Geist",
          fontSize: 72,
          fontWeight: "bold",
          height: 180,
          id: "headline_restored",
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
        }
      ]
    }
  ],
  title: "Restored Carousel"
};

const restoredVersion: ProjectVersion = {
  canvasJson: restoredCanvasJson,
  createdAt,
  id: "version_4",
  ownerUserId: "user_local_123",
  projectId: "project_123",
  source: "version-restore",
  versionNumber: 4
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
    findForProjectOwner: vi.fn().mockResolvedValue(manualVersion),
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

describe("restoreProjectVersionForUser", () => {
  it("restores a selected version and creates a restore snapshot", async () => {
    const restoredProject = {
      ...project,
      canvasJson: restoredCanvasJson
    };
    const projectRepository = createProjectRepository({
      updateCanvasForOwner: vi.fn().mockResolvedValue(restoredProject)
    });
    const projectVersionRepository = createProjectVersionRepository({
      create: vi.fn().mockResolvedValue(restoredVersion),
      findForProjectOwner: vi.fn().mockResolvedValue({
        ...manualVersion,
        canvasJson: restoredCanvasJson
      })
    });

    const result = await restoreProjectVersionForUser({
      ownerUserId: "user_local_123",
      projectId: "project_123",
      projectRepository,
      projectVersionId: "version_3",
      projectVersionRepository
    });

    expect(result).toEqual({
      ok: true,
      project: restoredProject,
      status: "saved",
      version: restoredVersion
    });
    expect(projectVersionRepository.findForProjectOwner).toHaveBeenCalledWith(
      "version_3",
      "project_123",
      "user_local_123"
    );
    expect(projectRepository.updateCanvasForOwner).toHaveBeenCalledWith(
      "project_123",
      "user_local_123",
      restoredCanvasJson
    );
    expect(projectVersionRepository.create).toHaveBeenCalledWith({
      canvasJson: restoredCanvasJson,
      ownerUserId: "user_local_123",
      projectId: "project_123",
      source: "version-restore"
    });
  });

  it("does not restore a missing or unauthorized version", async () => {
    const projectRepository = createProjectRepository();
    const projectVersionRepository = createProjectVersionRepository({
      findForProjectOwner: vi.fn().mockResolvedValue(null)
    });

    const result = await restoreProjectVersionForUser({
      ownerUserId: "user_local_123",
      projectId: "project_123",
      projectRepository,
      projectVersionId: "version_other",
      projectVersionRepository
    });

    expect(result).toMatchObject({
      error: {
        code: "project_version_not_found"
      },
      ok: false,
      status: "failed"
    });
    expect(projectRepository.updateCanvasForOwner).not.toHaveBeenCalled();
    expect(projectVersionRepository.create).not.toHaveBeenCalled();
  });
});
