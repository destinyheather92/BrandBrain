import { describe, expect, it } from "vitest";

import { buildImageGenerationPrompt } from "../prompts/image-generation.prompt";
import { LocalImageGenerationProvider } from "../providers/local-image-generation.provider";

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

describe("LocalImageGenerationProvider", () => {
  it("renders a brand/request-aware fallback preview without exposing provider names", async () => {
    const provider = new LocalImageGenerationProvider("flux");
    const prompt = buildImageGenerationPrompt({
      brand,
      projectTitle: "Spring Land Prep Carousel",
      theme,
      userRequest: "Generate marketing photography of freshly graded land at sunrise."
    });

    const response = await provider.generateImage(prompt);
    const decodedSvg = decodeURIComponent(response.imageUrl.replace("data:image/svg+xml,", ""));

    expect(decodedSvg).toContain("Land Strong");
    expect(decodedSvg).toContain("freshly graded land");
    expect(decodedSvg).not.toContain("FLUX");
    expect(decodedSvg).not.toContain("Generated as an editable BrandBrain image object");
  });

  it("renders a counseling-specific fallback scene instead of the generic abstract card", async () => {
    const provider = new LocalImageGenerationProvider("flux");
    const prompt = buildImageGenerationPrompt({
      brand: {
        description: "Trauma-informed counseling and anxiety therapy.",
        industry: "Mental health counseling",
        memory: {
          audience: "Adults navigating anxiety and nervous system overwhelm",
          brandRules: "Use soft sage #8FAF9C and cream #F7F1E8.",
          notes: "Warm, grounded, validating.",
          preferredCtas: "Schedule a consultation",
          productsServices: "Individual counseling, anxiety therapy, grounding skills",
          voice: "Warm, calm, validating, and practical"
        },
        name: "Steady Path Counseling"
      },
      projectTitle: "Nervous System Regulation",
      slideContext: "Slide headline: Your nervous system is not broken. Offer grounding skills and anxiety support.",
      theme: {
        ...theme,
        imageStyle: "Soft natural-light counseling office photography with calm, grounded details.",
        palette: {
          ...theme.palette,
          accent: "#8FAF9C",
          background: "#F7F1E8",
          primary: "#3F5F4A"
        }
      },
      userRequest: "Generate a brand-consistent image for this slide."
    });

    const response = await provider.generateImage(prompt);
    const decodedSvg = decodeURIComponent(response.imageUrl.replace("data:image/svg+xml,", ""));

    expect(decodedSvg).toContain("Steady Path Counseling");
    expect(decodedSvg).toContain("calm counseling space");
    expect(decodedSvg).toContain("grounding");
    expect(decodedSvg).not.toContain("Land Strong");
    expect(decodedSvg).not.toContain("brand-consistent image for this slide");
    expect(decodedSvg).not.toContain("Brand-ready generated asset preview");
    expect(decodedSvg).not.toMatch(/land clearing|grading|drainage|access path|equipment|property prep/i);
  });
});
