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
