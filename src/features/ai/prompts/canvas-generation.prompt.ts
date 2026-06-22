import type { CanvasDocumentFormat } from "@/features/canvas/types/canvas";

import type {
  AiGenerationBrandContext,
  AiGenerationPrompt,
  AiGenerationThemeContext
} from "../types/ai-generation";
import type { CreativeBrief } from "../types/creative-brief";

export const CANVAS_GENERATION_PROMPT_VERSION = "1.3.0";

type BuildCanvasGenerationPromptParams = {
  brand: AiGenerationBrandContext;
  creativeBrief?: CreativeBrief | null;
  format?: CanvasDocumentFormat;
  projectTitle: string;
  slideCount: number;
  theme: AiGenerationThemeContext;
  userRequest: string;
};

export function buildCanvasGenerationPrompt({
  brand,
  creativeBrief = null,
  format = "instagram-carousel",
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
      "Every generated slide must contain editable canvas elements.",
      "Treat detailed ChatGPT or Canva build instructions as the primary source of truth when they are present.",
      "Extract slide flow, layout, positioning, colors, fonts, spacing, design elements, visual references, and CTA choices from those instructions.",
      "Use the visible creative brief as the strategy source before slides when provided.",
      "If the user request is vague, internally refine it into a strategic creative brief, content outline, and theme-aware design direction before producing canvas JSON.",
      "Never mirror a vague prompt as generic slide copy.",
      "Never introduce unrelated industry language, examples, services, or metaphors; current brand memory, audience, services, and voice always win over prior examples."
    ].join(" "),
    temperature: 0.3,
    user: JSON.stringify(
      {
        brand,
        outputRules: {
          contentFormat: format,
          maxSlides: 10,
          minSlides: 1,
          requestedSlideCountLabel: `${slideCount} slides`,
          slideCount,
          sourceOfTruth: "Canvas Object Model"
        },
        creativeSource: {
          creativeBrief,
          designInstructions: userRequest,
          refinementRule:
            "Use pasted instructions directly when detailed; otherwise expand the vague request into a high-quality creative brief, slide outline, layout plan, and brand-specific copy before building editable canvas JSON.",
          sourcePriority: [
            ...(creativeBrief ? ["visible creative brief"] : []),
            "pasted design instructions",
            "approved project theme",
            "brand memory",
            "project title",
            "raw user request"
          ]
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
