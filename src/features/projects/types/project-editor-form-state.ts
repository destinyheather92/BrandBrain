import type { CanvasDocument } from "@/features/canvas/types/canvas";

import type { ProjectVersion } from "./project-version";

export type ProjectEditorSaveState = {
  message?: string;
  status: "idle" | "error" | "pending" | "saved";
  version?: ProjectVersion;
};

export const initialProjectEditorSaveState: ProjectEditorSaveState = {
  status: "idle"
};

export type ProjectEditorAutosaveAction = (
  state: ProjectEditorSaveState,
  formData: FormData
) => Promise<ProjectEditorSaveState>;

export type ProjectEditorRestoreState = ProjectEditorSaveState & {
  canvasJson?: CanvasDocument;
  restoredVersionId?: string;
};

export const initialProjectEditorRestoreState: ProjectEditorRestoreState = {
  status: "idle"
};

export type ProjectEditorRestoreAction = (
  state: ProjectEditorRestoreState,
  formData: FormData
) => Promise<ProjectEditorRestoreState>;
