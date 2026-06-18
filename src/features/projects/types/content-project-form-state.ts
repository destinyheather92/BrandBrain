import type { ContentProjectCreateFormInput } from "./content-project";

export type ContentProjectFormState = {
  fieldErrors: Partial<Record<keyof ContentProjectCreateFormInput, string[]>>;
  message?: string;
  status: "idle" | "error" | "created";
};

export const initialContentProjectFormState: ContentProjectFormState = {
  fieldErrors: {},
  status: "idle"
};
