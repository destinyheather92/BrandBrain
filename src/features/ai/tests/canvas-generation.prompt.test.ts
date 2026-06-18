import { describe, expect, it } from "vitest";

import { buildCanvasGenerationPrompt, CANVAS_GENERATION_PROMPT_VERSION } from "../prompts/canvas-generation.prompt";
import type { AiGenerationBrandContext, AiGenerationThemeContext } from "../types/ai-generation";

const brand: AiGenerationBrandContext = {
  description: "Premium outdoor land management services.",
  industry: "Land management",
  memory: {
    audience: "Rural homeowners and land owners",
    brandRules: "Use forest green #14532D and harvest gold #D97706.",
    notes: "Grounded, strong, premium.",
    preferredCtas: "Schedule a land assessment",
    productsServices: "Land clearing, grading, drainage",
    voice: "Confident and practical"
  },
  name: "Land Strong"
};

const theme: AiGenerationThemeContext = {
  imageStyle: "Crisp outdoor photography with strong natural contrast.",
  layout: {
    density: "editorial",
    heroTreatment: "large-headline-left",
    spacingScale: "comfortable"
  },
  palette: {
    accent: "#D97706",
    background: "#FFFFFF",
    ctaText: "#FFFFFF",
    primary: "#14532D",
    secondary: "#DCFCE7",
    surface: "#F8FAFC",
    text: "#0B0F19"
  },
  typography: {
    body: "Inter",
    bodyWeight: "regular",
    heading: "Geist",
    headingWeight: "bold"
  }
};

describe("buildCanvasGenerationPrompt", () => {
  it("builds a versioned JSON-only prompt from brand memory and approved theme", () => {
    const prompt = buildCanvasGenerationPrompt({
      brand,
      projectTitle: "Spring Land Prep Carousel",
      slideCount: 3,
      theme,
      userRequest: "Explain why early spring is the best time to prepare land."
    });

    expect(CANVAS_GENERATION_PROMPT_VERSION).toBe("1.0.0");
    expect(prompt.system).toContain("Return valid JSON only");
    expect(prompt.system).toContain("Canvas Object Model");
    expect(prompt.user).toContain("Land Strong");
    expect(prompt.user).toContain("forest green #14532D");
    expect(prompt.user).toContain("#D97706");
    expect(prompt.user).toContain("Spring Land Prep Carousel");
    expect(prompt.user).toContain("3 slides");
    expect(prompt.temperature).toBe(0.3);
    expect(prompt.workflow).toBe("canvas-generation");
  });
});
