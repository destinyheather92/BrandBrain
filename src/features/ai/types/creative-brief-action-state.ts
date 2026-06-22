import type { CreativeBrief } from "./creative-brief";

export type CreativeBriefActionState = {
  brief: CreativeBrief | null;
  message: string | null;
  status: "idle" | "generated" | "error";
};

export type CreativeBriefAction = (
  state: CreativeBriefActionState,
  formData: FormData
) => Promise<CreativeBriefActionState>;

export const initialCreativeBriefActionState: CreativeBriefActionState = {
  brief: null,
  message: null,
  status: "idle"
};
