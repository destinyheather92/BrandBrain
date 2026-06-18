import type { CanvasDocument } from "@/features/canvas/types/canvas";

export type AiGenerationActionState = {
  canvasJson: CanvasDocument | null;
  message: string | null;
  status: "idle" | "generated" | "error";
};

export type AiGenerationAction = (
  state: AiGenerationActionState,
  formData: FormData
) => Promise<AiGenerationActionState>;

export const initialAiGenerationActionState: AiGenerationActionState = {
  canvasJson: null,
  message: null,
  status: "idle"
};
