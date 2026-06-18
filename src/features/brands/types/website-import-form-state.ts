import type { WebsiteImportInput } from "./website-import";

export type WebsiteImportFormState = {
  fieldErrors: Partial<Record<keyof WebsiteImportInput, string[]>>;
  message?: string;
  status: "idle" | "error";
};

export const initialWebsiteImportFormState: WebsiteImportFormState = {
  fieldErrors: {},
  status: "idle"
};
