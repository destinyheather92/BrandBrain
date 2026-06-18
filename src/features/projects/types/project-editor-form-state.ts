export type ProjectEditorSaveState = {
  message?: string;
  status: "idle" | "error" | "saved";
};

export const initialProjectEditorSaveState: ProjectEditorSaveState = {
  status: "idle"
};
