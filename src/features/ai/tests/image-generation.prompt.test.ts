import { describe, expect, it } from "vitest";

import { buildImageGenerationPrompt } from "../prompts/image-generation.prompt";

const brand = {
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

const theme = {
  imageStyle: "Crisp outdoor photography with strong natural contrast.",
  layout: {
    density: "editorial" as const,
    heroTreatment: "large-headline-left" as const,
    spacingScale: "comfortable" as const
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
    bodyWeight: "regular" as const,
    heading: "Geist",
    headingWeight: "bold" as const
  }
};

describe("buildImageGenerationPrompt", () => {
  it("builds a structured image prompt from brand memory and approved theme", () => {
    const prompt = buildImageGenerationPrompt({
      brand,
      preferredProvider: "auto",
      projectTitle: "Spring Land Prep Carousel",
      theme,
      userRequest: "Generate marketing photography of freshly graded land at sunrise."
    });

    expect(prompt).toMatchObject({
      provider: "flux",
      temperature: 0.7,
      workflow: "image-generation"
    });
    expect(prompt.prompt).toContain("Land Strong");
    expect(prompt.prompt).toContain("freshly graded land");
    expect(prompt.prompt).toContain("Crisp outdoor photography");
    expect(prompt.prompt).toContain("#14532D");
    expect(prompt.negativePrompt).toContain("off-brand");
    expect(prompt.system).toContain("Return image generation instructions");
  });

  it("honors an explicit provider override", () => {
    const prompt = buildImageGenerationPrompt({
      brand,
      preferredProvider: "ideogram",
      projectTitle: "Spring Land Prep Carousel",
      theme,
      userRequest: "Create a text-forward carousel cover graphic."
    });

    expect(prompt.provider).toBe("ideogram");
  });
});
