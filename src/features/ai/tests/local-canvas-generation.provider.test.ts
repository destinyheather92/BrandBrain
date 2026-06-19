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
});

async function generateTestDocument({
  preferredCtas = "Schedule a land assessment"
}: {
  preferredCtas?: string;
} = {}): Promise<CanvasDocument> {
  const provider = new LocalCanvasGenerationProvider();
  const response = await provider.generateJson({
    system: "Return valid canvas JSON.",
    temperature: 0.3,
    user: JSON.stringify({
      brand: {
        memory: {
          audience: "Rural homeowners and property managers",
          preferredCtas,
          productsServices: "Land clearing, grading, drainage, storm cleanup",
          voice: "Confident, practical, premium"
        },
        name: "Land Strong"
      },
      outputRules: {
        slideCount: 3
      },
      projectTitle: "Spring Land Prep",
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
      userRequest:
        "Create a polished carousel about why property owners should prepare land before spring growth."
    }),
    workflow: "canvas-generation"
  });

  return response.data as CanvasDocument;
}
