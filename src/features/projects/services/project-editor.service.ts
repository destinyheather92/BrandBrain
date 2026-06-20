import { validateCanvasDocument } from "@/features/canvas/services/canvas-object-model.service";

import type {
  ContentProjectCanvasSaveResult,
  ContentProjectEditorResult,
  ContentProjectRepository
} from "../types/content-project";
import type {
  ProjectVersionListResult,
  ProjectVersionRepository,
  ProjectVersionSource
} from "../types/project-version";

type GetContentProjectForEditorParams = {
  ownerUserId: string;
  projectId: string;
  projectRepository: ContentProjectRepository;
};

type SaveProjectCanvasForUserParams = {
  canvasJson: string;
  ownerUserId: string;
  projectId: string;
  projectRepository: ContentProjectRepository;
  projectVersionRepository: ProjectVersionRepository;
};

type ListProjectVersionsForUserParams = {
  ownerUserId: string;
  projectId: string;
  projectVersionRepository: ProjectVersionRepository;
};

function isMissingPrismaDelegateError(error: unknown): boolean {
  return error instanceof TypeError && error.message.includes("Cannot read properties of undefined");
}

function notFoundResult(): ContentProjectEditorResult {
  return {
    error: {
      code: "project_not_found",
      message: "Project could not be found."
    },
    ok: false,
    status: "failed"
  };
}

function saveNotFoundResult(): ContentProjectCanvasSaveResult {
  return {
    error: {
      code: "project_not_found",
      message: "Project could not be found."
    },
    ok: false,
    status: "failed"
  };
}

function editorRepositoryError(error: unknown): ContentProjectEditorResult {
  if (isMissingPrismaDelegateError(error)) {
    return {
      error: {
        code: "project_repository_unavailable",
        message: "Project storage is not loaded. Restart the local server and try again."
      },
      ok: false,
      status: "failed"
    };
  }

  console.error("Project editor load failed.", error);

  return {
    error: {
      code: "project_repository_error",
      message: "Project could not be loaded."
    },
    ok: false,
    status: "failed"
  };
}

function saveRepositoryError(error: unknown): ContentProjectCanvasSaveResult {
  if (isMissingPrismaDelegateError(error)) {
    return {
      error: {
        code: "project_repository_unavailable",
        message: "Project storage is not loaded. Restart the local server and try again."
      },
      ok: false,
      status: "failed"
    };
  }

  console.error("Project editor save failed.", error);

  return {
    error: {
      code: "project_repository_error",
      message: "Project could not be saved."
    },
    ok: false,
    status: "failed"
  };
}

function versionRepositoryError(error: unknown): ProjectVersionListResult {
  if (isMissingPrismaDelegateError(error)) {
    return {
      error: {
        code: "project_version_repository_unavailable",
        message: "Version history is not loaded. Restart the local server and try again."
      },
      ok: false,
      status: "failed"
    };
  }

  console.error("Project version load failed.", error);

  return {
    error: {
      code: "project_version_repository_error",
      message: "Version history could not be loaded."
    },
    ok: false,
    status: "failed"
  };
}

export async function getContentProjectForEditor({
  ownerUserId,
  projectId,
  projectRepository
}: GetContentProjectForEditorParams): Promise<ContentProjectEditorResult> {
  try {
    const project = await projectRepository.findByIdForOwner(projectId, ownerUserId);

    if (!project) {
      return notFoundResult();
    }

    return {
      ok: true,
      project,
      status: "ready"
    };
  } catch (error) {
    return editorRepositoryError(error);
  }
}

export async function saveProjectCanvasForUser({
  canvasJson,
  ownerUserId,
  projectId,
  projectRepository,
  projectVersionRepository
}: SaveProjectCanvasForUserParams): Promise<ContentProjectCanvasSaveResult> {
  return saveProjectCanvasWithVersion({
    canvasJson,
    ownerUserId,
    projectId,
    projectRepository,
    projectVersionRepository,
    source: "manual-save"
  });
}

export async function autosaveProjectCanvasForUser({
  canvasJson,
  ownerUserId,
  projectId,
  projectRepository,
  projectVersionRepository
}: SaveProjectCanvasForUserParams): Promise<ContentProjectCanvasSaveResult> {
  return saveProjectCanvasWithVersion({
    canvasJson,
    ownerUserId,
    projectId,
    projectRepository,
    projectVersionRepository,
    source: "autosave"
  });
}

export async function listProjectVersionsForUser({
  ownerUserId,
  projectId,
  projectVersionRepository
}: ListProjectVersionsForUserParams): Promise<ProjectVersionListResult> {
  try {
    const versions = await projectVersionRepository.listForProjectOwner(projectId, ownerUserId, 8);

    return {
      ok: true,
      status: "ready",
      versions
    };
  } catch (error) {
    return versionRepositoryError(error);
  }
}

async function saveProjectCanvasWithVersion({
  canvasJson,
  ownerUserId,
  projectId,
  projectRepository,
  projectVersionRepository,
  source
}: SaveProjectCanvasForUserParams & {
  source: ProjectVersionSource;
}): Promise<ContentProjectCanvasSaveResult> {
  let parsedCanvasJson: unknown;

  try {
    parsedCanvasJson = JSON.parse(canvasJson);
  } catch {
    return {
      error: {
        code: "invalid_project_canvas",
        issues: ["Canvas JSON must be valid JSON."],
        message: "Canvas changes could not be saved."
      },
      ok: false,
      status: "failed"
    };
  }

  const validation = validateCanvasDocument(parsedCanvasJson);

  if (!validation.ok) {
    return {
      error: {
        code: "invalid_project_canvas",
        issues: validation.error.issues,
        message: "Canvas changes could not be saved."
      },
      ok: false,
      status: "failed"
    };
  }

  try {
    const project = await projectRepository.updateCanvasForOwner(projectId, ownerUserId, validation.document);

    if (!project) {
      return saveNotFoundResult();
    }

    const version = await projectVersionRepository.create({
      canvasJson: validation.document,
      ownerUserId,
      projectId,
      source
    });

    return {
      ok: true,
      project,
      status: "saved",
      version
    };
  } catch (error) {
    return saveRepositoryError(error);
  }
}
