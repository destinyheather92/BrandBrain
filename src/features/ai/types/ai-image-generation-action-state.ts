import type { CanvasDocument } from "@/features/canvas/types/canvas";

export type AiImageGenerationActionState = {
  canvasJson: CanvasDocument | null;
  message: string | null;
  status: "error" | "generated" | "idle";
};

export type AiImageGenerationAction = (
  state: AiImageGenerationActionState,
  formData: FormData
) => Promise<AiImageGenerationActionState>;

export const initialAiImageGenerationActionState: AiImageGenerationActionState = {
  canvasJson: null,
  message: null,
  status: "idle"
};
