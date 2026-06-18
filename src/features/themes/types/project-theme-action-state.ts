import type { ProjectTheme } from "./project-theme";

export type ProjectThemeActionState = {
  message: string | null;
  status: "idle" | "generated" | "error";
  theme: ProjectTheme | null;
};

export type ProjectThemeAction = (
  state: ProjectThemeActionState,
  formData: FormData
) => Promise<ProjectThemeActionState>;

export const initialProjectThemeActionState: ProjectThemeActionState = {
  message: null,
  status: "idle",
  theme: null
};
