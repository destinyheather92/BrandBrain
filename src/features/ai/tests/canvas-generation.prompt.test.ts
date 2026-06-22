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

    expect(CANVAS_GENERATION_PROMPT_VERSION).toBe("1.2.0");
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

  it("treats pasted ChatGPT Canva instructions as the source of truth for the editable draft", () => {
    const designInstructions = [
      "ChatGPT response:",
      "Create a Canva carousel and walk me through every detail.",
      "Slide 1 - Hook: Stop guessing what your land needs.",
      "Use forest green #315B2C as the primary color and harvest gold #C49A3A as the accent.",
      "Font direction: Montserrat ExtraBold headlines and Lora body copy.",
      "Slide 2 - Checklist: Clear the access path first.",
      "Slide 3 - CTA: Schedule a land assessment."
    ].join("\n");

    const prompt = buildCanvasGenerationPrompt({
      brand,
      projectTitle: "Land Strong Canva Build",
      slideCount: 3,
      theme,
      userRequest: designInstructions
    });
    const payload = JSON.parse(prompt.user) as {
      creativeSource: {
        designInstructions: string;
        sourcePriority: string[];
      };
      userRequest: string;
    };

    expect(prompt.system).toContain("Treat detailed ChatGPT or Canva build instructions as the primary source of truth");
    expect(prompt.system).toContain("Extract slide flow, layout, positioning, colors, fonts, spacing, design elements, visual references, and CTA choices");
    expect(payload.creativeSource.designInstructions).toBe(designInstructions);
    expect(payload.creativeSource.sourcePriority[0]).toBe("pasted design instructions");
    expect(payload.userRequest).toBe(designInstructions);
  });

  it("requires vague user prompts to be internally refined before slide generation", () => {
    const prompt = buildCanvasGenerationPrompt({
      brand,
      projectTitle: "Land Strong Content",
      slideCount: 3,
      theme,
      userRequest: "Make me something about land clearing."
    });

    expect(prompt.system).toContain("If the user request is vague, internally refine it into a strategic creative brief");
    expect(prompt.system).toContain("Never mirror a vague prompt as generic slide copy");
    expect(prompt.system).toContain("Never introduce unrelated industry language, examples, services, or metaphors");
    expect(prompt.user).toContain("Make me something about land clearing.");
  });
});
