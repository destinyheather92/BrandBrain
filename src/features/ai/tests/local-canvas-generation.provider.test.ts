import { describe, expect, it } from "vitest";

import type { CanvasDocument } from "@/features/canvas/types/canvas";

import { LocalCanvasGenerationProvider } from "../providers/local-canvas-generation.provider";

describe("LocalCanvasGenerationProvider", () => {
  it("generates distinct polished slide layouts with bounded editable objects", async () => {
    const document = await generateTestDocument();

    expect(document.slides).toHaveLength(3);
    expect(document.slides[0]?.elements.map((element) => element.id)).toEqual(
      expect.arrayContaining(["shape_1_accent_bar", "text_1_kicker", "text_1_headline", "text_1_body", "cta_1"])
    );
    expect(document.slides[1]?.elements.map((element) => element.id)).toEqual(
      expect.arrayContaining(["shape_2_side_panel", "text_2_stat", "text_2_headline", "text_2_body", "cta_2"])
    );
    expect(document.slides[2]?.elements.map((element) => element.id)).toEqual(
      expect.arrayContaining(["shape_3_step_1_marker", "text_3_step_1", "text_3_headline", "cta_3"])
    );
    expect(new Set(document.slides.map((slide) => slide.elements.map((element) => element.id).join("|"))).size).toBe(
      3
    );

    for (const slide of document.slides) {
      for (const element of slide.elements) {
        expect(element.x).toBeGreaterThanOrEqual(0);
        expect(element.y).toBeGreaterThanOrEqual(0);
        expect(element.x + element.width).toBeLessThanOrEqual(slide.width);
        expect(element.y + element.height).toBeLessThanOrEqual(slide.height);
      }
    }
  });

  it("honors requested content format and editable slide count", async () => {
    const document = await generateTestDocument({
      contentFormat: "story",
      slideCount: 1
    });

    expect(document).toMatchObject({
      format: "story",
      height: 1920,
      width: 1080
    });
    expect(document.slides).toHaveLength(1);
    expect(document.slides[0]).toMatchObject({
      height: 1920,
      width: 1080
    });
  });

  it("keeps generated visible copy concise enough for the preview canvas", async () => {
    const document = await generateTestDocument();

    for (const slide of document.slides) {
      for (const element of slide.elements) {
        if (element.type === "text") {
          expect(element.content.length).toBeLessThanOrEqual(180);
        }

        if (element.type === "cta") {
          expect(element.label.length).toBeLessThanOrEqual(80);
        }
      }
    }
  });

  it("keeps generated CTA labels within the canvas schema limit", async () => {
    const document = await generateTestDocument({
      preferredCtas:
        "Schedule a detailed land assessment with a senior specialist who can inspect grading drainage clearing needs brush removal access paths seasonal maintenance erosion risks site access pasture recovery storm cleanup forestry edges and long term land improvement priorities."
    });
    const cta = document.slides[0]?.elements.find((element) => element.type === "cta");

    expect(cta).toMatchObject({
      type: "cta"
    });
    expect(cta?.type === "cta" ? cta.label.length : 0).toBeLessThanOrEqual(200);
  });

  it("selects one CTA from sentence-separated brand memory examples", async () => {
    const document = await generateTestDocument({
      preferredCtas:
        "Schedule a consultation. Learn more about nervous system regulation. Explore counseling services. Download a resource. Try a grounding exercise. Follow us for mental health content."
    });
    const ctaLabels = document.slides
      .flatMap((slide) => slide.elements)
      .filter((element) => element.type === "cta")
      .map((element) => (element.type === "cta" ? element.label : ""));

    expect(new Set(ctaLabels)).toEqual(new Set(["Schedule a consultation"]));
    expect(ctaLabels[0]).not.toContain("Learn more");
    expect(ctaLabels[0]).not.toContain("Download");
  });

  it("refines vague prompts into brand-specific carousel copy instead of generic filler", async () => {
    const document = await generateTestDocument({
      projectTitle: "Land Clearing Education",
      userRequest: "Make me something about land clearing."
    });
    const visibleCopy = document.slides
      .flatMap((slide) => slide.elements)
      .map((element) => (element.type === "text" ? element.content : element.type === "cta" ? element.label : ""))
      .join(" ");

    expect(visibleCopy).toContain("Land clearing");
    expect(visibleCopy).toContain("rural homeowners");
    expect(visibleCopy).toContain("Land clearing, grading, drainage");
    expect(visibleCopy).toContain("Schedule a land assessment");
    expect(visibleCopy).not.toContain("What to handle first");
    expect(visibleCopy).not.toContain("Turn the message into action");
  });

  it("keeps counseling service drafts in a warm mental-health voice without land-management leakage", async () => {
    const document = await generateTestDocument({
      audience: "Adults navigating anxiety, burnout, and nervous system overwhelm",
      brandName: "Steady Path Counseling",
      preferredCtas: "Schedule a consultation",
      productsServices: "Individual counseling, anxiety therapy, trauma-informed care, grounding skills",
      projectTitle: "Nervous System Regulation",
      userRequest: "Make me something about nervous system regulation.",
      voice: "Warm, calm, validating, and practical"
    });
    const visibleCopy = document.slides
      .flatMap((slide) => slide.elements)
      .map((element) => (element.type === "text" ? element.content : element.type === "cta" ? element.label : ""))
      .join(" ");

    expect(visibleCopy).toContain("nervous system");
    expect(visibleCopy).toContain("anxiety therapy");
    expect(visibleCopy).toContain("Schedule a consultation");
    expect(visibleCopy).toContain("warm");
    expect(visibleCopy).not.toMatch(/land clearing|grading|drainage|rural homeowners|property managers/i);
    expect(visibleCopy).not.toMatch(/access path|water flow|equipment|usable ground|spring growth|soil texture/i);
  });

  it("uses pasted Canva build instructions for slide flow, colors, fonts, and CTA copy", async () => {
    const document = await generateTestDocument({
      userRequest: [
        "ChatGPT response:",
        "Create a Canva project/carousel and walk me through it step by step like I am a beginner.",
        "Primary color: #315B2C. Accent color: #C49A3A. Background: #F7F3E8.",
        "Fonts: Montserrat ExtraBold for headlines, Lora for body copy.",
        "Slide 1 - Hook",
        "Headline: Stop guessing what your land needs",
        "Body: Use a full-width hero photo of freshly graded land with a strong left-aligned headline.",
        "Slide 2 - Checklist",
        "Headline: Clear the access path first",
        "Body: Use three stacked checklist cards with generous spacing and gold check icons.",
        "Slide 3 - CTA",
        "Headline: Ready before spring growth?",
        "Body: Keep the bottom third open and place the CTA in the lower right.",
        "CTA: Schedule a land assessment"
      ].join("\n")
    });
    const slideOneText = document.slides[0]?.elements
      .filter((element) => element.type === "text")
      .map((element) => (element.type === "text" ? element.content : ""))
      .join(" ");
    const slideTwoText = document.slides[1]?.elements
      .filter((element) => element.type === "text")
      .map((element) => (element.type === "text" ? element.content : ""))
      .join(" ");
    const cta = document.slides[2]?.elements.find((element) => element.type === "cta");

    expect(document.slides[0]?.background.color).toBe("#F7F3E8");
    expect(slideOneText).toContain("Stop guessing what your land needs");
    expect(slideTwoText).toContain("Clear the access path first");
    expect(document.slides[0]?.elements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          color: "#315B2C",
          fontFamily: "Montserrat ExtraBold",
          type: "text"
        }),
        expect.objectContaining({
          fill: "#C49A3A",
          type: "shape"
        })
      ])
    );
    expect(cta).toMatchObject({
      backgroundColor: "#C49A3A",
      label: "Schedule a land assessment",
      textColor: "#0B0F19",
      type: "cta"
    });
  });
});

async function generateTestDocument({
  audience = "Rural homeowners and property managers",
  brandName = "Land Strong",
  contentFormat = "instagram-carousel",
  preferredCtas = "Schedule a land assessment",
  productsServices = "Land clearing, grading, drainage, storm cleanup",
  projectTitle = "Spring Land Prep",
  slideCount = 3,
  userRequest = "Create a polished carousel about why property owners should prepare land before spring growth.",
  voice = "Confident, practical, premium"
}: {
  audience?: string;
  brandName?: string;
  contentFormat?: CanvasDocument["format"];
  preferredCtas?: string;
  productsServices?: string;
  projectTitle?: string;
  slideCount?: number;
  userRequest?: string;
  voice?: string;
} = {}): Promise<CanvasDocument> {
  const provider = new LocalCanvasGenerationProvider();
  const response = await provider.generateJson({
    system: "Return valid canvas JSON.",
    temperature: 0.3,
    user: JSON.stringify({
      brand: {
        memory: {
          audience,
          preferredCtas,
          productsServices,
          voice
        },
        name: brandName
      },
      outputRules: {
        contentFormat,
        slideCount
      },
      projectTitle,
      theme: {
        palette: {
          accent: "#D97706",
          background: "#FFFFFF",
          ctaText: "#FFFFFF",
          primary: "#14532D",
          surface: "#F8FAFC",
          text: "#0B0F19"
        },
        typography: {
          body: "Inter",
          heading: "Geist"
        }
      },
      userRequest
    }),
    workflow: "canvas-generation"
  });

  return response.data as CanvasDocument;
}
