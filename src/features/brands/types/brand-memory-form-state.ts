import type { BrandMemoryUpdateFormInput } from "./brand-memory";

export type BrandMemoryFormState = {
  fieldErrors: Partial<Record<keyof BrandMemoryUpdateFormInput, string[]>>;
  message?: string;
  status: "error" | "idle" | "saved";
};

export const initialBrandMemoryFormState: BrandMemoryFormState = {
  fieldErrors: {},
  status: "idle"
};
