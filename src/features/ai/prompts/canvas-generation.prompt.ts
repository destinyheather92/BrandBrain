import type {
  AiGenerationBrandContext,
  AiGenerationPrompt,
  AiGenerationThemeContext
} from "../types/ai-generation";

export const CANVAS_GENERATION_PROMPT_VERSION = "1.0.0";

type BuildCanvasGenerationPromptParams = {
  brand: AiGenerationBrandContext;
  projectTitle: string;
  slideCount: number;
  theme: AiGenerationThemeContext;
  userRequest: string;
};

export function buildCanvasGenerationPrompt({
  brand,
  projectTitle,
  slideCount,
  theme,
  userRequest
}: BuildCanvasGenerationPromptParams): AiGenerationPrompt {
  return {
    system: [
      `BrandBrain canvas generation prompt v${CANVAS_GENERATION_PROMPT_VERSION}.`,
      "Return valid JSON only.",
      "Return a complete Canvas Object Model document.",
      "Never return HTML, markdown, image URLs, prose, or rendered images.",
      "Use the approved project theme exactly before creating slides.",
      "Every generated slide must contain editable canvas elements."
    ].join(" "),
    temperature: 0.3,
    user: JSON.stringify(
      {
        brand,
        outputRules: {
          maxSlides: 10,
          minSlides: 3,
          requestedSlideCountLabel: `${slideCount} slides`,
          slideCount,
          sourceOfTruth: "Canvas Object Model"
        },
        projectTitle,
        theme,
        userRequest
      },
      null,
      2
    ),
    workflow: "canvas-generation"
  };
}
