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
    expect(prompt.prompt).toContain("specific, non-generic");
    expect(prompt.negativePrompt).toContain("off-brand");
    expect(prompt.system).toContain("Return image generation instructions");
  });

  it("uses active slide context and blocks unrelated domain carryover", () => {
    const prompt = buildImageGenerationPrompt({
      brand: {
        description: "Trauma-informed counseling and anxiety therapy.",
        industry: "Mental health counseling",
        memory: {
          audience: "Adults navigating anxiety and nervous system overwhelm",
          brandRules: "Use soft sage, cream, and calm supportive imagery.",
          notes: "Warm, grounded, validating.",
          preferredCtas: "Schedule a consultation",
          productsServices: "Individual counseling, anxiety therapy, grounding skills",
          voice: "Warm, calm, validating, and practical"
        },
        name: "Steady Path Counseling"
      },
      projectTitle: "Nervous System Regulation",
      slideContext: "Slide 1 headline: Your nervous system is not broken. Body: Simple grounding support for anxiety.",
      theme,
      userRequest: "Generate a brand-consistent image for this slide."
    });

    expect(prompt.prompt).toContain("Steady Path Counseling");
    expect(prompt.prompt).toContain("Active slide context: Slide 1 headline: Your nervous system is not broken");
    expect(prompt.prompt).toContain("Mental health visual guidance");
    expect(prompt.prompt).toContain("Never borrow unrelated industry imagery");
    expect(prompt.prompt).not.toContain("Land Strong");
    expect(prompt.prompt).not.toContain("land clearing");
  });

  it("routes text-heavy social graphics and carousel covers to Ideogram", () => {
    expect(
      buildImageGenerationPrompt({
        brand,
        projectTitle: "Spring Land Prep Carousel",
        theme,
        userRequest: "Create a text-forward carousel cover graphic."
      }).provider
    ).toBe("ideogram");
  });

  it("routes campaign-wide consistent brand imagery to Imagen", () => {
    expect(
      buildImageGenerationPrompt({
        brand,
        projectTitle: "Spring Land Prep Carousel",
        theme,
        userRequest: "Create consistent brand imagery for a seasonal campaign series."
      }).provider
    ).toBe("imagen");
  });

  it("routes marketing photography and product mockups to Flux", () => {
    expect(
      buildImageGenerationPrompt({
        brand,
        projectTitle: "Spring Land Prep Carousel",
        theme,
        userRequest: "Generate realistic marketing photography of a grading service truck and product mockup."
      }).provider
    ).toBe("flux");
  });
});
