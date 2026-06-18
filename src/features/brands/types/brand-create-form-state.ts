import type { BrandCreateInput } from "./brand";

export type BrandCreateFormState = {
  fieldErrors: Partial<Record<keyof BrandCreateInput, string[]>>;
  message?: string;
  status: "idle" | "error";
};

export const initialBrandCreateFormState: BrandCreateFormState = {
  fieldErrors: {},
  status: "idle"
};
